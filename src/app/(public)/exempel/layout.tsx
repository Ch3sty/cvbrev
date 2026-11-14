import { Metadata } from 'next'
import { TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { TOTAL_BREV_YRKEN, TOTAL_CV_YRKEN } from './components/exempel-data'

// /exempel är hubben, inte målsida för huvudorden (huvudordsplanen steg 4,
// SEO-förslaget K4 c, 2026-11-14). Talen ur konstanterna.
const TITEL = 'Exempel för jobbansökan: CV, personligt brev och mallar'
const BESKRIVNING = `Vi har ${TOTAL_CV_YRKEN} CV-exempel, ${TOTAL_BREV_YRKEN} exempel på personligt brev och ${TEMPLATE_COUNT} CV-mallar. Börja med ditt yrke och gå vidare till exemplet, brevet eller mallen du behöver.`

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
