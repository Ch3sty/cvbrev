import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'KarriÃ¤rrÃ¥dgivning pÃ¥ sekunder: AI-coach med svenska kÃ¤llor | Jobbcoach.ai',
  description:
    'FÃ¥ karriÃ¤rrÃ¥d baserat pÃ¥ ArbetsfÃ¶rmedlingen, SCB, fackfÃ¶rbund och svensk arbetsrÃ¤tt. FrÃ¥ga om lÃ¶n, intervju, uppsÃ¤gning eller karriÃ¤rbyte. Helt gratis att bÃ¶rja, med kÃ¤lla till varje svar.',
  keywords: [
    'karriÃ¤rrÃ¥dgivning',
    'karriÃ¤rcoach',
    'ai karriÃ¤rcoach',
    'jobbcoach',
    'karriÃ¤rcoach online',
    'lÃ¶nestatistik sverige',
    'marknadslÃ¶n',
    'arbetsrÃ¤tt frÃ¥gor',
    'las uppsÃ¤gning',
    'intervjutips',
    'karriÃ¤rbyte',
    'a-kassa regler',
    'svensk arbetsmarknad',
  ],
  openGraph: {
    title: 'KarriÃ¤rrÃ¥dgivning pÃ¥ sekunder: AI-coach med svenska kÃ¤llor',
    description:
      'FÃ¥ karriÃ¤rrÃ¥d baserat pÃ¥ ArbetsfÃ¶rmedlingen, SCB och fackfÃ¶rbund. Fem frÃ¥gor gratis, kÃ¤lla till varje svar.',
    url: 'https://www.jobbcoach.ai/verktyg/jobbcoachen',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KarriÃ¤rrÃ¥dgivning pÃ¥ sekunder: AI-coach med svenska kÃ¤llor',
    description:
      'FÃ¥ karriÃ¤rrÃ¥d baserat pÃ¥ ArbetsfÃ¶rmedlingen, SCB och fackfÃ¶rbund. Fem frÃ¥gor gratis.',
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
