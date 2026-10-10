import { describe, it, expect } from 'vitest'
import { unikaSvar, SVARSNYCKLAR } from '../sparaSvar'

describe('unikaSvar', () => {
  it('behåller det sist sparade svaret per fråga', () => {
    const svar = [
      { q_id: 'a', selected: 1 },
      { q_id: 'b', selected: 2 },
      { q_id: 'a', selected: 3 },
    ]
    expect(unikaSvar(svar, SVARSNYCKLAR.matris)).toEqual([
      { q_id: 'b', selected: 2 },
      { q_id: 'a', selected: 3 },
    ])
  })

  it('jämför nycklar som text, så "0" och 0 är samma påstående', () => {
    const svar = [
      { passageId: 'p1', statementIndex: 0, answer: 'true' },
      { passageId: 'p1', statementIndex: '0', answer: 'false' },
      { passageId: 'p1', statementIndex: 1, answer: 'true' },
      { passageId: 'p2', statementIndex: 0, answer: 'true' },
    ]
    const ut = unikaSvar(svar, SVARSNYCKLAR.verbalPastaende)
    expect(ut).toHaveLength(3)
    expect(ut.find((a) => a.passageId === 'p1' && String(a.statementIndex) === '0')?.answer).toBe('false')
  })

  it('tål null och annat än en lista', () => {
    expect(unikaSvar(null, SVARSNYCKLAR.matris)).toEqual([])
    expect(unikaSvar(undefined, SVARSNYCKLAR.personlighet)).toEqual([])
  })
})
