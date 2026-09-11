/**
 * /cv-mallar/start (docs/plan-konvertering.md, C7).
 *
 * Publik ingång till CV-byggaren: besökaren väljer mall innan de registrerar
 * sig, så registreringen känns som ett steg i arbetet i stället för en vägg.
 * Noindex med canonical till mallsidan som faktiskt ska ranka.
 */

import type { Metadata } from 'next'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
import { YRKE_TILL_MALLAR, YRKESMALL_LIST } from '../yrkesmall-data'
import StartMallval, { type StartTemplate } from './StartMallval'

const BASE_URL = 'https://www.jobbcoach.ai'

interface PageProps {
  searchParams: Promise<{ yrke?: string; mall?: string }>
}

function yrkeLabelFor(slug: string | undefined): string | undefined {
  if (!slug) return undefined
  return YRKESMALL_LIST.find((y) => y.slug === slug)?.namn
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { yrke } = await searchParams
  const label = yrkeLabelFor(yrke)

  const canonical =
    yrke && YRKE_TILL_MALLAR[yrke]
      ? `${BASE_URL}/cv-mallar/${yrke}`
      : `${BASE_URL}/cv-mallar`

  return {
    title: label
      ? `Välj CV-mall för ${label.toLowerCase()} | jobbcoach.ai`
      : 'Välj CV-mall | jobbcoach.ai',
    description:
      'Välj en granskad CV-mall och börja fylla i. Tolv mallar är gratis och alla är testade mot svenska rekryteringssystem.',
    robots: { index: false, follow: true },
    alternates: { canonical },
  }
}

export default async function CvMallarStartPage({ searchParams }: PageProps) {
  const { yrke, mall } = await searchParams

  const label = yrkeLabelFor(yrke)
  const recommended = yrke ? YRKE_TILL_MALLAR[yrke] : undefined

  // Gratismallarna först: de är det besökaren kan använda utan att betala.
  const templates: StartTemplate[] = SIMPLE_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    imagePath: t.imagePath,
    tier: (t.tier === 'premium' ? 'premium' : 'free') as StartTemplate['tier'],
  })).sort((a, b) => (a.tier === b.tier ? 0 : a.tier === 'free' ? -1 : 1))

  const requested = mall && templates.some((t) => t.id === mall) ? mall : undefined
  const defaultTemplateId =
    requested ?? recommended?.free ?? templates[0]?.id ?? 'norrsken'

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            {label ? `Välj CV-mall för ${label.toLowerCase()}` : 'Välj din CV-mall'}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-600">
            Alla mallar är granskade mot svenska rekryteringssystem. Välj en, så fyller
            du i innehållet i nästa steg och vi sköter formateringen.
          </p>
        </header>

        <StartMallval
          templates={templates}
          defaultTemplateId={defaultTemplateId}
          yrkeSlug={yrke}
          yrkeLabel={label}
        />
      </div>
    </main>
  )
}
