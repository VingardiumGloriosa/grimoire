'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import type { DreamSymbol } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import EmptyState from '@/components/EmptyState'
import { Search } from 'lucide-react'

interface SymbolLibraryProps {
  symbols: DreamSymbol[]
}

const CATEGORIES = [
  'All',
  'Nature',
  'Animals',
  'Body',
  'Objects',
  'Actions',
  'People',
  'Places',
] as const

type Category = (typeof CATEGORIES)[number]

export default function SymbolLibrary({ symbols }: SymbolLibraryProps) {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState<Category>('All')

  const filtered = useMemo(() => {
    let result = symbols

    if (category !== 'All') {
      result = result.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
    }

    return result
  }, [symbols, query, category])

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <Input
          type="text"
          placeholder="Search symbols..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3 py-1 font-body text-xs transition-colors ${
              category === cat
                ? 'bg-[var(--color-primary)] text-[var(--color-bg)]'
                : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Symbol grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((symbol) => (
            <Link key={symbol.id} href={`/dreams/symbols/${symbol.id}`}>
              <Card className="group surface-gradient hover-glow border border-[var(--color-border)] rounded-lg transition-all duration-200 hover:border-[var(--color-accent)]/60 hover:-translate-y-0.5 cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-body text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                        {symbol.name}
                      </h3>
                      <span className="shrink-0 rounded-sm bg-[var(--color-primary-subtle)] px-2 py-0.5 font-body text-xs uppercase tracking-wider text-[var(--color-primary)]">
                        {symbol.category}
                      </span>
                    </div>
                    <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-3">
                      {symbol.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={Search} message="No symbols match your search" />
      )}
    </div>
  )
}
