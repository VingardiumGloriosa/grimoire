'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="max-w-reading mx-auto px-6 py-20 flex flex-col items-center text-center space-y-6">
      <div className="divider-ornament mb-2" aria-hidden="true" />
      <h1 className="font-display text-3xl sm:text-4xl text-charcoal">
        Something went awry
      </h1>
      <p className="font-body text-lg text-warm-grey max-w-md leading-relaxed">
        An unexpected error occurred. The threads tangled — but you can try again.
      </p>
      <div className="flex gap-3 pt-2">
        <Button
          onClick={reset}
          className="bg-forest text-parchment hover:bg-forest-deep font-body"
        >
          Try again
        </Button>
        <Link href="/">
          <Button variant="outline" className="font-body">
            Return home
          </Button>
        </Link>
      </div>
    </main>
  )
}
