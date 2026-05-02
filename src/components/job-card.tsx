import { jobs } from "@/lib/schema";
import { fmtDate } from "@/lib/format";
import { SaveButton } from "./save-button";
import { HideButton } from "./hide-button";

type Job = typeof jobs.$inferSelect;

export function JobCard({
  job,
  signedIn,
  isSaved,
  isHidden,
}: {
  job: Job;
  signedIn: boolean;
  isSaved: boolean;
  isHidden: boolean;
}) {
  const dateLabel = job.expiresAt ? `expires ${fmtDate(job.expiresAt)}` : null;

  return (
    <li
      className={`grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-16 gap-y-3 py-7 pl-3 pr-2 -mx-2 border-b border-b-rule border-l-2 transition-colors duration-150 hover:bg-foreground/2.5 ${
        isSaved ? "border-l-accent" : "border-l-transparent"
      }`}
    >
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
          <span className="mx-2 text-muted">·</span>
          <span className="text-foreground/70 capitalize">
            {job.seniority && job.seniority !== "unknown"
              ? job.seniority
              : "Unknown"}
          </span>
        </p>
        {job.tags.length > 0 && (
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            {job.tags.slice(0, 8).join("  ·  ")}
          </p>
        )}
      </div>
      <div className="md:text-right space-y-1.5 shrink-0">
        <p
          className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted"
          title={`first scraped ${fmtDate(job.firstSeenAt)}`}
        >
          [{job.source}]
          {dateLabel && <> · {dateLabel}</>}
        </p>
        {job.salaryMin != null && job.salaryMax != null && (
          <p className="font-mono text-xs text-foreground/70">
            {Math.round(job.salaryMin / 1000)}k–
            {Math.round(job.salaryMax / 1000)}k {job.salaryCurrency ?? ""}
          </p>
        )}
        <div className="mt-2 flex md:justify-end items-center gap-4">
          {signedIn && !isHidden && (
            <SaveButton jobId={job.id} isSaved={isSaved} />
          )}
          {signedIn && <HideButton jobId={job.id} isHidden={isHidden} />}
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent hover:underline underline-offset-4"
          >
            Read ↗
          </a>
        </div>
      </div>
    </li>
  );
}
