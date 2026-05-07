import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Rekryteringstester gratis: matrislogik, verbalt och numeriskt resonemang | Jobbcoach.ai',
  description:
    'TrÃ¤na pÃ¥ rekryteringstester innan arbetsgivaren testar dig. Matrislogik, verbalt resonemang och numeriskt resonemang i samma format som SHL, Cut-e och Assessio anvÃ¤nder. Tre tester gratis, ingen kortuppgift.',
  keywords: [
    'rekryteringstester',
    'logiska tester',
    'logiska tester gratis',
    'matrislogik',
    'verbalt resonemang test',
    'numeriskt resonemang test',
    'Ã¶va rekryteringstester',
    'shl test',
    'cut-e test',
    'assessio',
    'logiskt tÃ¤nkande test',
    'tester vid rekrytering',
  ],
  openGraph: {
    title:
      'Rekryteringstester gratis: matrislogik, verbalt och numeriskt resonemang',
    description:
      'TrÃ¤na pÃ¥ rekryteringstester i samma format som SHL och Cut-e. Tre tester gratis, rapport direkt efter varje pass.',
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
      'TrÃ¤na pÃ¥ rekryteringstester i samma format som SHL och Cut-e. Tre tester gratis.',
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
