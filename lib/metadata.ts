import type { Metadata } from 'next'

const BASE_TITLE = 'Grimoire'
const BASE_DESCRIPTION =
  'Your personal divination companion — tarot, herbology, astrology, crystals, numerology, moon phases, and dream journaling.'

export function pageMetadata(title: string, description?: string): Metadata {
  const desc = description || BASE_DESCRIPTION
  return {
    title,
    description: desc,
    openGraph: {
      title: `${title} | ${BASE_TITLE}`,
      description: desc,
      siteName: BASE_TITLE,
      type: 'website',
    },
  }
}
