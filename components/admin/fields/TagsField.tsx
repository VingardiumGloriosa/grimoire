'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { FieldConfig } from '@/lib/admin-tables'

interface TagsFieldProps {
  config: FieldConfig
  value: string[] | number[]
  onChange: (value: string[] | number[]) => void
}

export default function TagsField({ config, value, onChange }: TagsFieldProps) {
  const [input, setInput] = useState('')
  const id = `field-${config.key}`
  const tags = Array.isArray(value) ? value : []

  function addTag() {
    const trimmed = input.trim()
    if (!trimmed) return
    if (tags.includes(trimmed as never)) {
      setInput('')
      return
    }
    onChange([...tags, trimmed] as string[] | number[])
    setInput('')
  }

  function removeTag(index: number) {
    const next = [...tags]
    next.splice(index, 1)
    onChange(next as string[] | number[])
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="font-body text-sm">
        {config.label}
        {config.required && <span className="text-[var(--color-blush)] ml-0.5">*</span>}
      </Label>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <Badge
              key={`${tag}-${i}`}
              variant="outline"
              className="font-body text-xs border-[var(--color-border)] bg-[var(--color-surface)] gap-1 pr-1"
            >
              {String(tag)}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="ml-0.5 hover:text-[var(--color-blush)] transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Input
        id={id}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={config.placeholder ?? 'Type and press Enter'}
        className="bg-[var(--color-bg)] border-[var(--color-border)] font-body text-sm"
      />
    </div>
  )
}
