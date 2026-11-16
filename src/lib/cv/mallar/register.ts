/**
 * Mallregistret (server): alla definitioner, i katalogens ordning.
 *
 * Komponenterna läser katalogen (katalog.ts), aldrig registret: registret
 * bär hela definitionerna, och de konstnärliga mallarnas CSS. Rutterna,
 * renderarna och testerna läser härifrån.
 */
import { MALL_KATALOG } from './katalog'
import { MALL_ALIAS, losMallId, losMallIdEllerForval } from './alias'
import type { MallDef } from './typer'
import { provEnspalt } from './definitioner/prov-enspalt'
import { provSidospalt } from './definitioner/prov-sidospalt'

export { MALL_ALIAS, losMallId, losMallIdEllerForval }

const DEFINITIONER: readonly MallDef[] = [provEnspalt, provSidospalt]

const PER_ID = new Map(DEFINITIONER.map((d) => [d.id, d]))

/** Alla mallar i katalogens ordning. */
export const MALLAR: readonly MallDef[] = MALL_KATALOG.map((k) => {
  const d = PER_ID.get(k.id)
  if (!d) throw new Error(`Mallen ${k.id} står i katalogen men saknar definition`)
  return d
})

/** Definitionen för ett id i registret (inget alias), eller undefined. */
export function getMall(id: unknown): MallDef | undefined {
  return typeof id === 'string' ? PER_ID.get(id) : undefined
}

/** Definitionen efter alias, eller undefined om id:t är okänt. */
export function getMallMedAlias(id: unknown): MallDef | undefined {
  const los = losMallId(id)
  return los ? PER_ID.get(los) : undefined
}
