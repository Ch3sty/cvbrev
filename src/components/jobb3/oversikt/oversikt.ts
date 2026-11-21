/**
 * Översiktens översättning från motorns typer till kitets props (Jobbsöket
 * omgång 1, etapp 2A). Rena funktioner, klientsäkra. Testas i
 * __tests__/oversikt.test.ts.
 */
import {
  antalText,
  beskedText,
  dagarMellan,
  intervjuText,
  klockslag,
  kortDag,
  langDag,
  momentDag,
  momentOrd,
  narText,
  ordtal,
  sedanDuTittade,
  tjanstHref,
  type AttGoraHandling,
  type Bana,
  type BanStation as MotorStation,
  type Dag,
  type TjanstLage,
} from '@/lib/jobbsok'
import type { BanStation, BrickTon as KitBrickTon, FyrSteg, JobbsokBanaProps, Status } from '@/components/jobb3/kit'

const stor = (s: string) => s.charAt(0).toLocaleUpperCase('sv-SE') + s.slice(1)

/* ------------------------------------------------------------------ banan */

function station(s: MotorStation | undefined, underMobil?: string): BanStation {
  if (!s) return { brickor: [] }
  return {
    brickor: s.brickor.map((b) => ({
      kod: b.bokstaver,
      tyst: b.tyst || undefined,
      tagg: b.etikett ?? undefined,
      taggTon: b.tyst ? 'koppar' : b.etikett ? 'ljus' : undefined,
    })),
    under: s.undertext,
    underMobil,
  }
}

/** Skärmläsarens mening om banan, ur samma tal som brickorna. */
export function banaEtikett(b: Bana): string {
  const s = (id: string) => b.stationer.find((x) => x.station === id)
  const ska = s('ska_sokas')?.antal ?? 0
  const sokt = s('sokt')
  const tysta = sokt?.brickor.filter((x) => x.tyst).length ?? 0
  const intervju = s('intervju')?.antal ?? 0
  const erbj = s('erbjudande')?.antal ?? 0
  const delar = [
    ska ? `${antalText(ska, 'sparad', 'sparade')} att söka` : 'inga sparade att söka',
    sokt?.antal ? `${antalText(sokt.antal, 'sökt', 'sökta')} som väntar svar${tysta ? `, varav ${tysta} tyst${tysta === 1 ? '' : 'a'}` : ''}` : 'inga som väntar svar',
    intervju ? `${intervju} i intervjusteget` : 'ingen i intervjusteget',
    erbj ? `${erbj} med erbjudande` : 'inget erbjudande än',
  ]
  return `Dina sökta tjänster på väg mot ett erbjudande: ${delar.join(', ')}.`
}

/** Motorns bana som props till JobbsokBana. */
export function banaProps(b: Bana): JobbsokBanaProps {
  const s = (id: string) => b.stationer.find((x) => x.station === id)
  const sokt = s('sokt')
  const tysta = sokt?.brickor.filter((x) => x.tyst).length ?? 0
  const intervju = s('intervju')
  return {
    skaSokas: station(s('ska_sokas'), s('ska_sokas')?.antal ? antalText(s('ska_sokas')!.antal, 'sparad', 'sparade') : undefined),
    sokt: station(sokt, sokt?.antal ? (tysta ? `${sokt.antal}, ${tysta === 1 ? 'en' : ordtal(tysta)} tyst${tysta === 1 ? '' : 'a'}` : `${sokt.antal} väntar svar`) : undefined),
    intervju: station(intervju, intervju?.antal ? `${intervju.antal} på gång` : undefined),
    erbjudande: station(s('erbjudande')),
    etikett: banaEtikett(b),
  }
}

/* ------------------------------------------------------------ Att göra nu */

/** Kortets ton: det första i väggens färg, en uppföljning tyst, resten vanliga. */
export function goraTon(h: AttGoraHandling, index: number): 'nu' | 'tyst' | 'vanlig' {
  if (index === 0) return 'nu'
  return h.typ === 'folj_upp' ? 'tyst' : 'vanlig'
}

/** Den kortare rubriken och raden på telefon (Mobil-oversikt). */
export function goraMobil(h: AttGoraHandling, tjanster: readonly TjanstLage[]): { rubrik?: string; text?: string } {
  const t = h.ansokanId ? tjanster.find((x) => x.id === h.ansokanId) : undefined
  switch (h.typ) {
    case 'forbered_intervju': {
      const forsta = h.text.split('. ')[0].replace(/\.$/, '')
      return { rubrik: 'Förbered intervjun', text: `${t?.company ?? ''}. ${forsta}.`.replace(/^\. /, '') }
    }
    case 'folj_upp': {
      if (t?.harUtkast) return { text: 'Utkastet till mejlet är skrivet.' }
      // Efter intervju eller provjobb (byggspec 2.3, läge 1): "Intervjun var den 20 november."
      if (t && (t.foljUppTyp === 'intervju' || t.foljUppTyp === 'provjobb')) {
        return { text: `${momentOrd(t).stor} var den ${langDag(momentDag(t))}.` }
      }
      return { text: 'Ett kort mejl brukar ge besked.' }
    }
    case 'satt_intervjutid': {
      // Kallelse utan tid, två dagar efter kallelsen (byggspec 2.3, läge 2).
      const kallad = t?.intervju?.kalladDag
      const text = t ? `${t.company}.${kallad ? ` Kallad ${kortDag(kallad)}.` : ''}` : undefined
      return { rubrik: 'Sätt tiden för intervjun', text }
    }
    default:
      return {}
  }
}

/* -------------------------------------------------------- sökta tjänster */

function dagarText(n: number): string {
  if (n <= 0) return 'Sökt i dag'
  if (n === 1) return 'Sökt i går'
  return `Sökt för ${n} dagar sedan`
}

export interface TjanstRadData {
  bricka: { kod: string; ton?: KitBrickTon }
  rubrik: string
  rubrikMobil: string
  text: string
  textMobil: string
  steg?: { steg: FyrSteg; tyst?: boolean; avslutad?: boolean }
  status: { status: Status; text?: string }
  href: string
}

/** En sökt tjänst som rad på Översikt (Main: rubrik med tjänsten, telefon bara arbetsgivaren). */
export function tjanstRad(t: TjanstLage, idag: Dag): TjanstRadData {
  const sokt = dagarText(dagarMellan(t.appliedAt, idag))
  const bas = {
    bricka: { kod: t.bokstaver, ton: (t.avslutad ? 'slut' : t.tyst ? 'tyst' : 'standard') as KitBrickTon },
    rubrik: t.jobTitle ? `${t.company}, ${t.jobTitle}` : t.company,
    rubrikMobil: t.company,
    href: tjanstHref(t.id, t.tyst ? 'folj-upp' : t.intervju?.lage === 'hur_gick' ? 'hur-gick' : null),
  }
  const mobil = (rad: string) => (t.jobTitle ? `${t.jobTitle}. ${rad}` : rad)

  if (t.avslutad) {
    const rad = 'Avslutad.'
    return { ...bas, text: rad, textMobil: mobil(rad), steg: { steg: 2, avslutad: true }, status: { status: 'avslutad' } }
  }
  if (t.station === 'erbjudande') {
    const rad = 'Du har fått ett erbjudande.'
    return { ...bas, text: rad, textMobil: mobil(rad), steg: { steg: 4 }, status: { status: 'erbjudande' } }
  }
  if (t.station === 'intervju' && t.intervju) {
    const i = t.intervju
    if (i.lage === 'bokad' && i.dag) {
      const kl = klockslag(i.tid)
      const rad = `Intervjun är ${narText(i.dag, idag)}${kl ? ` ${kl}` : ''}.`
      return { ...bas, text: rad, textMobil: mobil(rad), steg: { steg: 3 }, status: { status: 'intervju', text: 'Intervju bokad' } }
    }
    if (i.lage === 'hur_gick') {
      const rad = intervjuText(t, idag)
      return { ...bas, text: rad, textMobil: mobil(rad), steg: { steg: 3 }, status: { status: 'intervju', text: 'Hur gick det?' } }
    }
    if (i.lage === 'utan_tid') {
      const rad = 'Kallad till intervju. Sätt tiden när du vet den.'
      return { ...bas, text: rad, textMobil: mobil('Kallad till intervju.'), steg: { steg: 3 }, status: { status: 'intervju', text: 'Kallad' } }
    }
    // Genomförd intervju eller provjobb utan besked på sju dagar (byggspec 2.3, läge 1).
    if (t.tyst) {
      return {
        ...bas,
        text: beskedText(t),
        textMobil: mobil(`${momentOrd(t).stor} var den ${langDag(momentDag(t))}.`),
        steg: { steg: 3, tyst: true },
        status: { status: 'folj-upp' },
      }
    }
    const rad = intervjuText(t, idag)
    return { ...bas, text: rad, textMobil: mobil(rad.split('. ')[0] + '.'), steg: { steg: 3 }, status: { status: 'vantar-besked' } }
  }
  if (t.tyst) {
    return {
      ...bas,
      text: `${sokt}, inget svar än. Följ upp med ett kort mejl.`,
      textMobil: mobil(`${sokt}, inget svar än.`),
      steg: { steg: 1, tyst: true },
      status: { status: 'folj-upp' },
    }
  }
  return {
    ...bas,
    text: `${sokt}. Svar brukar dröja en till två veckor.`,
    textMobil: mobil(`${sokt}.`),
    steg: { steg: 1 },
    status: { status: 'vantar' },
  }
}

/* -------------------------------------------------------- nya träffar */

/** Raden under: hur många annonser senaste körningen läste. */
export function traffUnder(lasta: number, kordAt: string | null, idag: Dag): string {
  const kord = kordAt ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(kordAt)) : null
  const nar = kord && kord <= idag ? narText(kord, idag) : null
  return `Vi har läst ${lasta} annonser hos Arbetsförmedlingen mot ditt CV${nar ? `, senast ${nar}` : ''}.`
}

/**
 * Raden under rubriken med "Sedan du tittade i tisdags." först när det finns
 * nya träffar (nya > 0) och vi vet när Matchade jobb senast visades.
 */
export function traffUnderMedSedan(lasta: number, kordAt: string | null, idag: Dag, nya: number | null, seddaAt: string | null): string {
  const under = traffUnder(lasta, kordAt, idag)
  const sedan = nya && nya > 0 ? sedanDuTittade(seddaAt, idag) : null
  return sedan ? `${sedan}. ${under}` : under
}

/* -------------------------------------------------------- Bli upptäckt */

export interface BliUpptacktRad {
  text: string
  /** Obesvarade förfrågningar från rekryterare; null = inget märke. */
  vantar: number | null
}

/**
 * Bli upptäckt-raden i Mer i Jobbsöket: antal visningar när profilen är
 * synlig och har setts, och märket "1 väntar" när en förfrågan väntar på
 * svar. Bara antal, aldrig vilka rekryterare.
 */
export function bliUpptacktRad(l: { synlig: boolean; sett: number | null; vantar: number | null }, texter: { metaPa: string; metaAv: string }): BliUpptacktRad {
  const sett = l.synlig && l.sett && l.sett > 0 ? l.sett : null
  // Talet räknar visningar (per rekryterare och dygn), inte unika rekryterare.
  const text = sett
    ? sett === 1
      ? 'Din profil har visats en gång.'
      : `Din profil har visats ${sett} gånger.`
    : l.synlig
      ? texter.metaPa
      : texter.metaAv
  return { text, vantar: l.vantar && l.vantar > 0 ? l.vantar : null }
}

export { stor }
