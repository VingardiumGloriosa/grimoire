import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import JournalList from '@/components/JournalList'
import type { TarotReading } from '@/lib/types'

function createAuthClient() {
  const cookieStore = cookies()
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )
}

export default async function JournalPage() {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: readings } = await supabase
    .from('tarot_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return (
    <main className="max-w-journal mx-auto px-6 py-10">
      <h1 className="font-display text-4xl mb-2">Your Journal</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        {readings && readings.length > 0
          ? `${readings.length} reading${readings.length === 1 ? '' : 's'} recorded.`
          : 'Your journal is waiting.'}
      </p>
      <JournalList readings={(readings as TarotReading[]) || []} />
    </main>
  )
}
