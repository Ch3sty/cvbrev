import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { KOPRETUR_INTERVALL_MS, KOPRETUR_MAX_FORSOK, skapaKopretur, type KopreturLage } from '@/components/brev3/kit/kopretur'
import { behallKopreturParametrar, cvHarTillgang, cvKopreturIn, utanKopretur, type CvKopreturLage } from '../kopretur'

/** Köparen av Premium för en premiummall, tillbaka från kassan innan webhooken landat. */
const lage = (andring: Partial<CvKopreturLage> = {}): CvKopreturLage => ({
  ladda: true,
  kopRetur: true,
  redo: true,
  mallHarWord: true,
  premiumMall: true,
  isPremium: false,
  harWord: false,
  gratisAnvand: false,
  format: 'pdf',
  ...andring,
})

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

describe('köpreturen i CV-rummets Mallar', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('premiummall, webhooken landar efter andra omhämtningen: exakt en nedladdning, sedan städad adress', () => {
    const { ut, k, lagen } = upplagg()
    k.uppdatera(cvKopreturIn(lage()))
    expect(lagen).toEqual(['vantar'])
    expect(behallKopreturParametrar(lage())).toBe(true)

    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS)
    expect(ut.refresh).toHaveBeenCalledTimes(1)
    k.uppdatera(cvKopreturIn(lage()))
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS)
    expect(ut.refresh).toHaveBeenCalledTimes(2)
    expect(ut.laddaNer).not.toHaveBeenCalled()
    expect(ut.stadaAdress).not.toHaveBeenCalled()

    // router.refresh gav nya props: kontot har Premium.
    const efter = lage({ isPremium: true, harWord: true })
    k.uppdatera(cvKopreturIn(efter))
    k.uppdatera(cvKopreturIn(efter))
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS * 10)
    expect(ut.laddaNer).toHaveBeenCalledTimes(1)
    expect(ut.laddaNer).toHaveBeenCalledWith('pdf')
    expect(ut.refresh).toHaveBeenCalledTimes(2)
    expect(ut.stadaAdress).toHaveBeenCalledTimes(1)
    expect(lagen).toEqual(['vantar', 'klar'])
    expect(behallKopreturParametrar(efter)).toBe(false)
  })

  it('aldrig tillgång: sex omhämtningar, ingen fil, raden visas och parametrarna står kvar', () => {
    const { ut, k, lagen } = upplagg()
    k.uppdatera(cvKopreturIn(lage()))
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS * 20)
    expect(ut.refresh).toHaveBeenCalledTimes(KOPRETUR_MAX_FORSOK)
    expect(ut.laddaNer).not.toHaveBeenCalled()
    expect(ut.stadaAdress).not.toHaveBeenCalled()
    expect(lagen).toEqual(['vantar', 'ej-registrerat'])
    // Adresseffekten stryker dem inte heller när valet ändras efteråt.
    expect(behallKopreturParametrar(lage())).toBe(true)
  })

  it('väntar på mätningen och CV:t innan något händer, som förut', () => {
    const { ut, k, lagen } = upplagg()
    k.uppdatera(cvKopreturIn(lage({ redo: false, isPremium: true })))
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS * 10)
    expect(ut.laddaNer).not.toHaveBeenCalled()
    expect(ut.refresh).not.toHaveBeenCalled()
    expect(lagen).toEqual([])

    k.uppdatera(cvKopreturIn(lage({ isPremium: true })))
    expect(ut.laddaNer).toHaveBeenCalledTimes(1)
    expect(lagen).toEqual(['klar'])
  })

  it('gammal länk med bara ladda=1, utan tillgång: ingen väntan, parametrarna stryks', () => {
    const gammal = lage({ kopRetur: false })
    const { ut, k, lagen } = upplagg()
    k.uppdatera(cvKopreturIn(gammal))
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS * 10)
    expect(ut.refresh).not.toHaveBeenCalled()
    expect(ut.laddaNer).not.toHaveBeenCalled()
    expect(lagen).toEqual(['klar'])
    expect(behallKopreturParametrar(gammal)).toBe(false)
  })

  it('gammal länk med bara ladda=1 och tillgång: filen laddas ner direkt, som i dag', () => {
    const { ut, k } = upplagg()
    k.uppdatera(cvKopreturIn(lage({ kopRetur: false, premiumMall: false })))
    expect(ut.laddaNer).toHaveBeenCalledTimes(1)
    expect(ut.refresh).not.toHaveBeenCalled()
  })

  it('Word i premiummall väntar på harWord, inte bara på mallen', () => {
    const { ut, k, lagen } = upplagg()
    k.uppdatera(cvKopreturIn(lage({ format: 'docx', isPremium: true, harWord: false })))
    expect(lagen).toEqual(['vantar'])
    vi.advanceTimersByTime(KOPRETUR_INTERVALL_MS)
    k.uppdatera(cvKopreturIn(lage({ format: 'docx', isPremium: true, harWord: true })))
    expect(ut.laddaNer).toHaveBeenCalledWith('docx')
  })

  it('Word begärt för en mall utan Word: ingen fil, adressen städas', () => {
    const { ut, k } = upplagg()
    k.uppdatera(cvKopreturIn(lage({ format: 'docx', mallHarWord: false, isPremium: true, harWord: true })))
    expect(ut.laddaNer).not.toHaveBeenCalled()
    expect(ut.stadaAdress).toHaveBeenCalledTimes(1)
  })

  it('tillgången i samma ordning som laddaNer prövar', () => {
    const bas = { premiumMall: false, isPremium: false, harWord: false, gratisAnvand: false, format: 'pdf' as const }
    expect(cvHarTillgang(bas)).toBe(true)
    expect(cvHarTillgang({ ...bas, format: 'docx' })).toBe(true) // Word i gratismall är vanlig gratisexport
    expect(cvHarTillgang({ ...bas, premiumMall: true })).toBe(false)
    expect(cvHarTillgang({ ...bas, premiumMall: true, isPremium: true, format: 'docx' })).toBe(false)
    expect(cvHarTillgang({ ...bas, premiumMall: true, isPremium: true, harWord: true, format: 'docx' })).toBe(true)
    expect(cvHarTillgang({ ...bas, gratisAnvand: true })).toBe(false)
  })

  it('städningen stryker bara köpreturen, valen (format=docx) står kvar', () => {
    expect(utanKopretur('?cv=abc&mall=bjork&format=docx&ladda=1&premium_activated=true')).toBe('cv=abc&mall=bjork&format=docx')
  })
})
