import { pageMetadata } from '@/lib/metadata'
import { createServerClient } from '@/lib/supabase-server'

export const metadata = pageMetadata('Herbology', 'Explore herbs, their properties, and magical correspondences.')
import HerbLibraryGrid from '@/components/HerbLibraryGrid'
import type { Herb } from '@/lib/types'

export default async function HerbologyPage() {
  const supabase = createServerClient()
  const { data: herbs, error } = await supabase
    .from('herbology_herbs')
    .select('*')
    .order('name')

  if (error) {
    console.error('Failed to load herbs:', error.message)
  }

  return (
    <main className="max-w-content mx-auto px-6 sm:px-10 py-10">
      <h1 className="font-display text-2xl sm:text-4xl mb-2">Herbology</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        The green craft: herbs, their properties, and magical correspondences.
      </p>
      <HerbLibraryGrid herbs={(herbs as Herb[]) || []} />
    </main>
  )
}
