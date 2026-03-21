import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CrystalCollectionList from '@/components/CrystalCollectionList'

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

export default async function CrystalCollectionPage() {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: entries } = await supabase
    .from('crystals_collections')
    .select('*, crystals_stones(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-journal mx-auto px-6 py-10">
      <h1 className="font-display text-4xl mb-2">Your Collection</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        {entries && entries.length > 0
          ? `${entries.length} crystal${entries.length === 1 ? '' : 's'} in your collection.`
          : 'Your crystal collection is waiting.'}
      </p>
      <CrystalCollectionList entries={entries || []} />
    </main>
  )
}
