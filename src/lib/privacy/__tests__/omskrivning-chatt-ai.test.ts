// @vitest-environment node
/**
 * Flödena som maskades 2026-11-21 (del B av integritetssvepet), enligt
 * mönstret i cv-ai-anrop.test.ts: allt som skickas till modellen fångas med
 * en mockad klient.
 *
 *  - Omskrivningen av CV:t (/api/cv/generate-improved): maskad prompt, och
 *    hennes namn, e-post och telefon tillbaka i det omskrivna CV:t.
 *  - Citaten ur CV:t (/api/cv/extract-text): maskad prompt, riktiga
 *    uppgifter i citaten som går tillbaka.
 *  - Grupperingen av förslag (/api/cv/group-improvements): maskad prompt.
 *  - Bifogat CV i Jobbcoachen (lib/jobbcoachen/bilagor.ts): bifogad text och
 *    filnamn maskas, det hon skriver själv gör det inte.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const anrop: Array<{ systemInstruction?: string; prompt?: string }> = []
let textsvar = ''
let jsonsvar: unknown = {}

vi.mock('@/lib/gemini', () => ({
  generateText: async (opts: { systemInstruction?: string; prompt?: string }) => {
    anrop.push(opts)
    return { text: textsvar, usage: { prompt: 1, completion: 1, total: 2 }, cost: 0 }
  },
  generateJSON: async (opts: { systemInstruction?: string; prompt?: string }) => {
    anrop.push(opts)
    return { data: structuredClone(jsonsvar), usage: { prompt: 1, completion: 1, total: 2 }, cost: 0 }
  },
  GEMINI_MODELS: { fast: 'fast', quality: 'quality' },
}))

let sparad: Record<string, unknown> | null = null
function kedja(tabell: string) {
  const k: Record<string, unknown> = {}
  k.select = () => k
  k.eq = () => k
  const profil = { data: { full_name: 'Karin Holmström', phone: '070-123 45 67' }, error: null }
  k.single = async () => (tabell === 'profiles' ? profil : { data: sparad ?? { file_name: 'cv.pdf' }, error: null })
  k.maybeSingle = async () => (tabell === 'profiles' ? profil : { data: null, error: null })
  k.insert = (rad: Record<string, unknown>) => {
    sparad = { id: 'nytt', ...rad }
    return k
  }
  return k
}

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: (t: string) => kedja(t),
  }),
}))
vi.mock('@/lib/openai/pricing-sync', () => ({ calculateCostFromDatabase: async () => 0 }))
vi.mock('@/lib/ai-cost-tracker', () => ({
  trackAIUsage: async () => {},
  AI_FEATURES: { CV_IMPROVEMENT: 'cv_improvement', GROUP_IMPROVEMENTS: 'group' },
}))
vi.mock('@/lib/activity-logger', () => ({ logUserActivity: async () => {} }))

import { POST as omskrivning } from '@/app/api/cv/generate-improved/route'
import { POST as citat } from '@/app/api/cv/extract-text/route'
import { POST as gruppering } from '@/app/api/cv/group-improvements/route'
import { maskeraBilagor } from '@/lib/jobbcoachen/bilagor'
import { maskaMedAterstallning } from '@/lib/privacy/aterstall'

const CV = `Karin Holmström
Storgatan 12, 752 31 Uppsala
070-123 45 67
karin.holmstrom@exempel.se
linkedin.com/in/karinholmstrom
Personnummer: 19850412-1234
Född: 12 april 1985

PROFIL
Undersköterska med tio års erfarenhet av äldreomsorg.

ERFARENHET
Undersköterska, Region Uppsala, Uppsala, 2015 - pågående
Ansvarar för omvårdnad av 14 patienter. Referens: Per Ek, 073-987 65 43.`

const PERSONUPPGIFTER = [
  'Karin',
  'Holmström',
  'Storgatan 12',
  '752 31',
  '070-123 45 67',
  'karin.holmstrom@exempel.se',
  'linkedin.com/in/karinholmstrom',
  '19850412-1234',
  '12 april 1985',
  '073-987 65 43',
]

function utanPersonuppgifter(text: string) {
  for (const p of PERSONUPPGIFTER) expect(text).not.toContain(p)
  expect(text.replace(/\D/g, '')).not.toContain('0701234567')
}

const begaran = (body: unknown) => ({ json: async () => body }) as never

beforeEach(() => {
  anrop.length = 0
  sparad = null
})

describe('maskning med återställning (omskrivning och citat)', () => {
  it('återställer namn och uppgifter i ordning, platshållare som blir över tas bort', () => {
    const m = maskaMedAterstallning(CV, { fullName: 'Karin Holmström', phone: '070-123 45 67' })
    utanPersonuppgifter(m.text)
    expect(m.text).toContain('Region Uppsala')
    const svar = '[NAMN]\n[TELEFON] | [E-POST]\nReferens: Per Ek, [TELEFON].\nExtra: [TELEFON]'
    const ut = m.aterstall(svar)
    expect(ut).toContain('Karin Holmström')
    expect(ut).toContain('karin.holmstrom@exempel.se')
    // Hennes nummer först, referensens sedan, och inga platshållare kvar.
    expect(ut.indexOf('070-123 45 67')).toBeLessThan(ut.indexOf('073-987 65 43'))
    expect(ut).not.toMatch(/\[(NAMN|TELEFON|E-POST)\]/)
  })

  it('heuristiken tar inte en jobbtitel för ett namn i korta fält', () => {
    const m = maskaMedAterstallning(CV, { fullName: 'Karin Holmström' })
    expect(m.maska('Senior Projektledare')).toBe('Senior Projektledare')
  })
})

describe('omskrivningen av CV:t (/api/cv/generate-improved)', () => {
  it('maskad prompt, riktiga uppgifter i det omskrivna CV:t', async () => {
    textsvar = '[NAMN]\n[ADRESS], [POSTNUMMER] Uppsala\n[TELEFON]\n[E-POST]\n[LÄNK]\n\nPROFIL\nUndersköterska med tio års erfarenhet.'
    const res = await omskrivning(
      begaran({
        cvId: 'cv1',
        originalContent: CV,
        selectedSuggestions: [{ id: 's1', title: 'Kvantifiera', description: 'Lägg till siffror, Karin', category: 'content' }],
        analysisDetails: { sammanfattning: 'Karin Holmström har ett tydligt CV.' },
        skipSave: true,
      })
    )
    expect(anrop).toHaveLength(1)
    utanPersonuppgifter(anrop[0].prompt ?? '')
    utanPersonuppgifter(anrop[0].systemInstruction ?? '')
    const j = await res.json()
    expect(j.improvedContent).toContain('Karin Holmström')
    expect(j.improvedContent).toContain('070-123 45 67')
    expect(j.improvedContent).toContain('karin.holmstrom@exempel.se')
    expect(j.improvedContent).toContain('Storgatan 12')
    expect(j.improvedContent).toContain('linkedin.com/in/karinholmstrom')
    expect(j.improvedContent).not.toMatch(/\[(NAMN|TELEFON|E-POST|ADRESS|POSTNUMMER|LÄNK)\]/)
  })
})

describe('citaten ur CV:t (/api/cv/extract-text)', () => {
  it('maskad prompt, riktiga uppgifter i citaten', async () => {
    jsonsvar = {
      originalText: 'Referens: Per Ek, [TELEFON].',
      roleContext: 'Undersköterska, Region Uppsala',
      confidence: 0.9,
      sourceSection: 'Erfarenhet',
    }
    textsvar = 'Ansvarar för omvårdnad av 14 patienter varje dag.'
    const res = await citat(
      begaran({
        cvContent: CV,
        improvements: [{ id: 'i1', area: 'Erfarenhet', suggestion: 'Kvantifiera omvårdnaden, Karin', category: 'content' }],
      })
    )
    expect(anrop.length).toBeGreaterThan(0)
    for (const a of anrop) {
      utanPersonuppgifter(a.prompt ?? '')
      utanPersonuppgifter(a.systemInstruction ?? '')
    }
    const j = await res.json()
    expect(JSON.stringify(j)).not.toMatch(/\[(NAMN|TELEFON|E-POST)\]/)
  })
})

describe('grupperingen av förslag (/api/cv/group-improvements)', () => {
  it('maskad prompt', async () => {
    jsonsvar = { originalText: 'Ansvarar för omvårdnad av 14 patienter.', roleContext: 'Undersköterska', confidence: 0.9, sourceSection: 'Erfarenhet' }
    textsvar = 'Ansvarar för omvårdnad av 14 patienter.'
    const res = await gruppering(
      begaran({
        improvements: [
          {
            id: 'a',
            area: 'Erfarenhet',
            description: 'Kvantifiera omvårdnaden för Karin Holmström: "Ansvarar för omvårdnad av 14 patienter"',
            example: 'Ring Karin på 070-123 45 67',
            type: 'quantification',
            category: 'content',
            selected: true,
          },
        ],
        cvText: CV,
        detailedAnalysis: { detailedImprovements: [] },
        parsedRoles: [{ title: 'Undersköterska', company: 'Region Uppsala', description: 'Ring 070-123 45 67' }],
        isInitialLoad: true,
      })
    )
    expect(res.status).toBe(200)
    expect(anrop.length).toBeGreaterThan(0)
    for (const a of anrop) {
      utanPersonuppgifter(a.prompt ?? '')
      utanPersonuppgifter(a.systemInstruction ?? '')
    }
  })
})

describe('bifogat CV i Jobbcoachen', () => {
  it('bifogad text och filnamn maskas, ort och arbetsgivare står kvar', () => {
    const [b] = maskeraBilagor(
      [{ file_name: 'CV Karin Holmström.pdf', file_type: 'pdf', extracted_text: CV }],
      { full_name: 'Karin Holmström', phone: '070-123 45 67' }
    )
    utanPersonuppgifter(b.extracted_text ?? '')
    utanPersonuppgifter(b.file_name ?? '')
    expect(b.extracted_text).toContain('Region Uppsala')
    expect(b.file_type).toBe('pdf')
  })

  it('utan profilnamn läses namnet i dokumentets början lokalt', () => {
    const [b] = maskeraBilagor([{ file_name: 'cv.pdf', file_type: 'pdf', extracted_text: CV }], null)
    utanPersonuppgifter(b.extracted_text ?? '')
  })
})
