/**
 * Vart en hints knapp leder och vad den heter (utkast v4 avsnitt 2). Ren,
 * så att både serverkomponenter (navigeringen) och klientöarna (Nästa steg,
 * Fler steg) kan använda den.
 *
 * Knappen öppnar testtypens meny på Tester (/dashboard/tester/alla?typ=),
 * en befintlig adress som också fungerar i appen. Knappar som startar
 * direkt, Nivåkollen i en typ som inte är mätt, går till knapp.href. Kräver
 * knappen Premium står "Ingår i Premium", och menyn visar låsen.
 */

import { menyHref } from '@/lib/tester/v4/rutter'
import type { Hint, HintTyp } from '@/lib/tester/v4/typer'
import { HEM_V4 } from './copy'

/** Hintar vars Nivåkoll-knapp startar direkt i stället för att öppna menyn. */
const STARTAR_DIREKT: ReadonlySet<HintTyp> = new Set(['forsta_steg', 'nivakoll_saknas', 'nivakoll_paborjad', 'prova_nytt'])

/** Vart hintens knapp leder. */
export function hintHref(h: Pick<Hint, 'typ' | 'testtyp' | 'knapp'>): string {
  if (!h.testtyp) return h.knapp.href
  if (!h.knapp.las && h.knapp.slag === 'nivakoll' && STARTAR_DIREKT.has(h.typ)) return h.knapp.href
  return menyHref(h.testtyp)
}

/** Knappens text: låsta hintar säger vad som krävs. */
export function hintEtikett(h: Pick<Hint, 'knapp'>): string {
  return h.knapp.las ? HEM_V4.las : h.knapp.etikett
}
