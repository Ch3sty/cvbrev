import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'CV-analys: poäng och konkreta förslag | Jobbcoach.ai',
  description:
    'Vi läser ditt CV som ett rekryteringssystem gör och ger dig en läsbarhetspoäng, betyg i sex kategorier och konkreta åtgärder. En analys gratis per konto.',
  keywords:
    'cv analys, ats cv, ats-poäng, cv feedback, granska cv, cv betyg, cv granskare, cv optimering, cv check svenska',
  openGraph: {
    title: 'CV-analys på 60 sekunder med ATS-poäng | Jobbcoach.ai',
    description:
      'Vi kontrollerar struktur, språk, nyckelord och kvantifiering. Du får en ATS-poäng plus konkreta förslag i sex kategorier. En analys gratis per konto.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/cv-analys',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CV-analys på 60 sekunder med ATS-poäng | Jobbcoach.ai',
    description:
      'Vi kontrollerar struktur, språk, nyckelord och kvantifiering. En analys gratis per konto.',
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/verktyg/cv-analys',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function CVAnalysLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
