import { describe, expect, it } from 'vitest'
import { MARGINAL_MS, NYARE_MS, valjKalla, valjPoolKalla, valjVidLasfel, type SammanfattningMeta } from '../kalla'

const CV = 'cv-1'
const NYCKEL = 'profil-a'
const KORNING = Date.parse('2026-11-21T11:32:44Z')

function samm(tid: number, over: Partial<SammanfattningMeta> = {}): SammanfattningMeta {
  return { cv_id: CV, filter_hash: '', prefs_nyckel: NYCKEL, korning_at: new Date(tid).toISOString(), ...over }
}

describe('valjKalla, läget hel (Matchade jobb)', () => {
  it('aktuell sammanfattning: ingen läsning av körningen', () => {
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: NYCKEL, samm: samm(KORNING + 10_000), korningTid: KORNING })).toEqual({ kalla: 'sammanfattning', aktuell: true })
  })

  it('sammanfattningen inom marginalen före körningen räknas som samma körning', () => {
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: NYCKEL, samm: samm(KORNING - MARGINAL_MS + 1000), korningTid: KORNING }).kalla).toBe('sammanfattning')
  })

  it('sammanfattningen är äldre än körningen: läs körningen', () => {
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: NYCKEL, samm: samm(KORNING - MARGINAL_MS - 1000), korningTid: KORNING })).toEqual({ kalla: 'korning' })
  })

  it('ändrad sökprofil, sammanfattningen från samma körning: läs körningen', () => {
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: 'profil-b', samm: samm(KORNING + 20_000), korningTid: KORNING })).toEqual({ kalla: 'korning' })
  })

  it('ändrad sökprofil, sammanfattningen nyare än körningen (sparningen föll): räkna om ur sammanfattningen', () => {
    const nyare = KORNING + 2.5 * 60 * 60 * 1000
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: 'profil-b', samm: samm(nyare), korningTid: KORNING })).toEqual({ kalla: 'sammanfattning', aktuell: false })
  })

  it('gränsen för nyare ligger på NYARE_MS', () => {
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: 'profil-b', samm: samm(KORNING + NYARE_MS), korningTid: KORNING }).kalla).toBe('korning')
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: 'profil-b', samm: samm(KORNING + NYARE_MS + 1), korningTid: KORNING }).kalla).toBe('sammanfattning')
  })

  it('sammanfattning för ett annat CV räknas inte', () => {
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: NYCKEL, samm: samm(KORNING, { cv_id: 'cv-2' }), korningTid: KORNING })).toEqual({ kalla: 'korning' })
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: NYCKEL, samm: samm(KORNING, { cv_id: 'cv-2' }), korningTid: null })).toEqual({ kalla: 'ingen' })
  })

  it('sammanfattning med filter räknas inte', () => {
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: NYCKEL, samm: samm(KORNING, { filter_hash: 'abc' }), korningTid: null })).toEqual({ kalla: 'ingen' })
  })

  it('ingen körning i cachen men en sammanfattning: den gäller', () => {
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: NYCKEL, samm: samm(KORNING), korningTid: null })).toEqual({ kalla: 'sammanfattning', aktuell: true })
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: 'profil-b', samm: samm(KORNING), korningTid: null })).toEqual({ kalla: 'sammanfattning', aktuell: false })
  })

  it('varken körning eller sammanfattning: ingen', () => {
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: NYCKEL, samm: null, korningTid: null })).toEqual({ kalla: 'ingen' })
  })

  it('körningens tid gick inte att läsa: sammanfattningen om den finns, annars läsfel (inte ingen)', () => {
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: 'profil-b', samm: samm(KORNING), korningTid: null, metaFel: true })).toEqual({ kalla: 'sammanfattning', aktuell: false })
    expect(valjKalla({ lage: 'hel', cvId: CV, nyckel: NYCKEL, samm: null, korningTid: null, metaFel: true })).toEqual({ kalla: 'lasfel' })
  })
})

describe('valjKalla, läget liten (Översikt, Dina brev, Skriv brev)', () => {
  it('läser aldrig körningen, inte ens när sammanfattningen är äldre eller räknad med en annan sökprofil', () => {
    const fall = [
      { samm: samm(KORNING - 10 * MARGINAL_MS), nyckel: NYCKEL },
      { samm: samm(KORNING), nyckel: 'profil-b' },
    ]
    for (const f of fall) {
      const val = valjKalla({ lage: 'liten', cvId: CV, nyckel: f.nyckel, samm: f.samm, korningTid: KORNING })
      expect(val.kalla).toBe('sammanfattning')
    }
  })

  it('utan sammanfattning för CV:t: ingen (samma tomma läge som förut)', () => {
    expect(valjKalla({ lage: 'liten', cvId: CV, nyckel: NYCKEL, samm: null, korningTid: KORNING })).toEqual({ kalla: 'ingen' })
    expect(valjKalla({ lage: 'liten', cvId: CV, nyckel: NYCKEL, samm: samm(KORNING, { cv_id: 'cv-2' }), korningTid: KORNING })).toEqual({ kalla: 'ingen' })
  })
})

describe('valjVidLasfel', () => {
  it('visar sammanfattningen även med äldre sökprofil, annars läsfel', () => {
    expect(valjVidLasfel(samm(KORNING, { prefs_nyckel: 'gammal' }), CV)).toEqual({ kalla: 'sammanfattning', aktuell: false })
    expect(valjVidLasfel(null, CV)).toEqual({ kalla: 'lasfel' })
    expect(valjVidLasfel(samm(KORNING, { korning_at: 'inte en tid' }), CV)).toEqual({ kalla: 'lasfel' })
  })
})

describe('valjPoolKalla', () => {
  it('hela körningen när den finns och sammanfattningen inte är nyare', () => {
    expect(valjPoolKalla({ samm: samm(KORNING + 5000), cvId: CV, korningTid: KORNING })).toBe('korning')
  })
  it('sammanfattningen när den är nyare än körningen', () => {
    expect(valjPoolKalla({ samm: samm(KORNING + 60 * 60 * 1000), cvId: CV, korningTid: KORNING })).toBe('sammanfattning')
  })
  it('utan körning eller vid läsfel: sammanfattningen om den finns, annars ingen', () => {
    expect(valjPoolKalla({ samm: samm(KORNING), cvId: CV, korningTid: null })).toBe('sammanfattning')
    expect(valjPoolKalla({ samm: null, cvId: CV, korningTid: KORNING, metaFel: true })).toBe('ingen')
    expect(valjPoolKalla({ samm: null, cvId: CV, korningTid: null })).toBe('ingen')
  })
})
