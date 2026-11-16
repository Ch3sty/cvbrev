/**
 * Vilket avsnitt en rubrik i dokumentet hör till (Dokument, träffytorna).
 *
 * Mallsystemet sätter data-sektion på rubrikerna (plan-mallar 3.2, villkor c).
 * Mallar som ännu saknar attributet läses på rubrikens text, så att träffytorna
 * fungerar i dagens mallar och i A:s nya utan att något byts ut. Klientsäker.
 */
import { SEKTIONER, type Sektion } from '@/lib/cv/mallar/kontrakt'

/** Ordningen spelar roll: "Legitimation och behörigheter" är intyg, inte kompetenser. */
const MONSTER: readonly [Sektion, RegExp][] = [
  ['intyg', /certifi|intyg|behörighet|legitimation|körkort|licens|kurser och/i],
  ['sprak', /språk|language/i],
  ['referenser', /referens/i],
  ['intressen', /intress|fritid/i],
  ['projekt', /projekt/i],
  ['utbildning', /utbildning|examen|studier|education/i],
  ['erfarenhet', /erfarenhet|anställning|karriär|uppdrag|experience|arbetsliv/i],
  ['kompetenser', /kompetens|färdighet|kunskap|verktyg|system|skills|tekni/i],
  ['profil', /profil|sammanfattning|om mig|presentation|summary/i],
]

export function arSektion(v: unknown): v is Sektion {
  return typeof v === 'string' && (SEKTIONER as readonly string[]).includes(v)
}

/** Avsnittet för en rubriktext, eller null när texten inte är en avsnittsrubrik. */
export function sektionForRubrik(text: string): Sektion | null {
  const t = text.replace(/\s+/g, ' ').trim()
  if (!t || t.length > 48) return null
  for (const [sektion, re] of MONSTER) if (re.test(t)) return sektion
  return null
}
