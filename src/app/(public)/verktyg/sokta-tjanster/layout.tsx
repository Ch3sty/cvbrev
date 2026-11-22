import { Metadata } from 'next'
import { BESKRIVNING, OG_TITEL, TITEL, URL } from './sokta-tjanster-data'

/** SEO:s besked (seo-besked-skisser.md, Den nya sidan): title och description ordagrant. */
export const metadata: Metadata = {
  title: TITEL,
  description: BESKRIVNING,
  openGraph: {
    title: OG_TITEL,
    description: BESKRIVNING,
    type: 'website',
    locale: 'sv_SE',
    url: URL,
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITEL,
    description: BESKRIVNING,
  },
  alternates: {
    canonical: URL,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function SoktaTjansterLayout({ children }: { children: React.ReactNode }) {
  return children
}
