import { useId } from "react"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  label: string
  required?: boolean
  error?: string
  hint?: string
  htmlFor?: string
  children: React.ReactNode
}

export default function FormField({ label, required, error, hint, htmlFor, children }: FormFieldProps) {
  const generatedId = useId()
  const fieldId = htmlFor || generatedId
  const errorId = `${fieldId}-error`
  const hintId = `${fieldId}-hint`

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="font-body text-sm font-semibold text-charcoal">
        {label}
        {required && <span className="text-blush ml-0.5">*</span>}
        {!required && <span className="text-warm-grey font-normal ml-1.5 text-xs">(optional)</span>}
      </Label>
      {children}
      {hint && !error && (
        <p id={hintId} className="font-body text-xs text-warm-grey">{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="font-body text-xs text-blush">{error}</p>
      )}
    </div>
  )
}
