/**
 * Arbetsläget (byggspecen avsnitt 7 och 10b): EN vy för alla CV, uppladdade,
 * byggda och de som skrivs från början. Adressen är kontraktet med Mallar,
 * Ditt CV och Analys:
 *
 *   /dashboard/skapa-cv?cv=<id>&avsnitt=<kontakt|profil|erfarenhet|utbildning|kompetenser|sprak|fler>&mall=<mallid>&fran=<mallar|ditt-cv|analys>
 *
 * Utan cv är det byggaren från början. "Klar" och tillbaka går till sidan i
 * fran med samma cv och mall. Valen från Mallar (typsnitt, farg, ordning,
 * ensida, uppsattning) står i samma adress och följer med tillbaka.
 *
 * Här bor de rena delarna: adressen, vilket blad ett avsnitt öppnar, jobbens
 * ordning på arket och källan till förhandsvisningen. Klientsäker, ren data.
 */
import type { CVEducation, CVExperience, CVMetadata } from '@/lib/cv/cv-metadata'
import type { MallVal, Sektion } from '@/lib/cv/mallar/kontrakt'
import type { ArkVal, PostSektion } from '@/lib/cv/bygg/ark'
import { byggKalla } from '@/lib/cv/bygg/kalla'
import { valTillQuery } from '@/lib/cv/mallar/val'
import { harInnehall, miniminiva, nastaLucka, type ByggCv, type GuidatAvsnitt } from '@/lib/cv/bygg/modell'
import { tolkaDatum, arPagaende } from '@/lib/cv/bygg/datum'

/* ------------------------------------------------------------------ läget */

/** Bygg: ett nytt CV eller ett utkast ur byggaren. Redigera: allt annat. */
export type Lage = 'bygg' | 'redigera'

export function lageFor(cvId: string | null, cv: ByggCv): Lage {
  return !cvId || cv.bygge?.utkast === true ? 'bygg' : 'redigera'
}

/* ----------------------------------------------------------------- adressen */

export type Fran = 'mallar' | 'ditt-cv' | 'analys'

/** fran ur adressen. Byggarens gamla ingång mina_cv är Ditt CV. */
export function tolkaFran(v: string | null | undefined): Fran | null {
  if (v === 'mallar' || v === 'ditt-cv' || v === 'analys') return v
  if (v === 'mina_cv') return 'ditt-cv'
  return null
}

const SIDA: Record<Fran, string> = {
  mallar: '/dashboard/cv-mallar',
  'ditt-cv': '/dashboard/profil/cv',
  analys: '/dashboard/cv-analys',
}

/** Klar och tillbaka: sidan i fran med samma cv och mall (och valen till Mallar). Utan fran: Ditt CV. */
export function tillbakaHref(fran: Fran | null, cvId: string | null, mall: string | null, val?: MallVal | null): string {
  const f = fran ?? 'ditt-cv'
  const q = new URLSearchParams()
  if (cvId) q.set('cv', cvId)
  if (mall && f === 'mallar') q.set('mall', mall)
  if (val && f === 'mallar') valTillQuery(val, q)
  const s = q.toString()
  return s ? `${SIDA[f]}?${s}` : SIDA[f]
}

export const AVSNITT_PARAM = ['kontakt', 'profil', 'erfarenhet', 'utbildning', 'kompetenser', 'sprak', 'fler'] as const
export type AvsnittParam = (typeof AVSNITT_PARAM)[number]

export function tolkaAvsnitt(v: string | null | undefined): AvsnittParam | null {
  return (AVSNITT_PARAM as readonly string[]).includes(v ?? '') ? (v as AvsnittParam) : null
}

/** Avsnittet ett blad hör till, som det står i adressen och i avsnittsraden. */
export function paramForArk(a: ArkVal): AvsnittParam {
  switch (a.typ) {
    case 'huvud':
      return 'kontakt'
    case 'fler':
      return 'fler'
    case 'lista':
    case 'post':
      return a.sektion
    case 'avsnitt':
      return a.sektion === 'intyg' || a.sektion === 'projekt' || a.sektion === 'intressen' ? 'fler' : a.sektion
  }
}

/* ------------------------------------------------------- jobbens ordning */

function tid(s: unknown): number {
  if (arPagaende(s)) return Date.now()
  const d = tolkaDatum(s)
  if (!d.ar) return 0
  return new Date(Number(d.ar), (d.manad ?? 1) - 1, 1).getTime()
}

/**
 * Posterna i den ordning arket visar dem (det senaste först): pågående
 * överst, sedan efter slutdatum, lika efter startdatum. Samma regel som
 * renderaren (src/lib/cv/mallar/innehall.ts), räknad på index i CV:t.
 */
export function ordning(cv: CVMetadata, s: PostSektion): number[] {
  if (s === 'erfarenhet') {
    const lista = (cv.experience ?? []) as CVExperience[]
    const slut = (e: CVExperience) => (e.endDate && !arPagaende(e.endDate) ? tid(e.endDate) : Date.now())
    return lista
      .map((_, i) => i)
      .sort((a, b) => {
        const d = slut(lista[b]) - slut(lista[a])
        if (Math.abs(d) > 86_400_000) return d
        const s2 = tid(lista[b].startDate) - tid(lista[a].startDate)
        return s2 !== 0 ? s2 : a - b
      })
  }
  const lista = (cv.education ?? []) as CVEducation[]
  const slut = (e: CVEducation) => (e.endDate ? tid(e.endDate) : e.graduationYear ? tid(e.graduationYear) : Date.now())
  return lista
    .map((_, i) => i)
    .sort((a, b) => {
      const d = slut(lista[b]) - slut(lista[a])
      return Math.abs(d) > 86_400_000 ? d : a - b
    })
}

/** "Klarna, 2018 till 2021", utan tankstreck. */
export function periodText(fran: unknown, till: unknown, pagaende = false): string {
  const a = tolkaDatum(fran).ar
  const b = pagaende || arPagaende(till) ? 'i dag' : tolkaDatum(till).ar
  if (a && b && a !== b) return `${a} till ${b}`
  return a || b || ''
}

/* ------------------------------------------------------- avsnitt till blad */

/** Bladet ett avsnitt öppnar: jobbet och utbildningen överst på arket, annars ett nytt. */
export function arkFor(cv: CVMetadata, s: Sektion | 'huvud' | 'fler'): ArkVal {
  if (s === 'huvud') return { typ: 'huvud' }
  if (s === 'fler' || s === 'referenser') return { typ: 'fler' }
  if (s === 'erfarenhet' || s === 'utbildning') {
    const o = ordning(cv, s)
    return { typ: 'post', sektion: s, index: o.length ? o[0] : 'ny' }
  }
  return { typ: 'avsnitt', sektion: s }
}

export function arkForParam(cv: CVMetadata, p: AvsnittParam): ArkVal {
  return arkFor(cv, p === 'kontakt' ? 'huvud' : p)
}

/**
 * Bladet som öppnas när adressen inte säger något: från början den första
 * luckan i miniminivån (namn och e-post, sedan ett jobb), sedan nästa tomma
 * avsnitt i den guidade ordningen. Redigera: jobben (skissen Redigera).
 */
export function startArk(cv: CVMetadata, lage: Lage): ArkVal {
  if (lage === 'redigera') return arkFor(cv, harInnehall(cv, 'erfarenhet') ? 'erfarenhet' : 'huvud')
  const mini = miniminiva(cv)
  if (mini.saknas === 'namn' || mini.saknas === 'epost') return { typ: 'huvud' }
  const n = nastaLucka(cv)
  return arkFor(cv, n ?? 'erfarenhet')
}

/** Nästa-raden i bladet: luckan i miniminivån först, sedan den guidade ordningen. */
export type Nasta = { typ: 'kontakt' } | { typ: 'avsnitt'; sektion: GuidatAvsnitt }

export function nastaFor(cv: CVMetadata, nu: AvsnittParam, hoppade: readonly Sektion[]): Nasta | null {
  const mini = miniminiva(cv)
  if ((mini.saknas === 'namn' || mini.saknas === 'epost') && nu !== 'kontakt') return { typ: 'kontakt' }
  if (mini.saknas === 'innehall' && nu !== 'erfarenhet') return { typ: 'avsnitt', sektion: 'erfarenhet' }
  const n = nastaLucka(cv, [...hoppade, ...(nu === 'kontakt' || nu === 'fler' ? [] : [nu as Sektion])])
  return n ? { typ: 'avsnitt', sektion: n } : null
}

/* ------------------------------------------------------- förhandsvisningen */

/**
 * Källan till arket. Spöktexten (grå exempel) bara när CV:t byggs; ett
 * uppladdat CV visas som det är. Servern (page.tsx) och klienten räknar
 * samma källa, så att arkets första HTML ligger i flikens minne direkt.
 */
export function arkKalla(a: { cv: ByggCv; cvId: string | null; mall: string; val: MallVal; rubriker: Partial<Record<Sektion, string>>; lage: Lage }) {
  const k = byggKalla(a)
  return a.lage === 'bygg' ? k : { ...k, spok: undefined }
}
