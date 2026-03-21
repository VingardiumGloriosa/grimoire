import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProfileList from '@/components/ProfileList'
import type { NumerologyProfile } from '@/lib/types'

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

export default async function NumerologyProfilesPage() {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: profiles } = await supabase
    .from('numerology_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-journal mx-auto px-6 py-10">
      <h1 className="font-display text-4xl mb-2">Your Profiles</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        {profiles && profiles.length > 0
          ? `${profiles.length} profile${profiles.length === 1 ? '' : 's'} saved.`
          : 'Your numerology profiles are waiting.'}
      </p>
      <ProfileList profiles={(profiles as NumerologyProfile[]) || []} />
    </main>
  )
}
