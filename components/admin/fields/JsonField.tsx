'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import TagsField from './TagsField'
import type { FieldConfig } from '@/lib/admin-tables'

interface JsonFieldProps {
  config: FieldConfig
  value: Record<string, unknown> | unknown
  onChange: (value: Record<string, unknown>) => void
}

// Known structured shapes: render sub-editors instead of raw JSON
const KNOWN_SHAPES: Record<string, string[]> = {
  correspondences: ['deities', 'zodiac', 'festivals'],
}

export default function JsonField({ config, value, onChange }: JsonFieldProps) {
  const knownKeys = KNOWN_SHAPES[config.key]
  const objValue = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>

  // Structured sub-editor for known shapes
  if (knownKeys) {
    return (
      <div className="space-y-3">
        <Label className="font-body text-sm font-semibold">
          {config.label}
        </Label>
        <div className="pl-3 border-l-2 border-[var(--color-border)] space-y-3">
          {knownKeys.map((subKey) => {
            const subValue = (Array.isArray(objValue[subKey]) ? objValue[subKey] : []) as string[]
            return (
              <TagsField
                key={subKey}
                config={{
                  key: `${config.key}.${subKey}`,
                  label: subKey.charAt(0).toUpperCase() + subKey.slice(1),
                  type: 'tags',
                  placeholder: `Add ${subKey.slice(0, -1)}`,
                }}
                value={subValue}
                onChange={(newTags) => {
                  onChange({ ...objValue, [subKey]: newTags })
                }}
              />
            )
          })}
        </div>
      </div>
    )
  }

  // Fallback: raw JSON textarea
  return <RawJsonField config={config} value={value} onChange={onChange} />
}

function RawJsonField({ config, value, onChange }: JsonFieldProps) {
  const [raw, setRaw] = useState(() => {
    try {
      return JSON.stringify(value ?? {}, null, 2)
    } catch {
      return '{}'
    }
  })
  const [parseError, setParseError] = useState<string | null>(null)

  function handleChange(text: string) {
    setRaw(text)
    try {
      const parsed = JSON.parse(text)
      setParseError(null)
      onChange(parsed)
    } catch {
      setParseError('Invalid JSON')
    }
  }

  return (
    <div className="space-y-1.5">
      <Label className="font-body text-sm">
        {config.label}
        {config.required && <span className="text-[var(--color-blush)] ml-0.5">*</span>}
      </Label>
      <Textarea
        value={raw}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={config.placeholder ?? '{}'}
        className="bg-[var(--color-bg)] border-[var(--color-border)] font-mono text-xs min-h-[120px]"
      />
      {parseError && (
        <p className="font-body text-xs text-[var(--color-blush)]">{parseError}</p>
      )}
    </div>
  )
}
