import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gratis CV-Analys med AI – Få Feedback på 60 Sekunder | Jobbcoach.ai',
  description: 'Analysera ditt CV gratis med AI. Få detaljerad feedback på struktur, ATS-vänlighet och förbättringsförslag på 60 sekunder. 2 gratis analyser/vecka.',
  keywords: 'cv analys, analysera cv, cv granskning gratis, granska cv, ats cv, cv feedback, cv betyg, cv poäng, cv optimering, cv granskare, cv check svenska, cv scanner',
  openGraph: {
    title: 'Gratis CV-Analys med AI – Få Feedback på 60 Sekunder',
    description: 'Analysera ditt CV gratis med AI. Få detaljerad feedback på struktur, ATS-vänlighet och konkreta förbättringsförslag. 97% av stora företag använder ATS-system som filtrerar 75% av CV:n.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://jobbcoach.ai/verktyg/cv-analys',
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/verktyg/cv-analys'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gratis CV-Analys med AI – Få Feedback på 60 Sekunder',
    description: 'Analysera ditt CV gratis med AI. Få feedback på struktur, ATS-vänlighet och konkreta förbättringsförslag.',
  }
}

export default function CVAnalysisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
