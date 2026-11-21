/**
 * Granska-steget: etiketten Kvantifierat står bara när rollen har ett
 * riktigt tal efter förslaget. [antal] är inget tal (poängmodellens regel)
 * och får etiketten "Har [antal] kvar" i stället.
 */
import { describe, expect, it } from 'vitest'
import { siffrorIRoll } from '../components/review/ChangeLogList'

describe('siffrorIRoll', () => {
  it('bara [antal] kvar: inte kvantifierat, platshållare kvar', () => {
    const t = '• Ökade försäljningen med [antal] procent\n• Ansvarade för [antal] kunder'
    expect(siffrorIRoll(t, true)).toEqual({ kvantifierat: false, platshallareKvar: true })
  })

  it('ett riktigt tal: kvantifierat', () => {
    const t = '• Ökade försäljningen med 12 procent\n• Ledde ett team'
    expect(siffrorIRoll(t, true)).toEqual({ kvantifierat: true, platshallareKvar: false })
  })

  it('[antal] ifyllt av henne: kvantifierat och inget kvar', () => {
    const t = '• Ansvarade för 40 kunder'
    expect(siffrorIRoll(t, true)).toEqual({ kvantifierat: true, platshallareKvar: false })
  })

  it('tal i en rad och [antal] i en annan: båda etiketterna', () => {
    const t = '- Ansvarade för 40 kunder\n- Kortade ledtiden med [antal] dagar'
    expect(siffrorIRoll(t, true)).toEqual({ kvantifierat: true, platshallareKvar: true })
  })

  it('ett tal i samma rad som [antal] räknas inte än', () => {
    const t = '• Ledde 3 team och ökade försäljningen med [antal] procent'
    expect(siffrorIRoll(t, true)).toEqual({ kvantifierat: false, platshallareKvar: true })
  })

  it('ett årtal är inget tal', () => {
    expect(siffrorIRoll('• Införde nytt system 2021', true).kvantifierat).toBe(false)
  })

  it('rollen hade redan siffror: ingen Kvantifierat-etikett', () => {
    expect(siffrorIRoll('• Ansvarade för 40 kunder', false).kvantifierat).toBe(false)
  })
})
