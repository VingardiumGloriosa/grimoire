import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase-server'
import MoonJournalList from '@/components/MoonJournalList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { MoonJournalEntry } from '@/lib/types'

export const metadata = {
  title: 'Moon Journal',
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
      <main className="max-w-reading mx-auto px-6 py-10">
        <h1 className="font-display text-2xl sm:text-4xl text-[var(--color-text)] mb-2">
          Moon Phases
        </h1>
        <p className="font-body text-[var(--color-text-muted)] mb-4">
          Track lunar cycles and align with the moon.
        </p>
        <nav className="flex gap-4 mb-8 font-body text-sm">
          <Link href="/moon" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
            Phases
          </Link>
          <span className="text-forest font-medium border-b border-gold pb-1">Moon Journal</span>
          <Link href="/moon/guide" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
            Phase Guide
          </Link>
        </nav>
        <div className="text-center py-10">
          <p className="font-body text-[var(--color-text-muted)] mb-6">
            Sign in to begin tracking your lunar reflections.
          </p>
          <Link
            href="/auth"
            className="font-body text-sm text-[var(--color-secondary)] hover:text-[var(--color-primary)] underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </main>
    )
  }

  const supabase = createServerClient()
  const { data, error: queryError, count } = await supabase
    .from('moon_journal_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .range(0, 19)

  if (queryError) {
    console.error('Failed to load moon journal entries:', queryError.message)
  }

  const entries: MoonJournalEntry[] = (data as MoonJournalEntry[]) ?? []
  const totalCount = count ?? entries.length

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <h1 className="font-display text-2xl sm:text-4xl text-[var(--color-text)] mb-2">
        Moon Phases
      </h1>
      <p className="font-body text-[var(--color-text-muted)] mb-4">
        Track lunar cycles and align with the moon.
      </p>
      <nav className="flex gap-4 mb-8 font-body text-sm">
        <Link href="/moon" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          Phases
        </Link>
        <span className="text-forest font-medium border-b border-gold pb-1">Moon Journal</span>
        <Link href="/moon/guide" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          Phase Guide
        </Link>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <Link href="/moon/journal/new">
          <Button className="bg-forest text-parchment hover:bg-forest-deep font-body">
            <Plus size={16} strokeWidth={1.5} className="mr-2" />
            New Entry
          </Button>
        </Link>
      </div>

      <MoonJournalList entries={entries} totalCount={totalCount} />
    </main>
  )
}
