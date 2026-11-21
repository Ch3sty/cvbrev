/**
 * Banan: stationerna för öppna tjänster (Översikt, Sökta tjänster) och en
 * tjänsts egna fyra steg (tjänstens sida). Plus Ska sökas-raderna (F3).
 * Klientsäker och ren.
 */
import { dagFor, dagarMellan, kortDag, klockslag, veckodagKort, veckodagOchDag } from './datum'
import { brickBokstaver, sorteraHandelser } from './lage'
import type {
  Bana,
  BanStation,
  Bricka,
  Dag,
  Handelse,
  SkaSokasRad,
  SparadAnnons,
  StegPunkt,
  TjanstLage,
  TjanstMedHistorik,
  TjanstensSteg,
} from './typer'

export function brickaFor(t: TjanstLage): Bricka {
  return { id: t.id, bokstaver: t.bokstaver, company: t.company, ton: t.ton }
}

/** "tis 10.00" för en bokad intervju, "tis 24 nov" utan klockslag. */
export function intervjuEtikettKort(tid: string | null): string | null {
  const dag = dagFor(tid)
  if (!dag) return null
  const kl = klockslag(tid)
  return kl ? `${veckodagKort(dag)} ${kl}` : veckodagOchDag(dag)
}

/** "tis 24 nov 10.00" (eller utan klockslag). */
export function intervjuEtikett(tid: string | null): string | null {
  const dag = dagFor(tid)
  if (!dag) return null
  const kl = klockslag(tid)
  return kl ? `${veckodagOchDag(dag)} ${kl}` : veckodagOchDag(dag)
}

/* ------------------------------------------------------------ Ska sökas */

/** "Sista dag tors 26 nov, 5 dagar kvar". */
export function sistaDagText(sistaDag: Dag | null, idag: Dag): string | null {
  if (!sistaDag) return null
  const kvar = dagarMellan(idag, sistaDag)
  if (kvar < 0) return 'Sista dag har passerat'
  if (kvar === 0) return `Sista dag i dag, ${veckodagOchDag(sistaDag)}`
  if (kvar === 1) return `Sista dag i morgon, ${veckodagOchDag(sistaDag)}`
  return `Sista dag ${veckodagOchDag(sistaDag)}, ${kvar} dagar kvar`
}

export function skaSokasRad(r: SparadAnnons, idag: Dag): SkaSokasRad {
  const sistaDag = r.last_application_date ?? null
  const dagarKvar = sistaDag ? dagarMellan(idag, sistaDag) : null
  return {
    id: r.id,
    jobTitle: r.job_title,
    company: r.company,
    location: r.location,
    bokstaver: brickBokstaver(r.company),
    jobAdUrl: r.job_ad_url,
    sistaDag,
    dagarKvar,
    passerad: dagarKvar !== null && dagarKvar < 0,
    sistaDagText: sistaDagText(sistaDag, idag),
    matchScore: r.match_score,
    kalla: r.source,
    afAdId: r.af_ad_id,
    note: r.note,
  }
}

/**
 * Ska sökas-raderna som visas: bara de som inte blivit sökta. Närmast sista
 * dag först, rader utan sista dag efter dem, passerade (grå) sist.
 */
export function skaSokasLista(rader: readonly SparadAnnons[], idag: Dag): SkaSokasRad[] {
  return rader
    .filter((r) => !r.application_id)
    .map((r) => skaSokasRad(r, idag))
    .sort((a, b) => {
      if (a.passerad !== b.passerad) return a.passerad ? 1 : -1
      if (a.sistaDag && b.sistaDag) return a.sistaDag.localeCompare(b.sistaDag)
      if (a.sistaDag !== b.sistaDag) return a.sistaDag ? -1 : 1
      return a.company.localeCompare(b.company, 'sv')
    })
}

/* ------------------------------------------------------------ banan */

/** Talet och ordet i rätt form: "1 sparad", "3 sparade". Gemensam för Jobbsökets räkneord. */
export const antalText = (n: number, en: string, flera: string) => (n === 1 ? `1 ${en}` : `${n} ${flera}`)

/**
 * Banans fyra stationer för Översikt och Sökta tjänster: Ska sökas, Sökt,
 * Intervju, Erbjudande. Avslutade står utanför banan.
 */
export function bana(tjanster: readonly TjanstLage[], skaSokas: readonly SkaSokasRad[]): Bana {
  const oppnaSkaSokas = skaSokas.filter((r) => !r.passerad)
  const sokt = tjanster.filter((t) => t.station === 'sokt')
  const intervju = tjanster.filter((t) => t.station === 'intervju')
  const erbjudande = tjanster.filter((t) => t.station === 'erbjudande')

  // Sökt: de tysta först, längst tystnad först; sedan äldst först.
  const soktOrdning = [...sokt].sort((a, b) => {
    if (a.tyst !== b.tyst) return a.tyst ? -1 : 1
    return b.dagarTyst - a.dagarTyst
  })
  // Intervju: bokade först, närmast först.
  const intervjuOrdning = [...intervju].sort((a, b) => {
    const ta = a.intervju?.lage === 'bokad' ? a.intervju.tid ?? '' : '~'
    const tb = b.intervju?.lage === 'bokad' ? b.intervju.tid ?? '' : '~'
    return ta < tb ? -1 : ta > tb ? 1 : 0
  })

  const narmast = oppnaSkaSokas.find((r) => r.sistaDag)
  const bokade = intervju.filter((t) => t.intervju?.lage === 'bokad').length
  const vantarBesked = intervju.length - bokade

  const intervjuDelar: string[] = []
  if (bokade) intervjuDelar.push(`${bokade} bokad${bokade === 1 ? '' : 'e'}`)
  if (vantarBesked) intervjuDelar.push(`${vantarBesked} väntar besked`)

  const stationer: BanStation[] = [
    {
      station: 'ska_sokas',
      antal: oppnaSkaSokas.length,
      brickor: oppnaSkaSokas.map((r) => ({
        id: r.id,
        bokstaver: r.bokstaver,
        company: r.company,
        ton: 'ska_sokas',
        tyst: false,
        etikett: null,
      })),
      undertext: oppnaSkaSokas.length
        ? narmast?.sistaDag
          ? `${antalText(oppnaSkaSokas.length, 'sparad', 'sparade')}, närmast ${veckodagKort(narmast.sistaDag)} ${kortDag(narmast.sistaDag)}`
          : antalText(oppnaSkaSokas.length, 'sparad', 'sparade')
        : 'Inga sparade',
    },
    {
      station: 'sokt',
      antal: sokt.length,
      brickor: soktOrdning.map((t) => ({
        ...brickaFor(t),
        tyst: t.tyst,
        etikett: t.tyst ? `tyst ${t.dagarTyst} dagar` : null,
      })),
      undertext: sokt.length ? `${sokt.length} väntar svar` : 'Inga väntar svar',
    },
    {
      station: 'intervju',
      antal: intervju.length,
      brickor: intervjuOrdning.map((t) => ({
        ...brickaFor(t),
        tyst: t.tyst,
        // En tyst intervju eller ett tyst provjobb får samma etikett som vid Sökt.
        etikett: t.tyst
          ? `tyst ${t.dagarTyst} dagar`
          : t.intervju?.lage === 'bokad'
            ? intervjuEtikettKort(t.intervju.tid)
            : null,
      })),
      undertext: intervjuDelar.length ? intervjuDelar.join(', ') : 'Ingen just nu',
    },
    {
      station: 'erbjudande',
      antal: erbjudande.length,
      brickor: erbjudande.map((t) => ({ ...brickaFor(t), tyst: false, etikett: null })),
      undertext: erbjudande.length ? antalText(erbjudande.length, 'erbjudande', 'erbjudanden') : 'Hit ska en bricka',
    },
  ]

  return { stationer, avslutade: tjanster.filter((t) => t.avslutad).map(brickaFor) }
}

/* ------------------------------------------------- tjänstens fyra steg */

const SVAR_TYPER = new Set(['rejected', 'interview_invited', 'interview_completed', 'trial_work_completed', 'offer_received', 'accepted', 'declined'])
const INTERVJU_TYPER = new Set(['interview_invited', 'interview_completed', 'trial_work_completed'])
const ERBJUDANDE_TYPER = new Set(['offer_received', 'accepted', 'declined'])

function forsta(handelser: Handelse[], typer: Set<string>): Handelse | null {
  return handelser.find((h) => typer.has(h.event_type)) ?? null
}

/**
 * Tjänstens egna fyra steg: Sökt, Svar, Intervju, Erbjudande (Sokta-tjanst).
 * Ett steg är klart när en händelse når det. Avslag och tackat nej gör
 * tjänsten avslutad; Svar är då det sista klara steget.
 */
export function tjanstensSteg(t: TjanstMedHistorik, lage: TjanstLage): TjanstensSteg {
  const h = sorteraHandelser(t.handelser)
  const svar = forsta(h, SVAR_TYPER)
  const intervju = forsta(h, INTERVJU_TYPER)
  const erbjudande = forsta(h, ERBJUDANDE_TYPER)
  const status = t.ansokan.current_status
  const avslutad = status === 'rejected' || status === 'declined'
  const intervjuTid = lage.intervju?.tid ?? null

  const aktuell: StegPunkt['steg'] = erbjudande && !avslutad
    ? 'erbjudande'
    : lage.station === 'intervju'
      ? 'intervju'
      : svar
        ? 'svar'
        : 'sokt'

  const intervjuDatum = intervjuTid ? dagFor(intervjuTid) : intervju?.occurred_at ?? null
  const punkter: StegPunkt[] = [
    {
      steg: 'sokt',
      klar: true,
      aktuell: aktuell === 'sokt',
      datum: lage.appliedAt,
      etikett: kortDag(lage.appliedAt),
    },
    {
      steg: 'svar',
      klar: !!svar,
      aktuell: aktuell === 'svar',
      datum: svar?.occurred_at ?? null,
      etikett: svar ? kortDag(svar.occurred_at) : null,
    },
    {
      steg: 'intervju',
      klar: !!h.find((x) => x.event_type === 'interview_completed' || x.event_type === 'trial_work_completed') || (!!erbjudande && !!intervju),
      aktuell: aktuell === 'intervju',
      datum: intervjuDatum,
      tid: intervjuTid,
      etikett: intervjuTid ? intervjuEtikett(intervjuTid) : intervjuDatum ? kortDag(intervjuDatum) : null,
    },
    {
      steg: 'erbjudande',
      klar: !!erbjudande,
      aktuell: aktuell === 'erbjudande',
      datum: erbjudande?.occurred_at ?? null,
      etikett: erbjudande ? kortDag(erbjudande.occurred_at) : null,
    },
  ]
  return { punkter, avslutad }
}
