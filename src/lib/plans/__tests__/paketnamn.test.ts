/**
 * Paketnamnen (docs/rapporter/beslut-paketnamn-2026-09-24.md) och namnet
 * Jobbcoach Premium (ägarens beslut 2026-10-11, spec-rummen 17.3 och 17.4,
 * skrivregeln i docs/design/copy-premium-2026-10-11.md).
 *
 * @gamla-paketnamn Den här filen nämner de gamla namnen med flit: den letar
 * efter dem. Markören ovan släpper igenom en testfil som uttryckligen testar
 * gamla data; ingen annan fil i src ska bära den.
 *
 * Fyra saker ska aldrig gå sönder:
 *
 * 1. En sanning. De gamla namnen får inte stå någonstans i src utanför
 *    plans.ts (som översätter gammal data), migreringar och tester med
 *    markören. Ett namnbyte med sök och ersätt lämnar annars rester.
 * 2. Förklaringsraden är högst 60 tecken och finns för varje paket.
 * 3. Hjälparna ger namnen, perioden och ordningen som beslutet säger.
 * 4. Skrivregeln: "Jobbcoach Premium" och "Premium" med stort P är de enda
 *    formerna; "Hela paketet", pluralen "paketen", "Uppgradera till" och
 *    sammansättningar som "Premium-paketet" står aldrig i en användarsträng.
 */

import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  PLANS,
  PLAN_BY_KEY,
  SALD_PLAN,
  SALJBARA_PLANER,
  kopKnapp,
  langdOrd,
  paketKort,
  paketMedLangd,
  paketMedPris,
  paketNamn,
  paketNamnForScope,
  paketNamnUrMetadata,
  planKeyFranGammaltNamn,
  prisPeriod,
  saljbarPlan,
  saljs,
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

/** Rader utan kommentarer. Grovt men räcker: blockkommentarer och //-rader faller bort. */
function kodrader(text: string): Array<[number, string]> {
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
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('{/*') || t.endsWith('*/}')) return
    ut.push([i + 1, rad.replace(/\s\/\/.*$/, '').replace(/\{\/\*.*?\*\/\}/g, '')])
  })
  return ut
}

/** Källfiler med användarsträngar: ts och tsx utanför tester och markerade filer. */
function kallfiler(): Array<{ rel: string; text: string }> {
  const ut: Array<{ rel: string; text: string }> = []
  for (const fil of filer(SRC)) {
    if (!/\.(ts|tsx)$/.test(fil)) continue
    const rel = path.relative(SRC, fil).split(path.sep).join('/')
    if (rel.includes('__tests__/') || /\.test\.tsx?$/.test(rel)) continue
    const text = fs.readFileSync(fil, 'utf8')
    if (text.includes(MARKOR)) continue
    ut.push({ rel, text })
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
  it('fyra namn på sex nycklar, Jobbcoach Premium ett namn med tre längder', () => {
    expect(PLANS.map((p) => [p.key, p.name])).toEqual([
      ['cv_week', 'CV-paketet'],
      ['test_week', 'Träningspaketet'],
      ['all_day', 'Dagspasset'],
      ['all_week', 'Jobbcoach Premium'],
      ['all_month', 'Jobbcoach Premium'],
      ['all_quarter', 'Jobbcoach Premium'],
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

  it('bara all_month säljs (17.3), de andra står kvar för befintliga kunder', () => {
    expect(PLANS.filter((p) => p.saljs).map((p) => p.key)).toEqual(['all_month'])
    expect(SALJBARA_PLANER.map((p) => p.key)).toEqual(['all_month'])
    expect(SALD_PLAN).toBe('all_month')
    for (const key of ['cv_week', 'test_week', 'all_day', 'all_week', 'all_quarter'] as const) {
      expect(PLAN_BY_KEY[key].saljs, key).toBe(false)
      expect(saljs(key), key).toBe(false)
      expect(saljbarPlan(key), key).toBe('all_month')
    }
    expect(saljs('all_month')).toBe(true)
    expect(saljbarPlan('all_month')).toBe('all_month')
    expect(saljbarPlan('skräp')).toBe('all_month')
    expect(saljbarPlan(undefined)).toBe('all_month')
  })

  it('förklaringsraden finns och är högst 60 tecken', () => {
    for (const p of PLANS) {
      expect(p.beskrivning.length, p.key).toBeGreaterThan(0)
      expect(p.beskrivning.length, `${p.key}: ${p.beskrivning}`).toBeLessThanOrEqual(60)
      expect(p.beskrivning, p.key).not.toMatch(/—/)
    }
    expect(PLAN_BY_KEY.all_month.beskrivning).toBe('CV, personliga brev, tester, jobbmatchning och Jobbcoachen')
    expect(PLAN_BY_KEY.all_day.beskrivning).toBe('Jobbcoach Premium i 24 timmar. Engångsköp, förnyas inte.')
    expect(PLAN_BY_KEY.all_day.body).toBe('24 timmar med Jobbcoach Premium. Ett engångsköp, inget dras igen.')
  })

  it('all_month enligt copy-premium avsnitt 3', () => {
    const m = PLAN_BY_KEY.all_month
    expect(m.body).toBe('149 kr i månaden. Allt ingår. Dras varje månad tills du säger upp.')
    expect(m.ctaLabel).toBe('Köp Premium, 149 kr i månaden')
    // Raden som hänvisade till de andra paketen är två egna rader (copy-premium 3).
    expect(m.highlights).toContain('Alla CV-mallar, CV-analysen, personliga brev och LinkedIn')
    expect(m.highlights).toContain('Alla rekryteringstester, provläget och personlighetstestet')
    expect(m.highlights.join(' ')).toMatch(/Jobbmatchning/)
    expect(m.highlights.join(' ')).toMatch(/Jobbcoachen/)
    expect(m.highlights.join(' ')).toMatch(/Bli upptäckt/)
  })

  it('ingen ctaLabel säger Välj eller fulla namnet i knappen (copy-premium 2 och 8)', () => {
    for (const p of PLANS) {
      expect(p.ctaLabel, p.key).toMatch(/^Köp /)
      expect(p.ctaLabel, p.key).not.toMatch(/Köp Jobbcoach Premium/)
    }
  })

  it('hjälparna', () => {
    expect(paketNamn('all_month')).toBe('Jobbcoach Premium')
    expect(paketKort()).toBe('Premium')
    expect(kopKnapp()).toBe('Köp Premium, 149 kr i månaden')
    expect(kopKnapp('all_month').length).toBeLessThan(30)
    expect(paketNamnForScope('cv')).toBe('CV-paketet')
    expect(paketNamnForScope('tester')).toBe('Träningspaketet')
    expect(paketNamnForScope('allt')).toBe('Jobbcoach Premium')
    expect(prisPeriod('cv_week')).toBe('79 kr i veckan')
    expect(prisPeriod('all_month')).toBe('149 kr i månaden')
    expect(prisPeriod('all_quarter')).toBe('299 kr per kvartal')
    expect(prisPeriod('all_day')).toBe('49 kr, ett dygn')
    expect(paketMedPris('all_month')).toBe('Jobbcoach Premium, 149 kr i månaden')
    expect(paketMedLangd('all_month')).toBe('Jobbcoach Premium, en månad')
    // Befintliga vecko- och kvartalskunder (krock 8).
    expect(paketMedLangd('all_week')).toBe('Jobbcoach Premium, en vecka')
    expect(paketMedLangd('all_quarter')).toBe('Jobbcoach Premium, ett kvartal')
    expect(paketMedLangd('all_day')).toBe('Dagspasset')
    expect(langdOrd('all_quarter')).toBe('ett kvartal')
  })

  it('gammal data får det nya namnet, också Hela paketet (krock 7)', () => {
    expect(planKeyFranGammaltNamn('Allt-månaden')).toBe('all_month')
    expect(planKeyFranGammaltNamn('Testveckan')).toBe('test_week')
    expect(planKeyFranGammaltNamn('Hela paketet')).toBe('all_month')
    expect(planKeyFranGammaltNamn('Något annat')).toBeNull()
    expect(paketNamnUrMetadata({ planName: 'CV-veckan' })).toBe('CV-paketet')
    expect(paketNamnUrMetadata({ planName: 'Hela paketet' })).toBe('Jobbcoach Premium, en månad')
    expect(paketNamnUrMetadata({ planName: 'Allt-kvartalet' })).toBe('Jobbcoach Premium, ett kvartal')
    expect(paketNamnUrMetadata({ planKey: 'all_week', planName: 'Allt-veckan' })).toBe('Jobbcoach Premium, en vecka')
    expect(paketNamnUrMetadata(null)).toBe('CV-paketet')
  })
})

/**
 * Skrivregeln för Jobbcoach Premium (copy-premium avsnitt 2, 4 och 7).
 * Vänd 2026-10-11: ordet Premium är tillbaka med en enda betydelse, och det
 * som förbjuds är de felaktiga formerna. Tekniska namn får stå: premium_*-
 * kolumner, värdet 'premium' i en jämförelse, identifierare som isPremium
 * och PremiumGate, kommentarer och testfiler med markören. I yrkesmallarnas
 * branschtexter är premium ett vanligt adjektiv och lämnas.
 */
describe('skrivregeln för Jobbcoach Premium', () => {
  const BRANSCHTEXT = new Set(['app/(public)/cv-mallar/yrkesmall-content.ts'])
  /** Adminen och cron är interna ytor: där får premium och paketen stå som tekniska ord. */
  const INTERNT = /^app\/(admin|api\/admin|api\/cron)\//

  /** Former som aldrig får stå i en användarsträng. */
  const FORBJUDNA: Array<[string, RegExp]> = [
    ['Hela paketet', /[Hh]ela paketet/],
    ['Premium-paketet', /Premium-?paketet/i],
    ['Premium- följt av ett ord', /(^|[^A-Za-z_])Premium-[a-zåäö]/],
    ['Jobbcoachen Premium', /Jobbcoachen Premium/],
    ['Jobbcoach.ai Premium', /Jobbcoach\.ai Premium/i],
    ['Uppgradera till', /[Uu]ppgradera till/],
    ['paketen', /(^|[^A-Za-zåäö_])paketen(?![A-Za-zåäö_])/],
  ]

  /** Gement premium som ord i en sträng (inte premium_, isPremium, 'premium' som värde). */
  const GEMENT = /['"`>][^'"`<]*(^|[^A-Za-z_'"`-])premium[ .,][^'"`<]*/

  it('ingen förbjuden form i någon användarsträng i src', () => {
    const traffar: string[] = []
    for (const { rel, text } of kallfiler()) {
      if (rel === 'lib/plans/plans.ts') continue
      for (const [nr, rad] of kodrader(text)) {
        if (/^\s*console\.(log|error|warn|info)\(/.test(rad)) continue
        for (const [namn, re] of FORBJUDNA) {
          if (BRANSCHTEXT.has(rel) && namn.startsWith('Premium-')) continue
          if (INTERNT.test(rel) && (namn === 'paketen')) continue
          if (re.test(rad)) traffar.push(`${rel}:${nr} [${namn}]: ${rad.trim().slice(0, 120)}`)
        }
        if (!BRANSCHTEXT.has(rel) && !INTERNT.test(rel) && GEMENT.test(rad)) {
          traffar.push(`${rel}:${nr} [gement premium]: ${rad.trim().slice(0, 120)}`)
        }
      }
    }
    expect(traffar, `förbjudna former i src:\n${traffar.join('\n')}`).toEqual([])
  })

  it('mönstren fångar formerna men inte de tekniska namnen', () => {
    const traff = (rad: string) => FORBJUDNA.some(([, re]) => re.test(rad))
    expect(traff("title: 'Mallen ingår i Hela paketet'")).toBe(true)
    expect(traff("'Premium-paketet'")).toBe(true)
    expect(traff("'Premium-mallar'")).toBe(true)
    expect(traff("'Uppgradera till Premium'")).toBe(true)
    expect(traff("'Jämför paketen'")).toBe(true)
    expect(traff("'Jobbcoachen Premium'")).toBe(true)
    expect(traff("'Jobbcoach Premium, 149 kr i månaden'")).toBe(false)
    expect(traff("'Ingår i Premium'")).toBe(false)
    expect(traff('const paketenLista = []')).toBe(false)
    expect(GEMENT.test("label: 'uppgradera till premium för fler'")).toBe(true)
    expect(GEMENT.test("if (tier === 'premium') return")).toBe(false)
    expect(GEMENT.test('premium_until')).toBe(false)
    expect(GEMENT.test('if (isPremium) return')).toBe(false)
  })

  it('PAKETRADER följer skrivregeln', async () => {
    const { PAKETRADER } = await import('@/components/paywall/paywall-copy')
    expect(PAKETRADER.ingar).toBe('Ingår i Premium')
    expect(PAKETRADER.ingarUtanTak).toBe('Ingår i Premium, utan tak')
    expect(PAKETRADER.lastCv).toBe('Låst. Ingår i Premium.')
    expect(PAKETRADER.bricka).toBe('Premium')
    expect(PAKETRADER.kopCv).toBe('Köp Premium, 149 kr i månaden')
    expect(PAKETRADER.jamfor).toBe('Se vad som ingår')
    expect(PAKETRADER.paketAktivt).toBe('Du har Premium')
    expect(PAKETRADER.analysUtanTak).toBe('Du har Premium. Analysera så ofta du vill.')
    expect(PAKETRADER.aktivitetKop).toBe('köpte Jobbcoach Premium')
    expect(PAKETRADER.tackTitel(null)).toBe('Tack. Du har Jobbcoach Premium.')
    expect(PAKETRADER.belonning(3)).toBe('Du har fått Jobbcoach Premium i 3 dagar.')
    // LinkedIn-raden skriver fulla namnet (krock 2).
    expect(PAKETRADER.linkedinKvot).toMatch(/Jobbcoach Premium/)
    for (const v of Object.values(PAKETRADER)) {
      const text = typeof v === 'function' ? (v as (x: never) => string)(3 as never) : v
      expect(text).not.toMatch(/Hela paketet|paketen|Uppgradera|—/)
      // Knappen säger aldrig fulla namnet (copy-premium 8).
      expect(text).not.toMatch(/^Köp Jobbcoach Premium/)
    }
  })
})
