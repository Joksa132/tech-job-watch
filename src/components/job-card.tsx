import { jobs } from "@/lib/schema";
import { fmtDate, fmtSalary } from "@/lib/format";

type Job = typeof jobs.$inferSelect;

export function JobCard({ job }: { job: Job }) {
  return (
    <li className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-16 gap-y-3 py-7 border-b border-rule">
      <div className="min-w-0">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-serif font-medium text-2xl md:text-3xl leading-tight hover:text-accent transition-colors duration-150 inline-block"
        >
          {job.title}
        </a>
        <p className="mt-2 text-sm md:text-base">
          <span className="font-medium">{job.company}</span>
          {job.location && (
            <>
              <span className="mx-2 text-muted">·</span>
              <span className="text-foreground/70">{job.location}</span>
            </>
          )}
          {job.remote && (
            <>
              <span className="mx-2 text-muted">·</span>
              <span className="text-accent text-sm font-mono uppercase tracking-wider">
                Remote
              </span>
            </>
          )}
        </p>
        {job.tags.length > 0 && (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            {job.tags.slice(0, 8).join("  ·  ")}
          </p>
        )}
      </div>
      <div className="md:text-right space-y-1.5 shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          {job.source}
        </p>
        <p className="font-mono text-xs text-foreground/70">
          {fmtDate(job.postedAt)}
        </p>
        <p className="font-mono text-[10px] text-muted">
          scraped {fmtDate(job.scrapedAt)}
        </p>
        {job.seniority && job.seniority !== "unknown" && (
          <p className="font-mono text-xs text-foreground/70 capitalize">
            {job.seniority}
          </p>
        )}
        {job.salaryMin != null && job.salaryMax != null && (
          <p className="font-mono text-xs text-foreground/70">
            {fmtSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </p>
        )}
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-accent hover:underline underline-offset-4"
        >
          Read →
        </a>
      </div>
    </li>
  );
}
