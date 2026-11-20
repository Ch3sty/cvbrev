// @vitest-environment node
/**
 * Omgång 3, steg 2b: det strukturerade facit (räknevägen `losning` med
 * `steg`, `anvander` och `slutsats`, stödmeningarna `stod` och `narmast`,
 * kedjans `termnamn` och `atomnamn`) avslöjar svaret. Det får bara nå
 * klienten med rättningen, som förklaringen gör i dag:
 *
 *   Träna (text- och sifferpasset, deduktivpasset): uppgiften utan fälten,
 *     återkopplingen efter svaret med dem.
 *   Nivåkollen: uppgifterna utan fälten, genomgången efter avslutet med dem.
 *   Nivåtestet: innehållet utan fälten, genomgången efter rättningen med dem.
 *   Övningsprovet: delarna utan fälten, genomgången efter avslutet med dem.
 *   Publika proven och artikelprovet: uppgiften och underlaget utan fälten
 *     (rutten själv prövas i components/publikt/__tests__/prov-server-kontrakt).
 *
 * Villkorens form (`struktur`) får följa med uppgiften: den har inga
 * alternativ, inga roller och ingen lösning.
 */
import { describe, expect, it } from 'vitest'
import { klientform, passPool, ratta } from '../pass-bank.server'
import { vnPassVy } from '../pass.server'
import { deduktivPassVy } from '../pass-deduktiv.server'
import { vnGenomgang, vnInnehall } from '../vn-nivatest.server'
import { deduktivInnehall, genomgaDeduktiv, hittaDeduktivFraga, visaDeduktiv } from '@/lib/deduktivV1/fragor.server'
import { allaFragor } from '@/lib/deduktivV1/select'
import { bedom, uppgiftFor, valjNivakoll, nivakollVy } from '@/lib/nivakoll/motor.server'
import { ovningsvy, punkterFor, valjDelar } from '@/lib/ovningsprov/motor.server'
import { artikelUppgift, publikUppgift, underlagFor, valjProv } from '@/lib/tests/prov-typer.server'
import { VN_FAMILJER } from '../pass-typer'

/** Fälten som avslöjar svaret, som nycklar i JSON. */
const FACITFALT = /"(losning|steg|anvander|slutsats|stod|narmast|termnamn|atomnamn|ledNamn|vnFacit|formell|roller|correctAnswer|correctAnswerId|rattVisat|explanation|forklaring)":/

const utan = (v: unknown) => expect(JSON.stringify(v)).not.toMatch(FACITFALT)

const IDAG = '2026-11-20'

describe('Träna: text- och sifferpasset', () => {
  for (const kind of ['verbal', 'numerisk'] as const) {
    it(`${kind}: uppgiften utan facit, återkopplingen med räknevägen eller stödmeningarna`, () => {
      let medFacit = 0
      for (const niva of ['grund', 'avancerad'] as const) {
        for (const { id } of passPool(kind, niva)) {
          const meta = { vnpass: 1, alternativ_blandade: true, typ: 'pass', test_kind: kind, niva, underlag_id: id, familj: null, underlag_version: 4, upprepad: false, dag: IDAG, antal: 4, budget_s: 300, expert_rad: false }
          const rad = { id: `s-${id}`, user_id: 'u', test_type: `${kind}-pass`, meta, answers: [], created_at: `${IDAG}T10:00:00Z`, started_at: null, completed_at: null }
          const fore = vnPassVy(rad as never)!
          expect(fore).not.toBeNull()
          utan(fore)
          // Ett svar: återkopplingen bär facit, uppgifterna fortfarande inte.
          const p = fore.punkter[0]
          const svar = p.alternativ[0].id
          const r = ratta(kind, id, p.nyckel, svar, rad.id)!
          const efter = vnPassVy({ ...rad, answers: [{ q_id: p.nyckel, svar, selected: r.selected, visat: r.visat, correct: r.correct, time_spent: 20 }] } as never)!
          utan({ underlag: efter.underlag, punkter: efter.punkter })
          if (efter.aterkoppling[p.nyckel]?.vnFacit) medFacit++
        }
      }
      // Banken har facit på nästan alla uppgifter: återkopplingen bär det.
      expect(medFacit).toBeGreaterThan(10)
    })
  }

  it('numeriskt: räknevägen i återkopplingen har steg, och anvander pekar på underlaget', () => {
    const id = passPool('numerisk', 'grund')[0].id
    const form = klientform('numerisk', id, 's1')!
    const r = form.punkter.map((p) => ratta('numerisk', id, p.nyckel, p.alternativ[0].id, 's1')!).find((x) => x.vnFacit?.losning)
    expect(r?.vnFacit?.losning?.steg.length).toBeGreaterThan(0)
  })
})

describe('Träna: deduktivpasset', () => {
  it('uppgifterna med villkorens form men utan facit; återkopplingen med kedjans namn', () => {
    const d1 = allaFragor().filter((q) => q.typ === 'D1').slice(0, 2)
    const d2 = allaFragor().filter((q) => q.typ === 'D2').slice(0, 2)
    const fragor = [...d1, ...d2].map((q) => q.id)
    const meta = { deduktivpass: 1, alternativ_blandade: true, test_kind: 'deduktiv', niva: 'grund', fragor, deduktiv_version: 5, upprepad: false, dag: IDAG, antal: 4, budget_s: 300, expert_rad: false, nivakoll: null }
    const rad = { id: 'd-1', user_id: 'u', test_type: 'deduktiv-pass', meta, answers: [], created_at: `${IDAG}T10:00:00Z`, started_at: null, completed_at: null }
    const fore = deduktivPassVy(rad as never)!
    utan(fore)
    expect(fore.uppgifter.every((u) => u.struktur)).toBe(true)
    const efter = deduktivPassVy({ ...rad, answers: [{ q_id: d1[0].id, selected: 0, visat: 0, correct: false, time_spent: 30 }] } as never)!
    utan(efter.uppgifter)
    expect(efter.aterkoppling[d1[0].id].ledNamn?.termnamn).toBeTruthy()
  })

  it('villkorens form har aldrig alternativen, rollerna eller lösningen, i någon uppgift', () => {
    for (const q of allaFragor()) {
      const v = visaDeduktiv(q, 'seed', true)
      utan(v)
      expect(JSON.stringify(v.struktur ?? null)).not.toMatch(/"alternativ"|"roller"|"fraga"/)
    }
    // Varje uppgift med en läsbar form får den.
    expect(allaFragor().filter((q) => !visaDeduktiv(q, 'seed', true).struktur).map((q) => q.id)).toEqual([])
  })
})

describe('Nivåkollen', () => {
  for (const kind of ['verbal', 'numerisk', 'deduktiv'] as const) {
    it(`${kind}: uppgifterna utan facit, genomgången efter avslutet med det`, () => {
      const v = valjNivakoll(kind, new Map(), IDAG, `seed-${kind}`)
      const uppgifter = v.fragor.map((n) => uppgiftFor(kind, n, v.nivaer[n] ?? 'grund', 'nk-1', v.delar ?? [])!)
      expect(uppgifter.every(Boolean)).toBe(true)
      utan(uppgifter)
      const meta = { nivakoll: 1, test_kind: kind, typ: 'nivakoll', fragor: v.fragor, nivaer: v.nivaer, delar: v.delar }
      const rad = { id: 'nk-1', user_id: 'u', test_type: 'nivakoll', meta, answers: [], created_at: `${IDAG}T10:00:00Z`, started_at: null, completed_at: null }
      const pagaende = nivakollVy(rad as never)
      if (pagaende) {
        expect(pagaende.genomgang).toBeNull()
        utan(pagaende)
      }
      // Efter avslutet: genomgången bär facit (bedom är dess enda källa).
      const g = uppgifter.map((u) => bedom(kind, u, null, 'nk-1')!.genomgang)
      const harFacit = g.some((x) => (kind === 'deduktiv' ? x.losning : x.data))
      expect(harFacit).toBe(true)
    })
  }
})

describe('Nivåtestet', () => {
  for (const slug of ['verbal-resonemang', 'verbal-resonemang-v2', 'verbal-resonemang-expert', 'numeriskt-test', 'numeriskt-test-v2', 'numeriskt-test-expert']) {
    it(`${slug}: innehållet utan facit, genomgången efter rättningen med det`, () => {
      const inne = vnInnehall(slug, 'nt-1', { underlag_version: 4 })!
      expect(inne.uppgifter.length).toBeGreaterThan(0)
      utan(inne)
      const g = vnGenomgang(slug, 'nt-1', { underlag_version: 4 }, [])!
      expect(g.punkter.some((p) => p.vnFacit)).toBe(true)
    })
  }

  it('deduktivt: frågorna utan facit, genomgången bara när sessionen är avslutad', () => {
    const pagaende = deduktivInnehall({ id: 'dt-1', test_type: 'deduktiv-grund', meta: { alternativ_blandade: true }, completed_at: null })
    expect(pagaende.genomgang).toBeNull()
    utan(pagaende)
    const klar = deduktivInnehall({ id: 'dt-1', test_type: 'deduktiv-grund', meta: { alternativ_blandade: true }, completed_at: `${IDAG}T11:00:00Z` })
    expect(klar.genomgang?.some((g) => g.ledNamn)).toBe(true)
  })
})

describe('Övningsprovet', () => {
  for (const typ of ['verbal', 'numerisk', 'deduktiv'] as const) {
    it(`${typ}: delarna utan facit, genomgången efter avslutet med det`, () => {
      const delar = valjDelar(typ, `seed-${typ}`, new Set(), 4, 12)
      const meta = { ovningsprov: 1, typ, delar, seed: `seed-${typ}`, tidsgrans_s: 1200, del_budget_s: 90, format: null }
      const rad = { id: 'op-1', user_id: 'u', test_type: 'ovningsprov', meta, answers: [], created_at: `${IDAG}T10:00:00Z`, started_at: null, completed_at: null }
      const pagaende = ovningsvy(rad as never)!
      expect(pagaende.genomgang).toBeNull()
      utan(pagaende)
      const klar = ovningsvy({ ...rad, completed_at: `${IDAG}T10:20:00Z` } as never)!
      const punkter = punkterFor(typ, delar)
      expect(klar.genomgang?.length).toBe(punkter.length)
      expect(klar.genomgang!.some((g) => (typ === 'deduktiv' ? g.losning : g.vnFacit))).toBe(true)
      utan(klar.delar)
    })
  }
})

describe('Publika proven och artikelprovet', () => {
  for (const typ of ['verbal', 'numerisk', 'deduktiv'] as const) {
    it(`${typ}: uppgiften och underlaget före claim utan facit`, () => {
      const refs = valjProv(typ, 'tok-1', 'tok-1')
      const uppgifter = refs.map(publikUppgift)
      expect(uppgifter.every(Boolean)).toBe(true)
      utan(uppgifter)
      utan(underlagFor(refs))
    })
  }

  it('artikelprovets första uppgift utan facit', () => {
    for (const [typ, slug] of [['verbal', 'verbalt-test-guide'], ['numerisk', 'numeriskt-test-guide'], ['deduktiv', 'deduktivt-test']] as const) {
      const a = artikelUppgift(typ, slug)
      if (a) utan(a)
    }
  })

  it('familjerna ändras inte av fälten', () => {
    expect(VN_FAMILJER.numerisk).toContain('fel_rad')
    expect(hittaDeduktivFraga(allaFragor()[0].id)).toBeTruthy()
    expect(genomgaDeduktiv(allaFragor()[0], 's', true).losning.steg.length).toBeGreaterThan(0)
  })
})
