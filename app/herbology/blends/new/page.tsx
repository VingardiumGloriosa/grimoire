'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import BlendBuilder from '@/components/BlendBuilder'
import type { Herb } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export default function NewBlendPage() {
  const supabase = createClient()
  const [herbs, setHerbs] = useState<Herb[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHerbs() {
      const { data } = await supabase
        .from('herbology_herbs')
        .select('*')
        .order('name')
      setHerbs((data as Herb[]) || [])
      setLoading(false)
    }
    fetchHerbs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <main className="max-w-content mx-auto px-6 py-10 flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
      </main>
    )
  }

  return (
    <main className="max-w-content mx-auto px-6 py-10">
      <h1 className="font-display text-4xl mb-2">New Blend</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        Combine herbs and discover their elemental harmony.
      </p>
      <BlendBuilder herbs={herbs} />
    </main>
  )
}
