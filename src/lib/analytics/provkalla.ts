// src/lib/analytics/provkalla.ts
// =============================================================================
// Från artikeln till kontot (saas-leads slutliga beslut 2026-11-10, beslut 6,
// och säljgranskningen avsnitt 2, tillägg 1 och 3).
//
// Två kakor, båda små, utan något som pekar ut en person:
//
//   jc_provkalla   Sätts när besökaren klickar från en testartikel till
//                  produkten (ArtikelKlient), när provet startar (ProvaFlow)
//                  och när registreringen öppnas med ?mitt_test=. Bär
//                  artikelns slug, valet "Mitt test" och om vägen gick via
//                  provet. Läses vid registreringen: acquisition_source får
//                  kalla 'smakprov:<slug>' eller 'artikel:<slug>', och
//                  /dashboard/valkommen sätter valet tyst på kontots testplan.
//                  Tas bort när kontot är skapat.
//   jc_kontokalla  Skrivs på /dashboard/valkommen när kontot är nytt och
//                  bär kontots källa och val. capture() lägger dem på
//                  betalvagg_visad och paywall_cta_clicked, så att väggen
//                  går att läsa per källa och val (beslut 6).
//
// Ingen ny fråga i registreringen (fråga 1 togs bort 9 nov efter 61 till 65
// procents tapp). Valet syns först i ingången, förvalt, med Ändra.
//
// Ren fil: läsningen går att använda på servern, skrivningen bara i klienten.
// =============================================================================

import { arMittTest, type MittTest } from '@/lib/traning/mittTest'

export const PROVKALLA_COOKIE = 'jc_provkalla'
/** Fjorton dagar: längre än så är artikeln inte längre skälet till kontot. */
export const PROVKALLA_MAX_AGE = 60 * 60 * 24 * 14

export const KONTOKALLA_COOKIE = 'jc_kontokalla'
export const KONTOKALLA_MAX_AGE = 60 * 60 * 24 * 365

export type ProvkallaVia = 'artikel' | 'smakprov' | 'hubb'

export interface Provkalla {
  /** Artikelns slug, när besökaren kom från en artikel. */
  slug?: string
  mitt_test?: MittTest
  via: ProvkallaVia
}

export interface Kontokalla {
  kalla?: string
  mitt_test?: MittTest
}

/**
 * Valet som följer med från artikeln när länken inte bär ?mitt_test= själv
 * (säljgranskningen 2, tillägg 1). Lokförare kommer från länken till
 * H2:n i aon-cut-e-test, som bär ?mitt_test=lokforare.
 */
export const ARTIKEL_MITT_TEST: Readonly<Record<string, MittTest>> = {
  'i-prov': 'iprov',
  'matrigma-test': 'matrigma',
  'alva-labs-logiktest': 'alva',
  'deduktivt-induktivt-test': 'shl',
  'shl-test': 'shl',
  'aon-cut-e-test': 'aon',
  'lokforare-test': 'lokforare',
  'tester-hos-myndigheter': 'annat',
}

/** Valen där provdatumet frågas direkt efter kontot (beslut 4). */
export function fragaProvdatumEfterKonto(val: string | null | undefined): boolean {
  return val === 'iprov' || val === 'lokforare'
}

const SLUG = /^[a-z0-9-]{1,100}$/
const KALLA = /^(smakprov|artikel):[a-z0-9-]{1,100}$|^hubb$/

function lasJson(raw: string | null | undefined): Record<string, unknown> | null {
  if (!raw) return null
  let v = raw
  for (let i = 0; i < 3; i++) {
    try {
      const d = JSON.parse(v)
      return d && typeof d === 'object' && !Array.isArray(d) ? (d as Record<string, unknown>) : null
    } catch {
      try {
        const n = decodeURIComponent(v)
        if (n === v) return null
        v = n
      } catch {
        return null
      }
    }
  }
  return null
}

/** Tålig mot skräp: allt ogiltigt faller bort. */
export function lasProvkalla(raw: string | null | undefined): Provkalla | null {
  const d = lasJson(raw)
  if (!d) return null
  const via: ProvkallaVia = d.via === 'smakprov' || d.via === 'hubb' ? d.via : 'artikel'
  const ut: Provkalla = { via }
  if (typeof d.slug === 'string' && SLUG.test(d.slug)) ut.slug = d.slug
  if (arMittTest(d.mitt_test)) ut.mitt_test = d.mitt_test
  return ut.slug || ut.mitt_test ? ut : null
}

export function lasKontokalla(raw: string | null | undefined): Kontokalla | null {
  const d = lasJson(raw)
  if (!d) return null
  const ut: Kontokalla = {}
  if (typeof d.kalla === 'string' && KALLA.test(d.kalla)) ut.kalla = d.kalla
  if (arMittTest(d.mitt_test)) ut.mitt_test = d.mitt_test
  return ut.kalla || ut.mitt_test ? ut : null
}

/** 'smakprov:<slug>' via provet, 'artikel:<slug>' via en länk, 'hubb' från testsidan. */
export function kallaText(k: Provkalla | null | undefined): string | null {
  if (!k) return null
  if (k.slug) return `${k.via === 'smakprov' ? 'smakprov' : 'artikel'}:${k.slug}`
  return k.via === 'hubb' ? 'hubb' : null
}

/** Fälten som läggs i profiles.acquisition_source. */
export function acquisitionFalt(k: Provkalla | null | undefined): { kalla?: string; artikel?: string; mitt_test?: MittTest } {
  if (!k) return {}
  const kalla = kallaText(k)
  return {
    ...(kalla ? { kalla } : {}),
    ...(k.slug ? { artikel: k.slug } : {}),
    ...(k.mitt_test ? { mitt_test: k.mitt_test } : {}),
  }
}

/** Valet för en artikel: länkens ?mitt_test= först, annars artikelns eget. */
export function mittTestForArtikel(slug: string | null | undefined, lankensVal?: string | null): MittTest | undefined {
  if (arMittTest(lankensVal)) return lankensVal
  return slug ? ARTIKEL_MITT_TEST[slug] : undefined
}

/* ---------------------------------------------------------------- klienten */

function lasKaka(namn: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${namn}=([^;]*)`))
  return m ? m[1] : null
}

function skrivKaka(namn: string, varde: string, maxAge: number): void {
  if (typeof document === 'undefined') return
  try {
    const sakert = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${namn}=${varde}; Path=/; Max-Age=${maxAge}; SameSite=Lax${sakert}`
  } catch {
    /* blockerade kakor: mätningen tappar källan, inget annat */
  }
}

export function lasProvkallaKlient(): Provkalla | null {
  return lasProvkalla(lasKaka(PROVKALLA_COOKIE))
}

/**
 * Sparar källan. En ny artikel ersätter den gamla (senaste artikeln före
 * kontot är skälet), samma artikel behåller valet och uppgraderar till
 * smakprov när provet startar.
 */
export function sparaProvkalla(ny: Partial<Provkalla>): void {
  const forra = lasProvkallaKlient()
  const sammaArtikel = !ny.slug || ny.slug === forra?.slug
  const slug = ny.slug ?? forra?.slug
  const mitt_test = ny.mitt_test ?? (sammaArtikel ? forra?.mitt_test : undefined)
  let via: ProvkallaVia =
    ny.via === 'smakprov' || (sammaArtikel && forra?.via === 'smakprov') ? 'smakprov' : (ny.via ?? forra?.via ?? 'artikel')
  // Från hubbens kort till provet: utan artikel finns ingen smakprov:<slug>,
  // så källan förblir 'hubb' i stället för att försvinna.
  if (!slug && forra?.via === 'hubb') via = 'hubb'
  if (!slug && !mitt_test) return
  const varde: Provkalla = { via, ...(slug ? { slug } : {}), ...(mitt_test ? { mitt_test } : {}) }
  skrivKaka(PROVKALLA_COOKIE, encodeURIComponent(JSON.stringify(varde)), PROVKALLA_MAX_AGE)
}

export function rensaProvkalla(): void {
  skrivKaka(PROVKALLA_COOKIE, '', 0)
}

/** Läser ?mitt_test= och ?fran= ur adressen (provet, registreringen, hubbens kort). */
export function sparaProvkallaUrAdress(search: string, via: ProvkallaVia): void {
  try {
    const q = new URLSearchParams(search)
    const val = q.get('mitt_test')
    const fran = q.get('fran')
    const slug = fran && SLUG.test(fran) ? fran : undefined
    const mitt_test = mittTestForArtikel(slug, val)
    if (!slug && !arMittTest(val)) return
    sparaProvkalla({ ...(slug ? { slug } : {}), ...(mitt_test ? { mitt_test } : {}), via: slug ? via : 'hubb' })
  } catch {
    /* mätning får aldrig fälla sidan */
  }
}

export function lasKontokallaKlient(): Kontokalla | null {
  return lasKontokalla(lasKaka(KONTOKALLA_COOKIE))
}

export function sparaKontokalla(k: Kontokalla): void {
  const forra = lasKontokallaKlient() ?? {}
  const ny: Kontokalla = { ...forra, ...k }
  if (!ny.kalla && !ny.mitt_test) return
  skrivKaka(KONTOKALLA_COOKIE, encodeURIComponent(JSON.stringify(ny)), KONTOKALLA_MAX_AGE)
}
