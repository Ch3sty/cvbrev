// Mönstren på målgången, resultatsidan och i genomgången (omgång 3, steg 4).
// Namnen och rubrikerna kommer ur namntabellen (lib/tester/v4/monsterNamn.ts),
// så att resultaten säger samma sak som Hem, Tester och Din utveckling. Ett
// mönster som inte går att känna igen ger null: ett internt id når aldrig
// användaren. Riktad träning bara för typerna som har en startadress per
// mönster (figurserier och deduktivt väljer det svagaste själva).

import { MONSTER_NAMN, monsterId } from '@/lib/tester/v4/monsterNamn'
import { tranaHref } from '@/lib/tester/v4/rutter'
import type { TestTypId } from '@/lib/tester/v4/typer'

export interface MonsterRad {
  /** "Växande steg" */
  namn: string
  /** "Öva på växande steg" */
  ova: string
  /** Riktad träning i mönstret, null när typen saknar den. */
  href: string | null
}

const RIKTAD: readonly TestTypId[] = ['matris', 'verbal', 'numerisk', 'talserie', 'spatial', 'ordforrad']

/** Namnet, rubriken och den riktade träningen för ett mönster (id eller namn). */
export function monsterRad(typ: TestTypId, f: string | null | undefined): MonsterRad | null {
  const id = monsterId(typ, f)
  if (!id) return null
  const r = MONSTER_NAMN[typ][id]
  // Spatial förmåga: formen B tränas också med klipp.
  const nyckel = id === 'Bklipp' ? 'B' : id
  return { namn: r.namn, ova: r.ova, href: RIKTAD.includes(typ) ? tranaHref(typ, nyckel) : null }
}

/** Mönstrets namn, aldrig ett id. */
export function monsterText(typ: TestTypId, f: string | null | undefined): string | null {
  return monsterRad(typ, f)?.namn ?? null
}

/** Övningsprovets mönster per uppgift ur genomgångens `monster` (namnet, satt av servern), i postordningen. */
export function monsterPerUppgift(vy: { genomgang?: { nyckel: string; monster?: string | null }[] | null }, nycklar: string[]): (string | null)[] | null {
  const per = new Map((vy.genomgang ?? []).map((g) => [g.nyckel, g.monster ?? null] as const))
  const ut = nycklar.map((n) => per.get(n) ?? null)
  return ut.some(Boolean) ? ut : null
}

/** Startadressen för riktad träning i mönstret, null när typen saknar den eller mönstret är okänt. */
export function riktadHref(typ: TestTypId, f: string | null | undefined): string | null {
  return monsterRad(typ, f)?.href ?? null
}
