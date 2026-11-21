/**
 * Annonsens krav och brevets svar (BYGGSPEC avsnitt 4, "Kraven").
 *
 * AI-anropet (src/lib/openai/brevKrav.ts) föreslår krav och citat. Servern
 * godkänner bara citat som står ordagrant i styckena, jämfört med
 * normaliserade blanksteg; annars blir citatet null. Färre än tre krav ger
 * [] (inget kravmått, gissa aldrig). Efter en textändring räknas träffarna om
 * här, utan AI: ett krav har svar så länge dess citat står kvar.
 *
 * Klientsäker och ren.
 */
import type { BrevKrav } from './brevmall/typer'

export const MAX_KRAV = 8
export const MIN_KRAV = 3
export const MAX_KRAV_TECKEN = 40
export const MAX_MENING_TECKEN = 600

/** Blanksteg normaliserade, typografiska citattecken och apostrofer raka. */
export function normaliseraForJamforelse(text: string): string {
  return text
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Står citatet ordagrant (blanksteg normaliserade) i något av styckena? */
export function citatFinns(citat: string, stycken: readonly string[]): boolean {
  const c = normaliseraForJamforelse(citat)
  if (c.length < 3) return false
  return stycken.some((s) => normaliseraForJamforelse(s).includes(c))
}

/**
 * Citatet som det står i styckena (originalets citattecken), eller null.
 * Styckena är redan rensade på dubbla blanksteg (rensaStycke), så
 * normaliseringen byter bara tecken ett mot ett och läget går att återanvända.
 */
export function hittaCitat(citat: string, stycken: readonly string[]): string | null {
  const c = normaliseraForJamforelse(citat)
  if (c.length < 3) return null
  for (const s of stycken) {
    const i = normaliseraForJamforelse(s).indexOf(c)
    if (i < 0) continue
    const orig = s.trim()
    return orig.length === normaliseraForJamforelse(s).length ? orig.slice(i, i + c.length) : c
  }
  return null
}

/** Kravets text: versal först, högst 40 tecken, kapad vid ett ordslut. */
export function stadaKravText(text: string): string {
  let t = text.replace(/\s+/g, ' ').trim().replace(/[.:;,]+$/, '')
  if (t.length > MAX_KRAV_TECKEN) {
    const kapad = t.slice(0, MAX_KRAV_TECKEN + 1)
    const sista = kapad.lastIndexOf(' ')
    t = (sista > 15 ? kapad.slice(0, sista) : t.slice(0, MAX_KRAV_TECKEN)).replace(/[.:;,]+$/, '').trim()
  }
  return t ? t.charAt(0).toLocaleUpperCase('sv-SE') + t.slice(1) : t
}

/**
 * Tolkar och validerar modellens svar mot styckena.
 *
 * Ger null när svaret inte går att tolka alls (anroparen sparar då null =
 * inte läst), [] när färre än tre krav håller, annars högst åtta krav.
 * Dubbletter (samma krav, skiftläge oräknat) tas bort.
 */
export function valideraKrav(raw: unknown, stycken: readonly string[]): BrevKrav[] | null {
  const lista = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { krav?: unknown }).krav)
      ? (raw as { krav: unknown[] }).krav
      : null
  if (!lista) return null

  const ut: BrevKrav[] = []
  const sett = new Set<string>()
  for (const post of lista) {
    if (!post || typeof post !== 'object') continue
    const p = post as { krav?: unknown; citat?: unknown }
    if (typeof p.krav !== 'string') continue
    const krav = stadaKravText(p.krav)
    if (krav.length < 2) continue
    const nyckel = krav.toLocaleLowerCase('sv-SE')
    if (sett.has(nyckel)) continue
    sett.add(nyckel)
    const citat = typeof p.citat === 'string' ? hittaCitat(p.citat, stycken) : null
    ut.push({ krav, citat })
    if (ut.length >= MAX_KRAV) break
  }
  return ut.length < MIN_KRAV ? [] : ut
}

/** Kravlistan ur en sparad rad (jsonb), eller null om den saknas eller är trasig. */
export function lasSparadeKrav(varde: unknown): BrevKrav[] | null {
  if (!Array.isArray(varde)) return null
  return varde
    .filter((k): k is { krav: string; citat?: unknown } => !!k && typeof (k as { krav?: unknown }).krav === 'string')
    .map((k) => ({ krav: k.krav, citat: typeof k.citat === 'string' ? k.citat : null }))
}

/**
 * Kraven med träffarna omräknade mot styckena, utan AI. Ett citat som inte
 * längre står i texten blir null i svaret. Den sparade listan behåller sitt
 * citat, så att träffen kommer tillbaka om texten skrivs tillbaka.
 */
export function kravMedTraffar(krav: readonly BrevKrav[] | null, stycken: readonly string[]): BrevKrav[] | null {
  if (!krav) return null
  return krav.map((k) => ({ krav: k.krav, citat: k.citat && citatFinns(k.citat, stycken) ? k.citat : null }))
}

/** Kravmåttet: antal krav och hur många som har svar, eller null när mått saknas. */
export function kravMatt(krav: readonly BrevKrav[] | null): { antal: number; medSvar: number; saknas: number } | null {
  if (!krav || krav.length < MIN_KRAV) return null
  const medSvar = krav.filter((k) => k.citat).length
  return { antal: krav.length, medSvar, saknas: krav.length - medSvar }
}

/** Stycket en ny mening hamnar i som förval: näst sista, eller det enda. */
export function forvaltStycke(antalStycken: number): number {
  if (antalStycken <= 1) return 0
  return antalStycken - 2
}

/**
 * "Lägg till i brevet" för ett saknat krav: meningen läggs sist i stycket
 * (förval näst sista) och blir kravets citat. Ger null när indata inte håller.
 */
export function laggTillMening(
  stycken: readonly string[],
  krav: readonly BrevKrav[],
  kravIndex: number,
  mening: string,
  styckeIndex?: number | null
): { stycken: string[]; krav: BrevKrav[]; stycke: number } | null {
  const ren = mening.replace(/\s+/g, ' ').trim()
  if (ren.length < 3 || ren.length > MAX_MENING_TECKEN) return null
  if (!Number.isInteger(kravIndex) || kravIndex < 0 || kravIndex >= krav.length) return null
  const nyaStycken = [...stycken]
  let i = styckeIndex ?? forvaltStycke(nyaStycken.length)
  if (!Number.isInteger(i) || i < 0) return null
  if (nyaStycken.length === 0) {
    nyaStycken.push(ren)
    i = 0
  } else {
    if (i >= nyaStycken.length) return null
    const fore = nyaStycken[i].trim()
    nyaStycken[i] = fore ? `${fore} ${ren}` : ren
  }
  const nyaKrav = krav.map((k, j) => (j === kravIndex ? { krav: k.krav, citat: ren } : { ...k }))
  return { stycken: nyaStycken, krav: nyaKrav, stycke: i }
}
