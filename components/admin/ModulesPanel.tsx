'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Check } from 'lucide-react'
import type { Module } from '@/lib/types'

interface ModulesPanelProps {
  adminPassword: string
}

interface ModuleEdits {
  [moduleId: string]: Partial<Module>
}

export default function ModulesPanel({ adminPassword }: ModulesPanelProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [edits, setEdits] = useState<ModuleEdits>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchModules = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/modules', {
        headers: { 'X-Admin-Password': adminPassword },
      })
      if (!res.ok) throw new Error('Failed to fetch modules')
      const data = await res.json()
      setModules(data as Module[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [adminPassword])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  function getModuleValue<K extends keyof Module>(mod: Module, key: K): Module[K] {
    const edit = edits[mod.id]
    if (edit && key in edit) return edit[key] as Module[K]
    return mod[key]
  }

  function setModuleEdit(moduleId: string, key: keyof Module, value: unknown) {
    setEdits((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [key]: value },
    }))
  }

  function hasChanges(moduleId: string): boolean {
    return !!edits[moduleId] && Object.keys(edits[moduleId]).length > 0
  }

  async function toggleEnabled(mod: Module) {
    const newEnabled = !getModuleValue(mod, 'enabled')
    setSavingId(mod.id)
    setError(null)

    try {
      const res = await fetch('/api/admin/modules', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ id: mod.id, enabled: newEnabled }),
      })
      if (!res.ok) throw new Error('Failed to toggle module')
      await fetchModules()
      // Clear any edits for the 'enabled' field
      setEdits((prev) => {
        const next = { ...prev }
        if (next[mod.id]) {
          delete next[mod.id].enabled
          if (Object.keys(next[mod.id]).length === 0) delete next[mod.id]
        }
        return next
      })
      setSavedId(mod.id)
      setTimeout(() => setSavedId(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle')
    } finally {
      setSavingId(null)
    }
  }

  async function saveModule(mod: Module) {
    const changes = edits[mod.id]
    if (!changes || Object.keys(changes).length === 0) return

    setSavingId(mod.id)
    setError(null)

    try {
      const res = await fetch('/api/admin/modules', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ id: mod.id, ...changes }),
      })
      if (!res.ok) throw new Error('Failed to save module')
      await fetchModules()
      setEdits((prev) => {
        const next = { ...prev }
        delete next[mod.id]
        return next
      })
      setSavedId(mod.id)
      setTimeout(() => setSavedId(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-[var(--color-blush)]/10 border border-[var(--color-blush)]/20 px-4 py-3">
          <p className="font-body text-sm text-[var(--color-blush)]">{error}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((mod) => {
          const enabled = getModuleValue(mod, 'enabled')
          const isSaving = savingId === mod.id
          const justSaved = savedId === mod.id

          return (
            <Card
              key={mod.id}
              className={`border transition-colors ${
                enabled
                  ? 'border-[var(--color-secondary)]/30 bg-[var(--color-surface)]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg)] opacity-75'
              }`}
            >
              <CardContent className="p-5 space-y-3">
                {/* Header: name + toggle */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {mod.icon && (
                        <span className="text-lg">{mod.icon}</span>
                      )}
                      <Input
                        value={String(getModuleValue(mod, 'name'))}
                        onChange={(e) => setModuleEdit(mod.id, 'name', e.target.value)}
                        className="font-body font-semibold text-sm h-8 bg-transparent border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-border)]"
                      />
                    </div>
                    <p className="font-body text-xs text-[var(--color-text-muted)] px-1">
                      {mod.key}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled as boolean}
                    onClick={() => toggleEnabled(mod)}
                    disabled={isSaving}
                    className={`
                      relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
                      border-2 border-transparent transition-colors duration-200
                      ${enabled ? 'bg-[var(--color-secondary)]' : 'bg-[var(--color-border)]'}
                      ${isSaving ? 'opacity-50' : ''}
                    `}
                  >
                    <span
                      className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full
                        bg-[var(--color-surface)] shadow-sm transition-transform duration-200
                        ${enabled ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>

                {/* Description */}
                <Textarea
                  value={String(getModuleValue(mod, 'description') ?? '')}
                  onChange={(e) => setModuleEdit(mod.id, 'description', e.target.value)}
                  rows={2}
                  className="font-body text-xs bg-transparent border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-border)] min-h-0 resize-none"
                  placeholder="Module description..."
                />

                {/* Icon field */}
                <Input
                  value={String(getModuleValue(mod, 'icon') ?? '')}
                  onChange={(e) => setModuleEdit(mod.id, 'icon', e.target.value)}
                  placeholder="Icon (emoji or name)"
                  className="font-body text-xs h-7 bg-transparent border-transparent hover:border-[var(--color-border)] focus:border-[var(--color-border)]"
                />

                {/* Save button */}
                <div className="flex items-center justify-end gap-2 min-h-[28px]">
                  {justSaved && (
                    <span className="flex items-center gap-1 text-xs text-[var(--color-secondary)] font-body">
                      <Check className="h-3 w-3" strokeWidth={1.5} />
                      Saved
                    </span>
                  )}
                  {hasChanges(mod.id) && (
                    <Button
                      size="sm"
                      onClick={() => saveModule(mod)}
                      disabled={isSaving}
                      className="h-7 text-xs bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]/90 font-body"
                    >
                      {isSaving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
