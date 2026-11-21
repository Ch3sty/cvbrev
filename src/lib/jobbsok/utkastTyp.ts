/**
 * Utkastets sort (Jobbsöket omgång 2, byggspec 2.2). Sorten lagras inte i
 * databasen (ingen kolumn utan migrering): den läses ur ämnesraden, som alltid
 * skrivs av servern (mallAmne) och börjar med AMNE_START för intervju och
 * provjobb. Klientsäker och ren.
 */
import type { Uppfoljning, UppfoljningsTyp } from './typer'

/** Ämnesradens början per sort och språk. Ämnesraden skrivs alltid av servern (mallAmne). */
export const AMNE_START = {
  intervju: { sv: 'Tack för intervjun', en: 'Thank you for the interview' },
  provjobb: { sv: 'Tack för provjobbet', en: 'Thank you for the trial day' },
} as const

/** Utkastets sort, läst ur ämnesraden. Allt som inte börjar som ett intervju- eller provjobbsmejl är 'ansokan'. */
export function utkastTyp(subject: string | null | undefined): UppfoljningsTyp {
  const s = (subject ?? '').trim()
  if (!s) return 'ansokan'
  for (const typ of ['intervju', 'provjobb'] as const) {
    if (s.startsWith(AMNE_START[typ].sv) || s.startsWith(AMNE_START[typ].en)) return typ
  }
  return 'ansokan'
}

/** Gäller utkastet för tjänstens läge? Oskickat, har text, och sorten är tjänstens foljUppTyp. */
export function utkastGaller(
  u: Pick<Uppfoljning, 'subject' | 'body' | 'sent_at'> | null | undefined,
  typ: UppfoljningsTyp | null
): boolean {
  if (!u || !typ || u.sent_at || !u.body) return false
  return utkastTyp(u.subject) === typ
}
