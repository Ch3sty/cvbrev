// Omgångarna till Resend (omgang.ts) och kampanjutskicket ovanpå dem. Felet
// 2026-11-23: en adress utan toppdomän fällde en hel omgång om 100 i Black
// Week-utskicket. Inget skickas: Resend är en mock.
import { describe, expect, it, vi, beforeEach } from 'vitest'

const h = vi.hoisted(() => ({ batchSend: vi.fn() }))
vi.mock('resend', () => ({
  Resend: class {
    batch = { send: h.batchSend }
  },
}))

import { giltigMejladress, skickaOmgang } from '../omgang'
import { kampanjMottagare, skickaKampanj } from '../kampanjUtskick'
import { KAMPANJ_BY_NYCKEL } from '@/lib/kampanj/kampanj'

const K = KAMPANJ_BY_NYCKEL['black-week-2026']
const FEL_ADRESS = 'anna@gmailcom'

/** Resend som den beter sig: en omgång med en adress utan toppdomän underkänns hel. */
function resendMedFormkontroll() {
  let nr = 0
  return async (mejl: any[]) => {
    if (mejl.some((m) => m.to[0] === FEL_ADRESS)) {
      return { data: null, error: { statusCode: 422, name: 'validation_error', message: 'Invalid `to` field.' } }
    }
    return { data: { data: mejl.map(() => ({ id: `re_${++nr}` })) }, error: null }
  }
}

beforeEach(() => {
  h.batchSend.mockReset()
})

describe('giltigMejladress', () => {
  it('godtar vanliga adresser', () => {
    for (const a of ['anna@exempel.se', 'anna.berg+jobb@mail.exempel.co.uk', 'a_b-c@xn--rksmrgs-5wao1o.se']) {
      expect(giltigMejladress(a), a).toBe(true)
    }
  })
  it('underkänner det Resend underkänner', () => {
    for (const a of [FEL_ADRESS, 'anna@', '@exempel.se', 'anna berg@exempel.se', 'anna@exempel.s', 'anna@exempel..se', 'anna@@exempel.se', '', null, undefined, 42]) {
      expect(giltigMejladress(a), String(a)).toBe(false)
    }
  })
})

describe('skickaOmgang', () => {
  it('en felande adress bland hundra tar inte med sig de andra', async () => {
    h.batchSend.mockImplementation(resendMedFormkontroll())
    const mejl = Array.from({ length: 100 }, (_, i) => ({ to: [i === 37 ? FEL_ADRESS : `m${i}@exempel.se`] }))
    const svar = await skickaOmgang({ batch: { send: h.batchSend } }, mejl, 0, 'test')
    expect(svar).toHaveLength(100)
    expect(svar.filter((s) => s.ok)).toHaveLength(99)
    expect(svar[37]).toEqual({ ok: false, id: null })
    expect(svar[36].id).toMatch(/^re_/)
    // Halvering, inte ett anrop per mejl
    expect(h.batchSend.mock.calls.length).toBeLessThan(20)
  })

  it('driftfel fäller omgången utan nya försök', async () => {
    h.batchSend.mockResolvedValue({ data: null, error: { statusCode: 429, name: 'rate_limit_exceeded' } })
    const svar = await skickaOmgang({ batch: { send: h.batchSend } }, [{ to: ['a@exempel.se'] }, { to: ['b@exempel.se'] }], 0, 'test')
    expect(svar.every((s) => !s.ok)).toBe(true)
    expect(h.batchSend).toHaveBeenCalledTimes(1)
  })

  it('svar utan id räknas ändå som skickat', async () => {
    h.batchSend.mockResolvedValue({ data: { data: [] }, error: null })
    const svar = await skickaOmgang({ batch: { send: h.batchSend } }, [{ to: ['a@exempel.se'] }], 0, 'test')
    expect(svar).toEqual([{ ok: true, id: null }])
  })
})

describe('kampanjutskicket', () => {
  function databas(profiler: any[]) {
    const loggade: any[] = []
    const client = {
      from(tabell: string) {
        const sida = (rader: any[]) => ({ order: () => ({ range: async (fran: number, till: number) => ({ data: rader.slice(fran, till + 1), error: null }) }) })
        if (tabell === 'profiles') return { select: () => ({ not: () => sida(profiler) }) }
        return {
          select: () => ({ eq: () => sida(loggade.map((r) => ({ user_id: r.user_id }))) }),
          insert: async (rader: any[]) => {
            loggade.push(...rader)
            return { error: null }
          },
        }
      },
    }
    return { client, loggade }
  }

  it('urvalet släpper inte igenom en adress utan toppdomän', async () => {
    const db = databas([
      { id: 'u1', email: 'anna@exempel.se' },
      { id: 'u2', email: FEL_ADRESS },
    ])
    const { kvar } = await kampanjMottagare(db.client, K)
    expect(kvar.map((m) => m.id)).toEqual(['u1'])
  })

  it('läser förbi 1 000 rader, så att ingen som redan fått mejlet får det igen', async () => {
    const profiler = Array.from({ length: 1205 }, (_, i) => ({ id: `u${i}`, email: `m${i}@exempel.se` }))
    const db = databas(profiler)
    db.loggade.push(...profiler.slice(0, 1200).map((p) => ({ user_id: p.id })))
    const { kvar, redan } = await kampanjMottagare(db.client, K)
    expect(redan).toBe(1200)
    expect(kvar.map((m) => m.id)).toEqual(['u1200', 'u1201', 'u1202', 'u1203', 'u1204'])
  })

  it('loggar bara dem Resend tog emot, så att resten kan skickas om', async () => {
    h.batchSend.mockImplementation(resendMedFormkontroll())
    const db = databas([])
    const mottagare = [
      { id: 'u1', email: 'anna@exempel.se' },
      { id: 'u2', email: FEL_ADRESS },
      { id: 'u3', email: 'bo@exempel.se' },
    ]
    vi.useFakeTimers()
    const lofte = skickaKampanj(db.client, K, mottagare)
    await vi.runAllTimersAsync()
    const resultat = await lofte
    vi.useRealTimers()
    expect(resultat).toMatchObject({ skickade: 2, misslyckade: 1 })
    expect(db.loggade.map((r) => r.user_id).sort()).toEqual(['u1', 'u3'])
    expect(db.loggade.every((r) => r.email_type === 'campaign:black-week-2026' && r.resend_id)).toBe(true)
  })
})
