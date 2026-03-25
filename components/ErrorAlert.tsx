import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorAlertProps {
  message: string
  onRetry?: () => void
}

export default function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-blush/30 bg-blush/5 px-4 py-3">
      <AlertTriangle size={18} strokeWidth={1.5} className="text-blush mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <p className="font-body text-sm text-blush">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="font-body text-xs">
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}
