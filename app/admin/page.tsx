'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Loader2 } from 'lucide-react'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [storedPassword, setStoredPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setChecking(true)
    setAuthError(null)

    try {
      const response = await fetch('/api/interpret', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ check: true }),
      })

      if (response.ok) {
        setAuthenticated(true)
        setStoredPassword(password)
      } else {
        setAuthError('Invalid password.')
      }
    } catch {
      setAuthError('Could not verify password.')
    }

    setChecking(false)
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface)]">
              <Lock size={20} strokeWidth={1.5} className="text-[var(--color-text-muted)]" />
            </div>
            <h1 className="font-display text-2xl text-[var(--color-text)]">Admin Access</h1>
            <p className="mt-2 font-body text-sm text-[var(--color-text-muted)]">
              Enter the admin password to manage reference data and templates.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password" className="font-body text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="mt-1 font-body"
                required
              />
            </div>

            {authError && (
              <p className="font-body text-sm text-[var(--color-blush)]">{authError}</p>
            )}

            <Button
              type="submit"
              disabled={checking || !password}
              className="w-full bg-forest text-parchment hover:bg-forest-deep font-body"
            >
              {checking ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Enter'
              )}
            </Button>
          </form>
        </div>
      </main>
    )
  }

  return <AdminDashboard adminPassword={storedPassword} />
}
