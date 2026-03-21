import { createServerClient } from '@/lib/supabase-server'
import NumerologyCalculator from '@/components/NumerologyCalculator'
import type { NumerologyInterpretation } from '@/lib/types'

export default async function NumerologyPage() {
  const supabase = createServerClient()
  const { data: interpretations } = await supabase
    .from('numerology_interpretations')
    .select('*')
    .order('number', { ascending: true })

  return (
    <main className="max-w-content mx-auto px-6 py-10">
      <h1 className="font-display text-4xl mb-2">Numerology</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-10">
        Discover the numbers woven into your name and birth.
      </p>
      <NumerologyCalculator
        interpretations={(interpretations as NumerologyInterpretation[]) || []}
      />
    </main>
  )
}
