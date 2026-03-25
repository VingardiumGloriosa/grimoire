import { pageMetadata } from '@/lib/metadata'
import { createServerClient } from '@/lib/supabase-server'

export const metadata = pageMetadata('Numerology', 'Discover the numbers woven into your name and birth.')
import NumerologyCalculator from '@/components/NumerologyCalculator'
import type { NumerologyInterpretation } from '@/lib/types'

export default async function NumerologyPage() {
  const supabase = createServerClient()
  const { data: interpretations, error } = await supabase
    .from('numerology_interpretations')
    .select('*')
    .order('number', { ascending: true })

  if (error) {
    console.error('Failed to load interpretations:', error.message)
  }

  return (
    <main className="max-w-content mx-auto px-6 sm:px-10 py-10">
      <h1 className="font-display text-2xl sm:text-4xl mb-2">Numerology</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-10">
        Discover the numbers woven into your name and birth.
      </p>
      <NumerologyCalculator
        interpretations={(interpretations as NumerologyInterpretation[]) || []}
      />
    </main>
  )
}
