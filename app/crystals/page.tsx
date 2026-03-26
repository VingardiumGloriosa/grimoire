import Link from 'next/link'
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
      <p className="font-body text-[var(--color-text-muted)] mb-4">
        Stones, their properties, and healing correspondences.
      </p>
      <nav className="flex gap-4 mb-8 font-body text-sm">
        <span className="text-forest font-medium border-b border-gold pb-1">Stone Library</span>
        <Link href="/crystals/collection" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          My Collection
        </Link>
        <Link href="/crystals/ritual" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          Ritual Pairing
        </Link>
      </nav>
      <CrystalLibraryGrid crystals={(crystals as Crystal[]) || []} />
    </main>
  )
}
