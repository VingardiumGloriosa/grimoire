'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DreamEntryActionsProps {
  entryId: string
}

export default function DreamEntryActions({ entryId }: DreamEntryActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function confirmDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/dreams/entries?id=${entryId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success("Dream entry deleted")
        router.push('/dreams')
      } else {
        toast.error("Failed to delete dream entry")
      }
    } catch {
      toast.error("Failed to delete dream entry")
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dreams/new`)}
        className="font-body text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)]"
      >
        <Pencil className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={deleting}
        className="font-body text-[var(--color-blush)] hover:bg-[var(--color-blush)]/10"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
        )}
        Delete
      </Button>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Delete this dream entry?"
        description="This action cannot be undone."
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  )
}
