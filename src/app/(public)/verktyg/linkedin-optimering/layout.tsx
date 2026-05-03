import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LinkedIn-optimering för Jobbsökare | Syns i Rekryterarnas Sökningar | Jobbcoach.ai',
  description: 'Optimera din LinkedIn-profil för AI-driven rekrytering. Få fler synligheter och kontakter från rekryterare med keywords, headline-generator och About-optimering. Gratis att testa.',
  keywords: 'LinkedIn-optimering, LinkedIn-profil, optimera LinkedIn, LinkedIn tips Sverige, LinkedIn rekrytering, LinkedIn keywords, LinkedIn headline, LinkedIn för jobbsökare, AI-rekrytering LinkedIn, synas på LinkedIn',
  openGraph: {
    title: 'LinkedIn-profil som lockar rekryterare | Jobbcoach.ai',
    description: '80% av rekryterare söker kandidater på LinkedIn. Optimera din profil för AI-drivna sökningar på 5 minuter. Gratis att testa.',
    type: 'website',
    locale: 'sv_SE',
    url: 'https://jobbcoach.ai/verktyg/linkedin-optimering',
    siteName: 'Jobbcoach.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LinkedIn-optimering för jobbsökare | Jobbcoach.ai',
    description: 'Optimera din LinkedIn-profil för AI-driven rekrytering. 3x fler synligheter med rätt keywords och optimerad profil.',
  },
  alternates: {
    canonical: 'https://jobbcoach.ai/verktyg/linkedin-optimering'
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default function LinkedInOptimeringSidaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
