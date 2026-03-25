import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  message: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ icon: Icon, message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <Icon size={32} strokeWidth={1} className="text-warm-grey" />
      <p className="font-body text-lg italic text-warm-grey text-center max-w-md">
        {message}
      </p>
      {actionLabel && actionHref && (
        <Button asChild variant="outline" className="font-body mt-2">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
