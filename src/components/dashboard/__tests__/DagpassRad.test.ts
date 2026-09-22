// Sluttidsraden för Allt-dagen (avsnitt 6, B3:s öppna beslut 12).
//
// Raden ska säga när dygnet tar slut, i svensk tid, och skilja på i dag och
// i morgon. Den ska aldrig kasta på ett trasigt datum: hemskärmen får inte
// gå sönder för att en grant-rad bär skräp.

import { describe, it, expect } from 'vitest'
import { dagpassText } from '../DagpassRad'

describe('dagpassText', () => {
  it('säger "i dag" när dygnet tar slut samma dag', () => {
    // 2026-09-22 09:00 svensk tid, slut 21:40 samma kväll.
    const nu = new Date('2026-09-22T07:00:00Z')
    const slut = '2026-09-22T19:40:00Z'

    expect(dagpassText(slut, nu)).toContain('i dag')
  })

  it('säger "i morgon" när dygnet sträcker sig över midnatt', () => {
    const nu = new Date('2026-09-22T19:00:00Z')
    const slut = '2026-09-23T07:15:00Z'

    expect(dagpassText(slut, nu)).toContain('i morgon')
  })

  it('namnger paketet i bestämd form', () => {
    const text = dagpassText('2026-09-22T19:40:00Z', new Date('2026-09-22T07:00:00Z'))
    expect(text).toContain('Allt-dagen')
  })

  it('kastar inte på ett trasigt datum', () => {
    expect(() => dagpassText('inte-ett-datum')).not.toThrow()
    expect(dagpassText('inte-ett-datum')).toContain('Allt-dagen')
  })

  it('skriver tiden med timme och minut, aldrig en nedräkning', () => {
    const text = dagpassText('2026-09-22T19:40:00Z', new Date('2026-09-22T07:00:00Z'))
    expect(text).toMatch(/\d{2}:\d{2}/)
    expect(text).not.toMatch(/kvar|timmar kvar|minuter/)
  })
})
