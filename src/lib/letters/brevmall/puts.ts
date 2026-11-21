/**
 * Brevets egna tillägg per mall (putsningen av fem brevmallar 2026-11-21).
 *
 * CV-mallens definition (MallDef) ändras aldrig: brevDef() gör en kopia och
 * lägger tabellens värden på kopian, brevMatt() läser brödtextens grad och
 * brevCss()/word.ts läser ärenderadens färg. En mall som inte står här ritas
 * precis som förut. Backa en mall genom att ta bort dess rad.
 *
 * Klientsäker (inga Node-moduler).
 */
import { blanda } from '@/lib/cv/mallar/farg'
import type { HuvudBand, MallDef } from '@/lib/cv/mallar/typer'
import { kontrast } from './kontrast'

export interface BrevPuts {
  /** Brevets sidmarginaler i mm (vänster, höger, topp, botten); huvudet följer med. */
  sida?: Partial<MallDef['sida']>
  /** Brödtextens grad i steg 0 (pt). Steg 1 och 2 räknas från den (minus 0,5 och 1). */
  brod?: number
  /** Huvudets luft under namnet och titeln (mm). */
  luftTitel?: number
  luftKontakt?: number
  /** Bandet (Mörkrum): luft och minsta höjd i brevet. */
  band?: { luft?: Partial<HuvudBand['luft']>; minHojd?: number }
  /** Namnrutan (Kvadrat): sidan i mm och luften innanför; namnet anpassas till rutan på två rader. */
  block?: { storlek: number; luft: number; minNamnPt: number; maxNamnPt: number }
  /** Ärenderaden i mallens accent, mörkad tills kontrasten mot papperet är minst 4,5. */
  arendeAccent?: boolean
  /**
   * Uppskattningens teckenbredd i em per brödtypsnitt (standard 0,5). Bara
   * typsnitt som står här får en smalare bredd; användarens andra val räknas
   * som förut, så att Word aldrig väljer ett för stort steg.
   */
  teckenEm?: Partial<Record<string, number>>
  /** Brevets egen CSS efter allt annat. */
  css?: string
}

const PUTS: Record<string, BrevPuts> = {
  // Kortare rader (högst cirka 90 tecken) och 11 pt: marginalerna 16 till 40 mm. Namnet får
  // minst 45 % av huvudet, så att en lång e-post bryts i kontakten i stället för att trycka ut namnet.
  not: {
    sida: { vanster: 40, hoger: 40 },
    brod: 11,
    teckenEm: { calibri: 0.42 },
    css: `.brev .huvud-delad .huvud-text{flex:1 1 0;min-width:45%}
.brev .huvud-delad .kontakt{flex:0 1 auto;min-width:0}`,
  },
  // Bandet 52 till omkring 40 mm (namnet i samma grad), ärenderaden i mörkad accent.
  morkrum: { band: { luft: { topp: 8, botten: 5 }, minHojd: 40 }, luftTitel: 1, luftKontakt: 2.5, arendeAccent: true },
  // Rutan 56 till 32 mm, namnet på två rader i rutan (14 pt för Erik Lindberg) och alltid huvudets största text.
  kvadrat: { block: { storlek: 32, luft: 3.5, minNamnPt: 9, maxNamnPt: 15 } },
  // Ärenderaden i accenten (som titeln i bandet), 11 pt; bandets luft 12/10 till 10/8 mm så att långa brevet ryms i steg 1.
  panorama: { brod: 11, arendeAccent: true, css: `.brev .huvud-band{padding-top:10mm;padding-bottom:8mm}` },
}

function frys<T>(o: T): T {
  if (o && typeof o === 'object') {
    for (const v of Object.values(o)) frys(v)
    Object.freeze(o)
  }
  return o
}

/** Tabellen, fryst. */
export const BREV_PUTS: Readonly<Record<string, Readonly<BrevPuts>>> = frys(PUTS)

/** Putsningen för en mall, eller undefined. */
export function brevPuts(id: string): Readonly<BrevPuts> | undefined {
  return Object.prototype.hasOwnProperty.call(BREV_PUTS, id) ? BREV_PUTS[id] : undefined
}

/**
 * Lägger putsningen på en brevkopia av definitionen. `ut` är brevDef:s egen
 * kopia; de delade underobjekten (sida, huvud, band, block, namn) kopieras
 * innan de ändras, så att CV-mallens definition aldrig rörs.
 */
export function laggPaPuts(ut: MallDef): MallDef {
  const p = brevPuts(ut.id)
  if (!p) return ut
  if (p.sida) ut.sida = { ...ut.sida, ...p.sida }
  if (p.luftTitel !== undefined || p.luftKontakt !== undefined || p.band || p.block) {
    const h = { ...ut.huvud }
    if (p.luftTitel !== undefined) h.luftTitel = p.luftTitel
    if (p.luftKontakt !== undefined) h.luftKontakt = p.luftKontakt
    if (p.band && h.band) h.band = { ...h.band, luft: { ...h.band.luft, ...p.band.luft }, ...(p.band.minHojd !== undefined ? { minHojd: p.band.minHojd } : {}) }
    if (p.block && h.block) h.block = { ...h.block, storlek: p.block.storlek, luft: p.block.luft }
    ut.huvud = h
  }
  return ut
}

/** En färg mörkad mot svart i små steg tills kontrasten mot `mot` är minst `krav`. */
export function morkTillKontrast(farg: string, mot: string, krav = 4.5): string {
  if (kontrast(farg, mot) >= krav) return farg
  for (let i = 1; i <= 50; i++) {
    const f = blanda(farg, '#000000', i / 50)
    if (kontrast(f, mot) >= krav) return f
  }
  return '#000000'
}

/**
 * Namnet i Kvadrats ruta: delat på två rader där den längsta raden blir
 * kortast (vid mellanslag, annars efter bindestreck), och graden som får den
 * längsta raden att rymmas i rutan. Poppins 600 ungefär 0,62 em per tecken.
 * Rutan växer i CSS (kvadratisk) om ett namn ändå inte ryms vid minsta graden;
 * `rutaMm` är den uppskattade sidan (för uppskattadHojd).
 */
export function namnIRuta(namn: string, block: NonNullable<BrevPuts['block']>): { rader: string[]; pt: number; rutaMm: number } {
  const n = namn.trim().replace(/\s+/g, ' ')
  const brott: number[] = []
  for (let i = 1; i < n.length; i++) if (n[i] === ' ' || n[i - 1] === '-') brott.push(i)
  let rader = [n]
  let langst = n.length
  // Mellanslag före bindestreck: dela bara efter bindestreck om inget mellanslag ger en bättre rad.
  for (const i of brott) {
    const a = n.slice(0, i).trim()
    const b = n.slice(i).trim()
    const l = Math.max(a.length, b.length) + (n[i] === ' ' ? 0 : 0.5)
    if (l < langst) {
      langst = l
      rader = [a, b]
    }
  }
  const inre = block.storlek - 2 * block.luft
  const langd = Math.max(1, ...rader.map((r) => r.length))
  const pt = Math.floor((inre / (langd * 0.62 * 0.3528)) * 2) / 2
  const grad = Math.max(block.minNamnPt, Math.min(block.maxNamnPt, pt))
  return { rader, pt: grad, rutaMm: Math.max(block.storlek, langd * 0.62 * grad * 0.3528 + 2 * block.luft) }
}
