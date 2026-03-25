import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="max-w-reading mx-auto px-6 py-20 flex flex-col items-center text-center space-y-6">
      <div className="divider-ornament mb-2" aria-hidden="true" />
      <h1 className="font-display text-3xl sm:text-4xl text-charcoal">
        Page not found
      </h1>
      <p className="font-body text-lg text-warm-grey max-w-md leading-relaxed">
        The path you seek does not exist. Perhaps the cards will guide you elsewhere.
      </p>
      <Link href="/">
        <Button className="bg-forest text-parchment hover:bg-forest-deep font-body">
          Return home
        </Button>
      </Link>
    </main>
  )
}
