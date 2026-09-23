/**
 * Metadata för den delade vyn av en kalkylator. Title, description och
 * canonical är sidans egna (canonical pekar på kalkylatorn utan parametrar),
 * men og:image och twitter:image pekar på resultatets bild och og:title
 * säger resultatet, så att länken ser ut som uträkningen i chattar och
 * sociala medier.
 */
import type { Metadata } from 'next'
import { ogBildUrl, type Slug } from '@/lib/rakna/delning'
import { sammanfatta } from '@/lib/rakna/sammanfattning'
import { vanligaMellanslag } from '@/lib/rakna/format'

export type DeladSok = Record<string, string | string[] | undefined>

export interface DeladProps {
  searchParams: Promise<DeladSok>
}

export function deladMetadata(slug: Slug, bas: Metadata, sok: DeladSok): Metadata {
  const { sammanfattning: s, parametrar } = sammanfatta(slug, sok)
  const bild = ogBildUrl(slug, parametrar)
  const ogTitel = vanligaMellanslag(`${s.tal} ${s.enhet}`)
  const ogText = vanligaMellanslag(`${s.rad}. Källa: ${s.kalla}.`)
  const alt = vanligaMellanslag(`${s.namn}: ${s.tal} ${s.enhet}`)
  return {
    ...bas,
    openGraph: {
      ...(bas.openGraph ?? {}),
      title: ogTitel,
      description: ogText,
      url: `https://www.jobbcoach.ai/rakna-ut/${slug}`,
      images: [{ url: bild, width: 1200, height: 630, alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitel,
      description: ogText,
      images: [bild],
    },
  }
}
