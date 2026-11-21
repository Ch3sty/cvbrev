/**
 * Inga personuppgifter i AI-anropen i CV-flödena (ägarens beslut 2026-11-21).
 *
 * För varje anrop fångas det som skickas till modellen (mockad klient) för
 * ett CV med namn, e-post, telefon, gatuadress, postnummer, personnummer,
 * födelsedatum och LinkedIn-adress. Inget av det får finnas i prompten, och
 * resultatet ska ändå ha rätt namn och kontaktuppgifter efteråt, lästa
 * lokalt. Modellens svar innehåller platshållare för att visa att de aldrig
 * hamnar i det som sparas eller visas.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const anrop: Array<{ systemInstruction?: string; prompt: string; schema?: unknown }> = []
let svar: unknown = {}

vi.mock('@/lib/gemini', () => ({
  generateJSON: async (opts: { systemInstruction?: string; prompt: string }) => {
    anrop.push(opts)
    return { data: structuredClone(svar), usage: { prompt: 1, completion: 1, total: 2 }, cost: 0 }
  },
  generateText: async (opts: { systemInstruction?: string; prompt: string }) => {
    anrop.push(opts)
    return { text: '', usage: { prompt: 1, completion: 1, total: 2 }, cost: 0 }
  },
  GEMINI_MODELS: { fast: 'fast', quality: 'quality' },
}))
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }) }))
vi.mock('@/lib/supabase/server', () => ({ createServerClient: () => ({}) }))
vi.mock('@/lib/openai/pricing-sync', () => ({ calculateCostFromDatabase: async () => 0 }))
vi.mock('@/lib/ai-cost-tracker', () => ({ trackAIUsage: async () => {}, AI_FEATURES: { CV_PARSING: 'cv_parsing' } }))
vi.mock('@/lib/activity-logger', () => ({ logUserActivity: async () => {} }))
vi.mock('@/lib/profile/backfillContact', () => ({ backfillProfileContact: async () => {} }))

import { parseCV } from '@/lib/cv/cv-parser'
import { analyzeCvBasic } from '@/lib/openai/cv-analysis'
import { parseCVWithAIServerSide } from '@/app/api/cv/parse/route'
import { maskForModel as maskEdge } from '../../../../supabase/functions/_shared/pii'
import { maskaCvForModel, utanPiiPlatshallare } from '@/lib/privacy/cvForModel'
import { poangFor } from '@/lib/cv/poang'

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
Ansvarar för omvårdnad av 14 patienter. Referens: Per Ek, 073-987 65 43.

SPRÅK
Svenska (modersmål), Engelska (flytande)`

const PERSONUPPGIFTER = [
  'Karin',
  'Holmström',
  'Storgatan 12',
  '752 31',
  '070-123 45 67',
  '0701234567',
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

beforeEach(() => {
  anrop.length = 0
})

describe('inga personuppgifter till AI:n', () => {
  it('maskeringen tar namn, e-post, telefon, adress, personnummer, födelsedatum och LinkedIn', () => {
    utanPersonuppgifter(maskaCvForModel(CV, { fullName: 'Karin Holmström' }))
    // Edge-funktionens kopia (analyze-cv-background) maskar likadant.
    utanPersonuppgifter(maskEdge(CV, { fullName: 'Karin Holmström', maskUrls: true }).text)
    // Arbetsgivarens ort i rollraden är ingen personuppgift och står kvar.
    expect(maskaCvForModel(CV, { fullName: 'Karin Holmström' })).toContain('Region Uppsala')
  })

  it('inläsningen (parseCV): maskad prompt, ber inte om namnet, namn och kontakt sätts lokalt', async () => {
    svar = {
      name: '[NAMN]',
      profile: 'Undersköterska med tio års erfarenhet av äldreomsorg.',
      roles: [
        {
          title: 'Undersköterska',
          company: 'Region Uppsala',
          period: '2015 - pågående',
          description: 'Ansvarar för omvårdnad av 14 patienter. Referens: [NAMN], [TELEFON].',
          responsibilities: [],
          originalText: '[NAMN] [E-POST]',
        },
      ],
      education: [],
      skills: ['Omvårdnad', '[LÄNK]'],
      languages: [{ language: 'Svenska', proficiency: 'Modersmål' }],
    }
    const r = await parseCV(CV, { fullName: 'Karin Holmström', phone: '070-123 45 67' })
    expect(anrop).toHaveLength(1)
    utanPersonuppgifter(anrop[0].prompt)
    expect(anrop[0].prompt).not.toMatch(/"name"\s*:/)
    // Rätt namn och kontakt efteråt, ur texten lokalt.
    expect(r.name).toBe('Karin Holmström')
    expect(r.contact?.email).toBe('karin.holmstrom@exempel.se')
    expect(r.contact?.phone?.replace(/\D/g, '')).toBe('0701234567')
    // Inga platshållare i det som sparas.
    expect(JSON.stringify(r)).not.toMatch(/\[(NAMN|TELEFON|E-POST|LÄNK)\]/)
    expect(r.skills).toEqual(['Omvårdnad'])
    // Poängens kontaktuppgifter räknas på de riktiga uppgifterna.
    const p = poangFor(r, CV)!
    expect(p.kategorier.find((k) => k.id === 'kontakt')!.poang).toBe(10)
  })

  it('uppladdningen: texten är redan maskad, kontakten kommer ur råtexten och når aldrig modellen', async () => {
    svar = { profile: 'Undersköterska.', roles: [], education: [], skills: [], languages: [] }
    // Så här ser texten ut när uppladdningen har maskat den före sparning.
    const sparadText = CV.replace('070-123 45 67', '[TEL]')
      .replace('073-987 65 43', '[TEL]')
      .replace('karin.holmstrom@exempel.se', '[EMAIL]')
      .replace('752 31', '[POSTNR]')
    const { extractContactLocally } = await import('@/lib/privacy/extractContact')
    const r = await parseCV(sparadText, { fullName: null, phone: null, kontakt: extractContactLocally(CV) })
    utanPersonuppgifter(anrop[0].prompt)
    expect(r.contact?.email).toBe('karin.holmstrom@exempel.se')
    expect(r.contact?.phone?.replace(/\D/g, '')).toBe('0701234567')
    expect(r.contact?.address).toContain('Uppsala')
    // Utan kontakten ur råtexten finns inget nummer att läsa i den sparade texten.
    const utan = await parseCV(sparadText, { fullName: null, phone: null })
    expect(utan.contact?.phone ?? '').toBe('')
  })

  it('basanalysen till snabbpoängen (analyzeCvBasic): maskad prompt, inga platshållare i texterna', async () => {
    svar = {
      summary: '[NAMN] har ett tydligt CV.',
      identifiedStrengths: ['Tydlig struktur'],
      improvementAreas: ['Lägg till [LÄNK] till portfolio'],
      keywords: ['Omvårdnad'],
    }
    const r = await analyzeCvBasic(CV, { fullName: 'Karin Holmström' })
    utanPersonuppgifter(anrop[0].prompt)
    expect(JSON.stringify(r)).not.toMatch(/\[(NAMN|LÄNK)\]/)
  })

  it('/api/cv/parse och PDF-exportens inläsning: maskad prompt, kontakt och länkar lokalt', async () => {
    svar = {
      personalInfo: { title: 'Undersköterska', linkedIn: '[LÄNK]' },
      summary: 'Jag är [NAMN], undersköterska.',
      experience: [{ position: 'Undersköterska', company: 'Region Uppsala', description: ['Referens [TELEFON]'] }],
      education: [],
      skills: [],
    }
    const r = await parseCVWithAIServerSide(CV)
    utanPersonuppgifter(anrop[0].prompt)
    utanPersonuppgifter(anrop[0].systemInstruction ?? '')
    expect(r.cvData.personalInfo.fullName).toBe('Karin Holmström')
    expect(r.cvData.personalInfo.email).toBe('karin.holmstrom@exempel.se')
    expect(r.cvData.personalInfo.linkedIn).toContain('linkedin.com/in/karinholmstrom')
    expect(JSON.stringify(r.cvData)).not.toMatch(/\[(NAMN|TELEFON|LÄNK)\]/)
  })

  it('platshållarna tas bort utan att [antal] i förslagen rörs', () => {
    expect(utanPiiPlatshallare('Ring [TELEFON] eller mejla [E-POST].')).toBe('Ring eller mejla.')
    expect(utanPiiPlatshallare('Besvarade [antal] ärenden')).toBe('Besvarade [antal] ärenden')
  })
})
