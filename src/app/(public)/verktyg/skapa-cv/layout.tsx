import type { Metadata } from 'next'

// SEO-svepet 2026-11-17 (docs/plan-seo-cv-kluster-2026-11-17.md, B1): titeln
// och beskrivningen säger hur nya byggaren fungerar, "Direkt på arket".
const TITEL = 'Skapa CV gratis: skriv direkt på arket, PDF eller Word'
const DELNING = 'Skapa CV gratis: skriv direkt på arket i en färdig mall'
const BESKRIVNING =
  'Skapa CV gratis i en färdig mall: skriv direkt på arket eller ladda upp ett CV du har. Jobbcoachen föreslår punkter och du laddar ner som PDF eller Word.'

export const metadata: Metadata = {
  title: TITEL,
  description: BESKRIVNING,
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
    'cv byggare',
    'skriv cv online',
    'cv online gratis',
  ],
  openGraph: {
    title: DELNING,
    description: BESKRIVNING,
    url: 'https://www.jobbcoach.ai/verktyg/skapa-cv',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title: DELNING,
    description: BESKRIVNING,
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/verktyg/skapa-cv',
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
