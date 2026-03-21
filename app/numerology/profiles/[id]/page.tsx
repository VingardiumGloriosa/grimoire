import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import NumerologyProfile from '@/components/NumerologyProfile'
import type { NumerologyProfile as NumerologyProfileType } from '@/lib/types'
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

export default async function NumerologyProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('numerology_profiles')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!profile) notFound()

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <Link
        href="/numerology/profiles"
        className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-8"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to profiles
      </Link>
      <NumerologyProfile profile={profile as NumerologyProfileType} />
    </main>
  )
}
