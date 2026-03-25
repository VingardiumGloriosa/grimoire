"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { User, LogOut, Trash2, Mail, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth")
        return
      }
      setEmail(user.email ?? null)
      setCreatedAt(user.created_at ?? null)
      setLoading(false)
    })
  }, [router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth")
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch("/api/account", { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || "Failed to delete account")
      }

      // Sign out locally after deletion
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth")
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <main className="max-w-reading mx-auto px-6 py-10">
        <p className="font-body text-sm text-[var(--color-text-muted)] italic">Loading...</p>
      </main>
    )
  }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <main className="max-w-reading mx-auto px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 font-body text-sm text-[var(--color-text-muted)] hover:text-forest transition-colors mb-6"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Dashboard
      </Link>

      <header className="mb-10">
        <h1 className="font-display text-4xl mb-2">Account</h1>
        <p className="font-body text-sm text-[var(--color-text-muted)]">
          Manage your Grimoire account.
        </p>
      </header>

      {/* Account info */}
      <section className="mb-10">
        <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Mail size={16} strokeWidth={1.5} className="text-[var(--color-text-faint)]" />
            <div>
              <p className="font-body text-xs text-[var(--color-text-faint)] uppercase tracking-wider">Email</p>
              <p className="font-body text-sm text-[var(--color-text)]">{email}</p>
            </div>
          </div>

          {formattedDate && (
            <div className="flex items-center gap-3">
              <Calendar size={16} strokeWidth={1.5} className="text-[var(--color-text-faint)]" />
              <div>
                <p className="font-body text-xs text-[var(--color-text-faint)] uppercase tracking-wider">Member since</p>
                <p className="font-body text-sm text-[var(--color-text)]">{formattedDate}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <section className="mb-10">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full sm:w-auto font-body gap-2"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Sign Out
        </Button>
      </section>

      {/* Danger zone */}
      <section>
        <div className="divider-ornament mb-6" aria-hidden="true" />
        <h2 className="font-display text-xl text-blush mb-4">Danger Zone</h2>

        {!showDeleteConfirm ? (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline"
            className="font-body gap-2 border-blush/30 text-blush hover:bg-blush/10 hover:text-blush"
          >
            <Trash2 size={14} strokeWidth={1.5} />
            Delete Account
          </Button>
        ) : (
          <div className="border border-blush/30 rounded-lg p-6 space-y-4">
            <p className="font-body text-sm text-[var(--color-text)]">
              This will permanently delete your account and all your data, including readings, spreads, charts, journal entries, and collections. This cannot be undone.
            </p>

            {deleteError && (
              <p className="font-body text-sm text-blush italic">{deleteError}</p>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-blush text-parchment hover:bg-blush/80 font-body gap-2"
              >
                <Trash2 size={14} strokeWidth={1.5} />
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="font-body"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
