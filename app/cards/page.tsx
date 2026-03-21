import { createServerClient } from '@/lib/supabase-server'
import CardLibraryGrid from '@/components/CardLibraryGrid'

export default async function CardsPage() {
  const supabase = createServerClient()
  const { data: cards } = await supabase
    .from('tarot_cards')
    .select('*')
    .order('number')

  return (
    <main className="max-w-content mx-auto px-6 py-10">
      <h1 className="font-display text-4xl mb-8">Card Library</h1>
      <CardLibraryGrid cards={cards || []} />
    </main>
  )
}
