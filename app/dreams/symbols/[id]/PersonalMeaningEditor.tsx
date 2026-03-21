'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DreamUserSymbol } from '@/lib/types'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Pencil, Check, Loader2 } from 'lucide-react'

interface PersonalMeaningEditorProps {
  symbolId: string
  symbolName: string
  existingMeaning: DreamUserSymbol | null
}

export default function PersonalMeaningEditor({
  symbolId,
  symbolName,
  existingMeaning,
}: PersonalMeaningEditorProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [meaning, setMeaning] = useState(existingMeaning?.personal_meaning ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!meaning.trim()) return
    setSaving(true)

    try {
      const res = await fetch('/api/dreams/symbols', {
        method: existingMeaning ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existingMeaning?.id,
          core_symbol_id: symbolId,
          symbol_name: symbolName,
          personal_meaning: meaning.trim(),
        }),
      })

      if (res.ok) {
        setSaved(true)
        setEditing(false)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-3 border-t border-[var(--color-border)] pt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-[var(--color-text)]">
          Personal Meaning
        </h2>
        {!editing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(true)}
            className="font-body text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]"
          >
            <Pencil className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
            {existingMeaning ? 'Edit' : 'Add'}
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <Textarea
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="What does this symbol mean to you personally?"
            className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)] min-h-[100px]"
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(false)
                setMeaning(existingMeaning?.personal_meaning ?? '')
              }}
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !meaning.trim()}
              className="bg-forest text-parchment hover:bg-forest-deep font-body"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {existingMeaning ? (
            <p className="font-body text-base text-[var(--color-text)] leading-relaxed italic">
              {existingMeaning.personal_meaning}
            </p>
          ) : (
            <p className="font-body text-sm text-[var(--color-text-muted)] italic">
              No personal meaning recorded yet. What does this symbol evoke for you?
            </p>
          )}
          {saved && (
            <p className="flex items-center gap-1 mt-2 font-body text-xs text-[var(--color-primary)]">
              <Check className="h-3 w-3" strokeWidth={1.5} />
              Saved
            </p>
          )}
        </div>
      )}
    </section>
  )
}
