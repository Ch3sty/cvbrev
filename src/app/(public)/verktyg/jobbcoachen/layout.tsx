import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Karriärrådgivning på sekunder: AI-coach med svenska källor | Jobbcoach.ai',
  description:
    'Få karriärråd baserat på Arbetsförmedlingen, SCB, fackförbund och svensk arbetsrätt. Fråga om lön, intervju, uppsägning eller karriärbyte. Helt gratis att börja, med källa till varje svar.',
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
      'Få karriärråd baserat på Arbetsförmedlingen, SCB och fackförbund. 10 meddelanden gratis per dag, källa till varje svar.',
    url: 'https://www.jobbcoach.ai/verktyg/jobbcoachen',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karriärrådgivning på sekunder: AI-coach med svenska källor',
    description:
      'Få karriärråd baserat på Arbetsförmedlingen, SCB och fackförbund. 10 meddelanden gratis per dag.',
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
