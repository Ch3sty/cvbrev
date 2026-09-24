/**
 * Logiktestprovets landning (docs/qa/qa-slutflode-2026-09-24.md, K1): vem
 * får se provet, att anspråket bara vinns en gång, och att genomgången
 * visar exakt de fem frågorna med rätt eller fel och regeln som förklaring.
 */

import { describe, expect, it } from 'vitest'
import {
  arProvTillgangligt,
  arProvToken,
  hamtaEllerGorAnsprakProv,
  provGenomgang,
  provResultatHref,
} from '../prov-rad'
import { questionsForToken } from '../anon-session'

const TOKEN = '3f1c2b7e-9d4a-4c8e-8b2f-6a1d0e9c7b55'
const NU = Date.parse('2026-09-24T12:00:00Z')
const SENARE = '2026-10-01T12:00:00Z'

const rad = (extra: Record<string, unknown> = {}) => ({
  answers: [0, 1, 2, 3, 0] as number[] | null,
  claimed_by: null as string | null,
  expires_at: SENARE as string | null,
  ...extra,
})

describe('arProvTillgangligt', () => {
  it('ett besvarat, ohämtat prov får hämtas av den som har token', () => {
    expect(arProvTillgangligt(rad(), 'a', NU)).toBe(true)
  })

  it('ett hämtat prov syns bara för kontot som hämtade det', () => {
    expect(arProvTillgangligt(rad({ claimed_by: 'a', expires_at: null }), 'a', NU)).toBe(true)
    expect(arProvTillgangligt(rad({ claimed_by: 'a', expires_at: null }), 'b', NU)).toBe(false)
  })

  it('utgånget eller obesvarat prov är stängt', () => {
    expect(arProvTillgangligt(rad({ expires_at: '2026-09-24T11:00:00Z' }), 'a', NU)).toBe(false)
    expect(arProvTillgangligt(rad({ answers: null }), 'a', NU)).toBe(false)
  })

  it('ett hämtat prov går aldrig ut', () => {
    expect(arProvTillgangligt(rad({ claimed_by: 'a', expires_at: null }), 'a', NU + 400 * 86400000)).toBe(true)
  })
})

describe('provGenomgang', () => {
  it('ger samma fem frågor som provet och rättar mot facit', () => {
    const fragor = questionsForToken(TOKEN)
    const svar = fragor.map((q, i) => (i < 3 ? q.correctAnswer : (q.correctAnswer + 1) % q.options.length))
    const g = provGenomgang(TOKEN, svar)
    expect(g.totalt).toBe(5)
    expect(g.fragor.map((q) => q.id)).toEqual(fragor.map((q) => q.id))
    expect(g.ratt).toBe(3)
    expect(g.svar.map((s) => s.correct)).toEqual([true, true, true, false, false])
    // Förklaringen är frågans regel, samma text som testernas genomgång visar.
    for (const q of g.fragor) expect(q.rule.length).toBeGreaterThan(20)
  })

  it('en obesvarad fråga (-1) får inget svar och räknas inte', () => {
    const fragor = questionsForToken(TOKEN)
    const g = provGenomgang(TOKEN, [fragor[0].correctAnswer, -1, -1, -1, -1])
    expect(g.ratt).toBe(1)
    expect(g.svar).toHaveLength(1)
  })
})

/** Minimal admin-klient: en rad och en villkorad uppdatering. */
function adminMed(start: Record<string, unknown> | null) {
  let raden = start ? { token: TOKEN, score: 3, created_at: '2026-09-24T10:00:00Z', ...start } : null
  const uppdateringar: Record<string, unknown>[] = []
  const bygg = () => {
    const filter: Record<string, unknown> = {}
    let patch: Record<string, unknown> | null = null
    const q: any = {
      select: () => q,
      eq: (k: string, v: unknown) => ((filter[k] = v), q),
      is: (k: string, v: unknown) => ((filter[`is:${k}`] = v), q),
      update: (p: Record<string, unknown>) => ((patch = p), q),
      maybeSingle: async () => {
        if (!raden || filter.token !== raden.token) return { data: null, error: null }
        if (patch) {
          if ('is:claimed_by' in filter && (raden as any).claimed_by !== null) return { data: null, error: null }
          raden = { ...raden, ...patch }
          uppdateringar.push(patch)
          return { data: { token: raden.token }, error: null }
        }
        return { data: raden, error: null }
      },
    }
    return q
  }
  return { admin: { from: () => bygg() } as any, uppdateringar, rad: () => raden }
}

describe('hamtaEllerGorAnsprakProv', () => {
  it('gör anspråk på ett ohämtat prov och gör det permanent', async () => {
    const m = adminMed({ answers: [0, 0, 0, 0, 0], claimed_by: null, expires_at: SENARE })
    const r = await hamtaEllerGorAnsprakProv(m.admin, TOKEN, 'a')
    expect(r?.claimed_by).toBe('a')
    expect(r?.expires_at).toBeNull()
    expect(m.uppdateringar[0]).toMatchObject({ claimed_by: 'a', expires_at: null })
  })

  it('samma konto igen: ingen ny uppdatering', async () => {
    const m = adminMed({ answers: [0, 0, 0, 0, 0], claimed_by: 'a', expires_at: null })
    expect(await hamtaEllerGorAnsprakProv(m.admin, TOKEN, 'a')).not.toBeNull()
    expect(m.uppdateringar).toHaveLength(0)
  })

  it('annan användares prov ger null (sidan svarar 404)', async () => {
    const m = adminMed({ answers: [0, 0, 0, 0, 0], claimed_by: 'a', expires_at: null })
    expect(await hamtaEllerGorAnsprakProv(m.admin, TOKEN, 'b')).toBeNull()
  })

  it('okänd eller ogiltig token ger null', async () => {
    const m = adminMed(null)
    expect(await hamtaEllerGorAnsprakProv(m.admin, TOKEN, 'a')).toBeNull()
    expect(await hamtaEllerGorAnsprakProv(m.admin, '../admin', 'a')).toBeNull()
    expect(arProvToken('abc')).toBe(false)
  })

  it('landningen ligger under /dashboard/tester', () => {
    expect(provResultatHref(TOKEN)).toBe(`/dashboard/tester/prov/${TOKEN}`)
  })
})
