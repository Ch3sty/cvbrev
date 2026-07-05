import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'CV-analys: ATS-poäng och konkreta förbättringsförslag på 60 sekunder | Jobbcoach.ai',
  description:
    'Vi analyserar ditt CV mot svenska ATS-system och ger dig en poäng från 0 till 100, sex kategori-betyg och konkreta förbättringsförslag du kan applicera direkt. En analys gratis var tredje dag.',
  keywords:
    'cv analys, ats cv, ats-poäng, cv feedback, granska cv, cv betyg, cv granskare, cv optimering, cv check svenska',
  openGraph: {
    title: 'CV-analys på 60 sekunder med ATS-poäng | Jobbcoach.ai',
    description:
      'Vi kontrollerar struktur, språk, nyckelord och kvantifiering. Du får en ATS-poäng plus konkreta förslag i sex kategorier. En analys gratis var tredje dag.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/cv-analys',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CV-analys på 60 sekunder med ATS-poäng | Jobbcoach.ai',
    description:
      'Vi kontrollerar struktur, språk, nyckelord och kvantifiering. En analys gratis var tredje dag.',
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
