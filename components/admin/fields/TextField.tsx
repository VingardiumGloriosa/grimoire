'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { FieldConfig } from '@/lib/admin-tables'

interface TextFieldProps {
  config: FieldConfig
  value: string
  onChange: (value: string) => void
}

export default function TextField({ config, value, onChange }: TextFieldProps) {
  const id = `field-${config.key}`

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="font-body text-sm">
        {config.label}
        {config.required && <span className="text-[var(--color-blush)] ml-0.5">*</span>}
      </Label>
      {config.type === 'textarea' ? (
        <Textarea
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.placeholder}
          readOnly={config.readOnly}
          className="bg-[var(--color-bg)] border-[var(--color-border)] font-body text-sm min-h-[100px]"
        />
      ) : (
        <Input
          id={id}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.placeholder}
          readOnly={config.readOnly}
          className="bg-[var(--color-bg)] border-[var(--color-border)] font-body text-sm"
        />
      )}
    </div>
  )
}
