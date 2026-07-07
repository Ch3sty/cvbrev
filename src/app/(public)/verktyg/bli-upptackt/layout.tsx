import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bli upptäckt, låt rekryterare hitta dig | Jobbcoach.ai',
  description:
    'Skapa en profil så kan rekryterare som söker någon med din bakgrund hitta dig. Anonym tills du säger ja, verifierade testresultat och arbetsstil matchar dig mot rätt jobb. Gratis att synas.',
  keywords:
    'bli upptäckt, synlig för rekryterare, bli hittad av rekryterare, kandidatprofil, passiv jobbsökning, arbetsstilstest, verifierade testresultat, anonym profil rekrytering',
  openGraph: {
    title: 'Bli hittad av rekryterare, utan att jaga jobb | Jobbcoach.ai',
    description:
      'Skapa en profil, gör testerna om du vill och slå på synlighet. Rekryterare som söker din kompetens hittar dig. Du är anonym tills du säger ja.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/verktyg/bli-upptackt',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bli hittad av rekryterare, utan att jaga jobb | Jobbcoach.ai',
    description:
      'Skapa en profil, slå på synlighet, och låt rätt rekryterare hitta dig. Anonym tills du säger ja.',
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/verktyg/bli-upptackt',
  },
  robots: { index: true, follow: true },
}

export default function BliUpptacktToolLayout({ children }: { children: React.ReactNode }) {
  return children
}
