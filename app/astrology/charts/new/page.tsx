import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import ChartCreator from "@/components/ChartCreator"
import { ArrowLeft } from "lucide-react"

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

export default async function NewChartPage() {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <Link
        href="/astrology/charts"
        className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-muted)] hover:text-forest transition-colors mb-6"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Charts
      </Link>

      <h1 className="font-display text-4xl mb-2">New Birth Chart</h1>
      <p className="font-body text-[var(--color-text-muted)] mb-8">
        Enter birth details to cast a natal chart.
      </p>

      <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-6">
        <ChartCreator />
      </div>
    </main>
  )
}
