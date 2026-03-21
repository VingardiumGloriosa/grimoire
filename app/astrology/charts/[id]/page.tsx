import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import type { BirthChart, AstrologyInterpretation } from "@/lib/types"
import SignBadge from "@/components/SignBadge"
import ChartPlacements from "@/components/ChartPlacements"
import ChartAspects from "@/components/ChartAspects"
import ChartInterpretation from "@/components/ChartInterpretation"
import { ArrowLeft, MapPin, Clock, Calendar } from "lucide-react"

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

interface ChartPageProps {
  params: { id: string }
}

export default async function ChartPage({ params }: ChartPageProps) {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: chart } = await supabase
    .from("astrology_birth_charts")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()

  if (!chart) {
    notFound()
  }

  const typedChart = chart as BirthChart

  // Fetch interpretations for the chart's signs
  const signKeys = [
    typedChart.sun_sign,
    typedChart.moon_sign,
    typedChart.rising_sign,
  ].filter(Boolean)

  const { data: interpretations } = await supabase
    .from("astrology_interpretations")
    .select("*")
    .in("key", signKeys)

  const typedInterpretations = (interpretations as AstrologyInterpretation[]) || []

  const formattedDate = new Date(typedChart.birth_date).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  )

  const hasPlanets =
    typedChart.chart_data?.planets && typedChart.chart_data.planets.length > 0
  const hasAspects =
    typedChart.chart_data?.aspects && typedChart.chart_data.aspects.length > 0

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      {/* Back link */}
      <Link
        href="/astrology/charts"
        className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-muted)] hover:text-forest transition-colors mb-6"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Charts
      </Link>

      {/* Header */}
      <header className="space-y-3 mb-10">
        <h1 className="font-display text-4xl">{typedChart.label}</h1>
        <div className="flex flex-wrap items-center gap-3 font-body text-sm text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} strokeWidth={1.5} />
            {formattedDate}
          </span>
          {typedChart.birth_time && (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} strokeWidth={1.5} />
              {typedChart.birth_time}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} strokeWidth={1.5} />
            {typedChart.birth_location}
          </span>
        </div>
        {typedChart.time_unknown && (
          <p className="font-body text-xs text-[var(--color-text-faint)] italic">
            Birth time unknown — rising sign and house placements may be unavailable.
          </p>
        )}
      </header>

      {/* Big Three */}
      <section className="mb-10">
        <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <p className="font-body text-xs text-[var(--color-text-faint)] uppercase tracking-wider">
                Sun
              </p>
              <SignBadge sign={typedChart.sun_sign} size="md" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-body text-xs text-[var(--color-text-faint)] uppercase tracking-wider">
                Moon
              </p>
              <SignBadge sign={typedChart.moon_sign} size="md" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-body text-xs text-[var(--color-text-faint)] uppercase tracking-wider">
                Rising
              </p>
              {typedChart.rising_sign ? (
                <SignBadge sign={typedChart.rising_sign} size="md" />
              ) : (
                <span className="font-body text-sm text-[var(--color-text-faint)] italic">
                  Unknown
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Planetary Placements */}
      {hasPlanets && (
        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Planetary Placements</h2>
          <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-6">
            <ChartPlacements placements={typedChart.chart_data.planets} />
          </div>
        </section>
      )}

      {/* Aspects */}
      {hasAspects && (
        <section className="mb-10">
          <h2 className="font-display text-2xl mb-4">Aspects</h2>
          <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-6">
            <ChartAspects aspects={typedChart.chart_data.aspects} />
          </div>
        </section>
      )}

      {/* Interpretation */}
      <section className="mb-10">
        <div className="divider-ornament mb-6" aria-hidden="true" />
        <h2 className="font-display text-2xl mb-6">Interpretation</h2>
        <ChartInterpretation
          chart={typedChart}
          interpretations={typedInterpretations}
        />
      </section>

      {/* No chart data notice */}
      {!hasPlanets && !hasAspects && (
        <section className="mb-10">
          <div className="border-l-2 border-[var(--color-border)] pl-4">
            <p className="font-body text-sm text-[var(--color-text-faint)] italic">
              Detailed planetary data and aspects will be available once the FreeAstroAPI integration is complete. For now, your chart stores the big three (sun, moon, rising) and birth details.
            </p>
          </div>
        </section>
      )}
    </main>
  )
}
