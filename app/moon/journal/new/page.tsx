'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MoonJournalEntry from '@/components/MoonJournalEntry'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewMoonJournalPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(data: {
    date: string
    title: string
    content: string
    mood: string | null
    tags: string[]
  }) {
    setSubmitting(true)
    try {
      const res = await fetch('/api/moon/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save entry')
      }

      router.push('/moon/journal')
    } catch {
      // Silently handle; user can retry
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <Link
        href="/moon/journal"
        className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-6"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to journal
      </Link>

      <h1 className="font-display text-4xl text-[var(--color-text)] mb-8">
        New Entry
      </h1>

      <MoonJournalEntry onSubmit={handleSubmit} submitting={submitting} />
    </main>
  )
}
