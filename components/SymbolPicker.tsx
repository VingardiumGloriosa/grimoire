'use client'

import { useState, useMemo } from 'react'
import type { DreamSymbol, DreamEntrySymbol } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Plus } from 'lucide-react'

interface SymbolPickerProps {
  symbols: DreamSymbol[]
  selected: DreamEntrySymbol[]
  onAdd: (sym: DreamEntrySymbol) => void
  onRemove: (name: string) => void
}

export default function SymbolPicker({
  symbols,
  selected,
  onAdd,
  onRemove,
}: SymbolPickerProps) {
  const [query, setQuery] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customName, setCustomName] = useState('')

  const selectedNames = useMemo(
    () => new Set(selected.map((s) => s.symbol_name)),
    [selected]
  )

  const matches = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return symbols
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) && !selectedNames.has(s.name)
      )
      .slice(0, 12)
  }, [symbols, query, selectedNames])

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
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {/* Matching symbols */}
      {matches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {matches.map((symbol) => (
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
      )}

      {query.trim() && matches.length === 0 && (
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
