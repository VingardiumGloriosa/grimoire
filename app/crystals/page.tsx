import { pageMetadata } from '@/lib/metadata'
import { createServerClient } from '@/lib/supabase-server'

export const metadata = pageMetadata('Crystals', 'Stones, their properties, and healing correspondences.')
import CrystalLibraryGrid from '@/components/CrystalLibraryGrid'
import type { Crystal } from '@/lib/types'

export default async function CrystalsPage() {
  const supabase = createServerClient()
  const { data: crystals, error } = await supabase
    .from('crystals_stones')
    .select('*')
    .order('name')

  if (error) {
    console.error('Failed to load crystals:', error.message)
  }

  return (
    <main className="max-w-content mx-auto px-6 sm:px-10 py-10">
      <h1 className="font-display text-2xl sm:text-4xl mb-2">Crystals</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        Stones, their properties, and healing correspondences.
      </p>
      <CrystalLibraryGrid crystals={(crystals as Crystal[]) || []} />
    </main>
  )
}
