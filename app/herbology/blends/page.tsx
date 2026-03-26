import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BlendList from '@/components/BlendList'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { HerbBlend } from '@/lib/types'

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

export default async function BlendsPage() {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: blends, count } = await supabase
    .from('herbology_blends')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(0, 19)

  const totalCount = count ?? (blends?.length ?? 0)

  return (
    <main className="max-w-content mx-auto px-6 sm:px-10 py-10">
      <h1 className="font-display text-2xl sm:text-4xl mb-2">Herbology</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-4">
        The green craft: herbs, their properties, and magical correspondences.
      </p>
      <nav className="flex gap-4 mb-8 font-body text-sm">
        <Link href="/herbology" className="text-[var(--color-text-muted)] hover:text-forest transition-colors pb-1">
          Herb Library
        </Link>
        <span className="text-forest font-medium border-b border-gold pb-1">My Blends</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <p className="font-body text-[var(--color-text-muted)]">
          {totalCount > 0
            ? `${totalCount} blend${totalCount === 1 ? '' : 's'} created.`
            : 'Your herbal blends are waiting.'}
        </p>
        <Link href="/herbology/blends/new">
          <Button className="bg-forest text-parchment hover:bg-forest-deep font-body">
            <Plus size={16} strokeWidth={1.5} className="mr-2" />
            New Blend
          </Button>
        </Link>
      </div>
      <BlendList blends={(blends as HerbBlend[]) || []} totalCount={totalCount} />
    </main>
  )
}
