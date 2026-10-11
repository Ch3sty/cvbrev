'use client'

/**
 * Flödets historik och väg ut.
 *
 * Varje steg framåt i ett flöde är en ny historikpost, så att bakåtgesten
 * backar ett steg medan man är mitt i flödet. Men när flödet är klart satt
 * stegen kvar: ägaren skrev ett brev på mobilen och fick backa sju, åtta
 * gånger för att komma ut. Ett klart flöde ska lämna en enda post efter sig.
 *
 * Varje post i flödet bär sitt djup i history.state (flodesdjup), alltså hur
 * många poster den ligger ovanför flödets första. Avslutet går då
 * history.go(-djup) tillbaka till första posten och ersätter den med målet.
 * Historiken blir [rummet, målet], och nästa bakåtgest går till rummet.
 *
 * Rummet man kom från: DashboardShell anropar minnsRum för varje vanlig sida
 * i dashboarden (aldrig för flödena), så det senast besökta rummet är det
 * man startade flödet ifrån. Kom man dit med en klientnavigering vet första
 * posten det (flodeFran), och krysset kan gå ett steg längre bakåt, till
 * själva rummets post, i stället för att lägga en kopia av rummet ovanpå.
 */

export const DJUP_NYCKEL = 'flodesdjup'
export const FRAN_NYCKEL = 'flodeFran'
const URSPRUNG_NYCKEL = 'jc_flodets_ursprung'
export const RESERV_URSPRUNG = '/dashboard'

/** Senaste vanliga dashboardsida i den här sidladdningen. */
let senasteRum: string | null = null

/** DashboardShell: kallas med varje sökväg som inte är ett flöde. */
export function minnsRum(sokvag: string) {
  senasteRum = sokvag
  try {
    window.sessionStorage.setItem(URSPRUNG_NYCKEL, sokvag)
  } catch {
    // Privat läge eller blockerad lagring: minnet i sidladdningen räcker.
  }
}

/** Rummet flödet startades från, sparat i den här sidladdningen. */
export function rumIDennaLaddning(): string | null {
  return senasteRum
}

/** Rummet att gå till när flödet lämnas. Reserv: Jobbsöket. */
export function flodetsUrsprung(): string {
  if (senasteRum) return senasteRum
  try {
    const sparat = window.sessionStorage.getItem(URSPRUNG_NYCKEL)
    if (sparat && sparat.startsWith('/dashboard')) return sparat
  } catch {
    // ingen lagring
  }
  return RESERV_URSPRUNG
}

type Tillstand = Record<string, unknown> | null

function tillstand(): Tillstand {
  if (typeof window === 'undefined') return null
  const s = window.history.state
  return s && typeof s === 'object' ? (s as Record<string, unknown>) : null
}

/** Djupet på posten man står på, om det är stämplat. */
export function lasDjup(): number | undefined {
  const d = tillstand()?.[DJUP_NYCKEL]
  return typeof d === 'number' && Number.isFinite(d) && d >= 0 ? d : undefined
}

/** Rummet flödets första post kom ifrån, om det var en klientnavigering. */
export function lasFran(): string | undefined {
  const f = tillstand()?.[FRAN_NYCKEL]
  return typeof f === 'string' ? f : undefined
}

/**
 * Skriver djupet (och ursprunget) på posten man står på. Ingen URL skickas,
 * så Next.js routern navigerar inte; dess egna fält följer med i uppslaget.
 */
export function stampla(djup: number, fran?: string) {
  const extra: Record<string, unknown> = { [DJUP_NYCKEL]: djup }
  if (fran) extra[FRAN_NYCKEL] = fran
  window.history.replaceState({ ...(tillstand() ?? {}), ...extra }, '')
}

/* Medan avslutet går bakåt i historiken ska flödet stå still på steget det
   avslutades från, inte blinka förbi steg 1. Liten butik för
   useSyncExternalStore: 'nej', 'pa-vag' (history.go skickad) och 'landad'
   (popstate kom, målet är på väg in). */
export type LamnarStatus = 'nej' | 'pa-vag' | 'landad'
let lamnar: LamnarStatus = 'nej'
const lyssnare = new Set<() => void>()
function satt(v: LamnarStatus) {
  if (lamnar === v) return
  lamnar = v
  lyssnare.forEach((l) => l())
}
export const lamnarButik = {
  subscribe(l: () => void) {
    lyssnare.add(l)
    return () => {
      lyssnare.delete(l)
    }
  },
  get: (): LamnarStatus => lamnar,
  getServer: (): LamnarStatus => 'nej',
  slapp: () => satt('nej'),
}

/* Djupet nästa adress i flödet ska stämplas med. Sätts före router.push och
   router.replace (en navigering skriver en ny post utan våra fält), och läses
   av useFlowStep när adressen landat. */
let vantandeDjup: number | null = null
export function forbered(djup: number) {
  vantandeDjup = djup
}
export function taVantande(): number | null {
  const d = vantandeDjup
  vantandeDjup = null
  return d
}

interface Router {
  replace: (href: string, opts?: { scroll?: boolean }) => void
}

/**
 * Går tillbaka till flödets första post och kör sedan `sedan`. Väntar på
 * popstate; kommer det inget (historiken var kortare än vi trodde) körs
 * `sedan` ändå efter en kort stund, så flödet aldrig blir stående.
 */
function tillbakaTillForsta(steg: number, sedan: () => void) {
  if (steg <= 0) {
    sedan()
    return
  }
  satt('pa-vag')
  let klar = false
  const kor = () => {
    if (klar) return
    klar = true
    window.removeEventListener('popstate', kor)
    window.clearTimeout(reserv)
    sedan()
    satt('landad')
  }
  // Next.js lyssnar redan på popstate och återställer posten först.
  window.addEventListener('popstate', kor)
  const reserv = window.setTimeout(kor, 1500)
  window.history.go(-steg)
}

/**
 * Flödet är klart: historiken krymper till en post och den ersätts med
 * `mal`. Utan mål stannar man där man står (bekräftelsen), men nästa
 * bakåtgest lämnar flödet.
 */
export function avslutaFlodet(router: Router, mal?: string) {
  const djup = lasDjup() ?? 0
  const har = `${window.location.pathname}${window.location.search}`
  const dit = mal ?? har
  if (djup === 0) {
    if (mal) router.replace(mal, { scroll: false })
    // Står vi redan på flödets första post finns inget att städa.
    return
  }
  tillbakaTillForsta(djup, () => {
    // Posten är nu flödets första, djup 0. useFlowStep släpper stillbilden
    // när adressen landat.
    forbered(0)
    router.replace(dit, { scroll: false })
  })
}

/**
 * Krysset och Lämna: tillbaka till rummet man kom från. Startade flödet med
 * en klientnavigering från just det rummet ligger rummets egen post direkt
 * under flödet, och då går vi dit i stället för att lägga en kopia ovanpå.
 */
export function lamnaFlodet(router: Router, mal: string = flodetsUrsprung()) {
  const djup = lasDjup()
  if (djup !== undefined && lasFran() === mal) {
    satt('pa-vag')
    window.history.go(-(djup + 1))
    return
  }
  avslutaFlodet(router, mal)
}
