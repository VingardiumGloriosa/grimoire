import Link from 'next/link'
import type { DreamSymbol, DreamUserSymbol } from '@/lib/types'

interface SymbolDetailProps {
  symbol: DreamSymbol
  personalMeaning?: DreamUserSymbol | null
}

export default function SymbolDetail({
  symbol,
  personalMeaning,
}: SymbolDetailProps) {
  return (
    <div className="max-w-reading mx-auto space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-[var(--color-text)]">
          {symbol.name}
        </h1>
        <span className="inline-block rounded-sm bg-[var(--color-primary-subtle)] px-3 py-1 font-body text-xs uppercase tracking-wider text-[var(--color-primary)]">
          {symbol.category}
        </span>
      </header>

      {/* Personal meaning (highlighted) */}
      {personalMeaning && (
        <div className="border-l-2 border-[var(--color-accent)] bg-[var(--color-accent-subtle)] rounded-r-lg p-4">
          <h2 className="font-body text-sm font-semibold text-[var(--color-accent)] uppercase tracking-wider mb-2">
            Your Personal Meaning
          </h2>
          <p className="font-body text-lg italic text-[var(--color-text)] leading-relaxed">
            {personalMeaning.personal_meaning}
          </p>
        </div>
      )}

      {/* Description */}
      <section className="space-y-3">
        <div className="divider-ornament mb-2" aria-hidden="true" />
        <p className="font-body text-lg leading-relaxed text-[var(--color-text)]">
          {symbol.description}
        </p>
      </section>

      {/* Common meanings */}
      {symbol.common_meanings.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Common Meanings
          </h2>
          <ul className="space-y-2">
            {symbol.common_meanings.map((meaning, i) => (
              <li
                key={i}
                className="flex items-start gap-3 font-body text-base text-[var(--color-text)] leading-relaxed"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                {meaning}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reflection questions */}
      {symbol.questions.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Questions to Reflect On
          </h2>
          <ul className="space-y-2">
            {symbol.questions.map((question, i) => (
              <li
                key={i}
                className="font-body text-base italic text-[var(--color-text-muted)] leading-relaxed"
              >
                {question}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Related symbols */}
      {symbol.related_symbols.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-2xl text-[var(--color-text)]">
            Related Symbols
          </h2>
          <div className="flex flex-wrap gap-2">
            {symbol.related_symbols.map((related) => (
              <Link
                key={related}
                href={`/dreams/symbols?q=${encodeURIComponent(related)}`}
                className="rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 font-body text-sm text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-accent-subtle)]"
              >
                {related}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
