import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import PatternDashboard from '@/components/PatternDashboard'
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

export default async function DreamPatternsPage() {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <main className="max-w-journal mx-auto px-6 py-10">
      <Link
        href="/dreams"
        className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-8"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to Journal
      </Link>
      <h1 className="font-display text-4xl mb-2">Dream Patterns</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        Threads that weave through your dreaming life.
      </p>
      <PatternDashboard />
    </main>
  )
}
