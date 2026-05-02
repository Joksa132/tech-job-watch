import Link from "next/link";

const inputClass =
  "bg-transparent border-b border-rule px-1 py-1.5 text-sm focus:outline-none focus:border-accent transition-colors duration-150";

export function FilterBar({
  q,
  source,
  seniority,
  remote,
  basePath = "/",
}: {
  q: string;
  source: string;
  seniority: string;
  remote: boolean;
  basePath?: string;
}) {
  return (
    <form
      method="GET"
      action={basePath}
      className="flex flex-wrap items-end gap-x-6 gap-y-4 py-5"
    >
      <label className="flex flex-col gap-1.5 grow min-w-[200px]">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Search
        </span>
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="title, company, tag…"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Source
        </span>
        <select
          name="source"
          defaultValue={source}
          className={`${inputClass} cursor-pointer pr-4`}
        >
          <option value="">All</option>
          <option value="helloworld">helloworld</option>
          <option value="infostud">infostud</option>
          <option value="joberty">joberty</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Seniority
        </span>
        <select
          name="seniority"
          defaultValue={seniority}
          className={`${inputClass} cursor-pointer pr-4`}
        >
          <option value="">Any</option>
          <option value="junior">Junior</option>
          <option value="medior">Medior</option>
          <option value="senior">Senior</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>

      <label className="flex items-center gap-2 cursor-pointer pb-1.5">
        <input
          type="checkbox"
          name="remote"
          value="1"
          defaultChecked={remote}
          className="accent-accent cursor-pointer"
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
          Remote only
        </span>
      </label>

      <div className="flex items-center gap-4 pb-1.5">
        <button
          type="submit"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-accent hover:underline underline-offset-4 cursor-pointer"
        >
          Apply
        </button>
        <Link
          href={basePath}
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted hover:text-foreground transition-colors duration-150"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}
