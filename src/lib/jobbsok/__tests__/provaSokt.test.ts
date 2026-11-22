import { describe, expect, it } from 'vitest'
import { kontrolleraSokt, soktRedirect, soktTillRutt } from '../provaSokt'

const bas = { lage: 'sokt' as const, tjanst: ' Projektledare ', arbetsgivare: 'Dalvik  Anläggning', datum: '2026-11-10', kanal: 'ad' as const }

describe('provaSokt', () => {
  it('kräver tjänst, arbetsgivare och ett sökt datum som inte ligger i framtiden', () => {
    expect(kontrolleraSokt(bas, '2026-11-22')).toBeNull()
    expect(kontrolleraSokt({ ...bas, tjanst: '  ' }, '2026-11-22')).toBe('tjanst')
    expect(kontrolleraSokt({ ...bas, arbetsgivare: '' }, '2026-11-22')).toBe('arbetsgivare')
    expect(kontrolleraSokt({ ...bas, datum: '2026-11-23' }, '2026-11-22')).toBe('datum')
    expect(kontrolleraSokt({ ...bas, datum: '' }, '2026-11-22')).toBe('datum')
  })

  it('Ska sökas klarar sig utan sista ansökningsdag men inte med ett trasigt datum', () => {
    expect(kontrolleraSokt({ ...bas, lage: 'ska-soka', datum: '' }, '2026-11-22')).toBeNull()
    expect(kontrolleraSokt({ ...bas, lage: 'ska-soka', datum: '2026-13-40' }, '2026-11-22')).toBe('datum')
  })

  it('sökt går till kontots rutt för sökta tjänster med kanal och datum', () => {
    expect(soktTillRutt(bas)).toEqual({
      url: '/api/applications',
      body: { job_title: 'Projektledare', company: 'Dalvik Anläggning', applied_at: '2026-11-10', application_channel: 'ad' },
    })
  })

  it('ska söka går till Ska sökas med sista ansökningsdag', () => {
    expect(soktTillRutt({ ...bas, lage: 'ska-soka', datum: '2026-12-01' })).toEqual({
      url: '/api/jobbsok/ska-sokas',
      body: { job_title: 'Projektledare', company: 'Dalvik Anläggning', last_application_date: '2026-12-01', source: 'egen' },
    })
  })

  it('redirecten öppnar arket förifyllt i kontot', () => {
    const href = soktRedirect(bas)
    expect(href.startsWith('/dashboard/sokta-tjanster?')).toBe(true)
    const q = new URLSearchParams(href.split('?')[1])
    expect(q.get('logga')).toBe('1')
    expect(q.get('tjanst')).toBe('Projektledare')
    expect(q.get('arbetsgivare')).toBe('Dalvik Anläggning')
    const ska = new URLSearchParams(soktRedirect({ ...bas, lage: 'ska-soka', datum: '2026-12-01' }).split('?')[1])
    expect(ska.get('logga')).toBe('ska-soka')
    expect(ska.get('sista')).toBe('2026-12-01')
  })
})
