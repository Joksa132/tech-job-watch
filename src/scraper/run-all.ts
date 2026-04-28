import { db } from "../lib/db";
import { jobs } from "../lib/schema";
import type { RawJob } from "./lib";
import * as helloworld from "./sources/helloworld";

const sources: Array<{
  name: RawJob["source"];
  scrape: () => Promise<RawJob[]>;
}> = [{ name: "helloworld", scrape: helloworld.scrape }];

const required = (j: RawJob) =>
  !!j.title && !!j.company && !!j.url && !!j.postedAt && !!j.sourceId;

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

      for (const r of rows) {
        if (!required(r)) continue;
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
          description: r.description,
          rawHtml: r.rawHtml,
          salaryMin: r.salaryMin,
          salaryMax: r.salaryMax,
          salaryCurrency: r.salaryCurrency,
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
      }
      console.log(`[${source.name}] upserted ${ok} jobs`);
    } catch (err) {
      console.error(`[${source.name}] FAILED:`, err);
      exitCode = 1;
    }
  }

  process.exit(exitCode);
}

main();
