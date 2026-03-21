'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MoonPhaseIcon from '@/components/MoonPhaseIcon'
import { computeMoonPhase } from '@/lib/moon'
import type { MoonPhaseData } from '@/lib/types'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export default function MoonCalendar() {
  const today = new Date()
  const todayStr = toDateString(today)

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [phases, setPhases] = useState<Map<string, MoonPhaseData>>(new Map())
  const [loading, setLoading] = useState(false)

  // Compute the grid for this month
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = firstDay.getDay() // 0=Sunday
  const daysInMonth = lastDay.getDate()

  const startStr = toDateString(firstDay)
  const endStr = toDateString(lastDay)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function fetchPhases() {
      try {
        const res = await fetch(`/api/moon/phase?start=${startStr}&end=${endStr}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data: MoonPhaseData[] = await res.json()
        if (!cancelled) {
          const map = new Map<string, MoonPhaseData>()
          for (const d of data) {
            map.set(d.date, d)
          }
          setPhases(map)
        }
      } catch {
        // Fall back to local computation
        if (!cancelled) {
          const map = new Map<string, MoonPhaseData>()
          for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d)
            const phaseData = computeMoonPhase(date)
            map.set(phaseData.date, phaseData)
          }
          setPhases(map)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPhases()
    return () => { cancelled = true }
  }, [startStr, endStr, year, month, daysInMonth])

  const monthLabel = new Date(year, month).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  function goBack() {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  function goForward() {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  // Build the calendar grid cells
  const cells: Array<{ day: number; dateStr: string } | null> = []
  for (let i = 0; i < startDow; i++) {
    cells.push(null) // empty cells before month starts
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = toDateString(new Date(year, month, d))
    cells.push({ day: d, dateStr })
  }

  return (
    <div className="surface-gradient border border-[var(--color-border)] rounded-lg p-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="font-body text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
        </Button>
        <h3 className="font-display text-xl text-[var(--color-text)]">
          {monthLabel}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={goForward}
          className="font-body text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <ChevronRight size={18} strokeWidth={1.5} />
        </Button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className="text-center font-body text-xs uppercase tracking-wider text-[var(--color-text-faint)] py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) {
              return <div key={`empty-${i}`} className="aspect-square" />
            }

            const phase = phases.get(cell.dateStr)
            const isToday = cell.dateStr === todayStr

            return (
              <div
                key={cell.dateStr}
                className={`aspect-square flex flex-col items-center justify-center gap-0.5 rounded-md transition-colors ${
                  isToday
                    ? 'bg-[var(--color-primary-subtle)] ring-1 ring-[var(--color-accent)]'
                    : 'hover:bg-[var(--color-surface-raised)]'
                }`}
              >
                <span
                  className={`font-body text-xs ${
                    isToday
                      ? 'font-medium text-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {cell.day}
                </span>
                {phase && (
                  <MoonPhaseIcon
                    illumination={phase.illumination}
                    isWaxing={phase.is_waxing}
                    size={20}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
