"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { NumerologyProfile } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Hash, Trash2 } from "lucide-react"

interface ProfileListProps {
  profiles: NumerologyProfile[]
}

export default function ProfileList({ profiles: initialProfiles }: ProfileListProps) {
  const router = useRouter()
  const [profiles, setProfiles] = useState(initialProfiles)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(e: React.MouseEvent, profileId: string) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Delete this profile? This cannot be undone.")) return

    setDeletingId(profileId)
    try {
      const res = await fetch(`/api/numerology?id=${profileId}`, { method: "DELETE" })
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== profileId))
        router.refresh()
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (profiles.length === 0) {
    return (
      <div className="max-w-journal mx-auto flex flex-col items-center justify-center py-24 space-y-4">
        <Hash
          className="h-12 w-12 text-[var(--color-text-faint)]"
          strokeWidth={1.5}
        />
        <p className="font-body text-lg text-[var(--color-text-muted)]">
          Your numerology profiles are waiting.
        </p>
        <Link
          href="/numerology"
          className="font-body text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline underline-offset-4"
        >
          Calculate your first profile
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-journal mx-auto space-y-4">
      {profiles.map((profile) => {
        const formattedDate = new Date(profile.birth_date).toLocaleDateString(
          "en-GB",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )

        return (
          <Link key={profile.id} href={`/numerology/profiles/${profile.id}`}>
            <Card className="group surface-gradient hover-glow border border-[var(--color-border)] border-l-[3px] border-l-[var(--color-accent)] rounded-lg transition-all duration-200 hover:shadow-glow-gold hover:-translate-y-0.5 cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-2">
                  {/* Label + Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                      {profile.label}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(e, profile.id)}
                      disabled={deletingId === profile.id}
                      className="shrink-0 rounded-md p-1.5 text-[var(--color-text-faint)] opacity-0 transition-all hover:bg-[var(--color-blush)]/10 hover:text-[var(--color-blush)] group-hover:opacity-100 disabled:opacity-50"
                      title="Delete profile"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Name + Date */}
                  <p className="font-body text-sm text-[var(--color-text-muted)]">
                    {profile.full_name} &middot; {formattedDate}
                  </p>

                  {/* Life Path number badge */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-subtle)] px-3 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                      <span className="font-display text-sm">{profile.results.life_path}</span>
                      Life Path
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
