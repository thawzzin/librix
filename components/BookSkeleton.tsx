export default function BookSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden" style={{background:'var(--bg-card)', border:'1px solid var(--border-subtle)'}}>
          <div className="skeleton" style={{paddingBottom:'140%'}} />
          <div className="p-3 space-y-2">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
