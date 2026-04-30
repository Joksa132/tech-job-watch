import { and, isNull, lt, ne } from "drizzle-orm";
import { db } from "../lib/db";
import { jobs } from "../lib/schema";
import { slugify, type RawJob } from "./lib";
import * as helloworld from "./sources/helloworld";
import * as infostud from "./sources/infostud";
import * as joberty from "./sources/joberty";

const sources: Array<{
  name: RawJob["source"];
  scrape: () => Promise<RawJob[]>;
  dedupAcrossSources: boolean;
}> = [
  { name: "helloworld", scrape: helloworld.scrape, dedupAcrossSources: true },
  { name: "infostud", scrape: infostud.scrape, dedupAcrossSources: true },
  { name: "joberty", scrape: joberty.scrape, dedupAcrossSources: false },
];

const required = (j: RawJob) =>
  !!j.title && !!j.company && !!j.url && !!j.postedAt && !!j.sourceId;

const jobKey = (title: string, companySlug: string) =>
  `${slugify(title)}|||${companySlug}`;

async function loadExistingJobs(currentSource: string): Promise<Set<string>> {
  const rows = await db
    .select({ title: jobs.title, companySlug: jobs.companySlug })
    .from(jobs)
    .where(ne(jobs.source, currentSource));
  return new Set(rows.map((r) => jobKey(r.title, r.companySlug)));
}

async function sweep(now: Date) {
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const stale = await db
    .update(jobs)
    .set({ expiredAt: now })
    .where(and(isNull(jobs.expiredAt), lt(jobs.lastSeenAt, oneDayAgo)))
    .returning({ id: jobs.id });
  const pastExpiry = await db
    .update(jobs)
    .set({ expiredAt: now })
    .where(and(isNull(jobs.expiredAt), lt(jobs.expiresAt, now)))
    .returning({ id: jobs.id });
  console.log(
    `[sweep] expired ${stale.length} stale + ${pastExpiry.length} past expiry`,
  );
}

async function weeklyMaintenance(now: Date) {
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const deleted = await db
    .delete(jobs)
    .where(lt(jobs.expiredAt, sixMonthsAgo))
    .returning({ id: jobs.id });
  console.log(`[maintenance] deleted ${deleted.length} expired > 6 months`);
}

async function main() {
  let exitCode = 0;
  const now = new Date();

  for (const source of sources) {
    console.log(`\n[${source.name}] starting`);
    try {
      const rows = await source.scrape();
      const ok = rows.filter(required).length;
      console.log(`[${source.name}] scraped ${rows.length}, ${ok} valid`);

      if (rows.length > 0 && ok / rows.length < 0.5) {
        console.error(
          `[${source.name}] LOW QUALITY — HTML structure likely changed`,
        );
        exitCode = 1;
        continue;
      }

      const existing = source.dedupAcrossSources
        ? await loadExistingJobs(source.name)
        : new Set<string>();
      let upserted = 0;
      let skipped = 0;
      for (const r of rows) {
        if (!required(r)) continue;
        if (existing.has(jobKey(r.title, r.companySlug))) {
          skipped++;
          continue;
        }
        const id = `${r.source}:${r.sourceId}`;
        const set = {
          url: r.url,
          title: r.title,
          company: r.company,
          companySlug: r.companySlug,
          location: r.location,
          remote: r.remote,
          seniority: r.seniority,
          tags: r.tags,
          salaryMin: r.salaryMin,
          salaryMax: r.salaryMax,
          salaryCurrency: r.salaryCurrency,
          listRank: r.listRank,
          postedAt: r.postedAt,
          expiresAt: r.expiresAt,
          lastSeenAt: now,
          scrapedAt: now,
        };
        await db
          .insert(jobs)
          .values({
            id,
            source: r.source,
            sourceId: r.sourceId,
            firstSeenAt: now,
            ...set,
          })
          .onConflictDoUpdate({ target: jobs.id, set });
        upserted++;
      }
      console.log(
        `[${source.name}] upserted ${upserted}, skipped ${skipped} cross-source dupes`,
      );
    } catch (err) {
      console.error(`[${source.name}] FAILED:`, err);
      exitCode = 1;
    }
  }

  try {
    await sweep(now);
  } catch (err) {
    console.error("[sweep] FAILED:", err);
    exitCode = 1;
  }

  if (now.getDay() === 0) {
    try {
      await weeklyMaintenance(now);
    } catch (err) {
      console.error("[maintenance] FAILED:", err);
      exitCode = 1;
    }
  }

  process.exit(exitCode);
}

main();
