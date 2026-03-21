'use client'

import type { LucideIcon } from 'lucide-react'
import {
  Settings,
  FileText,
  Leaf,
  Gem,
  CloudMoon,
  Hash,
  Moon,
  Star,
} from 'lucide-react'
import type { AdminSection } from '@/lib/admin-tables'
import { ADMIN_SECTIONS } from '@/lib/admin-tables'

const ICON_MAP: Record<string, LucideIcon> = {
  Settings,
  FileText,
  Leaf,
  Gem,
  CloudMoon,
  Hash,
  Moon,
  Star,
}

interface AdminSidebarProps {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
}

export default function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  return (
    <nav className="w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)]/50 py-4">
      <div className="px-4 mb-4">
        <h2 className="font-display text-sm text-[var(--color-text-muted)] uppercase tracking-wider">
          Admin
        </h2>
      </div>

      <ul className="space-y-0.5 px-2">
        {ADMIN_SECTIONS.map((section) => {
          const Icon = ICON_MAP[section.icon]
          const isActive = activeSection === section.key

          return (
            <li key={section.key}>
              <button
                onClick={() => onSectionChange(section.key)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-md
                  font-body text-sm transition-colors text-left
                  ${isActive
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-l-2 border-[var(--color-primary)] -ml-[2px] pl-[14px]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
                  }
                `}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />}
                {section.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
