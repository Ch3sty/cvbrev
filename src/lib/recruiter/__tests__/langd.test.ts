/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'
import { durationText, deriveSeniority } from '../candidateData'

// Före kandidatens ja visas anställningens längd i ord, aldrig datumen.
const NU = Date.parse('2026-11-22T12:00:00Z')

describe('anställningens längd', () => {
  it('räknar med månaden när den står i perioden', () => {
    expect(durationText({ period: '2015-01 till 2019-02' }, NU)).toBe('4 år')
    expect(durationText({ period: '2019-03 till nu' }, NU)).toBe('8 år')
    expect(durationText({ startDate: '2026-05', endDate: '' }, NU)).toBe('Under ett år')
  })

  it('klarar perioder med bara år', () => {
    expect(durationText({ period: '2019–2023' }, NU)).toBe('5 år')
  })

  it('ger null utan tolkbar period', () => {
    expect(durationText({ period: 'Sommarjobb' }, NU)).toBeNull()
  })

  it('senioriteten räknar med samma perioder', () => {
    const s = deriveSeniority(
      { roles: [{ title: 'Projektledare', period: '2019-03 till nu' }, { title: 'Arbetsledare', period: '2015-01 till 2019-02' }] },
      NU
    )
    expect(s.yearsOfExperience).toBe(12)
    expect(s.latestRole).toEqual({ title: 'Projektledare', years: 8 })
  })
})

describe('längden för rekryteraren före ja (QA live 2026-11-22)', () => {
  it('hela år avrundat nedåt, och under ett år blir "Under 1 år"', async () => {
    const { durationMonths } = await import('../candidateData')
    const { langderForeJa } = await import('../recruiterView')
    const rader = [
      { durationMonths: durationMonths({ period: '2018-04 till nu' }, NU) },
      { durationMonths: durationMonths({ period: '2013-08 till 2018-03' }, NU) },
      { durationMonths: durationMonths({ startDate: '2026-05', endDate: '' }, NU) },
    ]
    expect(langderForeJa(rader, 13)).toEqual(['8 år', '4 år', 'Under 1 år'])
  })

  it('summan av det som visas går aldrig över den totala erfarenheten', async () => {
    const { langderForeJa } = await import('../recruiterView')
    // Två parallella anställningar om fem år var, sex års erfarenhet totalt.
    expect(langderForeJa([{ durationMonths: 60 }, { durationMonths: 60 }, { durationMonths: 30 }], 6)).toEqual(['5 år', '1 år', null])
    expect(langderForeJa([{ durationMonths: 103 }, { durationMonths: 55 }], 13)).toEqual(['8 år', '4 år'])
  })

  it('utan månader står den gamla texten kvar', async () => {
    const { langderForeJa } = await import('../recruiterView')
    expect(langderForeJa([{ duration: '3 år' }], null)).toEqual(['3 år'])
  })

  it('detaljprofilen före ja bär de nedavrundade längderna, efter ja perioderna', async () => {
    const { toRecruiterDetail } = await import('../recruiterView')
    const detalj: any = {
      role: 'Projektledare', skills: [], regions: [], workplace: [], extent: [], testBadges: [], personalityStrengths: [],
      visibility: 'anonymous', yearsOfExperience: 13, latestRole: null, historyTitles: [], contextTags: [],
      experience: [
        { position: 'Projektledare', company: 'X', period: '2018-04 till nu', description: null, duration: '9 år', durationMonths: 103 },
        { position: 'Arbetsledare', company: 'Y', period: '2013-08 till 2018-03', description: null, duration: '5 år', durationMonths: 55 },
      ],
      education: [], testResults: [], languages: [],
    }
    const fore = toRecruiterDetail(detalj, 'id', { contactUnlocked: false, emailUnlocked: false } as any)
    expect(fore.experience.map((e) => e.period)).toEqual(['8 år', '4 år'])
    const efter = toRecruiterDetail(detalj, 'id', { contactUnlocked: true, emailUnlocked: true } as any)
    expect(efter.experience.map((e) => e.period)).toEqual(['2018-04 till nu', '2013-08 till 2018-03'])
  })
})
