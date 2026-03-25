"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ConfirmDialog"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface DeleteBlendButtonProps {
  blendId: string
}

export default function DeleteBlendButton({ blendId }: DeleteBlendButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function confirmDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/herbology?id=${blendId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Blend deleted")
        router.push("/herbology/blends")
      } else {
        toast.error("Failed to delete blend")
      }
    } catch {
      toast.error("Failed to delete blend")
    } finally {
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowConfirm(true)}
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

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Delete this blend?"
        description="This action cannot be undone."
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  )
}
