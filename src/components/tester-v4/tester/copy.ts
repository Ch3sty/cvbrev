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
    omatt: META.nivakollOmatt,
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
} as const

/** Resultatet som "13 av 20". */
export function rattAv(r: { ratt: number; antal: number }): string {
  return `${r.ratt} av ${r.antal}`
}

/** Nivån med decimalkomma, en decimal ("6,1"). */
export function nivaText(v: number): string {
  return (Math.round(v * 10) / 10).toFixed(1).replace('.', ',')
}
