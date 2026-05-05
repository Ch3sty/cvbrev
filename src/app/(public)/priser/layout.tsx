import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Priser: 149 kr per månad för obegränsad tillgång | Jobbcoach.ai',
  description:
    'Vi ger dig allt du behöver för en stark jobbansökan. 149 kr per månad, sju dagar gratis, ingen kortuppgift och ingen bindningstid.',
  keywords:
    'jobbcoach pris, jobbcoach premium, karriärcoach pris, premium jobbansökan, ATS-verktyg pris, personligt brev pris, CV-analys pris',
  openGraph: {
    title:
      'Premium för 149 kr per månad. Sju dagar gratis. | Jobbcoach.ai',
    description:
      'Obegränsade brev, CV-analyser och alla mallar. Vi har samlat allt du behöver för att söka jobb i Sverige på ett ställe.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://jobbcoach.ai/priser',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium för 149 kr per månad. Sju dagar gratis. | Jobbcoach.ai',
    description:
      'Obegränsade brev och CV-analyser, alla mallar, Smart-anpassad ton. Ingen kortuppgift för att testa.',
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/priser',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PriserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
