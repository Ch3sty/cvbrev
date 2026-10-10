import { describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import {
  alternativSeed,
  arBlandad,
  blandaAlternativ,
  blandadPermutation,
  identitet,
  permutationForSession,
  tillOriginal,
  tillVisat,
  visatForSvar,
} from '../blanda'
import {
  BANK_FOR_RUTT,
  bedomSvar,
  genomgangsFragor,
  matrisInnehall,
  visadeFragor,
  type MatrisSlug,
} from '../fragor.server'
import { GRUND_POOL, AVANCERAD_POOL, EXPERT_POOL, selectQuestionsForSession } from '../selectQuestions.v7'
import { selectProvQuestionsForSession } from '../selectProv.v7'
import type { LayeredQuestion } from '../layered.v7'
import { questionsForToken, tillOriginalSvar, toPublicQuestion } from '@/lib/tests/anon-session'
import { provGenomgang } from '@/lib/tests/prov-rad'

const SLUGS: MatrisSlug[] = [
  'matrislogik-grund',
  'matrislogik-avancerad',
  'matrislogik-expert',
  'matrislogik-prov',
]
const ALLA = [...GRUND_POOL, ...AVANCERAD_POOL, ...EXPERT_POOL]
const fakta = new Map<string, LayeredQuestion>(ALLA.map((q) => [q.id, q]))

describe('blandadPermutation', () => {
  it('är en giltig permutation och samma seed ger samma ordning', () => {
    const a = blandadPermutation('s1:q1', 6)
    expect([...a].sort()).toEqual([0, 1, 2, 3, 4, 5])
    expect(blandadPermutation('s1:q1', 6)).toEqual(a)
  })

  it('två sessioner ger olika ordning för samma fråga (oftast)', () => {
    const q = GRUND_POOL[0]
    const ordningar = new Set(
      Array.from({ length: 50 }, (_, i) =>
        permutationForSession(`session-${i}`, q, true).join('')
      )
    )
    // 720 möjliga ordningar; 50 sessioner ska ge många olika.
    expect(ordningar.size).toBeGreaterThan(40)
  })

  it('blandaAlternativ: options[visat] === original[permutation[visat]]', () => {
    const q = EXPERT_POOL[3]
    const { options, permutation } = blandaAlternativ(alternativSeed('x', q.id), q)
    options.forEach((o, v) => expect(o).toBe(q.options[permutation[v]]))
  })

  it('tillOriginal och tillVisat är varandras inverser', () => {
    const p = blandadPermutation('abc', 6)
    for (let v = 0; v < 6; v++) expect(tillVisat(p, tillOriginal(p, v))).toBe(v)
    expect(tillOriginal(p, 6)).toBe(-1)
    expect(tillOriginal(p, -1)).toBe(-1)
    expect(tillOriginal(p, 1.5)).toBe(-1)
  })

  it('oblandade sessioner (utan flaggan) får identiteten', () => {
    const q = GRUND_POOL[5]
    expect(permutationForSession('gammal', q, false)).toEqual(identitet(q.options.length))
    expect(arBlandad(undefined)).toBe(false)
    expect(arBlandad({})).toBe(false)
    expect(arBlandad({ alternativ_blandade: 'true' })).toBe(false)
    expect(arBlandad({ alternativ_blandade: true })).toBe(true)
  })
})

describe('fördelningen av rätt svar efter blandning', () => {
  it('bankerna har rätt svar nästan alltid på A före blandningen (felet som rättas)', () => {
    const paA = ALLA.filter((q) => q.correctAnswer === 0).length
    expect(paA).toBeGreaterThan(ALLA.length * 0.9)
  })

  it.each(SLUGS)('%s: rätt svar hamnar på varje position i ungefär en sjättedel', (slug) => {
    const N = 2000
    const pos = [0, 0, 0, 0, 0, 0]
    let total = 0
    for (let i = 0; i < N; i++) {
      for (const q of genomgangsFragor(slug, randomUUID(), true)) {
        pos[q.rattVisat] += 1
        total += 1
      }
    }
    for (const n of pos) {
      // En sjättedel ±2 procentenheter (tiotusentals dragningar).
      expect(n / total).toBeGreaterThan(1 / 6 - 0.02)
      expect(n / total).toBeLessThan(1 / 6 + 0.02)
    }
  })

  it('"alltid A" ger ungefär slumpnivå, inte full pott', () => {
    let ratt = 0
    let total = 0
    for (let i = 0; i < 500; i++) {
      const id = randomUUID()
      for (const q of visadeFragor('matrislogik-expert', id, true)) {
        const bank = fakta.get(q.id)!
        if (bedomSvar(bank, id, true, 0)!.correct) ratt += 1
        total += 1
      }
    }
    expect(ratt / total).toBeLessThan(0.25)
  })
})

describe('rättningen', () => {
  it('samma poäng oavsett visad ordning: rätt klick ger rätt, lagrar originalindex', () => {
    for (const slug of SLUGS) {
      for (let i = 0; i < 50; i++) {
        const id = randomUUID()
        const genomgang = genomgangsFragor(slug, id, true)
        let poang = 0
        for (const q of genomgang) {
          const bank = fakta.get(q.id)!
          const svar = bedomSvar(bank, id, true, q.rattVisat)!
          expect(svar.selected).toBe(bank.correctAnswer)
          expect(svar.visat).toBe(q.rattVisat)
          if (svar.correct) poang += 1
          // Alla fel klick lagras som originalindex och räknas fel.
          for (let v = 0; v < q.options.length; v++) {
            if (v === q.rattVisat) continue
            const fel = bedomSvar(bank, id, true, v)!
            expect(fel.correct).toBe(false)
            expect(q.options[v]).toBe(bank.options[fel.selected])
          }
        }
        expect(poang).toBe(genomgang.length)
      }
    }
  })

  it('samma valda alternativ ger samma poäng blandat och oblandat', () => {
    const id = randomUUID()
    // Hon väljer samma ALTERNATIV (samma ruta) i båda ordningarna.
    for (const q of selectQuestionsForSession(id)) {
      for (let orig = 0; orig < q.options.length; orig++) {
        const blandat = bedomSvar(q, id, true, tillVisat(permutationForSession(id, q, true), orig))!
        const oblandat = bedomSvar(q, id, false, orig)!
        expect(blandat.correct).toBe(oblandat.correct)
        expect(blandat.selected).toBe(orig)
        expect(oblandat.selected).toBe(orig)
      }
    }
  })

  it('gamla sessioner (före fixen) rättas och visas som förut', () => {
    const id = randomUUID()
    const q = selectQuestionsForSession(id)[0]
    const svar = bedomSvar(q, id, false, q.correctAnswer)!
    expect(svar).toEqual({ selected: q.correctAnswer, visat: q.correctAnswer, correct: true })
    // Ett sparat svar utan visat-fält tolkas som visat = selected.
    expect(visatForSvar({ selected: 2 })).toBe(2)
    expect(visatForSvar({ selected: 2, visat: 4 })).toBe(4)
    // Genomgången för en gammal session har bankens ordning.
    const g = genomgangsFragor('matrislogik-grund', id, false)
    g.forEach((gq) => {
      const bank = fakta.get(gq.id)!
      expect(gq.options).toEqual(bank.options)
      expect(gq.rattVisat).toBe(bank.correctAnswer)
    })
  })

  it('ogiltigt index avvisas', () => {
    const q = GRUND_POOL[0]
    expect(bedomSvar(q, 'x', true, 6)).toBeNull()
    expect(bedomSvar(q, 'x', true, '1')).toBeNull()
  })

  it('svar-rutternas banker hittar varje fråga i sina nivåer', () => {
    for (const q of [...GRUND_POOL, ...EXPERT_POOL]) expect(BANK_FOR_RUTT.v4.some((b) => b.id === q.id)).toBe(true)
    for (const q of AVANCERAD_POOL) expect(BANK_FOR_RUTT.v6.some((b) => b.id === q.id)).toBe(true)
    for (const q of ALLA) expect(BANK_FOR_RUTT.prov.some((b) => b.id === q.id)).toBe(true)
  })
})

describe('test- och resultatsidan visar samma sak', () => {
  it.each(SLUGS)('%s: genomgången har samma frågor och alternativ i samma ordning som testvyn', (slug) => {
    const id = randomUUID()
    const test = visadeFragor(slug, id, true)
    const resultat = genomgangsFragor(slug, id, true)
    expect(resultat.map((q) => q.id)).toEqual(test.map((q) => q.id))
    resultat.forEach((r, i) => expect(r.options).toEqual(test[i].options))
    // Omladdning: samma anrop igen ger samma ordning.
    expect(visadeFragor(slug, id, true)).toEqual(test)
  })

  it('klienten får aldrig facit under testet', () => {
    const id = randomUUID()
    for (const q of visadeFragor('matrislogik-expert', id, true)) {
      expect(q).not.toHaveProperty('correctAnswer')
      expect(q).not.toHaveProperty('rattVisat')
    }
    const pagaende = matrisInnehall({ id, test_type: 'matrislogik-expert', meta: { alternativ_blandade: true }, completed_at: null })
    expect(pagaende.genomgang).toBeNull()
    const klar = matrisInnehall({ id, test_type: 'matrislogik-expert', meta: { alternativ_blandade: true }, completed_at: '2026-10-10T12:00:00Z' })
    expect(klar.genomgang).toHaveLength(15)
  })

  it('provläget går genom samma urval och samma blandning', () => {
    const id = randomUUID()
    const prov = visadeFragor('matrislogik-prov', id, true)
    expect(prov.map((q) => q.id)).toEqual(selectProvQuestionsForSession(id).map((q) => q.id))
    prov.forEach((q) => {
      const bank = fakta.get(q.id)!
      const perm = permutationForSession(id, bank, true)
      expect(q.options).toEqual(perm.map((o) => bank.options[o]))
    })
  })
})

describe('smakprovet (anonymt, seedat på token)', () => {
  it('visar samma ordning som blandningen och lagrar originalindex', () => {
    const token = randomUUID()
    const fragor = questionsForToken(token)
    const publika = fragor.map((q) => toPublicQuestion(q, token, true))
    publika.forEach((p, i) => {
      expect(p).not.toHaveProperty('correctAnswer')
      const perm = permutationForSession(token, fragor[i], true)
      expect(p.options).toEqual(perm.map((o) => fragor[i].options[o]))
    })
    // Hon klickar på rätt ruta i varje fråga: positionerna hon såg.
    const klick = fragor.map((q) => tillVisat(permutationForSession(token, q, true), q.correctAnswer))
    const lagrat = tillOriginalSvar(fragor, token, true, klick)
    expect(lagrat).toEqual(fragor.map((q) => q.correctAnswer))
    // Genomgången efter registreringen visar samma bokstav som hon klickade.
    const g = provGenomgang(token, lagrat, true)
    expect(g.ratt).toBe(fragor.length)
    g.svar.forEach((s, i) => expect(s.visat).toBe(klick[i]))
    g.fragor.forEach((f, i) => {
      expect(f.rattVisat).toBe(klick[i])
      expect(f.options).toEqual(publika[i].options)
    })
  })

  it('obesvarade och ogiltiga svar blir -1', () => {
    const token = randomUUID()
    const fragor = questionsForToken(token)
    expect(tillOriginalSvar(fragor, token, true, [-1, 9, 'a', null])).toEqual([-1, -1, -1, -1, -1])
  })

  it('gamla prov (utan flaggan) har bankens ordning', () => {
    const token = randomUUID()
    const fragor = questionsForToken(token)
    fragor.forEach((q) => expect(toPublicQuestion(q, token, false).options).toEqual(q.options))
  })
})
