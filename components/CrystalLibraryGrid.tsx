"use client"

import { useState, useMemo } from "react"
import type { Crystal, Element, Chakra } from "@/lib/types"
import { Input } from "@/components/ui/input"
import CrystalCard from "@/components/CrystalCard"
import { Search } from "lucide-react"

interface CrystalLibraryGridProps {
  crystals: Crystal[]
}

type ElementFilter = "all" | Element
type ChakraFilter = "all" | Chakra

const ELEMENT_FILTERS: { value: ElementFilter; label: string }[] = [
  { value: "all", label: "All Elements" },
  { value: "Fire", label: "Fire" },
  { value: "Water", label: "Water" },
  { value: "Earth", label: "Earth" },
  { value: "Air", label: "Air" },
  { value: "Spirit", label: "Spirit" },
]

const CHAKRA_FILTERS: { value: ChakraFilter; label: string }[] = [
  { value: "all", label: "All Chakras" },
  { value: "Root", label: "Root" },
  { value: "Sacral", label: "Sacral" },
  { value: "Solar Plexus", label: "Solar Plexus" },
  { value: "Heart", label: "Heart" },
  { value: "Throat", label: "Throat" },
  { value: "Third Eye", label: "Third Eye" },
  { value: "Crown", label: "Crown" },
]

export default function CrystalLibraryGrid({ crystals }: CrystalLibraryGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [elementFilter, setElementFilter] = useState<ElementFilter>("all")
  const [chakraFilter, setChakraFilter] = useState<ChakraFilter>("all")

  const filteredCrystals = useMemo(() => {
    let result = crystals

    // Element filter
    if (elementFilter !== "all") {
      result = result.filter((c) => c.element === elementFilter)
    }

    // Chakra filter
    if (chakraFilter !== "all") {
      result = result.filter(
        (c) => c.chakra === chakraFilter || c.chakras.includes(chakraFilter)
      )
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.healing_properties.some((p) => p.toLowerCase().includes(query)) ||
          c.magical_uses.some((u) => u.toLowerCase().includes(query))
      )
    }

    return result
  }, [crystals, elementFilter, chakraFilter, searchQuery])

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <Input
          type="text"
          placeholder="Search crystals by name or property..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {/* Element Filter */}
      <div className="space-y-2">
        <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
          Element
        </span>
        <div className="flex flex-wrap gap-1.5">
          {ELEMENT_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setElementFilter(f.value)}
              className={`rounded-full px-3 py-1 font-body text-xs transition-colors ${
                elementFilter === f.value
                  ? "bg-forest text-parchment"
                  : "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chakra Filter */}
      <div className="space-y-2">
        <span className="font-body text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
          Chakra
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CHAKRA_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setChakraFilter(f.value)}
              className={`rounded-full px-3 py-1 font-body text-xs transition-colors ${
                chakraFilter === f.value
                  ? "bg-forest text-parchment"
                  : "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Crystal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCrystals.map((crystal) => (
          <CrystalCard key={crystal.id} crystal={crystal} />
        ))}
      </div>

      {/* Empty State */}
      {filteredCrystals.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-body text-[var(--color-text-muted)] text-lg">
            No crystals match your search.
          </p>
        </div>
      )}
    </div>
  )
}
