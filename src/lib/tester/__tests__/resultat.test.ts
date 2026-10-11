import { describe, expect, it } from 'vitest'
import {
  analysera,
  budgetPerFraga,
  fragorMatris,
  fragorUnderlag,
  medianSenaste,
  minSek,
  ordTal,
  svarslista,
  type ResultatFraga,
} from '../resultat'
import { RESULTAT } from '../copy'

const familj = (id: string | null | undefined) => (id ? `F-${id}` : null)

describe('svarslista', () => {
  it('gör om gamla answers-objekt till en tom lista', () => {
    expect(svarslista({ _mock: true })).toEqual([])
    expect(svarslista(null)).toEqual([])
    expect(svarslista([{ a: 1 }, null, 3])).toEqual([{ a: 1 }])
  })
})

describe('fragorMatris', () => {
  const genomgang = [
    { id: 'q1', family: 'a' },
    { id: 'q2', family: 'a' },
    { id: 'q3', family: 'b' },
  ]

  it('läser utfall, tid och familj i visad ordning', () => {
    const f = fragorMatris(
      genomgang,
      [
        { q_id: 'q1', correct: true, time_spent: 40 },
        { q_id: 'q2', correct: false, time_spent: 95 },
      ],
      familj
    )
    expect(f.map((x) => [x.nr, x.utfall, x.tid, x.grupp])).toEqual([
      [1, 'ratt', 40, 'F-a'],
      [2, 'fel', 95, 'F-a'],
      [3, 'obesvarad', null, 'F-b'],
    ])
  })

  it('ger ingen genomgång för svar ur en äldre bank eller utan svar', () => {
    expect(fragorMatris(genomgang, [{ q_id: 'gammal', correct: true }], familj)).toEqual([])
    expect(fragorMatris(genomgang, { _mock: true }, familj)).toEqual([])
    expect(fragorMatris([], [{ q_id: 'q1', correct: true }], familj)).toEqual([])
  })
})

describe('fragorUnderlag', () => {
  it('verbalt: påståenden på passageId och statementIndex, grupperat på svarstyp', () => {
    const f = fragorUnderlag(
      [
        {
          id: 'p1',
          topic: 'Miljö',
          statements: [
            { text: 'A', correctAnswer: 'true' },
            { text: 'B', correctAnswer: 'cannot_say' },
          ],
        },
      ],
      [
        { passageId: 'p1', statementIndex: 0, answer: 'true', isCorrect: true, timeSpent: 20 },
        { passageId: 'p1', statementIndex: 1, answer: 'false', isCorrect: false, timeSpent: 31 },
      ],
      'svarstyp'
    )
    expect(f.map((x) => [x.utfall, x.grupp, x.text, x.kalla])).toEqual([
      ['ratt', 'Sant', 'A', 'Miljö'],
      ['fel', 'Går inte att avgöra', 'B', 'Miljö'],
    ])
  })

  it('numeriskt: frågor på questionId, grupperat på uppgiftstyp', () => {
    const f = fragorUnderlag(
      [{ id: 'p', type: 'table', topic: 'Budget', questions: [{ id: 'x', questionText: 'Hur mycket?' }, { id: 'y', questionText: 'Andel?' }] }],
      [{ questionId: 'x', selectedAnswerId: 'b', isCorrect: false, timeSpent: 70 }],
      'uppgiftstyp'
    )
    expect(f.map((x) => [x.utfall, x.grupp])).toEqual([
      ['fel', 'Tabeller'],
      ['obesvarad', 'Tabeller'],
    ])
  })

  it('svar som inte hör till underlagen ger ingen genomgång', () => {
    const f = fragorUnderlag(
      [{ id: 'p', questions: [{ id: 'x', questionText: 'Q' }] }],
      [{ questionId: 'annan', selectedAnswerId: 'a', isCorrect: true }],
      'ingen'
    )
    expect(f).toEqual([])
  })
})

describe('analysera', () => {
  const fr = (nr: number, utfall: ResultatFraga['utfall'], tid: number | null, grupp: string | null): ResultatFraga => ({
    nr,
    id: `q${nr}`,
    utfall,
    tid,
    grupp,
  })

  it('räknar missar, grupper med minst två frågor och tempot', () => {
    const a = analysera(
      [
        fr(1, 'ratt', 50, 'Rotation'),
        fr(2, 'fel', 60, 'Rotation'),
        fr(3, 'ratt', 120, 'Rotation'),
        fr(4, 'ratt', 30, 'Spegling'),
        fr(5, 'ratt', 85, 'Spegling'),
        fr(6, 'obesvarad', null, 'Ensam'),
      ],
      80
    )
    expect(a.missar).toEqual([2, 6])
    expect(a.grupper.map((g) => [g.namn, g.ratt, g.totalt])).toEqual([
      ['Rotation', 2, 3],
      ['Spegling', 2, 2],
    ])
    expect(a.svagast?.namn).toBe('Rotation')
    expect(a.tempo).toMatchObject({ enhet: 'fraga', budget: 80, over: 2, matta: 5, snitt: 69, langsammastRatt: { nr: 3, tid: 120, antal: 1 } })
    expect(a.tempo?.staplar).toHaveLength(6)
  })

  it('utan tid per fråga finns inget tempo, och full pott ger ingen svagaste', () => {
    const a = analysera([fr(1, 'ratt', null, 'A'), fr(2, 'ratt', null, 'A')], 80)
    expect(a.tempo).toBeNull()
    expect(a.svagast).toBeNull()
    expect(a.grupper).toHaveLength(1)
  })

  it('verbalt: femton texter med fyra påståenden och tid bara på första ger femton staplar per text', () => {
    const fragor: ResultatFraga[] = []
    for (let t = 0; t < 15; t++) {
      for (let j = 0; j < 4; j++) {
        fragor.push({
          nr: fragor.length + 1,
          id: `p${t}:${j}`,
          // text 3 har två fel, resten alla rätt
          utfall: t === 2 && j < 2 ? 'fel' : 'ratt',
          tid: j === 0 ? (t === 6 ? 160 : 60) : null,
          grupp: 'Sant',
          underlagId: `p${t}`,
        })
      }
    }
    const a = analysera(fragor, budgetPerFraga(25, 60)) // 25 s per påstående
    expect(a.tempo?.enhet).toBe('underlag')
    expect(a.tempo?.budget).toBe(100)
    expect(a.tempo?.staplar).toHaveLength(15)
    expect(a.tempo?.staplar[0]).toMatchObject({ nr: 1, tid: 60, budget: 100, antal: 4, ratt: 4, utfall: 'ratt' })
    expect(a.tempo?.staplar[2]).toMatchObject({ utfall: 'fel', ratt: 2 })
    expect(a.tempo?.over).toBe(1)
    expect(a.tempo?.matta).toBe(15)
    expect(a.tempo?.langsammastRatt).toEqual({ nr: 7, tid: 160, antal: 4 })
    // missar och grupper räknas fortfarande på påståendena
    expect(a.missar).toEqual([9, 10])
    expect(RESULTAT.tempo.titel(1, 15, 100, 'texter')).toBe('En av femton texter över 100 sekunder')
    expect(RESULTAT.tempo.langsamUnderlag(7, '2:40', 4, { en: 'text' })).toBe(
      'Text 7 tog 2:40 och alla fyra blev rätt. På provet hade den tiden saknats till en annan text.'
    )
    expect(RESULTAT.tempo.aria(3, 15, 100, 'text')).toBe('Tid per text. 3 av 15 tog längre än provets 100 sekunder.')
    expect(RESULTAT.tempo.stapel(7, '2:40', 3, 4, { en: 'text' })).toBe('Text 7: 2:40, 3 av 4 rätt')
  })

  it('en fråga per underlag (verbalt expert) räknas per fråga', () => {
    const fragor: ResultatFraga[] = [1, 2, 3].map((nr) => ({ nr, id: `q${nr}`, utfall: 'ratt', tid: 50, grupp: null, underlagId: `p${nr}` }))
    expect(analysera(fragor, 40).tempo?.enhet).toBe('fraga')
  })

  it('medianen av de tre senaste', () => {
    expect(medianSenaste([100, 60, 70, 80])).toBe(70)
    expect(medianSenaste([93])).toBe(93)
    expect(medianSenaste([80, 90])).toBe(85)
    expect(medianSenaste([])).toBeNull()
  })

  it('en tom lista (gammal session) ger tom analys utan krasch', () => {
    const a = analysera([], 80)
    expect(a).toEqual({ fragor: [], missar: [], grupper: [], svagast: null, tempo: null })
  })
})

describe('texten', () => {
  it('budget, tid och tal i ord', () => {
    expect(budgetPerFraga(20, 15)).toBe(80)
    expect(budgetPerFraga(25, 18)).toBe(83)
    expect(minSek(1055)).toBe('17:35')
    expect(ordTal(3)).toBe('tre')
    expect(ordTal(1, true)).toBe('ett')
    expect(ordTal(60)).toBe('60')
  })

  it('genomgångens rubrik och knapp följer substantivet', () => {
    const fraga = { en: 'fråga', flera: 'frågor', bestamd: 'frågorna', neutrum: false }
    const pa = { en: 'påstående', flera: 'påståenden', bestamd: 'påståendena', neutrum: true }
    expect(RESULTAT.genomgang.titel(3, fraga)).toBe('Tre frågor att titta på')
    expect(RESULTAT.genomgang.titel(1, pa)).toBe('Ett påstående att titta på')
    expect(RESULTAT.genomgang.knapp(3, fraga)).toBe('Gå igenom de tre frågorna')
    expect(RESULTAT.tempo.titel(4, 15, 80)).toBe('Fyra av femton över 80 sekunder')
  })

  it('inga tankstreck i copyn', () => {
    expect(JSON.stringify(RESULTAT, (_k, v) => (typeof v === 'function' ? v.toString() : v))).not.toMatch(/—/)
  })
})
