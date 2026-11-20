// Tester v4 (arbetsflöde B): vyns egna ord, ordagrant ur skissen
// (docs/design/smal-plan-2026-11-18/skiss.html, webbens Tester och typens meny).
// Text som följer datan (Träna-kortets rubrik och text, nivåernas rader,
// knapparnas etiketter, låschippen) kommer ur kontraktet. Fraser som Hem och
// Din utveckling också säger läses ur A:s delade copy (lib/tester/v4/copy.ts).
//
// Regler: inga talstreck, svenska facktermer, ordet "pass" används aldrig
// utåt, nivån skrivs aldrig som löptext (den är nivåbandet).

import { GRATISRAD, LAS_CHIP, MAT_DIG, META, TESTA_DIG, ingarI, ingarIDelar, inteI } from '@/lib/tester/v4/copy'

export const TESTER = {
  vagg: {
    eyebrow: 'Tester',
    rubrik: 'Alla tester',
    utanPlan: 'Alla öppna.',
    utanPlanFraga: 'Vet du vilket test?',
    utanPlanRest: 'Välj, så framhäver vi det.',
    valj: 'Välj',
    planPrefix: 'Plan inför provet:',
    andra: 'Ändra',
    laggTillDatum: 'Lägg till provdatum',
  },
  grupp: ingarIDelar,
  ovriga: inteI,
  allaTyper: 'Alla testtyper',
  ingarI,
  kort: {
    paborjad: (b: number, a: number) => `${META.nivakollPaborjad}, ${b} av ${a} svar`,
    matt: (datum: string, n: number) => `Nivåkoll ${datum} · ${n} ${n === 1 ? 'träning' : 'träningar'}`,
    mattUtanDatum: (n: number) => `${n} ${n === 1 ? 'träning' : 'träningar'}`,
    tranaRad: 'Följer din nivå, förklaring efter varje svar.',
    oppnaMeny: (namn: string) => `${namn}: träning, nivåer, nivåkoll och övningsprov`,
  },
  ovningsprov: {
    senast: (datum: string, resultat: string) => `Senast ${datum}: ${resultat}.`,
    foreslar: (datum: string) => `Vi föreslår ett ${datum}.`,
    narSomHelst: 'Gör det när du vill.',
    knapp: 'Gör ett övningsprov',
    las: LAS_CHIP.premium,
  },
  personlighet: {
    namn: 'Personlighet',
    text: 'Påståenden om dig. Inga rätta svar, ingen nivå.',
    knapp: 'Gör profilen',
    knappGjord: 'Se din profil',
  },
  meny: {
    stang: 'Stäng',
    trana: 'Träna',
    eller: 'eller',
    testa: TESTA_DIG.eyebrow,
    testaRubrik: TESTA_DIG.rubrik,
    testaText: TESTA_DIG.text,
    /** Talserier, spatial och ordförråd saknar Nivåkoll: där är det nivåtestet som mäter nivån. */
    testaTextNivatest: 'Du får resultat i procent, och nivåtestet mäter din nivå.',
    nivatest: 'Nivåtest',
    matDig: MAT_DIG.eyebrow,
    nivakollRubrik: MAT_DIG.nivakollRubrik,
    nivakollText: MAT_DIG.nivakollText,
    senaste: 'Senaste resultat',
    nivakoll: 'Nivåkoll',
    ovningsprov: 'Övningsprov',
    historik: 'Hela historiken i Din utveckling',
    lasEtikett: (vad: string, chip: string) => `${vad}. ${chip}.`,
  },
  gratis: GRATISRAD,
  /** Kortet under väggen (skissen 2026-11-19): något nytt att prova, räknat ur dina testtyper. */
  provaNytt: {
    etikett: 'Prova något nytt',
    vantar: (n: number) => (n === 1 ? '1 testtyp väntar' : `${n} testtyper väntar`),
    nivakoll: {
      rubrik: (typ: string) => `Gör Nivåkollen i ${typ}`,
      /** tid: nivakollMinuterOrd(typ), "Sju minuter". */
      skal: (typ: string, tid: string) => `Du har inte mött ${typ} än. ${tid}, så vet du var du ligger och får en ny linje i grafen.`,
      skalPlan: (Typ: string, prov: string, tid: string) => `${Typ} ingår i ${prov} och är inte mätt än. ${tid}, så vet du var du ligger.`,
      tips: 'Gör den utvilad. Den väljer nivån för din träning.',
    },
    paborjad: {
      rubrik: (typ: string) => `Gör klart Nivåkollen i ${typ}`,
      skal: 'Svaren du redan gett är sparade. Gör klart, så får du din nivå.',
      tips: 'Resten tar några minuter.',
    },
    grund: {
      rubrik: (typ: string) => `Testa dig på grundnivån i ${typ}`,
      skal: (typ: string) => `Du har inte provat ${typ} än. Grundnivån lär dig reglerna, och resultatet får du i procent.`,
      tips: 'Ta det lugnt. Här lär du dig hur uppgifterna fungerar.',
      tipsGratis: 'Ett grundnivåtest om dagen ingår gratis.',
      knapp: 'Testa grundnivån',
    },
  },
  /** Alla testtyper mätta: den du tränat minst den senaste veckan. */
  dagsIgen: {
    etikett: 'Dags igen',
    allaMatta: 'Alla testtyper mätta',
    rubrik: (typ: string) => `Träna ${typ}`,
    rubrikGrund: (typ: string) => `Testa grundnivån i ${typ}`,
    aldrig: (typ: string) => `Du har mätt nivån i ${typ} men inte tränat där än. Träningen följer din nivå, med förklaring efter varje svar.`,
    enVecka: (typ: string) => `Du har inte tränat ${typ} på en vecka. Tio minuter räcker för att hålla nivån.`,
    minst: (typ: string) => `Av dina testtyper är det ${typ} du tränat minst den senaste veckan.`,
    gratisSkal: (typ: string) => `Av dina testtyper är det ${typ} du övat minst den senaste veckan. Dagens gratis grundnivåtest passar bra här.`,
    tips: 'Tio minuter räcker.',
  },
  /** Gratis: dagens grundnivåtest är gjort och ingen Nivåkoll är kvar att göra gratis. */
  imorgon: {
    etikett: 'Nästa test i morgon',
    meta: 'Dagens test är gjort',
    rubrik: 'Nästa gratis test går i morgon',
    skal: (prisrad: string) => `Med Premium fortsätter du nu, på alla nivåer och i alla testtyper, ${prisrad}.`,
    tips: 'Ett nytt grundnivåtest i morgon, efter midnatt.',
  },
} as const

/** Resultatet som "13 av 20". */
export function rattAv(r: { ratt: number; antal: number }): string {
  return `${r.ratt} av ${r.antal}`
}

/** Nivån med decimalkomma, en decimal ("6,1"). */
export function nivaText(v: number): string {
  return (Math.round(v * 10) / 10).toFixed(1).replace('.', ',')
}
