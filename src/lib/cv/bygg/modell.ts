/**
 * CV-byggarens modell (docs/design/skiss-cv-byggare-2026-11-16.html):
 * vad som räknas som ifyllt, miniminivån för nedladdning, den guidade
 * ordningen i Nästa-raden och byggarens egna fält på CV:t.
 *
 * Två ordningar, aldrig ihopblandade (ägarens granskning 16 nov): på arket
 * står avsnitten där mallen placerar dem (profilen överst), medan Nästa-raden
 * föreslår jobben först och profilen sist, så att Jobbcoachen kan skriva
 * profilen ur det som står.
 *
 * Klientsäker, ren data och rena funktioner.
 */
import type { CVLanguage, CVMetadata } from '../cv-metadata'
import type { MallVal, Sektion } from '../mallar/kontrakt'

/** Den guidade ordningen i Nästa-raden: jobb först, profilen sist. */
export const GUIDAD = ['erfarenhet', 'utbildning', 'kompetenser', 'profil', 'sprak'] as const
export type GuidatAvsnitt = (typeof GUIDAD)[number]

/** Avsnitten bakom "+ Fler avsnitt", aldrig i den guidade ordningen. */
export const FLER = ['intyg', 'projekt', 'intressen'] as const
export type FlerAvsnitt = (typeof FLER)[number]

/**
 * Byggarens fält på CV:t, i structured_data (ingen schemaändring):
 * utkast tills filen laddats ner, och mallen med valen så att återkomsten
 * via ?cv= ser likadan ut. Rubrikerna sparas som förut i section_titles.
 */
export interface Bygge {
  utkast: boolean
  mall?: string
  val?: MallVal
}

export type ByggCv = CVMetadata & { bygge?: Bygge }

const fylld = (s: unknown) => typeof s === 'string' && s.trim().length > 0

/** Har avsnittet hennes egen text? */
export function harInnehall(cv: CVMetadata, s: Sektion): boolean {
  switch (s) {
    case 'erfarenhet':
      return (cv.experience ?? []).some((e) => e && (fylld(e.position) || fylld(e.company)))
    case 'utbildning':
      return (cv.education ?? []).some((e) => e && (fylld(e.degree) || fylld(e.institution)))
    case 'kompetenser':
      return (cv.skills ?? []).some((g) =>
        typeof g === 'string' ? fylld(g) : (g?.skills ?? []).some((k) => fylld(k))
      )
    case 'profil':
      return fylld(cv.summary)
    case 'sprak':
      return (cv.languages ?? []).some((l) => (typeof l === 'string' ? fylld(l) : fylld(l?.language)))
    case 'intyg':
      return (cv.certifications ?? []).some((c) => (typeof c === 'string' ? fylld(c) : fylld(c?.name)))
    case 'projekt':
      return (cv.projects ?? []).some((p) => p && (fylld(p.name) || fylld(p.title)))
    case 'intressen':
      return (cv.interests ?? []).some(fylld)
    case 'referenser':
      return false
  }
}

export type Saknas = 'namn' | 'epost' | 'innehall'

/**
 * Miniminivån för nedladdning (UX-briefen): namn, e-post och minst ett jobb
 * eller en utbildning. Telefon är ingen spärr.
 */
export function miniminiva(cv: CVMetadata): { klar: boolean; saknas: Saknas | null } {
  const pi = cv.personalInfo ?? ({} as CVMetadata['personalInfo'])
  if (!fylld(pi.fullName)) return { klar: false, saknas: 'namn' }
  if (!fylld(pi.email)) return { klar: false, saknas: 'epost' }
  if (!harInnehall(cv, 'erfarenhet') && !harInnehall(cv, 'utbildning')) return { klar: false, saknas: 'innehall' }
  return { klar: true, saknas: null }
}

/** Nästa tomma avsnitt i den guidade ordningen, utom de hon hoppat över. */
export function nastaLucka(cv: CVMetadata, hoppade: readonly Sektion[] = []): GuidatAvsnitt | null {
  return GUIDAD.find((s) => !harInnehall(cv, s) && !hoppade.includes(s)) ?? null
}

/** Antal ifyllda avsnitt av de fem guidade, för framstegslinjen. */
export function antalKlara(cv: CVMetadata): number {
  return GUIDAD.filter((s) => harInnehall(cv, s)).length
}

/** Avsnittets plats i den guidade ordningen, ettbaserad ("Avsnitt 1 av 5"). */
export function guidadPlats(s: Sektion): number | null {
  const i = (GUIDAD as readonly string[]).indexOf(s)
  return i < 0 ? null : i + 1
}

export interface ProfilUppgifter {
  namn?: string | null
  epost?: string | null
  telefon?: string | null
  ort?: string | null
  linkedin?: string | null
}

/** Svenska som modersmål, förifyllt (UX-briefen). */
export const SVENSKA: CVLanguage = { language: 'Svenska', proficiency: 'Modersmål' }

/** Ett nytt CV: kontakten ur profilen, titeln ur startbladet, svenska förifyllt. */
export function nyttCv(profil: ProfilUppgifter, titel = ''): ByggCv {
  return {
    personalInfo: {
      fullName: (profil.namn ?? '').trim(),
      email: (profil.epost ?? '').trim(),
      phone: (profil.telefon ?? '').trim() || undefined,
      address: (profil.ort ?? '').trim() || undefined,
      location: (profil.ort ?? '').trim() || undefined,
      linkedIn: (profil.linkedin ?? '').trim() || undefined,
      title: titel.trim() || undefined,
    },
    experience: [],
    education: [],
    skills: [],
    languages: [{ ...SVENSKA }],
    bygge: { utkast: true },
  }
}

/** CV-namnet i Mina CV, som den gamla byggaren skrev det. */
export function filnamnFor(cv: CVMetadata): string {
  const namn = (cv.personalInfo?.fullName ?? '').trim()
  return `CV - ${namn || 'Nytt CV'}`
}

/** Alla kompetenser som en platt lista (byggaren har inga kategorier). */
export function kompetenslista(cv: CVMetadata): string[] {
  const ut: string[] = []
  for (const g of cv.skills ?? []) {
    const delar = typeof g === 'string' ? [g] : g?.skills ?? []
    for (const k of delar) {
      const t = typeof k === 'string' ? k.trim() : ''
      if (t && !ut.some((u) => u.toLowerCase() === t.toLowerCase())) ut.push(t)
    }
  }
  return ut
}

/**
 * Den platta listan tillbaka till CV-formatet. Fanns grupper med namn sedan
 * förut står de kvar så länge deras kompetenser finns kvar; nya hamnar i en
 * grupp utan namn (mallen grupperar).
 */
export function medKompetenser(cv: CVMetadata, lista: readonly string[]): CVMetadata['skills'] {
  const kvar = new Set(lista.map((k) => k.toLowerCase()))
  const sedda = new Set<string>()
  const ut: CVMetadata['skills'] = []
  for (const g of cv.skills ?? []) {
    if (typeof g === 'string' || !g?.category?.trim()) continue
    const skills = (g.skills ?? []).filter((k) => {
      const l = k.toLowerCase()
      if (!kvar.has(l) || sedda.has(l)) return false
      sedda.add(l)
      return true
    })
    if (skills.length) ut.push({ category: g.category, skills })
  }
  const ovriga = lista.filter((k) => !sedda.has(k.toLowerCase()))
  if (ovriga.length) ut.push({ category: '', skills: [...ovriga] })
  return ut
}
