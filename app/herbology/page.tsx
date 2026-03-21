import { createServerClient } from '@/lib/supabase-server'
import HerbLibraryGrid from '@/components/HerbLibraryGrid'
import type { Herb } from '@/lib/types'

export default async function HerbologyPage() {
  const supabase = createServerClient()
  const { data: herbs } = await supabase
    .from('herbology_herbs')
    .select('*')
    .order('name')

  return (
    <main className="max-w-content mx-auto px-6 py-10">
      <h1 className="font-display text-4xl mb-2">Herbology</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        The green craft — herbs, their properties, and magical correspondences.
      </p>
      <HerbLibraryGrid herbs={(herbs as Herb[]) || []} />
    </main>
  )
}
