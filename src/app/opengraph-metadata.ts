import { Metadata } from 'next'

export const openGraphMetadata: Metadata = {
  title: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
  description: 'Skapa ATS-anpassade CV:n och personliga brev, fÃ¥ jobbmatchning och trÃ¤na pÃ¥ rekryteringstester. Ett effektivt verktyg fÃ¶r arbetssÃ¶kande i Sverige.',
  openGraph: {
    type: 'website',
    locale: 'sv_SE',
    url: 'https://www.jobbcoach.ai',
    siteName: 'Jobbcoach.ai',
    title: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
    description: 'Skapa ATS-anpassade CV:n och personliga brev, fÃ¥ jobbmatchning och trÃ¤na pÃ¥ rekryteringstester. Ett effektivt verktyg fÃ¶r arbetssÃ¶kande i Sverige.',
    images: [
      {
        url: 'https://www.jobbcoach.ai/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Skapa ATS-anpassade CV:n, personliga brev och trÃ¤na pÃ¥ rekryteringstester med Jobbcoach.ai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@jobbcoach_ai',
    title: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
    description: 'Skapa ATS-anpassade CV:n och personliga brev, fÃ¥ jobbmatchning och trÃ¤na pÃ¥ rekryteringstester. Ett effektivt verktyg fÃ¶r arbetssÃ¶kande i Sverige.',
    images: ['https://www.jobbcoach.ai/opengraph-image'],
  },
}
