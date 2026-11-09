// Övningsprovet i deduktivt (testplanen steg 1, 2026-11-09): formatet per
// leverantör, urvalet med de svåraste sist, rättningen och lösningen i
// genomgången. Rena funktioner, ingen databas.

import { describe, expect, it } from 'vitest'
import { deduktivUrval, giltigtSvar, punkterFor, raknaResultat, valjDelar } from '../motor.server'
import { ovningsformat, ovningsformatUrNyckel, provradTexter } from '../format'
import { hittaDeduktivFraga, genomgaDeduktiv } from '@/lib/deduktivV1/fragor.server'
import { poolFor } from '@/lib/deduktivV1/select'

describe('deduktivens övningsprov', () => {
  it('SHL: 12 uppgifter på 18 minuter, övriga vårt format 16 på 20', () => {
    const shl = ovningsformat('deduktiv', 'shl')
    expect([shl.nyckel, shl.antal, shl.minuter, shl.namn]).toEqual(['deduktiv_shl', 12, 18, 'SHL Verify deduktiv'])
    const eget = ovningsformat('deduktiv', null)
    expect([eget.nyckel, eget.antal, eget.minuter, eget.namn, eget.okandLeverantor]).toEqual(['deduktiv_eget', 16, 20, null, true])
    expect(ovningsformat('deduktiv', 'aon').anmarkning).toMatch(/rutnät med symboler/)
    expect(ovningsformatUrNyckel('deduktiv', 'deduktiv_shl').antal).toBe(12)
    expect(provradTexter(shl, false).rad).toBe('Samma format som SHL Verify deduktiv: 12 uppgifter på 18 minuter.')
  })

  it('urvalet: en fjärdedel grund, sedan avancerad, expert sist, bara version 2', () => {
    expect(deduktivUrval(12)).toEqual({ grund: 3, avancerad: 5, expert: 4 })
    expect(deduktivUrval(16)).toEqual({ grund: 4, avancerad: 7, expert: 5 })
    const delar = valjDelar('deduktiv', 'seed-d', new Set(), 1, 16)
    expect(delar).toHaveLength(16)
    expect(new Set(delar).size).toBe(16)
    const niva = delar.map((id) => hittaDeduktivFraga(id)!.niva)
    expect(niva).toEqual([...Array(4).fill('grund'), ...Array(7).fill('avancerad'), ...Array(5).fill('expert')])
    const aktiva = new Set([...poolFor('grund', 2), ...poolFor('avancerad', 2), ...poolFor('expert', 2)].map((q) => q.id))
    expect(delar.every((id) => aktiva.has(id))).toBe(true)
    expect(punkterFor('deduktiv', delar)).toHaveLength(16)
  })

  it('rättningen och genomgången med lösningen och misstaget', () => {
    const delar = valjDelar('deduktiv', 'seed-e', new Set(), 1, 12)
    const p = punkterFor('deduktiv', delar)
    const seed = 'sess-1'
    const q0 = hittaDeduktivFraga(delar[0])!
    const ratt = genomgaDeduktiv(q0, seed, true).rattVisat
    const q1 = hittaDeduktivFraga(delar[1])!
    const fel1 = (genomgaDeduktiv(q1, seed, true).rattVisat + 1) % q1.options.length
    expect(giltigtSvar('deduktiv', p[0], String(ratt))).toBe(true)
    expect(giltigtSvar('deduktiv', p[0], '9')).toBe(false)
    const { resultat, genomgang } = raknaResultat({
      typ: 'deduktiv',
      meta: { delar, tidsgrans_s: 1080, del_budget_s: 90, seed },
      svar: [
        { nyckel: p[0].nyckel, svar: String(ratt), tid: 60 },
        { nyckel: p[1].nyckel, svar: String(fel1), tid: 80 },
      ],
      startad: '2026-11-09T10:00:00Z',
      avslutad: '2026-11-09T10:05:00Z',
    })
    expect(resultat.antal).toBe(12)
    expect(resultat.ratt).toBe(1)
    expect(resultat.obesvarade).toBe(10)
    expect(genomgang[0].korrekt).toBe(true)
    expect(genomgang[1].korrekt).toBe(false)
    expect(genomgang[1].losning?.steg.length).toBeGreaterThan(0)
    expect(genomgang[1].misstag).toBeTruthy()
    expect(resultat.tappade.length).toBeGreaterThan(0)
  })
})
