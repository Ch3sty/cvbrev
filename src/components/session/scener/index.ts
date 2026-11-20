/**
 * Scenerna i sessionsramen: provbladet per testtyp (plan-testflode-2026-11-20
 * avsnitt 4.1, 7.4 och 7.5; art director 2026-11-20).
 *
 * Var de används
 * - Startskärmen (`Startskarm`, 4.1 punkt 4): typens scen, samma SVG i alla
 *   lägen (Nivåkollen, nivåtest, Träna, övningsprov). Dator: 160 × 120 till
 *   höger om eyebrow och rubrik. Mobil: 96 px hög över texten, centrerad
 *   (`className="h-24 w-auto"`, viewBox behåller proportionen). Skärmen står
 *   på väggen, så scenen läggs i en ram med `illu-vagg`: konturen blir
 *   vagg-ink, ytan vagg-2 och kopparn står kvar. Första renderingen får
 *   `rita`, som ritar in konturen 600 ms och tonar in ytorna; vid
 *   "Fortsätt testet" och på kvot- och betalväggsvarianten står scenen
 *   stilla (ingen `rita`).
 * - Övningsprov med typ använder typens scen; I-provet (sex deltester) och
 *   övningsprov utan egen typ använder `iprov`. Mellanskärmen per deltest i
 *   I-provet använder deltestets typ.
 * - Resultatskärmen (4.2) har ingen scen på väggen: där står typens glyf
 *   (`TestGlyfer`, 48), ringen och märket. Scenen får stå i kortet Nästa
 *   steg eller på testkortet i Tester, då på papper utan `illu-vagg`, utan
 *   `rita`, 80 × 60 (`className="h-[60px] w-[80px]"`).
 *
 * Mått och lager
 * - Fasta attribut 160 × 120 och viewBox 0 0 160 120, så rutan har sin
 *   storlek före CSS och CLS är 0. className styr måttet.
 * - `aria-hidden="true"`: scenen är dekor, texten bredvid bär meningen.
 * - Inga externa resurser, inga bilder, inga id:n; går att rendera på servern.
 * - Färg ur tokens via --illu-* med reserver i --koppar, --ink-3, --papper,
 *   --ton: fungerar i ljust och mörkt läge och i appen Testklar.
 * - Rörelse bara med `rita`, via CSS i scener.module.css, och stängd under
 *   prefers-reduced-motion.
 *
 * Nycklar: testtypernas id ur `Deltyp` (src/lib/traning/mittTest.ts, samma
 * som TestTypId i src/lib/tester/v4/typer.ts plus personlighet) och `iprov`.
 */

import type { ComponentType } from 'react'
import type { Deltyp } from '@/lib/traning/mittTest'
import type { ScenProps } from './bas'
import ScenMatris from './ScenMatris'
import ScenFigurserie from './ScenFigurserie'
import ScenDeduktiv from './ScenDeduktiv'
import ScenVerbal from './ScenVerbal'
import ScenNumerisk from './ScenNumerisk'
import ScenTalserie from './ScenTalserie'
import ScenSpatial from './ScenSpatial'
import ScenOrdforrad from './ScenOrdforrad'
import ScenPersonlighet from './ScenPersonlighet'
import ScenProv from './ScenProv'

export type { ScenProps } from './bas'
export {
  ScenMatris,
  ScenFigurserie,
  ScenDeduktiv,
  ScenVerbal,
  ScenNumerisk,
  ScenTalserie,
  ScenSpatial,
  ScenOrdforrad,
  ScenPersonlighet,
  ScenProv,
}

export type ScenId = Deltyp | 'iprov'

export const SCENER: Readonly<Record<ScenId, ComponentType<ScenProps>>> = {
  matris: ScenMatris,
  figurserie: ScenFigurserie,
  deduktiv: ScenDeduktiv,
  verbal: ScenVerbal,
  numerisk: ScenNumerisk,
  talserie: ScenTalserie,
  spatial: ScenSpatial,
  ordforrad: ScenOrdforrad,
  personlighet: ScenPersonlighet,
  iprov: ScenProv,
}

export function arScenId(v: unknown): v is ScenId {
  return typeof v === 'string' && v in SCENER
}

/** Scenen för ett typ-id; okänt id ger provets scen. */
export function scenFor(id: string): ComponentType<ScenProps> {
  return arScenId(id) ? SCENER[id] : ScenProv
}
