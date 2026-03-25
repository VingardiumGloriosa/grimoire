import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import NumerologyChart from '@/components/NumerologyChart'
import type { NumerologyChart as NumerologyChartType } from '@/lib/types'
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

export default async function NumerologyChartPage({
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

  const { data: chart } = await supabase
    .from('numerology_charts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!chart) notFound()

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <Link
        href="/numerology/charts"
        className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-8"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to charts
      </Link>
      <NumerologyChart chart={chart as NumerologyChartType} />
    </main>
  )
}
