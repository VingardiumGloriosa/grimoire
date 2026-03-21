import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { DreamEntry } from '@/lib/types'
import DreamEntryView from '@/components/DreamEntryView'
import DreamEntryActions from './DreamEntryActions'
import { ArrowLeft } from 'lucide-react'

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

interface PageProps {
  params: { id: string }
}

export default async function DreamEntryPage({ params }: PageProps) {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: entry } = await supabase
    .from('dream_entries')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!entry) {
    notFound()
  }

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/dreams"
          className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to Journal
        </Link>
        <DreamEntryActions entryId={params.id} />
      </div>
      <DreamEntryView entry={entry as DreamEntry} />
    </main>
  )
}
