"use client";

import { useTransition } from "react";
import { hideJob, unhideJob } from "@/app/hidden/actions";

export function HideButton({
  jobId,
  isHidden,
}: {
  jobId: string;
  isHidden: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (isHidden) await unhideJob(jobId);
          else await hideJob(jobId);
        })
      }
      className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted hover:text-foreground hover:underline underline-offset-4 cursor-pointer disabled:opacity-50"
    >
      {isHidden ? "Unhide" : "Hide"}
    </button>
  );
}
