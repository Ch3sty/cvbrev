/**
 * Central Metadata Configuration för Jobbcoach.ai
 * Används för Open Graph, Twitter Cards och generella meta tags
 */

export const siteMetadata = {
  siteName: 'Jobbcoach.ai',
  siteUrl: 'https://jobbcoach.ai',
  defaultTitle: 'Jobbcoach.ai - CV, personligt brev och jobbmatchning i Sverige',
  defaultDescription: 'Skapa professionella CV:n och personliga brev snabbt med Jobbcoach.ai. Gratis verktyg för jobbsökare i Sverige.',
  twitterHandle: '@jobbcoach_ai',
  locale: 'sv_SE',

  // Färger för OG-bilder (gradient)
  brandColors: {
    blue: '#2563eb',    // blue-600
    purple: '#9333ea',  // purple-600
    pink: '#db2777',    // pink-600
  },

  // Default OG-bild dimensioner
  ogImage: {
    width: 1200,
    height: 630,
  },
} as const;
