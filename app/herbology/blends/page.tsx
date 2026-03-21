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

  const { data: blends } = await supabase
    .from('herbology_blends')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-content mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl mb-2">Your Blends</h1>
          <p className="font-body text-[var(--color-text-muted)]">
            {blends && blends.length > 0
              ? `${blends.length} blend${blends.length === 1 ? '' : 's'} created.`
              : 'Your herbal blends are waiting.'}
          </p>
        </div>
        <Link href="/herbology/blends/new">
          <Button className="bg-forest text-parchment hover:bg-forest-deep font-body">
            <Plus size={16} strokeWidth={1.5} className="mr-2" />
            New Blend
          </Button>
        </Link>
      </div>
      <BlendList blends={(blends as HerbBlend[]) || []} />
    </main>
  )
}
