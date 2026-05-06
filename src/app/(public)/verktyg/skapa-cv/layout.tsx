import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Skapa CV gratis online: bygg ditt CV på minuter | Jobbcoach.ai',
  description:
    'Skapa ditt CV gratis med vår CV-byggare. Sju enkla steg, live-preview, ATS-säkra mallar och export till PDF eller Word. Helt på svenska, anpassat för svenska arbetsgivare.',
  keywords: [
    'skapa cv',
    'skapa cv gratis',
    'skapa cv online',
    'cv-byggare',
    'cv-byggare gratis',
    'gratis cv',
    'cv mall gratis',
    'bygga cv',
    'cv-skapare svenska',
    'cv-skapare online',
  ],
  openGraph: {
    title: 'Skapa CV gratis online: bygg ditt CV på minuter | Jobbcoach.ai',
    description:
      'Sju enkla steg, live-preview, ATS-säkra mallar och export till PDF eller Word. Helt gratis.',
    url: 'https://jobbcoach.ai/verktyg/skapa-cv',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skapa CV gratis online: bygg ditt CV på minuter | Jobbcoach.ai',
    description:
      'Sju enkla steg, live-preview, ATS-säkra mallar och export till PDF eller Word. Helt gratis.',
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/verktyg/skapa-cv',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SkapaCvLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
