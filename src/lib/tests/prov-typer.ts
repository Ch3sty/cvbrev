// src/lib/tests/prov-typer.ts
// =============================================================================
// Provet utan konto per testtyp (docs/design/spec-prov-fler-typer-2026-11-09.md
// och saas-leads slutliga beslut 2026-11-10). Matrislogiken är som förut; de
// här typerna läggs till i samma skal på /verktyg/rekryteringstester/prova
// med ?typ=:
//
//   figurserie, verbal, numerisk, deduktiv   fem uppgifter, räknas in i
//                                            typens Nivåkoll med kontot
//   spatial, talserie, ordforrad             fem uppgifter, kontot fortsätter
//                                            i typens grundtest
//   iprov                                    sex uppgifter, en per deltest i
//                                            I-provets ordning, utan tid
//
// Ren fil: typer, adressens alias och texter. Urvalet, rättningen och
// genomgången bor i prov-typer.server.ts; facit lämnar aldrig servern före
// kontot.
// =============================================================================

import type { NivakollKind } from '@/lib/nivakoll/niva'
import type { NivakollGenomgang, NivakollUppgift } from '@/lib/nivakoll/typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'
import type { MittTest } from '@/lib/traning/mittTest'

export const PROV_TYPER = ['matris', 'figurserie', 'verbal', 'numerisk', 'deduktiv', 'spatial', 'talserie', 'ordforrad', 'iprov'] as const
export type ProvTyp = (typeof PROV_TYPER)[number]
/** Typerna utöver matrisen, som går genom prov-typer.server.ts. */
export type NyProvTyp = Exclude<ProvTyp, 'matris'>
export type Steg2ProvKind = 'spatial' | 'talserie' | 'ordforrad'
/** En uppgifts motor: Nivåkollens fyra eller steg 2:s tre. */
export type UppgiftKind = NivakollKind | Steg2ProvKind

export function arProvTyp(v: unknown): v is ProvTyp {
  return typeof v === 'string' && (PROV_TYPER as readonly string[]).includes(v)
}
export function arNyProvTyp(v: unknown): v is NyProvTyp {
  return arProvTyp(v) && v !== 'matris'
}
export function arNivakollUppgift(k: UppgiftKind): k is NivakollKind {
  return k === 'figurserie' || k === 'deduktiv' || k === 'verbal' || k === 'numerisk'
}

/** Adressens ord (specen: ?typ=figurer|verbal|numerisk) till typen. */
const ALIAS: Readonly<Record<string, ProvTyp>> = {
  matris: 'matris',
  logik: 'matris',
  figurer: 'figurserie',
  figurserie: 'figurserie',
  figurserier: 'figurserie',
  verbal: 'verbal',
  verbalt: 'verbal',
  numerisk: 'numerisk',
  numeriskt: 'numerisk',
  deduktiv: 'deduktiv',
  deduktivt: 'deduktiv',
  spatial: 'spatial',
  talserie: 'talserie',
  talserier: 'talserie',
  ordforrad: 'ordforrad',
  ord: 'ordforrad',
  iprov: 'iprov',
  'i-prov': 'iprov',
  'i-provet': 'iprov',
}

export function provTypUrAdress(v: unknown): ProvTyp {
  return typeof v === 'string' ? ALIAS[v.toLowerCase()] ?? 'matris' : 'matris'
}

/** Antal uppgifter per prov: fem, I-provet sex (en per deltest). */
export function provAntal(typ: ProvTyp): number {
  return typ === 'iprov' ? 6 : 5
}

/** Valet "Mitt test" som provet för med sig till kontot, när typen säger det. */
export const PROV_MITT_TEST: Partial<Record<ProvTyp, MittTest>> = { iprov: 'iprov' }

/** En uppgift som klienten får se: utan facit, regel, förklaring eller lösning. */
export type PublikUppgift =
  | { kind: NivakollKind; nyckel: string; data: NivakollUppgift; deltest?: string }
  | { kind: Steg2ProvKind; nyckel: string; data: unknown; deltest?: string }

export interface ProvStart {
  token: string
  typ: ProvTyp
  uppgifter: PublikUppgift[]
  /** Verbalt och numeriskt: underlagen per id. */
  underlag: Record<string, VnUnderlag>
  total: number
}

/** En uppgift i genomgången efter kontot. */
export type GenomgangUppgift =
  | { kind: NivakollKind; nyckel: string; data: NivakollUppgift; genomgang: NivakollGenomgang; seed: string; deltest?: string }
  | { kind: Steg2ProvKind; nyckel: string; data: unknown; genomgang: unknown; valt: number | null; correct: boolean; seed: string; deltest?: string }

/* ------------------------------------------------------------------ Texter */

export interface ProvTypCopy {
  /** Introts etikett och provets rubrikrad: "Figurserier, fem uppgifter". */
  kick: string
  h1: string
  ingressFet: string
  ingress: string
  /** Frågans kick under provet. */
  fragaKick: string
  /** Spärrens första rad: "med rätt svar och regeln bakom" eller "förklaringen". */
  forklaring: 'regeln' | 'förklaringen' | 'lösningen' | 'tekniken'
  /** Nivåkollens minuter (nivakoll/copy.ts MINUTER), null för typerna utan Nivåkoll. */
  nivakollMinuter: number | null
  /** Typens namn i löptext. */
  namn: string
  /** Kontosidans vidare-steg för typerna utan Nivåkoll. */
  grundtest?: { href: string; knapp: string }
}

export const PROV_COPY: Readonly<Record<NyProvTyp, ProvTypCopy>> = {
  figurserie: {
    kick: 'Figurserier, fem uppgifter',
    h1: 'Prova ett test i figurserier',
    ingressFet: 'En rad figurer som följer en regel.',
    ingress: ' Du väljer figuren som kommer härnäst. Fem uppgifter, inget konto, ingen tidtagning.',
    fragaKick: 'Figurserier, provet',
    forklaring: 'regeln',
    nivakollMinuter: 7,
    namn: 'figurserier',
  },
  verbal: {
    kick: 'Verbalt test, fem uppgifter',
    h1: 'Prova ett verbalt test',
    ingressFet: 'En kort text och påståenden om den.',
    ingress: ' Du avgör om påståendet stämmer, inte stämmer eller inte går att avgöra. Fem uppgifter, inget konto, ingen tidtagning.',
    fragaKick: 'Verbalt test, provet',
    forklaring: 'förklaringen',
    nivakollMinuter: 5,
    namn: 'verbalt test',
  },
  numerisk: {
    kick: 'Numeriskt test, fem uppgifter',
    h1: 'Prova ett numeriskt test',
    ingressFet: 'En tabell eller ett diagram och frågor om siffrorna.',
    ingress: ' Fem uppgifter, inget konto, ingen tidtagning. Ha gärna papper och penna nära.',
    fragaKick: 'Numeriskt test, provet',
    forklaring: 'förklaringen',
    nivakollMinuter: 10,
    namn: 'numeriskt test',
  },
  deduktiv: {
    kick: 'Deduktivt test, fem uppgifter',
    h1: 'Prova ett deduktivt test',
    ingressFet: 'Några villkor och en fråga om vad som måste gälla.',
    ingress: ' Du räknar inte, du håller reda på villkoren. Fem uppgifter, inget konto, ingen tidtagning.',
    fragaKick: 'Deduktivt test, provet',
    forklaring: 'lösningen',
    nivakollMinuter: 8,
    namn: 'deduktivt test',
  },
  spatial: {
    kick: 'Spatial förmåga, fem uppgifter',
    h1: 'Prova ett test i spatial förmåga',
    ingressFet: 'Spatial förmåga (rumsuppfattning): vridna figurer, pappersvikning och tärningar.',
    ingress: ' Fem uppgifter, inget konto, ingen tidtagning.',
    fragaKick: 'Spatial förmåga, provet',
    forklaring: 'tekniken',
    nivakollMinuter: null,
    namn: 'spatial förmåga',
    grundtest: { href: '/dashboard/tester/spatial-grund', knapp: 'Gör grundtestet i spatial förmåga' },
  },
  talserie: {
    kick: 'Talserier, fem uppgifter',
    h1: 'Prova ett test i talserier',
    ingressFet: 'En rad tal och en eller två tomma rutor sist.',
    ingress: ' Du väljer talen som fortsätter raden. Fem uppgifter, inget konto, ingen tidtagning.',
    fragaKick: 'Talserier, provet',
    forklaring: 'regeln',
    nivakollMinuter: null,
    namn: 'talserier',
    grundtest: { href: '/dashboard/tester/talserier-grund', knapp: 'Gör grundtestet i talserier' },
  },
  ordforrad: {
    kick: 'Ordförråd, fem uppgifter',
    h1: 'Prova ett test i ordförråd',
    ingressFet: 'Ett ord i versaler och fem alternativ.',
    ingress: ' Synonymer och motsatsord, som i I-provet. Fem uppgifter, inget konto, ingen tidtagning.',
    fragaKick: 'Ordförråd, provet',
    forklaring: 'förklaringen',
    nivakollMinuter: null,
    namn: 'ordförråd',
    grundtest: { href: '/dashboard/tester/ordforrad-grund', knapp: 'Gör grundtestet i ordförråd' },
  },
  iprov: {
    kick: 'I-provet, sex uppgifter',
    h1: 'Prova I-provet',
    ingressFet: 'En uppgift ur vart och ett av I-provets sex deltester, i provets ordning.',
    ingress: ' Synonymer, pappersvikning, talserier, motsatsord, tärningar och pappersvikning med klipp. Inget konto, ingen tidtagning.',
    fragaKick: 'I-provet, provet',
    forklaring: 'tekniken',
    nivakollMinuter: null,
    namn: 'I-provet',
    grundtest: { href: '/dashboard/tester/iprov', knapp: 'Se I-provet, övningsprov' },
  },
}
