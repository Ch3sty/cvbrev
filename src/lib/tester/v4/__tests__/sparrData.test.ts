import { describe, expect, it } from 'vitest'
import { sparrDataFor } from '../sparrData'
import { monsterRad, monsterPerUppgift } from '@/components/session/resultat/monster'
import { MONSTER_NAMN } from '../monsterNamn'
import type { PlanV4 } from '../typer'

const plan: PlanV4 = {
  mittTest: 'alva',
  namn: 'Alva Logic',
  typer: ['matris', 'figurserie'],
  provdatum: '2026-11-25',
  dagarKvar: 5,
  planStart: '2026-11-15',
  dagsmal: null,
  format: 'Provet har 20 uppgifter på 40 minuter.',
  ovningsprov: { namn: 'Övningsprov Alva Logic', meta: '20 uppgifter på 40 minuter', href: '/x', foreslagenDag: null },
  franArtikel: false,
}
const typer = [
  { id: 'matris' as const, niva: { status: 'matt' as const, niva: 3.4, osakerhet: 0.6, tak: 7.5 } },
  { id: 'verbal' as const, niva: { status: 'omatt' as const, niva: null, osakerhet: 0.6, tak: 7.5 } },
]

describe('sparrDataFor (omgång 3, steg 4)', () => {
  it('ger nivån, provet, formatet och dagarna när typen ingår i planen', () => {
    const s = sparrDataFor({ plan, typer }, 'matris')
    expect(s.dagarKvar).toBe(5)
    expect(s.data.niva).toBe(3.4)
    expect(s.data.prov).toEqual({ namn: 'Alva Logic', dag: '25 nov' })
    expect(s.data.format?.text).toBe('20 uppgifter på 40 minuter')
  })
  it('lämnar provet utanför för en typ utanför planen och nivån för en omätt typ', () => {
    const s = sparrDataFor({ plan, typer }, 'verbal')
    expect(s.data).toEqual({})
    expect(s.dagarKvar).toBeNull()
  })
  it('utan plan: bara nivån', () => {
    expect(sparrDataFor({ plan: null, typer }, 'matris')).toEqual({ data: { niva: 3.4 }, dagarKvar: null })
  })
  it('eget urval heter Provet och får inget format', () => {
    const s = sparrDataFor({ plan: { ...plan, mittTest: 'annat', namn: 'Eget urval' }, typer }, null)
    expect(s.data.prov?.namn).toBe('Provet')
    expect(s.data.format).toBeUndefined()
  })
  it('passerat provdatum ger ingen dag och inga dagar kvar', () => {
    const s = sparrDataFor({ plan: { ...plan, dagarKvar: -2 }, typer }, 'matris')
    expect(s.dagarKvar).toBeNull()
    expect(s.data.prov?.dag).toBeNull()
  })
})

describe('mönstren på resultaten', () => {
  it('ger namnet och rubriken, aldrig ett id', () => {
    expect(monsterRad('deduktiv', 'om_sa')).toEqual({ namn: MONSTER_NAMN.deduktiv.om_sa.namn, ova: 'Öva på villkor med om och så', href: null })
    expect(monsterRad('deduktiv', 'okant_id')).toBeNull()
    expect(monsterRad('spatial', 'Bklipp')?.href).toContain('B')
    expect(monsterRad('matris', 'vridning')?.href).toBeTruthy()
  })
  it('rubrikerna för villkoren läser som meningar', () => {
    expect(MONSTER_NAMN.deduktiv.inte_granne.ova).toBe('Öva på villkoret inte bredvid varandra')
    expect(MONSTER_NAMN.deduktiv.direkt_vanster_om.ova).toBe('Öva på villkoret direkt till vänster om')
  })
  it('övningsprovets mönster följer postordningen', () => {
    expect(monsterPerUppgift({ genomgang: [{ nyckel: 'b', monster: 'Plats' }, { nyckel: 'a', monster: null }] }, ['a', 'b'])).toEqual([null, 'Plats'])
    expect(monsterPerUppgift({ genomgang: [] }, ['a'])).toBeNull()
  })
})
