/**
 * Uppföljningsmejlet (F5): underlaget till AI:n, reservmallen, valideringen
 * av AI:ns svar, signaturen, mailto-länken och spärren. Klientsäker och ren.
 *
 * Till AI:n går bara tjänst, arbetsgivare, datum, hur man sökte, högst tre
 * kompetenser eller roller ur CV:t och brevets krav. Aldrig namn, telefon,
 * e-post eller adress: namnet sätts in här efteråt (signatur()).
 */
import type { ApplicationChannel } from '@/lib/applications/status'
import { dagFor, idagSv, langDag, raknaOrdITexten } from './datum'
import { titelILopText } from './attGora'
import { AMNE_START, utkastTyp } from './utkastTyp'
import {
  UPPFOLJNING_MAX_ORD,
  UPPFOLJNING_PREMIUM_PER_DYGN,
  type Dag,
  type Uppfoljning,
  type UppfoljningVia,
  type UppfoljningsTyp,
} from './typer'

export type MejlSprak = 'sv' | 'en'

export interface UppfoljningUnderlag {
  jobTitle: string
  company: string
  appliedAt: Dag
  kanal: ApplicationChannel
  /** Högst tre, se valjKompetenser. */
  kompetenser: string[]
  /** Brevets krav (bara texten), tomt när brevet saknar krav. */
  krav: string[]
  sprak: MejlSprak
  /** Sorten mejl: efter ansökan, efter intervju eller efter provjobb (tjänstens foljUppTyp). */
  typ: UppfoljningsTyp
  /** Intervjudagen eller provjobbsdagen (intervjuInfo().dag), null efter en ansökan eller när dagen saknas. */
  momentDag: Dag | null
}

export interface Mejl {
  subject: string
  body: string
}

const MAX_AMNE = 200
const MAX_TEXT = 4000

const norm = (s: string) => s.toLocaleLowerCase('sv-SE').replace(/[.,\-_/()]/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * Högst tre kompetenser eller roller ur CV:t: först de som står i brevets
 * krav, sedan CV:ts kompetenser i ordning, sist rollerna.
 */
export function valjKompetenser(
  kompetenser: readonly string[],
  roller: readonly string[],
  krav: readonly string[],
  max = 3
): string[] {
  const kravText = norm(krav.join(' '))
  const ren = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, 60)
  const kandidater = [...kompetenser.map(ren), ...roller.map(ren)].filter(Boolean)
  const traffar = kandidater.filter((k) => norm(k).length > 2 && kravText.includes(norm(k)))
  const ut: string[] = []
  const sett = new Set<string>()
  for (const k of [...traffar, ...kandidater]) {
    const n = norm(k)
    if (!n || sett.has(n)) continue
    sett.add(n)
    ut.push(k)
    if (ut.length >= max) break
  }
  return ut
}

/**
 * Rensar text som ska skickas till AI:n: inga radbrytningar, högst 200 tecken
 * per fält. Efter intervju eller provjobb går bara tjänst, arbetsgivare,
 * momentet, dagen, kompetenserna, kraven och språket: aldrig intervjuns plats
 * eller anteckningar (de kan innehålla namn och adresser), och inte hur man
 * sökte eller när.
 */
export function underlagForModellen(u: UppfoljningUnderlag): Record<string, unknown> {
  const f = (s: string, max = 200) => s.replace(/\s+/g, ' ').trim().slice(0, max)
  if (u.typ === 'intervju' || u.typ === 'provjobb') {
    return {
      tjanst: f(u.jobTitle),
      arbetsgivare: f(u.company),
      moment: u.typ,
      datum: u.momentDag ? langDag(u.momentDag) : null,
      kompetenser: u.kompetenser.slice(0, 3).map((k) => f(k, 60)),
      krav: u.krav.slice(0, 8).map((k) => f(k, 60)),
      sprak: u.sprak,
    }
  }
  return {
    tjanst: f(u.jobTitle),
    arbetsgivare: f(u.company),
    sokt_datum: langDag(u.appliedAt),
    hur: u.kanal === 'unsolicited' ? 'spontanansökan' : u.kanal === 'network' ? 'via kontakt' : 'svar på annons',
    kompetenser: u.kompetenser.slice(0, 3).map((k) => f(k, 60)),
    krav: u.krav.slice(0, 8).map((k) => f(k, 60)),
    sprak: u.sprak,
  }
}

const HALSNING: Record<MejlSprak, string> = { sv: 'Hej,', en: 'Hello,' }
const AVSLUT: Record<MejlSprak, string> = { sv: 'Vänliga hälsningar', en: 'Kind regards' }

/** Hälsningen, avslutet och namnet runt styckena. Namnet sätts in här, aldrig av AI:n. */
export function sattIhop(stycken: readonly string[], sprak: MejlSprak, namn: string | null): string {
  const sign = namn ? `${AVSLUT[sprak]}\n${namn}` : AVSLUT[sprak]
  return [HALSNING[sprak], ...stycken, sign].join('\n\n')
}

/** Mejlet uppdelat för "Skriv om kortare". Hälsning och avslut står ordagrant som användaren har dem. */
export interface MejlDelar {
  /** Hälsningsraden ordagrant ("Hej Anna,"), null när mejlet saknar en. */
  halsning: string | null
  /** Brödtextens stycken, det enda som går till AI:n. */
  stycken: string[]
  /** Allt från avslutsfrasen och nedåt, ordagrant: namn, telefon, e-post, länkar, extra rader. */
  avslut: string
}

const HALSNING_RE = /^(hej|hejsan|hallå|god morgon|goddag|hello|hi|dear|good (morning|afternoon))\b/i
const AVSLUT_RE =
  /^((med\s+)?(vänliga|vänlig|bästa|varma|många)\s+hälsning(ar)?|hälsningar|mvh|tack på förhand|(kind|kindest|best|warm|warmest)\s+regards|regards|best wishes|(yours\s+)?sincerely|thanks in advance|many thanks)\b[^\n]{0,40}$/i

/**
 * Delar mejlet i hälsning, brödtext och avslut. Avslutet börjar på första
 * raden efter hälsningen som är en känd avslutsfras ("Vänliga hälsningar",
 * "Kind regards" och liknande) och tar med varje rad därefter. Null när
 * avslutet inte går att hitta: då vet vi inte vad som är brödtext, och
 * hellre orört utkast än en text där något har försvunnit.
 */
export function delaUppMejl(body: string): MejlDelar | null {
  const rader = body.replace(/\r\n/g, '\n').trim().split('\n')
  let start = 0
  let halsning: string | null = null
  const forsta = rader[0]?.trim() ?? ''
  const forstaEnsam = rader.length > 1 && rader[1].trim() === ''
  // En lång första rad som börjar med en hälsning ("Hej, jag sökte ...") går
  // inte att dela säkert: AI:n skulle kunna stryka hälsningen.
  if (forsta.length > 60 && HALSNING_RE.test(forsta)) return null
  if (
    forsta &&
    forsta.length <= 60 &&
    (HALSNING_RE.test(forsta) ||
      // En kort egen rad som slutar med komma eller utropstecken ("Tjena Anna!") räknas också som hälsning.
      (forstaEnsam && forsta.length <= 40 && forsta.split(/\s+/).length <= 5 && /[,!]$/.test(forsta)))
  ) {
    halsning = rader[0].trimEnd()
    start = 1
  }
  const slut = rader.findIndex((r, i) => i >= start && r.trim().length <= 60 && AVSLUT_RE.test(r.trim()))
  if (slut < 0) return null
  const stycken = rader
    .slice(start, slut)
    .join('\n')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  const avslut = rader.slice(slut).join('\n').trimEnd()
  return { halsning, stycken, avslut }
}

/** Sätter ihop hälsning, de nya styckena och avslutet. Hälsning och avslut står som de var. */
export function sattTillbaka(delar: MejlDelar, stycken: readonly string[]): string {
  return [...(delar.halsning ? [delar.halsning] : []), ...stycken, delar.avslut].join('\n\n')
}

/** Brödtextens stycken utan hälsning och avslut (tomt när avslutet inte känns igen). */
export function styckenUrMejl(body: string): string[] {
  return delaUppMejl(body)?.stycken ?? []
}

/**
 * Ord i mejlets brödtext (utan hälsning och avslut), samma delar som går till
 * AI:n och som svaret räknas på. Känns avslutet inte igen räknas hela texten.
 */
export function ordIMejlet(body: string): number {
  const delar = delaUppMejl(body)
  return raknaOrdITexten(delar ? delar.stycken.join(' ') : body)
}

/** Tar bort talstreck och platshållare som modellen kan ha lämnat. */
export function tvattaText(s: string): string {
  return s
    .replace(/\[[^\]]{1,40}\]/g, '')
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/,\s*,/g, ',')
    .trim()
}

/**
 * Validerar AI:ns svar ({ amne, stycken }). Null när det inte håller: tomt,
 * fel antal stycken, för långt eller med platshållare kvar. Då används mallen.
 */
export function valideraAiMejl(raw: unknown, maxOrd = UPPFOLJNING_MAX_ORD): { subject: string; stycken: string[] } | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as { amne?: unknown; stycken?: unknown }
  if (typeof r.amne !== 'string' || !Array.isArray(r.stycken)) return null
  const subject = tvattaText(r.amne).replace(/[.\s]+$/, '').slice(0, MAX_AMNE)
  const stycken = r.stycken
    .filter((s): s is string => typeof s === 'string')
    .map(tvattaText)
    .filter((s) => s.length > 0)
  if (!subject || stycken.length < 2 || stycken.length > 4) return null
  if (raknaOrdITexten(stycken.join(' ')) > maxOrd) return null
  if ([subject, ...stycken].some((s) => /\[|\]|@|https?:\/\//.test(s))) return null
  return { subject, stycken }
}

/**
 * Ämnesraden i mallen, alltid mallens, aldrig AI:ns. Efter intervju eller
 * provjobb börjar den med AMNE_START, så att utkastTyp läser tillbaka samma
 * sort; hur man sökte spelar då ingen roll. Utan `typ`: en ansökan.
 */
export function mallAmne(u: Pick<UppfoljningUnderlag, 'jobTitle' | 'sprak' | 'kanal'> & { typ?: UppfoljningsTyp }): string {
  if (u.typ === 'intervju' || u.typ === 'provjobb') {
    const start = AMNE_START[u.typ]
    return (u.sprak === 'en' ? `${start.en}, ${u.jobTitle.trim()}` : `${start.sv}, tjänsten som ${titelILopText(u.jobTitle)}`).slice(0, MAX_AMNE)
  }
  if (u.sprak === 'en') return `Following up on my application for ${u.jobTitle.trim()}`.slice(0, MAX_AMNE)
  if (u.kanal === 'unsolicited') return `Min spontanansökan, ${titelILopText(u.jobTitle)}`.slice(0, MAX_AMNE)
  return `Min ansökan till tjänsten som ${titelILopText(u.jobTitle)}`.slice(0, MAX_AMNE)
}

function lista(ord: readonly string[], och: string): string {
  if (ord.length <= 1) return ord[0] ?? ''
  return `${ord.slice(0, -1).join(', ')} ${och} ${ord[ord.length - 1]}`
}

/**
 * Reservmallen: samma uppgifter som AI:n får, i tre korta stycken. Används när
 * AI:n inte svarar i tid eller svaret inte håller. Användaren står aldrig utan
 * utkast.
 */
export function uppfoljningsmall(u: UppfoljningUnderlag, namn: string | null): Mejl {
  if (u.typ === 'intervju' || u.typ === 'provjobb') return mallEfterMoment(u, u.typ, namn)
  const komp = u.kompetenser.slice(0, 3).map((k) => k.trim()).filter(Boolean)
  if (u.sprak === 'en') {
    const forsta =
      u.kanal === 'unsolicited'
        ? `I sent you an open application on ${enDatum(u.appliedAt)}, with ${u.jobTitle.trim()} in mind, and wanted to ask whether you have had a chance to look at it.`
        : `I applied for the ${u.jobTitle.trim()} position on ${enDatum(u.appliedAt)} and wanted to ask how the recruitment is progressing.`
    const andra = komp.length
      ? `I am still very interested. My experience with ${lista(komp, 'and')} is close to what you describe.`
      : 'I am still very interested in the role and in working with you.'
    const tredje = 'Please let me know if you need anything more from me. I am happy to answer by email or phone.'
    return { subject: mallAmne(u), body: sattIhop([forsta, andra, tredje], 'en', namn) }
  }
  const titel = titelILopText(u.jobTitle)
  const forsta =
    u.kanal === 'unsolicited'
      ? `Jag skickade en spontanansökan till er den ${langDag(u.appliedAt)}, med tanke på en roll som ${titel}, och undrar om ni hunnit titta på den.`
      : `Jag sökte tjänsten som ${titel} hos er den ${langDag(u.appliedAt)} och undrar hur långt ni har kommit i rekryteringen.`
  const andra = komp.length
    ? `Jag är fortfarande intresserad. Det jag gör i dag, ${lista(komp, 'och')}, ligger nära det ni beskriver${u.kanal === 'unsolicited' ? '' : ' i annonsen'}.`
    : 'Jag är fortfarande intresserad av tjänsten och av att jobba hos er.'
  const tredje = 'Hör gärna av er om ni vill ha något mer från mig. Jag svarar på det här mejlet eller i telefon.'
  return { subject: mallAmne(u), body: sattIhop([forsta, andra, tredje], 'sv', namn) }
}

/**
 * Reservmallen efter en genomförd intervju eller ett provjobb (byggspec 2.6):
 * ett tack med dagen, att man fortfarande är intresserad (högst två
 * kompetenser) och en fråga om när besked kommer.
 */
function mallEfterMoment(u: UppfoljningUnderlag, typ: 'intervju' | 'provjobb', namn: string | null): Mejl {
  const komp = u.kompetenser.slice(0, 2).map((k) => k.trim()).filter(Boolean)
  const dag = u.momentDag
  const subject = mallAmne({ ...u, typ })
  if (u.sprak === 'en') {
    const titel = u.jobTitle.trim()
    const vad = typ === 'intervju' ? 'the interview' : 'the trial day'
    const forsta = dag
      ? `Thank you for ${vad} on ${enDatum(dag)} for the ${titel} position.`
      : `Thank you for ${vad} for the ${titel} position.`
    const andra = komp.length
      ? `I am still interested. My experience with ${lista(komp, 'and')} is close to what you are looking for.`
      : 'I am still interested in the role and in working with you.'
    const tredje = 'Do you know when you expect to make a decision? Please let me know if you have further questions. I am happy to answer by email or phone.'
    return { subject, body: sattIhop([forsta, andra, tredje], 'en', namn) }
  }
  const titel = titelILopText(u.jobTitle)
  const forsta =
    typ === 'intervju'
      ? dag
        ? `Tack för intervjun den ${langDag(dag)} om tjänsten som ${titel}.`
        : `Tack för intervjun om tjänsten som ${titel}.`
      : dag
        ? `Tack för provjobbet den ${langDag(dag)}, för tjänsten som ${titel}.`
        : `Tack för provjobbet, för tjänsten som ${titel}.`
  const andra = komp.length
    ? `Jag är fortfarande intresserad. Det jag gör i dag, ${lista(komp, 'och')}, ligger nära det ni söker.`
    : 'Jag är fortfarande intresserad av tjänsten och av att jobba hos er.'
  const tredje = 'Vet ni när ni räknar med att lämna besked? Hör gärna av er om ni vill fråga något mer. Jag svarar på det här mejlet eller i telefon.'
  return { subject, body: sattIhop([forsta, andra, tredje], 'sv', namn) }
}

const EN_MANADER =['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function enDatum(dag: Dag): string {
  const [, m, d] = dag.split('-').map(Number)
  return `${d} ${EN_MANADER[m - 1]}`
}

/** `mailto:` med ämne och text. Vi skickar aldrig mejl själva. */
export function mailtoHref(m: Mejl, till?: string | null): string {
  const adress = till && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(till) ? encodeURIComponent(till) : ''
  return `mailto:${adress}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`
}

/** Validerar texten användaren sparar. */
export function valideraMejlText(raw: unknown): Mejl | { fel: 'subject' | 'body' } {
  const r = (raw ?? {}) as { subject?: unknown; body?: unknown }
  const subject = typeof r.subject === 'string' ? r.subject.replace(/\s+/g, ' ').trim() : ''
  const body = typeof r.body === 'string' ? r.body.replace(/\r\n/g, '\n').trim() : ''
  if (!subject || subject.length > MAX_AMNE) return { fel: 'subject' }
  if (!body || body.length > MAX_TEXT) return { fel: 'body' }
  return { subject, body }
}

/* ---------------------------------------------------------- spärren */

export type SparrLage =
  /** Ett nytt utkast får skrivas. */
  | 'ny'
  /** Gratis: kontots enda utkast hör till den här tjänsten och öppnas igen. */
  | 'ateranvand'
  /** Gratis: utkastet är använt på en annan tjänst. Betalväggen, "Jag har redan skickat det" kvar. */
  | 'premium_required'
  /** Premium: dagens 30 utkast är skrivna. */
  | 'dygnstak'

export interface SparrSvar {
  lage: SparrLage
  /** Premium: utkast kvar i dag. Gratis: null. */
  kvarIdag: number | null
}

/**
 * Spärren (F5), kontrolleras på servern. `utkast` är kontots rader med text
 * (body inte null), alla tjänster. Ett konto utan Premium får ett utkast;
 * samma tjänsts utkast går alltid att öppna igen. Premium: högst 30 per
 * dygn (svensk tid, från midnatt).
 *
 * Sorten (omgång 2): ett gratiskonto får öppna sitt utkast igen bara när det
 * hör till samma tjänst och är av samma sort (utkastTyp(subject) === typ). Ett
 * intervjuutkast räknas som kontots gratisutkast, så den som har använt sitt
 * på en ansökan möter betalväggen också när utkastet gäller samma tjänst.
 * Utan `typ` och `subject` gäller sorten 'ansokan' på båda sidor: som förut.
 */
export function uppfoljningSparr(ind: {
  harBetalt: boolean
  utkast: ReadonlyArray<{ application_id: string; created_at: string; subject?: string | null }>
  applicationId: string
  typ?: UppfoljningsTyp
  nu?: Date
}): SparrSvar {
  if (ind.harBetalt) {
    const idag = idagSv(ind.nu ?? new Date())
    const iDag = ind.utkast.filter((u) => dagFor(u.created_at) === idag).length
    const kvar = Math.max(0, UPPFOLJNING_PREMIUM_PER_DYGN - iDag)
    return { lage: kvar > 0 ? 'ny' : 'dygnstak', kvarIdag: kvar }
  }
  if (ind.utkast.length === 0) return { lage: 'ny', kvarIdag: null }
  const typ = ind.typ ?? 'ansokan'
  if (ind.utkast.some((u) => u.application_id === ind.applicationId && utkastTyp(u.subject) === typ)) {
    return { lage: 'ateranvand', kvarIdag: null }
  }
  return { lage: 'premium_required', kvarIdag: null }
}

/** Kan användaren få ett utkast för tjänsten utan att mötas av betalväggen? (för vyn) */
export function farUtkast(s: SparrSvar): boolean {
  return s.lage === 'ny' || s.lage === 'ateranvand'
}

/**
 * Uppföljd inom påminnelsetiden och inget oskickat utkast: blocket visar
 * "Följde upp" med Ångra och skriver inget nytt utkast (klicktestet
 * 2026-11-21). `nastaPaminnelse` är dagen tjänsten kan bli tyst igen.
 */
export function nyligenUppfoljd(
  lage: { utkast: Uppfoljning | null; senastSkickad: Uppfoljning | null; nastaPaminnelse: string | null },
  idag: Dag
): { id: string; dag: Dag; nasta: Dag } | null {
  const s = lage.senastSkickad
  if (lage.utkast || !s?.sent_at || !lage.nastaPaminnelse || lage.nastaPaminnelse <= idag) return null
  return { id: s.id, dag: s.sent_at, nasta: lage.nastaPaminnelse }
}

/* ----------------------------------------------------- skickad */

const VIA: readonly UppfoljningVia[] = ['epost', 'kopierat', 'eget']

/** Validerar "Skickade du mejlet?" och "Jag har redan skickat det". Datum förval i dag, aldrig framåt. */
export function valideraSkickad(raw: unknown, nu: Date = new Date()): { via: UppfoljningVia; datum: Dag } | { fel: 'via' | 'datum' } {
  const r = (raw ?? {}) as { via?: unknown; datum?: unknown }
  const via = r.via === undefined ? 'eget' : r.via
  if (typeof via !== 'string' || !(VIA as readonly string[]).includes(via)) return { fel: 'via' }
  const idag = idagSv(nu)
  let datum = idag
  if (r.datum !== undefined && r.datum !== null) {
    if (typeof r.datum !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.datum) || r.datum > idag) return { fel: 'datum' }
    datum = r.datum
  }
  return { via: via as UppfoljningVia, datum }
}
