'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Loader2 } from 'lucide-react'

interface DreamEntryActionsProps {
  entryId: string
}

export default function DreamEntryActions({ entryId }: DreamEntryActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this dream entry? This cannot be undone.')) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/dreams/entries?id=${entryId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.push('/dreams')
      }
    } finally {
      setDeleting(false)
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
        onClick={handleDelete}
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
    </div>
  )
}
