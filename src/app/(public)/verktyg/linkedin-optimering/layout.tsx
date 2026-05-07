import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'LinkedIn-optimering: hamna i rekryterarnas sökresultat | Jobbcoach.ai',
  description:
    'Optimera din LinkedIn-profil för rekryterar-sökningar. Vi förbättrar rubrik, om-mig, erfarenhet, utbildning och kompetenser samtidigt. Du copy-pastar in din text och får optimerad version tillbaka. Gratis att börja, vi loggar aldrig in på din LinkedIn.',
  keywords: [
    'linkedin-optimering',
    'optimera linkedin',
    'linkedin profil tips',
    'linkedin headline',
    'linkedin om mig exempel',
    'linkedin profil sammanfattning',
    'hur skriver man linkedin profil',
    'linkedin keywords',
    'linkedin sökoptimering',
    'linkedin rekryterare',
    'linkedin headline tips',
    'linkedin för jobbsökare',
  ],
  openGraph: {
    title:
      'LinkedIn-optimering: hamna i rekryterarnas sökresultat',
    description:
      'Vi optimerar fem sektioner samtidigt och du copy-pastar tillbaka. En gratis optimering i veckan, ingen LinkedIn-inloggning.',
    url: 'https://www.jobbcoach.ai/verktyg/linkedin-optimering',
    siteName: 'Jobbcoach.ai',
    type: 'website',
    locale: 'sv_SE',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'LinkedIn-optimering: hamna i rekryterarnas sökresultat',
    description:
      'Vi optimerar fem sektioner samtidigt och du copy-pastar tillbaka. En gratis optimering i veckan.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.jobbcoach.ai/verktyg/linkedin-optimering',
  },
}

export default function LinkedinOptimeringLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
