import { db } from "@/lib/db";
import { jobs, savedJobs } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { SavedRow } from "@/components/saved-row";

export default async function SavedPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const rows = await db
    .select({ job: jobs, saved: savedJobs })
    .from(savedJobs)
    .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
    .where(eq(savedJobs.userId, session.user.id))
    .orderBy(desc(savedJobs.createdAt));

  return (
    <section className="mx-auto max-w-5xl px-6 pt-12">
      <div className="border-b border-rule pb-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          {rows.length} saved
        </h2>
      </div>

      {rows.length === 0 ? (
        <div className="py-32 text-center">
          <p className="font-serif italic text-3xl text-muted">
            Nothing saved yet.
          </p>
        </div>
      ) : (
        <ol>
          {rows.map((r) => (
            <SavedRow
              key={r.job.id}
              jobId={r.job.id}
              title={r.job.title}
              company={r.job.company}
              location={r.job.location}
              url={r.job.url}
              source={r.job.source}
              postedAt={r.job.postedAt}
              status={r.saved.status as "saved" | "applied"}
              notes={r.saved.notes ?? ""}
            />
          ))}
        </ol>
      )}
    </section>
  );
}
