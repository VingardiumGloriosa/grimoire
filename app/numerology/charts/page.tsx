import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import NumerologyChartList from '@/components/NumerologyChartList'
import type { NumerologyChart } from '@/lib/types'

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

export default async function NumerologyChartsPage() {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: charts, count } = await supabase
    .from('numerology_charts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(0, 19)

  const totalCount = count ?? (charts?.length ?? 0)

  return (
    <main className="max-w-journal mx-auto px-6 py-10">
      <h1 className="font-display text-4xl mb-2">Your Charts</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        {totalCount > 0
          ? `${totalCount} chart${totalCount === 1 ? '' : 's'} saved.`
          : 'Your numerology charts are waiting.'}
      </p>
      <NumerologyChartList charts={(charts as NumerologyChart[]) || []} totalCount={totalCount} />
    </main>
  )
}
