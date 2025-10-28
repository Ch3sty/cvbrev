import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logiska Tester Gratis + Premium | Träna Rekryteringstester',
  description: 'Träna på logiska tester, verbalt & numeriskt resonemang gratis. Öka dina chanser att klara rekryteringstester. Starta direkt – inget konto krävs.',
  keywords: 'logiska tester gratis, logiska tester, rekrytering tester, tester rekrytering, tester vid rekrytering, logiskt tänkande test, verbalt resonemang test, numeriskt resonemang, matrislogik, logiska tester vid rekrytering',
  openGraph: {
    title: 'Logiska Tester Gratis + Premium | Träna Rekryteringstester',
    description: 'Träna på logiska tester, verbalt & numeriskt resonemang gratis. Öka dina chanser att klara rekryteringstester.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://jobbcoach.ai/verktyg/rekryteringstester',
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/verktyg/rekryteringstester'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Logiska Tester Gratis | Träna Rekryteringstester',
    description: 'Träna gratis på matrislogik, verbalt & numeriskt resonemang. Förbered dig för rekryteringstester.',
  }
}

export default function RekryteringstesterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
