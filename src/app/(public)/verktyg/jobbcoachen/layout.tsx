import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Jobbcoachen: karriärsvar med källor | Jobbcoach.ai',
  description:
    'Fråga om lön, intervju, uppsägning eller karriärbyte. Svaren bygger på Arbetsförmedlingen, SCB och fackförbund, med källa till varje svar.',
  keywords: [
    'karriärrådgivning',
    'karriärcoach',
    'ai karriärcoach',
    'jobbcoach',
    'karriärcoach online',
    'lönestatistik sverige',
    'marknadslön',
    'arbetsrätt frågor',
    'las uppsägning',
    'intervjutips',
    'karriärbyte',
    'a-kassa regler',
    'svensk arbetsmarknad',
  ],
  openGraph: {
    title: 'Karriärrådgivning på sekunder: AI-coach med svenska källor',
    description:
      'Få karriärråd baserat på Arbetsförmedlingen, SCB och fackförbund. Tio meddelanden gratis på ditt konto, källa till varje svar.',
    url: 'https://www.jobbcoach.ai/verktyg/jobbcoachen',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karriärrådgivning på sekunder: AI-coach med svenska källor',
    description:
      'Få karriärråd baserat på Arbetsförmedlingen, SCB och fackförbund. Tio meddelanden gratis på ditt konto.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/verktyg/jobbcoachen',
  },
}

export default function JobbcoachenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
