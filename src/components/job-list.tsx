import { db } from "@/lib/db";
import { jobs, savedJobs } from "@/lib/schema";
import {
  and,
  asc,
  eq,
  ilike,
  inArray,
  isNull,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { JobCard } from "@/components/job-card";
import { FilterBar } from "@/components/filter-bar";
import { Pagination } from "@/components/pagination";
import { fmtDate } from "@/lib/format";

const PAGE_SIZE = 50;

export type JobListSearchParams = {
  q?: string;
  source?: string;
  seniority?: string;
  remote?: string;
  page?: string;
};

export async function JobList({
  searchParams,
  showHidden,
}: {
  searchParams: Promise<JobListSearchParams>;
  showHidden: boolean;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const source = sp.source ?? "";
  const seniority = sp.seniority ?? "";
  const remote = sp.remote === "1";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const session = await getSession();
  const basePath = showHidden ? "/hidden" : "/";

  const conds = [isNull(jobs.expiredAt)];
  if (source) conds.push(eq(jobs.source, source));
  if (seniority === "unknown") {
    conds.push(or(isNull(jobs.seniority), eq(jobs.seniority, "unknown"))!);
  } else if (seniority) {
    conds.push(eq(jobs.seniority, seniority));
  }
  if (remote) conds.push(eq(jobs.remote, true));
  if (q) {
    const pattern = `%${q}%`;
    conds.push(
      or(
        ilike(jobs.title, pattern),
        ilike(jobs.company, pattern),
        sql`${jobs.tags}::text ILIKE ${pattern}`,
      )!,
    );
  }
  if (session) {
    const hiddenSubq = db
      .select({ id: savedJobs.jobId })
      .from(savedJobs)
      .where(
        and(
          eq(savedJobs.userId, session.user.id),
          eq(savedJobs.status, "hidden"),
        ),
      );
    conds.push(
      showHidden
        ? inArray(jobs.id, hiddenSubq)
        : notInArray(jobs.id, hiddenSubq),
    );
  }
  const where = and(...conds);

  const [[{ count }], hiddenCountRow] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobs)
      .where(where),
    session && !showHidden
      ? db
          .select({ count: sql<number>`count(*)::int` })
          .from(savedJobs)
          .where(
            and(
              eq(savedJobs.userId, session.user.id),
              eq(savedJobs.status, "hidden"),
            ),
          )
      : Promise.resolve([{ count: 0 }]),
  ]);
  const hiddenCount = hiddenCountRow[0].count;

  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);

  const rows = await db
    .select()
    .from(jobs)
    .where(where)
    .orderBy(
      sql`date_trunc('day', ${jobs.firstSeenAt}) desc`,
      sql`${jobs.listRank} asc nulls last`,
      asc(jobs.id),
    )
    .limit(PAGE_SIZE)
    .offset((safePage - 1) * PAGE_SIZE);

  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86_400_000).toDateString();
  const headerFor = (d: Date) => {
    const s = d.toDateString();
    if (s === today) return "Today";
    if (s === yesterday) return "Yesterday";
    return fmtDate(d);
  };

  const groups: Array<{ label: string; rows: typeof rows }> = [];
  for (const j of rows) {
    const label = headerFor(j.firstSeenAt);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.rows.push(j);
    else groups.push({ label, rows: [j] });
  }

  const savedIds =
    session && rows.length > 0 && !showHidden
      ? new Set(
          (
            await db
              .select({ jobId: savedJobs.jobId })
              .from(savedJobs)
              .where(
                and(
                  eq(savedJobs.userId, session.user.id),
                  eq(savedJobs.status, "saved"),
                  inArray(
                    savedJobs.jobId,
                    rows.map((r) => r.id),
                  ),
                ),
              )
          ).map((r) => r.jobId),
        )
      : new Set<string>();

  const isFiltered = !!(q || source || seniority || remote);
  const headerLabel = showHidden
    ? "hidden"
    : isFiltered
      ? "matching"
      : "active";

  return (
    <section className="mx-auto max-w-5xl px-6 pt-12">
      <div className="border-b border-rule pb-3 flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          {count} {headerLabel}
        </h2>
        {showHidden ? (
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted hover:text-accent transition-colors duration-150"
          >
            ← Back to active
          </Link>
        ) : (
          session &&
          hiddenCount > 0 && (
            <Link
              href="/hidden"
              className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted hover:text-accent transition-colors duration-150"
            >
              Show hidden ({hiddenCount})
            </Link>
          )
        )}
      </div>

      <FilterBar
        q={q}
        source={source}
        seniority={seniority}
        remote={remote}
        basePath={basePath}
      />

      {rows.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-serif italic text-3xl text-muted">
            {showHidden
              ? "Nothing hidden."
              : isFiltered
                ? "No matches."
                : "No listings today."}
          </p>
        </div>
      ) : (
        <>
          {groups.map((g) => (
            <section key={g.label} className="mt-8 first:mt-6">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted pb-2 border-b border-rule">
                {g.label}{" "}
                <span className="text-muted/60">· {g.rows.length}</span>
              </h3>
              <ol>
                {g.rows.map((j) => (
                  <JobCard
                    key={j.id}
                    job={j}
                    signedIn={!!session}
                    isSaved={savedIds.has(j.id)}
                    isHidden={showHidden}
                  />
                ))}
              </ol>
            </section>
          ))}
          <Pagination
            page={safePage}
            pageCount={pageCount}
            basePath={basePath}
            searchParams={{
              q,
              source,
              seniority,
              remote: remote ? "1" : undefined,
            }}
          />
        </>
      )}
    </section>
  );
}
