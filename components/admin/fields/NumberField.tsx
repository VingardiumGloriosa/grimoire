'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FieldConfig } from '@/lib/admin-tables'

interface NumberFieldProps {
  config: FieldConfig
  value: number | string
  onChange: (value: number) => void
}

export default function NumberField({ config, value, onChange }: NumberFieldProps) {
  const id = `field-${config.key}`

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="font-body text-sm">
        {config.label}
        {config.required && <span className="text-[var(--color-blush)] ml-0.5">*</span>}
      </Label>
      <Input
        id={id}
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={config.placeholder}
        readOnly={config.readOnly}
        className="bg-[var(--color-bg)] border-[var(--color-border)] font-body text-sm"
      />
    </div>
  )
}
