// Varje mönster-id som bankerna innehåller har ett svenskt namn och en
// rubrik att öva, och ingen av dem är id:t självt (omgång 3, granskningen
// av steg 3a punkt 1).
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { VN_FAMILJER } from '@/lib/tester/pass-typer'
import { MONSTER_NAMN, monsterId, monsterNamn, ovaPa } from '../monsterNamn'
import type { TestTypId } from '../typer'

const LIB = join(__dirname, '..', '..', '..')

function ur(dir: string, falt: string): string[] {
  const ut = new Set<string>()
  for (const f of readdirSync(join(LIB, dir))) {
    if (!f.endsWith('.json') || !/^(bank|questionBank)/.test(f)) continue
    const t = readFileSync(join(LIB, dir, f), 'utf8')
    for (const m of t.matchAll(new RegExp(`"${falt}"\\s*:\\s*"([^"]+)"`, 'g'))) ut.add(m[1])
  }
  return [...ut]
}

const BANKERNA: Record<TestTypId, string[]> = {
  matris: ur('logicTestV7', 'family'),
  figurserie: ur('figurserierV1', 'family'),
  deduktiv: ur('deduktivV1', 'family'),
  verbal: [...VN_FAMILJER.verbal],
  numerisk: [...VN_FAMILJER.numerisk],
  talserie: ur('talserierV1', 'family'),
  spatial: ur('spatialV1', 'form'),
  ordforrad: ur('ordforradV1', 'typ'),
}

describe('monsterNamn', () => {
  for (const [typ, ids] of Object.entries(BANKERNA) as [TestTypId, string[]][]) {
    it(`${typ}: varje id i bankerna har namn och rubrik, inget är id:t`, () => {
      expect(ids.length).toBeGreaterThan(0)
      for (const id of ids) {
        const namn = monsterNamn(typ, id)
        const ova = ovaPa(typ, id)
        expect(namn, `${typ}/${id} saknar namn`).toBeTruthy()
        expect(ova, `${typ}/${id} saknar rubrik`).toBeTruthy()
        expect(namn).not.toBe(id)
        expect(ova).not.toBe(id)
        expect(`${namn} ${ova}`).not.toMatch(/[_-]/)
        expect(ova).toMatch(/^[A-ZÅÄÖ]/)
      }
    })
  }

  it('namnen som sessionerna sparar leder tillbaka till id:t', () => {
    for (const [typ, rader] of Object.entries(MONSTER_NAMN) as [TestTypId, Record<string, { namn: string }>][]) {
      for (const [id, r] of Object.entries(rader)) expect(monsterId(typ, r.namn)).toBe(id)
    }
  })

  it('okänt id ger inget namn', () => {
    expect(monsterNamn('figurserie', 'okand_familj')).toBeNull()
  })

  it('rubrikerna läses som meningar', () => {
    expect(ovaPa('figurserie', 'vaxande')).toBe('Öva på växande steg')
    expect(ovaPa('numerisk', 'fel_rad')).toBe('Läs av rätt rad i tabellen')
    expect(ovaPa('deduktiv', 'kan_inte')).toBe('Öva på frågor om vad som inte kan stämma')
    expect(ovaPa('verbal', 'utanfor')).toBe('Öva på det texten inte säger')
  })
})
