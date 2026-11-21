/**
 * Inga personuppgifter till AI:n i LinkedIn-optimeringen och jobbmatchningens
 * CV-tolkning (ägarens regel 2026-11-21, CV-rummet steg 4 punkt D).
 *
 *  - /api/linkedin/optimize: prompten fångas med mockad klient; inga
 *    personuppgifter i det som skickas, inga platshållare i svaret.
 *  - Edge-funktionerna optimize-linkedin och parse-cv-for-matching maskar med
 *    _shared/pii.ts (maskForModel, maskUrls) och samma kända namn och nummer;
 *    Deno-funktionerna kan inte köras här, så maskeringen de anropar testas
 *    med samma indata, och att ort står kvar för matchningen.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const anrop: Array<{ systemInstruction?: string; prompt: string }> = []

vi.mock('@/lib/gemini', () => ({
  generateJSON: async (opts: { systemInstruction?: string; prompt: string }) => {
    anrop.push(opts)
    return {
      data: {
        original: '[NAMN] är projektledare',
        optimized: 'Projektledare inom IT. Kontakta [NAMN] på [E-POST].',
        improvements: ['Lade till [LÄNK]'],
        score_before: 40,
        score_after: 80,
      },
      usage: { prompt: 1, completion: 1, total: 2 },
      cost: 0,
    }
  },
  GEMINI_MODELS: { fast: 'fast', quality: 'quality' },
}))

function kedja(tabell: string) {
  const svar = async () =>
    tabell === 'profiles'
      ? {
          data: {
            full_name: 'Karin Holmström',
            phone: '070-123 45 67',
            weekly_linkedin_count: 0,
            weekly_linkedin_first_used_at: new Date().toISOString(),
            weekly_linkedin_reset_at: new Date(Date.now() + 86400000).toISOString(),
          },
          error: null,
        }
      : { data: null, error: null }
  const k: Record<string, unknown> = {}
  k.select = () => k
  k.eq = () => k
  k.single = svar
  k.maybeSingle = svar
  k.insert = () => k
  k.update = () => k
  k.then = (r: (v: unknown) => void) => r({ data: null, error: null })
  return k
}

vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }) }))
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } }, error: null }) },
    from: (t: string) => kedja(t),
    rpc: async () => ({ data: null, error: null }),
  }),
}))
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({ from: (t: string) => kedja(t) }) }))
vi.mock('@/lib/supabase/premiumAccess', () => ({ userHasAccess: async () => true }))
vi.mock('@/lib/openai/pricing-sync', () => ({ calculateCostFromDatabase: async () => 0 }))
vi.mock('@/lib/ai-cost-tracker', () => ({ trackAIUsage: async () => {}, AI_FEATURES: { LINKEDIN_OPTIMIZATION: 'li' } }))
vi.mock('@/lib/activity-logger', () => ({ logUserActivity: async () => {} }))
vi.mock('@/lib/onboarding/komigang-server', () => ({ markeraBricka: async () => {} }))

import { POST } from '@/app/api/linkedin/optimize/route'
import { maskForModel as maskEdge } from '../../../../supabase/functions/_shared/pii'

const OM_MIG = `Jag heter Karin Holmström och är projektledare inom IT i Uppsala.
Nå mig på karin.holmstrom@exempel.se eller 070-123 45 67, linkedin.com/in/karinholmstrom.
Född: 12 april 1985. Personnummer 19850412-1234. Storgatan 12, 752 31 Uppsala.`

const ERFARENHET = 'Senior Projektledare, Nordea Bank, 2021 till nu. Ledde införandet av ett kundsystem för 1 200 användare.'

const PERSONUPPGIFTER = [
  'Karin',
  'Holmström',
  'karin.holmstrom@exempel.se',
  '070-123 45 67',
  'linkedin.com/in/karinholmstrom',
  '12 april 1985',
  '19850412-1234',
  'Storgatan 12',
  '752 31',
]

const utan = (text: string) => {
  for (const p of PERSONUPPGIFTER) expect(text).not.toContain(p)
}

beforeEach(() => {
  anrop.length = 0
})

describe('LinkedIn-optimeringen och matchningens CV-tolkning', () => {
  it('/api/linkedin/optimize skickar inga personuppgifter och visar inga platshållare', async () => {
    const res = await POST({
      json: async () => ({ sections: { headline: 'Karin Holmström, projektledare', about: OM_MIG, experience: ERFARENHET }, mode: 'stand_out', language: 'sv' }),
    } as never)
    expect(anrop.length).toBeGreaterThan(0)
    for (const a of anrop) {
      utan(a.prompt)
      utan(a.systemInstruction ?? '')
    }
    // Det som gör optimeringen möjlig står kvar.
    expect(anrop.some((a) => a.prompt.includes('Nordea Bank'))).toBe(true)
    const j = await res.json()
    expect(JSON.stringify(j)).not.toMatch(/\[(NAMN|E-POST|LÄNK|TELEFON)\]/)
  })

  it('edge-funktionernas maskering (optimize-linkedin, parse-cv-for-matching) tar personuppgifterna men lämnar orten', () => {
    const opts = { fullName: 'Karin Holmström', knownPhones: ['070-123 45 67'], maskUrls: true }
    const maskad = maskEdge(`${OM_MIG}\n${ERFARENHET}`, opts).text
    utan(maskad)
    expect(maskad).toContain('Uppsala')
    expect(maskad).toContain('Nordea Bank')
  })
})
