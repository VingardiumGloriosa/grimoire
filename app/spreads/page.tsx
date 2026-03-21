'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { SpreadTemplate, SpreadPosition } from '@/lib/types'
import SpreadCanvas from '@/components/SpreadCanvas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { LayoutGrid, Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'

type EditorMode = 'closed' | 'create' | 'edit'

export default function SpreadsPage() {
  const supabase = createClient()

  const [spreads, setSpreads] = useState<SpreadTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Editor state
  const [editorMode, setEditorMode] = useState<EditorMode>('closed')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [positions, setPositions] = useState<SpreadPosition[]>([])

  const fetchSpreads = useCallback(async () => {
    const { data } = await supabase
      .from('tarot_spread_templates')
      .select('*')
      .order('created_at', { ascending: false })
    setSpreads((data as SpreadTemplate[]) || [])
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchSpreads()
  }, [fetchSpreads])

  const resetEditor = () => {
    setEditorMode('closed')
    setEditingId(null)
    setName('')
    setDescription('')
    setPositions([])
  }

  const openCreate = () => {
    resetEditor()
    setEditorMode('create')
  }

  const openEdit = (spread: SpreadTemplate) => {
    setEditorMode('edit')
    setEditingId(spread.id)
    setName(spread.name)
    setDescription(spread.description || '')
    setPositions(spread.positions)
  }

  const handleSave = async () => {
    if (!name.trim() || positions.length === 0) return
    setSaving(true)

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      positions,
    }

    if (editorMode === 'create') {
      await fetch('/api/spreads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else if (editorMode === 'edit' && editingId) {
      await fetch('/api/spreads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...payload }),
      })
    }

    setSaving(false)
    resetEditor()
    fetchSpreads()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/spreads?id=${id}`, { method: 'DELETE' })
    fetchSpreads()
  }

  if (loading) {
    return (
      <main className="max-w-content mx-auto px-6 py-10 flex items-center justify-center min-h-[50vh]">
        <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
      </main>
    )
  }

  return (
    <main className="max-w-content mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl">Spread Templates</h1>
          <p className="mt-1 font-body text-sm text-[var(--color-text-muted)]">
            Create and manage your spread layouts.
          </p>
        </div>
        {editorMode === 'closed' && (
          <Button
            onClick={openCreate}
            className="bg-forest text-parchment hover:bg-forest-deep font-body"
          >
            <Plus size={16} strokeWidth={1.5} className="mr-2" />
            New Spread
          </Button>
        )}
      </div>

      {/* Editor */}
      {editorMode !== 'closed' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl">
              {editorMode === 'create' ? 'Create Spread' : 'Edit Spread'}
            </h2>
            <button
              onClick={resetEditor}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <Label className="font-body text-sm">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Three Card Spread"
                className="mt-1 font-body"
              />
            </div>
            <div>
              <Label className="font-body text-sm">Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this spread used for?"
                className="mt-1 font-body"
                rows={2}
              />
            </div>
          </div>

          <div className="mb-6">
            <Label className="font-body text-sm mb-2 block">
              Positions ({positions.length})
            </Label>
            <SpreadCanvas positions={positions} onChange={setPositions} />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetEditor} className="font-body">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !name.trim() || positions.length === 0}
              className="bg-forest text-parchment hover:bg-forest-deep font-body"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Spread'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Spread List */}
      {spreads.length === 0 && editorMode === 'closed' ? (
        <div className="text-center py-16">
          <LayoutGrid
            size={24}
            strokeWidth={1.5}
            className="mx-auto mb-4 text-[var(--color-text-faint)]"
          />
          <p className="font-body text-[var(--color-text-muted)]">
            No spreads yet. Create your first layout.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spreads.map((spread) => (
            <div
              key={spread.id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 transition-all duration-200 hover:border-sage"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-body text-lg font-semibold text-[var(--color-text)]">
                    {spread.name}
                  </h3>
                  {spread.description && (
                    <p className="mt-1 font-body text-sm text-[var(--color-text-muted)]">
                      {spread.description}
                    </p>
                  )}
                  <p className="mt-2 font-body text-xs text-[var(--color-text-faint)] uppercase tracking-wider">
                    {spread.positions.length} position
                    {spread.positions.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(spread)}
                    className="p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors"
                  >
                    <Pencil size={16} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => handleDelete(spread.id)}
                    className="p-2 rounded-md text-[var(--color-text-muted)] hover:text-blush hover:bg-blush/10 transition-colors"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Position labels */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[...spread.positions]
                  .sort((a, b) => a.order - b.order)
                  .map((pos) => (
                    <span
                      key={pos.id}
                      className="inline-block rounded-sm bg-[var(--color-accent-subtle)] px-2 py-0.5 font-body text-xs text-umber"
                    >
                      {pos.label}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
