import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Personligt brev: skräddarsydda jobbansökningar på minuter | Jobbcoach.ai',
  description:
    'Vi skriver personliga brev som matchar jobbannonsen. Sju mallar, sex tonaliteter, export som PDF eller Word. Två brev gratis varje dag, ingen kortuppgift.',
  keywords:
    'personligt brev, personligt brev mall, personligt brev exempel, ansökningsbrev, ansökningsbrev mall, hur skriver man ett personligt brev, personligt brev tips, personligt brev gratis, personligt brev mall gratis',
  openGraph: {
    title:
      'Personligt brev som matchar annonsen | Jobbcoach.ai',
    description:
      'Vi läser jobbannonsen och ditt CV och skriver ett brev som faktiskt låter som dig. Sju mallar, sex toner, PDF och Word. Två brev gratis varje dag.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/personligt-brev',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skräddarsy ditt personliga brev till varje annons | Jobbcoach.ai',
    description:
      'Sju mallar, sex toner, klart på minuter. Två brev gratis varje dag. PDF eller Word, du väljer.',
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
