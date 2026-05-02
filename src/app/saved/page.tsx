import { db } from "@/lib/db";
import { jobs, savedJobs } from "@/lib/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { and, desc, eq, ilike, ne, or, sql } from "drizzle-orm";
import { SavedRow } from "@/components/saved-row";
import { FilterBar } from "@/components/filter-bar";
import { fmtDate } from "@/lib/format";

type SearchParams = {
  q?: string;
  source?: string;
  seniority?: string;
  remote?: string;
};

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const source = sp.source ?? "";
  const seniority = sp.seniority ?? "";
  const remote = sp.remote === "1";

  const conds = [
    eq(savedJobs.userId, session.user.id),
    ne(savedJobs.status, "hidden"),
  ];
  if (source) conds.push(eq(jobs.source, source));
  if (seniority === "unknown") {
    conds.push(or(eq(jobs.seniority, "unknown"), sql`${jobs.seniority} is null`)!);
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

  const rows = await db
    .select({ job: jobs, saved: savedJobs })
    .from(savedJobs)
    .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
    .where(and(...conds))
    .orderBy(desc(savedJobs.createdAt));

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
  for (const r of rows) {
    const label = headerFor(r.saved.createdAt);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.rows.push(r);
    else groups.push({ label, rows: [r] });
  }

  const appliedCount = rows.filter((r) => r.saved.status === "applied").length;
  const isFiltered = !!(q || source || seniority || remote);

  return (
    <section className="mx-auto max-w-5xl px-6 pt-12">
      <div className="border-b border-rule pb-3 flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          {rows.length} {isFiltered ? "matching" : "saved"}
        </h2>
        {appliedCount > 0 && (
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
            {appliedCount} applied
          </span>
        )}
      </div>

      <FilterBar
        q={q}
        source={source}
        seniority={seniority}
        remote={remote}
        basePath="/saved"
      />

      {rows.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-serif italic text-3xl text-muted">
            {isFiltered ? "No matches." : "Nothing saved yet."}
          </p>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.label} className="mt-8 first:mt-6">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted pb-2 border-b border-rule">
              {g.label}{" "}
              <span className="text-muted/60">· {g.rows.length}</span>
            </h3>
            <ol>
              {g.rows.map((r) => (
                <SavedRow
                  key={r.job.id}
                  jobId={r.job.id}
                  title={r.job.title}
                  company={r.job.company}
                  location={r.job.location}
                  remote={r.job.remote ?? false}
                  seniority={r.job.seniority}
                  tags={r.job.tags}
                  salaryMin={r.job.salaryMin}
                  salaryMax={r.job.salaryMax}
                  salaryCurrency={r.job.salaryCurrency}
                  url={r.job.url}
                  source={r.job.source}
                  postedAt={r.job.postedAt}
                  status={r.saved.status as "saved" | "applied"}
                  notes={r.saved.notes ?? ""}
                />
              ))}
            </ol>
          </section>
        ))
      )}
    </section>
  );
}
