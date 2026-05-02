export default function Loading() {
  return (
    <section className="mx-auto max-w-5xl px-6 pt-12">
      <div className="border-b border-rule pb-3">
        <div className="h-3 w-24 bg-foreground/8 rounded animate-pulse" />
      </div>
      <div className="py-5 flex flex-wrap gap-x-6 gap-y-4">
        {[200, 80, 100].map((w) => (
          <div key={w} className={`h-8 bg-foreground/8 rounded animate-pulse`} style={{ width: w }} />
        ))}
      </div>
      <div className="mt-6 space-y-0">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="py-7 border-b border-rule flex flex-col gap-3">
            <div className="h-7 w-2/3 bg-foreground/8 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-foreground/6 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
