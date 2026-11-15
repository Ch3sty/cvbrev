import type { Metadata } from 'next'
import { GRUNDNIVAN_ALLA } from '@/lib/plans/gratis-copy'

export const metadata: Metadata = {
  title:
    'Rekryteringstester: öva logik, I-provet och mer gratis',
  description:
    'Öva på matrislogik, deduktivt, verbalt, numeriskt, talserier, spatial förmåga och ordförråd, och inför I-provet. Grundnivån är gratis, ingen kortuppgift.',
  keywords: [
    'rekryteringstester',
    'logiska tester',
    'logiska tester gratis',
    'matrislogik',
    'verbalt resonemang test',
    'numeriskt resonemang test',
    'öva rekryteringstester',
    'shl test',
    'cut-e test',
    'assessio',
    'logiskt tänkande test',
    'tester vid rekrytering',
  ],
  openGraph: {
    title:
      'Rekryteringstester gratis: matrislogik, verbalt och numeriskt resonemang',
    description:
      `Träna på rekryteringstester i samma format som SHL och Cut-e. Gratis: ${GRUNDNIVAN_ALLA}, rapport direkt efter varje pass.`,
    url: 'https://www.jobbcoach.ai/verktyg/rekryteringstester',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Rekryteringstester gratis: matrislogik, verbalt och numeriskt resonemang',
    description:
      `Träna på rekryteringstester i samma format som SHL och Cut-e. Gratis: ${GRUNDNIVAN_ALLA}.`,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/verktyg/rekryteringstester',
  },
}

export default function RekryteringstesterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
