// src/components/session/vn/las.ts
// =============================================================================
// Motorernas vyer till ramens form för Ord och text och Siffror och tabeller
// (plan-testflode-2026-11-20 etapp 2): Nivåkollens, Träningens och
// övningsprovets underlag och uppgifter blir samma VnU som nivåtestets, så
// att uppgiften ser likadan ut oavsett dörr. Rena funktioner.
// =============================================================================

import type { VnUnderlag } from '@/lib/tester/pass-typer'
import type { VnVisatUnderlag } from '@/lib/tester/vn-nivatest'
import type { VnU } from '../typer/Vn'

export type VnKind = 'verbal' | 'numerisk'

/** Passens och Nivåkollens underlag (pass-typer) till ramens. */
export function vnUnderlagFran(kind: VnKind, ul: VnUnderlag): VnVisatUnderlag {
  return kind === 'verbal'
    ? { id: ul.id, typ: 'text', titel: ul.titel, amne: ul.amne, text: ul.text ?? '' }
    : { id: ul.id, typ: 'siffror', titel: ul.titel, amne: ul.amne, kontext: ul.kontext ?? null, tabell: ul.tabell ?? null, diagram: ul.diagram ?? null }
}

/** En uppgift utan nummer i underlaget; numrera() sätter iDel och delAntal. */
export type VnUtanNummer = Omit<VnU, 'iDel' | 'delAntal'>

/** Numrerar uppgifterna inom varje underlag i den ordning de står. */
export function numrera(lista: VnUtanNummer[]): VnU[] {
  const antal = new Map<string, number>()
  for (const u of lista) antal.set(u.del, (antal.get(u.del) ?? 0) + 1)
  const sett = new Map<string, number>()
  return lista.map((u) => {
    const n = (sett.get(u.del) ?? 0) + 1
    sett.set(u.del, n)
    return { ...u, iDel: n, delAntal: antal.get(u.del) ?? 1 }
  })
}

/** En uppgift ur en punkt med alternativ (passen, Nivåkollen). */
export function vnUppgiftFran(
  kind: VnKind,
  p: { nyckel: string; text: string; alternativ: { id: string; text: string }[] },
  underlag: VnVisatUnderlag,
  punkt?: string
): VnUtanNummer {
  return {
    nyckel: p.nyckel,
    kind,
    del: underlag.id,
    punkt: punkt ?? p.nyckel,
    underlag,
    text: p.text,
    alternativ: p.alternativ,
    form: kind === 'verbal' ? 'tre' : 'rader',
  }
}

/** Svarsvärdet (alternativets id) till visat index. */
export function indexFor(u: Pick<VnU, 'alternativ'>, varde: string | null | undefined): number | null {
  if (varde == null) return null
  const i = u.alternativ.findIndex((a) => a.id === varde)
  return i < 0 ? null : i
}
