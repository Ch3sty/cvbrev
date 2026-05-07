import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Hitta jobb online: matcha CV mot tusentals lediga tjÃ¤nster | Jobbcoach.ai',
  description:
    'Hitta jobb som matchar ditt CV. Vi sÃ¶ker bland tusentals lediga tjÃ¤nster i Sverige frÃ¥n ArbetsfÃ¶rmedlingen och ger dig matchnings-procent per annons. Helt gratis att bÃ¶rja.',
  keywords:
    'sÃ¶ka jobb, hitta jobb, lediga jobb, jobb sverige, jobbportal, hitta jobb online, sÃ¶ka jobb online, jobb som passar mig, jobbmatchning, jobbmatchning ai',
  openGraph: {
    title:
      'Hitta jobb som matchar ditt CV | Jobbcoach.ai',
    description:
      'Vi sÃ¶ker bland tusentals lediga tjÃ¤nster i Sverige frÃ¥n ArbetsfÃ¶rmedlingen och ger dig matchnings-procent per annons. Helt gratis att bÃ¶rja.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/jobbmatchning',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hitta jobb som matchar ditt CV | Jobbcoach.ai',
    description:
      'Vi sÃ¶ker bland tusentals lediga tjÃ¤nster i Sverige och ger dig matchnings-procent per annons. Helt gratis att bÃ¶rja.',
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/verktyg/jobbmatchning',
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
