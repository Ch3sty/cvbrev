/**
 * MallMiniatyrer: riktiga mallar ur mallregistret som miniatyrer i 3:4
 * (docs/design/analys-artiklar-2026-09-23.html, avsnitt 6, "Showcasen").
 *
 * Delas mellan artiklarnas mallvisning (ersätter ArticleTemplateShowcase
 * med sina påhittade mallnamn) och CV-mallar-hubben i inloggat läge.
 * Bilden är registrets egen förhandsvisning (imagePath), namnen är
 * registrets. Inga badges: "Populärast" och "Trendigt" saknade underlag.
 *
 * Inga hooks och ingen 'use client': används i både server- och
 * klientkomponenter.
 */

import { CvMallVisning } from '@/components/artiklar/MallVisningar'

export { MallMiniatyr, type MallMiniatyrProps } from './MallMiniatyr'

/**
 * Mallvisningen i CV-artiklar (MDX-aliaset CVTemplateShowcase pekar hit).
 * Sedan mallsatsningen samma komponent som InteractiveCVShowcase: namnet
 * först, fem riktiga miniatyrer ur katalogen (plan-mallar 3.2).
 */
export default function MallMiniatyrer() {
  return <CvMallVisning />
}
