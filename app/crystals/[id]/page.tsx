import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import CrystalDetail from '@/components/CrystalDetail'
import type { Crystal } from '@/lib/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface CrystalPageProps {
  params: { id: string }
}

export default async function CrystalPage({ params }: CrystalPageProps) {
  const supabase = createServerClient()
  const { data: crystal } = await supabase
    .from('crystals_stones')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!crystal) {
    notFound()
  }

  return (
    <main className="max-w-content mx-auto px-6 py-10">
      <Link
        href="/crystals"
        className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-6"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Crystals
      </Link>
      <CrystalDetail crystal={crystal as Crystal} />
    </main>
  )
}
