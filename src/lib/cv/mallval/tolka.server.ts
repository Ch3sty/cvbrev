/**
 * Eget CV utan konto (plan-mallar 3.2, beslut 2): filen blir CVMetadata i
 * minnet, inget sparas.
 *
 * 1. Texten tas ut lokalt med de befintliga läsarna (pdf-parser och mammoth).
 * 2. Kontaktuppgifter, intyg och språk plockas lokalt med regelparsern
 *    (parseSwedishCVContent, ingen AI).
 * 3. Texten maskas med pii.ts (namn, e-post, telefon, personnummer, adress,
 *    länkar) och först den maskade texten går till Gemini via den befintliga
 *    parseCVStructure, som ger erfarenhet, utbildning, kompetenser och profil.
 * 4. Delarna slås ihop till CVMetadata. Platshållare från maskningen tas bort.
 *
 * Bara för servern.
 */
import 'server-only'
import { parseCV as lasFil, ImageBasedPdfError } from '@/lib/cv-parser'
import { parseCV as parseCVStructure } from '@/lib/cv/cv-parser'
import { parseSwedishCVContent } from '@/lib/cv/swedish-cv-content-parser'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import { maskForModel } from '@/lib/privacy/pii'
import type { CVMetadata } from '@/lib/cv/cv-metadata'

export const MAX_FILSTORLEK = 5 * 1024 * 1024

export type TolkningsFel = 'for_stor' | 'fel_typ' | 'bild_pdf' | 'tom'

export class TolkaFel extends Error {
  constructor(public kod: TolkningsFel) {
    super(kod)
  }
}

export type Del = 'kontakt' | 'erfarenhet' | 'utbildning' | 'kompetenser' | 'intyg' | 'sprak'

export interface Tolkning {
  cv: CVMetadata
  hittade: Del[]
  saknas: Del[]
  /** Vilken sorts fil, för cv_eget_inlast. */
  metod: 'pdf' | 'docx'
}

const FELTEXTER = ['Kunde inte läsa', 'Misslyckades med att läsa', 'PDF-texten kunde inte', 'Filformatet stöds inte', 'Kunde inte ladda DOCX', 'Kunde inte extrahera text']

export function filtyp(namn: string): 'pdf' | 'docx' | null {
  const ext = namn.toLowerCase().split('.').pop()
  return ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : null
}

/** Text ur filen, eller ett TolkaFel. */
export async function textUrFil(fil: File): Promise<{ text: string; metod: 'pdf' | 'docx' }> {
  if (fil.size > MAX_FILSTORLEK) throw new TolkaFel('for_stor')
  const metod = filtyp(fil.name)
  if (!metod) throw new TolkaFel('fel_typ')
  let text = ''
  try {
    text = await lasFil(fil)
  } catch (err) {
    if (err instanceof ImageBasedPdfError) throw new TolkaFel('bild_pdf')
    throw new TolkaFel(metod === 'pdf' ? 'bild_pdf' : 'tom')
  }
  if (FELTEXTER.some((f) => text.startsWith(f)) || text.trim().length < 50) {
    throw new TolkaFel(metod === 'pdf' ? 'bild_pdf' : 'tom')
  }
  return { text, metod }
}

const PLATSHALLARE = /\[(NAMN|EMAIL|E-POST|TEL|TELEFON|ADRESS|POSTNR|PERSNR|PERSONNUMMER|URL|LÄNK)[^\]]*\]/gi

function rensa(s: string | undefined): string {
  return (s ?? '').replace(PLATSHALLARE, '').replace(/\s{2,}/g, ' ').trim()
}

function rensaLista(l: string[] | undefined): string[] {
  return (l ?? []).map(rensa).filter((x) => x.length > 0)
}

/** CVMetadata ur texten. Gemini får bara den maskade texten. */
export async function tolkaText(text: string, metod: 'pdf' | 'docx'): Promise<Tolkning> {
  // Lokalt, utan AI: kontakt, intyg, språk och en reserv för resten.
  let lokal: CVMetadata | null = null
  try {
    lokal = await parseSwedishCVContent(text)
  } catch (err) {
    console.error('[cv/tolka] lokal tolkning misslyckades:', err)
  }

  const { text: maskad, detectedName } = maskForModel(text, {
    fullName: lokal?.personalInfo?.fullName || undefined,
  })

  let ai: CVMetadata | null = null
  try {
    ai = normalizeStructuredData(await parseCVStructure(maskad))
  } catch (err) {
    console.error('[cv/tolka] strukturering misslyckades, lokala tolkningen används:', err)
  }

  const kalla = ai ?? lokal
  const namn = rensa(detectedName ?? lokal?.personalInfo?.fullName ?? '')
  const pi = lokal?.personalInfo
  const cv: CVMetadata = {
    personalInfo: {
      fullName: namn,
      email: pi?.email ?? '',
      phone: pi?.phone,
      address: pi?.address ?? pi?.location,
      linkedIn: pi?.linkedIn ?? pi?.linkedin,
      title: rensa(ai?.personalInfo?.title || pi?.title || kalla?.experience?.[0]?.position),
    },
    summary: rensa(ai?.summary || lokal?.summary) || undefined,
    experience: (kalla?.experience ?? []).map((e) => ({
      ...e,
      position: rensa(e.position),
      company: rensa(e.company).replace(/^Okänt företag$/, ''),
      description: rensaLista(e.description),
      achievements: e.achievements ? rensaLista(e.achievements) : undefined,
    })),
    education: (kalla?.education ?? []).map((u) => ({
      ...u,
      degree: rensa(u.degree),
      institution: rensa(u.institution),
      description: u.description ? rensa(u.description) : undefined,
    })),
    skills: (kalla?.skills ?? [])
      .map((s) => ({ ...s, category: rensa(s.category), skills: rensaLista(s.skills) }))
      .filter((s) => s.skills.length > 0),
    certifications: lokal?.certifications?.length
      ? lokal.certifications
          .map((c) => ({
            ...c,
            // Regelparserns punkttecken och platshållarutfärdare följer inte med.
            name: rensa(c.name).replace(/^[•·*\s-]+/, ''),
            issuer: /^certifieringsmyndighet$/i.test((c.issuer ?? '').trim()) ? '' : rensa(c.issuer),
          }))
          .filter((c) => c.name)
      : undefined,
    languages: lokal?.languages?.length ? lokal.languages : undefined,
  }

  const har: Record<Del, boolean> = {
    kontakt: Boolean(cv.personalInfo.email || cv.personalInfo.phone),
    erfarenhet: cv.experience.length > 0,
    utbildning: cv.education.length > 0,
    kompetenser: cv.skills.length > 0,
    intyg: (cv.certifications?.length ?? 0) > 0,
    sprak: (cv.languages?.length ?? 0) > 0,
  }
  // Kärnan som raden "saknas" handlar om; intyg och språk har inte alla.
  const karna: Del[] = ['kontakt', 'erfarenhet', 'utbildning', 'kompetenser']
  const hittade = (Object.keys(har) as Del[]).filter((d) => har[d])
  const saknas = karna.filter((d) => !har[d])
  return { cv, hittade, saknas, metod }
}
