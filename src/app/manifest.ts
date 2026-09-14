import type { MetadataRoute } from 'next'

/**
 * Webbappsmanifestet (docs/plan-pwa.md, avsnitt 6).
 *
 * Det här är allt som krävs för att Chrome ska erbjuda installation, plus
 * det som gör att ikonen på hemskärmen ser ut som en app och inte som en
 * bokmärkesbild:
 *
 *   display: standalone   ingen adressrad, appen äger hela skärmen
 *   start_url             /dashboard, med source=pwa så vi kan mäta
 *                         återkomsten i PostHog (pwa_launch)
 *   id                    /dashboard, oberoende av start_url. Utan id
 *                         identifieras appen av start_url, och då hade en
 *                         ändring av spårningsparametern senare räknats som
 *                         en ny app av webbläsaren.
 *   theme_color           benvit, samma som marken, så systemets statusrad
 *                         och splash matchar sidan i stället för att blinka
 *                         vitt vid start
 *   maskable-ikonen       egen fil, motivet innanför den säkra cirkeln på
 *                         80 procent. Utan den lägger Android en vit platta
 *                         bakom ikonen och beskär vår egen mark fel.
 *
 * Ingen offline-funktion, inga shortcuts, inga screenshots: planen säger att
 * service workern bara finns för att installationen ska erbjudas.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/dashboard',
    name: 'Jobbcoach',
    short_name: 'Jobbcoach',
    description:
      'Ditt jobbsök på ett ställe: CV, personliga brev, jobbmatchning och rekryteringstester.',
    lang: 'sv',
    dir: 'ltr',
    start_url: '/dashboard?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#EDE8DF',
    background_color: '#EDE8DF',
    categories: ['productivity', 'business'],
    icons: [
      {
        src: '/pwa/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
