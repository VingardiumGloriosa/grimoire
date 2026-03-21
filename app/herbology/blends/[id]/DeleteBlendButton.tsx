"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"

interface DeleteBlendButtonProps {
  blendId: string
}

export default function DeleteBlendButton({ blendId }: DeleteBlendButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("Delete this blend? This cannot be undone.")) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/herbology?id=${blendId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.push("/herbology/blends")
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDelete}
      disabled={deleting}
      className="font-body text-blush border-blush/30 hover:bg-blush/10 hover:text-blush"
    >
      {deleting ? (
        <Loader2 size={14} className="mr-2 animate-spin" />
      ) : (
        <Trash2 size={14} strokeWidth={1.5} className="mr-2" />
      )}
      Delete Blend
    </Button>
  )
}
