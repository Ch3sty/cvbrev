import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Personligt brev: skrÃ¤ddarsydda jobbansÃ¶kningar pÃ¥ minuter | Jobbcoach.ai',
  description:
    'Vi skriver personliga brev som matchar jobbannonsen. Sju mallar, sex tonaliteter, export som PDF eller Word. Fem brev gratis varje vecka, ingen kortuppgift.',
  keywords:
    'personligt brev, personligt brev mall, personligt brev exempel, ansÃ¶kningsbrev, ansÃ¶kningsbrev mall, hur skriver man ett personligt brev, personligt brev tips, personligt brev gratis, personligt brev mall gratis',
  openGraph: {
    title:
      'Personligt brev som matchar annonsen | Jobbcoach.ai',
    description:
      'Vi lÃ¤ser jobbannonsen och ditt CV och skriver ett brev som faktiskt lÃ¥ter som dig. Sju mallar, sex toner, PDF och Word. Fem brev gratis varje vecka.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/personligt-brev',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkrÃ¤ddarsy ditt personliga brev till varje annons | Jobbcoach.ai',
    description:
      'Sju mallar, sex toner, klart pÃ¥ minuter. Fem brev gratis varje vecka. PDF eller Word, du vÃ¤ljer.',
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
