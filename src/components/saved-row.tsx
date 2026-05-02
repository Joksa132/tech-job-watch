"use client";

import { useState, useTransition } from "react";
import { setStatus, setNotes, unsaveJob } from "@/app/saved/actions";
import { fmtDate } from "@/lib/format";

export function SavedRow({
  jobId,
  title,
  company,
  location,
  remote,
  seniority,
  tags,
  salaryMin,
  salaryMax,
  salaryCurrency,
  url,
  source,
  postedAt,
  status: initialStatus,
  notes: initialNotes,
}: {
  jobId: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  seniority: string | null;
  tags: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  url: string;
  source: string;
  postedAt: Date;
  status: "saved" | "applied";
  notes: string;
}) {
  const [status, setLocalStatus] = useState(initialStatus);
  const [notes, setLocalNotes] = useState(initialNotes);
  const [pending, startTransition] = useTransition();

  return (
    <li
      className={`grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-12 gap-y-3 py-7 pl-3 pr-2 -mx-2 border-b border-rule border-l-2 transition-colors duration-150 hover:bg-foreground/2.5 ${
        status === "applied" ? "border-l-accent" : "border-l-transparent"
      }`}
    >
      <div className="min-w-0 space-y-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-serif font-medium text-2xl md:text-3xl leading-tight hover:text-accent transition-colors duration-150 inline-block"
        >
          {title}
        </a>
        <p className="text-sm md:text-base">
          <span className="font-medium">{company}</span>
          {location && (
            <>
              <span className="mx-2 text-muted">·</span>
              <span className="text-foreground/70">{location}</span>
            </>
          )}
          {remote && (
            <>
              <span className="mx-2 text-muted">·</span>
              <span className="text-accent text-sm font-mono uppercase tracking-wider">Remote</span>
            </>
          )}
          <span className="mx-2 text-muted">·</span>
          <span className="text-foreground/70 capitalize">
            {seniority && seniority !== "unknown" ? seniority : "Unknown"}
          </span>
        </p>
        {tags.length > 0 && (
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            {tags.slice(0, 8).join("  ·  ")}
          </p>
        )}
        <textarea
          value={notes}
          placeholder="Notes…"
          onChange={(e) => setLocalNotes(e.target.value)}
          onBlur={() => startTransition(async () => { await setNotes(jobId, notes); })}
          rows={2}
          className="w-full max-w-xl font-mono text-xs p-2 bg-transparent border border-rule focus:border-foreground focus:outline-none resize-none"
        />
      </div>
      <div className="md:text-right space-y-2 shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          [{source}] · {fmtDate(postedAt)}
        </p>
        {salaryMin != null && salaryMax != null && (
          <p className="font-mono text-xs text-foreground/70">
            {Math.round(salaryMin / 1000)}k–{Math.round(salaryMax / 1000)}k {salaryCurrency ?? ""}
          </p>
        )}
        <select
          value={status}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as "saved" | "applied";
            setLocalStatus(next);
            startTransition(async () => { await setStatus(jobId, next); });
          }}
          className="font-mono text-[11px] uppercase tracking-[0.25em] border border-rule bg-transparent px-2 py-1 cursor-pointer hover:border-foreground transition-colors disabled:opacity-50"
        >
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
        </select>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => { await unsaveJob(jobId); })}
          className="block md:ml-auto font-mono text-[10px] uppercase tracking-[0.25em] text-accent hover:underline underline-offset-4 cursor-pointer disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </li>
  );
}
