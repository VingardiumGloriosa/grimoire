import { pageMetadata } from '@/lib/metadata'
import { Suspense } from 'react'

export const metadata = pageMetadata('Dream Symbols', 'A library of archetypes and images from the dreaming mind.')
import { createServerClient } from '@/lib/supabase-server'
import type { DreamSymbol } from '@/lib/types'
import SymbolLibrary from '@/components/SymbolLibrary'

export default async function DreamSymbolsPage() {
  const supabase = createServerClient()

  const { data: symbols, error } = await supabase
    .from('dreams_symbols')
    .select('*')
    .order('name')

  if (error) {
    console.error('Failed to load dream symbols:', error.message)
  }

  return (
    <main className="max-w-content mx-auto px-6 py-10">
      <h1 className="font-display text-4xl mb-2">Dream Symbols</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        A library of archetypes and images that surface in the dreaming mind.
      </p>
      <Suspense fallback={null}>
        <SymbolLibrary symbols={(symbols as DreamSymbol[]) || []} />
      </Suspense>
    </main>
  )
}
