import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:
    'LinkedIn-optimering: hamna i rekryterarnas sÃ¶kresultat | Jobbcoach.ai',
  description:
    'Optimera din LinkedIn-profil fÃ¶r rekryterar-sÃ¶kningar. Vi fÃ¶rbÃ¤ttrar rubrik, om-mig, erfarenhet, utbildning och kompetenser samtidigt. Du copy-pastar in din text och fÃ¥r optimerad version tillbaka. Gratis att bÃ¶rja, vi loggar aldrig in pÃ¥ din LinkedIn.',
  keywords: [
    'linkedin-optimering',
    'optimera linkedin',
    'linkedin profil tips',
    'linkedin headline',
    'linkedin om mig exempel',
    'linkedin profil sammanfattning',
    'hur skriver man linkedin profil',
    'linkedin keywords',
    'linkedin sÃ¶koptimering',
    'linkedin rekryterare',
    'linkedin headline tips',
    'linkedin fÃ¶r jobbsÃ¶kare',
  ],
  openGraph: {
    title:
      'LinkedIn-optimering: hamna i rekryterarnas sÃ¶kresultat',
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
      'LinkedIn-optimering: hamna i rekryterarnas sÃ¶kresultat',
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
