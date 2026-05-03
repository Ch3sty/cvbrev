import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jobbcoachen – AI-karriärcoach med svensk arbetsmarknadsdata | Jobbcoach.ai',
  description: 'Få karriärråd baserat på Arbetsförmedlingen, fackförbund och SCB. AI-assistent som svarar på frågor om CV, lön, intervjuer och arbetsrätt. Testa gratis.',
  keywords: [
    'jobbcoach',
    'karriärcoach',
    'karriärrådgivning',
    'arbetsmarknadsråd',
    'karriärcoach online',
    'digital karriärcoach',
    'svensk arbetsmarknad',
    'karriärassistent',
    'karriärbyte tips',
    'intervjutips',
    'lönestatistik',
    'arbetsrätt frågor',
    'CV-tips'
  ],
  openGraph: {
    // OG-bild genereras dynamiskt via opengraph-image.tsx
    title: 'Jobbcoachen – AI-karriärcoach med svensk arbetsmarknadsdata',
    description: 'Få karriärråd baserat på Arbetsförmedlingen, fackförbund och SCB. Testa gratis med 5 meddelanden.',
    url: 'https://jobbcoach.ai/verktyg/jobbcoachen',
    siteName: 'Jobbcoach.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobbcoachen – AI-karriärcoach med svensk arbetsmarknadsdata',
    description: 'Få karriärråd baserat på Arbetsförmedlingen, fackförbund och SCB. Testa gratis.',
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/verktyg/jobbcoachen'
  }
}

export default function JobbcoachenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
