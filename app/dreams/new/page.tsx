'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { DreamSymbol, DreamEntrySymbol } from '@/lib/types'
import DreamEntryForm from '@/components/DreamEntryForm'
import { Loader2 } from 'lucide-react'

export default function NewDreamPage() {
  const router = useRouter()
  const supabase = createClient()

  const [symbols, setSymbols] = useState<DreamSymbol[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSymbols() {
      const { data } = await supabase
        .from('dream_symbols')
        .select('*')
        .order('name')
      setSymbols((data as DreamSymbol[]) || [])
      setLoading(false)
    }
    fetchSymbols()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(data: {
    date: string
    title: string
    content: string
    mood: string | null
    vividness: number
    lucid: boolean
    recurring: boolean
    symbols: DreamEntrySymbol[]
    tags: string[]
  }) {
    const res = await fetch('/api/dreams/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error('Failed to save dream entry')
    }

    router.push('/dreams')
  }

  if (loading) {
    return (
      <main className="max-w-reading mx-auto px-6 py-10 flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
      </main>
    )
  }

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <h1 className="font-display text-4xl mb-2">Record a Dream</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        Capture what lingers before it fades.
      </p>
      <DreamEntryForm symbols={symbols} onSubmit={handleSubmit} />
    </main>
  )
}
