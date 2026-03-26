'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const redirect = searchParams.get('redirect') || '/'
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${redirect}`,
      },
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-[var(--color-text)]">Grimoire</h1>
          <div className="mx-auto mt-2 h-px w-16 bg-gold" />
          <p className="mt-4 font-body text-sm text-[var(--color-text-muted)]">
            Sign in to access your readings and journal.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-subtle)]">
                <Mail size={20} strokeWidth={1.5} className="text-[var(--color-primary)]" />
              </div>
              <h2 className="font-display text-xl mb-2 text-[var(--color-text)]">
                Check your email
              </h2>
              <p className="font-body text-sm text-[var(--color-text-muted)]">
                A magic link has been sent to{' '}
                <span className="font-medium text-[var(--color-text)]">{email}</span>.
                Click the link to sign in.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body text-sm text-[var(--color-text)]">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="font-body"
                />
              </div>

              {error && (
                <p className="font-body text-sm text-[var(--color-blush)]">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-forest text-parchment hover:bg-forest-deep font-body"
              >
                {loading ? 'Sending...' : 'Send magic link'}
              </Button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center font-body text-xs text-[var(--color-text-faint)]">
          No password needed. We will send you a sign-in link.
        </p>
      </div>
    </main>
  )
}
