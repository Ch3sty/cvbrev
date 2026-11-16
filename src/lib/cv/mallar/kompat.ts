/**
 * Övergång: samma API som det gamla mallregistret (src/lib/cv/templates,
 * borttaget 2026-11-16) för komponenter som ännu inte bytts mot katalogen.
 * Liten: bara katalogen och aliasen. Generatorn ligger i kompat-generator.ts,
 * eftersom den drar in renderaren. Byggagent C ersätter komponenterna;
 * därefter tas båda filerna bort.
 */
import { losMallId } from './alias'

/** Finns mallen (gamla id löses med alias)? */
export function isValidTemplateId(id: string): boolean {
  return losMallId(id) !== null
}
