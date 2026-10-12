// @vitest-environment node
/**
 * Fixturer för deduktivens spärrar DD1 till DD5 (beställningen omgång 3, B4):
 * en fixtur per spärr som fälls med rätt text, och kandidaterna som klarar
 * alla. Spärrarna ligger i scripts/lib/deduktiv/sparrar.mjs.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
// @ts-ignore ren JavaScript
import * as S from '../../../../scripts/lib/deduktiv/sparrar.mjs'
// @ts-ignore ren JavaScript
import { losningar, allaTilldelningar, uppfyllt } from '../../../../scripts/lib/deduktiv/losare.mjs'
// @ts-ignore ren JavaScript
import { status, stabilStatus } from '../../../../scripts/lib/deduktiv/mangdmodell.mjs'

// Kandidaterna läses som filer, aldrig som import.
const las = (f: string) => JSON.parse(readFileSync(`src/lib/deduktivV1/kandidater/${f}.json`, 'utf8'))
const grund = las('grund')
const avancerad = las('avancerad')
const expert = las('expert')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Q = any
const kopia = (q: Q): Q => JSON.parse(JSON.stringify(q))
const fel = (q: Q) => S.sparrFel(q).join(' | ')

describe('deduktivens spärrar', () => {
  it('alla kandidater klarar DD1 till DD5', () => {
    for (const q of [...grund, ...avancerad, ...expert]) expect(S.sparrFel(q), q.id).toEqual([])
  }, 60_000)

  it('kvoterna: 24 D1 och 6 D2 på grund, 30 D2 på avancerad, 24 D3 på expert', () => {
    const typer = (l: Q[]) => l.reduce((a: Record<string, number>, q: Q) => ({ ...a, [q.typ]: (a[q.typ] ?? 0) + 1 }), {})
    expect(typer(grund)).toEqual({ D1: 24, D2: 6 })
    expect(typer(avancerad)).toEqual({ D2: 30 })
    expect(typer(expert)).toEqual({ D3: 24 })
  })

  it('DD1: en D2 med två lösningar fälls', () => {
    const q = kopia(avancerad[0])
    q.formell.villkor = q.formell.villkor.slice(1)
    q.villkor = q.villkor.slice(1)
    expect(S.dd1(q).join()).toMatch(/DD1: [2-9]\d* lösningar, ska vara exakt en/)
  })

  it('DD1: ett facit som inte stämmer fälls', () => {
    const q = kopia(avancerad[0])
    q.correctAnswer = (q.correctAnswer + 1) % 5
    expect(S.dd1(q).join()).toMatch(/DD1: facit stämmer inte mot lösningen/)
  })

  it('DD2: ett överflödigt villkor fälls', () => {
    const q = kopia(avancerad[0])
    const f = q.formell
    const [pos] = losningar(f.namn.length, f.villkor, null)
    // Ett villkor som redan följer av de andra: elementet utan plats-villkor står där lösningen säger.
    const a = f.namn.findIndex((_: string, i: number) => !f.villkor.some((c: Q) => c.typ === 'plats' && c.a === i))
    f.villkor.push({ typ: 'inte_plats', a, k: pos[a] === 1 ? 2 : 1 })
    expect(S.dd2(q).join()).toMatch(new RegExp(`DD2: villkor ${f.villkor.length} är överflödigt`))
  })

  it('DD2: i D3 fälls ett antagande som inte behövs', () => {
    const q = kopia(expert[0])
    const f = q.formell
    const [pos] = losningar(f.namn.length, [...f.villkor, f.antagande], null)
    // Lås alla utom två platser med villkor: då behövs inte antagandet.
    for (let i = 0; i < f.namn.length; i++) if (i !== f.antagande.a) f.villkor.push({ typ: 'plats', a: i, k: pos[i] })
    expect(S.dd2(q).join()).toMatch(/DD2: antagandet är överflödigt/)
  })

  it('DD3: en distraktor utan nära miss fälls', () => {
    const q = kopia(avancerad.find((x: Q) => x.formell.fraga.form === 'maste'))
    const f = q.formell
    const n = f.namn.length
    const [pos] = losningar(n, f.villkor, null)
    // Leta upp ett falskt påstående som ingen tilldelning med exakt ett brutet villkor gör sant.
    const kandidater: Q[] = []
    for (let a = 0; a < n; a++) for (let k = 1; k <= n; k++) kandidater.push({ typ: 'plats', a, k })
    const utanNaraMiss = kandidater.filter(
      (s) =>
        !uppfyllt(s, pos, null) &&
        !allaTilldelningar(n).some((p: number[]) => f.villkor.filter((c: Q) => !uppfyllt(c, p, null)).length === 1 && uppfyllt(s, p, null)),
    )
    expect(utanNaraMiss.length, 'fixturen behöver två påståenden utan nära miss').toBeGreaterThanOrEqual(2)
    // Två distraktorer utan nära miss: högst två av fyra kvar.
    const distr = [0, 1, 2, 3, 4].filter((i) => i !== q.correctAnswer)
    f.alternativ[distr[0]] = utanNaraMiss[0]
    f.alternativ[distr[1]] = utanNaraMiss[1]
    expect(S.dd3(q).join()).toMatch(/DD3: [0-2] av 4 distraktorer är nära missar, minst tre krävs/)
  })

  it('DD4: två namn med samma begynnelsebokstav fälls', () => {
    const q = kopia(avancerad.find((x: Q) => x.formell.tema === 'personer'))
    q.formell.namn[0] = 'Anna'
    q.formell.namn[1] = 'Alva'
    expect(S.dd4(q).join()).toMatch(/DD4: samma begynnelsebokstav två gånger/)
    const r = kopia(avancerad.find((x: Q) => x.formell.tema === 'personer'))
    r.formell.namn[0] = 'Kevin'
    expect(S.dd4(r).join()).toMatch(/DD4: Kevin finns inte i listan/)
  })

  it('DD5: en förklaring som inte är lösarens gång fälls', () => {
    const q = kopia(expert[0])
    q.forklaring = [...q.forklaring].reverse()
    expect(S.dd5(q).join()).toMatch(/DD5: förklaringen är inte lösarens gång ordagrant/)
    const r = kopia(expert[0])
    r.schema.namn = [...r.schema.namn].reverse()
    expect(S.dd5(r).join()).toMatch(/DD5: schemat är inte lösningen/)
  })

  it('D1: ett obestämt facit och en roll som inte stämmer fälls', () => {
    const q = kopia(grund.find((x: Q) => x.typ === 'D1'))
    const obest = q.formell.roller.indexOf('obestamd')
    q.correctAnswer = obest
    expect(fel(q)).toMatch(/DD1: facit är obestamd, inte nödvändigt/)
    const r = kopia(grund.find((x: Q) => x.typ === 'D1'))
    r.formell.roller[r.formell.roller.indexOf('omojlig')] = 'obestamd'
    expect(fel(r)).toMatch(/DD1: alternativ \d är omojlig, rollen säger obestamd/)
  })

  it('mängdmodellen: existensläsningen fäller ett påstående som beror på den', () => {
    // Alla A är B, alla B är C: "Några A är C" kräver att det finns några A.
    const prem = [
      { typ: 'alla', x: 'a', y: 'b' },
      { typ: 'alla', x: 'b', y: 'c' },
    ]
    const p = { typ: 'nagra', x: 'a', y: 'c' }
    expect(status(['a', 'b', 'c'], [], prem, p)).toBe('obestamd')
    expect(status(['a', 'b', 'c'], [], prem, p, { existens: true })).toBe('nodvandig')
    expect(stabilStatus(['a', 'b', 'c'], [], prem, p)).toBeNull()
    expect(stabilStatus(['a', 'b', 'c'], [], prem, { typ: 'alla', x: 'a', y: 'c' })).toBe('nodvandig')
  })

  it('kandidaterna har facit jämnt fördelat', () => {
    const plats = (l: Q[]) => l.reduce((a: number[], q: Q) => ((a[q.correctAnswer] = (a[q.correctAnswer] ?? 0) + 1), a), [])
    for (const l of [avancerad, expert]) {
      const p = plats(l)
      expect(Math.max(...p) - Math.min(...p.filter((x: number) => x != null))).toBeLessThanOrEqual(2)
    }
  })
})
