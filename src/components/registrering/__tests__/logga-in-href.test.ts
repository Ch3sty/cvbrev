/**
 * Logga in från ett smakprov (2026-11-21): länken bär smakprovets token till
 * valkommen-sidan (/dashboard/valkommen?test=<token>), så att provet hämtas
 * också för ett befintligt konto utan cookien jc_signup. Bara den fasta
 * sökvägen och en token i rätt format; aldrig en annan värd.
 */

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: {} }) }))

import { loggaInHref } from '@/components/registrering/RegisterKontoSteg'
import { smakprovUrParams } from '@/components/registrering/intent'

const TOKEN = '11111111-2222-4333-8444-555555555555'

function redirectUr(href: string): string | null {
  return new URL(href, 'https://www.jobbcoach.ai').searchParams.get('redirect')
}

describe('loggaInHref med smakprov', () => {
  it('testprovet: redirect till valkommen med token, kodad så att ?test= överlever', () => {
    const href = loggaInHref({ intent: null, smakprov: { typ: 'test', token: TOKEN } })
    expect(href).toBe(`/login?redirect=${encodeURIComponent(`/dashboard/valkommen?test=${TOKEN}`)}`)
    const r = redirectUr(href)!
    expect(r).toBe(`/dashboard/valkommen?test=${TOKEN}`)
    // Valkommen-sidan läser samma token ur sin adress.
    const p = new URL(r, 'https://www.jobbcoach.ai').searchParams
    expect(smakprovUrParams((n) => p.get(n))).toEqual({ typ: 'test', token: TOKEN })
  })

  it('personlighetsprovet på samma sätt', () => {
    expect(redirectUr(loggaInHref({ intent: null, smakprov: { typ: 'personlighet', token: TOKEN } }))).toBe(`/dashboard/valkommen?personlighet=${TOKEN}`)
  })

  it('en token i fel format följer inte med: bara den fasta sökvägen', () => {
    for (const ond of ['https://evil.example', '//evil.example', `${TOKEN}&redirect=//evil.example`, '../x']) {
      expect(redirectUr(loggaInHref({ intent: null, smakprov: { typ: 'personlighet', token: ond } }))).toBe('/dashboard/valkommen')
    }
  })

  it('redirecten är alltid en relativ sökväg inom sajten', () => {
    const r = redirectUr(loggaInHref({ intent: null, smakprov: { typ: 'test', token: TOKEN } }))!
    expect(r.startsWith('/dashboard/valkommen?')).toBe(true)
    expect(new URL(r, 'https://www.jobbcoach.ai').host).toBe('www.jobbcoach.ai')
  })

  it('utan smakprov oförändrat: redirect, paket, valet eller bara /login', () => {
    expect(loggaInHref({ intent: null })).toBe('/login')
    expect(redirectUr(loggaInHref({ intent: null, redirect: '/dashboard/cv' }))).toBe('/dashboard/cv')
    expect(loggaInHref({ intent: 'cv' })).toBe('/login?borja=cv')
  })
})
