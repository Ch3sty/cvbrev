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

/**
 * Ordet Premium (docs/qa/qa-slutflode-2026-09-24.md, K2). Produkten heter
 * paket sedan 2026-09-24: en knapp säger Köp med paketnamn och pris, en
 * etikett "Ingår när du har ett paket". De tekniska namnen får stå kvar:
 * premium_*-kolumner och värdet 'premium' (gemener), identifierare som
 * isPremium och PremiumGate (ordet sitter ihop med annat), kommentarer och
 * testfiler med markören. I yrkesmallarnas branschtexter är premium ett
 * vanligt ord (Premium-restauranger, Premium-CAD); där fångas bara
 * produktnamnet.
 */
describe('ordet Premium', () => {
  const ORD = /(^|[^A-Za-z_])Premium(?![A-Z0-9_])/
  const PRODUKT = /Premium[- ]?(mall|variant|konto|användare|prenumeration|funktion|tjänst|nivå)/
  const BRANSCHTEXT = new Set(['app/(public)/cv-mallar/yrkesmall-content.ts'])

  /** Rader utan kommentarer. Grovt men räcker: blockkommentarer och //-rader faller bort. */
  function koddrader(text: string): Array<[number, string]> {
    const ut: Array<[number, string]> = []
    let iBlock = false
    text.split(/\r?\n/).forEach((rad, i) => {
      const t = rad.trim()
      if (iBlock) {
        if (t.includes('*/')) iBlock = false
        return
      }
      if (t.startsWith('/*') && !t.includes('*/')) {
        iBlock = true
        return
      }
      if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('{/*')) return
      ut.push([i + 1, rad.replace(/\s\/\/.*$/, '')])
    })
    return ut
  }

  it('står inte i någon användarsträng i src', () => {
    const traffar: string[] = []
    for (const fil of filer(SRC)) {
      if (!/\.(ts|tsx)$/.test(fil)) continue
      const rel = path.relative(SRC, fil).split(path.sep).join('/')
      if (rel.includes('__tests__/') || /\.test\.tsx?$/.test(rel)) continue
      const text = fs.readFileSync(fil, 'utf8')
      if (text.includes(MARKOR)) continue
      const regel = BRANSCHTEXT.has(rel) ? PRODUKT : ORD
      for (const [nr, rad] of koddrader(text)) {
        if (regel.test(rad)) traffar.push(`${rel}:${nr}: ${rad.trim().slice(0, 120)}`)
      }
    }
    expect(traffar, `"Premium" i src:\n${traffar.join('\n')}`).toEqual([])
  })

  it('fångar ordet men inte de tekniska namnen', () => {
    const fangar = (rad: string) => ORD.test(rad)
    expect(fangar("label: 'Mallen kräver Premium'")).toBe(true)
    expect(fangar('Se Premium')).toBe(true)
    expect(fangar('Premium-mallar')).toBe(true)
    expect(fangar('våra Premiumtjänster')).toBe(true)
    expect(fangar("tier === 'premium'")).toBe(false)
    expect(fangar('premium_until')).toBe(false)
    expect(fangar('if (isPremium) return')).toBe(false)
    expect(fangar('<PremiumGate>')).toBe(false)
    expect(PRODUKT.test("title: 'Premium-mallen Disk Plus med foto'")).toBe(true)
    expect(PRODUKT.test("kategori: 'Premium-restauranger'")).toBe(false)
  })

  it('ersättningarna följer paketnamnen', async () => {
    const { PAKETRADER } = await import('@/components/paywall/paywall-copy')
    expect(PAKETRADER.ingar).toBe('Ingår när du har ett paket')
    expect(PAKETRADER.kopCv).toBe('Köp CV-paketet, 79 kr i veckan')
    expect(PAKETRADER.bricka).toBe(paketNamn('cv_week'))
    expect(PAKETRADER.mallSparr).toBe('Mallen ingår i CV-paketet, 79 kr i veckan. Välj en annan mall eller spara utan PDF.')
    for (const v of Object.values(PAKETRADER)) {
      const text = typeof v === 'function' ? (v as (x: never) => string)(3 as never) : v
      expect(text).not.toMatch(/Premium|—/)
    }
  })
})
