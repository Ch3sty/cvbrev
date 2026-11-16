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
export function typsnittFor(
  def: MallDef,
  val?: MallVal
): { brod: TypsnittId; rubrik: TypsnittId; namn: TypsnittId; titel: TypsnittId; kontakt: TypsnittId } {
  const brod = val?.typsnitt ?? def.typsnitt.brod
  const rubrik = def.typsnitt.rubrik ?? def.typsnitt.brod
  return {
    brod,
    rubrik,
    namn: def.typsnitt.namn ?? rubrik,
    titel: def.typsnitt.titel ?? brod,
    kontakt: def.typsnitt.kontakt ?? brod,
  }
}

/** Alla typsnitt en mall använder med ett val (för @font-face). */
export function allaTypsnitt(def: MallDef, val?: MallVal): TypsnittId[] {
  const t = typsnittFor(def, val)
  return [...new Set([t.brod, t.rubrik, t.namn, t.titel, t.kontakt, ...(def.rubrik.nummer ? [def.rubrik.nummer.typsnitt] : [])])]
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
  /** Fotots höjd, mm (samma som fotoMm utom för stående foto). */
  fotoHojdMm: number
  /** Steget i "Få plats på en sida", 0 utan valet. */
  steg: number
  /** Bandets minsta höjd efter krympningen (Mörkrum). */
  bandHojd: (h: number | undefined) => number | undefined
  /** Skala på en marginalkolumn med stora årtal (Tusch). */
  marginalSkala: number
  /** Skala på luften i tonade rubrikband (Raster). */
  bandLuftSkala: number
}

/** Antalet steg i "Få plats på en sida" (granskningen G7 och R9, UX U5). */
export const EN_SIDA_STEG = 5

/**
 * Stegen i "Få plats på en sida", i tur och ordning tills CV:t ryms
 * (PDF-kedjan provar steg 1 till 5, Word får samma steg). Ryms CV:t redan på
 * en sida gör valet ingenting (src/lib/cv/mallar/pdf.ts).
 *   1. mallens egna element krymper först (Mörkrums block 72 till 50 mm,
 *      Tuschs årtalskolumn 34 till 28 mm, Horisonts axel, Rasters band),
 *      och mallens enSida (marginal minus 4 mm, grad minus 0,5 pt, luft
 *      ovanför avsnitt 4 mm),
 *   2. grad minus ytterligare 0,5 pt och radavstånd minus 0,06,
 *   3. luft ovanför avsnitt 3 mm och mellan poster 2,5 mm,
 *   4. marginalerna minus ytterligare 2 mm, luft 2,5 och 2 mm, radavstånd
 *      minus 0,1, halva luften under huvudet, 1,5 mm under rubrikerna och
 *      fotot tre fjärdedelar,
 *   5. som 4 men med art-directors lägre golv.
 * Golven: brödtext 9,0 pt och sekundär text 8,0 pt i steg 1 till 4 (UX), 8,5
 * och 7,5 pt i steg 5 (art-director R9); radavståndet aldrig under 1,15.
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
  const golv = steg >= 5 ? { brod: 8.5, sekundar: 7.5 } : { brod: 9, sekundar: 8 }
  return {
    steg,
    // En grad krymper aldrig under sitt golv och växer aldrig: brödtext och
    // större (från 8,5 pt) har brödgolvet, mindre text det sekundära.
    grad: (pt: number) => (grad === 0 ? pt : Math.min(pt, Math.max(pt >= 8.5 ? golv.brod : golv.sekundar, pt + grad))),
    sida,
    luftOver: steg >= 4 ? Math.min(def.rubrik.luftOver, 2.5) : steg >= 3 ? Math.min(def.rubrik.luftOver, 3) : steg >= 1 ? Math.min(def.rubrik.luftOver, en.luftOver) : def.rubrik.luftOver,
    luftMellan: steg >= 4 ? Math.min(def.post.luftMellan, 2) : steg >= 3 ? Math.min(def.post.luftMellan, 2.5) : def.post.luftMellan,
    radavstand: Math.max(Math.min(def.radavstand, 1.15), steg >= 4 ? def.radavstand - 0.1 : steg >= 2 ? def.radavstand - 0.06 : def.radavstand),
    luftUnderHuvud: steg >= 4 ? def.huvud.luftUnder / 2 : def.huvud.luftUnder,
    luftUnderRubrik: steg >= 4 ? Math.min(def.rubrik.luftUnder, 1.5) : def.rubrik.luftUnder,
    fotoMm: (def.foto?.storlek ?? 30) * (steg >= 4 ? 0.75 : 1),
    fotoHojdMm:
      (def.foto?.form === 'staende' ? def.foto.hojd ?? (def.foto.storlek * 4) / 3 : def.foto?.storlek ?? 30) * (steg >= 4 ? 0.75 : 1),
    // Mallens egna element (steg 1 och framåt).
    bandHojd: (h: number | undefined) => (h === undefined ? undefined : steg >= 1 ? Math.min(h, Math.max(50, h * 0.7)) : h),
    marginalSkala: steg >= 1 ? 14 / 17 : 1,
    bandLuftSkala: steg >= 1 ? 0.6 : 1,
  }
}
