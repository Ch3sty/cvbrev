/**
 * Regel R1 (docs/rapporter/beslut-paketnamn-2026-09-24.md): i en knapp, en
 * säljrad, en betalväggsrubrik och ett mejlämne följs paketnamnet av pris
 * eller period i samma sträng. Undantagen i beslutet (sidomenyns huvudrad,
 * kvotrader, statusrader och etiketter där beloppet står på raden under)
 * testas inte här.
 *
 * Kontrollen går över reklamkortens copy, paketcopyn (prissidan, spårvalet,
 * köpsteget, kontosidan), betalväggarna i alla varianter och spår, och
 * mejlmallarnas ämnesrader.
 */

import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { PLANS, type PlanKey } from '@/lib/plans/plans'
import { INLINE, SIDO, SLUT, LISTA_SLUT } from '@/components/artiklar/reklam/reklam-copy'
import {
  D_PRENUMERATION,
  KONTO,
  PAKET_IDS,
  PAKET_KORT,
  SPARVAL,
  borjaKnapp,
  bytLangdKnapp,
  forslagKnapp,
  forslagRubrik,
  knappText,
} from '@/components/pricing/paket-copy'
import { getPaywallCopy, type PaywallVariant } from '@/components/paywall/paywall-copy'
import { kvittoMejl } from '@/lib/email/lifecycle/templates/vecka'
import type { LifecycleContext } from '@/lib/email/lifecycle/types'

const NAMN = [...new Set(PLANS.map((p) => p.name))]
const PRIS_ELLER_PERIOD = /\d+ kr|i veckan|i månaden|per kvartal|ett dygn|till \d/

/** Sant när strängen nämner ett paket men saknar pris och period. */
function brytR1(text: string): boolean {
  return NAMN.some((n) => text.includes(n)) && !PRIS_ELLER_PERIOD.test(text)
}

function kontrollera(strangar: Record<string, string>) {
  const fel = Object.entries(strangar)
    .filter(([, t]) => brytR1(t))
    .map(([var_, t]) => `${var_}: "${t}"`)
  expect(fel, `R1 bruten:\n${fel.join('\n')}`).toEqual([])
}

const PLAN_KEYS = PLANS.map((p) => p.key) as PlanKey[]

describe('R1 i reklamkorten', () => {
  it('inline-radens paketrad, slutkortets knapp och sekundärlänk', () => {
    const s: Record<string, string> = {}
    for (const [k, v] of Object.entries(INLINE)) s[`INLINE.${k}.paketrad`] = v.paketrad
    for (const [k, v] of Object.entries(SLUT)) {
      s[`SLUT.${k}.knapp`] = v.knapp
      s[`SLUT.${k}.sekundar`] = v.sekundar.text
      s[`SLUT.${k}.rubrik`] = v.rubrik
    }
    for (const [k, v] of Object.entries(SIDO)) s[`SIDO.${k}.rubrik`] = v.rubrik
    kontrollera(s)
  })

  it('etiketterna har beloppet och perioden på raden under', () => {
    for (const v of Object.values(SIDO)) {
      expect(v.belopp).toMatch(/\d+ kr/)
      expect(v.under).toMatch(/i veckan/)
    }
    for (const p of LISTA_SLUT.paket) {
      expect(p.pris).toMatch(/\d+ kr/)
      expect(p.under).toMatch(/i veckan/)
    }
  })

  it('ordningen är CV-paketet, Träningspaketet, Hela paketet', () => {
    expect(LISTA_SLUT.paket.map((p) => p.namn)).toEqual(['CV-paketet', 'Träningspaketet', 'Hela paketet'])
    // Hela paketets egna rader före hänvisningen till de andra två.
    expect(SLUT.allt.rader[SLUT.allt.rader.length - 1]).toMatch(/CV-paketet och Träningspaketet/)
  })
})

describe('R1 i paketcopyn', () => {
  it('knappar och rubriker på prissidan, spårvalet, köpsteget och kontosidan', () => {
    const s: Record<string, string> = {
      'KONTO.bytTillAllt': KONTO.bytTillAllt,
      'D_PRENUMERATION.bytTillAllt': D_PRENUMERATION.bytTillAllt,
    }
    for (const id of PAKET_IDS) {
      s[`PAKET_KORT.${id}.knapp`] = PAKET_KORT[id].knapp
      s[`SPARVAL.primar(${id})`] = SPARVAL.primar(id)
      s[`borjaKnapp(${id})`] = borjaKnapp(id)
    }
    for (const plan of PLAN_KEYS) {
      s[`borjaKnapp(allt, ${plan})`] = borjaKnapp('allt', plan)
      s[`knappText(${plan})`] = knappText(plan)
      s[`forslagKnapp(${plan})`] = forslagKnapp(plan)
      s[`forslagRubrik(${plan})`] = forslagRubrik(plan)
      s[`bytLangdKnapp(${plan})`] = bytLangdKnapp(plan)
      s[`KONTO.bytSpar(${plan})`] = KONTO.bytSpar(plan)
      s[`KONTO.bytLangd(${plan})`] = KONTO.bytLangd(plan)
    }
    kontrollera(s)
  })

  it('betalväggens verb är Köp, aldrig Ta eller Skaffa', () => {
    for (const plan of PLAN_KEYS) {
      expect(knappText(plan)).toMatch(/^Köp /)
    }
  })
})

describe('R1 i betalväggarna', () => {
  const VARIANTER: PaywallVariant[] = [
    'mall',
    'testniva',
    'analys',
    'analys-omkorning',
    'nedladdning',
    'cv-export',
    'jobbtraffar',
    'chatt',
    'historik',
    'linkedin',
    'bli-upptackt',
    'kvot',
    'test-tak',
    'nedgraderad',
    'cv-antal',
    'af-rapport',
  ]

  it('rubrik och knapp i varje variant, för varje valt paket', () => {
    const s: Record<string, string> = {}
    for (const variant of VARIANTER) {
      for (const track of [null, 'cv', 'tester', 'allt'] as const) {
        const c = getPaywallCopy(variant, { track, quotaFeature: 'chat_message' })
        s[`${variant}/${track}.title`] = c.title
        s[`${variant}/${track}.primary`] = c.primary
        if (c.prisrad) s[`${variant}/${track}.prisrad`] = c.prisrad
      }
    }
    kontrollera(s)
  })

  it('primärknappen säger Köp och beloppet när den säljer ett paket', () => {
    for (const variant of VARIANTER) {
      const c = getPaywallCopy(variant)
      if (!c.plan) continue
      expect(c.primary, variant).toMatch(/\d+ kr/)
      expect(c.primary, variant).not.toMatch(/^Ta /)
      expect(c.prisrad, variant).toMatch(/\d+ kr/)
    }
  })
})

describe('R1 i mejlen', () => {
  it('kvittots ämnesrad: namn, längd, belopp', () => {
    const ctx = {
      userId: 'x',
      profile: { full_name: null },
      metadata: { planKey: 'all_month', amount: 149 },
    } as unknown as LifecycleContext
    const { subject } = kvittoMejl.render(ctx) as { subject: string }
    expect(subject).toBe('Kvitto: Hela paketet, en månad, 149 kr')
  })

  it('ämnesrader som bär ett paketnamn bär också ett belopp', () => {
    const dir = path.resolve(__dirname, '../../email/lifecycle/templates')
    const fel: string[] = []
    for (const fil of fs.readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
      const rader = fs.readFileSync(path.join(dir, fil), 'utf8').split('\n')
      rader.forEach((rad, i) => {
        if (!/subject\s*[:=]/.test(rad)) return
        const namngivet =
          /\$\{(namn|paket)\}/.test(rad) || /paketNamn|paketMedLangd|paketMedPris/.test(rad) || brytR1(rad)
        if (namngivet && !/kr|paketMedPris|prisPeriod/.test(rad)) fel.push(`${fil}:${i + 1}: ${rad.trim()}`)
      })
    }
    expect(fel, fel.join('\n')).toEqual([])
  })
})
