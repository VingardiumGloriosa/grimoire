"use client"

import { useState, useMemo } from "react"
import type { Herb, Element, Planet } from "@/lib/types"
import { Input } from "@/components/ui/input"
import HerbCard from "@/components/HerbCard"
import { Search } from "lucide-react"

interface HerbLibraryGridProps {
  herbs: Herb[]
}

type ElementFilter = "all" | Element
type PlanetFilter = "all" | Planet

const ELEMENT_FILTERS: { value: ElementFilter; label: string }[] = [
  { value: "all", label: "All Elements" },
  { value: "Fire", label: "Fire" },
  { value: "Water", label: "Water" },
  { value: "Earth", label: "Earth" },
  { value: "Air", label: "Air" },
]

const PLANET_FILTERS: { value: PlanetFilter; label: string }[] = [
  { value: "all", label: "All Planets" },
  { value: "Sun", label: "Sun" },
  { value: "Moon", label: "Moon" },
  { value: "Mercury", label: "Mercury" },
  { value: "Venus", label: "Venus" },
  { value: "Mars", label: "Mars" },
  { value: "Jupiter", label: "Jupiter" },
  { value: "Saturn", label: "Saturn" },
]

export default function HerbLibraryGrid({ herbs }: HerbLibraryGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [elementFilter, setElementFilter] = useState<ElementFilter>("all")
  const [planetFilter, setPlanetFilter] = useState<PlanetFilter>("all")

  const filteredHerbs = useMemo(() => {
    let result = herbs

    // Element filter
    if (elementFilter !== "all") {
      result = result.filter((h) => h.element === elementFilter)
    }

    // Planet filter
    if (planetFilter !== "all") {
      result = result.filter((h) => h.planetary_ruler === planetFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.latin_name.toLowerCase().includes(query)
      )
    }

    return result
  }, [herbs, elementFilter, planetFilter, searchQuery])

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
          placeholder="Search herbs by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      {/* Element Filters */}
      <div className="space-y-3">
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

        {/* Planet Filters */}
        <div className="flex flex-wrap gap-1.5">
          {PLANET_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setPlanetFilter(f.value)}
              className={`rounded-full px-3 py-1 font-body text-xs transition-colors ${
                planetFilter === f.value
                  ? "bg-forest text-parchment"
                  : "bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Herb Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredHerbs.map((herb) => (
          <HerbCard key={herb.id} herb={herb} />
        ))}
      </div>

      {/* Empty State */}
      {filteredHerbs.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-body text-[var(--color-text-muted)] text-lg">
            No herbs match your search.
          </p>
        </div>
      )}
    </div>
  )
}
