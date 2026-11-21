// @vitest-environment node
/**
 * cv_text sparas maskad på samma sätt i alla vägar som sparar ett CV med
 * struktur (2026-11-21): byggaren och arbetsläget (api/cv/strukturerad),
 * save-improved "nytt" (också byggarens första sparning), Ersätt,
 * LinkedIn-importen och provsidan. structured_data sparas omaskad som förut.
 *
 * Och läsarna: poängen (särskilt Kontaktuppgifter), kanonisktCv,
 * genomgången, LinkedIn-autofyllet, lankarLokalt, harledSprakniva och
 * Råtext ger samma sak för maskad som för omaskad text.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

type Skrivning = { typ: 'insert' | 'update'; rad: Record<string, unknown> }
let skrivningar: Skrivning[] = []

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1', email: 'konto@exempel.se' } }, error: null }) },
    from: () => {
      let skrev: Skrivning | null = null
      const k: Record<string, unknown> = {}
      for (const m of ['eq', 'select', 'like', 'gte', 'order', 'limit']) k[m] = () => k
      k.update = (rad: Record<string, unknown>) => {
        skrev = { typ: 'update', rad }
        skrivningar.push(skrev)
        return k
      }
      k.insert = (rad: Record<string, unknown>) => {
        skrev = { typ: 'insert', rad }
        skrivningar.push(skrev)
        return k
      }
      // Läsningar utan skrivning (provsidans "tidigare rad", originalCv) ger ingenting.
      k.maybeSingle = async () => ({ data: skrev ? { id: 'cv1' } : null, error: null })
      k.single = async () => ({ data: skrev ? { id: 'ny', ...(skrev.rad as object) } : null, error: null })
      k.then = (los: (v: unknown) => unknown) => los({ data: null, count: 0, error: null })
      return k
    },
  }),
}))
vi.mock('@/lib/supabase/premiumAccess', () => ({ getCvGrans: async () => ({ harBetalt: true, maxCvs: 50 }) }))
vi.mock('@/lib/onboarding/komigang-server', () => ({ markeraBricka: async () => {} }))

import { PUT as strukturerad } from '@/app/api/cv/strukturerad/route'
import { POST as saveImproved } from '@/app/api/cv/save-improved/route'
import { POST as franLinkedIn } from '@/app/api/cv/create-from-linkedin/route'
import { POST as provaHamta } from '@/app/api/cv/prova/hamta/route'
import { maskaLagradCvText } from '@/lib/privacy/lagradCvText'
import { lankarLokalt } from '@/lib/privacy/cvForModel'
import { formatCVMetadataAsText } from '@/lib/linkedin/linkedin-to-cv-converter'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import { poangFor, poangForRad, kanonisktCv, genomgang, arkKontakt, platshallareIRad, type KontaktKalla } from '@/lib/cv/poang'
import { harledSprakniva, radMedHarleddSprakniva } from '@/lib/cv/sprak'
import { sprakSomGenomgangen } from '@/lib/rum/cvRum'
import { cvTextForVisning } from '@/lib/cv/visningsText'
import { cvListaUr } from '@/components/cv/rum3/cvLista'
import { cvToLinkedIn } from '@/app/dashboard/linkedin-optimizer/lib/cvToLinkedIn'

const EPOST = 'mira.vallgren@exempel.se'
const TELEFON = '070-555 12 34'
const LINKEDIN = 'https://www.linkedin.com/in/miravallgren'

/** Byggarens CV (CVMetadata med bygge), så som klienten skickar det. */
const BYGGT = {
  personalInfo: {
    fullName: 'Mira Vallgren',
    email: EPOST,
    phone: TELEFON,
    address: 'Storgatan 12, 702 11 Örebro',
    linkedIn: LINKEDIN,
    title: 'Lagerarbetare',
  },
  summary: 'Lagerarbetare med fem års vana av plock, truck och inventering. Jag håller ordning och tempo.',
  experience: [
    {
      position: 'Lagerarbetare',
      company: 'Lager AB',
      startDate: '2019',
      endDate: '2024',
      description: ['Plockade 15000 rader i månaden med handdator', 'Körde truck vid in- och utleverans'],
    },
  ],
  education: [{ degree: 'Gymnasieexamen, Handel', institution: 'Örebro gymnasium', graduationYear: '2018' }],
  skills: [{ category: '', skills: ['Truckkort A och B', 'Inventering'] }],
  languages: [
    { language: 'Svenska', proficiency: 'Modersmål' },
    { language: 'Engelska', proficiency: 'Goda kunskaper' },
  ],
  bygge: { mall: 'linne', utkast: false },
}

const OMASKAD = formatCVMetadataAsText(normalizeStructuredData(BYGGT)!)
const MASKAD = maskaLagradCvText(OMASKAD)

const KALLA: KontaktKalla = {
  profil: { full_name: 'Mira Vallgren', email: EPOST, contact_email: null, phone: null, location: null } as KontaktKalla['profil'],
  anvandare: { email: EPOST },
}

function json(url: string, method: string, body: unknown) {
  return new Request(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) as never
}

function sistaSkrivning(): Record<string, unknown> {
  const s = skrivningar.at(-1)
  if (!s) throw new Error('ingen skrivning')
  return s.rad
}

function arMaskad(text: unknown) {
  const t = String(text)
  expect(t).not.toContain(EPOST)
  expect(t).not.toContain(TELEFON)
  expect(t).not.toContain('Storgatan 12')
  expect(t).toContain('[EMAIL]')
  expect(t).toContain('[TEL]')
  // Namn, ort och rollerna står kvar.
  expect(t).toContain('Mira Vallgren')
  expect(t).toContain('Örebro')
  expect(t).toContain('Lager AB')
}

function harKontaktOmaskad(sd: unknown) {
  const pi = (sd as { personalInfo: Record<string, unknown> }).personalInfo
  expect(pi.email).toBe(EPOST)
  expect(pi.phone).toBe(TELEFON)
  expect(pi.address).toBe('Storgatan 12, 702 11 Örebro')
  expect(pi.linkedIn).toBe(LINKEDIN)
}

beforeEach(() => {
  skrivningar = []
})

describe('varje skrivväg sparar cv_text maskad och structured_data omaskad', () => {
  it('byggaren och arbetsläget (PUT /api/cv/strukturerad)', async () => {
    const res = await strukturerad(json('http://localhost/api/cv/strukturerad', 'PUT', { cvId: 'cv1', cv: BYGGT }))
    expect(res.status).toBe(200)
    const rad = sistaSkrivning()
    expect(rad.cv_text).toBe(MASKAD)
    arMaskad(rad.cv_text)
    harKontaktOmaskad(rad.structured_data)
    expect(rad.structured_data).toEqual(normalizeStructuredData(BYGGT))
  })

  it('byggarens första sparning (save-improved utan cvId)', async () => {
    const text = formatCVMetadataAsText(BYGGT as never)
    const res = await saveImproved(json('http://localhost/api/cv/save-improved', 'POST', { fileName: 'Mira Vallgren', improvedText: text, structuredData: BYGGT, originalCvId: null }))
    expect(res.status).toBe(200)
    const rad = sistaSkrivning()
    expect(rad.cv_text).toBe(maskaLagradCvText(text))
    arMaskad(rad.cv_text)
    expect(rad.structured_data).toEqual(BYGGT)
  })

  it('spara som nytt efter förslagen (save-improved med originalCvId)', async () => {
    const text = `${OMASKAD}\n${LINKEDIN}`
    const res = await saveImproved(json('http://localhost/api/cv/save-improved', 'POST', { fileName: 'cv (förbättrat)', improvedText: text, structuredData: BYGGT, originalCvId: 'cv1' }))
    expect(res.status).toBe(200)
    const rad = sistaSkrivning()
    expect(rad.cv_text).toBe(maskaLagradCvText(text))
    arMaskad(rad.cv_text)
    expect(String(rad.cv_text)).not.toContain('linkedin.com')
    expect(rad.structured_data).toEqual(BYGGT)
  })

  it('Ersätt (save-improved lage ersatt)', async () => {
    const res = await saveImproved(json('http://localhost/api/cv/save-improved', 'POST', { lage: 'ersatt', cvId: 'cv1', fileName: 'cv', improvedText: OMASKAD, structuredData: BYGGT }))
    expect(res.status).toBe(200)
    const rad = sistaSkrivning()
    expect(rad.cv_text).toBe(MASKAD)
    expect(rad.structured_data).toEqual(BYGGT)
  })

  it('LinkedIn-importen (create-from-linkedin)', async () => {
    const res = await franLinkedIn(json('http://localhost/api/cv/create-from-linkedin', 'POST', { userId: 'u1', cvData: BYGGT, source: 'linkedin' }))
    expect(res.status).toBe(200)
    const rad = sistaSkrivning()
    arMaskad(rad.cv_text)
    harKontaktOmaskad(rad.structured_data)
  })

  it('provsidan (prova/hamta)', async () => {
    const res = await provaHamta(json('http://localhost/api/cv/prova/hamta', 'POST', { cv: BYGGT }))
    expect(res.status).toBe(200)
    const rad = sistaSkrivning()
    expect(rad.cv_text).toBe(MASKAD)
    arMaskad(rad.cv_text)
    harKontaktOmaskad(rad.structured_data)
  })
})

describe('läsarna ger samma sak med maskad text', () => {
  const sd = normalizeStructuredData(BYGGT)!

  it('kanonisktCv ger samma CV', () => {
    expect(kanonisktCv(sd, MASKAD)).toEqual(kanonisktCv(sd, OMASKAD))
    expect(kanonisktCv(BYGGT, MASKAD)).toEqual(kanonisktCv(BYGGT, OMASKAD))
    expect(kanonisktCv(sd, MASKAD)?.personalInfo.email).toBe(EPOST)
  })

  it('poängen och delen Kontaktuppgifter är desamma, med och utan profilen', () => {
    const utan = poangFor(sd, OMASKAD)!
    const med = poangFor(sd, MASKAD)!
    expect(med).toEqual(utan)
    const kontakt = med.kategorier.find((k) => k.id === 'kontakt')!
    expect(kontakt.poang).toBe(utan.kategorier.find((k) => k.id === 'kontakt')!.poang)
    expect(kontakt.poang).toBe(kontakt.max)

    const ark = arkKontakt(sd, KALLA)
    expect(poangFor(sd, MASKAD, ark)).toEqual(poangFor(sd, OMASKAD, ark))
    expect(poangForRad({ structured_data: sd, cv_text: MASKAD, kontakt: KALLA } as never)).toBe(
      poangForRad({ structured_data: sd, cv_text: OMASKAD, kontakt: KALLA } as never),
    )
  })

  it('genomgången på Analys och siffrorna är desamma', () => {
    expect(genomgang(kanonisktCv(sd, MASKAD)!)).toEqual(genomgang(kanonisktCv(sd, OMASKAD)!))
    expect(platshallareIRad(sd, MASKAD)).toEqual(platshallareIRad(sd, OMASKAD))
    expect(sprakSomGenomgangen(sd, MASKAD)).toBe(sprakSomGenomgangen(sd, OMASKAD))
  })

  it('harledSprakniva fungerar på maskad text', () => {
    // Ett äldre inläst CV med Konversation där texten säger "goda".
    const gammal = { ...sd, languages: [{ language: 'Engelska', proficiency: 'Konversation' }] }
    const text = `Mira Vallgren\n${EPOST}\n${TELEFON}\n\nSPRÅK\nEngelska - goda kunskaper\n`
    const fran = harledSprakniva(gammal, maskaLagradCvText(text)) as typeof gammal
    expect(fran.languages[0].proficiency).toBe('Goda kunskaper')
    expect(harledSprakniva(gammal, maskaLagradCvText(text))).toEqual(harledSprakniva(gammal, text))
    expect(radMedHarleddSprakniva({ structured_data: sd, cv_text: MASKAD }).structured_data).toEqual(
      radMedHarleddSprakniva({ structured_data: sd, cv_text: OMASKAD }).structured_data,
    )
  })

  it('LinkedIn-autofyllet läser strukturen, inte texten', () => {
    // cvToLinkedIn får cv.structured_data (LinkedInOptimizer.handleCvSelect); texten används inte.
    const rad = { structured_data: sd, cv_text: MASKAD }
    expect(cvToLinkedIn(rad.structured_data as never)).toEqual(cvToLinkedIn(sd as never))
    expect((rad.structured_data as typeof sd).personalInfo.linkedIn).toBe(LINKEDIN)
  })

  it('lankarLokalt läser länken ur källtexten; den lagrade texten används aldrig som källa', () => {
    // Inläsningen (api/cv/parse, generate-formatted utan struktur) läser länkarna ur
    // texten den får. Länken i ett byggt CV står i strukturen.
    expect(lankarLokalt(`${OMASKAD}\n${LINKEDIN}`).linkedIn).toBe(LINKEDIN)
    expect(lankarLokalt(maskaLagradCvText(`${OMASKAD}\n${LINKEDIN}`)).linkedIn).toBe('')
    expect(normalizeStructuredData(sd)?.personalInfo.linkedIn).toBe(LINKEDIN)
  })

  it('Råtext och Jobbcoachens förhandsrad visar kontakten som förut', () => {
    // Byggarens rad: texten skrivs ur strukturen, exakt som den sparades före maskningen.
    expect(cvTextForVisning(MASKAD, sd)).toBe(OMASKAD)
    const [lista] = cvListaUr([{ id: 'cv1', file_name: 'cv', created_at: '2026-11-21', structured_data: sd, cv_text: MASKAD }], new Set())
    expect(lista.cvText).toBe(OMASKAD)
    expect(lista.cvText).toContain(EPOST)
    // En gammal omaskad rad visas som den står.
    expect(cvTextForVisning(OMASKAD, sd)).toBe(OMASKAD)
    // Ett uppladdat CV (inläsningens roles-format) visar den lagrade texten som alltid.
    const uppladdad = { name: 'Mira', roles: [{ title: 'Lagerarbetare', company: 'Lager AB' }] }
    expect(cvTextForVisning(MASKAD, uppladdad)).toBe(MASKAD)
    expect(cvTextForVisning(null, sd)).toBeNull()
  })
})
