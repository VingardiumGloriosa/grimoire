import { createServerClient } from '@/lib/supabase-server'
import ReadingView from '@/components/ReadingView'
import { notFound } from 'next/navigation'

export default async function ReadingPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()
  const { data: reading } = await supabase
    .from('tarot_readings')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!reading) notFound()

  return (
    <main className="px-6 py-10">
      <ReadingView reading={reading} />
    </main>
  )
}
