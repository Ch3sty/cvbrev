import { Metadata } from 'next'
import { BREV_MALL_ANTAL, BREV_WORD_ANTAL } from '@/components/publikt/brevmallar'

export const metadata: Metadata = {
  title:
    'Personligt brev som matchar annonsen | Jobbcoach.ai',
  description:
    `Vi läser annonsens kravprofil och skriver brevet mot den. ${BREV_MALL_ANTAL} mallar, samma som till ditt CV, och fem toner. Första brevet gratis, ingen kortuppgift.`,
  keywords:
    'personligt brev, personligt brev mall, personligt brev exempel, ansökningsbrev, ansökningsbrev mall, hur skriver man ett personligt brev, personligt brev tips, personligt brev gratis, personligt brev mall gratis',
  openGraph: {
    title:
      'Personligt brev som matchar annonsen | Jobbcoach.ai',
    description:
      `Vi läser jobbannonsen och ditt CV och skriver ett brev som faktiskt låter som dig. ${BREV_MALL_ANTAL} mallar, samma som till ditt CV. Första personliga brevet gratis.`,
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/personligt-brev',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skräddarsy ditt personliga brev till varje annons | Jobbcoach.ai',
    description:
      `${BREV_MALL_ANTAL} mallar, fem toner, klart på minuter. Första personliga brevet gratis att läsa. Nedladdning som PDF, och som Word i ${BREV_WORD_ANTAL} av mallarna, ingår i Premium.`,
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/verktyg/personligt-brev',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PersonligtBrevLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
