'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FieldConfig } from '@/lib/admin-tables'

interface SelectFieldProps {
  config: FieldConfig
  value: string
  onChange: (value: string) => void
}

export default function SelectField({ config, value, onChange }: SelectFieldProps) {
  const id = `field-${config.key}`
  const options = config.options ?? []

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="font-body text-sm">
        {config.label}
        {config.required && <span className="text-[var(--color-blush)] ml-0.5">*</span>}
      </Label>
      <Select
        value={value ?? ''}
        onValueChange={onChange}
        disabled={config.readOnly}
      >
        <SelectTrigger className="bg-[var(--color-bg)] border-[var(--color-border)] font-body text-sm">
          <SelectValue placeholder={config.placeholder ?? `Select ${config.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="bg-[var(--color-surface)] border-[var(--color-border)]">
          {options.map((opt) => (
            <SelectItem key={opt} value={opt} className="font-body text-sm">
              {opt || '(none)'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
