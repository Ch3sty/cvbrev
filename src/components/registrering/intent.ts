/**
 * Registreringstrattens val och cookie (docs/design/profil-registrering-spec-2026-09-24.md,
 * Del B, "Komponent-API").
 *
 * Enda källan till mappningen val → spår, paket och landning. Klientsäker och
 * serversäker: ren data och rena funktioner, ingen JSX, ingen env.
 *
 * Valet styr aldrig vad som syns (saas-leads villkor 1). Det läses bara av
 * /dashboard/valkommen, Kom igång och hemskärmens ordning.
 */

import { isPlanKey, type PlanKey } from '@/lib/plans/plans'

export type SignupIntent = 'cv' | 'brev' | 'tester' | 'intervju' | 'jobb'

/** Ordningen i steg 1: den ordning folk söker jobb. */
export const INTENT_ORDNING: readonly SignupIntent[] = ['cv', 'brev', 'tester', 'intervju', 'jobb']

/** Ikonens namn, översatt till en komponent i ValSteg. Håller filen fri från JSX. */
export type IkonNamn = 'cv' | 'brev' | 'test' | 'intervju' | 'jobb'

export const INTENTS: Record<
  SignupIntent,
  {
    track: 'cv' | 'tester' | 'allt'
    plan: 'cv_week' | 'test_week' | 'all_week'
    /** Dit Börja gratis (och krysset) i steg 3 leder. */
    landning: string
    ikon: IkonNamn
  }
> = {
  cv: { track: 'cv', plan: 'cv_week', landning: '/dashboard/skapa-cv', ikon: 'cv' },
  brev: { track: 'cv', plan: 'cv_week', landning: '/dashboard/skapa-brev', ikon: 'brev' },
  tester: { track: 'tester', plan: 'test_week', landning: '/dashboard/tester', ikon: 'test' },
  intervju: { track: 'tester', plan: 'test_week', landning: '/dashboard/intervju', ikon: 'intervju' },
  jobb: { track: 'allt', plan: 'all_week', landning: '/dashboard/jobbmatchning', ikon: 'jobb' },
}

export function lasIntent(v: unknown): SignupIntent | null {
  return typeof v === 'string' && (INTENT_ORDNING as readonly string[]).includes(v)
    ? (v as SignupIntent)
    : null
}

/* ------------------------------------------------------------ ingången */

export type SignupEntry = 'header' | 'meny' | 'login' | 'verktyg' | 'pris' | 'smakprov' | 'direkt'

const ENTRIES: readonly SignupEntry[] = ['header', 'meny', 'login', 'verktyg', 'pris', 'smakprov', 'direkt']

export function lasEntry(v: unknown): SignupEntry | null {
  return typeof v === 'string' && (ENTRIES as readonly string[]).includes(v) ? (v as SignupEntry) : null
}

/** sessionStorage-nyckeln som headern, menyn och inloggningen skriver vid klick. */
export const ENTRY_STORAGE_KEY = 'jc_signup_entry'

/* ------------------------------------------------------------ smakproven */

export type SmakprovTyp = 'intervju' | 'personlighet' | 'test' | 'draft' | 'cv_start'

export const SMAKPROV_TYPER: readonly SmakprovTyp[] = ['intervju', 'personlighet', 'test', 'draft', 'cv_start']

export interface Smakprov {
  typ: SmakprovTyp
  token: string
}

const UUID = /^[0-9a-f-]{36}$/i
/** Brevutkast och testprov bär egna tokenformer; bara säkra tecken släpps igenom. */
const TOKEN = /^[A-Za-z0-9_-]{8,128}$/
/** CV-starten är "{yrke}:{mall}". */
const CV_START = /^[a-z0-9-]{0,80}:[a-z0-9-]{1,80}$/i

export function giltigtSmakprov(typ: SmakprovTyp, token: string | null | undefined): boolean {
  if (!token) return false
  if (typ === 'intervju' || typ === 'personlighet') return UUID.test(token)
  if (typ === 'cv_start') return CV_START.test(token)
  return TOKEN.test(token) || UUID.test(token)
}

/** Första giltiga smakprovet i adressen, i samma ordning som hämtkedjan. */
export function smakprovUrParams(get: (namn: string) => string | null | undefined): Smakprov | null {
  for (const typ of ['draft', 'cv_start', 'test', 'intervju', 'personlighet'] as const) {
    const token = get(typ)
    if (token && giltigtSmakprov(typ, token)) return { typ, token }
  }
  return null
}

/* ------------------------------------------------------------ redirect */

/** Bara relativa sökvägar inom appen, aldrig protokollrelativa. */
export function sakerRedirect(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return null
  if (raw === '/dashboard' || raw === '/dashboard/' || raw.startsWith('/dashboard/valkommen')) return null
  if (raw.startsWith('/register') || raw.startsWith('/login')) return null
  return raw
}

/* ------------------------------------------------------------ cookien */

/**
 * Cookien som bär tratten genom Google och till valkommen-sidan. Namn
 * jc_signup, SameSite=Lax, Path=/, Max-Age 3600, inte httpOnly (klienten
 * skriver den före signUp och före Google). Innehåll URI-kodad JSON.
 *
 * Utöver specens tre fält bär den smakprovet, paketet och redirecten, så att
 * alla fem ingångar fungerar genom Googles redirect (designfilen: "intent,
 * entry, token-typ").
 */
export const SIGNUP_COOKIE = 'jc_signup'
export const SIGNUP_COOKIE_MAX_AGE = 3600

export interface SignupCookie {
  intent: SignupIntent | null
  entry: SignupEntry
  skipped: boolean
  smakprov?: Smakprov | null
  paket?: PlanKey | null
  redirect?: string | null
}

export function serialiseraSignupCookie(c: SignupCookie): string {
  return encodeURIComponent(JSON.stringify(c))
}

/** Tålig mot skräp: allt ogiltigt blir null eller standardvärdet. */
export function lasSignupCookie(raw: string | null | undefined): SignupCookie | null {
  if (!raw) return null
  let data: unknown
  try {
    data = JSON.parse(decodeURIComponent(raw))
  } catch {
    try {
      data = JSON.parse(raw)
    } catch {
      return null
    }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const d = data as Record<string, unknown>
  const sp = d.smakprov as Record<string, unknown> | null | undefined
  const typ = sp && typeof sp.typ === 'string' && (SMAKPROV_TYPER as readonly string[]).includes(sp.typ)
    ? (sp.typ as SmakprovTyp)
    : null
  const token = sp && typeof sp.token === 'string' ? sp.token : null
  return {
    intent: lasIntent(d.intent),
    entry: lasEntry(d.entry) ?? 'direkt',
    skipped: d.skipped === true,
    smakprov: typ && token && giltigtSmakprov(typ, token) ? { typ, token } : null,
    paket: isPlanKey(d.paket) ? d.paket : null,
    redirect: sakerRedirect(d.redirect),
  }
}

/** Skriver cookien i webbläsaren. Tyst om document saknas. */
export function skrivSignupCookie(c: SignupCookie): void {
  if (typeof document === 'undefined') return
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${SIGNUP_COOKIE}=${serialiseraSignupCookie(c)}; Path=/; Max-Age=${SIGNUP_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

export function rensaSignupCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = `${SIGNUP_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}

/* ------------------------------------------------------------ registreringens läge */

export type RegisterLage = 'tratt' | 'konto' | 'smakprov' | 'paket' | 'redirect'

export interface RegisterIngang {
  lage: RegisterLage
  intent: SignupIntent | null
  smakprov: Smakprov | null
  paket: PlanKey | null
  redirect: string | null
}

/**
 * Landningstabellen för /register (designfilen, "Samma adress, fler vägar
 * in"). Smakprov går före allt: hon var mitt i något. Sedan redirect, paket,
 * valet ur ?borja= och sist den bara tratten.
 */
export function registerIngang(get: (namn: string) => string | null | undefined): RegisterIngang {
  const smakprov = smakprovUrParams(get)
  const redirect = sakerRedirect(get('redirect'))
  const paketRaw = get('paket')
  const paket = isPlanKey(paketRaw) ? paketRaw : null
  const intent = lasIntent(get('borja'))
  const lage: RegisterLage = smakprov
    ? 'smakprov'
    : redirect
      ? 'redirect'
      : paket
        ? 'paket'
        : intent
          ? 'konto'
          : 'tratt'
  return { lage, intent: lage === 'konto' || lage === 'tratt' ? intent : null, smakprov, paket, redirect }
}

/** Ingången utan sessionStorage: adressen och föregående sida. */
export function harledEntry(
  ingang: Pick<RegisterIngang, 'lage'>,
  sparad: string | null,
  referrerPath: string | null
): SignupEntry {
  if (ingang.lage === 'smakprov') return 'smakprov'
  if (ingang.lage === 'paket') return 'pris'
  if (ingang.lage === 'konto') return 'verktyg'
  const s = lasEntry(sparad)
  if (s) return s
  if (referrerPath) {
    if (referrerPath.startsWith('/verktyg') || referrerPath.startsWith('/cv-mallar')) return 'verktyg'
    if (referrerPath.startsWith('/priser')) return 'pris'
    if (referrerPath.startsWith('/login')) return 'login'
  }
  return 'direkt'
}

/* ------------------------------------------------------------ valkommen */

/** Parametern som säger till spårvalet att frågan i steg 1 redan hoppats över. */
export const HOPPAT_PARAM = 'hoppat'

export type Landningsgren =
  | { via: 'redirect'; destination: string }
  | { via: 'paket'; destination: string }
  | { via: 'forslag'; intent: SignupIntent }
  | { via: 'sparval'; destination: string }

/**
 * Vart valkommen-sidan skickar ett nytt konto när hämtkedjan inte gav något:
 * redirect, sedan paket (köpsteget), sedan valet (steg 3), annars spårvalet
 * utan förval.
 */
export function landningsgren(c: SignupCookie | null, sparvalPath: string): Landningsgren {
  if (c?.redirect) return { via: 'redirect', destination: c.redirect }
  if (c?.paket) return { via: 'paket', destination: `${sparvalPath}?paket=${c.paket}&steg=kop` }
  if (c?.intent) return { via: 'forslag', intent: c.intent }
  // Hoppade hon över "Vad vill du börja med?" i steg 1 ställs frågan inte
  // igen: Börja gratis i spårvalet går då direkt till hemskärmen
  // (QA 2026-09-24, iakttagelse 2).
  if (c?.skipped) return { via: 'sparval', destination: `${sparvalPath}?${HOPPAT_PARAM}=1` }
  return { via: 'sparval', destination: sparvalPath }
}

/* ------------------------------------------------------------ Google-callbacken */

/**
 * Vart /auth/callback skickar efter Googles redirect. Nytt konto: alltid
 * valkommen-sidan när next är /dashboard eller valkommen, annars next (hon
 * bad om en sida). Befintligt konto som kom från registreringen (next är
 * valkommen): till valkommen bara om ett smakprov väntar på att hämtas hem,
 * annars dit cookien säger, annars hemskärmen.
 */
export function googleCallbackMal(input: {
  isNewAccount: boolean
  next: string
  cookie: SignupCookie | null
  valkommenPath: string
}): string {
  const { isNewAccount, next, cookie, valkommenPath } = input
  const tillValkommen = next === '/dashboard' || next === valkommenPath
  if (isNewAccount) return tillValkommen ? valkommenPath : next
  if (next !== valkommenPath) return next
  if (cookie?.smakprov) return valkommenPath
  return cookie?.redirect ?? '/dashboard'
}
