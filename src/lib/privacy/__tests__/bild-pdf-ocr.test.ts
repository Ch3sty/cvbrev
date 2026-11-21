// @vitest-environment node
/**
 * Bildbaserade PDF:er i uppladdningen (ägarens regel 2026-11-21: inga
 * personuppgifter till AI:n). Bygger på mönstret i cv-ai-anrop.test.ts: allt
 * som skickas till modellen fångas med en mockad klient.
 *
 *  - En bild-PDF utan textlager (påhittade Erik Lindberg i mallen Linne,
 *    150 dpi) läses med OCR på servern. Modellen får aldrig bilddata, och
 *    texten är maskad innan strukturanropet: inget namn, ingen e-post, inget
 *    telefonnummer, ingen LinkedIn-adress i prompten. Kontakten finns ändå
 *    rätt i det som sparas, läst lokalt ur OCR-texten.
 *  - En bild-PDF utan läsbar text avvisas med beskedet för bildbaserad PDF,
 *    utan ett enda modellanrop.
 *
 * Testet kör den riktiga OCR-läsningen (tesseract.js i en arbetstråd), så det
 * tar några sekunder.
 */
import fs from 'fs'
import path from 'path'
import { describe, it, expect, beforeEach, vi } from 'vitest'

const anrop: Array<Record<string, unknown>> = []
const bildanrop: unknown[] = []

vi.mock('@/lib/gemini', () => ({
  generateJSON: async (opts: Record<string, unknown>) => {
    anrop.push(opts)
    return {
      data: {
        profile: 'Erfaren projektledare.',
        roles: [
          {
            title: 'Senior Projektledare',
            company: 'Nordea Bank',
            period: '2021 - pågående',
            description: 'Leder ett tvärfunktionellt team.',
            responsibilities: [],
            originalText: '',
          },
        ],
        education: [],
        skills: ['Scrum'],
        languages: [],
      },
      usage: { prompt: 1, completion: 1, total: 2 },
      cost: 0,
    }
  },
  generateText: async (opts: Record<string, unknown>) => {
    anrop.push(opts)
    return { text: '', usage: { prompt: 1, completion: 1, total: 2 }, cost: 0 }
  },
  // Finns inte längre i appen; om något ändå anropar den syns det här.
  generateFromImages: async (opts: unknown) => {
    bildanrop.push(opts)
    return { text: '', usage: null, cost: 0 }
  },
  GEMINI_MODELS: { fast: 'fast', quality: 'quality' },
}))

let sparad: Record<string, unknown> | null = null

function kedja(tabell: string) {
  const k: Record<string, unknown> = {}
  k.select = () => k
  k.eq = () => k
  k.single = async () =>
    tabell === 'profiles'
      ? { data: { subscription_tier: 'free', email_verified_at: '2026-01-01', full_name: 'Erik Lindberg', phone: '073-456 78 90' }, error: null }
      : { data: sparad, error: null }
  k.maybeSingle = async () => ({ data: null, error: null })
  k.insert = (rad: Record<string, unknown>) => {
    sparad = { id: 'cv1', ...rad }
    return k
  }
  return k
}

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: (t: string) => kedja(t),
    rpc: async () => ({ data: null, error: null }),
    storage: {
      from: () => ({
        list: async () => ({ data: [{ name: 'x' }], error: null }),
        upload: async () => ({ data: {}, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://exempel.se/cv.pdf' } }),
      }),
    },
  }),
}))
vi.mock('@/lib/supabase/premiumAccess', () => ({ getCvGrans: async () => ({ harBetalt: true, maxCvs: 99 }) }))
vi.mock('@/lib/activation-tracking', () => ({ markFirstMilestone: async () => {} }))
vi.mock('@/lib/onboarding/komigang-server', () => ({ markeraBricka: async () => {} }))
vi.mock('@/lib/profile/backfillContact', () => ({ backfillProfileContact: async () => {} }))
vi.mock('@/lib/openai/pricing-sync', () => ({ calculateCostFromDatabase: async () => 0 }))
vi.mock('@/lib/ai-cost-tracker', () => ({ trackAIUsage: async () => {}, AI_FEATURES: { CV_PARSING: 'cv_parsing' } }))
vi.mock('@/lib/activity-logger', () => ({ logUserActivity: async () => {} }))

import { POST } from '@/app/api/cv/upload/route'
import { lagaOcrText, maskaOcrRester } from '@/lib/cv-parser/ocr'

describe('OCR-textens efterarbete', () => {
  it('@ som lästs som Q, (Q, Q@ eller & rättas bara framför en domän', () => {
    expect(lagaOcrText('erik.lindberg Q email.se + 073')).toBe('erik.lindberg@email.se + 073')
    expect(lagaOcrText('erik.lindberg(Qemail.se Senior')).toBe('erik.lindberg@email.se Senior')
    expect(lagaOcrText('erik.lindbergQ@email.se')).toBe('erik.lindberg@email.se')
    expect(lagaOcrText('erik.lindberg&email.se-073')).toBe('erik.lindberg@email.se-073')
    expect(lagaOcrText('Sälj & marknad, Q-dagar')).toBe('Sälj & marknad, Q-dagar')
  })

  it('felläsningar av namnet maskas, vanliga ord står kvar', () => {
    const ut = maskaOcrRester('[inkedin:com/in/eriklindberd\nErik Lindberg\nNordamerika och Lindbergs Bygg\nPersonalansvar', [
      'Erik Lindberg',
      'Per Ek',
    ])
    expect(ut).not.toMatch(/eriklindberd|Erik|Lindberg/)
    expect(ut).toContain('Nordamerika')
    expect(ut).toContain('Personalansvar')
  })
})

const PERSONUPPGIFTER = ['Erik', 'Lindberg', 'erik.lindberg@email.se', '073-456 78 90', 'linkedin.com/in/eriklindberg']

/** Kör uppladdningen och samlar SSE-händelserna. */
async function laddaUpp(pdf: Uint8Array, namn: string) {
  const form = new FormData()
  form.append('file', new File([pdf], namn, { type: 'application/pdf' }))
  form.append('title', 'Mitt CV')
  const res = await POST(new Request('http://localhost/api/cv/upload', { method: 'POST', body: form }))
  const text = await new Response(res.body).text()
  return text
    .split('\n\n')
    .filter((b) => b.trim())
    .map((b) => {
      const event = b.match(/^event: (.*)$/m)?.[1]
      const data = JSON.parse(b.match(/^data: (.*)$/m)?.[1] ?? 'null')
      return { event, data }
    })
}

/**
 * En PDF med en enda grå bild över hela sidan och inget textlager. Byggd för
 * hand, så att testet inte behöver en fil till i repot.
 */
function graBildPdf(): Uint8Array {
  const bredd = 16
  const hojd = 16
  const pixlar = Buffer.alloc(bredd * hojd, 0x99).toString('latin1')
  const objekt = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>',
    `<< /Type /XObject /Subtype /Image /Width ${bredd} /Height ${hojd} /ColorSpace /DeviceGray /BitsPerComponent 8 /Length ${bredd * hojd} >>\nstream\n${pixlar}\nendstream`,
    (() => {
      const innehall = 'q 595 0 0 842 0 0 cm /Im1 Do Q'
      return `<< /Length ${innehall.length} >>\nstream\n${innehall}\nendstream`
    })(),
  ]
  let ut = '%PDF-1.4\n'
  const platser: number[] = []
  objekt.forEach((o, i) => {
    platser.push(Buffer.byteLength(ut, 'latin1'))
    ut += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = Buffer.byteLength(ut, 'latin1')
  ut += `xref\n0 ${objekt.length + 1}\n0000000000 65535 f \n`
  for (const p of platser) ut += `${String(p).padStart(10, '0')} 00000 n \n`
  ut += `trailer\n<< /Size ${objekt.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return new Uint8Array(Buffer.from(ut, 'latin1'))
}

beforeEach(() => {
  anrop.length = 0
  bildanrop.length = 0
  sparad = null
})

describe('bild-PDF i uppladdningen: OCR på servern, aldrig bilder till modellen', () => {
  it('läser texten lokalt, maskar den före strukturanropet och sätter kontakten lokalt', async () => {
    const pdf = new Uint8Array(fs.readFileSync(path.join(__dirname, '../../cv-parser/__tests__/fixturer/bild-cv-erik-lindberg.pdf')))
    const handelser = await laddaUpp(pdf, 'bild-cv.pdf')

    // Fasen för bildbaserad PDF visades, och uppladdningen gick hela vägen.
    expect(handelser.some((h) => h.event === 'phase' && h.data.phase === 'vision')).toBe(true)
    const klar = handelser.find((h) => h.event === 'complete')
    expect(klar, JSON.stringify(handelser.filter((h) => h.event === 'error'))).toBeTruthy()

    // Aldrig bilddata till modellen.
    expect(bildanrop).toHaveLength(0)
    for (const a of anrop) {
      const allt = JSON.stringify(a)
      expect(allt).not.toMatch(/inlineData|pngBuffers|image\/png|base64/)
    }

    // Strukturanropet fick OCR-texten, maskad.
    expect(anrop).toHaveLength(1)
    const prompt = String(anrop[0].prompt)
    expect(prompt).toContain('Nordea Bank')
    expect(prompt).toContain('Arbetslivserfarenhet')
    for (const p of PERSONUPPGIFTER) expect(prompt).not.toContain(p)
    expect(prompt.replace(/\D/g, '')).not.toContain('0734567890')

    // Det som sparas är också maskat, men strukturen har rätt namn och
    // kontakt, lästa lokalt ur OCR-texten.
    const cvText = String(sparad?.cv_text ?? '')
    expect(cvText).not.toContain('erik.lindberg@email.se')
    expect(cvText).not.toContain('073-456 78 90')
    const struktur = sparad?.structured_data as { name?: string; contact?: { email?: string; phone?: string } }
    expect(struktur?.name).toBe('Erik Lindberg')
    expect(struktur?.contact?.email).toBe('erik.lindberg@email.se')
    expect(struktur?.contact?.phone?.replace(/\D/g, '')).toBe('0734567890')
    expect(klar?.data.data.usedVisionFallback).toBe(true)
  }, 120_000)

  it('en bild utan läsbar text ger beskedet för bildbaserad PDF och inget modellanrop', async () => {
    const handelser = await laddaUpp(graBildPdf(), 'foto.pdf')
    const fel = handelser.find((h) => h.event === 'error')
    expect(fel?.data.code).toBe('IMAGE_BASED_PDF')
    expect(fel?.data.message).toContain('markera texten')
    expect(fel?.data.message).not.toMatch(/[—–]/)
    expect(anrop).toHaveLength(0)
    expect(bildanrop).toHaveLength(0)
    expect(sparad).toBeNull()
  }, 120_000)
})
