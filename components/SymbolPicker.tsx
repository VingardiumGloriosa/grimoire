'use client'

import { useState, useMemo } from 'react'
import type { DreamSymbol, DreamEntrySymbol } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Plus, ChevronDown } from 'lucide-react'

interface SymbolPickerProps {
  symbols: DreamSymbol[]
  selected: DreamEntrySymbol[]
  onAdd: (sym: DreamEntrySymbol) => void
  onRemove: (name: string) => void
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

const DEFAULT_VISIBLE = 12
const EXPAND_INCREMENT = 24

export default function SymbolPicker({
  symbols,
  selected,
  onAdd,
  onRemove,
}: SymbolPickerProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('All')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customName, setCustomName] = useState('')
  const [visibleLimit, setVisibleLimit] = useState(DEFAULT_VISIBLE)

  const selectedNames = useMemo(
    () => new Set(selected.map((s) => s.symbol_name)),
    [selected]
  )

  const allMatches = useMemo(() => {
    let result = symbols.filter((s) => !selectedNames.has(s.name))

    if (category !== 'All') {
      result = result.filter(
        (s) => s.category.toLowerCase() === category.toLowerCase()
      )
    }

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter((s) => s.name.toLowerCase().includes(q))
    }

    return result
  }, [symbols, query, category, selectedNames])

  // Reset visible limit when filters change
  const visibleMatches = allMatches.slice(0, visibleLimit)
  const hasMore = allMatches.length > visibleLimit

  function handleSelectSymbol(symbol: DreamSymbol) {
    onAdd({
      symbol_id: symbol.id,
      symbol_name: symbol.name,
      is_personal: false,
    })
    setQuery('')
  }

  function handleAddCustom() {
    const trimmed = customName.trim()
    if (!trimmed || selectedNames.has(trimmed)) return
    onAdd({
      symbol_id: null,
      symbol_name: trimmed,
      is_personal: true,
    })
    setCustomName('')
    setShowCustomInput(false)
  }

  function handleCategoryChange(cat: Category) {
    setCategory(cat)
    setVisibleLimit(DEFAULT_VISIBLE)
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    setVisibleLimit(DEFAULT_VISIBLE)
  }

  function handleShowMore() {
    setVisibleLimit((prev) => prev + EXPAND_INCREMENT)
  }

  return (
    <div className="space-y-3">
      {/* Selected symbols */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((sym) => (
            <span
              key={sym.symbol_name}
              className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--color-accent-subtle)] px-2.5 py-1 font-body text-xs text-[var(--color-brown)]"
            >
              {sym.symbol_name}
              {sym.is_personal && (
                <span className="text-[var(--color-text-faint)]">(personal)</span>
              )}
              <button
                type="button"
                onClick={() => onRemove(sym.symbol_name)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-[var(--color-border)] transition-colors"
              >
                <X size={12} strokeWidth={1.5} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <Input
          type="text"
          placeholder="Search symbols..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-10 bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
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

      {/* Matching symbols */}
      {visibleMatches.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {visibleMatches.map((symbol) => (
              <button
                key={symbol.id}
                type="button"
                onClick={() => handleSelectSymbol(symbol)}
                className="rounded-sm border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 font-body text-xs text-[var(--color-text)] transition-colors hover:border-gold/60 hover:bg-[var(--color-accent-subtle)]"
              >
                {symbol.name}
              </button>
            ))}
          </div>

          {/* Result count and show more */}
          <div className="flex items-center gap-3">
            {allMatches.length > DEFAULT_VISIBLE && (
              <span className="font-body text-xs text-[var(--color-text-faint)]">
                Showing {visibleMatches.length} of {allMatches.length}
              </span>
            )}
            {hasMore && (
              <button
                type="button"
                onClick={handleShowMore}
                className="inline-flex items-center gap-1 font-body text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                <ChevronDown size={14} strokeWidth={1.5} />
                Show more
              </button>
            )}
          </div>
        </div>
      )}

      {visibleMatches.length === 0 && (query.trim() || category !== 'All') && (
        <p className="font-body text-xs text-[var(--color-text-muted)] italic">
          No matching symbols found.
        </p>
      )}

      {/* Add custom symbol */}
      {showCustomInput ? (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Custom symbol name..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddCustom()
              }
            }}
            className="flex-1 bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
          />
          <Button
            type="button"
            onClick={handleAddCustom}
            disabled={!customName.trim()}
            className="bg-forest text-parchment hover:bg-forest-deep font-body text-xs"
            size="sm"
          >
            Add
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowCustomInput(false)
              setCustomName('')
            }}
            className="font-body text-xs"
            size="sm"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustomInput(true)}
          className="inline-flex items-center gap-1.5 font-body text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} />
          Add custom symbol
        </button>
      )}
    </div>
  )
}
