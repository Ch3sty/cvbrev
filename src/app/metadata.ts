/**
 * Central Metadata Configuration för Jobbcoach.ai
 * Används för Open Graph, Twitter Cards och generella meta tags
 */

export const siteMetadata = {
  siteName: 'Jobbcoach.ai',
  siteUrl: 'https://www.jobbcoach.ai',
  defaultTitle: 'Jobbcoach.ai - CV, personligt brev, jobbmatchning & rekryteringstester',
  defaultDescription: 'Skapa ATS-anpassade CV:n och personliga brev, få jobbmatchning och träna på rekryteringstester. Ett effektivt verktyg för arbetssökande i Sverige.',
  tagline: 'Ett effektivt verktyg för arbetssökande',
  twitterHandle: '@jobbcoach_ai',
  locale: 'sv_SE',

  // Färger för OG-bilder (gradient) - Matchar startsidan exakt
  brandColors: {
    blue: '#3B82F6',      // blue-600 (startsidan)
    indigo: '#6366F1',    // indigo-600 (startsidan)
    purple: '#9333EA',    // purple-600 (startsidan)
    green: '#10B981',     // emerald-600 (accent)
    pink: '#EC4899',      // pink-600 (accent)
  },

  // Sekundära färger för bakgrunder
  backgroundColors: {
    white: '#FFFFFF',
    slate50: '#F8FAFC',
    slate100: '#F1F5F9',
    slate200: '#E2E8F0',  // För borders med bättre kontrast
  },

  // Default OG-bild dimensioner
  ogImage: {
    width: 1200,
    height: 630,
  },
} as const;
