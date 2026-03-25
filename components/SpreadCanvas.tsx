"use client"

import { useState, useCallback, useRef } from "react"
import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { SpreadPosition } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Pencil, X, Check } from "lucide-react"

interface SpreadCanvasProps {
  positions: SpreadPosition[]
  onChange: (positions: SpreadPosition[]) => void
}

// ─── Draggable Position Element ───

interface DraggablePositionProps {
  position: SpreadPosition
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  isEditing: boolean
  editLabel: string
  onEditLabelChange: (label: string) => void
  onEditSave: () => void
  onEditCancel: () => void
}

function DraggablePosition({
  position,
  onEdit,
  onDelete,
  isEditing,
  editLabel,
  onEditLabelChange,
  onEditSave,
  onEditCancel,
}: DraggablePositionProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: position.id,
    })

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    zIndex: isDragging ? 50 : 10,
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
  }

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div
        className={`min-w-[120px] rounded-lg border bg-[var(--color-surface)] p-3 shadow-sm transition-shadow ${
          isDragging
            ? "border-gold shadow-[0_0_12px_rgb(var(--color-accent-ch) / 0.3)]"
            : "border-[var(--color-border)] hover:border-sage"
        }`}
      >
        {isEditing ? (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Input
              value={editLabel}
              onChange={(e) => onEditLabelChange(e.target.value)}
              className="h-7 text-xs bg-[var(--color-surface)] border-[var(--color-border)] font-body"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") onEditSave()
                if (e.key === "Escape") onEditCancel()
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditSave()
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 text-forest hover:text-forest-deep"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditCancel()
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 text-warm-grey hover:text-charcoal"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-subtle text-xs font-semibold text-umber">
              {position.order}
            </span>
            <span className="font-body text-sm text-charcoal flex-1 truncate">
              {position.label}
            </span>
            <div className="flex gap-0.5">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(position.id)
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-1 text-warm-grey hover:text-charcoal"
              >
                <Pencil className="h-3 w-3" strokeWidth={1.5} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(position.id)
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-1 text-warm-grey hover:text-blush"
              >
                <Trash2 className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Canvas ───

export default function SpreadCanvas({
  positions,
  onChange,
}: SpreadCanvasProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newLabel, setNewLabel] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const canvasRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const deltaXPercent = (delta.x / rect.width) * 100
      const deltaYPercent = (delta.y / rect.height) * 100

      const updated = positions.map((pos) => {
        if (pos.id === active.id) {
          return {
            ...pos,
            x: Math.max(0, Math.min(85, pos.x + deltaXPercent)),
            y: Math.max(0, Math.min(85, pos.y + deltaYPercent)),
          }
        }
        return pos
      })

      onChange(updated)
    },
    [positions, onChange]
  )

  function handleAddPosition() {
    if (!newLabel.trim()) return

    const newPosition: SpreadPosition = {
      id: crypto.randomUUID(),
      label: newLabel.trim(),
      x: 10 + (positions.length * 15) % 70,
      y: 10 + (positions.length * 15) % 70,
      order: positions.length + 1,
    }

    onChange([...positions, newPosition])
    setNewLabel("")
    setIsAdding(false)
  }

  function handleDelete(id: string) {
    const updated = positions
      .filter((p) => p.id !== id)
      .map((p, i) => ({ ...p, order: i + 1 }))
    onChange(updated)
  }

  function handleEditStart(id: string) {
    const pos = positions.find((p) => p.id === id)
    if (!pos) return
    setEditingId(id)
    setEditLabel(pos.label)
  }

  function handleEditSave() {
    if (!editingId || !editLabel.trim()) return
    const updated = positions.map((p) =>
      p.id === editingId ? { ...p, label: editLabel.trim() } : p
    )
    onChange(updated)
    setEditingId(null)
    setEditLabel("")
  }

  function handleEditCancel() {
    setEditingId(null)
    setEditLabel("")
  }

  return (
    <div className="space-y-4">
      {/* Canvas Area */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div
          ref={canvasRef}
          className="relative rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
          style={{ minHeight: "400px" }}
        >
          {positions.length === 0 && !isAdding && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-body text-warm-grey text-sm">
                Add positions to build your spread layout.
              </p>
            </div>
          )}

          {positions.map((position) => (
            <DraggablePosition
              key={position.id}
              position={position}
              onEdit={handleEditStart}
              onDelete={handleDelete}
              isEditing={editingId === position.id}
              editLabel={editLabel}
              onEditLabelChange={setEditLabel}
              onEditSave={handleEditSave}
              onEditCancel={handleEditCancel}
            />
          ))}
        </div>
      </DndContext>

      {/* Add Position Controls */}
      <div className="flex gap-3 items-end">
        {isAdding ? (
          <>
            <div className="flex-1">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Position label, e.g. 'Past', 'Present', 'Future'"
                className="bg-[var(--color-surface)] border-[var(--color-border)] font-body italic placeholder:text-[var(--color-text-faint)]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddPosition()
                  if (e.key === "Escape") {
                    setIsAdding(false)
                    setNewLabel("")
                  }
                }}
              />
            </div>
            <Button
              onClick={handleAddPosition}
              disabled={!newLabel.trim()}
              className="bg-forest text-parchment hover:bg-forest-deep font-body"
            >
              Add
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false)
                setNewLabel("")
              }}
              className="font-body"
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="font-body border-[var(--color-border)] text-forest hover:bg-sage-mist"
          >
            <Plus className="h-4 w-4 mr-2" strokeWidth={1.5} />
            Add Position
          </Button>
        )}
      </div>
    </div>
  )
}
