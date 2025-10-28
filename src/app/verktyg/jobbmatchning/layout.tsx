import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jobbmatchning AI – Hitta jobb som matchar ditt CV | Jobbcoach',
  description: 'AI-driven jobbmatchning baserat på ditt CV. Få relevanspoäng för 300+ jobb från Arbetsförmedlingen. Prova gratis – 10 matchningar utan kostnad.',
  keywords: 'jobbmatchning, jobbmatchning ai, hitta jobb baserat på cv, automatisk jobbmatchning, cv till jobb, arbetsförmedlingen jobbmatchning, hitta rätt jobb, jobbsökning ai, kompetensbaserad matchning',
  openGraph: {
    title: 'Jobbmatchning AI – Hitta jobb som matchar ditt CV',
    description: 'AI-driven jobbmatchning baserat på ditt CV. Få relevanspoäng för 300+ jobb från Arbetsförmedlingen. Prova gratis – 10 matchningar utan kostnad.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://jobbcoach.ai/verktyg/jobbmatchning',
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/verktyg/jobbmatchning'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobbmatchning AI – Hitta jobb som matchar ditt CV',
    description: 'AI-driven jobbmatchning. 300+ matchade jobb från Arbetsförmedlingen baserat på ditt CV. Prova gratis.',
  }
}

export default function JobbmatchningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
