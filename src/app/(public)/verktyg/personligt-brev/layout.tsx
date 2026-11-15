import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Personligt brev som matchar annonsen | Jobbcoach.ai',
  description:
    'Vi läser annonsens kravprofil och skriver brevet mot den. Sju mallar, fem toner, export som PDF eller Word. Första brevet gratis, ingen kortuppgift.',
  keywords:
    'personligt brev, personligt brev mall, personligt brev exempel, ansökningsbrev, ansökningsbrev mall, hur skriver man ett personligt brev, personligt brev tips, personligt brev gratis, personligt brev mall gratis',
  openGraph: {
    title:
      'Personligt brev som matchar annonsen | Jobbcoach.ai',
    description:
      'Vi läser jobbannonsen och ditt CV och skriver ett brev som faktiskt låter som dig. Sju mallar, fem toner, PDF och Word. Första personliga brevet gratis.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/personligt-brev',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skräddarsy ditt personliga brev till varje annons | Jobbcoach.ai',
    description:
      'Sju mallar, fem toner, klart på minuter. Första personliga brevet gratis att läsa. Nedladdning som PDF eller Word ingår i Premium.',
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
