import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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
      <h1 className="font-display text-2xl sm:text-4xl mb-2">Crystals</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-4">
        Stones, their properties, and healing correspondences.
      </p>
      <nav className="flex gap-4 mb-8 font-body text-sm">
        <Link href="/crystals" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          Stone Library
        </Link>
        <span className="text-forest font-medium border-b border-gold pb-1">My Collection</span>
        <Link href="/crystals/ritual" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          Ritual Pairing
        </Link>
      </nav>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        {entries && entries.length > 0
          ? `${entries.length} crystal${entries.length === 1 ? '' : 's'} in your collection.`
          : 'Your crystal collection is waiting.'}
      </p>
      <CrystalCollectionList entries={entries || []} />
    </main>
  )
}
