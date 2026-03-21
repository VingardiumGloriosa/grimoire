"use client"

interface NumberCardProps {
  number: number
  title: string
  category: string
  keywords: string[]
}

export default function NumberCard({ number, title, category, keywords }: NumberCardProps) {
  return (
    <div className="surface-gradient hover-glow border border-[var(--color-border)] rounded-lg p-6 text-center space-y-3 transition-all duration-200">
      {/* Category label */}
      <p className="font-body text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
        {category}
      </p>

      {/* The number */}
      <p className="font-display text-5xl text-[var(--color-accent)]">
        {number}
      </p>

      {/* Title */}
      <h3 className="font-display text-lg text-[var(--color-text)]">
        {title}
      </h3>

      {/* Keywords as chips */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full bg-[var(--color-accent-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-muted)]"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
