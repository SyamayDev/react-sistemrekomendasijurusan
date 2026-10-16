/** Route-level loading state that mirrors a typical page so nothing jumps. */
export function PageSkeleton() {
  return (
    <div className="container-x pt-[calc(var(--header-h)+3rem)] pb-24" role="status" aria-live="polite">
      <span className="sr-only">Memuat halaman…</span>
      <div className="skeleton mb-4 h-5 w-32" />
      <div className="skeleton mb-3 h-12 w-full max-w-xl" />
      <div className="skeleton mb-10 h-5 w-full max-w-md" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-44" style={{ animationDelay: `${i * 90}ms` }} />
        ))}
      </div>
    </div>
  );
}
