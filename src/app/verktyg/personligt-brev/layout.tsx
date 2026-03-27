import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Personliga Brev | ATS-optimerat på 2 minuter | Jobbcoach.ai',
  description: 'Skapa personligt brev som passar både AI-rekrytering och mänskliga rekryterare. Verktyg som analyserar jobbannons och CV för perfekt matchning. Gratis att testa.',
  keywords: 'personligt brev, skriva personligt brev, personligt brev exempel, personligt brev mall, personligt brev mall gratis, hur skriver man ett personligt brev, exempel på personligt brev, personligt brev tips, cv och personligt brev, ATS-optimering personligt brev',
  openGraph: {
    title: 'Skapa Personligt Brev med AI | Optimerat för ATS och Rekryterare | Jobbcoach.ai',
    description: '70% av personliga brev filtreras av AI innan de når mänskliga rekryterare. Vårt verktyg skapar ATS-optimerade brev som matchar jobbannons perfekt. Klart på 2 minuter.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://jobbcoach.ai/verktyg/personligt-brev',
    siteName: 'Jobbcoach.ai'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skapa ATS-optimerat personligt brev med AI | Jobbcoach.ai',
    description: 'Verktyg som skapar personliga brev optimerade för både ATS-system och mänskliga rekryterare. Klart på 2 minuter.'
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/verktyg/personligt-brev'
  },
  robots: {
    index: true,
    follow: true
  }
}

export default function PersonligtBrevLayout({ children }: { children: React.ReactNode }) {
  return children
}
