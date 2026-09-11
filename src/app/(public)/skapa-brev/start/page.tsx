/**
 * /skapa-brev/start (docs/plan-konvertering.md, C6).
 *
 * Publik ingång till brevflödet: besökaren skriver ett brev utan att ha konto
 * och registrerar sig först när det är klart. Sidan är noindex och pekar
 * canonical till exempelsidan, som är den vi faktiskt vill ranka på.
 */

import type { Metadata } from 'next'
import { exampleData } from '../../personligt-brev-exempel/[yrke]/exempel-data'
import StartFlow from './StartFlow'

const BASE_URL = 'https://www.jobbcoach.ai'

interface PageProps {
  searchParams: Promise<{ yrke?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { yrke } = await searchParams
  const entry = yrke ? exampleData[yrke] : undefined

  const canonical = entry
    ? `${BASE_URL}/personligt-brev-exempel/${yrke}`
    : `${BASE_URL}/personligt-brev-exempel`

  return {
    title: entry
      ? `Skriv ditt personliga brev som ${entry.yrke} | jobbcoach.ai`
      : 'Skriv ditt personliga brev | jobbcoach.ai',
    description:
      'Fyll i tjänsten du söker, så skriver vi ett utkast du kan redigera. Inget konto behövs för att komma igång.',
    robots: { index: false, follow: true },
    alternates: { canonical },
  }
}

export default async function SkapaBrevStartPage({ searchParams }: PageProps) {
  const { yrke } = await searchParams
  const entry = yrke ? exampleData[yrke] : undefined
  const yrkeLabel: string | undefined = entry?.yrke

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {yrkeLabel
              ? `Skriv ditt personliga brev som ${yrkeLabel.toLowerCase()}`
              : 'Skriv ditt personliga brev'}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-600">
            Tre fält, sedan skriver vi utkastet. Du behöver inget konto för att komma
            igång, och du ser resultatet innan du bestämmer dig.
          </p>
        </header>

        <StartFlow
          initialRole={yrkeLabel ?? ''}
          yrkeSlug={entry ? yrke : undefined}
          yrkeLabel={yrkeLabel}
        />
      </div>
    </main>
  )
}
