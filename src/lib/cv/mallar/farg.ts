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

/** Typsnitt som laddas från Google Fonts i PDF:en och förhandsvisningen. */
export const WEBBTYPSNITT: Readonly<Partial<Record<TypsnittId, string>>> = {
  lato: 'Lato:ital,wght@0,300;0,400;0,700;1,400',
  'open-sans': 'Open+Sans:ital,wght@0,400;0,600;0,700;1,400',
  roboto: 'Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400',
  poppins: 'Poppins:ital,wght@0,300;0,400;0,500;0,600;1,400',
}

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
}

export function matt(def: MallDef, val?: MallVal): Matt {
  const en = val?.enSida ? def.enSida : null
  const minus = en?.marginal ?? 0
  const sida = {
    topp: Math.max(8, def.sida.topp - minus),
    hoger: Math.max(8, def.sida.hoger - minus),
    botten: Math.max(8, def.sida.botten - minus),
    vanster: Math.max(8, def.sida.vanster - minus),
  }
  return {
    grad: (pt: number) => Math.max(6, pt + (en?.grad ?? 0)),
    sida,
    luftOver: en ? Math.min(def.rubrik.luftOver, en.luftOver) : def.rubrik.luftOver,
  }
}
