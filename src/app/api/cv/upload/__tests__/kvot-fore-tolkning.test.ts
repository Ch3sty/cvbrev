// @vitest-environment node
/**
 * Kvoten och e-postverifieringen prövas före tolkningen av filen. Förut
 * läste uppladdningen hela filen (för en bild-PDF med OCR, cirka 20 s) och
 * gav sedan EMAIL_NOT_VERIFIED. Vilka som får ladda upp vad är oförändrat.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const tolkade: string[] = []
const ocrLasningar: number[] = []

let profil: Record<string, unknown> = {}
let antalCv = 0
let redanSparad: Record<string, unknown> | null = null
let betalt = false
let sparad: Record<string, unknown> | null = null

function kedja(tabell: string) {
  const k: Record<string, unknown> = {}
  let raknar = false
  let sokvag = false
  k.select = (_: string, opts?: { count?: string }) => {
    raknar = Boolean(opts?.count)
    return k
  }
  k.eq = (kolumn: string) => {
    if (kolumn === 'original_file_path') sokvag = true
    return k
  }
  k.single = async () => (tabell === 'profiles' ? { data: profil, error: null } : { data: sparad, error: null })
  k.maybeSingle = async () => ({ data: sokvag ? redanSparad : null, error: null })
  k.insert = (rad: Record<string, unknown>) => {
    sparad = { id: 'nytt', ...rad }
    return k
  }
  k.then = (lyckas: (v: unknown) => unknown) => lyckas({ data: null, count: raknar ? antalCv : null, error: null })
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
vi.mock('@/lib/supabase/premiumAccess', () => ({ getCvGrans: async () => ({ harBetalt: betalt, maxCvs: 2 }) }))
vi.mock('@/lib/activation-tracking', () => ({ markFirstMilestone: async () => {} }))
vi.mock('@/lib/onboarding/komigang-server', () => ({ markeraBricka: async () => {} }))
vi.mock('@/lib/profile/backfillContact', () => ({ backfillProfileContact: async () => {} }))
vi.mock('@/lib/cv/cv-parser', () => ({
  parseCV: async () => ({ roles: [], education: [], skills: [], languages: [] }),
}))
vi.mock('@/lib/cv-parser', () => {
  class ImageBasedPdfError extends Error {
    extractedLength = 0
  }
  return {
    ImageBasedPdfError,
    parseCV: async (fil: File) => {
      tolkade.push(fil.name)
      // En bild-PDF: tolkningen hittar ingen text och OCR tar över.
      throw new ImageBasedPdfError('bild')
    },
  }
})
vi.mock('@/lib/cv-parser/ocr', () => ({
  lasPdfMedOcr: async () => {
    ocrLasningar.push(Date.now())
    return { ok: true, text: 'Testa Testsson\nLagerarbetare\nÖrebro\n' + 'Erfarenhet av lager och truck. '.repeat(5), konfidens: 90, tackning: 1, sidor: 1, ms: 1 }
  },
  maskaOcrRester: (t: string) => t,
}))

import { POST } from '@/app/api/cv/upload/route'

async function laddaUpp(namn = 'cv2.pdf') {
  const form = new FormData()
  form.append('file', new File([new Uint8Array([37, 80, 68, 70])], namn, { type: 'application/pdf' }))
  form.append('title', 'Mitt CV')
  const res = await POST(new Request('http://localhost/api/cv/upload', { method: 'POST', body: form }))
  const text = await new Response(res.body).text()
  return text
    .split('\n\n')
    .filter((b) => b.trim())
    .map((b) => ({ event: b.match(/^event: (.*)$/m)?.[1], data: JSON.parse(b.match(/^data: (.*)$/m)?.[1] ?? 'null') }))
}

beforeEach(() => {
  tolkade.length = 0
  ocrLasningar.length = 0
  profil = { subscription_tier: 'free', email_verified_at: null, full_name: null, phone: null }
  antalCv = 1
  redanSparad = null
  betalt = false
  sparad = null
})

describe('uppladdningen prövar kvoten före tolkningen', () => {
  it('overifierad e-post och redan ett CV: nej direkt, utan tolkning och utan OCR', async () => {
    const h = await laddaUpp()
    const fel = h.find((x) => x.event === 'error')
    expect(fel?.data.code).toBe('EMAIL_NOT_VERIFIED')
    expect(tolkade).toHaveLength(0)
    expect(ocrLasningar).toHaveLength(0)
    expect(h.some((x) => x.event === 'phase' && x.data.phase === 'vision')).toBe(false)
    expect(sparad).toBeNull()
  })

  it('full gratiskvot: nej direkt, utan tolkning', async () => {
    profil = { ...profil, email_verified_at: '2026-01-01' }
    antalCv = 2
    const h = await laddaUpp()
    expect(h.find((x) => x.event === 'error')?.data.code).toBe('CV_LIMIT_REACHED')
    expect(tolkade).toHaveLength(0)
  })

  it('första CV:t utan verifierad e-post går igenom som förut', async () => {
    antalCv = 0
    const h = await laddaUpp()
    expect(h.find((x) => x.event === 'error')).toBeUndefined()
    expect(h.find((x) => x.event === 'complete')).toBeTruthy()
    expect(tolkade).toHaveLength(1)
    expect(sparad).not.toBeNull()
  })

  it('betalande med overifierad e-post går igenom som förut', async () => {
    betalt = true
    antalCv = 5
    const h = await laddaUpp()
    expect(h.find((x) => x.event === 'error')).toBeUndefined()
    expect(tolkade).toHaveLength(1)
  })

  it('en redan sparad fil (återanslutning) blockeras inte av kvoten', async () => {
    redanSparad = { id: 'gammalt', file_name: 'cv2.pdf' }
    const h = await laddaUpp()
    expect(h.find((x) => x.event === 'error')).toBeUndefined()
    expect(h.find((x) => x.event === 'complete')?.data.data.id).toBe('gammalt')
  })
})
