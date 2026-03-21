import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { DreamEntry } from '@/lib/types'
import DreamJournalList from '@/components/DreamJournalList'
import { Plus } from 'lucide-react'

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

export default async function DreamsPage() {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: entries } = await supabase
    .from('dream_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return (
    <main className="max-w-journal mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display text-4xl">Dream Journal</h1>
        <Link
          href="/dreams/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-4 py-2 font-body text-sm text-[var(--color-bg)] transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          <Plus size={16} strokeWidth={1.5} />
          New Entry
        </Link>
      </div>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        {entries && entries.length > 0
          ? `${entries.length} dream${entries.length === 1 ? '' : 's'} recorded.`
          : 'Your dream journal is waiting.'}
      </p>
      <DreamJournalList entries={(entries as DreamEntry[]) || []} />
    </main>
  )
}
