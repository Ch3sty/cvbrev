import { Metadata } from 'next'
import { TOTAL_BREV_YRKEN, TOTAL_CV_YRKEN } from './components/exempel-data'

// /exempel är hubben, inte målsida för huvudorden (huvudordsplanen steg 4,
// SEO-förslaget K4 c, 2026-11-14). SEO-svepet 2026-11-17 (B7): titeln släpper
// mallorden, som /cv-mallar äger. Talen ur konstanterna.
const TITEL = 'Exempel för din jobbansökan: CV och personligt brev per yrke'
const BESKRIVNING = `Vi har ${TOTAL_CV_YRKEN} CV-exempel och ${TOTAL_BREV_YRKEN} exempel på personligt brev för svenska yrken. Börja med ditt yrke och se exemplet, brevet eller mallen du behöver.`

export const metadata: Metadata = {
  title: TITEL,
  description: BESKRIVNING,
  keywords: 'exempel på personligt brev, spontanansökan exempel, jobbansökan, exempel jobbansökan',
  openGraph: {
    title: TITEL,
    description: BESKRIVNING,
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/exempel',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITEL,
    description: BESKRIVNING,
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/exempel',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ExempelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
