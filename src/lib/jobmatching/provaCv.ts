/**
 * CV:t som besökaren lägger in på /verktyg/jobbmatchning före kontot
 * (publikt omgång 3, "inga genvägar"). Samma mönster och samma tolkning som
 * CV-mallarnas provsida (lib/cv/mallval/utkast.ts, /api/public/cv/tolka):
 * filen tolkas i minnet på servern, utkastet ligger bara i besökarens
 * webbläsare (localStorage, jc_jobb_prova, 24 timmar). En egen nyckel, så
 * att ett utkast från CV-mallarna aldrig skickar någon till jobbmatchningen.
 *
 * Efter kontot hämtar valkommen-sidans hämtkedja hem CV:t till cv_texts via
 * /api/cv/prova/hamta (samma rutt som CV-mallarna) och skickar henne till
 * Matchade jobb, där det senaste CV:t läses in av sig självt.
 *
 * Alla läsningar och skrivningar i try/catch. Kastar aldrig.
 */
import type { CVMetadata } from '@/lib/cv/cv-metadata'

export const JOBB_CV_NYCKEL = 'jc_jobb_prova'
export const JOBBMATCHNING_KONTO = '/dashboard/jobbmatchning'
const LIVSLANGD_MS = 24 * 60 * 60 * 1000

export interface JobbCvUtkast {
  cv: CVMetadata
  filnamn: string | null
  sparad: number
}

/** Det matchningen läser ur CV:t, i ord, för raden "Det här läste vi". Ren. */
export function lastUrCv(cv: CVMetadata): { roller: string[]; kompetenser: string[]; ort: string | null; utbildning: string | null } {
  const roller = Array.from(new Set((cv.experience ?? []).map((e) => e.position?.trim()).filter((s): s is string => !!s))).slice(0, 3)
  const kompetenser = Array.from(
    new Set(
      (cv.skills ?? [])
        .flatMap((s) => (s.skills?.length ? s.skills : s.name ? [s.name] : []))
        .map((s) => s?.trim())
        .filter((s): s is string => !!s)
    )
  ).slice(0, 6)
  const ort = cv.personalInfo?.location?.trim() || cv.personalInfo?.address?.trim() || null
  const utbildning = cv.education?.[0]?.degree?.trim() || null
  return { roller, kompetenser, ort, utbildning }
}

export function lasJobbCv(nu: number = Date.now()): JobbCvUtkast | null {
  try {
    const raw = window.localStorage.getItem(JOBB_CV_NYCKEL)
    if (!raw) return null
    const u = JSON.parse(raw) as JobbCvUtkast
    if (!u || typeof u !== 'object' || !u.cv || typeof u.sparad !== 'number') return null
    if (nu - u.sparad > LIVSLANGD_MS) {
      window.localStorage.removeItem(JOBB_CV_NYCKEL)
      return null
    }
    return u
  } catch {
    return null
  }
}

export function sparaJobbCv(cv: CVMetadata, filnamn: string | null): void {
  try {
    window.localStorage.setItem(JOBB_CV_NYCKEL, JSON.stringify({ cv, filnamn, sparad: Date.now() } satisfies JobbCvUtkast))
  } catch {
    // Lagringen är avstängd: hon lägger in CV:t i kontot i stället.
  }
}

export function rensaJobbCv(): void {
  try {
    window.localStorage.removeItem(JOBB_CV_NYCKEL)
  } catch {
    // Se ovan.
  }
}

/** Valkommen-sidans hämtning: CV:t till kontot, sedan Matchade jobb. Null när inget finns eller något går fel. */
export async function claimPendingJobbCv(): Promise<string | null> {
  const u = lasJobbCv()
  if (!u) return null
  try {
    const res = await fetch('/api/cv/prova/hamta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv: u.cv, filnamn: u.filnamn ?? undefined }),
    })
    const j = (await res.json().catch(() => ({}))) as { cvId?: string }
    if (res.ok && j.cvId) {
      rensaJobbCv()
      return JOBBMATCHNING_KONTO
    }
    if (res.status === 400) rensaJobbCv()
    return null
  } catch {
    return null
  }
}
