"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"

type ThemeOption = "light" | "dark" | "system"

export default function Footer() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  function cycleTheme() {
    const order: ThemeOption[] = ["light", "dark", "system"]
    const current = theme as ThemeOption
    const next = order[(order.indexOf(current) + 1) % order.length]
    setTheme(next)
  }

  const themeIcon = { light: Sun, dark: Moon, system: Monitor }
  const themeLabel = { light: "Light", dark: "Dark", system: "System" }

  const currentTheme = (theme ?? "system") as ThemeOption
  const Icon = themeIcon[currentTheme]

  return (
    <footer className="navbar-border mt-24 rotate-180">
      <div className="rotate-180 mx-auto max-w-content px-6 py-6">
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-3">
          {/* Left: branding */}
          <p className="font-display text-sm tracking-wide text-[var(--color-text-faint)] text-center sm:text-left">
            Grimoire
          </p>

          {/* Center: theme toggle */}
          <div className="flex justify-center">
            {mounted && (
              <button
                onClick={cycleTheme}
                className="group flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 font-body text-xs text-[var(--color-text-muted)] transition-all hover:border-gold/40 hover:text-[var(--color-text)]"
                aria-label={`Toggle theme (currently ${themeLabel[currentTheme]})`}
              >
                <Icon size={13} strokeWidth={1.5} className="transition-transform group-hover:scale-110" />
                <span className="uppercase tracking-wider">{themeLabel[currentTheme]}</span>
              </button>
            )}
          </div>

          {/* Right: tagline */}
          <p className="font-body text-xs italic text-[var(--color-text-faint)] text-center sm:text-right">
            The cards reflect; they do not dictate.
          </p>
        </div>
      </div>
    </footer>
  )
}
