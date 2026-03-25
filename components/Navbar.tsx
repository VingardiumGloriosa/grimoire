"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase"
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
  X,
  User,
  LogOut,
  ChevronDown,
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
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLLIElement>(null)
  const accountTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)

  const isActive = useCallback((href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }, [pathname])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    }).catch(() => { /* auth check failure is non-critical in nav */ })
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close menus on Escape and return focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (accountOpen) {
          setAccountOpen(false)
          accountTriggerRef.current?.focus()
        }
        if (mobileOpen) {
          setMobileOpen(false)
          mobileTriggerRef.current?.focus()
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [accountOpen, mobileOpen])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserEmail(null)
    setAccountOpen(false)
    router.push("/auth")
  }

  return (
    <header className="navbar-border sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-content items-center justify-between px-6 sm:px-10 py-3">
        <Link
          href="/"
          className="font-wordmark text-xl tracking-wide text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
          style={{ textShadow: '0 0 24px rgb(var(--color-accent-ch) / 0.15)' }}
        >
          Grimoire
        </Link>

        <ul className="flex items-center gap-0.5">
          {/* Tarot links: always visible */}
          {tarotLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 min-h-[44px] min-w-[44px] justify-center font-body text-sm transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] ${
                    active
                      ? "text-[var(--color-text)] border-b-2 border-gold"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  <Icon size={14} strokeWidth={1.5} />
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              </li>
            )
          })}

          {/* Divider */}
          <li className="hidden lg:block mx-1 h-4 w-px bg-[var(--color-border)]" aria-hidden="true" />

          {/* Module links: visible on larger screens */}
          {moduleLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <li key={link.href} className="hidden lg:block">
                <Link
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 min-h-[44px] font-body text-sm transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-muted)] ${
                    active
                      ? "text-[var(--color-text-muted)] border-b-2 border-gold"
                      : "text-[var(--color-text-faint)]"
                  }`}
                >
                  <Icon size={13} strokeWidth={1.5} />
                  <span>{link.label}</span>
                </Link>
              </li>
            )
          })}

          {/* Mobile menu toggle */}
          <li className="lg:hidden">
            <button
              ref={mobileTriggerRef}
              onClick={() => setMobileOpen((prev) => !prev)}
              className="flex items-center justify-center rounded-md min-h-[44px] min-w-[44px] font-body text-[var(--color-text-faint)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text-muted)]"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X size={18} strokeWidth={1.5} />
              ) : (
                <Menu size={18} strokeWidth={1.5} />
              )}
            </button>
          </li>

          {/* Account dropdown */}
          {userEmail && (
            <li className="relative ml-1" ref={accountRef}>
              <button
                ref={accountTriggerRef}
                onClick={() => setAccountOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 min-h-[44px] font-body text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]"
                aria-expanded={accountOpen}
              >
                <User size={14} strokeWidth={1.5} />
                <span className="hidden sm:inline max-w-[120px] truncate">{userEmail}</span>
                <ChevronDown
                  size={12}
                  strokeWidth={1.5}
                  className={`transition-transform ${accountOpen ? "rotate-180" : ""}`}
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[var(--color-border)]">
                    <p className="font-body text-xs text-[var(--color-text-faint)] uppercase tracking-wider">Signed in as</p>
                    <p className="font-body text-sm text-[var(--color-text)] truncate mt-0.5">{userEmail}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 font-body text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]"
                  >
                    <User size={14} strokeWidth={1.5} />
                    Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 font-body text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-blush"
                  >
                    <LogOut size={14} strokeWidth={1.5} />
                    Sign Out
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </nav>

      {/* Mobile menu panel */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-200 ease-in-out ${
          mobileOpen ? "max-h-screen" : "max-h-0"
        }`}
      >
        <div className="border-t border-[var(--color-border)] px-6 sm:px-10 py-3 space-y-1">
          {moduleLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-3 min-h-[44px] font-body text-sm transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)] ${
                  active
                    ? "bg-sage-mist text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)]"
                }`}
              >
                <Icon size={16} strokeWidth={1.5} />
                <span>{link.label}</span>
              </Link>
            )
          })}

          {userEmail && (
            <>
              <div className="my-2 h-px bg-[var(--color-border)]" />
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-3 min-h-[44px] font-body text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-text)]"
              >
                <User size={16} strokeWidth={1.5} />
                <span>Account</span>
              </Link>
              <button
                onClick={() => { setMobileOpen(false); handleSignOut() }}
                className="flex items-center gap-3 w-full text-left rounded-md px-3 py-3 min-h-[44px] font-body text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-raised)] hover:text-blush"
              >
                <LogOut size={16} strokeWidth={1.5} />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
