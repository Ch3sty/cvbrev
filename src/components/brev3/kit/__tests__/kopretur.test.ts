import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { KOPRETUR_INTERVALL_MS, KOPRETUR_MAX_FORSOK, skapaKopretur, type KopreturIn, type KopreturLage } from '../kopretur'

function upplagg() {
  const lagen: KopreturLage[] = []
  const ut = {
    refresh: vi.fn(),
    laddaNer: vi.fn(),
    stadaAdress: vi.fn(),
    nyttLage: vi.fn((l: KopreturLage) => lagen.push(l)),
  }
  return { ut, lagen, k: skapaKopretur(ut) }
}

const retur = (andring: Partial<KopreturIn> = {}): KopreturIn => ({
  begart: 'pdf',
  kopRetur: true,
  kanLaddaNer: false,
  formatFinns: true,
  ...andring,
})

describe('köpreturen i brevrummet', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('tillgång direkt: en nedladdning, inga omhämtningar', () => {
    const { ut, k, lagen } = upplagg()
    k.uppdatera(retur({ kanLaddaNer: true }))
    k.uppdatera(retur({ kanLaddaNer: true }))
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS * 10)
    expect(ut.laddaNer).toHaveBeenCalledTimes(1)
    expect(ut.laddaNer).toHaveBeenCalledWith('pdf')
    expect(ut.refresh).not.toHaveBeenCalled()
    expect(ut.stadaAdress).toHaveBeenCalledTimes(1)
    expect(lagen).toEqual(['klar'])
  })

  it('tillgång efter andra omhämtningen: 2,5 s mellanrum, sedan exakt en nedladdning och städad adress', () => {
    const { ut, k, lagen } = upplagg()
    k.uppdatera(retur())
    expect(lagen).toEqual(['vantar'])
    expect(ut.stadaAdress).not.toHaveBeenCalled()

    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS - 1)
    expect(ut.refresh).toHaveBeenCalledTimes(0)
    vi.advanceTimersByTime(1)
    expect(ut.refresh).toHaveBeenCalledTimes(1)
    k.uppdatera(retur()) // första omhämtningen: fortfarande gratis
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS)
    expect(ut.refresh).toHaveBeenCalledTimes(2)
    expect(ut.laddaNer).not.toHaveBeenCalled()

    k.uppdatera(retur({ kanLaddaNer: true })) // andra omhämtningen: webhooken har landat
    k.uppdatera(retur({ kanLaddaNer: true })) // en ny rendering med samma props
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS * 10)

    expect(ut.refresh).toHaveBeenCalledTimes(2)
    expect(ut.laddaNer).toHaveBeenCalledTimes(1)
    expect(ut.stadaAdress).toHaveBeenCalledTimes(1)
    expect(lagen).toEqual(['vantar', 'klar'])
  })

  it('aldrig tillgång: sex omhämtningar, ingen nedladdning, raden visas, adressen städad', () => {
    const { ut, k, lagen } = upplagg()
    k.uppdatera(retur())
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS * 20)
    expect(ut.refresh).toHaveBeenCalledTimes(KOPRETUR_MAX_FORSOK)
    expect(KOPRETUR_MAX_FORSOK).toBe(6)
    expect(ut.laddaNer).not.toHaveBeenCalled()
    expect(ut.stadaAdress).toHaveBeenCalledTimes(1)
    expect(lagen).toEqual(['vantar', 'ej-registrerat'])

    // Kommer tillgången senare i samma vy laddas inget ner av sig själv.
    k.uppdatera(retur({ kanLaddaNer: true }))
    expect(ut.laddaNer).not.toHaveBeenCalled()
  })

  it('ladda=1 utan premium_activated och utan tillgång: ingen väntan, adressen städas', () => {
    const { ut, k, lagen } = upplagg()
    k.uppdatera(retur({ kopRetur: false }))
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS * 10)
    expect(ut.refresh).not.toHaveBeenCalled()
    expect(ut.laddaNer).not.toHaveBeenCalled()
    expect(ut.stadaAdress).toHaveBeenCalledTimes(1)
    expect(lagen).toEqual(['klar'])
  })

  it('avmontering mitt i väntan: inga fler omhämtningar', () => {
    const { ut, k } = upplagg()
    k.uppdatera(retur())
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS)
    expect(ut.refresh).toHaveBeenCalledTimes(1)
    k.stang()
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS * 20)
    expect(ut.refresh).toHaveBeenCalledTimes(1)
    expect(ut.laddaNer).not.toHaveBeenCalled()
  })

  it('Word begärt för en mall utan Word: ingen nedladdning', () => {
    const { ut, k } = upplagg()
    k.uppdatera(retur({ begart: 'docx', kanLaddaNer: true, formatFinns: false }))
    expect(ut.laddaNer).not.toHaveBeenCalled()
    expect(ut.stadaAdress).toHaveBeenCalledTimes(1)
  })

  it('utan begärd fil händer ingenting', () => {
    const { ut, k } = upplagg()
    k.uppdatera(retur({ begart: null }))
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS * 10)
    expect(ut.refresh).not.toHaveBeenCalled()
    expect(ut.stadaAdress).not.toHaveBeenCalled()
    expect(ut.nyttLage).not.toHaveBeenCalled()
  })
})
