interface CardSkeletonProps {
  className?: string
}

export function CardSkeleton({ className = "" }: CardSkeletonProps) {
  return (
    <div className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 animate-pulse ${className}`}>
      <div className="h-4 w-2/3 rounded bg-[var(--color-surface-raised)] mb-4" />
      <div className="h-3 w-full rounded bg-[var(--color-surface-raised)] mb-2" />
      <div className="h-3 w-4/5 rounded bg-[var(--color-surface-raised)]" />
    </div>
  )
}

interface SkeletonGridProps {
  count?: number
  columns?: string
}

export function SkeletonGrid({ count = 6, columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" }: SkeletonGridProps) {
  return (
    <div className={`grid gap-6 ${columns}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
