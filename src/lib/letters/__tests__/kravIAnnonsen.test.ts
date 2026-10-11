import { describe, expect, it } from 'vitest'
import { kravIAnnonsen, kravTraffar } from '../kravIAnnonsen'

const annons =
  'Vi söker en utvecklare med erfarenhet av React och TypeScript. Du har jobbat med AWS, Docker och SQL i agila team. react är ett plus.'

describe('kraven i annonsen', () => {
  it('läser ut kraven en gång var, i ordning', () => {
    expect(kravIAnnonsen(annons)).toEqual(['React', 'TypeScript', 'AWS', 'Docker', 'SQL'])
  })

  it('kort annons ger inga krav', () => {
    expect(kravIAnnonsen('React')).toEqual([])
    expect(kravIAnnonsen(null)).toEqual([])
  })

  it('svenska former räknas: agila team möter Agile', () => {
    expect(kravTraffar(['Agile', 'Scrum'], 'Jag har lett agila team.')).toEqual({ moter: ['Agile'], saknas: ['Scrum'] })
  })

  it('träffar är ord som står i brevet, inte delar av ord', () => {
    const brev = '<p>Jag har byggt i <b>React</b> och TypeScript, och driftat på AWS.</p><p>SQLite har jag också använt.</p>'
    expect(kravTraffar(['React', 'TypeScript', 'AWS', 'Docker', 'SQL'], brev)).toEqual({
      moter: ['React', 'TypeScript', 'AWS'],
      saknas: ['Docker', 'SQL'],
    })
  })
})
