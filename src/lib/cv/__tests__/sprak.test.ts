/**
 * Språken i inläsningen (2026-11-21): tvätten efter AI-svaret, läget
 * finns/saknas/inte inläst och vägen från ett roles-CV till mallens
 * Språk-avsnitt. Inga riktiga AI-anrop: generateJSON mockas.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const generateJSON = vi.fn()
vi.mock('@/lib/gemini', () => ({
  generateJSON: (...a: unknown[]) => generateJSON(...a),
  GEMINI_MODELS: { fast: 'test-fast' },
}))

import { parseCV } from '../cv-parser'
import { sprakLage, tolkaNiva, tvattaSprak, MAX_SPRAKNAMN } from '../sprak'
import { normalizeStructuredData } from '../normalize-structured-data'
import { byggDokument } from '../mallar/innehall'
import { MALLAR } from '../mallar/register'
import { renderDefHtml } from '../mallar/render/html'

const CV_TEXT = `Åsa Öberg
Undersköterska, Region Västmanland, 2019 - pågående
Språk: Svenska (modersmål), Engelska (flytande), Tyska`

function svar(data: Record<string, unknown>) {
  generateJSON.mockResolvedValueOnce({ data })
}

const BAS = {
  name: 'Åsa Öberg',
  roles: [{ title: 'Undersköterska', company: 'Region Västmanland', period: '2019 - pågående', description: '', responsibilities: [], originalText: '' }],
  education: [],
  skills: ['Omvårdnad'],
}

beforeEach(() => {
  generateJSON.mockReset()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('tolkaNiva', () => {
  it('känner igen de fem nivåerna och CV:ts egna ord', () => {
    expect(tolkaNiva('Modersmål')).toBe('Modersmål')
    expect(tolkaNiva('flytande')).toBe('Flytande')
    expect(tolkaNiva('Mycket god')).toBe('Flytande')
    expect(tolkaNiva('C1')).toBe('Flytande')
    // Sedan 2026-11-21: god, goda, good och B1/B2 är ett eget steg.
    expect(tolkaNiva('god')).toBe('Goda kunskaper')
    expect(tolkaNiva('B2')).toBe('Goda kunskaper')
    expect(tolkaNiva('Grundläggande')).toBe('Nybörjare')
    expect(tolkaNiva('native')).toBe('Modersmål')
    expect(tolkaNiva('bilingual')).toBe('Tvåspråkig')
  })

  it('okänd eller saknad nivå blir tom, aldrig en gissning', () => {
    expect(tolkaNiva('')).toBe('')
    expect(tolkaNiva(undefined)).toBe('')
    expect(tolkaNiva('lite grann')).toBe('')
    expect(tolkaNiva(3)).toBe('')
  })
})

describe('tvattaSprak', () => {
  it('trimmar, tar bort dubbletter skiftlägesokänsligt och orimliga poster', () => {
    const ut = tvattaSprak([
      { language: '  Engelska ', proficiency: 'Flytande' },
      { language: 'engelska', proficiency: 'Nybörjare' },
      { language: '' },
      { language: '   ' },
      { language: 'x'.repeat(MAX_SPRAKNAMN + 1) },
      null,
      42,
      'Tyska',
    ])
    expect(ut).toEqual([
      { language: 'Engelska', proficiency: 'Flytande' },
      { language: 'Tyska', proficiency: '' },
    ])
  })

  it('är alltid en lista', () => {
    expect(tvattaSprak(undefined)).toEqual([])
    expect(tvattaSprak(null)).toEqual([])
    expect(tvattaSprak('Engelska')).toEqual([])
  })

  it('med CV-texten följer bara språk med som står i texten', () => {
    const ut = tvattaSprak([{ language: 'Engelska', proficiency: 'flytande' }, { language: 'Arabiska', proficiency: 'Modersmål' }], 'Talar flytande engelska.')
    expect(ut).toEqual([{ language: 'Engelska', proficiency: 'Flytande' }])
  })
})

describe('parseCV och språken', () => {
  it('lyckad inläsning ger tvättade språk', async () => {
    svar({
      ...BAS,
      languages: [
        { language: 'Svenska', proficiency: 'Modersmål' },
        { language: 'Engelska', proficiency: 'flytande' },
        { language: 'ENGELSKA', proficiency: 'Flytande' },
        { language: 'Tyska', proficiency: '' },
        { language: 'Finska', proficiency: 'Modersmål' }, // står inte i CV:t
      ],
    })
    const cv = await parseCV(CV_TEXT)
    expect(cv.languages).toEqual([
      { language: 'Svenska', proficiency: 'Modersmål' },
      { language: 'Engelska', proficiency: 'Flytande' },
      { language: 'Tyska', proficiency: '' },
    ])
    expect(sprakLage(cv)).toBe('finns')
  })

  it('modellen utan språkfält ger ändå en tom lista: vi har letat', async () => {
    svar({ ...BAS })
    const cv = await parseCV('Åsa Öberg\nUndersköterska, Region Västmanland, 2019 - pågående')
    expect(cv.languages).toEqual([])
    expect('languages' in cv).toBe(true)
    expect(sprakLage(cv)).toBe('saknas')
  })

  it('prompten ber om språk och förbjuder gissning', async () => {
    svar({ ...BAS, languages: [] })
    await parseCV(CV_TEXT)
    const { prompt } = generateJSON.mock.calls[0][0] as { prompt: string }
    expect(prompt).toContain('"languages"')
    expect(prompt).toMatch(/Gissa ALDRIG språk/)
  })

  it('reserven när AI-anropet faller har ingen språknyckel: inte inläst', async () => {
    generateJSON.mockRejectedValueOnce(new Error('kvot'))
    const cv = await parseCV(CV_TEXT)
    expect(cv.roles.length).toBeGreaterThan(0)
    expect('languages' in cv).toBe(false)
    expect(sprakLage(cv)).toBe('inte_inlast')
  })
})

describe('sprakLage', () => {
  it('null och annat än objekt är inte inläst', () => {
    expect(sprakLage(null)).toBe('inte_inlast')
    expect(sprakLage(undefined)).toBe('inte_inlast')
    expect(sprakLage('text')).toBe('inte_inlast')
    expect(sprakLage([])).toBe('inte_inlast')
  })

  it('roles-format: före ändringen, tomt och med språk', () => {
    expect(sprakLage({ ...BAS })).toBe('inte_inlast')
    expect(sprakLage({ ...BAS, languages: [] })).toBe('saknas')
    expect(sprakLage({ ...BAS, languages: [{ language: 'Engelska', proficiency: '' }] })).toBe('finns')
  })

  it('personalInfo/experience-format', () => {
    const cv = { personalInfo: { fullName: 'Åsa', email: '' }, experience: [], education: [], skills: [] }
    expect(sprakLage(cv)).toBe('inte_inlast')
    expect(sprakLage({ ...cv, languages: [] })).toBe('saknas')
    expect(sprakLage({ ...cv, languages: ['Engelska'] })).toBe('finns')
    expect(sprakLage({ ...cv, languages: [{ language: 'Arabiska', proficiency: 'Modersmål' }] })).toBe('finns')
  })

  it('byggarens CV (bygge) med tomma rader räknas som saknas', () => {
    const bygg = { personalInfo: { fullName: 'Åsa', email: '' }, experience: [], education: [], skills: [], bygge: { utkast: true } }
    expect(sprakLage({ ...bygg, languages: [{ language: '  ', proficiency: 'Flytande' }] })).toBe('saknas')
    expect(sprakLage({ ...bygg, languages: [{ language: 'Svenska', proficiency: 'Modersmål' }] })).toBe('finns')
  })
})

describe('roles-CV med språk i mallen', () => {
  const rolesCv = {
    ...BAS,
    skills: ['Omvårdnad', 'Engelska'],
    languages: [
      { language: 'Svenska', proficiency: 'Modersmål' },
      { language: 'Engelska', proficiency: '' },
    ],
  }

  it('normaliseras till CVMetadata med språken kvar', () => {
    const cv = normalizeStructuredData(rolesCv)!
    expect(cv.languages).toEqual([
      { language: 'Svenska', proficiency: 'Modersmål' },
      { language: 'Engelska', proficiency: '' },
    ])
  })

  it('sparad tom nivå förblir tom genom normalisering och mallinnehåll (CVMetadata-format)', () => {
    const sparat = {
      personalInfo: { fullName: 'Åsa Öberg', email: 'asa@exempel.se' },
      experience: [{ position: 'Undersköterska', company: 'Region Västmanland', startDate: '2019', description: [] }],
      education: [],
      skills: [],
      languages: [{ language: 'Engelska', proficiency: '' }],
    }
    const cv = normalizeStructuredData(JSON.parse(JSON.stringify(sparat)))!
    expect(cv.languages).toEqual([{ language: 'Engelska', proficiency: '' }])
    const dok = byggDokument(cv, MALLAR[0])
    const sprak = [...dok.fullBredd, ...dok.huvudspalt, ...dok.sidospalt].find((a) => a.sektion === 'sprak')
    expect(sprak?.innehall).toEqual({ typ: 'sprak', rader: [{ sprak: 'Engelska', niva: '' }] })
    // HTML-utskriften skriver ingen tom nivå i någon mall.
    for (const def of MALLAR) {
      const html = renderDefHtml(cv, def)
      expect(html, def.id).toContain('Engelska')
      expect(html, def.id).not.toMatch(/<span class="niva"><\/span>/)
    }
  })

  it('gammalt roles-CV utan språknyckel får inget språkfält', () => {
    expect(normalizeStructuredData({ ...BAS })!.languages).toBeUndefined()
  })

  it('ger avsnittet Språk i varje mall och språket står inte också under Kompetenser', () => {
    const cv = normalizeStructuredData(rolesCv)!
    for (const def of MALLAR) {
      const dok = byggDokument(cv, def)
      const alla = [...dok.fullBredd, ...dok.huvudspalt, ...dok.sidospalt]
      const sprak = alla.find((a) => a.sektion === 'sprak')
      expect(sprak, def.id).toBeDefined()
      expect(sprak!.innehall).toEqual({
        typ: 'sprak',
        rader: [
          { sprak: 'Svenska', niva: 'Modersmål' },
          { sprak: 'Engelska', niva: '' },
        ],
      })
      const komp = alla.find((a) => a.sektion === 'kompetenser')
      const kompetenser = komp && komp.innehall.typ === 'kompetenser' ? komp.innehall.grupper.flatMap((g) => g.lista) : []
      expect(kompetenser).toContain('Omvårdnad')
      expect(kompetenser).not.toContain('Engelska')
    }
  })
})
