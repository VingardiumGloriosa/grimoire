'use client'

import { useState, useCallback, useEffect } from 'react'
import type { SynthesisTemplate } from '@/lib/types'
import type { AdminSection } from '@/lib/admin-tables'
import { ADMIN_SECTIONS } from '@/lib/admin-tables'
import { createClient } from '@/lib/supabase'
import AdminSidebar from './AdminSidebar'
import ModulesPanel from './ModulesPanel'
import TemplateEditor from './TemplateEditor'
import ReferenceDataPanel from './ReferenceDataPanel'

interface AdminDashboardProps {
  adminPassword: string
}

export default function AdminDashboard({ adminPassword }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('modules')

  // Templates state (reused from original admin page)
  const [templates, setTemplates] = useState<SynthesisTemplate[]>([])
  const [templatesLoaded, setTemplatesLoaded] = useState(false)

  const fetchTemplates = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('tarot_synthesis_templates')
      .select('*')
      .order('role')
    setTemplates((data as SynthesisTemplate[]) ?? [])
    setTemplatesLoaded(true)
  }, [])

  // Load templates when templates section is first activated
  useEffect(() => {
    if (activeSection === 'templates' && !templatesLoaded) {
      fetchTemplates()
    }
  }, [activeSection, templatesLoaded, fetchTemplates])

  const handleTemplateSave = async (id: string, template: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/interpret', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword,
        },
        body: JSON.stringify({ id, template }),
      })
      if (res.ok) {
        fetchTemplates()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  function renderPanel() {
    // Modules: special panel
    if (activeSection === 'modules') {
      return <ModulesPanel adminPassword={adminPassword} />
    }

    // Templates: existing TemplateEditor
    if (activeSection === 'templates') {
      if (!templatesLoaded) {
        return (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-text-muted)] border-t-transparent" />
          </div>
        )
      }
      return <TemplateEditor templates={templates} onSave={handleTemplateSave} />
    }

    // Generic reference data panel
    const section = ADMIN_SECTIONS.find((s) => s.key === activeSection)
    if (section?.config) {
      return (
        <ReferenceDataPanel
          key={section.key}
          config={section.config}
          adminPassword={adminPassword}
        />
      )
    }

    return null
  }

  const currentSection = ADMIN_SECTIONS.find((s) => s.key === activeSection)

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex-1 p-6 overflow-y-auto">
        {/* Section header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl text-[var(--color-text)]">
            {currentSection?.label ?? 'Admin'}
          </h1>
          {currentSection?.config?.description && (
            <p className="mt-1 font-body text-sm text-[var(--color-text-muted)]">
              {currentSection.config.description}
            </p>
          )}
          {activeSection === 'templates' && (
            <p className="mt-1 font-body text-sm text-[var(--color-text-muted)]">
              Edit the narrative templates used to generate reading interpretations.
            </p>
          )}
        </div>

        {renderPanel()}
      </div>
    </div>
  )
}
