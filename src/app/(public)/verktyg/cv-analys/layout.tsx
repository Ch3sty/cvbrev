import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'CV-analys: ATS-poÃ¤ng och konkreta fÃ¶rbÃ¤ttringsfÃ¶rslag pÃ¥ 60 sekunder | Jobbcoach.ai',
  description:
    'Vi analyserar ditt CV mot svenska ATS-system och ger dig en poÃ¤ng frÃ¥n 0 till 100, sex kategori-betyg och konkreta fÃ¶rbÃ¤ttringsfÃ¶rslag du kan applicera direkt. En analys gratis varje vecka.',
  keywords:
    'cv analys, ats cv, ats-poÃ¤ng, cv feedback, granska cv, cv betyg, cv granskare, cv optimering, cv check svenska',
  openGraph: {
    title: 'CV-analys pÃ¥ 60 sekunder med ATS-poÃ¤ng | Jobbcoach.ai',
    description:
      'Vi kontrollerar struktur, sprÃ¥k, nyckelord och kvantifiering. Du fÃ¥r en ATS-poÃ¤ng plus konkreta fÃ¶rslag i sex kategorier. En analys gratis varje vecka.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/cv-analys',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CV-analys pÃ¥ 60 sekunder med ATS-poÃ¤ng | Jobbcoach.ai',
    description:
      'Vi kontrollerar struktur, sprÃ¥k, nyckelord och kvantifiering. En analys gratis varje vecka.',
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
