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
    title: 'Jobbcoachen – AI-karriärcoach med svensk arbetsmarknadsdata',
    description: 'Få karriärråd baserat på Arbetsförmedlingen, fackförbund och SCB. Testa gratis med 5 meddelanden.',
    url: 'https://jobbcoach.ai/verktyg/jobbcoachen',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    images: [
      {
        url: 'https://jobbcoach.ai/og-jobbcoachen.png',
        width: 1200,
        height: 630,
        alt: 'Jobbcoachen - Din AI-karriärcoach'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobbcoachen – AI-karriärcoach med svensk arbetsmarknadsdata',
    description: 'Få karriärråd baserat på Arbetsförmedlingen, fackförbund och SCB. Testa gratis.',
    images: ['https://jobbcoach.ai/og-jobbcoachen.png']
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
