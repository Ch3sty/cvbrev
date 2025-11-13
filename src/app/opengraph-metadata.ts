import { Metadata } from 'next'

export const openGraphMetadata: Metadata = {
  title: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
  description: 'Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige.',
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://jobbcoach.ai',
    siteName: 'Jobbcoach.ai',
    title: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
    description: 'Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige.',
    images: [
      {
        url: 'https://jobbcoach.ai/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Skapa ATS-anpassade CV:n, personliga brev och träna på rekryteringstester med Jobbcoach.ai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@jobbcoach_ai',
    title: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
    description: 'Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige.',
    images: ['https://jobbcoach.ai/opengraph-image'],
  },
}
