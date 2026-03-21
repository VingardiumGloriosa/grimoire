import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase-server'
import MoonJournalList from '@/components/MoonJournalList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { MoonJournalEntry } from '@/lib/types'

export const metadata = {
  title: 'Moon Journal — Grimoire',
  description: 'Your personal lunar reflections.',
}

export default async function MoonJournalPage() {
  const cookieStore = await cookies()

  const authClient = createSupabaseServerClient(
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

  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-reading mx-auto px-6 py-10 text-center">
        <h1 className="font-display text-4xl text-[var(--color-text)] mb-4">
          Moon Journal
        </h1>
        <p className="font-body text-[var(--color-text-muted)] mb-6">
          Sign in to begin tracking your lunar reflections.
        </p>
        <Link
          href="/auth"
          className="font-body text-sm text-[var(--color-secondary)] hover:text-[var(--color-primary)] underline underline-offset-4"
        >
          Sign in
        </Link>
      </main>
    )
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from('moon_journal_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  const entries: MoonJournalEntry[] = (data as MoonJournalEntry[]) ?? []

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-[var(--color-text)]">
          Moon Journal
        </h1>
        <Link href="/moon/journal/new">
          <Button className="bg-forest text-parchment hover:bg-forest-deep font-body">
            <Plus size={16} strokeWidth={1.5} className="mr-2" />
            New Entry
          </Button>
        </Link>
      </div>

      <MoonJournalList entries={entries} />
    </main>
  )
}
