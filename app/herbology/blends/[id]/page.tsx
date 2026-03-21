import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import BlendView from '@/components/BlendView'
import DeleteBlendButton from './DeleteBlendButton'
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

export default async function BlendPage({
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

  const { data: blend } = await supabase
    .from('herbology_blends')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!blend) notFound()

  return (
    <main className="px-6 py-10">
      <BlendView blend={blend as HerbBlend} />
      <div className="max-w-content mx-auto mt-10 flex justify-end">
        <DeleteBlendButton blendId={blend.id} />
      </div>
    </main>
  )
}
