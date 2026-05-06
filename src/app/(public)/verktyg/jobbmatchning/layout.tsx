import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Hitta jobb online: matcha CV mot tusentals lediga tjänster | Jobbcoach.ai',
  description:
    'Hitta jobb som matchar ditt CV. Vi söker bland tusentals lediga tjänster i Sverige från Arbetsförmedlingen och ger dig matchnings-procent per annons. Helt gratis att börja.',
  keywords:
    'söka jobb, hitta jobb, lediga jobb, jobb sverige, jobbportal, hitta jobb online, söka jobb online, jobb som passar mig, jobbmatchning, jobbmatchning ai',
  openGraph: {
    title:
      'Hitta jobb som matchar ditt CV | Jobbcoach.ai',
    description:
      'Vi söker bland tusentals lediga tjänster i Sverige från Arbetsförmedlingen och ger dig matchnings-procent per annons. Helt gratis att börja.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://jobbcoach.ai/verktyg/jobbmatchning',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hitta jobb som matchar ditt CV | Jobbcoach.ai',
    description:
      'Vi söker bland tusentals lediga tjänster i Sverige och ger dig matchnings-procent per annons. Helt gratis att börja.',
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/verktyg/jobbmatchning',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function JobbmatchningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
