/**
 * Mallregistret (server): alla definitioner, i katalogens ordning.
 *
 * Komponenterna läser katalogen (katalog.ts), aldrig registret: registret
 * bär hela definitionerna och de konstnärliga mallarnas CSS. Rutterna,
 * renderarna och testerna läser härifrån.
 */
import { MALL_KATALOG } from './katalog'
import { MALL_ALIAS, losMallId, losMallIdEllerForval } from './alias'
import type { MallDef } from './typer'
import { linne } from './definitioner/linne'
import { bjork } from './definitioner/bjork'
import { koppar } from './definitioner/koppar'
import { kalksten } from './definitioner/kalksten'
import { granit } from './definitioner/granit'
import { kolumn } from './definitioner/kolumn'
import { arsring } from './definitioner/arsring'
import { antikva } from './definitioner/antikva'
import { fasad } from './definitioner/fasad'
import { raster } from './definitioner/raster'
import { folio } from './definitioner/folio'
import { stal } from './definitioner/stal'
import { morkrum } from './definitioner/morkrum'
import { terrakotta } from './definitioner/terrakotta'
import { kvadrat } from './definitioner/kvadrat'
import { siluett } from './definitioner/siluett'
import { ritning } from './definitioner/ritning'
import { tidning } from './definitioner/tidning'
import { tusch } from './definitioner/tusch'
import { horisont } from './definitioner/horisont'

export { MALL_ALIAS, losMallId, losMallIdEllerForval }

const DEFINITIONER: readonly MallDef[] = [
  linne, bjork, koppar, kalksten, granit, kolumn, arsring, antikva, fasad, raster, folio, stal,
  morkrum, terrakotta, kvadrat, siluett, ritning, tidning, tusch, horisont,
]

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
