'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Check, X } from 'lucide-react'
import type { ColumnConfig } from '@/lib/admin-tables'

interface DataTableProps {
  columns: ColumnConfig[]
  rows: Record<string, unknown>[]
  nameField: string
  onRowClick: (row: Record<string, unknown>) => void
}

export default function DataTable({ columns, rows, nameField, onRowClick }: DataTableProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const term = search.toLowerCase()
    return rows.filter((row) => {
      const name = String(row[nameField] ?? '').toLowerCase()
      return name.includes(term)
    })
  }, [rows, search, nameField])

  function renderCell(row: Record<string, unknown>, col: ColumnConfig) {
    const val = row[col.key]

    switch (col.render) {
      case 'badge':
        if (!val) return <span className="text-[var(--color-text-muted)]">—</span>
        return (
          <Badge
            variant="outline"
            className="font-body text-xs border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5"
          >
            {String(val)}
          </Badge>
        )

      case 'boolean':
        return val ? (
          <Check className="h-4 w-4 text-[var(--color-secondary)]" strokeWidth={1.5} />
        ) : (
          <X className="h-4 w-4 text-[var(--color-text-muted)]" strokeWidth={1.5} />
        )

      case 'tags': {
        const tags = Array.isArray(val) ? val : []
        if (tags.length === 0) return <span className="text-[var(--color-text-muted)]">—</span>
        const shown = tags.slice(0, 3)
        const remaining = tags.length - shown.length
        return (
          <div className="flex flex-wrap gap-1">
            {shown.map((tag, i) => (
              <Badge
                key={i}
                variant="outline"
                className="font-body text-[10px] border-[var(--color-border)]"
              >
                {String(tag)}
              </Badge>
            ))}
            {remaining > 0 && (
              <span className="text-[10px] text-[var(--color-text-muted)] font-body">
                +{remaining}
              </span>
            )}
          </div>
        )
      }

      default: {
        const text = String(val ?? '')
        return (
          <span className="truncate max-w-[200px] block">
            {text || <span className="text-[var(--color-text-muted)]">—</span>}
          </span>
        )
      }
    }
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search by ${nameField.replace(/_/g, ' ')}...`}
          className="pl-9 bg-[var(--color-bg)] border-[var(--color-border)] font-body text-sm"
        />
      </div>

      {/* Table */}
      <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2.5 text-left font-body text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center font-body text-sm text-[var(--color-text-muted)]"
                >
                  {search ? 'No matching records.' : 'No records yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={(row.id as string) ?? i}
                  onClick={() => onRowClick(row)}
                  className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface)]/50 cursor-pointer transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 font-body text-sm">
                      {renderCell(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[var(--color-text-muted)] font-body">
        {filtered.length} of {rows.length} record{rows.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
