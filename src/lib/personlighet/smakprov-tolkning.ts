/**
 * Tolkningen av personlighetsprovet (docs/design/rod-trad-prov-2026-09-24.html,
 * copytabellen och kravprofilerna, docs/design/rod-trad-prov-spec-2026-09-24.md).
 *
 * Klientsäker: ren data och rena funktioner, ingen modell. Poängen är
 * motorns (0 till 100 per faktor), banden motorns (bandFor: låg under 40,
 * hög från 70). Den femte faktorn visas som Stabilitet, 100 minus
 * särbarhet (ägarens beslut 3).
 *
 * Meningarna är skrivna i rekryterarens perspektiv och är innehåll, inte
 * gränssnitt, därför bor de här och inte i copyfilen.
 */

import { bandFor, type Band } from '@/lib/personalityTest/insights'
import type { BigFiveScores } from '@/lib/personalityTest/types'

export type Faktor = 'conscientiousness' | 'extraversion' | 'stability' | 'agreeableness' | 'openness'

export interface FaktorMeta {
  key: Faktor
  /** "Samvetsgrannhet" */
  namn: string
  /** "samvetsgrannhet", för löptext. */
  gemen: string
}

/** Fast visningsordning (hubbens panel för en riktig profil). */
export const FAKTORER: readonly FaktorMeta[] = [
  { key: 'conscientiousness', namn: 'Samvetsgrannhet', gemen: 'samvetsgrannhet' },
  { key: 'extraversion', namn: 'Utåtriktning', gemen: 'utåtriktning' },
  { key: 'stability', namn: 'Stabilitet', gemen: 'stabilitet' },
  { key: 'agreeableness', namn: 'Vänlighet', gemen: 'vänlighet' },
  { key: 'openness', namn: 'Öppenhet', gemen: 'öppenhet' },
]

const META: Record<Faktor, FaktorMeta> = Object.fromEntries(FAKTORER.map((f) => [f.key, f])) as Record<
  Faktor,
  FaktorMeta
>

export function faktorMeta(f: Faktor): FaktorMeta {
  return META[f]
}

/** Poängen som den visas: Stabilitet är 100 minus särbarhet. */
export function visadPoang(scores: BigFiveScores, f: Faktor): number {
  if (f === 'stability') return 100 - scores.neuroticism
  return scores[f]
}

export const BAND_ORD: Record<Band, string> = { high: 'Hög', mid: 'Mitt emellan', low: 'Låg' }

export function bandOrd(band: Band): string {
  return BAND_ORD[band]
}

/** Femsegmentsmätaren: min(5, max(1, ceil(poäng / 20))). */
export function segment(poang: number): number {
  return Math.min(5, Math.max(1, Math.ceil(poang / 20)))
}

/* ------------------------------------------------------- läsningen */

/** De femton meningarna, en per faktor och band, ur copytabellen. */
export const LASNING: Record<Faktor, Record<Band, string>> = {
  conscientiousness: {
    high: 'Rekryteraren ser någon som levererar utan påminnelser, och kommer att fråga när strukturen kostade dig flexibilitet.',
    mid: 'Rekryteraren ser någon som planerar när det behövs och släpper när det inte gör det. Ha ett exempel på båda.',
    low: 'Rekryteraren ser någon som trivs med tempo och improvisation, och kommer att fråga hur du håller deadlines.',
  },
  extraversion: {
    high: 'Rekryteraren ser någon som tar plats och får energi av människor, och kommer att fråga hur du lämnar utrymme åt andra.',
    mid: 'Rekryteraren ser någon som fungerar både i rummet och vid skrivbordet. Berätta vilket du väljer när du får välja.',
    low: 'Rekryteraren ser en lyssnare som tänker först, och kommer att fråga hur du gör dig hörd i en grupp.',
  },
  stability: {
    high: 'Rekryteraren ser någon som behåller lugnet när det stormar, och kommer att fråga om du märker när andra inte gör det.',
    mid: 'Rekryteraren ser någon som reagerar på press men hämtar sig. Berätta vad du gör de första tio minuterna.',
    low: 'Rekryteraren ser någon som tar jobbet på allvar och bär det med sig, och kommer att fråga hur du sätter gränser.',
  },
  agreeableness: {
    high: 'Rekryteraren ser någon som håller ihop gruppen, och kommer att fråga när du senast sa emot.',
    mid: 'Rekryteraren ser någon som samarbetar utan att ge upp sin ståndpunkt. Ha ett exempel på en oenighet som slutade bra.',
    low: 'Rekryteraren ser någon som säger som det är, och kommer att fråga hur du tar hand om relationen efteråt.',
  },
  openness: {
    high: 'Rekryteraren ser någon som gärna prövar nytt, och kommer att fråga hur du landar det i rutiner.',
    mid: 'Rekryteraren ser någon som väljer nytt när det ger något. Ha ett exempel på en förändring du drev och en du avstod.',
    low: 'Rekryteraren ser någon som håller sig till det beprövade, och kommer att fråga hur du tar emot ett nytt system.',
  },
}

/**
 * Det du kan säga på intervjun, två meningar per faktor och band. Skrivna
 * här i stället för att lånas ur DIMENSION_TEXTS: motorns texter är skrivna
 * om personen och inte om samtalet, och de bär talstreck.
 */
export const INTERVJU: Record<Faktor, Record<Band, string>> = {
  conscientiousness: {
    high: 'Säg att du håller det du lovar, och ge ett exempel där det räknades. Visa också en gång när du släppte planen för att nå målet.',
    mid: 'Berätta när du planerar i detalj och när du låter bli. Ett exempel på vardera visar att du väljer med flit.',
    low: 'Berätta hur du håller deadlines fast du trivs med tempo, till exempel med kalendern eller korta avstämningar. Ett exempel där snabbheten räddade läget väger tungt.',
  },
  extraversion: {
    high: 'Ge ett exempel där du fick en grupp att röra sig. Visa också att du lyssnar, till exempel när någon annans förslag vann.',
    mid: 'Säg vad du gör bäst i möten och vad du gör bäst ensam. Rekryteraren vill veta var du hämtar energi.',
    low: 'Förbered ett exempel där du fick gehör för ett förslag i en grupp. Säg att du tänker innan du talar, och visa vad det gav.',
  },
  stability: {
    high: 'Ge ett exempel där du höll lugnet och vad det gjorde för de andra. Säg också hur du märker att en kollega är pressad.',
    mid: 'Berätta om en pressad situation och vad du gjorde de första tio minuterna. Rekryteraren lyssnar efter att du hämtar dig och går vidare.',
    low: 'Säg att du tar jobbet på allvar, och berätta hur du sätter gränser när det blir mycket. Ett konkret knep, som hur du planerar veckan, gör svaret trovärdigt.',
  },
  agreeableness: {
    high: 'Ge ett exempel där du sa emot för att det var rätt för arbetet. Då syns det att omtanken inte är konflikträdsla.',
    mid: 'Berätta om en oenighet som slutade bra och vad du gjorde för att komma dit. Rekryteraren lyssnar efter både ståndpunkt och samarbete.',
    low: 'Visa med ett exempel att din rakhet gav ett bättre beslut. Säg också hur du tar hand om relationen efter ett tufft samtal.',
  },
  openness: {
    high: 'Ge ett exempel på en ny idé som du fick att fungera i vardagen. Rekryteraren vill se att nyfikenheten landar i resultat.',
    mid: 'Berätta om en förändring du drev och en du avstod från, och varför. Det visar att du väljer nytt när det ger något.',
    low: 'Säg att du värdesätter det som fungerar, och ge ett exempel där du lärde dig ett nytt system snabbt. Då blir stadgan en styrka och inte ett motstånd.',
  },
}

export interface FaktorUtfall {
  key: Faktor
  namn: string
  band: Band
  bandOrd: string
  segment: number
  lasning: string
}

/** De fem faktorerna, störst avvikelse från 50 först. Inga råpoäng. */
export function faktorUtfall(scores: BigFiveScores): FaktorUtfall[] {
  return [...FAKTORER]
    .map((f, i) => ({ f, i, p: visadPoang(scores, f.key) }))
    .sort((a, b) => Math.abs(b.p - 50) - Math.abs(a.p - 50) || a.i - b.i)
    .map(({ f, p }) => {
      const band = bandFor(p)
      return {
        key: f.key,
        namn: f.namn,
        band,
        bandOrd: bandOrd(band),
        segment: segment(p),
        lasning: LASNING[f.key][band],
      }
    })
}

/** Faktorerna utanför mitten, störst avvikelse först. */
function utslag(scores: BigFiveScores): Array<{ f: FaktorMeta; band: Band }> {
  return faktorUtfall(scores)
    .filter((u) => u.band !== 'mid')
    .slice(0, 2)
    .map((u) => ({ f: META[u.key], band: u.band }))
}

const JAMN =
  'Det rekryteraren lägger märke till först: en jämn profil utan utslag. Räkna med frågor om vad du väljer när du får välja.'

/** Meningen överst i resultatet, byggd av de två faktorer som avviker mest. */
export function profilMening(scores: BigFiveScores): string {
  const u = utslag(scores)
  if (u.length === 0) return JAMN
  const delar = u.map(({ f, band }) => `${band === 'high' ? 'hög' : 'låg'} ${f.gemen}`)
  return `Det rekryteraren lägger märke till först: ${delar.join(' och ')}.`
}

/** Profilpanelens kortrubrik: "Hög samvetsgrannhet, låg utåtriktning". */
export function profilRubrik(scores: BigFiveScores): string {
  const u = utslag(scores)
  if (u.length === 0) return 'En jämn profil utan utslag'
  const s = u.map(({ f, band }) => `${band === 'high' ? 'hög' : 'låg'} ${f.gemen}`).join(', ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/* -------------------------------------------------- kravprofilerna */

export type Krav = 'hog' | 'mittPlus'

export interface Kravprofil {
  namn: string
  vagerTungt: string
  regler: ReadonlyArray<{ faktor: Faktor; krav: Krav }>
}

/** Sex kravprofiler ur designfilen (ägarens beslut 6). */
export const KRAVPROFILER: readonly Kravprofil[] = [
  {
    namn: 'Ekonomi och administration',
    vagerTungt: 'Noggrannhet och att klara bokslutsperioder',
    regler: [
      { faktor: 'conscientiousness', krav: 'hog' },
      { faktor: 'stability', krav: 'mittPlus' },
    ],
  },
  {
    namn: 'Sälj och kundkontakt',
    vagerTungt: 'Energi i mötet och att tåla ett nej',
    regler: [
      { faktor: 'extraversion', krav: 'hog' },
      { faktor: 'stability', krav: 'mittPlus' },
      { faktor: 'conscientiousness', krav: 'mittPlus' },
    ],
  },
  {
    namn: 'Vård och omsorg',
    vagerTungt: 'Omtanke, lugn och att göra det som ska göras',
    regler: [
      { faktor: 'agreeableness', krav: 'hog' },
      { faktor: 'stability', krav: 'mittPlus' },
      { faktor: 'conscientiousness', krav: 'mittPlus' },
    ],
  },
  {
    namn: 'IT och utveckling',
    vagerTungt: 'Nyfikenhet på nya lösningar och att leverera',
    regler: [
      { faktor: 'openness', krav: 'mittPlus' },
      { faktor: 'conscientiousness', krav: 'mittPlus' },
    ],
  },
  {
    namn: 'Ledarskap och projektledning',
    vagerTungt: 'Ta plats, hålla planen, hålla lugnet',
    regler: [
      { faktor: 'extraversion', krav: 'mittPlus' },
      { faktor: 'conscientiousness', krav: 'hog' },
      { faktor: 'stability', krav: 'hog' },
    ],
  },
  {
    namn: 'Lager, produktion och drift',
    vagerTungt: 'Pålitlighet och jämnt humör i tempo',
    regler: [
      { faktor: 'conscientiousness', krav: 'mittPlus' },
      { faktor: 'stability', krav: 'mittPlus' },
    ],
  },
]

function uppfyller(band: Band, krav: Krav): boolean {
  return krav === 'hog' ? band === 'high' : band !== 'low'
}

/** Tredje kolumnen i kravtabellen. Aldrig procent. */
export function kravUtfall(scores: BigFiveScores, krav: Kravprofil): string {
  const saknas = krav.regler
    .filter((r) => !uppfyller(bandFor(visadPoang(scores, r.faktor)), r.krav))
    .map((r) => META[r.faktor].gemen)
  if (saknas.length === 0) return 'Passar profilen'
  if (saknas.length === 1) return `Räkna med en fråga om ${saknas[0]}`
  return `Kräver ett bra svar om ${saknas[0]} och ${saknas[1]}`
}

/* ------------------------------------------------ intervjupunkterna */

export interface IntervjuPunkt {
  key: Faktor
  rubrik: string
  text: string
}

/** Fem punkter, en per faktor, i samma ordning som profilen. */
export function intervjuPunkter(scores: BigFiveScores): IntervjuPunkt[] {
  return faktorUtfall(scores).map((u) => ({
    key: u.key,
    rubrik: `${u.namn}, ${u.bandOrd.toLowerCase()}`,
    text: INTERVJU[u.key][u.band],
  }))
}

/* ------------------------------------------------------ konsekvensen */

/**
 * Hänger raka och omvända svar ihop inom en faktor? Efter vändningen (6 minus
 * svaret) ska snittet av de två raka och de två omvända ligga inom ett steg
 * från varandra.
 */
export function faktorKonsekvent(raka: readonly number[], omvandaRa: readonly number[]): boolean {
  if (raka.length === 0 || omvandaRa.length === 0) return true
  const snitt = (v: readonly number[]) => v.reduce((a, b) => a + b, 0) / v.length
  const vanda = omvandaRa.map((v) => 6 - v)
  return Math.abs(snitt(raka) - snitt(vanda)) <= 1
}
