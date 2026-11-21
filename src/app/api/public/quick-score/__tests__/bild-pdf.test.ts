// @vitest-environment node
/**
 * Den publika mini-analysen och inskannade PDF:er (beslutet 2026-11-21,
 * punkt 2). Förut blev en bild-PDF ett 500 som aldrig gick över. Nu: 422 med
 * en egen felkod, registreringen med valet CV och beskedet ordagrant. Ingen
 * bildläsning och inget modellanrop publikt.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

let lasning: () => Promise<string> = async () => ''
const modellanrop: string[] = []

vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({}) }))
vi.mock('@/lib/rate-limit/ip', () => ({
  getClientIp: () => '::1',
  checkIpRateLimit: async () => ({ allowed: true, resetAt: null }),
  checkDailyBudget: async () => ({ allowed: true }),
}))
vi.mock('@/lib/cv-parser', () => {
  class ImageBasedPdfError extends Error {
    extractedLength = 0
  }
  return {
    ImageBasedPdfError,
    parseCV: () => lasning(),
    cleanExtractedText: (t: string) => t.trim(),
  }
})
vi.mock('@/lib/openai/cv-analysis', () => ({
  analyzeCvBasic: async () => {
    modellanrop.push('analys')
    return { summary: 'Bra grund.', improvementAreas: ['Lägg till siffror', 'B', 'C'] }
  },
}))
vi.mock('@/lib/cv/cv-parser', () => ({
  parseCV: async () => {
    modellanrop.push('struktur')
    return { roles: [], education: [], skills: [] }
  },
}))
vi.mock('@/lib/cv/poang', () => ({ poangForRad: () => 64 }))

import { POST } from '@/app/api/public/quick-score/route'
import { ImageBasedPdfError } from '@/lib/cv-parser'

const BESKED =
  'Ditt CV är sparat som bild, så vi kan inte läsa texten här. Skapa ett gratiskonto så läser vi av den, det tar ungefär en halv minut. Har du CV:t som Word-fil kan du ladda upp den här i stället.'

async function skicka(namn: string) {
  const form = new FormData()
  form.append('file', new File([new Uint8Array([37, 80, 68, 70])], namn))
  const res = await POST(new Request('http://localhost/api/public/quick-score', { method: 'POST', body: form }))
  return { status: res.status, data: await res.json() }
}

beforeEach(() => {
  modellanrop.length = 0
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('mini-analysen och inskannade PDF:er', () => {
  it('ImageBasedPdfError ger 422 med felkod, registreringen och beskedet, inget modellanrop', async () => {
    lasning = async () => {
      throw new (ImageBasedPdfError as unknown as new (n: number) => Error)(12)
    }
    const { status, data } = await skicka('cv.pdf')
    expect(status).toBe(422)
    expect(data.code).toBe('IMAGE_BASED_PDF')
    expect(data.error).toBe('IMAGE_BASED_PDF')
    expect(data.message).toBe(BESKED)
    expect(data.registerHref).toBe('/register?borja=cv')
    expect(modellanrop).toEqual([])
  })

  it('för kort text ur en PDF ger samma besked', async () => {
    lasning = async () => 'Erik Lindberg'
    const { status, data } = await skicka('cv.pdf')
    expect(status).toBe(422)
    expect(data.code).toBe('IMAGE_BASED_PDF')
    expect(data.message).toBe(BESKED)
  })

  it('för kort text ur en Word-fil får det gamla beskedet, utan registreringslänk', async () => {
    lasning = async () => 'kort'
    const { status, data } = await skicka('cv.docx')
    expect(status).toBe(422)
    expect(data.code).toBeUndefined()
    expect(data.registerHref).toBeUndefined()
  })

  it('ett annat fel ger fortfarande 500', async () => {
    lasning = async () => {
      throw new Error('trasig')
    }
    const { status } = await skicka('cv.pdf')
    expect(status).toBe(500)
  })

  it('en vanlig text-PDF analyseras som förut', async () => {
    lasning = async () => 'Erik Lindberg\nLagerarbetare på Lager AB 2019 till 2024. '.repeat(10)
    const { status, data } = await skicka('cv.pdf')
    expect(status).toBe(200)
    expect(data.score).toBe(64)
    expect(data.visibleImprovement).toBe('Lägg till siffror')
    expect(data.lockedImprovementCount).toBe(2)
  })
})
