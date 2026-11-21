'use client'

/**
 * Hennes eget CV i flera mallar (CV-rummet, byggspecen avsnitt 6, punkterna ett till tre och åtta).
 * Varje ruta ber om sin mall; begärandena samlas per CV och
 * skickas som en fråga per åtta mallar till /api/cv/preview-html/flera, en
 * fråga åt gången och först när sidan är ledig. Svaren hamnar i samma minne
 * som arkets förhandsvisning (hooks.ts), så en mall som ritats som miniatyr
 * visas direkt som ark.
 *
 * Inget hämtas förrän en ruta ber om det: den som aldrig ser en miniatyr
 * kostar servern ingenting.
 */
import { useEffect, useSyncExternalStore } from 'react'
import type { MallVal } from '@/lib/cv/mallar/kontrakt'
import { scheduleIdle } from '@/lib/scheduleIdle'
import { harFortur, lasForhandsvisning, lyssnaPaFortur, minnsForhandsvisning, nyckelFor, type Kalla } from './hooks'

/** CV:t som ska ritas: samma fält som arket på Mallar skickar. */
export interface EgetCv {
  cvId: string
  structuredData: unknown
  cvText?: string | null
  /** Valen, med CV:ts sparade rubriker (section_titles). */
  val: MallVal
}

export function kallaForMall(cv: EgetCv, mall: string): Kalla {
  return { typ: 'inloggad', cvId: cv.cvId, structuredData: cv.structuredData, cvText: cv.cvText ?? undefined, mall, val: cv.val }
}

const PER_FRAGA = 8

const lyssnare = new Set<() => void>()
let version = 0
function meddela() {
  version++
  for (const l of lyssnare) l()
}

/** Kön: per CV (nyckeln utan mall) vilka mallar som väntar. */
const ko = new Map<string, { cv: EgetCv; mallar: Set<string> }>()
const pagaende = new Set<string>()
const misslyckade = new Set<string>()
let schemalagd = false
let kor = false

const cvNyckel = (cv: EgetCv) => nyckelFor(kallaForMall(cv, ''))

/** Raden som är i luften (högst en), så att arkets förtur kan avbryta den. */
let iLuften: { ac: AbortController; pausad: boolean } | null = null
let vantare: (() => void) | null = null
if (typeof window !== 'undefined') {
  lyssnaPaFortur((pa) => {
    if (pa && iLuften) {
      iLuften.pausad = true
      iLuften.ac.abort()
    }
    if (!pa && vantare) {
      const v = vantare
      vantare = null
      v()
    }
  })
}

/** Lägger tillbaka mallar först i CV:ts kö (efter en paus för arkets förtur). */
function tillbakaIKon(cv: EgetCv, mallar: string[]) {
  const nyckel = cvNyckel(cv)
  const post = ko.get(nyckel)
  const resten = post ? [...post.mallar].filter((m) => !mallar.includes(m)) : []
  ko.delete(nyckel)
  // Först i kön: Map behåller ordningen, så raden läggs in före de andra CV:na.
  const ovriga = [...ko.entries()]
  ko.clear()
  ko.set(nyckel, { cv, mallar: new Set([...mallar, ...resten]) })
  for (const [k, v] of ovriga) ko.set(k, v)
}

async function hamtaRad(cv: EgetCv, mallar: string[]) {
  const nycklar = mallar.map((m) => nyckelFor(kallaForMall(cv, m)))
  nycklar.forEach((n) => pagaende.add(n))
  const luft = { ac: new AbortController(), pausad: false }
  iLuften = luft
  try {
    const res = await fetch('/api/cv/preview-html/flera', {
      method: 'POST',
      signal: luft.ac.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mallar,
        cvId: cv.cvId,
        structuredData: cv.structuredData || undefined,
        cvText: cv.cvText || undefined,
        val: cv.val,
      }),
    })
    if (!res.ok) throw new Error(String(res.status))
    const j = (await res.json()) as { html?: Record<string, string> }
    for (const m of mallar) {
      const h = j.html?.[m]
      if (h) minnsForhandsvisning(kallaForMall(cv, m), h)
      else misslyckade.add(nyckelFor(kallaForMall(cv, m)))
    }
  } catch {
    // Pausad för arkets förtur: tillbaka i kön. Annars står katalogbilden
    // kvar och samma ruta frågas inte igen under besöket.
    if (luft.pausad) tillbakaIKon(cv, mallar.filter((m) => !lasForhandsvisning(kallaForMall(cv, m))))
    else nycklar.forEach((n) => misslyckade.add(n))
  } finally {
    if (iLuften === luft) iLuften = null
    nycklar.forEach((n) => pagaende.delete(n))
    meddela()
  }
}

async function tomKon() {
  if (kor) return
  kor = true
  try {
    while (ko.size) {
      // Arket hämtar mallen hon klickade på: vänta tills det är klart.
      if (harFortur()) await new Promise<void>((r) => (vantare = r))
      if (!ko.size) break
      const [nyckel, post] = ko.entries().next().value as [string, { cv: EgetCv; mallar: Set<string> }]
      const mallar = [...post.mallar].slice(0, PER_FRAGA)
      mallar.forEach((m) => post.mallar.delete(m))
      if (!post.mallar.size) ko.delete(nyckel)
      // En fråga åt gången: aldrig 40 parallella.
      await hamtaRad(post.cv, mallar)
    }
  } finally {
    kor = false
  }
}

/**
 * Ber om mallarna för CV:t. Redan hämtade, pågående och misslyckade hoppas
 * över. `nu`: kön töms direkt i stället för när sidan är ledig (mallen under
 * pekaren, byggspecen avsnitt 6 punkt 4); fortfarande en fråga åt gången.
 */
export function begarEgnaMallar(cv: EgetCv, mallar: readonly string[], nu = false): void {
  if (typeof window === 'undefined') return
  const nyckel = cvNyckel(cv)
  let post = ko.get(nyckel)
  for (const m of mallar) {
    const k = kallaForMall(cv, m)
    const n = nyckelFor(k)
    if (lasForhandsvisning(k) || pagaende.has(n) || misslyckade.has(n)) continue
    if (!post) {
      post = { cv, mallar: new Set() }
      ko.set(nyckel, post)
    }
    post.mallar.add(m)
  }
  if (!post) return
  if (nu) {
    // Mallen under pekaren först i raden, så att den kommer med i nästa fråga.
    const forst = mallar.filter((m) => post!.mallar.has(m))
    const ovriga = [...post.mallar].filter((m) => !forst.includes(m))
    post.mallar = new Set([...forst, ...ovriga])
    void tomKon()
    return
  }
  if (schemalagd) return
  schemalagd = true
  scheduleIdle(() => {
    schemalagd = false
    void tomKon()
  }, 1500)
}

function prenumerera(l: () => void) {
  lyssnare.add(l)
  return () => {
    lyssnare.delete(l)
  }
}

/**
 * Hennes CV i mallen, eller null tills det är hämtat. `aktiv` styr när
 * hämtningen begärs (rutan i bild, eller direkt för väggens ark).
 */
export function useEgenMall(cv: EgetCv | null, mall: string, aktiv: boolean): string | null {
  useSyncExternalStore(prenumerera, () => version, () => 0)
  const kalla = cv ? kallaForMall(cv, mall) : null
  const html = kalla ? lasForhandsvisning(kalla) : null
  const nyckel = kalla ? nyckelFor(kalla) : ''
  useEffect(() => {
    if (!aktiv || !cv || html) return
    begarEgnaMallar(cv, [mall])
    // nyckel bär CV:t, mallen och valen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktiv, nyckel, Boolean(html)])
  return html
}
