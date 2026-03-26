"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase"
import type { Crystal, CrystalIntention } from "@/lib/types"
import IntentionPicker from "@/components/IntentionPicker"
import RitualPairingResult from "@/components/RitualPairingResult"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function RitualPairingPage() {
  const supabase = createClient()

  const [intentions, setIntentions] = useState<CrystalIntention[]>([])
  const [selectedIntention, setSelectedIntention] = useState<CrystalIntention | null>(null)
  const [stones, setStones] = useState<Crystal[]>([])
  const [collectionIds, setCollectionIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStones, setLoadingStones] = useState(false)
  const resultsRef = useRef<HTMLElement>(null)

  // Fetch intentions on mount
  useEffect(() => {
    async function fetchIntentions() {
      const { data } = await supabase
        .from("crystals_intentions")
        .select("*")
        .order("name")

      setIntentions((data as CrystalIntention[]) || [])
      setLoading(false)
    }
    fetchIntentions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch user's collection if authenticated
  useEffect(() => {
    async function fetchCollection() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const res = await fetch("/api/crystals/collection")
      if (res.ok) {
        const data = await res.json()
        const ids = data.map((entry: { stone_id: string }) => entry.stone_id)
        setCollectionIds(ids)
      }
    }
    fetchCollection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSelectIntention(intention: CrystalIntention) {
    setSelectedIntention(intention)
    setLoadingStones(true)

    if (intention.stone_ids.length === 0) {
      setStones([])
      setLoadingStones(false)
      return
    }

    const { data } = await supabase
      .from("crystals_stones")
      .select("*")
      .in("id", intention.stone_ids)
      .order("name")

    setStones((data as Crystal[]) || [])
    setLoadingStones(false)
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  if (loading) {
    return (
      <main className="max-w-content mx-auto px-6 py-10 flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
      </main>
    )
  }

  return (
    <main className="max-w-content mx-auto px-6 py-10">
      <h1 className="font-display text-2xl sm:text-4xl mb-2">Crystals</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-4">
        Stones, their properties, and healing correspondences.
      </p>
      <nav className="flex gap-4 mb-8 font-body text-sm">
        <Link href="/crystals" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          Stone Library
        </Link>
        <Link href="/crystals/collection" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          My Collection
        </Link>
        <span className="text-forest font-medium border-b border-gold pb-1">Ritual Pairing</span>
      </nav>

      <h2 className="font-display text-2xl mb-2">Ritual Pairing</h2>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        Choose an intention and discover which stones support it.
      </p>

      {/* Intention Picker */}
      <section className="mb-10">
        <h2 className="font-display text-2xl text-[var(--color-text)] mb-4">
          Choose Your Intention
        </h2>
        <IntentionPicker intentions={intentions} onSelect={handleSelectIntention} />
      </section>

      {/* Results */}
      {selectedIntention && (
        <section ref={resultsRef}>
          <div className="divider-ornament mb-6" aria-hidden="true" />
          <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">
            Stones for {selectedIntention.name}
          </h2>
          <p className="font-body text-[var(--color-text-muted)] mb-6">
            {selectedIntention.description}
          </p>

          {loadingStones ? (
            <div className="py-12 flex justify-center">
              <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
            </div>
          ) : (
            <RitualPairingResult stones={stones} collectionIds={collectionIds} />
          )}
        </section>
      )}
    </main>
  )
}
