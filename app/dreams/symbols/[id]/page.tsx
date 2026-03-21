import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase-server'
import type { DreamSymbol, DreamUserSymbol } from '@/lib/types'
import SymbolDetail from '@/components/SymbolDetail'
import PersonalMeaningEditor from './PersonalMeaningEditor'
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

export default async function SymbolDetailPage({ params }: PageProps) {
  const supabase = createServerClient()

  const { data: symbol } = await supabase
    .from('dream_symbols')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!symbol) {
    notFound()
  }

  // Try to get the user for personal meaning
  const authClient = createAuthClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  let personalMeaning: DreamUserSymbol | null = null
  if (user) {
    const { data } = await authClient
      .from('dream_user_symbols')
      .select('*')
      .eq('user_id', user.id)
      .eq('core_symbol_id', params.id)
      .single()
    personalMeaning = (data as DreamUserSymbol) ?? null
  }

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <Link
        href="/dreams/symbols"
        className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-8"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to Symbols
      </Link>
      <SymbolDetail
        symbol={symbol as DreamSymbol}
        personalMeaning={personalMeaning}
      />
      {user && (
        <div className="mt-10">
          <PersonalMeaningEditor
            symbolId={params.id}
            symbolName={(symbol as DreamSymbol).name}
            existingMeaning={personalMeaning}
          />
        </div>
      )}
    </main>
  )
}
