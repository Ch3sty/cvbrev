'use client'

/**
 * Förhandsvisningen och nedladdningen för dokumentet.
 *
 * useForhandsvisning hämtar HTML för ett CV i en mall från rätt rutt:
 * exempel-API:t (GET, CDN-cachat, för exempel-CV:t), den publika
 * förhandsvisningen (besökarens eget CV utan konto) eller preview-html
 * (inloggat). Byten väntar 250 ms så att en egen rubrik inte renderas per
 * tangent, och svaren cachas i fliken så att svep tillbaka är omedelbara.
 * Mallar i CV-rummet (byggspecen avsnitt 6 punkt 5) väljer fördröjningen per
 * byte: ingen vid klick, 250 ms vid svep och piltangent. Kommer samma HTML
 * in från en annan hämtning medan arket väntar (miniatyrernas rad) visas den
 * direkt och arkets egen fråga avbryts.
 *
 * useNedladdning skapar filen via generate-formatted och fyller knappen i
 * takt med förloppet: uppskattat fram till första byten, sedan verkligt
 * medan filen strömmar in.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import type { Format, MallVal } from '@/lib/cv/mallar/kontrakt'
import { nedladdningsFelForStatus, nedladdningsFelForUndantag } from '@/lib/cv/nedladdningsFel'

export type Kalla =
  | { typ: 'exempel'; mall: string; val: MallVal; yrke?: string }
  | { typ: 'publik'; cv: CVMetadata; mall: string; val: MallVal }
  | { typ: 'inloggad'; cvId?: string; structuredData: unknown; cvText?: string; mall: string; val: MallVal; spok?: boolean }

/** Exempel-API:ts query (docs/qa/mallsystemet-2026-11-16.md avsnitt 2). */
export function exempelSrc(mall: string, val: MallVal, yrke?: string): string {
  const q = new URLSearchParams({ mall })
  if (val.typsnitt) q.set('typsnitt', val.typsnitt)
  if (typeof val.farg === 'number' && val.farg > 0) q.set('farg', String(val.farg))
  if (val.ordning && val.ordning !== 'standard') q.set('ordning', val.ordning)
  if (val.foto) q.set('foto', '1')
  if (val.enSida) q.set('ensida', '1')
  if (val.rubriker && Object.keys(val.rubriker).length) q.set('rubriker', JSON.stringify(val.rubriker))
  else if (val.uppsattning) q.set('uppsattning', val.uppsattning)
  if (yrke) q.set('yrke', yrke)
  return `/api/public/exempel/cv?${q.toString()}`
}

/**
 * Flikens minne för förhandsvisningarna. Ett inloggat CV i en mall har
 * samma nyckel oavsett vem som hämtade det (arket, miniatyrerna på Ditt CV,
 * merförsäljningen), så att en mall som redan ritats som miniatyr visas
 * direkt som ark (CV-rummet, byggspecen avsnitt 6 punkt 3). Taket rymmer
 * alla 40 mallar för ett CV med marginal.
 */
const CACHE = new Map<string, string>()
/** Alla 40 mallar för aktuellt CV, plus ett andra val (typsnitt, färg) av de mallar hon tittat på. */
const CACHE_TAK = 64

/** Ark som väntar på en nyckel: får HTML:en så fort den finns, oavsett vem som hämtade den. */
const VANTAR = new Map<string, Set<(html: string) => void>>()

function minns(nyckel: string, html: string) {
  CACHE.delete(nyckel)
  CACHE.set(nyckel, html)
  if (CACHE.size > CACHE_TAK) CACHE.delete(CACHE.keys().next().value as string)
  VANTAR.get(nyckel)?.forEach((f) => f(html))
}

/**
 * Arkets förtur (byggspecen avsnitt 6, steg 2:s uppföljning): medan arket
 * hämtar mallen hon klickade på pausar miniatyrernas hämtning (egnaMallar),
 * och en rad som redan är på väg avbryts och läggs tillbaka i kön. När arket
 * har sitt svar fortsätter miniatyrerna.
 */
let fortur = 0
const FORTUR = new Set<(pa: boolean) => void>()
export function lyssnaPaFortur(f: (pa: boolean) => void): () => void {
  FORTUR.add(f)
  return () => {
    FORTUR.delete(f)
  }
}
export function harFortur(): boolean {
  return fortur > 0
}
function forturStart(): () => void {
  fortur++
  if (fortur === 1) FORTUR.forEach((f) => f(true))
  let slut = false
  return () => {
    if (slut) return
    slut = true
    fortur = Math.max(0, fortur - 1)
    if (fortur === 0) FORTUR.forEach((f) => f(false))
  }
}

/**
 * Glömmer förhandsvisningarna av andra CV:n och av äldre versioner av det
 * här (byggspecen avsnitt 6 punkt 6): bara nycklar med samma CV och samma
 * avtryck av datan står kvar. Exempel och publika källor rörs inte.
 */
export function rensaForhandsvisningar(behall: Kalla): void {
  if (behall.typ !== 'inloggad') return
  const delar = nyckelFor(behall).split('|')
  for (const n of [...CACHE.keys()]) {
    if (!n.startsWith('i|')) continue
    const d = n.split('|')
    if (d[1] !== delar[1] || d[d.length - 2] !== delar[delar.length - 2] || d[d.length - 1] !== delar[delar.length - 1]) CACHE.delete(n)
  }
}

/** JSON med sorterade nycklar, utan tomma värden: samma val ger samma text. */
function stabil(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v) ?? ''
  if (Array.isArray(v)) return `[${v.map(stabil).join(',')}]`
  const o = v as Record<string, unknown>
  const delar = Object.keys(o)
    .filter((k) => {
      const x = o[k]
      if (x === undefined || x === null) return false
      if (typeof x === 'object' && !Array.isArray(x) && Object.keys(x as object).length === 0) return false
      return true
    })
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stabil(o[k])}`)
  return `{${delar.join(',')}}`
}

/** FNV-1a, 32 bitar: kort fingeravtryck av CV-datan i nyckeln. */
function avtryck(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36) + s.length.toString(36)
}

/**
 * Minnets nyckel för en källa. Inloggat: CV:t, mallen, valen (stabilt
 * ordnade) och ett avtryck av datan, så att en ändring i CV:t ger en ny
 * nyckel och det gamla arket aldrig visas för det ändrade CV:t.
 */
export function nyckelFor(k: Kalla): string {
  if (k.typ !== 'inloggad') return JSON.stringify(k)
  return [
    'i',
    k.cvId ?? '',
    k.mall,
    stabil(k.val ?? {}),
    k.spok ? '1' : '0',
    avtryck(JSON.stringify(k.structuredData ?? null)),
    avtryck(k.cvText ?? ''),
  ].join('|')
}

/** HTML:en i minnet för källan, eller null. */
export function lasForhandsvisning(k: Kalla): string | null {
  return CACHE.get(nyckelFor(k)) ?? null
}

async function hamta(k: Exclude<Kalla, { typ: 'exempel' }>, signal: AbortSignal): Promise<string> {
  if (k.typ === 'publik') {
    const res = await fetch('/api/public/cv/forhandsvisning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv: k.cv, mall: k.mall, val: k.val }),
      signal,
    })
    if (!res.ok) throw new Error(String(res.status))
    return res.text()
  }
  const res = await fetch('/api/cv/preview-html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template: k.mall,
      cvId: k.cvId,
      structuredData: k.structuredData || undefined,
      cvText: k.cvText,
      val: k.val,
      spok: k.spok || undefined,
    }),
    signal,
  })
  if (!res.ok) throw new Error(String(res.status))
  const json = (await res.json()) as { html?: string }
  if (!json.html) throw new Error('tom')
  return json.html
}

/**
 * Lägger serverns färdiga HTML i flikens cache (byggarens första målning),
 * så att arket står klart utan en rundtur efter hydreringen.
 */
export function minnsForhandsvisning(k: Kalla, html: string): void {
  minns(nyckelFor(k), html)
}

export interface Forhandsvisning {
  html: string | null
  src: string | null
  laddar: boolean
  fel: boolean
  /** Källan, så att helskärmen kan hämta samma CV:s sidor (useSidbilder). */
  kalla: Kalla | null
}

export function useForhandsvisning(kalla: Kalla | null, opts?: { fordrojning?: number }): Forhandsvisning {
  const nyckel = kalla ? nyckelFor(kalla) : ''
  const [html, setHtml] = useState<string | null>(() => (nyckel && CACHE.get(nyckel)) || null)
  const [laddar, setLaddar] = useState(false)
  const [fel, setFel] = useState(false)

  useEffect(() => {
    if (!kalla || kalla.typ === 'exempel') return
    const cachad = CACHE.get(nyckel)
    if (cachad) {
      setHtml(cachad)
      setLaddar(false)
      return
    }
    const ac = new AbortController()
    setLaddar(true)
    let slappFortur: (() => void) | null = null
    // Samma HTML från en annan hämtning (miniatyrernas rad): visa den direkt.
    const tagen = (h: string) => {
      ac.abort()
      slappFortur?.()
      window.clearTimeout(t)
      setHtml(h)
      setFel(false)
      setLaddar(false)
    }
    let vantar = VANTAR.get(nyckel)
    if (!vantar) VANTAR.set(nyckel, (vantar = new Set()))
    vantar.add(tagen)
    const t = window.setTimeout(() => {
      // Mallen hon valde går före miniatyrerna.
      slappFortur = forturStart()
      hamta(kalla, ac.signal)
        .finally(() => slappFortur?.())
        .then((h) => {
          minns(nyckel, h)
          setHtml(h)
          setFel(false)
          setLaddar(false)
        })
        .catch((e) => {
          if ((e as Error)?.name === 'AbortError') return
          setFel(true)
          setLaddar(false)
        })
    }, opts?.fordrojning ?? 250)
    return () => {
      window.clearTimeout(t)
      ac.abort()
      slappFortur?.()
      vantar?.delete(tagen)
      if (vantar && !vantar.size) VANTAR.delete(nyckel)
    }
    // nyckel bär hela källan; fördröjningen läses när källan byts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nyckel])

  if (kalla?.typ === 'exempel') return { html: null, src: exempelSrc(kalla.mall, kalla.val, kalla.yrke), laddar: false, fel: false, kalla }
  return { html, src: null, laddar, fel, kalla }
}

/** Helskärmens sidor: en bild per sida ur PDF:en (src/lib/cv/mallar/sidbilder.ts). */
export interface Sidbilder {
  sidor: number
  bilder: string[]
  kvot: number
}

const SIDCACHE = new Map<string, Sidbilder>()
const SIDCACHE_TAK = 8

async function hamtaSidbilder(k: Kalla, signal: AbortSignal): Promise<Sidbilder> {
  let res: Response
  if (k.typ === 'exempel') {
    res = await fetch(exempelSrc(k.mall, k.val, k.yrke).replace('/api/public/exempel/cv?', '/api/public/exempel/cv/sidor?'), { signal })
  } else if (k.typ === 'publik') {
    res = await fetch('/api/public/cv/sidor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv: k.cv, mall: k.mall, val: k.val }),
      signal,
    })
  } else {
    res = await fetch('/api/cv/sidor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ template: k.mall, cvId: k.cvId, structuredData: k.structuredData || undefined, cvText: k.cvText, val: k.val }),
      signal,
    })
  }
  if (!res.ok) throw new Error(String(res.status))
  const j = (await res.json()) as Partial<Sidbilder>
  if (!Array.isArray(j.bilder) || !j.bilder.length) throw new Error('tom')
  return { sidor: j.sidor ?? j.bilder.length, bilder: j.bilder, kvot: j.kvot ?? 297 / 210 }
}

/**
 * Sidorna för källan medan helskärmen är öppen. Hämtas först när den öppnas
 * (Chrome på servern, några sekunder), cachas i fliken per källa.
 */
export function useSidbilder(kalla: Kalla | null | undefined, aktiv: boolean): { sidbilder: Sidbilder | null; laddar: boolean; fel: boolean } {
  const nyckel = kalla ? JSON.stringify(kalla) : ''
  const [svar, setSvar] = useState<{ nyckel: string; s: Sidbilder | null; fel: boolean }>({ nyckel: '', s: null, fel: false })

  useEffect(() => {
    if (!aktiv || !kalla || SIDCACHE.has(nyckel)) return
    const ac = new AbortController()
    // Snabba mallbyten i helskärmen: vänta en kort stund innan Chrome startas.
    const t = window.setTimeout(() => {
      hamtaSidbilder(kalla, ac.signal)
        .then((s) => {
          SIDCACHE.set(nyckel, s)
          if (SIDCACHE.size > SIDCACHE_TAK) SIDCACHE.delete(SIDCACHE.keys().next().value as string)
          setSvar({ nyckel, s, fel: false })
        })
        .catch((e) => {
          if ((e as Error)?.name === 'AbortError') return
          setSvar({ nyckel, s: null, fel: true })
        })
    }, 200)
    return () => {
      window.clearTimeout(t)
      ac.abort()
    }
    // nyckel bär hela källan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nyckel, aktiv])

  const cachad = nyckel ? SIDCACHE.get(nyckel) ?? null : null
  if (!kalla) return { sidbilder: null, laddar: false, fel: false }
  if (cachad) return { sidbilder: cachad, laddar: false, fel: false }
  const fel = svar.nyckel === nyckel && svar.fel
  return { sidbilder: null, laddar: aktiv && !fel, fel }
}

const PAGAENDE = new Set<string>()

/**
 * Förhämtar grannmallarnas sidor i helskärmen på datorn, så att
 * piltangenterna känns direkt (UX 2026-11-16). Bara exemplen: de är
 * CDN-cachade och räknas inte mot besökarens kvot.
 */
export function forhamtaSidbilder(k: Kalla): void {
  if (k.typ !== 'exempel') return
  const nyckel = JSON.stringify(k)
  if (SIDCACHE.has(nyckel) || PAGAENDE.has(nyckel)) return
  PAGAENDE.add(nyckel)
  hamtaSidbilder(k, new AbortController().signal)
    .then((s) => {
      SIDCACHE.set(nyckel, s)
      if (SIDCACHE.size > SIDCACHE_TAK) SIDCACHE.delete(SIDCACHE.keys().next().value as string)
    })
    .catch(() => undefined)
    .finally(() => PAGAENDE.delete(nyckel))
}

/** Förhandsvisning utan hook, för merförsäljningens bilder. */
export async function forhandsvisningHtml(k: Exclude<Kalla, { typ: 'exempel' }>): Promise<string | null> {
  const nyckel = nyckelFor(k)
  const c = CACHE.get(nyckel)
  if (c) return c
  try {
    const h = await hamta(k, new AbortController().signal)
    minns(nyckel, h)
    return h
  } catch {
    return null
  }
}

export interface NedladdningsBegaran {
  mall: string
  format: Format
  val: MallVal
  structuredData?: unknown
  cvText?: string
  cvId?: string
  filnamn: string
  /** Ytan nedladdningen startade på, till cv_nedladdad (affärsgranskningen L2). */
  entry?: string
}

export type NedladdningsUtfall =
  | { typ: 'klar'; blob: Blob; url: string; filnamn: string }
  | { typ: 'sparr'; feature: string | null }
  | { typ: 'namn' }
  | { typ: 'fel'; text: string }

export function useNedladdning() {
  const [framsteg, setFramsteg] = useState<number | null>(null)
  const timer = useRef<number | null>(null)

  const stoppa = () => {
    if (timer.current) window.clearInterval(timer.current)
    timer.current = null
  }
  useEffect(() => stoppa, [])

  const ladda = useCallback(async (b: NedladdningsBegaran): Promise<NedladdningsUtfall> => {
    setFramsteg(0.04)
    const start = Date.now()
    // Uppskattningen fram till första byten: en PDF tar 3 till 5 sekunder.
    timer.current = window.setInterval(() => {
      const t = (Date.now() - start) / 4500
      setFramsteg((f) => Math.max(f ?? 0, Math.min(0.85, 1 - Math.exp(-2.2 * t))))
    }, 120)
    try {
      const res = await fetch('/api/cv/generate-formatted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: b.mall,
          cvId: b.cvId,
          structuredData: b.structuredData || undefined,
          cvText: b.cvText && b.cvText.trim().length >= 50 ? b.cvText : undefined,
          format: b.format,
          val: b.val,
          entry: b.entry,
        }),
      })
      if (res.status === 402) {
        const j = (await res.json().catch(() => ({}))) as { feature?: string }
        return { typ: 'sparr', feature: j.feature ?? null }
      }
      if (res.status === 422) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        if (j.error === 'name_required') return { typ: 'namn' }
        return { typ: 'fel', text: nedladdningsFelForStatus(400) }
      }
      if (!res.ok) return { typ: 'fel', text: nedladdningsFelForStatus(res.status) }

      stoppa()
      const total = Number(res.headers.get('content-length')) || 0
      let blob: Blob
      if (res.body && total > 0) {
        const reader = res.body.getReader()
        const delar: Uint8Array[] = []
        let fatt = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          delar.push(value)
          fatt += value.length
          setFramsteg(0.85 + 0.15 * Math.min(1, fatt / total))
        }
        blob = new Blob(delar as BlobPart[], { type: res.headers.get('content-type') ?? undefined })
      } else {
        blob = await res.blob()
      }
      setFramsteg(1)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = b.filnamn
      document.body.appendChild(a)
      a.click()
      a.remove()
      return { typ: 'klar', blob, url, filnamn: b.filnamn }
    } catch (e) {
      return { typ: 'fel', text: nedladdningsFelForUndantag(e) }
    } finally {
      stoppa()
      window.setTimeout(() => setFramsteg(null), 250)
    }
  }, [])

  return { framsteg, ladda }
}
