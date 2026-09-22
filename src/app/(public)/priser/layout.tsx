import { Metadata } from 'next'

/**
 * Metadata för /priser (reference_onpage_seo_standard: title högst 60 tecken,
 * description mellan 110 och 158).
 *
 * Title: 56 tecken. Description: 151 tecken.
 */
export const metadata: Metadata = {
  title: 'Priser: välj spår och börja med en vecka | Jobbcoach.ai',
  description:
    'Vi säljer veckan du söker på, inte året. CV-veckan och Testveckan kostar 79 kr i veckan, Allt 99 kr. Säg upp med ett klick, och gratisnivån finns kvar.',
  keywords:
    'jobbcoach pris, cv-analys pris, rekryteringstester pris, personligt brev pris, veckoprenumeration jobbsökning',
  openGraph: {
    title: 'Välj spåret du söker på. Börja med en vecka.',
    description:
      'CV-veckan och Testveckan 79 kr i veckan, Allt 99 kr. Ingen bindningstid, uppsägning med ett klick, och gratisnivån ligger kvar.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/priser',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Välj spåret du söker på. Börja med en vecka.',
    description:
      'CV-veckan och Testveckan 79 kr i veckan, Allt 99 kr. Ingen bindningstid, uppsägning med ett klick.',
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
