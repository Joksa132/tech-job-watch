"use client";

import { useTransition } from "react";
import { saveJob, unsaveJob } from "@/app/saved/actions";

export function SaveButton({
  jobId,
  isSaved,
}: {
  jobId: string;
  isSaved: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          if (isSaved) await unsaveJob(jobId);
          else await saveJob(jobId);
        })
      }
      className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent hover:underline underline-offset-4 cursor-pointer disabled:opacity-50"
    >
      {isSaved ? "✓ Saved" : "Save"}
    </button>
  );
}
