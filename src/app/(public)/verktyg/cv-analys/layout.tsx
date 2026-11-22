import { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'CV-analys: poäng och konkreta förslag | Jobbcoach.ai',
  description:
    'CV-analys som ger ditt CV en läsbarhetspoäng av 100 i sju delar, för rekryterare och rekryteringssystem (ATS). Poängen är gratis för varje CV du sparar.',
  keywords:
    'cv analys, läsbarhetspoäng cv, ats cv, cv feedback, granska cv, cv betyg, cv granskare, cv optimering, cv check svenska',
  openGraph: {
    title: 'CV-analys med läsbarhetspoäng av 100 | Jobbcoach.ai',
    description:
      'Ditt CV får en läsbarhetspoäng av 100 i sju delar. Du ser var det tappar och vad som saknas i varje del. Poängen är gratis för varje CV du sparar.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/cv-analys',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CV-analys med läsbarhetspoäng av 100 | Jobbcoach.ai',
    description:
      'Sju delar, hundra poäng. Du ser var ditt CV tappar och vad som saknas i varje del. Läsbarhetspoängen är gratis för varje CV.',
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
