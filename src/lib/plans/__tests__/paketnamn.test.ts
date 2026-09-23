/**
 * Paketnamnen (docs/rapporter/beslut-paketnamn-2026-09-24.md).
 *
 * @gamla-paketnamn Den här filen nämner de gamla namnen med flit: den letar
 * efter dem. Markören ovan släpper igenom en testfil som uttryckligen testar
 * gamla data; ingen annan fil i src ska bära den.
 *
 * Tre saker ska aldrig gå sönder:
 *
 * 1. En sanning. De gamla namnen får inte stå någonstans i src utanför
 *    plans.ts (som översätter gammal data), migreringar och tester med
 *    markören. Ett namnbyte med sök och ersätt lämnar annars rester.
 * 2. Förklaringsraden är högst 60 tecken och finns för varje paket.
 * 3. Hjälparna ger namnen, perioden och ordningen som beslutet säger.
 */

import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  PLANS,
  PLAN_BY_KEY,
  langdOrd,
  paketMedLangd,
  paketMedPris,
  paketNamn,
  paketNamnForScope,
  paketNamnUrMetadata,
  planKeyFranGammaltNamn,
  prisPeriod,
} from '@/lib/plans/plans'

const GAMLA = ['CV-veckan', 'Testveckan', 'Allt-veckan', 'Allt-dagen', 'Allt-månaden', 'Allt-kvartalet', 'Allt-manaden']
const MARKOR = '@gamla-paketnamn'

const SRC = path.resolve(__dirname, '../../..')

function filer(dir: string, ut: string[] = []): string[] {
  for (const namn of fs.readdirSync(dir)) {
    const full = path.join(dir, namn)
    const st = fs.statSync(full)
    if (st.isDirectory()) {
      if (namn === 'node_modules' || namn.startsWith('.')) continue
      filer(full, ut)
    } else if (/\.(ts|tsx|js|jsx|mdx|md|json|sql)$/.test(namn)) {
      ut.push(full)
    }
  }
  return ut
}

describe('de gamla paketnamnen', () => {
  it('står inte i src utanför plans.ts, migreringar och markerade tester', () => {
    const traffar: string[] = []
    for (const fil of filer(SRC)) {
      const rel = path.relative(SRC, fil).split(path.sep).join('/')
      if (rel === 'lib/plans/plans.ts') continue
      if (/(^|\/)migrations?\//.test(rel)) continue
      const text = fs.readFileSync(fil, 'utf8')
      if (text.includes(MARKOR)) continue
      for (const gammalt of GAMLA) {
        if (text.includes(gammalt)) traffar.push(`${rel}: ${gammalt}`)
      }
    }
    expect(traffar, `gamla paketnamn i src:\n${traffar.join('\n')}`).toEqual([])
  })

  it('markören bärs bara av testfiler', () => {
    const fel = filer(SRC)
      .filter((f) => fs.readFileSync(f, 'utf8').includes(MARKOR))
      .map((f) => path.relative(SRC, f).split(path.sep).join('/'))
      .filter((rel) => !rel.includes('__tests__/') && !/\.test\.tsx?$/.test(rel))
    expect(fel).toEqual([])
  })
})

describe('namnen ur PLANS', () => {
  it('fyra namn på sex nycklar, Hela paketet ett namn med tre längder', () => {
    expect(PLANS.map((p) => [p.key, p.name])).toEqual([
      ['cv_week', 'CV-paketet'],
      ['test_week', 'Träningspaketet'],
      ['all_day', 'Dagspasset'],
      ['all_week', 'Hela paketet'],
      ['all_month', 'Hela paketet'],
      ['all_quarter', 'Hela paketet'],
    ])
  })

  it('priserna och nycklarna är orörda', () => {
    expect(PLANS.map((p) => [p.key, p.amount, p.scope, p.length, p.mode])).toEqual([
      ['cv_week', 79, 'cv', 'vecka', 'subscription'],
      ['test_week', 79, 'tester', 'vecka', 'subscription'],
      ['all_day', 49, 'allt', 'dag', 'payment'],
      ['all_week', 99, 'allt', 'vecka', 'subscription'],
      ['all_month', 149, 'allt', 'månad', 'subscription'],
      ['all_quarter', 299, 'allt', 'kvartal', 'subscription'],
    ])
  })

  it('förklaringsraden finns och är högst 60 tecken', () => {
    for (const p of PLANS) {
      expect(p.beskrivning.length, p.key).toBeGreaterThan(0)
      expect(p.beskrivning.length, `${p.key}: ${p.beskrivning}`).toBeLessThanOrEqual(60)
      expect(p.beskrivning, p.key).not.toMatch(/—/)
    }
    expect(PLAN_BY_KEY.cv_week.beskrivning).toBe('CV-mallar, CV-analys, personliga brev som PDF, LinkedIn')
    expect(PLAN_BY_KEY.test_week.beskrivning).toBe('Alla rekryteringstester, personlighetstestet, intervjuprovet')
    expect(PLAN_BY_KEY.all_week.beskrivning).toBe('Allt ingår: CV, tester, matchning, Jobbcoachen, Bli upptäckt')
    expect(PLAN_BY_KEY.all_day.beskrivning).toBe('Hela paketet i 24 timmar. Engångsköp, förnyas inte.')
  })

  it('personlighetstestet syns i Träningspaketet och Hela paketet', () => {
    expect(PLAN_BY_KEY.test_week.highlights.join(' ')).toMatch(/personlighetstestet/i)
    for (const key of ['all_week', 'all_month', 'all_quarter'] as const) {
      const h = PLAN_BY_KEY[key].highlights
      // Egna rader först, hänvisningen till de andra två sist (R3).
      expect(h[0]).toMatch(/Jobbmatchning/)
      expect(h[1]).toMatch(/Jobbcoachen/)
      expect(h[2]).toMatch(/Bli upptäckt/)
      expect(h[3]).toMatch(/CV-paketet och Träningspaketet.*personlighetstestet/)
    }
  })

  it('hjälparna', () => {
    expect(paketNamn('all_month')).toBe('Hela paketet')
    expect(paketNamnForScope('cv')).toBe('CV-paketet')
    expect(paketNamnForScope('tester')).toBe('Träningspaketet')
    expect(paketNamnForScope('allt')).toBe('Hela paketet')
    expect(prisPeriod('cv_week')).toBe('79 kr i veckan')
    expect(prisPeriod('all_month')).toBe('149 kr i månaden')
    expect(prisPeriod('all_quarter')).toBe('299 kr per kvartal')
    expect(prisPeriod('all_day')).toBe('49 kr, ett dygn')
    expect(paketMedPris('cv_week')).toBe('CV-paketet, 79 kr i veckan')
    expect(paketMedLangd('all_month')).toBe('Hela paketet, en månad')
    expect(paketMedLangd('all_day')).toBe('Dagspasset')
    expect(langdOrd('all_quarter')).toBe('ett kvartal')
  })

  it('gammal data får det nya namnet', () => {
    expect(planKeyFranGammaltNamn('Allt-månaden')).toBe('all_month')
    expect(planKeyFranGammaltNamn('Testveckan')).toBe('test_week')
    expect(planKeyFranGammaltNamn('Något annat')).toBeNull()
    expect(paketNamnUrMetadata({ planName: 'CV-veckan' })).toBe('CV-paketet')
    expect(paketNamnUrMetadata({ planName: 'Allt-kvartalet' })).toBe('Hela paketet, ett kvartal')
    expect(paketNamnUrMetadata({ planKey: 'all_week', planName: 'Allt-veckan' })).toBe('Hela paketet, en vecka')
    expect(paketNamnUrMetadata(null)).toBe('CV-paketet')
  })
})
