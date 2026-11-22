/**
 * Att göra nu (BYGGSPEC F2, ordningen rättad av art director 2026-11-21 så att
 * skissen gäller): högst tre handlingar i ordningen
 *   1. "Hur gick intervjun?" (äldst först)
 *   2. kommande intervju inom 14 dagar (efter intervjutid)
 *   3. allt övrigt: det som passerat först, sedan stigande datum
 *   4. "Sök en tjänst till" alltid sist (fyllnad)
 * Den första handlingen är väggens rubrik och
 * bär sidans enda primärknapp. Finns inget att göra säger väggen läget som det
 * är och knappen går till Matchade jobb. Klientsäker och ren.
 *
 * Kandidaterna:
 *   1. hur_gick_intervjun   intervjutiden passerad, ingen "Intervju genomförd"; datum = dagen efter
 *   2. forbered_intervju    intervjutid inom 14 dagar; datum = intervjudagen
 *   -  satt_intervjutid     kallad utan tid, två dagar efter kallelsen (skaSattaTiden); datum = kallelsen plus två dagar
 *   -  uppdatera_test       kallad till test, fjorton dagar efter kallelsen (9 B); datum = kallelsen plus fjorton dagar
 *   3. folj_upp             tyst (12 dagar efter en ansökan, 7 efter intervju eller provjobb, räknat från
 *                           senaste händelse eller uppföljning); datum = dagen tystnaden inträffade
 *   4. sok_fore_sista_dag   Ska sökas med sista dag inom 7 dagar; datum = sista dagen
 *   5. af_rapport           dagens regel: den 1 till 14 och något sökt förra månaden; datum = den 14:e
 *   6. sok_en_till          veckans mål inte nått och färre än tre handlingar; datum = veckans söndag
 */
import { SKRIV_BREV_HREF, CV_HREF } from '@/lib/letters/lage'
import { AF_REPORT_DEADLINE_DAY } from '@/lib/applications/afReport'
import {
  dagarMellan,
  idagSv,
  isoVecka,
  klockslag,
  kortDag,
  langDag,
  manadEtikett,
  narText,
  plusDagar,
  veckodagNamn,
  veckodagOchDag,
} from './datum'
import { jobbHref, soktaHref, tjanstHref, SOKTA_HREF } from './adress'
import { skaSattaTiden } from './lage'
import { momentDag, momentOrd } from './intervju'
import {
  ATT_GORA_MAX,
  FORBERED_INOM_DAGAR,
  KALLELSE_UTAN_TID_DAGAR,
  SISTA_DAG_INOM_DAGAR,
  TEST_UPPDATERA_DAGAR,
  type AttGoraHandling,
  type AttGoraNu,
  type AttGoraTyp,
  type Dag,
  type SkaSokasRad,
  type TjanstLage,
  type Vagg,
  type VeckansMal,
} from './typer'

export interface AttGoraIndata {
  tjanster: readonly TjanstLage[]
  skaSokas: readonly SkaSokasRad[]
  veckansMal: VeckansMal
  harCv: boolean
  /** Sökta tjänster förra kalendermånaden (rapporten till Arbetsförmedlingen). */
  sokteForraManaden: number
  /** Övade intervjufrågor och den med lägst senaste betyg, för Förbered-texten. */
  intervjuprov?: { ovade: number; lagst: { kort: string; betyg: number } | null } | null
  /** Bästa nya träffen i Matchade jobb, om laddaren har den. */
  bastaTraff?: { id: string; jobTitle: string; company: string; score: number } | null
  /** Förnamnet, för väggen utan CV. */
  fornamn?: string | null
  /** Nycklar användaren avfärdat (klientens "Senare"). */
  avfardade?: ReadonlySet<string>
  nu?: Date
}

const PRIORITET: Record<AttGoraTyp, number> = {
  hur_gick_intervjun: 0,
  forbered_intervju: 1,
  satt_intervjutid: 2,
  uppdatera_test: 3,
  folj_upp: 4,
  sok_fore_sista_dag: 5,
  af_rapport: 6,
  sok_en_till: 7,
}

/** Uppföljning efter intervju eller provjobb (inte efter en obesvarad ansökan)? */
function efterMoment(t: TjanstLage): boolean {
  return t.foljUppTyp === 'intervju' || t.foljUppTyp === 'provjobb'
}

const ORDTAL = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
/** "tre", "11". */
export function ordtal(n: number): string {
  return ORDTAL[n] ?? String(n)
}
const stor = (s: string) => s.charAt(0).toLocaleUpperCase('sv-SE') + s.slice(1)
const versaler = (s: string) => s.toLocaleUpperCase('sv-SE')

/** Tjänstetiteln mitt i en mening: "Ekonomiassistent" blir "ekonomiassistent", "IT-tekniker" står kvar. */
export function titelILopText(titel: string): string {
  const t = titel.trim()
  if (t.length >= 2 && t[1] === t[1].toLocaleLowerCase('sv-SE') && t[1] !== t[1].toLocaleUpperCase('sv-SE')) {
    return t.charAt(0).toLocaleLowerCase('sv-SE') + t.slice(1)
  }
  return t
}

function forberedText(prov: AttGoraIndata['intervjuprov']): string {
  if (!prov || prov.ovade === 0) return 'Ingen av de sju vanligaste frågorna är övad än. En kvart räcker för den första.'
  const bas = `${stor(ordtal(prov.ovade))} av sju frågor övade.`
  if (prov.lagst && prov.lagst.betyg <= 3) return `${bas} Börja med ${prov.lagst.kort}, där du fick ${prov.lagst.betyg} av 5.`
  return prov.ovade < 7 ? `${bas} Ta en du inte övat på än.` : bas
}

/** Alla kandidater, osorterade. */
export function attGoraKandidater(ind: AttGoraIndata): AttGoraHandling[] {
  const nu = ind.nu ?? new Date()
  const idag = idagSv(nu)
  const ut: AttGoraHandling[] = []

  for (const t of ind.tjanster) {
    const i = t.intervju
    // 1. Hur gick intervjun?
    if (i?.lage === 'hur_gick' && i.dag) {
      const datum = plusDagar(i.dag, 1)
      ut.push({
        typ: 'hur_gick_intervjun',
        nyckel: `hur_gick_intervjun:${t.id}`,
        datum,
        passerad: datum < idag,
        ikon: 'fraga',
        overrad: versaler(`Intervjun var ${veckodagNamn(i.dag)} ${kortDag(i.dag)}`),
        rubrik: `Hur gick intervjun på ${t.company}?`,
        text: `${t.jobTitle}. Säg hur det gick, så stämmer listan.`,
        knapp: { text: 'Berätta hur det gick', href: tjanstHref(t.id, 'hur-gick') },
        ansokanId: t.id,
        bokstaver: t.bokstaver,
      })
    }
    // 2. Förbered intervjun.
    if (i?.lage === 'bokad' && i.tid && i.dag && Date.parse(i.tid) > nu.getTime()) {
      const kvar = dagarMellan(idag, i.dag)
      if (kvar <= FORBERED_INOM_DAGAR) {
        const kl = klockslag(i.tid)
        ut.push({
          typ: 'forbered_intervju',
          nyckel: `forbered_intervju:${t.id}`,
          datum: i.dag,
          tid: i.tid,
          passerad: false,
          ikon: 'kalender',
          overrad: versaler(`${veckodagNamn(i.dag)} ${kortDag(i.dag)}${kl ? ` ${kl}` : ''}`),
          rubrik: `Förbered intervjun på ${t.company}`,
          text: forberedText(ind.intervjuprov),
          knapp: { text: 'Förbered intervjun', href: tjanstHref(t.id, 'forbered') },
          ansokanId: t.id,
          bokstaver: t.bokstaver,
        })
      }
    }
    // Sätt tiden: kallad utan tid, två dagar efter kallelsen.
    if (i && i.kalladDag && skaSattaTiden(i, idag)) {
      const datum = plusDagar(i.kalladDag, KALLELSE_UTAN_TID_DAGAR)
      ut.push({
        typ: 'satt_intervjutid',
        nyckel: `satt_intervjutid:${t.id}`,
        datum,
        passerad: datum < idag,
        ikon: 'kalender',
        overrad: versaler(`Kallad ${kortDag(i.kalladDag)}`),
        rubrik: `Sätt tiden för intervjun på ${t.company}`,
        text: `${t.jobTitle}. Med tiden satt påminner vi före intervjun och frågar hur det gick.`,
        knapp: { text: 'Sätt tiden', href: tjanstHref(t.id, 'andra-tid') },
        ansokanId: t.id,
        bokstaver: t.bokstaver,
      })
    }
    // Kallad till test (9 B): fjorton dagar efter kallelsen frågar vi en gång vad som hände.
    if (t.status === 'test_invited' && t.kalladTillTest && plusDagar(t.kalladTillTest, TEST_UPPDATERA_DAGAR) <= idag) {
      const datum = plusDagar(t.kalladTillTest, TEST_UPPDATERA_DAGAR)
      ut.push({
        typ: 'uppdatera_test',
        nyckel: `uppdatera_test:${t.id}`,
        datum,
        passerad: datum < idag,
        ikon: 'fraga',
        overrad: versaler(`Kallad till test ${kortDag(t.kalladTillTest)}`),
        rubrik: `Vad hände efter testet hos ${t.company}?`,
        text: `${t.jobTitle}. Lägg till intervjun eller beskedet, så stämmer listan.`,
        knapp: { text: 'Uppdatera tjänsten', href: tjanstHref(t.id) },
        ansokanId: t.id,
        bokstaver: t.bokstaver,
      })
    }
    // 3. Följ upp efter intervju eller provjobb: fråga om besked.
    if (t.tyst && efterMoment(t)) {
      const m = momentOrd(t)
      const dag = langDag(momentDag(t))
      ut.push({
        typ: 'folj_upp',
        nyckel: `folj_upp:${t.id}:${t.tystSedan}`,
        datum: t.tystSedan,
        passerad: t.tystSedan < idag,
        ikon: 'kuvert',
        overrad: versaler(`Inget besked på ${t.dagarTyst} dagar`),
        rubrik: `Fråga ${t.company} om besked`,
        text: `${t.jobTitle}. ${m.stor} var den ${dag}. ${t.harUtkast ? 'Utkastet till mejlet är skrivet.' : 'Fråga när du kan vänta besked.'}`,
        knapp: { text: t.harUtkast ? 'Öppna utkastet' : 'Fråga om besked', href: tjanstHref(t.id, 'folj-upp') },
        ansokanId: t.id,
        bokstaver: t.bokstaver,
      })
    } else if (t.tyst) {
      // 3. Följ upp en obesvarad ansökan.
      ut.push({
        typ: 'folj_upp',
        nyckel: `folj_upp:${t.id}:${t.tystSedan}`,
        datum: t.tystSedan,
        passerad: t.tystSedan < idag,
        ikon: 'kuvert',
        overrad: versaler(`Tyst i ${t.dagarTyst} dagar`),
        rubrik: `Följ upp ${t.company}`,
        text: `${t.jobTitle}, sökt ${langDag(t.appliedAt)}. Ett kort mejl brukar ge besked${t.harUtkast ? ', och utkastet är skrivet' : ''}.`,
        knapp: { text: t.harUtkast ? 'Öppna utkastet' : 'Skriv uppföljningen', href: tjanstHref(t.id, 'folj-upp') },
        ansokanId: t.id,
        bokstaver: t.bokstaver,
      })
    }
  }

  // 4. Sök före sista dag.
  for (const r of ind.skaSokas) {
    if (!r.sistaDag || r.dagarKvar === null || r.dagarKvar < 0 || r.dagarKvar > SISTA_DAG_INOM_DAGAR) continue
    ut.push({
      typ: 'sok_fore_sista_dag',
      nyckel: `sok_fore_sista_dag:${r.id}`,
      datum: r.sistaDag,
      passerad: false,
      ikon: 'penna',
      overrad: versaler(`Sista dag ${r.dagarKvar === 0 ? 'i dag' : `${veckodagNamn(r.sistaDag)} ${kortDag(r.sistaDag)}`}`),
      rubrik: `Sök ${r.company} ${r.dagarKvar === 0 ? 'i dag' : `senast ${narText(r.sistaDag, idag).replace(/^på /, '')}`}`,
      text: `${r.jobTitle}${r.matchScore !== null ? `, ${r.matchScore} % matchgrad` : ''}.`,
      // Rutten väljer: Matchade jobb när träffen finns bland de bästa, annars Skriv brev ifyllt med raden.
      knapp: { text: 'Skriv brevet', href: `${SOKTA_HREF}/skriv-brev?id=${encodeURIComponent(r.id)}` },
      sparadId: r.id,
      bokstaver: r.bokstaver,
    })
  }

  // 5. Rapporten till Arbetsförmedlingen: dagens regel och villkor.
  const dagIManaden = Number(idag.slice(8, 10))
  if (dagIManaden <= AF_REPORT_DEADLINE_DAY && ind.sokteForraManaden > 0) {
    const datum = `${idag.slice(0, 8)}${String(AF_REPORT_DEADLINE_DAY).padStart(2, '0')}`
    const [y, m] = idag.slice(0, 7).split('-').map(Number)
    const forra = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
    ut.push({
      typ: 'af_rapport',
      nyckel: `af_rapport:${forra}`,
      datum,
      passerad: false,
      ikon: 'dokument',
      overrad: versaler(`Senast ${kortDag(datum)}`),
      rubrik: `Rapporten för ${manadEtikett(forra).toLocaleLowerCase('sv-SE')}`,
      text:
        ind.sokteForraManaden === 1
          ? '1 sökt jobb att rapportera till Arbetsförmedlingen. Vi har redan fyllt i det åt dig.'
          : `${ind.sokteForraManaden} sökta jobb att rapportera till Arbetsförmedlingen. Vi har redan fyllt i dem åt dig.`,
      knapp: { text: 'Öppna rapporten', href: soktaHref({ vy: 'rapport', manad: forra }) },
    })
  }

  return ut.filter((h) => !ind.avfardade?.has(h.nyckel))
}

/** Grupp i sorteringen: 0 hur gick, 1 kommande intervju, 2 övrigt, 3 Sök en tjänst till. */
function sorteringsgrupp(typ: AttGoraTyp): number {
  if (typ === 'hur_gick_intervjun') return 0
  if (typ === 'forbered_intervju') return 1
  if (typ === 'sok_en_till') return 3
  return 2
}

const jamfor = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)

/**
 * Sorteringen: "Hur gick intervjun?" först, sedan kommande intervjuer efter
 * tid, sedan övrigt (passerade först, sedan stigande datum), "Sök en tjänst
 * till" sist. Samma datum: kandidatordningen.
 */
export function sorteraHandlingar(h: readonly AttGoraHandling[]): AttGoraHandling[] {
  return [...h].sort((a, b) => {
    const ga = sorteringsgrupp(a.typ)
    const gb = sorteringsgrupp(b.typ)
    if (ga !== gb) return ga - gb
    if (ga === 1) return jamfor(a.tid ?? a.datum, b.tid ?? b.datum)
    if (a.passerad !== b.passerad) return a.passerad ? -1 : 1
    if (a.datum !== b.datum) return jamfor(a.datum, b.datum)
    return PRIORITET[a.typ] - PRIORITET[b.typ]
  })
}

function sokEnTill(ind: AttGoraIndata, idag: Dag): AttGoraHandling {
  const m = ind.veckansMal
  const t = ind.bastaTraff
  // Inga sökta tjänster och inget under Ska sökas: den första, inte "till"
  // (beslut 22, docs/beslut-jobbsoket-2026-11-21.md).
  const forsta = ind.tjanster.length === 0 && ind.skaSokas.length === 0
  return {
    typ: 'sok_en_till',
    nyckel: `sok_en_till:${m.start}`,
    datum: m.slut,
    passerad: false,
    ikon: 'flagga',
    overrad: versaler(`Veckans mål ${m.sokta} av ${m.mal}`),
    rubrik: forsta ? 'Sök din första tjänst' : m.kvar === 1 ? 'Sök en tjänst till' : `Sök ${ordtal(m.kvar)} tjänster till`,
    text: t
      ? `${t.jobTitle} hos ${t.company} passar dig till ${t.score} %.`
      : forsta
        ? 'Matchade jobb har annonser som passar ditt CV. Har du redan sökt en tjänst loggar du den med företag, tjänst och datum.'
        : `${stor(ordtal(m.kvar))} kvar till veckans mål. Matchade jobb har annonser som passar ditt CV.`,
    knapp: { text: t ? 'Se annonsen' : 'Till Matchade jobb', href: jobbHref(t?.id ?? null) },
  }
}

function vaggOverrad(idag: Dag): string {
  return versaler(`${veckodagNamn(idag)} ${kortDag(idag)} · vecka ${isoVecka(idag)}`)
}

/** Väggen ur första handlingen. */
export function vaggForHandling(h: AttGoraHandling, ind: AttGoraIndata, idag: Dag): Vagg {
  const overrad = vaggOverrad(idag)
  const t = h.ansokanId ? ind.tjanster.find((x) => x.id === h.ansokanId) : undefined
  switch (h.typ) {
    case 'forbered_intervju': {
      const i = t?.intervju
      const dag = i?.dag ?? h.datum
      const kl = klockslag(i?.tid ?? null)
      const prov = ind.intervjuprov
      const ovade = !prov || prov.ovade === 0
        ? 'Du har inte övat på frågorna än.'
        : `Du har övat på ${ordtal(prov.ovade)} av de sju vanligaste frågorna.`
      return {
        overrad,
        rubrik: `Intervju på ${t?.company ?? ''} ${narText(dag, idag)}`.replace(/\s+/g, ' ').trim(),
        text: `${t?.jobTitle ?? ''}, ${veckodagNamn(dag)} ${langDag(dag)}${kl ? ` klockan ${kl}` : ''}. ${ovade}`,
        knapp: h.knapp,
      }
    }
    case 'hur_gick_intervjun':
      return { overrad, rubrik: h.rubrik, text: `${t?.jobTitle ?? ''}. Den är genomförd, flyttad eller inställd? Ett tryck räcker.`, knapp: h.knapp }
    case 'satt_intervjutid':
      return {
        overrad,
        rubrik: h.rubrik,
        text: t?.intervju?.kalladDag
          ? `${t.jobTitle}. Du blev kallad den ${langDag(t.intervju.kalladDag)}. Med tiden satt påminner vi före intervjun och frågar hur det gick.`
          : h.text,
        knapp: h.knapp,
      }
    case 'uppdatera_test':
      return {
        overrad,
        rubrik: h.rubrik,
        text: t?.kalladTillTest
          ? `${t.jobTitle}. Du blev kallad till test den ${langDag(t.kalladTillTest)}. Lägg till intervjun eller beskedet, så stämmer listan.`
          : h.text,
        knapp: h.knapp,
      }
    case 'folj_upp':
      if (t && efterMoment(t)) {
        return {
          overrad,
          rubrik: h.rubrik,
          text: `${momentOrd(t).stor} för tjänsten som ${titelILopText(t.jobTitle)} var den ${langDag(momentDag(t))}, och du har inte fått besked. Ett kort mejl som frågar när du kan vänta det räcker.`,
          knapp: h.knapp,
        }
      }
      return {
        overrad,
        rubrik: h.rubrik,
        text: t
          ? `Du sökte ${titelILopText(t.jobTitle)} den ${langDag(t.appliedAt)} och har inte hört något på ${t.dagarTyst} dagar. Ett kort mejl brukar ge besked.`
          : h.text,
        knapp: h.knapp,
      }
    case 'sok_fore_sista_dag': {
      const r = ind.skaSokas.find((x) => x.id === h.sparadId)
      return {
        overrad,
        rubrik: h.rubrik,
        text: r?.sistaDag ? `${r.jobTitle}. Sista ansökningsdag är ${veckodagOchDag(r.sistaDag)}.` : h.text,
        knapp: h.knapp,
      }
    }
    default:
      return { overrad, rubrik: h.rubrik, text: h.text, knapp: h.knapp }
  }
}

/** Väggen när inget finns att göra: läget som det är, knappen till Matchade jobb. */
export function vaggUtanHandling(ind: AttGoraIndata, idag: Dag): Vagg {
  const overrad = vaggOverrad(idag)
  const knapp = { text: 'Till Matchade jobb', href: jobbHref() }
  const oppna = ind.tjanster.filter((t) => !t.avslutad)
  const vantar = oppna.filter((t) => t.station === 'sokt').length
  const intervju = oppna.filter((t) => t.station === 'intervju').length
  if (ind.tjanster.length === 0 && ind.skaSokas.length === 0) {
    return {
      overrad,
      rubrik: 'Dags att söka',
      text: 'Matchade jobb har annonser som passar ditt CV. Logga det du söker, så håller vi koll på svaren.',
      knapp,
    }
  }
  // Alla vid stationen Sökt är kallade till test (9 B). Blandat gäller dagens text.
  const testRader = oppna.filter((t) => t.station === 'sokt' && t.status === 'test_invited')
  if (vantar > 0 && testRader.length === vantar) {
    return {
      overrad,
      rubrik: vantar === 1 ? `Kallad till test hos ${testRader[0].company}` : `${stor(ordtal(vantar))} tjänster med test på gång`,
      text: 'Inget att göra just nu. Lägg till intervjun eller beskedet på tjänsten när det kommer.',
      knapp,
    }
  }
  if (vantar > 0) {
    return {
      overrad,
      rubrik: vantar === 1 ? 'En tjänst väntar svar' : `${stor(ordtal(vantar))} tjänster väntar svar`,
      text: 'Inget att göra just nu. Svar brukar dröja en till två veckor, och vi säger till när det är dags att följa upp.',
      knapp,
    }
  }
  if (intervju > 0) {
    return {
      overrad,
      rubrik: intervju === 1 ? 'En tjänst i intervjusteget' : `${stor(ordtal(intervju))} tjänster i intervjusteget`,
      text: 'Inget att göra just nu. Sätt tiden när du blir kallad, så påminner vi före intervjun.',
      knapp,
    }
  }
  return {
    overrad,
    rubrik: 'Inget väntar just nu',
    text: 'Matchade jobb har annonser som passar ditt CV.',
    knapp,
  }
}

/** Att göra nu med väggen. */
export function attGoraNu(ind: AttGoraIndata): AttGoraNu {
  const nu = ind.nu ?? new Date()
  const idag = idagSv(nu)

  if (!ind.harCv && ind.tjanster.length === 0 && ind.skaSokas.length === 0) {
    return {
      lage: 'utan_cv',
      handlingar: [],
      vagg: {
        overrad: 'BÖRJA HÄR',
        rubrik: ind.fornamn ? `Börja med ditt CV, ${ind.fornamn}` : 'Börja med ditt CV',
        text: 'Rekryterare letar först efter senaste rollen och vad du uppnådde. Vi läser ditt CV likadant, på under en minut.',
        knapp: { text: 'Ladda upp ditt CV', href: CV_HREF },
      },
    }
  }

  const handlingar = sorteraHandlingar(attGoraKandidater({ ...ind, nu })).slice(0, ATT_GORA_MAX)
  // Veckans mål fyller bara ut: den står alltid sist, även om veckans söndag
  // kommer före en intervju eller en sista ansökningsdag.
  if (handlingar.length < ATT_GORA_MAX && !ind.veckansMal.klart) {
    const extra = sokEnTill(ind, idag)
    if (!ind.avfardade?.has(extra.nyckel)) handlingar.push(extra)
  }

  if (handlingar.length === 0) {
    return { lage: 'inget_att_gora', handlingar: [], vagg: vaggUtanHandling(ind, idag) }
  }
  return { lage: 'handlingar', handlingar, vagg: vaggForHandling(handlingar[0], ind, idag) }
}
