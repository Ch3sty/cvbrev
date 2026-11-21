/**
 * Jobbsöket, omgång 1: typerna som motorn, laddarna, rutterna och vyerna
 * delar (BYGGSPEC avsnitt 3 och 4). Klientsäker, bara typer och konstanter.
 *
 * Datum utan klockslag skrivs 'YYYY-MM-DD' och avser svensk tid. Tidpunkter
 * (interview_at, created_at) är ISO-strängar.
 */
import type {
  ApplicationChannel,
  ApplicationEventType,
  JobApplication,
  JobApplicationEvent,
} from '@/lib/applications/status'
import type { FragaId } from '@/components/artiklar/intervjuprov/fragor'

export type { ApplicationChannel, ApplicationEventType, JobApplication, JobApplicationEvent }

/** 'YYYY-MM-DD' i svensk tid. */
export type Dag = string

/** Vilken sorts uppföljningsmejl som passar tjänsten just nu. */
export type UppfoljningsTyp = 'ansokan' | 'intervju' | 'provjobb'

/** Dagar utan besked efter en genomförd intervju eller ett provjobb innan vi påminner. */
export const INTERVJU_BESKED_DAGAR = 7
/** Dagar efter kallelsens datum innan "Sätt tiden" tas upp i Att göra nu. */
export const KALLELSE_UTAN_TID_DAGAR = 2

/* ------------------------------------------------------------- tabellerna */

/** job_application_events med kolumnerna från migreringen 20261121180000. */
export interface Handelse extends JobApplicationEvent {
  /** Intervjuns tid (ISO). 00:00 svensk tid = bara datumet satt. */
  interview_at?: string | null
  interview_place?: string | null
}

export type UppfoljningVia = 'epost' | 'kopierat' | 'eget'

/** En rad i job_application_followups. */
export interface Uppfoljning {
  id: string
  application_id: string
  user_id: string
  /** Null när uppföljningen loggades utan utkast ("Jag har redan skickat det"). */
  subject: string | null
  body: string | null
  rewrites: number
  /** Null = utkast som inte skickats. */
  sent_at: Dag | null
  sent_via: UppfoljningVia | null
  created_at: string
  updated_at: string
}

export type SparadKalla = 'match' | 'egen'

/** En rad i job_saved_ads. */
export interface SparadAnnons {
  id: string
  user_id: string
  job_title: string
  company: string
  location: string | null
  job_ad_url: string | null
  last_application_date: Dag | null
  source: SparadKalla
  af_ad_id: string | null
  match_score: number | null
  note: string | null
  /** Satt = blivit en sökt tjänst; raden visas inte längre. */
  application_id: string | null
  created_at: string
  updated_at: string
}

/** En sökt tjänst med sin historik, som laddarna läser den. */
export interface TjanstMedHistorik {
  ansokan: JobApplication
  /** Händelserna i tidsordning (occurred_at, created_at). */
  handelser: Handelse[]
  /** Uppföljningarna, äldst först. */
  uppfoljningar: Uppfoljning[]
}

/* ----------------------------------------------------------- härledningar */

/** Stationerna på banan för öppna tjänster (Översikt, Sökta tjänster). */
export type Station = 'ska_sokas' | 'sokt' | 'intervju' | 'erbjudande'

/** En tjänsts egna fyra steg (tjänstens sida). */
export type TjanstSteg = 'sokt' | 'svar' | 'intervju' | 'erbjudande'

/** Brickans ton, i listor, staplar och tratten. */
export type BrickTon = 'vantar' | 'tyst' | 'intervju' | 'erbjudande' | 'avslag' | 'ska_sokas'

export interface Bricka {
  id: string
  /** Två versaler, se brickBokstaver. */
  bokstaver: string
  company: string
  ton: BrickTon
}

/** Intervjuns läge för en sökt tjänst. */
export type IntervjuLage =
  /** Kallad, tid satt och inte passerad. */
  | 'bokad'
  /** Kallad, ingen tid satt. */
  | 'utan_tid'
  /** Kallad, tiden har passerat (dagen efter): "Hur gick intervjun?". */
  | 'hur_gick'
  /** Intervju genomförd eller provjobbat: väntar på besked. */
  | 'vantar_besked'

export interface IntervjuInfo {
  lage: IntervjuLage
  /** interview_at på senaste "Kallad till intervju", ISO. */
  tid: string | null
  /** Har tiden ett klockslag (inte 00:00 svensk tid)? */
  harKlockslag: boolean
  plats: string | null
  /** Id på händelsen som bär tiden (för PUT /api/applications/[id]/events/[eventId]). */
  handelseId: string | null
  /** Dagen intervjun hölls eller ska hållas. */
  dag: Dag | null
  /** Dagen kallelsen kom: occurred_at på senaste "Kallad till intervju". */
  kalladDag: Dag | null
}

/** En sökt tjänst färdig för en vy. */
export interface TjanstLage {
  id: string
  company: string
  jobTitle: string
  location: string | null
  bokstaver: string
  status: ApplicationEventType | null
  kanal: ApplicationChannel
  appliedAt: Dag
  /** Banans station, null för avslutade (avslag, tackat nej). */
  station: Exclude<Station, 'ska_sokas'> | null
  avslutad: boolean
  /** Senaste aktivitet: händelse eller skickad uppföljning. */
  senasteAktivitet: Dag
  /** Sorten uppföljning som passar nu. Null: kallad (med eller utan tid, eller tiden passerad), erbjudande, avslutad. */
  foljUppTyp: UppfoljningsTyp | null
  /** Gränsen i dagar för tystnad: 12 för 'ansokan', 7 för 'intervju' och 'provjobb'. 12 när foljUppTyp är null. */
  tystGrans: number
  /** Tyst: foljUppTyp finns och dagarTyst >= tystGrans. */
  tyst: boolean
  /** Dagar sedan senaste aktivitet. */
  dagarTyst: number
  /** Senaste aktivitet plus tystGrans. */
  tystSedan: Dag
  intervju: IntervjuInfo | null
  /** Har tjänsten ett oskickat utkast av rätt sort (utkastGaller)? */
  harUtkast: boolean
  /** Senaste skickade uppföljning. */
  senastUppfoljd: Dag | null
  harBrev: boolean
  letterId: string | null
  cvId: string | null
  ton: BrickTon
}

/* ---------------------------------------------------------- Att göra nu */

export type AttGoraTyp =
  | 'hur_gick_intervjun'
  | 'forbered_intervju'
  | 'satt_intervjutid'
  | 'folj_upp'
  | 'sok_fore_sista_dag'
  | 'af_rapport'
  | 'sok_en_till'

export type AttGoraIkon = 'kalender' | 'kuvert' | 'penna' | 'dokument' | 'flagga' | 'fraga'

export interface Knapp {
  text: string
  href: string
}

export interface AttGoraHandling {
  typ: AttGoraTyp
  /** Unik nyckel (typ plus id), för React och för avfärdande. */
  nyckel: string
  /** Handlingens datum, se BYGGSPEC F2. */
  datum: Dag
  /** Intervjutiden (ISO) för forbered_intervju; sorterar kommande intervjuer. */
  tid?: string | null
  /** Har datumet redan passerat (före i dag)? */
  passerad: boolean
  ikon: AttGoraIkon
  /** Ögonbrynet i versaler: "TISDAG 24 NOV 10.00", "TYST I 15 DAGAR". */
  overrad: string
  rubrik: string
  text: string
  knapp: Knapp
  ansokanId?: string
  sparadId?: string
  bokstaver?: string
}

export interface Vagg {
  /** Ögonbrynet: "LÖRDAG 21 NOV · VECKA 47". */
  overrad: string
  rubrik: string
  text: string
  /** Sidans enda primärknapp. */
  knapp: Knapp
}

export type AttGoraLage = 'handlingar' | 'inget_att_gora' | 'utan_cv'

export interface AttGoraNu {
  lage: AttGoraLage
  /** Högst tre, sorterade: passerade först, sedan stigande datum. */
  handlingar: AttGoraHandling[]
  /** Väggens rubrik och primärknapp, ur första handlingen eller läget. */
  vagg: Vagg
}

/* --------------------------------------------------------- Veckans mål */

export interface VeckansMal {
  /** Målet, 1 till 10. */
  mal: number
  /** Sant när målet är förvalet (kolumnen null). */
  forval: boolean
  /** Sökta tjänster med applied_at den här veckan. */
  sokta: number
  klart: boolean
  /** Hur många som fattas, 0 när klart. */
  kvar: number
  vecka: number
  start: Dag
  slut: Dag
  /** "Veckans mål: 2 av 3 sökta" eller "Veckans mål klart: 3 av 3". */
  text: string
}

/* ------------------------------------------------------------- Ska sökas */

export interface SkaSokasRad {
  id: string
  jobTitle: string
  company: string
  location: string | null
  bokstaver: string
  jobAdUrl: string | null
  sistaDag: Dag | null
  /** Dagar kvar till sista dagen (0 = i dag), null utan sista dag. */
  dagarKvar: number | null
  passerad: boolean
  /** "Sista dag tors 26 nov, 5 dagar kvar", "Sista dag har passerat", null utan dag. */
  sistaDagText: string | null
  matchScore: number | null
  kalla: SparadKalla
  afAdId: string | null
  note: string | null
}

/* ----------------------------------------------------------- Banan */

export interface BanStation {
  station: Station
  antal: number
  brickor: Array<Bricka & { tyst: boolean; etikett: string | null }>
  /** Raden under stationen: "4 väntar svar", "1 bokad, 1 väntar besked", "2 sparade". */
  undertext: string
}

export interface Bana {
  stationer: BanStation[]
  /** Avslutade tjänster (inte på banan). */
  avslutade: Bricka[]
}

export interface StegPunkt {
  steg: TjanstSteg
  /** Steget är nått. */
  klar: boolean
  /** Tjänsten står här just nu. */
  aktuell: boolean
  datum: Dag | null
  /** Bara intervjusteget: tiden om den finns. */
  tid?: string | null
  /** "2 nov", "tis 24 nov 10.00". */
  etikett: string | null
}

export interface TjanstensSteg {
  punkter: StegPunkt[]
  /** Avslag eller tackat nej: banan slutar vid Svar. */
  avslutad: boolean
}

/* ---------------------------------------------------------- Händelser */

export type HandelseListTyp = 'handelse' | 'foljde_upp' | 'kommande_intervju'

export interface HandelseListRad {
  typ: HandelseListTyp
  id: string
  datum: Dag
  /** Händelsetypen för typ 'handelse'. */
  eventType?: ApplicationEventType
  rubrik: string
  /** Anteckningen, platsen eller "Mejlet skickat" med mera. */
  text: string | null
  tid?: string | null
  /** Händelsens rad i databasen (rätta, ta bort); uppföljningens id för 'foljde_upp'. */
  radId: string
}

/* ---------------------------------------------------------- Statistik */

export interface VeckoStapel {
  /** ISO-veckonummer. */
  vecka: number
  start: Dag
  /** "v. 47" eller "v. 47, nu". */
  etikett: string
  arNu: boolean
  brickor: Bricka[]
}

export interface ManadsStapel {
  manad: string
  etikett: string
  arNu: boolean
  brickor: Bricka[]
}

export interface Tratt {
  sokta: { antal: number; sedan: Dag | null; brickor: Bricka[] }
  svar: { antal: number; kallelser: number; avslag: number; brickor: Bricka[] }
  intervju: { antal: number; genomforda: number; bokade: number; brickor: Bricka[] }
  erbjudande: { antal: number; brickor: Bricka[] }
}

export interface KanalRad {
  kanal: ApplicationChannel
  etikett: string
  antal: number
}

/* --------------------------------------------- Förberedelsen (F6) */

export interface FragaLage {
  fraga: FragaId
  kort: string
  /** Senaste betyget 1 till 5, null = inte övad. */
  betyg: number | null
  /** "Otillräckligt", "Tunt", "Godkänt", "Starkt", "Övertygande". */
  betygOrd: string | null
  /** Det som saknades i senaste provet, i den form meningen behöver. */
  saknades: string | null
  /** Senaste provets tidpunkt (ISO). */
  datum: string | null
  /** Senaste provets token, för "Öppna". */
  token: string | null
}

export interface Forberedelse {
  /** Alla sju: övade med lägst betyg först, sedan de ej övade i rekommenderad ordning. */
  fragor: FragaLage[]
  ovade: number
  /** Frågan "Öva på nästa fråga" leder till. */
  nastaFraga: FragaId
  /** Kraven ur det kopplade brevet; null när brevet saknar krav (blocket visas inte). */
  krav: { krav: string; harSvar: boolean }[] | null
  kravMedSvar: number
}

/* ----------------------------------------------- Jobbcoachen (F9) */

export type CoachForslagTyp = 'erbjudande' | 'lonefragan' | 'uppfoljning' | 'fragor_till_arbetsgivaren' | 'vanta_besked' | 'avslag'

export interface CoachForslag {
  typ: CoachForslagTyp | 'fast'
  fraga: string
  bokstaver: string | null
  ansokanId: string | null
}

export interface CoachForslagLista {
  lage: 'fran_laget' | 'fasta'
  forslag: CoachForslag[]
}

/* ----------------------------------------------- Adressen (F8) */

export type SoktaVy = 'lista' | 'statistik' | 'rapport'
export type SoktaFilter = 'alla' | 'folj-upp' | 'ska-sokas' | 'vantar-svar' | 'intervju' | 'erbjudande' | 'avslutade'
export type TjanstFokus = 'forbered' | 'folj-upp' | 'hur-gick' | 'andra-tid' | null

/* ----------------------------------------------- Sökta tjänster-listan */

export type SoktaGrupp = 'folj_upp' | 'intervju' | 'erbjudande' | 'ska_sokas' | 'vantar_svar' | 'avslutade'

export interface SoktaLista {
  folj_upp: TjanstLage[]
  intervju: TjanstLage[]
  erbjudande: TjanstLage[]
  ska_sokas: SkaSokasRad[]
  vantar_svar: TjanstLage[]
  avslutade: TjanstLage[]
  /** Antalen i filterraden. */
  antal: Record<SoktaFilter, number>
}

/** Konstanter som vyerna och rutterna delar. */
export const VECKANS_MAL_FORVAL = 3
export const VECKANS_MAL_MIN = 1
export const VECKANS_MAL_MAX = 10
export const UPPFOLJNING_MAX_OMSKRIVNINGAR = 3
export const UPPFOLJNING_GRATIS_UTKAST = 1
export const UPPFOLJNING_PREMIUM_PER_DYGN = 30
export const UPPFOLJNING_MAX_ORD = 90
export const ATT_GORA_MAX = 3
export const FORBERED_INOM_DAGAR = 14
export const SISTA_DAG_INOM_DAGAR = 7
export const INTERVJU_PLATS_MAX = 200
