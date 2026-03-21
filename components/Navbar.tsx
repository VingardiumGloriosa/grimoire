import Link from "next/link"
import {
  Sparkles,
  BookOpen,
  Library,
  LayoutGrid,
  Leaf,
  Star,
  Gem,
  Hash,
  Moon,
  CloudMoon,
  Menu,
} from "lucide-react"

const tarotLinks = [
  { href: "/reading/new", label: "New Reading", icon: Sparkles },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/cards", label: "Cards", icon: Library },
  { href: "/spreads", label: "Spreads", icon: LayoutGrid },
]

const moduleLinks = [
  { href: "/herbology", label: "Herbs", icon: Leaf },
  { href: "/astrology", label: "Astrology", icon: Star },
  { href: "/crystals", label: "Crystals", icon: Gem },
  { href: "/numerology", label: "Numbers", icon: Hash },
  { href: "/moon", label: "Moon", icon: Moon },
  { href: "/dreams", label: "Dreams", icon: CloudMoon },
]

export default function Navbar() {
  return (
    <header className="navbar-border sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-content items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="font-wordmark text-xl tracking-wide text-[var(--color-text)] hover:text-forest transition-colors"
          style={{ textShadow: '0 0 24px rgba(184,150,62,0.15)' }}
        >
          Grimoire
        </Link>

        <ul className="flex items-center gap-0.5">
          {/* Tarot links — always visible */}
          {tarotLinks.map((link) => {
            const Icon = link.icon
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 font-body text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]"
                >
                  <Icon size={14} strokeWidth={1.5} />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              </li>
            )
          })}

          {/* Divider */}
          <li className="hidden lg:block mx-1 h-4 w-px bg-[var(--color-border)]" aria-hidden="true" />

          {/* Module links — visible on larger screens */}
          {moduleLinks.map((link) => {
            const Icon = link.icon
            return (
              <li key={link.href} className="hidden lg:block">
                <Link
                  href={link.href}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 font-body text-xs text-[var(--color-text-faint)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-muted)]"
                >
                  <Icon size={13} strokeWidth={1.5} />
                  <span>{link.label}</span>
                </Link>
              </li>
            )
          })}

          {/* Mobile module menu indicator */}
          <li className="lg:hidden">
            <Link
              href="/"
              className="flex items-center gap-1 rounded-md px-2 py-1.5 font-body text-xs text-[var(--color-text-faint)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-muted)]"
            >
              <Menu size={14} strokeWidth={1.5} />
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
