import { db } from "@/lib/db";
import { jobs } from "@/lib/schema";
import { isNull, asc, sql } from "drizzle-orm";
import { JobCard } from "@/components/job-card";

export default async function Home() {
  const rows = await db
    .select()
    .from(jobs)
    .where(isNull(jobs.expiredAt))
    .orderBy(sql`${jobs.listRank} asc nulls last`, asc(jobs.id))
    .limit(200);

  return (
    <section className="mx-auto max-w-5xl px-6 pt-12">
      <div className="border-b border-rule pb-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          {rows.length} active
        </h2>
      </div>

      {rows.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-serif italic text-3xl text-muted">
            No listings today.
          </p>
        </div>
      ) : (
        <ol>
          {rows.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </ol>
      )}
    </section>
  );
}
