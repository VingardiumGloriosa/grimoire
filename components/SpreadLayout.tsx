"use client"

import { useMemo } from "react"
import type { SpreadPosition, ReadingCard } from "@/lib/types"
import SpreadPositionSlot from "@/components/SpreadPositionSlot"

interface SpreadLayoutProps {
  positions: SpreadPosition[]
  selectedCards: ReadingCard[]
  activePositionIndex: number
  onPositionClick: (index: number) => void
}

export default function SpreadLayout({
  positions,
  selectedCards,
  activePositionIndex,
  onPositionClick,
}: SpreadLayoutProps) {
  const grid = useMemo(() => {
    if (positions.length === 0) return { columns: 1, rows: 1, cells: [] }

    const xs = positions.map((p) => p.x)
    const ys = positions.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)

    const columns = Math.round((maxX - minX) * 2) + 1
    const rows = Math.round((maxY - minY) * 2) + 1

    const cells = positions.map((pos, index) => ({
      position: pos,
      index,
      gridColumn: Math.round((pos.x - minX) * 2) + 1,
      gridRow: Math.round((pos.y - minY) * 2) + 1,
    }))

    return { columns, rows, cells }
  }, [positions])

  function getCardForPosition(pos: SpreadPosition): ReadingCard | undefined {
    return selectedCards.find((c) => c.position_label === pos.label)
  }

  // Scale cell size based on how many columns we need to fit
  const cellSize = grid.columns <= 3 ? "80px" : grid.columns <= 5 ? "68px" : "56px"

  return (
    <div className="reading-cloth flex justify-center rounded-lg py-6 px-4">
      <div
        className="grid w-fit gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${grid.columns}, ${cellSize})`,
          gridTemplateRows: `repeat(${grid.rows}, auto)`,
        }}
      >
        {grid.cells.map(({ position, index, gridColumn, gridRow }) => (
          <div key={position.id} style={{ gridColumn, gridRow }}>
            <SpreadPositionSlot
              position={position}
              card={getCardForPosition(position)}
              isActive={index === activePositionIndex}
              onClick={() => onPositionClick(index)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
