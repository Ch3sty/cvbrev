import { describe, expect, it } from 'vitest'
import type { CVMetadata } from '@/lib/cv/cv-metadata'
import { lastUrCv } from '../provaCv'

describe('lastUrCv', () => {
  it('visar roller, kompetenser, utbildning och ort ur CV:t, utan dubbletter', () => {
    const cv: CVMetadata = {
      personalInfo: { fullName: 'Sara Lindström', email: '', location: 'Göteborg' },
      experience: [
        { position: 'Projektledare', company: 'A', startDate: '2021', description: [] },
        { position: 'Projektledare', company: 'B', startDate: '2019', description: [] },
        { position: 'Biträdande projektledare', company: 'C', startDate: '2018', description: [] },
      ],
      education: [{ degree: 'Civilingenjör, industriell ekonomi', institution: 'Chalmers' }],
      skills: [
        { category: 'Ledning', skills: ['projektledning', 'LOU', 'budgetansvar'] },
        { category: 'Övrigt', skills: [], name: 'AMA' },
      ],
    }
    expect(lastUrCv(cv)).toEqual({
      roller: ['Projektledare', 'Biträdande projektledare'],
      kompetenser: ['projektledning', 'LOU', 'budgetansvar', 'AMA'],
      ort: 'Göteborg',
      utbildning: 'Civilingenjör, industriell ekonomi',
    })
  })

  it('klarar ett tomt CV', () => {
    expect(lastUrCv({ personalInfo: { fullName: '', email: '' }, experience: [], education: [], skills: [] })).toEqual({
      roller: [],
      kompetenser: [],
      ort: null,
      utbildning: null,
    })
  })
})
