import Image from 'next/image'
import Link from 'next/link'
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
} from 'lucide-react'

const tarotModules = [
  {
    title: 'New Reading',
    description: 'Draw the cards and uncover what they reflect.',
    href: '/reading/new',
    icon: Sparkles,
  },
  {
    title: 'Journal',
    description: 'Revisit past readings and the threads between them.',
    href: '/journal',
    icon: BookOpen,
  },
  {
    title: 'Card Library',
    description: 'Browse all 78 cards, their meanings, and symbolism.',
    href: '/cards',
    icon: Library,
  },
  {
    title: 'Spread Builder',
    description: 'Create and manage your spread templates.',
    href: '/spreads',
    icon: LayoutGrid,
  },
]

const esotericModules = [
  {
    title: 'Herbology',
    description: 'The green craft: herbs, their properties, and magical correspondences.',
    href: '/herbology',
    icon: Leaf,
  },
  {
    title: 'Astrology',
    description: 'The celestial language: planetary wisdom and daily guidance.',
    href: '/astrology',
    icon: Star,
  },
  {
    title: 'Crystals',
    description: 'Stones, their properties, and healing correspondences.',
    href: '/crystals',
    icon: Gem,
  },
  {
    title: 'Numerology',
    description: 'Discover the numbers woven into your name and birth.',
    href: '/numerology',
    icon: Hash,
  },
  {
    title: 'Moon Phases',
    description: 'Track the lunar cycle and align your rituals with the celestial forces.',
    href: '/moon',
    icon: Moon,
  },
  {
    title: 'Dream Journal',
    description: 'Record your dreams and uncover the symbols within.',
    href: '/dreams',
    icon: CloudMoon,
  },
]

export default function DashboardPage() {
  return (
    <main className="max-w-content mx-auto px-6 sm:px-10 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="mx-auto w-full max-w-[400px] flex items-center justify-center">
          <Image
            src="/logo-dark-nobg.png"
            alt="Grimoire"
            width={1012}
            height={830}
            className="w-full h-auto dark:hidden"
            priority
          />
          <Image
            src="/logo-light-nobg.png"
            alt="Grimoire"
            width={1029}
            height={843}
            className="w-full h-auto hidden dark:block"
            priority
          />
        </div>
        <h1 className="-mt-4 font-wordmark text-4xl sm:text-5xl tracking-wide text-charcoal">
          Grimoire
        </h1>
        <p className="mt-2 font-body text-lg italic text-[var(--color-text-muted)]">
          Your personal divination companion
        </p>
      </div>

      {/* Tarot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {tarotModules.map((mod) => {
          const Icon = mod.icon
          return (
            <Link key={mod.href} href={mod.href}>
              <div className="group surface-gradient hover-glow border border-[var(--color-border)] rounded-lg p-6 transition-all duration-200 hover:border-gold/60 hover:shadow-glow-gold hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-[var(--color-secondary)]">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="font-display text-xl text-[var(--color-text)] mb-2">
                      {mod.title}
                    </h2>
                    <p className="font-body text-sm text-[var(--color-text-muted)]">
                      {mod.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Esoteric Modules */}
      <div className="divider-ornament mb-10" aria-hidden="true">
        <span className="font-body text-xs uppercase tracking-widest text-[var(--color-text-faint)]">
          The wider craft
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {esotericModules.map((mod) => {
          const Icon = mod.icon
          return (
            <Link key={mod.href} href={mod.href}>
              <div className="group surface-gradient hover-glow border border-[var(--color-border)] rounded-lg p-5 transition-all duration-200 hover:border-gold/60 hover:shadow-glow-gold hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-[var(--color-accent)]">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-[var(--color-text)] mb-1">
                      {mod.title}
                    </h3>
                    <p className="font-body text-sm text-[var(--color-text-muted)] leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </main>
  )
}
