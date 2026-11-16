/**
 * Färger, typsnitt och mått ur en MallDef och ett val, som värden (hex,
 * typsnittsnamn, mm, pt). HTML-renderaren lägger dem i CSS-variabler,
 * Word-byggaren skriver dem i stilarna. En funktion för båda, så att PDF och
 * Word får samma färg och samma mått.
 */
import type { MallVal, TypsnittId } from './kontrakt'
import type { Farg, Hex, MallDef } from './typer'

export type { Hex }

/** Två hexfärger blandade: andel 0 ger a, 1 ger b. */
export function blanda(a: string, b: string, andel: number): Hex {
  const del = (h: string) => {
    const s = h.replace('#', '')
    const full = s.length === 3 ? s.split('').map((c) => c + c).join('') : s
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
  }
  const [x, y] = [del(a), del(b)]
  const ut = x.map((v, i) => Math.round(v + (y[i] - v) * andel))
  return `#${ut.map((v) => v.toString(16).padStart(2, '0')).join('')}` as Hex
}

/** Accenten för valet: index 0 till 3 i mallens fyra, annars mallens egen. */
export function accent(def: MallDef, val?: MallVal): Hex {
  const i = val?.farg
  return typeof i === 'number' && i >= 0 && i < def.accenter.length ? def.accenter[i] : def.accenter[0]
}

/** Mallens färgpalett för ett val, som hex. */
export interface Palett {
  accent: Hex
  ton: Hex
  text: Hex
  dampad: Hex
  linje: Hex
  vit: Hex
}

export function palett(def: MallDef, val?: MallVal): Palett {
  const a = accent(def, val)
  return {
    accent: a,
    ton: blanda(a, '#ffffff', def.farger.tonAndel ?? 0.86),
    text: def.farger.text,
    dampad: def.farger.dampad,
    linje: def.farger.linje,
    vit: '#ffffff',
  }
}

/** En Farg som hex. */
export function los(f: Farg | undefined, p: Palett, reserv: Hex): Hex {
  if (!f) return reserv
  if (f.startsWith('#')) return f as Hex
  return p[f as keyof Palett] ?? reserv
}

/** Typsnitten Word har på både Windows och Mac; mallar med Word håller sig till dem. */
export const WORD_TYPSNITT: readonly TypsnittId[] = ['calibri', 'arial', 'verdana', 'georgia', 'garamond', 'times']

/**
 * Brödtextens och namnets/rubrikernas typsnitt efter valet. Användarens val
 * ersätter bara brödtexten (spec avsnitt 4 punkt 12).
 */
export function typsnittFor(def: MallDef, val?: MallVal): { brod: TypsnittId; rubrik: TypsnittId } {
  return { brod: val?.typsnitt ?? def.typsnitt.brod, rubrik: def.typsnitt.rubrik ?? def.typsnitt.brod }
}

/** Mått och grader efter "Få plats på en sida". */
export interface Matt {
  grad: (pt: number) => number
  sida: { topp: number; hoger: number; botten: number; vanster: number }
  luftOver: number
  /** Luft mellan poster, mm. */
  luftMellan: number
  /** Brödtextens radavstånd. */
  radavstand: number
  /** Luft under huvudet, mm. */
  luftUnderHuvud: number
  /** Luft under rubrikerna, mm. */
  luftUnderRubrik: number
  /** Fotots storlek, mm (tre fjärdedelar i steg 4). */
  fotoMm: number
}

/** Antalet steg i "Få plats på en sida" (granskningen G7). */
export const EN_SIDA_STEG = 4

/**
 * Stegen i "Få plats på en sida", i tur och ordning tills CV:t ryms
 * (PDF-kedjan provar steg 1 till 4, Word får samma steg):
 *   1. mallens enSida (marginal minus 4 mm, grad minus 0,5 pt, luft ovanför avsnitt 4 mm),
 *   2. grad minus ytterligare 0,5 pt och radavstånd minus 0,06,
 *   3. luft ovanför avsnitt 3 mm och mellan poster 2,5 mm,
 *   4. marginalerna minus ytterligare 2 mm, och (utöver granskningens
 *      förslag, för att alla 20 ska nå en sida) luft 2,5 och 2 mm, radavstånd
 *      minus 0,1, halva luften under huvudet, 1,5 mm under rubrikerna och
 *      fotot tre fjärdedelar.
 * Sidospaltens bredd ändras inte.
 */
export function matt(def: MallDef, val?: MallVal): Matt {
  const steg = val?.enSida ? Math.min(EN_SIDA_STEG, Math.max(1, val.enSidaSteg ?? 1)) : 0
  const en = def.enSida
  const minus = steg >= 1 ? en.marginal + (steg >= 4 ? 2 : 0) : 0
  const grad = steg >= 1 ? en.grad - (steg >= 2 ? 0.5 : 0) : 0
  const sida = {
    topp: Math.max(8, def.sida.topp - minus),
    hoger: Math.max(8, def.sida.hoger - minus),
    botten: Math.max(8, def.sida.botten - minus),
    vanster: Math.max(8, def.sida.vanster - minus),
  }
  // Steg 4 tar dessutom luften under huvudet och rubrikerna och ytterligare
  // lite radavstånd: med bara marginalerna nådde nio av tjugo mallar inte en
  // sida med NORMALT_CV (granskningens grind för G7).
  return {
    grad: (pt: number) => Math.max(6, pt + grad),
    sida,
    luftOver: steg >= 4 ? Math.min(def.rubrik.luftOver, 2.5) : steg >= 3 ? Math.min(def.rubrik.luftOver, 3) : steg >= 1 ? Math.min(def.rubrik.luftOver, en.luftOver) : def.rubrik.luftOver,
    luftMellan: steg >= 4 ? Math.min(def.post.luftMellan, 2) : steg >= 3 ? Math.min(def.post.luftMellan, 2.5) : def.post.luftMellan,
    radavstand: steg >= 4 ? def.radavstand - 0.1 : steg >= 2 ? def.radavstand - 0.06 : def.radavstand,
    luftUnderHuvud: steg >= 4 ? def.huvud.luftUnder / 2 : def.huvud.luftUnder,
    luftUnderRubrik: steg >= 4 ? Math.min(def.rubrik.luftUnder, 1.5) : def.rubrik.luftUnder,
    fotoMm: (def.foto?.storlek ?? 30) * (steg >= 4 ? 0.75 : 1),
  }
}
