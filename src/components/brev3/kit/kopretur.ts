/**
 * Köpreturen i brevrummet (Brevet och Mallar): tillbaka från kassan med
 * ?ladda=1&format=…&premium_activated=true laddas filen ner en gång, av sig själv.
 *
 * Stripe-webhooken kan landa några sekunder efter att användaren kommer
 * tillbaka, så sidan kan serverrenderas som gratis. Då behålls parametrarna
 * i adressen och serverns data hämtas om (router.refresh) var 2,5:e sekund,
 * högst sex gånger, tills tillgången syns. Samma mönster som översikten
 * (OversiktKlient). Tar försöken slut visas en rad som ber användaren ladda
 * om sidan, och parametrarna står kvar så att omladdningen hämtar filen.
 * Utan premium_activated (en gammal länk med bara ladda=1)
 * väntar vi inte: adressen städas och inget mer händer.
 *
 * Logiken ligger i en ren styrning (skapaKopretur) som testas med falska
 * klockor; useKopretur kopplar den till vyns props.
 */
import { useEffect, useRef, useState } from 'react'

export const KOPRETUR_INTERVALL_MS = 2500
export const KOPRETUR_MAX_FORSOK = 6

export type KopreturFormat = 'pdf' | 'docx'
export type KopreturLage = 'vilar' | 'vantar' | 'klar' | 'ej-registrerat'

export interface KopreturIn {
  /** Formatet som begärs från kassan (?ladda=1&format=), annars null. */
  begart: KopreturFormat | null
  /** premium_activated=true: användaren kommer direkt från ett köp. */
  kopRetur: boolean
  /** Serverns besked om nedladdning (letter_download). */
  kanLaddaNer: boolean
  /** Formatet finns för mallen (Word bara i mallar med Word). */
  formatFinns: boolean
}

export interface KopreturUt {
  refresh: () => void
  laddaNer: (format: KopreturFormat) => void
  stadaAdress: () => void
  nyttLage: (lage: KopreturLage) => void
}

export interface Kopretur {
  /** Anropas med vyns aktuella props, vid start och varje gång de ändras. */
  uppdatera: (inn: KopreturIn) => void
  /** Stoppar tidtagningen (komponenten försvinner). */
  stang: () => void
}

/** Ren styrning: högst en nedladdning per retur, oavsett hur ofta den uppdateras. */
export function skapaKopretur(ut: KopreturUt): Kopretur {
  let klar = false
  let forsok = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  // När försöken tar slut står parametrarna kvar i adressen: raden ber
  // användaren ladda om sidan, och omladdningen ska då gå in i köpreturen
  // igen och hämta filen. I alla andra slut städas adressen.
  const avsluta = (lage: KopreturLage) => {
    klar = true
    if (timer) clearTimeout(timer)
    timer = null
    if (lage !== 'ej-registrerat') ut.stadaAdress()
    ut.nyttLage(lage)
  }

  const schemalagg = () => {
    timer = setTimeout(() => {
      timer = null
      if (klar) return
      if (forsok >= KOPRETUR_MAX_FORSOK) {
        avsluta('ej-registrerat')
        return
      }
      forsok += 1
      ut.refresh()
      schemalagg()
    }, KOPRETUR_INTERVALL_MS)
  }

  return {
    uppdatera(inn) {
      if (klar || !inn.begart) return
      if (inn.kanLaddaNer) {
        avsluta('klar')
        if (inn.formatFinns) ut.laddaNer(inn.begart)
        return
      }
      if (!inn.kopRetur) {
        avsluta('klar')
        return
      }
      if (timer) return
      ut.nyttLage('vantar')
      schemalagg()
    },
    stang() {
      if (timer) clearTimeout(timer)
      timer = null
    },
  }
}

/** Stryker köpreturens parametrar ur adressen, utan att ladda om sidan. */
export function stadaKopreturAdress(): void {
  const url = new URL(window.location.href)
  for (const k of ['ladda', 'format', 'premium_activated']) url.searchParams.delete(k)
  window.history.replaceState(window.history.state, '', url.toString())
}

/**
 * Kopplar styrningen till en vy. `ut` får vara nya funktioner vid varje
 * rendering: den senaste används alltid, så nedladdningen ser nya props.
 */
export function useKopretur(inn: KopreturIn, ut: Omit<KopreturUt, 'nyttLage'>): { vantar: boolean; ejRegistrerat: boolean } {
  const [lage, setLage] = useState<KopreturLage>('vilar')
  const utRef = useRef(ut)
  utRef.current = ut
  const styrning = useRef<Kopretur | null>(null)
  if (!styrning.current) {
    styrning.current = skapaKopretur({
      refresh: () => utRef.current.refresh(),
      laddaNer: (f) => utRef.current.laddaNer(f),
      stadaAdress: () => utRef.current.stadaAdress(),
      nyttLage: setLage,
    })
  }

  useEffect(() => {
    const s = styrning.current!
    s.uppdatera(inn)
    // stang stoppar bara tidtagningen; körs effekten igen (nya props eller
    // strikt läge) fortsätter väntan där den var, och en klar retur förblir klar.
    return () => s.stang()
  }, [inn.begart, inn.kopRetur, inn.kanLaddaNer, inn.formatFinns]) // eslint-disable-line react-hooks/exhaustive-deps

  return { vantar: lage === 'vantar', ejRegistrerat: lage === 'ej-registrerat' }
}
