'use client'

/**
 * Klientsidan av claim-flödet (docs/plan-konvertering.md, C6 och C7).
 *
 * Spår B anropar de här funktionerna direkt efter lyckad registrering, före
 * redirecten. Båda returnerar en path att skicka användaren till, eller null
 * när det inte finns något att hämta, så anropande kod kan falla tillbaka på
 * sin vanliga destination.
 *
 * Ingen av dem kastar: ett misslyckat claim får aldrig stoppa en registrering
 * som redan gått igenom.
 */

import { capture } from '@/lib/analytics/events'

const DRAFT_STORAGE_KEY = 'jc_pending_draft'
const CV_START_STORAGE_KEY = 'jc_pending_cv_start'
const TEST_STORAGE_KEY = 'jc_pending_test'
const INTERVJU_STORAGE_KEY = 'jc_pending_intervju'

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function clearSession(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch {
    // Privat läge: inget att städa.
  }
}

function readQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return new URLSearchParams(window.location.search).get(name)
  } catch {
    return null
  }
}

/** Sparar token så den överlever vägen genom registreringen. */
export function storePendingDraft(token: string): void {
  try {
    sessionStorage.setItem(DRAFT_STORAGE_KEY, token)
  } catch {
    // Länken /register?draft=... bär token även utan sessionStorage.
  }
}

/** Sparar valt yrke och mall inför CV-utkastet. */
export function storePendingCvStart(value: string): void {
  try {
    sessionStorage.setItem(CV_START_STORAGE_KEY, value)
  } catch {
    // Se ovan: cv_start-parametern i länken är reserven.
  }
}

/**
 * Hämtar ett väntande brevutkast. Token läses i första hand ur URL:en
 * (/register?draft=token), annars ur sessionStorage.
 *
 * Returnerar path till brevet, eller null om inget väntar.
 */
export async function claimPendingDraft(): Promise<string | null> {
  const token = readQueryParam('draft') ?? readSession(DRAFT_STORAGE_KEY)
  if (!token) return null

  try {
    const res = await fetch('/api/public/letter-draft/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (!res.ok) {
      clearSession(DRAFT_STORAGE_KEY)
      return null
    }

    const data = (await res.json()) as { redirect?: string }
    clearSession(DRAFT_STORAGE_KEY)

    if (!data.redirect) return null

    capture('draft_claimed', { kind: 'letter' })
    return data.redirect
  } catch (err) {
    console.error('[claim-draft] Kunde inte hämta utkastet:', err)
    clearSession(DRAFT_STORAGE_KEY)
    return null
  }
}

/**
 * Motsvarigheten för /cv-mallar/start. Ingen AI och inget serveranrop:
 * valet är bara ett yrke och en mall, så vi skickar användaren rakt in i
 * CV-byggaren med rätt mall förvald.
 *
 * Format på värdet: "{yrke}:{mall}".
 */
export async function claimPendingCvStart(): Promise<string | null> {
  const raw = readQueryParam('cv_start') ?? readSession(CV_START_STORAGE_KEY)
  if (!raw) return null

  clearSession(CV_START_STORAGE_KEY)

  const [yrke, mall] = raw.split(':')
  if (!mall) return null

  capture('draft_claimed', { kind: 'cv', yrke_slug: yrke || undefined })

  const params = new URLSearchParams({ mall })
  if (yrke) params.set('yrke', yrke)
  return `/dashboard/skapa-cv?${params.toString()}`
}

/** Sparar provets token så den överlever vägen genom registreringen. */
export function storePendingTestSession(token: string): void {
  try {
    sessionStorage.setItem(TEST_STORAGE_KEY, token)
  } catch {
    // Länken /register?test=... bär token även utan sessionStorage.
  }
}

/**
 * Kopplar en anonym provsession till det nya kontot (C9). Först här får
 * användaren tillgång till facit, förklaringar och normjämförelse.
 *
 * Returnerar path till testöversikten, eller null om inget prov väntar.
 */
export async function claimPendingTestSession(): Promise<string | null> {
  const token = readQueryParam('test') ?? readSession(TEST_STORAGE_KEY)
  if (!token) return null

  try {
    const res = await fetch('/api/public/test-session/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    clearSession(TEST_STORAGE_KEY)

    if (!res.ok) return null

    const data = (await res.json()) as { redirect?: string }
    if (!data.redirect) return null

    capture('draft_claimed', { kind: 'test' })
    return data.redirect
  } catch (err) {
    console.error('[claim-draft] Kunde inte hämta provet:', err)
    clearSession(TEST_STORAGE_KEY)
    return null
  }
}

/** Sparar intervjuprovets token så den överlever vägen genom registreringen. */
export function storePendingIntervju(token: string): void {
  try {
    sessionStorage.setItem(INTERVJU_STORAGE_KEY, token)
  } catch {
    // Länken /register?intervju=... bär token även utan sessionStorage.
  }
}

/**
 * Kopplar ett anonymt intervjusvar till det nya kontot
 * (docs/design/intervjuprov-spec-2026-09-23.md, avsnitt 5). Först här
 * blir hela återkopplingen och det omskrivna svaret tillgängliga.
 *
 * Returnerar path till svaret i dashboarden, eller null om inget väntar.
 */
export async function claimPendingIntervju(): Promise<string | null> {
  const token = readQueryParam('intervju') ?? readSession(INTERVJU_STORAGE_KEY)
  if (!token) return null

  try {
    const res = await fetch('/api/public/intervjuprov/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    clearSession(INTERVJU_STORAGE_KEY)

    if (!res.ok) return null

    const data = (await res.json()) as { redirect?: string }
    if (!data.redirect) return null

    capture('draft_claimed', { kind: 'interview' })
    return data.redirect
  } catch (err) {
    console.error('[claim-draft] Kunde inte hämta intervjusvaret:', err)
    clearSession(INTERVJU_STORAGE_KEY)
    return null
  }
}

const PERSONLIGHET_STORAGE_KEY = 'jc_pending_personlighet'

/** Sparar personlighetsprovets token så den överlever vägen genom registreringen. */
export function storePendingPersonlighet(token: string): void {
  try {
    sessionStorage.setItem(PERSONLIGHET_STORAGE_KEY, token)
  } catch {
    // Länken /register?personlighet=... bär token även utan sessionStorage.
  }
}

/**
 * Kopplar ett anonymt personlighetsprov till det nya kontot
 * (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 5). Först här
 * blir hela tolkningen tillgänglig.
 *
 * Returnerar path till tolkningssidan, eller null om inget väntar.
 */
export async function claimPendingPersonlighet(): Promise<string | null> {
  const token = readQueryParam('personlighet') ?? readSession(PERSONLIGHET_STORAGE_KEY)
  if (!token) return null

  try {
    const res = await fetch('/api/public/personlighetsprov/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    clearSession(PERSONLIGHET_STORAGE_KEY)

    if (!res.ok) return null

    const data = (await res.json()) as { redirect?: string }
    if (!data.redirect) return null

    capture('draft_claimed', { kind: 'personality' })
    return data.redirect
  } catch (err) {
    console.error('[claim-draft] Kunde inte hämta personlighetsprovet:', err)
    clearSession(PERSONLIGHET_STORAGE_KEY)
    return null
  }
}
