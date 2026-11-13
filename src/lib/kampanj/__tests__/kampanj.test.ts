import { describe, expect, it } from 'vitest'
import {
  aktivKampanj,
  arStartdag,
  harBetalat,
  kampanjSkript,
  kampanjerKvar,
  KAMPANJ_BY_NYCKEL,
} from '../kampanj'
import { samtyckeVidKop, KOPSTEG } from '@/components/pricing/paket-copy'

const t = (iso: string) => new Date(iso)

describe('aktivKampanj, gränserna på sekunden', () => {
  it('ingen kampanj söndag 22 november 23.59.59', () => {
    expect(aktivKampanj(t('2026-11-22T23:59:59+01:00'))).toBeNull()
  })
  it('Black Week från måndag 23 november 00.00.00', () => {
    expect(aktivKampanj(t('2026-11-23T00:00:00+01:00'))?.nyckel).toBe('black-week-2026')
  })
  it('Black Week fredag', () => {
    expect(aktivKampanj(t('2026-11-27T12:00:00+01:00'))?.nyckel).toBe('black-week-2026')
  })
  it('Black Week till söndag 29 november 23.59.59', () => {
    expect(aktivKampanj(t('2026-11-29T23:59:59+01:00'))?.nyckel).toBe('black-week-2026')
  })
  it('Cyber Monday från måndag 30 november 00.00.00', () => {
    expect(aktivKampanj(t('2026-11-30T00:00:00+01:00'))?.nyckel).toBe('cyber-monday-2026')
  })
  it('Cyber Monday till 23.59.59', () => {
    expect(aktivKampanj(t('2026-11-30T23:59:59+01:00'))?.nyckel).toBe('cyber-monday-2026')
  })
  it('ingen kampanj tisdag 1 december 00.00.00', () => {
    expect(aktivKampanj(t('2026-12-01T00:00:00+01:00'))).toBeNull()
  })
  it('UTC-tid räknas rätt: 22 nov 23.00 UTC är 23 nov 00.00 svensk tid', () => {
    expect(aktivKampanj(t('2026-11-22T23:00:00Z'))?.nyckel).toBe('black-week-2026')
    expect(aktivKampanj(t('2026-11-22T22:59:59Z'))).toBeNull()
  })
})

describe('kampanjerKvar och skriptet', () => {
  it('båda kvar före start, ingen efter slut', () => {
    expect(kampanjerKvar(t('2026-11-13T12:00:00+01:00'))).toHaveLength(2)
    expect(kampanjerKvar(t('2026-11-30T12:00:00+01:00'))).toHaveLength(1)
    expect(kampanjerKvar(t('2026-12-01T00:00:00+01:00'))).toHaveLength(0)
  })
  it('skriptet är tomt efter sista kampanjen', () => {
    expect(kampanjSkript(t('2026-12-01T00:00:00+01:00'))).toBe('')
    expect(kampanjSkript(t('2026-11-13T12:00:00+01:00'))).toContain('data-kampanj')
  })
})

describe('arStartdag, mejlens dag', () => {
  const bw = KAMPANJ_BY_NYCKEL['black-week-2026']
  const cm = KAMPANJ_BY_NYCKEL['cyber-monday-2026']
  it('morgonkörningen 23 november 06.00 UTC skickar Black Week', () => {
    expect(arStartdag(bw, t('2026-11-23T06:00:00Z'))).toBe(true)
    expect(arStartdag(cm, t('2026-11-23T06:00:00Z'))).toBe(false)
  })
  it('inte dagen efter', () => {
    expect(arStartdag(bw, t('2026-11-24T06:00:00Z'))).toBe(false)
  })
  it('30 november skickar Cyber Monday, inte Black Week', () => {
    expect(arStartdag(cm, t('2026-11-30T06:00:00Z'))).toBe(true)
    expect(arStartdag(bw, t('2026-11-30T06:00:00Z'))).toBe(false)
  })
})

describe('harBetalat', () => {
  it('gratiskonto och gammal trial har inte betalat', () => {
    expect(harBetalat({})).toBe(false)
    expect(harBetalat({ premium_source: 'signup_trial' })).toBe(false)
    expect(harBetalat(null)).toBe(false)
  })
  it('prenumeration, uppsagd prenumeration och Dagspasset har betalat', () => {
    expect(harBetalat({ subscription_id: 'sub_1' })).toBe(true)
    expect(harBetalat({ subscription_status: 'canceled' })).toBe(true)
    expect(harBetalat({ premium_source: 'onetime_1d' })).toBe(true)
    expect(harBetalat({ paket_started_at: '2026-10-01T00:00:00Z' })).toBe(true)
  })
})

describe('samtycket och knappen med kampanj', () => {
  const bw = KAMPANJ_BY_NYCKEL['black-week-2026']
  it('säger både 99 kr i dag och 149 kr sedan', () => {
    const text = samtyckeVidKop('all_month', t('2026-11-23T10:00:00+01:00'), bw)
    expect(text).toContain('99 kr dras i dag, sedan 149 kr varje månad på samma datum, nästa gång 23 december,')
    expect(text).toContain('ångerrätten därmed inte gäller')
  })
  it('utan kampanj som förut', () => {
    expect(samtyckeVidKop('all_month', t('2026-11-13T10:00:00+01:00'))).toContain('149 kr dras varje månad')
  })
  it('knappen visar kampanjpriset', () => {
    expect(KOPSTEG.primar('all_month', bw)).toBe('Till betalning, 99 kr')
    expect(KOPSTEG.primar('all_month')).toBe('Till betalning, 149 kr')
  })
})
