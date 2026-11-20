'use client'

/**
 * De publika provens uppgifter i sessionsramens form (omgång 2, steg C).
 * Provsidan, artikelns provruta, registreringens panel och genomgången
 * efter kontot ritar samma uppgifter med samma typkomponenter som de
 * inloggade testerna: matrisen, figurserierna, deduktivt, ord och text,
 * siffror och tabeller, talserier, spatial förmåga och ordförråd.
 *
 * En post är typens ritare, uppgiften i ramens form och svarets värde mot
 * /api/public/test-session: matrisen svarar med det visade indexet som tal,
 * Nivåkollens typer med indexet som text (figurserier och deduktivt) eller
 * alternativets id (ord och text, siffror och tabeller), steg 2:s typer med
 * indexet som text. Samma värden som de gamla vyerna skickade, så rättningen
 * på servern är orörd.
 *
 * Ingen ordning blandas här: alternativen står i den ordning servern ritade
 * dem, så att uppgift 1 i artikeln rättas mot sin HTML (fallgrop 1).
 */

import type { LayeredCell } from '@/lib/logicTestV7/layered.v7'
import type { V7Cell } from '@/lib/logicTestV7/types.v7'
import type { GenomgangUppgift, ProvTyp, PublikUppgift } from '@/lib/tests/prov-typer'
import type { VnUnderlag } from '@/lib/tester/pass-typer'
import type { NivakollUppgift } from '@/lib/nivakoll/typer'
import type { Rutnat } from '@/lib/tests/prova-lokalt'
import { MATRIS, type MatrisU } from '@/components/session/typer/Matris'
import { FIGURSERIE, type FigurserieU } from '@/components/session/typer/Figurserie'
import { DEDUKTIV, type DeduktivU } from '@/components/session/typer/Deduktiv'
import { steg2Facit, steg2Ritare, tillSteg2U, type Steg2U } from '@/components/session/typer/Steg2'
import { vnRitare, type VnU } from '@/components/session/typer/Vn'
import { indexFor, numrera, vnUnderlagFran, vnUppgiftFran, type VnUtanNummer } from '@/components/session/vn/las'
import { vnFacit } from '@/components/session/vn/delar'
import Losningsgang from '@/components/session/deduktiv/Losningsgang'
import type { RamFacit, RamUppgift, TypRitare } from '@/components/session/typ'
import type { ListPost } from '@/components/session/Uppgiftslistan'
import { ProvBricka } from '@/components/publikt/ProvBrickor'
import { PROV_NAMN } from './prov-copy'

export type ProvU = MatrisU | FigurserieU | DeduktivU | VnU | Steg2U

export interface ProvPost {
  // Typerna blandas i I-provet, så ritaren tas emot otypad.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ritare: TypRitare<any>
  u: ProvU
  /** Svarets värde i POST-kroppen för det visade indexet. */
  varde: (i: number) => string | number
}

/** Matrisens fråga från servern (anon-session toPublicQuestion), utan facit. */
export interface MatrisFraga {
  id: string
  grid: (LayeredCell | null)[][]
  options: LayeredCell[]
}

export { PROV_NAMN }

let uppvarmd = false

/**
 * Värmer provets server en gång per sidladdning (GET, 204, ingen databas och
 * ingen kvot), så att POST:en som startar provet inte väntar på en kall
 * funktion och bankernas laddning (slutkontrollen omgång 2). Provsidan gör
 * det när startskärmen visas, artikelns provruta vid första trycket.
 */
export function varmProvet(): void {
  if (uppvarmd || typeof window === 'undefined') return
  uppvarmd = true
  void fetch('/api/public/test-session', { method: 'GET', cache: 'no-store' }).catch(() => {
    uppvarmd = false
  })
}

/** Matrisens radminiatyr i Uppgiftslistan: rutnätet hon redan sett, utan alternativ. */
function MatrisMini({ u }: { u: MatrisU }) {
  return <ProvBricka rutnat={u.grid as Rutnat} className="pub-bricka-mini" />
}

const MATRIS_LISTA: TypRitare<MatrisU> = { ...MATRIS, Miniatyr: MatrisMini }

export function franMatris(q: MatrisFraga): ProvPost {
  return { ritare: MATRIS_LISTA, u: { nyckel: q.id, grid: q.grid, options: q.options }, varde: (i) => i }
}

type VnPublik = { kind: 'verbal' | 'numerisk'; nyckel: string; data: NivakollUppgift }

/** Ord och text och Siffror och tabeller: uppgifterna numreras inom sitt underlag. */
function vnPoster(lista: { p: VnPublik; ul: VnUnderlag }[]): Map<string, VnU> {
  const utan: VnUtanNummer[] = lista.map(({ p, ul }) => {
    const d = p.data as Extract<NivakollUppgift, { kind: 'verbal' | 'numerisk' }>
    return vnUppgiftFran(p.kind, { nyckel: p.nyckel, text: d.text, alternativ: d.alternativ }, vnUnderlagFran(p.kind, ul))
  })
  return new Map(numrera(utan).map((u) => [u.nyckel, u]))
}

/**
 * Typernas uppgifter till poster. Alla uppgifter i provet på en gång, så att
 * ord och text numreras rätt ("Påstående 2 av 3 om texten").
 */
export function franPublika(uppgifter: readonly PublikUppgift[], underlag: Record<string, VnUnderlag>): ProvPost[] {
  const vn = vnPoster(
    uppgifter.flatMap((p) => {
      if (p.kind !== 'verbal' && p.kind !== 'numerisk') return []
      const d = p.data as { underlag: string }
      const ul = underlag[d.underlag]
      return ul ? [{ p: p as VnPublik, ul }] : []
    })
  )
  const ut: ProvPost[] = []
  for (const p of uppgifter) {
    if (p.kind === 'figurserie') {
      const d = p.data as Extract<NivakollUppgift, { kind: 'figurserie' }>
      ut.push({ ritare: FIGURSERIE, u: { nyckel: p.nyckel, form: d.form, rad: d.rad as V7Cell[], options: d.options as V7Cell[] }, varde: (i) => String(i) })
    } else if (p.kind === 'deduktiv') {
      const d = p.data as Extract<NivakollUppgift, { kind: 'deduktiv' }>
      ut.push({ ritare: DEDUKTIV, u: { nyckel: p.nyckel, intro: d.intro, villkor: d.villkor, fraga: d.fraga, options: d.options }, varde: (i) => String(i) })
    } else if (p.kind === 'verbal' || p.kind === 'numerisk') {
      const u = vn.get(p.nyckel)
      if (u) ut.push({ ritare: vnRitare(p.kind), u, varde: (i) => u.alternativ[i]?.id ?? String(i) })
    } else if (p.kind === 'talserie' || p.kind === 'spatial' || p.kind === 'ordforrad') {
      ut.push({ ritare: steg2Ritare(p.kind), u: tillSteg2U(p.kind, p.data, p.nyckel), varde: (i) => String(i) })
    }
  }
  return ut
}

/** Ramens form för provet: typens, och I-provets steg 2-typer är alla smala. */
export function provForm(poster: readonly ProvPost[]) {
  return poster[0]?.ritare.form ?? 'smal'
}

/**
 * Genomgången efter kontot: uppgiften, hennes svar och facit i ramens form
 * (Uppgiftslistan och Genomgang). Facit kommer från servern först efter
 * kontot (ProvTypSida, genomgaProv).
 */
export function genomgangPoster(uppgifter: readonly GenomgangUppgift[], underlag: Record<string, VnUnderlag>): ListPost<ProvU>[] {
  const publika = franPublika(
    uppgifter.map((g) => ({ kind: g.kind, nyckel: g.nyckel, data: g.data, deltest: g.deltest }) as PublikUppgift),
    underlag
  )
  const per = new Map(publika.map((p) => [p.u.nyckel, p]))
  const ut: ListPost<ProvU>[] = []
  for (const g of uppgifter) {
    const p = per.get(g.nyckel)
    if (!p) continue
    let valt: number | null = null
    let facit: RamFacit
    if ('valt' in g) {
      // Talserier, spatial förmåga och ordförråd (I-provet inräknat).
      valt = g.valt
      facit = steg2Facit(g.kind, g.genomgang, g.valt, g.correct)
    } else if (g.kind === 'verbal' || g.kind === 'numerisk') {
      const u = p.u as VnU
      valt = indexFor(u, g.genomgang.valt)
      facit = { ...vnFacit(u, indexFor(u, g.genomgang.ratt) ?? -1, valt, g.genomgang.forklaring), correct: g.genomgang.correct }
    } else {
      valt = g.genomgang.valt == null ? null : Number(g.genomgang.valt)
      if (valt !== null && !Number.isFinite(valt)) valt = null
      facit = {
        ratt: Number(g.genomgang.ratt),
        correct: g.genomgang.correct,
        regel: g.kind === 'figurserie' ? g.genomgang.forklaring : null,
        misstag: g.genomgang.misstag,
        detalj: g.kind === 'deduktiv' && g.genomgang.losning ? <Losningsgang losning={g.genomgang.losning} /> : null,
      }
    }
    ut.push({ u: p.u, valt, facit, ritare: p.ritare })
  }
  return ut
}

/** En ritare för genomgångens ram när typerna blandas (I-provet): steg 2:s Uppgift väljer själv per uppgift. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function provRitare(typ: ProvTyp, poster: readonly { ritare?: TypRitare<any> }[]): TypRitare<RamUppgift> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const forsta = (poster[0]?.ritare ?? MATRIS) as TypRitare<any>
  if (typ === 'iprov') return { ...steg2Ritare('talserie'), kind: 'iprov', namn: PROV_NAMN.iprov } as unknown as TypRitare<RamUppgift>
  return forsta
}
