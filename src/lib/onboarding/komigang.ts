// src/lib/onboarding/komigang.ts
//
// Hjälpredan "Kom igång" (docs/design/spec-onboarding-2026-09-22.html,
// sektion 2, 4, 5 och 6). En lista per paket, i logisk ordning: profilen
// och CV:t först, sedan det som bygger på dem. Klar bricka blir insjunken
// med bock, nästa oprovade får ringen, och raden försvinner när allt är
// provat.
//
// Klientsäker: ren data och rena funktioner. Kvitteringen sker på servern
// (komigang-server.ts) när handlingen faktiskt sker, aldrig via en knapp.

import type { Scope } from '@/lib/access/features'
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { paketNamnForScope } from '@/lib/plans/plans'

/** Brickornas nycklar. Speglar nycklarna i profiles.onboarding_steps. */
export type BrickaKey =
  | 'profil'
  | 'cv_upp'
  | 'analys'
  | 'analys_gratis'
  | 'uppdatera_cv'
  | 'jobbmatchning'
  | 'mall'
  | 'brev'
  | 'linkedin'
  | 'bli_upptackt'
  | 'coach'
  | 'matris_grund'
  | 'matris_avancerad'
  | 'verbalt_numeriskt_grund'
  | 'provlage'
  | 'personlighet'
  | 'intervjuprov'
  | 'kurva'

/** Hjälpredans fyra listor. Null är gratisnivån. */
export type Paket = Scope | null

export const KOM_IGANG_LISTA: Record<'cv' | 'tester' | 'allt' | 'gratis', readonly BrickaKey[]> = {
  cv: ['profil', 'cv_upp', 'analys', 'uppdatera_cv', 'mall', 'brev', 'linkedin', 'matris_grund'],
  tester: [
    'profil',
    'matris_grund',
    'matris_avancerad',
    'verbalt_numeriskt_grund',
    'provlage',
    'personlighet',
    'intervjuprov',
    'kurva',
    'cv_upp',
  ],
  allt: [
    'profil',
    'cv_upp',
    'analys',
    'uppdatera_cv',
    'jobbmatchning',
    'mall',
    'brev',
    'linkedin',
    'bli_upptackt',
    'coach',
    'matris_grund',
    // Inför intervjun (docs/design/rod-trad-prov-spec-2026-09-24.md). Listan
    // saknar personlighetsbrickan, så intervjuprovet står sist.
    'intervjuprov',
  ],
  gratis: ['profil', 'cv_upp', 'analys_gratis', 'mall', 'matris_grund'],
}

export function listaFor(paket: Paket): readonly BrickaKey[] {
  return KOM_IGANG_LISTA[paket ?? 'gratis']
}

/** Rubriken: "Kom igång med CV-paketet". Gratis får bara "Kom igång". */
export function komIgangRubrik(paket: Paket): string {
  if (paket) return `Kom igång med ${paketNamnForScope(paket)}`
  return 'Kom igång'
}

/**
 * Uppgifter ur kontot som brickornas undertexter kan berätta med.
 * Allt är valfritt: saknas det står den allmänna texten.
 */
export interface BrickaFakta {
  cvNamn?: string | null
  /** Senaste analysens poäng och antal fynd. */
  poang?: number | null
  fynd?: number | null
  /** Bästa resultatet på matrislogik grund, "14 av 20". */
  matrisRatt?: number | null
  matrisAv?: number | null
}

export interface BrickaText {
  key: BrickaKey
  titel: string
  /** Undertexten när brickan inte är provad. */
  text: string
  /** Undertexten när brickan är klar. Utelämnad = samma som text. */
  klarText?: string
  /** Kortform i radens "Nästa: uppdatera CV:t." */
  kort: string
  href: string
  /** Etiketten på nästa föreslagna brickas knapp i arket. */
  knapp: string
}

/**
 * Brickornas texter, ordagrant ur specen där den skriver dem. Undertexten
 * varierar med paketet på två ställen: matrislogiken i CV-listan säger
 * "Ingår gratis", och mallen i gratislistan säger "3 mallar, en nedladdning".
 */
export function brickaText(key: BrickaKey, paket: Paket, fakta: BrickaFakta = {}): BrickaText {
  switch (key) {
    case 'profil':
      return {
        key,
        titel: 'Profilen ifylld',
        text: 'Önskad roll och ort',
        kort: 'fyll i profilen',
        href: '/dashboard/profil#inriktning',
        knapp: 'Fyll i profilen',
      }
    case 'cv_upp':
      return {
        key,
        titel: paket === 'tester' ? 'Ladda upp CV:t' : 'CV uppladdat',
        text: paket === 'tester' ? 'Ingår gratis, poäng och tyngsta fyndet' : 'PDF eller Word. En minut.',
        klarText: fakta.cvNamn ?? 'Uppladdat',
        kort: 'ladda upp CV:t',
        href: '/dashboard/profil/cv',
        knapp: 'Ladda upp CV:t',
      }
    case 'analys':
      return {
        key,
        titel: 'CV-analysen körd',
        text: 'Poäng, fynd, nyckelord',
        klarText:
          typeof fakta.poang === 'number'
            ? `Poäng ${fakta.poang}${typeof fakta.fynd === 'number' ? `, ${talOrd(fakta.fynd)} fynd` : ''}`
            : undefined,
        kort: 'kör CV-analysen',
        href: '/dashboard/cv-analys',
        knapp: 'Kör CV-analysen',
      }
    case 'analys_gratis':
      return {
        key,
        titel: 'CV-analysen, gratisnivån',
        text: 'Poängen och tyngsta fyndet',
        klarText: typeof fakta.poang === 'number' ? `Poäng ${fakta.poang}` : undefined,
        kort: 'kör CV-analysen',
        href: '/dashboard/cv-analys',
        knapp: 'Kör CV-analysen',
      }
    case 'uppdatera_cv':
      return {
        key,
        titel: 'Uppdatera CV:t efter fynden',
        text: 'Rätta de två tyngsta, kör om',
        klarText: 'Uppdaterat och omkört',
        kort: 'uppdatera CV:t',
        href: '/dashboard/cv-analys',
        knapp: 'Öppna fynden',
      }
    case 'jobbmatchning':
      return {
        key,
        titel: 'Kör jobbmatchningen',
        text: 'Jobb du inte hittat själv, med skälen',
        klarText: 'Körd på ditt CV',
        kort: 'kör jobbmatchningen',
        href: '/dashboard/jobbmatchning',
        knapp: 'Se matchade jobb',
      }
    case 'mall':
      return {
        key,
        titel: 'Välj mall och ladda ned',
        text:
          paket === 'cv' || paket === 'allt'
            ? `${TEMPLATE_COUNT} mallar som rekryteringssystem läser`
            : `${FREE_TEMPLATE_COUNT} mallar, en nedladdning`,
        klarText: 'Nedladdad som PDF',
        kort: 'välj mall',
        href: '/dashboard/cv-mallar',
        knapp: 'Välj mall',
      }
    case 'brev':
      return {
        key,
        titel: 'Personligt brev på en annons',
        text: 'Klistra in annonsen, vi skriver',
        klarText: 'Skrivet, finns under Mina brev',
        kort: 'skriv brevet',
        href: '/dashboard/skapa-brev',
        knapp: 'Skriv brevet',
      }
    case 'linkedin':
      return {
        key,
        titel: 'LinkedIn-profilen',
        text: 'Så rekryterare hittar dig',
        klarText: 'Förslagen finns under LinkedIn',
        kort: 'LinkedIn-profilen',
        href: '/dashboard/linkedin-optimizer',
        knapp: 'Optimera profilen',
      }
    case 'bli_upptackt':
      return {
        key,
        titel: 'Bli upptäckt',
        text: 'Synlig för rekryterare, anonym tills du svarar',
        klarText: 'Synlig i poolen',
        kort: 'bli upptäckt',
        href: '/dashboard/bli-upptackt',
        knapp: 'Gör dig synlig',
      }
    case 'coach':
      return {
        key,
        titel: 'Fråga jobbcoachen',
        text: 'Lön, intervju, avtal',
        klarText: 'Första frågan ställd',
        kort: 'fråga coachen',
        href: '/dashboard/jobbcoachen',
        knapp: 'Ställ en fråga',
      }
    case 'matris_grund':
      return {
        key,
        titel: 'Matrislogik, grundnivå',
        text:
          paket === 'tester'
            ? 'Cirka 20 minuter, förklaring efter varje fråga'
            : 'Ingår gratis, en gång per dygn',
        klarText:
          typeof fakta.matrisRatt === 'number' && typeof fakta.matrisAv === 'number'
            ? `${fakta.matrisRatt} av ${fakta.matrisAv} rätt`
            : 'Gjord',
        kort: 'matrislogik, grundnivå',
        href: '/dashboard/tester/matrislogik-grund',
        knapp: 'Börja med matrislogik',
      }
    case 'matris_avancerad':
      return {
        key,
        titel: 'Matrislogik, avancerad nivå',
        text: 'Svårare mönster, förklaring efter varje fråga',
        klarText: 'Gjord',
        kort: 'matrislogik, avancerad nivå',
        href: '/dashboard/tester/matrislogik-avancerad',
        knapp: 'Starta avancerad nivå',
      }
    case 'verbalt_numeriskt_grund':
      return {
        key,
        titel: 'Verbalt och numeriskt, grundnivå',
        text: 'Två typer till att känna igen',
        klarText: 'Båda gjorda',
        kort: 'verbalt och numeriskt',
        href: '/dashboard/tester',
        knapp: 'Öppna testerna',
      }
    case 'provlage':
      return {
        key,
        titel: 'Provläge mot klockan',
        text: '25 till 40 min, automatisk inlämning',
        klarText: 'Ett prov inlämnat',
        kort: 'provläget',
        href: '/dashboard/tester/matrislogik-prov',
        knapp: 'Starta provet',
      }
    case 'personlighet':
      return {
        key,
        titel: 'Personlighetstestet, och vad det säger',
        text: 'Se hur rekryteraren tolkar dig',
        klarText: 'Profilen finns under Tester',
        kort: 'personlighetstestet',
        href: '/dashboard/tester/personlighet-grund',
        knapp: 'Gör personlighetstestet',
      }
    case 'intervjuprov':
      return {
        key,
        titel: 'Intervjuprovet, utan tak',
        text: 'Svara som i rummet, få nivå och omskrivning',
        klarText: 'Provet finns under Inför intervjun',
        kort: 'intervjuprovet',
        href: '/dashboard/intervju/ny',
        knapp: 'Gör ett intervjuprov',
      }
    case 'kurva':
      return {
        key,
        titel: 'Din kurva',
        text: 'Alla sessioner per typ',
        klarText: 'Sedd',
        kort: 'din kurva',
        href: '/dashboard/tester?flik=utveckling',
        knapp: 'Se din kurva',
      }
  }
}

function talOrd(n: number): string {
  const ord = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
  return ord[n] ?? String(n)
}

/* --------------------------------------------------------------- läget */

export interface KomIgangLage {
  paket: Paket
  lista: readonly BrickaKey[]
  provade: readonly BrickaKey[]
  /** Nästa oprovade i listans ordning, null när allt är provat. */
  nasta: BrickaKey | null
  antalProvade: number
  antalTotalt: number
  klar: boolean
}

export function komIgangLage(paket: Paket, provade: readonly string[]): KomIgangLage {
  const lista = listaFor(paket)
  const provadeSet = new Set(provade)
  const provadeILista = lista.filter((k) => provadeSet.has(k))
  const nasta = lista.find((k) => !provadeSet.has(k)) ?? null
  return {
    paket,
    lista,
    provade: provadeILista,
    nasta,
    antalProvade: provadeILista.length,
    antalTotalt: lista.length,
    klar: nasta === null,
  }
}

/** Radens undertext: "3 av 8 provade. Nästa: uppdatera CV:t." */
export function komIgangRadText(lage: KomIgangLage, fakta: BrickaFakta = {}): string {
  const bas = `${lage.antalProvade} av ${lage.antalTotalt} provade.`
  if (!lage.nasta) return bas
  return `${bas} Nästa: ${brickaText(lage.nasta, lage.paket, fakta).kort}.`
}

export const KOM_IGANG = {
  dolj: 'Dölj hjälpredan',
  visaAllt: 'Visa allt som ingår',
  nastaEtikett: 'Föreslaget nästa',
  /** Arkets sista rad under den öppnade brickan (sektion 4, vänster). */
  ingarI: (paket: Paket) =>
    paket ? `Ingår i ${paketNamnForScope(paket)}, utan tak` : 'Ingår i gratisnivån',
} as const

/* -------------------------------------------- välkomstskärmen, sektion 1 */

export interface Valkommen {
  topp: string
  rubrik: string
  ingress: string
  steg: readonly [string, string, string]
  primar: string
  primarHref: string
  sekundar: string
}

export function valkommen(paket: Exclude<Paket, null>): Valkommen {
  if (paket === 'tester') {
    return {
      topp: paketNamnForScope('tester'),
      rubrik: `Du har ${paketNamnForScope('tester')}. Alla nivåer är öppna.`,
      ingress:
        'Matrislogik, verbalt, numeriskt och personlighet, provläge mot klockan och förklaring på varje fråga. Vi föreslår att du börjar med grundnivån i matrislogik, den vanligaste typen i urvalstest.',
      steg: [
        'Matrislogik, grundnivå. Cirka 20 minuter, förklaring efter varje fråga.',
        'Gå vidare till avancerad nivå, eller prova verbalt och numeriskt.',
        'När du är varm: provläge mot klockan, och det fördjupade personlighetstestet.',
      ],
      primar: 'Börja med matrislogik',
      primarHref: '/dashboard/tester/matrislogik-grund',
      sekundar: KOM_IGANG.visaAllt,
    }
  }
  if (paket === 'allt') {
    return {
      topp: paketNamnForScope('allt'),
      rubrik: `Du har ${paketNamnForScope('allt')}. Hela jobbsöket är öppet.`,
      ingress:
        'CV, personliga brev, alla tester, jobbmatchning, Jobbcoachen och Bli upptäckt. Vi föreslår att du börjar med CV:t och analysen: ett uppdaterat CV ger bättre matchningar och en bättre profil för rekryterarna.',
      steg: [
        'Ladda upp CV:t och kör CV-analysen. Uppdatera efter fynden.',
        'Kör jobbmatchningen på det uppdaterade CV:t och se jobb du inte hittat själv.',
        'Gör dig synlig för rekryterare, skriv personliga brev från träffarna, träna tester, fråga Jobbcoachen.',
      ],
      primar: 'Ladda upp CV:t',
      primarHref: '/dashboard/profil/cv',
      sekundar: KOM_IGANG.visaAllt,
    }
  }
  return {
    topp: paketNamnForScope('cv'),
    rubrik: `Du har ${paketNamnForScope('cv')}. Allt är öppet nu.`,
    ingress: `Hela CV-analysen, ${TEMPLATE_COUNT} mallar, personliga brev och LinkedIn-profilen, i vilken ordning du vill. Vi föreslår att du börjar med CV:t, för allt annat bygger på det.`,
    steg: [
      'Ladda upp CV:t, PDF eller Word. En minut.',
      'Kör CV-analysen på det. Poäng, fynd, nyckelord.',
      'Uppdatera CV:t efter fynden. Sedan mall, personligt brev och LinkedIn, när du vill.',
    ],
    primar: 'Ladda upp CV:t',
    primarHref: '/dashboard/profil/cv',
    sekundar: KOM_IGANG.visaAllt,
  }
}

/** Varianten för köparen som redan har ett CV (sektion 4, mitten). */
export function valkommenMedCv(
  paket: 'cv' | 'allt',
  cvNamn: string,
  uppladdat: string | null,
  poang: number | null
): Pick<Valkommen, 'rubrik' | 'ingress' | 'primar' | 'primarHref' | 'sekundar'> & {
  cvRad: string
} {
  const namn = paketNamnForScope(paket)
  const delar = [
    uppladdat ? `Uppladdat ${uppladdat}.` : null,
    typeof poang === 'number' ? `Poäng ${poang} med gratisnivån.` : null,
  ]
  return {
    rubrik: `Du har ${namn}. Och ett CV redan.`,
    ingress: `${cvNamn} ligger här sedan tidigare. Vi föreslår att du kör hela CV-analysen på det nu, så ser du alla fynd med åtgärd innan du uppdaterar och väljer mall.`,
    cvRad: delar.filter(Boolean).join(' '),
    primar: 'Kör hela CV-analysen',
    primarHref: '/dashboard/cv-analys',
    sekundar: 'Ladda upp ett annat CV',
  }
}

/** "Så här går det till" */
export const VALKOMMEN_STEG_ETIKETT = 'Så här går det till'
