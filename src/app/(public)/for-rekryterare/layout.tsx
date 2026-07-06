import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hitta kandidater med verifierade testresultat | Jobbcoach.ai',
  description:
    'Sök i en kandidatpool där varje profil har verifierade testresultat med percentiler. Anonymt tills kandidaten säger ja. Gratis under betan.',
  keywords:
    'rekrytera kandidater, kandidatpool, verifierade testresultat, kognitiva tester rekrytering, hitta kandidater, rekryteringsverktyg, headhunting verktyg',
  openGraph: {
    title: 'Kandidater med bevisade färdigheter | Jobbcoach.ai',
    description:
      'Varje kandidat i poolen har verifierade testresultat med percentiler. Filtrera på villkor, visa intresse, kontakt låses upp när kandidaten säger ja.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai/for-rekryterare',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rekrytera kandidater med bevisade färdigheter | Jobbcoach.ai',
    description:
      'Verifierade testresultat med percentiler på varje kandidat. Gratis för verifierade rekryterare under betan.',
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/for-rekryterare',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ForRekryterareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
