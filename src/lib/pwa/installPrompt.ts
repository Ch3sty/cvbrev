'use client'

/**
 * Regelmotorn och tillståndet bakom frågan om hemskärmen
 * (docs/plan-pwa.md, avsnitt 3).
 *
 * Filen har två halvor. Den övre är rena funktioner utan sidoeffekter, och
 * det är den som bär besluten: får frågan visas nu, och i så fall varför
 * inte. Den nedre är en liten store som komponenten prenumererar på och som
 * de fyra triggerställena anropar. Uppdelningen är avsiktlig: reglerna ska gå
 * att testa utan en webbläsare, en DOM eller en klocka.
 *
 * Reglerna, i den ordning de avgörs:
 *
 *   1. Appen är redan installerad (display-mode standalone, eller iOS
 *      navigator.standalone). Då finns det ingenting att fråga om.
 *   2. Frågan har accepterats eller installationen har skett. Aldrig igen.
 *   3. Det här är användarens första session. Vi frågar inte den som just
 *      kommit in; en ikon på hemskärmen är ett andra besök, inte ett första.
 *   4. Frågan har avfärdats för mindre än 30 dagar sedan.
 *   5. Frågan visas redan.
 *
 * Tillståndet ligger i localStorage, eftersom en installation är knuten till
 * enheten och inte till kontot. Ett konto som loggar in på telefonen och på
 * datorn ska få frågan på telefonen men inte på datorn.
 */

/** De fyra ställen som får be om installation. */
export type InstallTrigger =
  | 'letter_saved'
  | 'logic_test_completed'
  | 'first_match'
  | 'cv_template_downloaded'

/** Vilket sätt användaren faktiskt installerar på. */
export type InstallPlatform = 'android' | 'ios' | 'other'

/** Nycklarna i localStorage. Prefixet jc_ är samma som resten av appen. */
export const LAGRINGSNYCKLAR = {
  /** Millisekunder då frågan senast avfärdades. */
  avfardad: 'jc_pwa_dismissed_at',
  /** 'true' när frågan accepterats eller appen installerats. */
  klar: 'jc_pwa_installed',
  /** Millisekunder för användarens första session på den här enheten. */
  forstaSession: 'jc_pwa_first_seen_at',
} as const

/** Ett avfärdande gäller i 30 dagar (planen, avsnitt 3). */
export const AVFARDAD_DAGAR = 30
const AVFARDAD_MS = AVFARDAD_DAGAR * 24 * 60 * 60 * 1000

/**
 * Allt regelmotorn behöver veta. Inga globala beroenden: anropssidan läser
 * localStorage och webbläsarens lägen och skickar in resultatet, testerna
 * skickar in värden direkt.
 */
export interface Omstandigheter {
  /** Appen körs redan installerad. */
  standalone: boolean
  /** Frågan har accepterats, eller appinstallationen har rapporterats. */
  redanKlar: boolean
  /** Millisekunder för första sessionen, null om den här är den första. */
  forstaSessionVid: number | null
  /**
   * Millisekunder då den här sidladdningen började.
   *
   * Stämpeln ovan sätts av PwaRegister vid mount, alltså under den här
   * sidladdningen om enheten aldrig setts förut. Vi kan därför inte jämföra
   * den mot nu: ett brev tar en minut att skriva, och då hade stämpeln
   * sett gammal ut trots att den sattes för en minut sedan. Vi jämför mot
   * sidladdningens början i stället, och då säger villkoret exakt det det
   * ska säga: stämpeln finns sedan ett tidigare besök.
   */
  sidladdningVid: number
  /** Millisekunder för senaste avfärdandet, null om aldrig avfärdad. */
  avfardadVid: number | null
  /** Nu, i millisekunder. Skickas in så att testerna äger klockan. */
  nu: number
  /** Frågan visas redan. */
  visasRedan: boolean
  /**
   * Cookie-bannern står kvar obesvarad längst ned på skärmen.
   *
   * Den ligger på z-index 999 och täcker hela nederkanten, så vår rad hade
   * hamnat under den och aldrig gått att trycka på. Två frågor på samma
   * plats är dessutom en fråga för mycket: samtycket kommer först, vår
   * fråga nästa gång.
   */
  cookiebannerUppe: boolean
}

/** Varför frågan inte får visas. null betyder att den får det. */
export type Hinder =
  | 'standalone'
  | 'redan_klar'
  | 'forsta_besoket'
  | 'nyligen_avfardad'
  | 'visas_redan'
  | 'cookiebanner'

/**
 * Regelmotorn. Returnerar hindret, eller null när frågan får visas.
 *
 * Ordningen spelar roll för vad vi rapporterar, inte för utfallet: en
 * installerad app som dessutom avfärdat frågan ska räknas som installerad.
 */
export function hittaHinder(o: Omstandigheter): Hinder | null {
  if (o.standalone) return 'standalone'
  if (o.redanKlar) return 'redan_klar'
  if (o.visasRedan) return 'visas_redan'

  // Första besöket: vi har ingen tidigare session att luta oss mot.
  if (o.forstaSessionVid === null) return 'forsta_besoket'

  // En stämpel som sattes under den här sidladdningen är inte ett tidigare
  // besök, den är det här besöket. Utan den här raden skulle stämpeln
  // PwaRegister just satt godkänna frågan redan första gången.
  if (o.forstaSessionVid >= o.sidladdningVid) return 'forsta_besoket'

  if (o.avfardadVid !== null && o.nu - o.avfardadVid < AVFARDAD_MS) {
    return 'nyligen_avfardad'
  }

  // Sist, för att det är det mest tillfälliga hindret: samtycket besvaras
  // en gång, och nästa trigger kommer förbi.
  if (o.cookiebannerUppe) return 'cookiebanner'

  return null
}

/** Bekvämlighet: samma sak, som ett ja eller nej. */
export function farVisas(o: Omstandigheter): boolean {
  return hittaHinder(o) === null
}

/* ============================================================ webbläsaren */

function las(nyckel: string): string | null {
  try {
    return window.localStorage.getItem(nyckel)
  } catch {
    // Privat läge, eller blockerad lagring. Då vet vi ingenting, och det
    // enda som går fel är att frågan inte visas.
    return null
  }
}

function skriv(nyckel: string, varde: string): void {
  try {
    window.localStorage.setItem(nyckel, varde)
  } catch {
    /* se ovan */
  }
}

function lasTid(nyckel: string): number | null {
  const ravarde = las(nyckel)
  if (!ravarde) return null
  const tal = Number(ravarde)
  return Number.isFinite(tal) ? tal : null
}

/** Appen körs som installerad app, inte i en webbläsarflik. */
export function arStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true
  // iOS har aldrig implementerat display-mode för hemskärmsappar.
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

/** iPhone eller iPad, alltså ingen beforeinstallprompt att vänta på. */
export function arIos(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return true
  // iPadOS 13 och senare säger Macintosh, men har pekskärm.
  return /Macintosh/.test(ua) && window.navigator.maxTouchPoints > 1
}

/**
 * Stämplar den här enhetens första session, om den inte redan är stämplad.
 * Anropas en gång per sidladdning, så tidigt som möjligt, så att andra
 * besöket faktiskt räknas som ett andra besök.
 */
export function markeraSession(): void {
  if (typeof window === 'undefined') return
  if (lasTid(LAGRINGSNYCKLAR.forstaSession) === null) {
    skriv(LAGRINGSNYCKLAR.forstaSession, String(Date.now()))
  }
}

/**
 * När den här sidladdningen började, i samma tidsrymd som Date.now().
 *
 * performance.timeOrigin är exakt det, och till skillnad från en egen
 * modulvariabel överlever den inte en klientnavigering som den inte borde
 * överleva: Next byter sida utan att ladda om, och då ska det fortfarande
 * räknas som samma sidladdning. Saknas API:t faller vi tillbaka på nu, och
 * då blir utfallet det försiktiga: frågan visas inte.
 */
function sidladdningVid(): number {
  const origin = performance?.timeOrigin
  return typeof origin === 'number' && Number.isFinite(origin) ? origin : Date.now()
}

/**
 * Står cookie-bannern kvar? Klassen sätts av CookieBanner (samtycke/) när
 * bannern visas, och elementet tas bort ur DOM när samtycket lämnats.
 */
function cookiebannerUppe(): boolean {
  const el = document.querySelector('.cookie-banner-container')
  if (!el) return false
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

/** Läser ihop omständigheterna ur webbläsaren. */
export function lasOmstandigheter(visasRedan: boolean): Omstandigheter {
  return {
    standalone: arStandalone(),
    redanKlar: las(LAGRINGSNYCKLAR.klar) === 'true',
    forstaSessionVid: lasTid(LAGRINGSNYCKLAR.forstaSession),
    avfardadVid: lasTid(LAGRINGSNYCKLAR.avfardad),
    nu: Date.now(),
    sidladdningVid: sidladdningVid(),
    visasRedan,
    cookiebannerUppe: cookiebannerUppe(),
  }
}

/** Sparar ett avfärdande. Frågan vilar 30 dagar. */
export function sparaAvfardad(): void {
  skriv(LAGRINGSNYCKLAR.avfardad, String(Date.now()))
}

/** Sparar att frågan är avklarad. Den ställs aldrig igen. */
export function sparaKlar(): void {
  skriv(LAGRINGSNYCKLAR.klar, 'true')
}

/* =================================================================== store */

/**
 * Webbläsarens installationsfråga. Typen finns inte i lib.dom, så vi
 * beskriver den själva. prompt() öppnar systemets dialog, userChoice svarar
 * när användaren valt.
 */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export interface InstallState {
  /** Raden ska visas. */
  synlig: boolean
  /** Vilken trigger som öppnade den. Följer med till mätningen. */
  trigger: InstallTrigger | null
  /** iOS-arket med de tre stegen är öppet. */
  arkOppet: boolean
  /** Vad användaren möter: Androids dialog, iOS-arket, eller ingenting. */
  plattform: InstallPlatform
}

const STARTLAGE: InstallState = {
  synlig: false,
  trigger: null,
  arkOppet: false,
  plattform: 'other',
}

let state: InstallState = STARTLAGE
let deferred: BeforeInstallPromptEvent | null = null
const lyssnare = new Set<() => void>()

function satt(nytt: Partial<InstallState>): void {
  state = { ...state, ...nytt }
  lyssnare.forEach((l) => l())
}

/** useSyncExternalStore-paret. */
export function prenumerera(lyssnaren: () => void): () => void {
  lyssnare.add(lyssnaren)
  return () => {
    lyssnare.delete(lyssnaren)
  }
}

export function lasState(): InstallState {
  return state
}

/** Serverns ögonblicksbild. Raden finns aldrig i serverns HTML. */
export function lasServerState(): InstallState {
  return STARTLAGE
}

/**
 * Tar emot webbläsarens beforeinstallprompt och sparar den. Utan det här
 * anropet kan vi inte öppna dialogen senare: eventet går bara att använda
 * en gång, och bara om vi förhindrade webbläsarens eget beteende.
 */
export function taEmotInstallPrompt(event: BeforeInstallPromptEvent): void {
  deferred = event
}

/** Finns Androids dialog att öppna? */
export function harInstallPrompt(): boolean {
  return deferred !== null
}

/**
 * Den fyra triggerställena anropar den här. Returnerar true om frågan
 * faktiskt visades, så anropssidan slipper duplicera reglerna.
 *
 * Plattformen avgörs här och inte i komponenten, eftersom den styr både vad
 * knappen gör och vilket värde som hamnar i mätningen.
 */
export function requestInstallPrompt(trigger: InstallTrigger): boolean {
  if (typeof window === 'undefined') return false

  const hinder = hittaHinder(lasOmstandigheter(state.synlig))
  if (hinder !== null) return false

  const ios = arIos()
  // Utan en sparad beforeinstallprompt och utan iOS har vi ingen väg att
  // erbjuda. Desktop får ingen egen fråga: webbläsarens ikon i adressfältet
  // räcker (planen, avsnitt 3).
  if (!ios && !harInstallPrompt()) return false

  satt({
    synlig: true,
    trigger,
    arkOppet: false,
    plattform: ios ? 'ios' : 'android',
  })
  return true
}

/** Användaren tryckte på X. Frågan vilar 30 dagar. */
export function avfarda(): void {
  sparaAvfardad()
  satt({ synlig: false, arkOppet: false })
}

/** iOS: öppna respektive stäng arket med de tre stegen. */
export function oppnaArk(): void {
  satt({ arkOppet: true })
}

export function stangArk(): void {
  satt({ arkOppet: false })
}

/**
 * Android: öppna webbläsarens dialog och vänta på svaret.
 *
 * Ett avslag i systemdialogen är inte samma sak som ett avfärdande av vår
 * rad: användaren såg vår fråga, sa ja, och ångrade sig i systemets dialog.
 * Vi behandlar det ändå som ett avfärdande, eftersom raden annars skulle
 * stå kvar och be om samma sak igen direkt.
 */
export async function visaSystemdialog(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const event = deferred
  if (!event) return 'unavailable'

  // Eventet går bara att använda en gång.
  deferred = null

  try {
    await event.prompt()
    const { outcome } = await event.userChoice
    if (outcome === 'accepted') sparaKlar()
    else sparaAvfardad()
    satt({ synlig: false, arkOppet: false })
    return outcome
  } catch {
    satt({ synlig: false, arkOppet: false })
    return 'unavailable'
  }
}

/**
 * iOS: användaren har läst de tre stegen och stänger arket. Vi kan inte veta
 * om installationen blev av (Safari berättar ingenting), så vi antar att den
 * som läst instruktionen inte vill se frågan igen.
 */
export function markeraIosKlar(): void {
  sparaKlar()
  satt({ synlig: false, arkOppet: false })
}

/** appinstalled: webbläsaren bekräftar att appen lades till. */
export function markeraInstallerad(): void {
  sparaKlar()
  deferred = null
  satt({ synlig: false, arkOppet: false })
}

/** Bara för tester: nollställ modulens tillstånd mellan fall. */
export function _nollstall(): void {
  state = STARTLAGE
  deferred = null
  lyssnare.clear()
}
