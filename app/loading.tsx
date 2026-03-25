import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <main className="max-w-reading mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
      <p className="mt-4 font-body text-sm text-[var(--color-text-faint)] italic">
        Gathering threads...
      </p>
    </main>
  )
}
