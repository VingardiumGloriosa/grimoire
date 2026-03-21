'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, Trash2 } from 'lucide-react'
import type { FieldConfig } from '@/lib/admin-tables'
import TextField from './fields/TextField'
import NumberField from './fields/NumberField'
import BooleanField from './fields/BooleanField'
import SelectField from './fields/SelectField'
import TagsField from './fields/TagsField'
import JsonField from './fields/JsonField'

interface RecordFormProps {
  fields: FieldConfig[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
  onSave: () => void
  onCancel: () => void
  onDelete?: () => void
  saving: boolean
  isNew: boolean
}

export default function RecordForm({
  fields,
  values,
  onChange,
  onSave,
  onCancel,
  onDelete,
  saving,
  isNew,
}: RecordFormProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  function renderField(config: FieldConfig) {
    const val = values[config.key]

    switch (config.type) {
      case 'text':
      case 'textarea':
        return (
          <TextField
            key={config.key}
            config={config}
            value={(val as string) ?? ''}
            onChange={(v) => onChange(config.key, v)}
          />
        )
      case 'number':
        return (
          <NumberField
            key={config.key}
            config={config}
            value={(val as number) ?? ''}
            onChange={(v) => onChange(config.key, v)}
          />
        )
      case 'boolean':
        return (
          <BooleanField
            key={config.key}
            config={config}
            value={!!val}
            onChange={(v) => onChange(config.key, v)}
          />
        )
      case 'select':
        return (
          <SelectField
            key={config.key}
            config={config}
            value={(val as string) ?? ''}
            onChange={(v) => onChange(config.key, v)}
          />
        )
      case 'tags':
        return (
          <TagsField
            key={config.key}
            config={config}
            value={(val as string[]) ?? []}
            onChange={(v) => onChange(config.key, v)}
          />
        )
      case 'json':
        return (
          <JsonField
            key={config.key}
            config={config}
            value={val ?? {}}
            onChange={(v) => onChange(config.key, v)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {fields.map(renderField)}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        <div>
          {onDelete && !isNew && (
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--color-blush)] hover:text-[var(--color-blush)] hover:bg-[var(--color-blush)]/10 font-body"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[var(--color-surface)]">
                <DialogHeader>
                  <DialogTitle className="font-display">Confirm Deletion</DialogTitle>
                  <DialogDescription className="font-body text-sm">
                    This will permanently delete this record. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteOpen(false)}
                    className="font-body"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleteOpen(false)
                      onDelete()
                    }}
                    className="font-body"
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={saving}
            className="font-body"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={saving}
            className="bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]/90 font-body"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : isNew ? (
              'Create'
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
