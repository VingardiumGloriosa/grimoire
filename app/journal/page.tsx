import { pageMetadata } from '@/lib/metadata'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'

export const metadata = pageMetadata('Your Journal', 'Your personal tarot reading history.')
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

  const { data: readings, error, count } = await supabase
    .from('tarot_readings')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .range(0, 19)

  if (error) {
    console.error('Failed to load readings:', error.message)
  }

  const totalCount = count ?? (readings?.length ?? 0)

  return (
    <main className="max-w-journal mx-auto px-6 sm:px-10 py-10">
      <h1 className="font-display text-2xl sm:text-4xl mb-2">Your Journal</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        {totalCount > 0
          ? `${totalCount} reading${totalCount === 1 ? '' : 's'} recorded.`
          : 'Your journal is waiting.'}
      </p>
      <JournalList readings={(readings as TarotReading[]) || []} totalCount={totalCount} />
    </main>
  )
}
