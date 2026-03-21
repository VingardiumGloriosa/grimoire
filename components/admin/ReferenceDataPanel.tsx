'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, ArrowLeft } from 'lucide-react'
import type { TableConfig } from '@/lib/admin-tables'
import DataTable from './DataTable'
import RecordForm from './RecordForm'

type ViewMode = 'list' | 'edit' | 'create'

interface ReferenceDataPanelProps {
  config: TableConfig
  adminPassword: string
}

export default function ReferenceDataPanel({ config, adminPassword }: ReferenceDataPanelProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null)
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/${config.table}`, {
        headers: { 'X-Admin-Password': adminPassword },
      })
      if (!res.ok) throw new Error('Failed to fetch records')
      const data = await res.json()
      setRows(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [config.table, adminPassword])

  useEffect(() => {
    fetchRows()
  }, [fetchRows])

  function handleRowClick(row: Record<string, unknown>) {
    setSelectedRow(row)
    setFormValues({ ...row })
    setView('edit')
    setError(null)
  }

  function handleCreate() {
    setSelectedRow(null)
    // Initialize defaults
    const defaults: Record<string, unknown> = {}
    config.fields.forEach((f) => {
      switch (f.type) {
        case 'boolean': defaults[f.key] = false; break
        case 'tags': defaults[f.key] = []; break
        case 'json': defaults[f.key] = {}; break
        case 'number': defaults[f.key] = 0; break
        default: defaults[f.key] = ''
      }
    })
    setFormValues(defaults)
    setView('create')
    setError(null)
  }

  function handleCancel() {
    setView('list')
    setSelectedRow(null)
    setFormValues({})
    setError(null)
  }

  function handleFieldChange(key: string, value: unknown) {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const isNew = view === 'create'
    const method = isNew ? 'POST' : 'PUT'
    const body = isNew ? formValues : { id: selectedRow?.id, ...formValues }

    try {
      const res = await fetch(`/api/admin/${config.table}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      await fetchRows()
      setView('list')
      setSelectedRow(null)
      setFormValues({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedRow?.id) return
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/admin/${config.table}?id=${selectedRow.id}`,
        {
          method: 'DELETE',
          headers: { 'X-Admin-Password': adminPassword },
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }

      await fetchRows()
      setView('list')
      setSelectedRow(null)
      setFormValues({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-text-muted)]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {view !== 'list' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="font-body text-[var(--color-text-muted)]"
            >
              <ArrowLeft className="h-4 w-4 mr-1" strokeWidth={1.5} />
              Back
            </Button>
          )}
          <h3 className="font-body text-sm text-[var(--color-text-muted)]">
            {view === 'list'
              ? `${rows.length} record${rows.length !== 1 ? 's' : ''}`
              : view === 'create'
                ? 'New Record'
                : `Editing: ${String(selectedRow?.[config.nameField] ?? '')}`}
          </h3>
        </div>
        {view === 'list' && config.canCreate && (
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-[var(--color-primary)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]/90 font-body"
          >
            <Plus className="h-4 w-4 mr-1" strokeWidth={1.5} />
            Add New
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-[var(--color-blush)]/10 border border-[var(--color-blush)]/20 px-4 py-3">
          <p className="font-body text-sm text-[var(--color-blush)]">{error}</p>
        </div>
      )}

      {/* Content */}
      {view === 'list' ? (
        <DataTable
          columns={config.columns}
          rows={rows}
          nameField={config.nameField}
          onRowClick={handleRowClick}
        />
      ) : (
        <RecordForm
          fields={config.fields}
          values={formValues}
          onChange={handleFieldChange}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={config.canDelete ? handleDelete : undefined}
          saving={saving}
          isNew={view === 'create'}
        />
      )}
    </div>
  )
}
