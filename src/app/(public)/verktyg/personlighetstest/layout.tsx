import type { Metadata } from 'next'
import { SIDA } from '@/components/artiklar/personlighetsprov/personlighetsprov-copy'

// Title och description ordagrant ur copytabellen i
// docs/design/rod-trad-prov-2026-09-24.html ("Sidan /verktyg/personlighetstest").
export const metadata: Metadata = {
  title: SIDA.title,
  description: SIDA.description,
  keywords: [
    'personlighetstest gratis',
    'personlighetstest jobb',
    'personlighetstest rekrytering',
    'big five test',
    'femfaktormodellen',
    'map test gratis',
  ],
  openGraph: {
    title: SIDA.title,
    description: SIDA.description,
    url: 'https://www.jobbcoach.ai/verktyg/personlighetstest',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title: SIDA.title,
    description: SIDA.description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.jobbcoach.ai/verktyg/personlighetstest' },
}

export default function PersonlighetstestLayout({ children }: { children: React.ReactNode }) {
  return children
}
