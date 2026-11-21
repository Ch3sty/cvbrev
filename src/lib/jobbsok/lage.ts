/**
 * Läget för en sökt tjänst: brickan, stationen, tystnaden och intervjun
 * (BYGGSPEC F2, F5, F6). Klientsäker och ren.
 */
import { NO_RESPONSE_NUDGE_DAYS, statusHasResponse, type ApplicationEventType } from '@/lib/applications/status'
import { dagFor, dagarMellan, idagSv, klockslag, plusDagar } from './datum'
import type {
  BrickTon,
  Dag,
  Handelse,
  IntervjuInfo,
  Station,
  TjanstLage,
  TjanstMedHistorik,
  Uppfoljning,
} from './typer'

/* ------------------------------------------------------------- brickan */

/** Bolagsformer och småord som inte ska bli en bokstav i brickan. */
const FYLLORD = new Set([
  'ab', 'aktiebolag', 'publ', 'hb', 'kb', 'ek', 'för', 'ekonomisk', 'förening', 'ideell',
  'i', 'och', 'av', 'the', 'of', 'and', '&', 'sverige', 'sweden', 'group', 'gruppen', 'ltd', 'inc', 'as', 'oy',
])

/**
 * Brickans två bokstäver (rummets figur, UNDERLAG): initialerna i de två
 * första orden ("Umeå Energi" UE, "Region Västerbotten" RV), eller de två
 * första bokstäverna när namnet är ett ord ("Norrmejerier" NO, "Ålö AB" ÅL,
 * "PwC" PW). Bolagsformer räknas inte som ord.
 */
export function brickBokstaver(company: string): string {
  const ord = (company ?? '')
    .replace(/[()"'’.,]/g, ' ')
    .split(/[\s/-]+/)
    .map((o) => o.trim())
    .filter((o) => /\p{L}|\p{N}/u.test(o))
  const viktiga = ord.filter((o) => !FYLLORD.has(o.toLocaleLowerCase('sv-SE')))
  const kalla = viktiga.length > 0 ? viktiga : ord
  if (kalla.length === 0) return '?'
  const tecken = (o: string) => Array.from(o.replace(/[^\p{L}\p{N}]/gu, ''))
  let ut: string
  if (kalla.length >= 2) {
    ut = (tecken(kalla[0])[0] ?? '') + (tecken(kalla[1])[0] ?? '')
  } else {
    ut = tecken(kalla[0]).slice(0, 2).join('')
  }
  return ut.toLocaleUpperCase('sv-SE') || '?'
}

/* ------------------------------------------------------------ stationen */

const INTERVJU_STATUS: readonly ApplicationEventType[] = ['interview_invited', 'interview_completed', 'trial_work_completed']

/** Avslutad utan jobb: avslag eller tackat nej. Tackat ja står kvar vid Erbjudande. */
export function arAvslutad(status: ApplicationEventType | null): boolean {
  return status === 'rejected' || status === 'declined'
}

/** Banans station för en sökt tjänst; null för avslutade. */
export function stationFor(status: ApplicationEventType | null): Exclude<Station, 'ska_sokas'> | null {
  if (arAvslutad(status)) return null
  if (status === 'offer_received' || status === 'accepted') return 'erbjudande'
  if (status && INTERVJU_STATUS.includes(status)) return 'intervju'
  return 'sokt'
}

/* ------------------------------------------------------------ intervjun */

/** Strängjämförelse tecken för tecken (ISO-datum), oberoende av språkinställning. */
export function jamfor(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** Händelserna i tidsordning, äldst först. */
export function sorteraHandelser<T extends { occurred_at: string; created_at: string }>(h: readonly T[]): T[] {
  return [...h].sort((a, b) =>
    a.occurred_at === b.occurred_at ? jamfor(a.created_at, b.created_at) : jamfor(a.occurred_at, b.occurred_at)
  )
}

/** Senaste "Kallad till intervju", eller null. */
export function senasteKallelse(handelser: readonly Handelse[]): Handelse | null {
  const k = sorteraHandelser(handelser).filter((h) => h.event_type === 'interview_invited')
  return k.length ? k[k.length - 1] : null
}

/**
 * Intervjuns läge. Bara för tjänster i intervjusteget.
 * "Hur gick intervjun?" gäller från dagen efter intervjun (F6).
 */
export function intervjuInfo(
  status: ApplicationEventType | null,
  handelser: readonly Handelse[],
  nu: Date = new Date()
): IntervjuInfo | null {
  if (!status || !INTERVJU_STATUS.includes(status)) return null
  const kallelse = senasteKallelse(handelser)
  const tid = kallelse?.interview_at ?? null
  const tidDag = tid ? dagFor(tid) : null
  const bas = {
    tid,
    harKlockslag: klockslag(tid) !== null,
    plats: kallelse?.interview_place ?? null,
    handelseId: kallelse?.id ?? null,
  }
  if (status === 'interview_invited') {
    if (!tid || !tidDag) return { ...bas, lage: 'utan_tid', dag: null }
    const idag = idagSv(nu)
    return { ...bas, lage: idag > tidDag ? 'hur_gick' : 'bokad', dag: tidDag }
  }
  const sorterade = sorteraHandelser(handelser)
  const genomford = [...sorterade].reverse().find((h) => h.event_type === status)
  return { ...bas, lage: 'vantar_besked', dag: genomford?.occurred_at ?? tidDag }
}

/* ------------------------------------------------------------ tystnaden */

/** Senaste skickade uppföljningen, eller null. */
export function senastUppfoljd(uppfoljningar: readonly Uppfoljning[]): Dag | null {
  let ut: Dag | null = null
  for (const u of uppfoljningar) if (u.sent_at && (!ut || u.sent_at > ut)) ut = u.sent_at
  return ut
}

/**
 * Senaste aktivitet: senaste händelsen eller senaste skickade uppföljningen.
 * Utan händelser (en lista utan historik) gäller status_updated_at, sedan
 * applied_at.
 */
export function senasteAktivitet(t: TjanstMedHistorik): Dag {
  const a = t.ansokan
  let senaste: Dag | null = null
  for (const h of t.handelser) if (!senaste || h.occurred_at > senaste) senaste = h.occurred_at
  if (!senaste) senaste = dagFor(a.status_updated_at) ?? dagFor(a.applied_at) ?? dagFor(a.created_at) ?? idagSv()
  const uppf = senastUppfoljd(t.uppfoljningar)
  return uppf && uppf > senaste ? uppf : senaste
}

/**
 * Kan tjänsten bli tyst? Öppna tjänster som väntar på arbetsgivaren. Inte
 * avslutade, inte erbjudanden och aldrig en tjänst i intervjusteget
 * (kallad, med eller utan tid, genomförd intervju eller genomfört provjobb).
 *
 * Spärren för intervjusteget (beslut 14, docs/beslut-jobbsoket-2026-11-21.md)
 * gäller tills intervjulägena har egna texter och eget utkast (Jobbsöket
 * omgång 2). I dag skulle "har inte hört något" och utkastet för en obesvarad
 * ansökan gå till en arbetsgivare som redan har kallat eller intervjuat.
 * `intervju` står kvar i signaturen för omgång 2.
 */
export function kanBliTyst(status: ApplicationEventType | null, _intervju: IntervjuInfo | null): boolean {
  if (arAvslutad(status) || status === 'offer_received' || status === 'accepted') return false
  if (status && INTERVJU_STATUS.includes(status)) return false
  return true
}

/* ------------------------------------------------------------ helheten */

export function brickTon(l: Pick<TjanstLage, 'avslutad' | 'station' | 'tyst'>): BrickTon {
  if (l.avslutad) return 'avslag'
  if (l.station === 'erbjudande') return 'erbjudande'
  if (l.station === 'intervju') return 'intervju'
  return l.tyst ? 'tyst' : 'vantar'
}

/** En sökt tjänst färdig för vyerna. */
export function tjanstLage(t: TjanstMedHistorik, nu: Date = new Date()): TjanstLage {
  const a = t.ansokan
  const idag = idagSv(nu)
  const status = a.current_status
  const handelser = t.handelser
  const intervju = intervjuInfo(status, handelser, nu)
  const aktivitet = senasteAktivitet(t)
  const dagarTyst = Math.max(0, dagarMellan(aktivitet, idag))
  const tyst = kanBliTyst(status, intervju) && dagarTyst >= NO_RESPONSE_NUDGE_DAYS
  const station = stationFor(status)
  const avslutad = arAvslutad(status)
  const lage: TjanstLage = {
    id: a.id,
    company: a.company,
    jobTitle: a.job_title,
    location: a.location,
    bokstaver: brickBokstaver(a.company),
    status,
    kanal: a.application_channel,
    appliedAt: dagFor(a.applied_at) ?? dagFor(a.created_at) ?? idag,
    station,
    avslutad,
    senasteAktivitet: aktivitet,
    tyst,
    dagarTyst,
    tystSedan: plusDagar(aktivitet, NO_RESPONSE_NUDGE_DAYS),
    intervju,
    harUtkast: t.uppfoljningar.some((u) => !u.sent_at && !!u.body),
    senastUppfoljd: senastUppfoljd(t.uppfoljningar),
    harBrev: !!a.letter_id,
    letterId: a.letter_id,
    cvId: a.cv_id,
    ton: 'vantar',
  }
  lage.ton = brickTon(lage)
  return lage
}

/** Har tjänsten fått svar (avslag, kallelse, erbjudande)? Ur händelserna, inte bara statusen. */
export function harFattSvar(t: TjanstMedHistorik): boolean {
  if (t.handelser.length === 0) return statusHasResponse(t.ansokan.current_status)
  return t.handelser.some((h) => h.event_type !== 'applied' && h.event_type !== 'no_response')
}

/** Nästa påminnelse efter en skickad uppföljning: tolv dagar senare (F5). */
export function nastaPaminnelse(skickad: Dag): Dag {
  return plusDagar(skickad, NO_RESPONSE_NUDGE_DAYS)
}
