/**
 * Texter och små regler för Inför intervjun i rummets form (Jobbsöket
 * omgång 1, byggare C). Klientsäker, ren data.
 *
 * Det som redan har en text i infor-intervjun-copy.ts eller
 * intervjuprov-copy.ts läses därifrån; här står bara det skissen lägger till.
 */

import { FRAGOR, type FragaId } from '@/components/artiklar/intervjuprov/fragor'
import { NIVA_ETIKETTER } from '@/components/artiklar/intervjuprov/intervjuprov-copy'
import type { StarDel } from '@/components/jobb3/kit'

const TAL = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju']

export function talOrd(n: number): string {
  return TAL[n] ?? String(n)
}

export const storBokstav = (s: string) => s.charAt(0).toLocaleUpperCase('sv-SE') + s.slice(1)

export function nivaOrd(level: number): string {
  const n = Math.min(5, Math.max(1, Math.round(level))) as 1 | 2 | 3 | 4 | 5
  return NIVA_ETIKETTER[n]
}

/** Frågans nummer 1 till 7 i rekommendationens ordning. */
export function fragaNr(fraga: FragaId): number {
  return (Object.keys(FRAGOR) as FragaId[]).indexOf(fraga) + 1
}

/** Den STAR-del som saknades, när det som saknades är en av dem. */
export function saknadDel(missingKind: string | null | undefined): StarDel['bokstav'] | null {
  if (missingKind === 'resultatet') return 'R'
  if (missingKind === 'jag-formen') return 'A'
  return null
}

const STAR_NAMN = { S: 'Situation', T: 'Uppgift', A: 'Handling', R: 'Resultat' } as const

/** Vad delen betyder (Intervju-svar, "Det här lyssnar rekryteraren efter"). */
const STAR_FORKLARING = { S: 'Var och när', T: 'Vad som skulle lösas', A: 'Vad just du gjorde', R: 'Vad det ledde till' } as const

/** STAR-brickorna med förklaringen under; den del som saknades sist markeras. */
export function starForklaring(saknas: StarDel['bokstav'] | null): StarDel[] {
  return (['S', 'T', 'A', 'R'] as const).map((b) => ({ bokstav: b, namn: STAR_NAMN[b], under: STAR_FORKLARING[b], saknas: saknas === b }))
}

/** STAR-brickorna för ett bedömt svar: "Fanns med" eller "Saknades". */
export function starUtfall(saknas: StarDel['bokstav'] | null): StarDel[] {
  return (['S', 'T', 'A', 'R'] as const).map((b) => ({ bokstav: b, namn: STAR_NAMN[b], under: saknas === b ? 'Saknades' : 'Fanns med', saknas: saknas === b }))
}

/** De tre delarna rekryteraren lyssnar efter i frågorna utan STAR (ur frågans tipsrad). */
export const DELAR: Partial<Record<FragaId, [string, string, string]>> = {
  beratta: ['Var du är i dag', 'Två saker som gjort dig bra på det du gör', 'Varför du söker just nu'],
  styrkor: ['En styrka med ett konkret exempel', 'En svaghet', 'Vad du gör åt den'],
  varfor_vi: ['Två krav ur annonsen, med ett bevis var', 'Det du ger som inte står i annonsen', 'Kopplingen till just den här rollen'],
  varfor_jobbet: ['Vad i rollen som lockar', 'Vad i företaget', 'Vad du lämnar, utan att tala illa om det'],
  misstag: ['Misstaget rakt ut', 'Vad du gjorde direkt', 'Vad du ändrade efteråt'],
}

/** "Så blir svaret starkt" för STAR-frågorna (skissen Intervju-svar). */
export const STARKT_STAR = ['Ett exempel, inte flera.', 'Säg vad just du gjorde, inte vad gruppen gjorde.', 'Sluta med resultatet. Vad blev annorlunda efteråt?'] as const

export const SVAR = {
  ogon: 'Ditt svar',
  rubrik: 'Skriv som du skulle säga det',
  hoger: 'Ett exempel räcker. Två minuter när du säger det högt.',
  lyssnar: 'Det här lyssnar rekryteraren efter',
  saknadesSist: 'Saknades sist',
  starkt: 'Så blir svaret starkt',
  fot: 'Vi läser svaret som en rekryterare hör det. Svaret och bedömningen sparas under Inför intervjun, med dina prov och din profil.',
  bytFraga: 'Byt fråga',
  forra: (level: number) => `Förra svaret, ${level} av 5`,
  strecket: (min: number) => `Strecket visar minst ${min}.`,
} as const

export const VAL = {
  ogon: 'Nytt intervjuprov · steg 1 av 2',
  rubrik: 'Vilken fråga vill du öva på?',
  ingress: 'Sju frågor som nästan alltid kommer. Välj en, skriv ditt svar som du skulle säga det, så hör du vad rekryteraren hör.',
} as const

export const BEDOMT = {
  ogon: (kort: string) => `Ditt intervjusvar, bedömt · ${kort}`,
  hordes: 'Det här hörde rekryteraren',
  igen: 'Skriv om en gång till',
  upp: (fran: number) => `upp från ${fran} av 5`,
  nastaOgon: 'Nästa fråga',
  ovade: (n: number, infor: string | null) => `${storBokstav(talOrd(n))} av sju övade${infor ? ` inför ${infor}` : ''}`,
  forberedelsen: 'Till förberedelsen',
  helaStar: 'Hela återkopplingen, del för del i STAR',
  hela: 'Hela återkopplingen',
  somDuSkrev: 'Ditt svar, som du skrev det',
  hak: '[ ]',
} as const

export const HUBB = {
  pagang: 'Intervjuer på gång',
  pagangUnder: 'Hämtade ur dina sökta tjänster. Datum och tid sätter du när du loggar att du är kallad.',
  pagangUnderMobil: 'Hämtade ur dina sökta tjänster.',
  utanTak: 'Utan tak i Premium',
  profilUnder: 'Det rekryteraren läser ut av dig.',
  gratis: 'Så ser det ut på gratisnivån',
  ovade: (n: number) => `${n} av 7 frågor övade`,
  ovadeKort: (n: number) => `${n} av 7 övade`,
  forraDelar: 'Förra svaret, del för del',
  /** Rutans rubrik när dagens prov fick högsta betyg (Jobbsöket omgång 2). */
  dagensDelar: 'Dagens svar, del för del',
  inteGjord: 'Inte gjord än',
  /** "När är intervjun?" när ingen intervju är på gång (Jobbsöket omgång 2, byggspec 9.2 till 9.5). */
  fraga: {
    rubrik: 'När är intervjun?',
    text: 'Lägg in dag och tid, så räknar vi ner och visar vad du hinner öva på. Tjänsten hamnar under Sökta tjänster.',
    knapp: 'Lägg in intervjun',
    hoppa: 'Ingen intervju bokad än',
    radRubrik: 'Har du fått en intervjutid?',
    radText: 'Lägg in den, så räknar vi ner till intervjun.',
    radKnapp: 'Lägg in',
    arkRubrik: 'När är intervjun?',
    arkTextNy: 'Vi lägger in tjänsten under Sökta tjänster som kallad till intervju.',
    arkTextVal: 'Vi lägger kallelsen och tiden på tjänsten du väljer.',
    dag: 'Dag',
    tid: 'Tid',
    plats: 'Plats',
    platsHallare: 'Till exempel på plats, video eller telefon',
    valfritt: 'valfritt',
    vilken: 'Vilken tjänst gäller intervjun?',
    annan: 'En annan tjänst',
    visaAlla: 'Visa alla',
    tjanst: 'Tjänst',
    tjanstHallare: 'Till exempel ekonomiassistent',
    arbetsgivare: 'Arbetsgivare',
    arbetsgivareHallare: 'Till exempel Volvo Cars',
    sokt: 'Datum sökt',
    soktHjalp: 'Dagen du skickade ansökan. Datumet står i din månadsrapport.',
    spara: 'Spara intervjun',
    sparar: 'Sparar',
    fot: 'Vi räknar ner till intervjun och frågar hur det gick dagen efter.',
    fel: {
      dag: 'Välj dagen för intervjun.',
      val: 'Välj vilken tjänst intervjun gäller.',
      tjanst: 'Skriv tjänsten också, så hittar du den igen.',
      arbetsgivare: 'Skriv arbetsgivaren också, så hittar du tjänsten igen.',
      sokt: 'Välj dagen du sökte, så blir månadsrapporten rätt.',
      soktEfter: 'Dagen du sökte kan inte ligga efter intervjun.',
    },
    tjanstSparad: 'Tjänsten är sparad, men intervjun gick inte att lägga in. Försök igen.',
    gickInte: 'Det gick inte att spara just nu. Försök igen.',
    kvittens: 'Intervjun är inlagd. Tjänsten ligger också under Sökta tjänster.',
    oppna: 'Öppna tjänsten',
  },
} as const
