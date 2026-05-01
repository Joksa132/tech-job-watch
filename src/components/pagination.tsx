import Link from "next/link";

export function Pagination({
  page,
  pageCount,
  searchParams,
}: {
  page: number;
  pageCount: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v) usp.set(k, v);
    if (p > 1) usp.set("page", String(p));
    return usp.toString() ? `/?${usp}` : "/";
  };

  const link =
    "font-mono text-[11px] uppercase tracking-[0.25em] hover:text-accent transition-colors duration-150";
  const dim = "font-mono text-[11px] uppercase tracking-[0.25em] text-muted/40";

  return (
    <nav className="flex items-center justify-between py-8 border-t border-rule mt-2">
      {page > 1 ? (
        <Link href={href(page - 1)} className={link}>← Previous</Link>
      ) : (
        <span className={dim}>← Previous</span>
      )}
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={href(page + 1)} className={link}>Next →</Link>
      ) : (
        <span className={dim}>Next →</span>
      )}
    </nav>
  );
}
