import { pageMetadata } from '@/lib/metadata'
import { createServerClient } from '@/lib/supabase-server'

export const metadata = pageMetadata('Card Library', 'Browse all 78 tarot cards with meanings, keywords, and esoteric correspondences.')
import CardLibraryGrid from '@/components/CardLibraryGrid'

export default async function CardsPage() {
  const supabase = createServerClient()
  const { data: cards, error } = await supabase
    .from('tarot_cards')
    .select('*')
    .order('number')

  if (error) {
    console.error('Failed to load cards:', error.message)
  }

  return (
    <main className="max-w-content mx-auto px-6 sm:px-10 py-10">
      <h1 className="font-display text-2xl sm:text-4xl mb-8">Card Library</h1>
      <CardLibraryGrid cards={cards || []} />
    </main>
  )
}
