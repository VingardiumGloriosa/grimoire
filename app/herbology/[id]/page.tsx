import { createServerClient } from '@/lib/supabase-server'
import HerbDetail from '@/components/HerbDetail'
import { notFound } from 'next/navigation'
import type { Herb } from '@/lib/types'

export default async function HerbPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()
  const { data: herb } = await supabase
    .from('herbology_herbs')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!herb) notFound()

  return (
    <main className="px-6 py-10">
      <HerbDetail herb={herb as Herb} />
    </main>
  )
}
