'use client'

import { Label } from '@/components/ui/label'
import type { FieldConfig } from '@/lib/admin-tables'

interface BooleanFieldProps {
  config: FieldConfig
  value: boolean
  onChange: (value: boolean) => void
}

export default function BooleanField({ config, value, onChange }: BooleanFieldProps) {
  const id = `field-${config.key}`

  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!value}
        onClick={() => onChange(!value)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          ${value ? 'bg-[var(--color-secondary)]' : 'bg-[var(--color-border)]'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-[var(--color-surface)] shadow-sm ring-0 transition-transform duration-200
            ${value ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
      <Label htmlFor={id} className="font-body text-sm cursor-pointer">
        {config.label}
      </Label>
    </div>
  )
}
