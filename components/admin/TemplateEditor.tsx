"use client"

import { useState } from "react"
import type { SynthesisTemplate } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Check, X } from "lucide-react"

// Variables available for each template role
const ROLE_VARIABLES: Record<string, string[]> = {
  intro: [
    "spread_name",
    "card_count",
    "major_arcana_count",
    "intention",
    "mood",
  ],
  major_arcana_note: [
    "major_arcana_count",
    "spread_name",
    "card_count",
    "intention",
    "mood",
  ],
  position_block: [
    "position_label",
    "card_name",
    "orientation",
    "meaning",
    "keywords",
    "fortune_telling",
    "questions",
    "archetype",
    "numerology",
    "elemental",
    "spread_name",
    "card_count",
    "major_arcana_count",
    "intention",
    "mood",
  ],
  reversed_note: [
    "position_label",
    "card_name",
    "orientation",
    "meaning",
    "keywords",
    "fortune_telling",
    "questions",
    "archetype",
    "numerology",
    "elemental",
    "spread_name",
  ],
  closing: [
    "spread_name",
    "card_count",
    "major_arcana_count",
    "intention",
    "mood",
  ],
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  intro:
    "Opening paragraph of the synthesis. Sets the scene for the reading.",
  major_arcana_note:
    "Appended to the intro when major arcana cards are present.",
  position_block:
    "Repeated for each card position in the spread. The core of the reading narrative.",
  reversed_note:
    "Appended to a position block when that card is drawn reversed.",
  closing:
    "Final paragraph. A gentle closing thought for the reader.",
}

interface TemplateEditorProps {
  templates: SynthesisTemplate[]
  onSave: (id: string, template: string) => Promise<boolean>
}

export default function TemplateEditor({
  templates,
  onSave,
}: TemplateEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedTemplate, setEditedTemplate] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [localTemplates, setLocalTemplates] =
    useState<SynthesisTemplate[]>(templates)

  function startEditing(template: SynthesisTemplate) {
    setEditingId(template.id)
    setEditedTemplate(template.template)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditedTemplate("")
  }

  async function saveTemplate(template: SynthesisTemplate) {
    setSaving(true)
    try {
      const success = await onSave(template.id, editedTemplate)

      if (success) {
        // Update local state
        setLocalTemplates((prev) =>
          prev.map((t) =>
            t.id === template.id ? { ...t, template: editedTemplate } : t
          )
        )
        setEditingId(null)
        setEditedTemplate("")
        setSavedId(template.id)
        setTimeout(() => setSavedId(null), 2000)
      }
    } catch {
      // Silently handle — user can retry
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="font-display text-2xl text-charcoal">
          Synthesis Templates
        </h2>
        <p className="font-body text-sm text-warm-grey">
          Edit the narrative templates used to generate reading interpretations.
          Use {"{{variable_name}}"} syntax for interpolation.
        </p>
      </div>

      {localTemplates.map((template) => {
        const isEditing = editingId === template.id
        const roleVars = ROLE_VARIABLES[template.role] ?? []
        const roleDesc = ROLE_DESCRIPTIONS[template.role] ?? ""

        return (
          <Card
            key={template.id}
            className="border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg"
          >
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-body text-lg font-semibold text-charcoal">
                      {template.role}
                    </h3>
                    {savedId === template.id && (
                      <span className="flex items-center gap-1 text-xs text-forest font-body">
                        <Check className="h-3 w-3" strokeWidth={1.5} />
                        Saved
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-warm-grey">
                    {roleDesc}
                  </p>
                </div>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(template)}
                    className="font-body text-forest hover:bg-sage-mist shrink-0"
                  >
                    <Pencil className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
                    Edit
                  </Button>
                )}
              </div>

              {/* Template Content */}
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editedTemplate}
                    onChange={(e) => setEditedTemplate(e.target.value)}
                    className="bg-parchment border-[var(--color-border)] font-body text-sm min-h-[120px]"
                    rows={5}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEditing}
                      className="font-body"
                    >
                      <X className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveTemplate(template)}
                      disabled={saving || editedTemplate === template.template}
                      className="bg-forest text-parchment hover:bg-forest-deep font-body"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-parchment border border-[var(--color-border)] p-4">
                  <p className="font-body text-sm text-charcoal whitespace-pre-wrap leading-relaxed">
                    {template.template}
                  </p>
                </div>
              )}

              {/* Available Variables */}
              <div className="space-y-2">
                <p className="font-body text-xs font-semibold text-warm-grey uppercase tracking-wider">
                  Available Variables
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {roleVars.map((v) => (
                    <Badge
                      key={v}
                      variant="outline"
                      className="font-body text-xs text-umber border-gold bg-gold-subtle/50 rounded-sm"
                    >
                      {`{{${v}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
