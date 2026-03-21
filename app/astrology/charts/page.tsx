import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import ChartList from "@/components/ChartList"
import { Button } from "@/components/ui/button"
import type { BirthChart } from "@/lib/types"
import { Plus } from "lucide-react"

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

export default async function ChartsPage() {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: charts } = await supabase
    .from("astrology_birth_charts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl mb-2">Birth Charts</h1>
          <p className="font-body text-[var(--color-text-muted)]">
            {charts && charts.length > 0
              ? `${charts.length} chart${charts.length === 1 ? "" : "s"} saved.`
              : "Your star charts are waiting."}
          </p>
        </div>
        <Link href="/astrology/charts/new">
          <Button className="bg-forest text-parchment hover:bg-forest-deep font-body">
            <Plus size={16} strokeWidth={1.5} className="mr-2" />
            New Chart
          </Button>
        </Link>
      </div>

      <ChartList charts={(charts as BirthChart[]) || []} />
    </main>
  )
}
