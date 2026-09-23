import { Metadata } from 'next'

/**
 * Metadata för /priser (reference_onpage_seo_standard: title högst 60 tecken,
 * description mellan 110 och 158).
 *
 * Title: 54 tecken. Description: 153 tecken.
 */
export const metadata: Metadata = {
  title: 'Priser: en vecka som bär hela jobbsöket | Jobbcoach.ai',
  description:
    'CV-paketet och Träningspaketet 79 kr i veckan, Hela paketet 99 kr. Allt öppet direkt, ingen bindningstid, säg upp med ett klick. Gratisnivån ligger kvar.',
  keywords:
    'jobbcoach pris, cv-analys pris, rekryteringstester pris, personligt brev pris, veckoprenumeration jobbsökning',
  openGraph: {
    title: 'En vecka som bär hela jobbsöket.',
    description:
      'CV-paketet och Träningspaketet 79 kr i veckan, Hela paketet 99 kr. Ingen bindningstid, uppsägning med ett klick, och gratisnivån ligger kvar.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/priser',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'En vecka som bär hela jobbsöket.',
    description:
      'CV-paketet och Träningspaketet 79 kr i veckan, Hela paketet 99 kr. Ingen bindningstid, uppsägning med ett klick.',
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
