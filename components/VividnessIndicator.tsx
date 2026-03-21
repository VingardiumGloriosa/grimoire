interface VividnessIndicatorProps {
  level: number
}

export default function VividnessIndicator({ level }: VividnessIndicatorProps) {
  const clamped = Math.max(1, Math.min(5, Math.round(level)))

  return (
    <div className="inline-flex items-center gap-1" aria-label={`Vividness: ${clamped} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`inline-block h-2 w-2 rounded-full transition-colors ${
            i < clamped
              ? "bg-[var(--color-accent)]"
              : "bg-[var(--color-border)]"
          }`}
        />
      ))}
    </div>
  )
}
