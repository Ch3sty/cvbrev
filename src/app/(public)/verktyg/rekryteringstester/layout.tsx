import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Rekryteringstester gratis: matrislogik, verbalt och numeriskt resonemang | Jobbcoach.ai',
  description:
    'Träna på rekryteringstester innan arbetsgivaren testar dig. Matrislogik, verbalt resonemang och numeriskt resonemang i samma format som SHL, Cut-e och Assessio använder. Tre tester gratis, ingen kortuppgift.',
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
      'Träna på rekryteringstester i samma format som SHL och Cut-e. Tre tester gratis, rapport direkt efter varje pass.',
    url: 'https://jobbcoach.ai/verktyg/rekryteringstester',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Rekryteringstester gratis: matrislogik, verbalt och numeriskt resonemang',
    description:
      'Träna på rekryteringstester i samma format som SHL och Cut-e. Tre tester gratis.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/verktyg/rekryteringstester',
  },
}

export default function RekryteringstesterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
