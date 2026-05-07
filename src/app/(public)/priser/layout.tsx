import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'Priser: 149 kr per mÃ¥nad fÃ¶r obegrÃ¤nsad tillgÃ¥ng | Jobbcoach.ai',
  description:
    'Vi ger dig allt du behÃ¶ver fÃ¶r en stark jobbansÃ¶kan. 149 kr per mÃ¥nad, sju dagar gratis och ingen bindningstid. Avsluta nÃ¤r som helst.',
  keywords:
    'jobbcoach pris, jobbcoach premium, karriÃ¤rcoach pris, premium jobbansÃ¶kan, ATS-verktyg pris, personligt brev pris, CV-analys pris',
  openGraph: {
    title:
      'Premium fÃ¶r 149 kr per mÃ¥nad. Sju dagar gratis. | Jobbcoach.ai',
    description:
      'ObegrÃ¤nsade brev, CV-analyser och alla mallar. Vi har samlat allt du behÃ¶ver fÃ¶r att sÃ¶ka jobb i Sverige pÃ¥ ett stÃ¤lle.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/priser',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium fÃ¶r 149 kr per mÃ¥nad. Sju dagar gratis. | Jobbcoach.ai',
    description:
      'ObegrÃ¤nsade brev och CV-analyser, alla mallar, Smart-anpassad ton. Sju dagar gratis trial, ingen bindningstid.',
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/priser',
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
