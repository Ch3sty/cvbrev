// Hem i Rekryteringstester v4 (docs/plan-tester-v4-bygg.md 3.3, utkast v4
// avsnitt 2, skiss.html webbens Hem). Texterna ordagrant ur skissen. Inga
// talstreck, inget "pass" utåt, svenska facktermer.

import { kortDatum, veckodagVersal } from '@/lib/traning/rubrik'
import type { Dag } from '@/lib/traning/datum'

export const HEM_V4 = {
  /** Väggen utan plan. */
  rubrik: 'Hem',
  rad: 'Var du står och vad som är rimligt härnäst.',
  matta: (n: number, av: number) => `${n} av ${av}`,
  mattaSvans: ' testtyper mätta.',
  /** Väggen med plan. */
  planEyebrow: 'Plan inför provet',
  dagarKvar: (n: number) => (n === 1 ? '1 dag kvar' : `${n} dagar kvar`),
  provIdag: 'Provet är i dag',
  tillProvet: (dag: Dag) => ` till provet ${kortDatum(dag)}`,
  dagsmalVagg: (n: number) => ` · dagsmål ${['ett', 'två', 'tre'][n - 1] ?? n}`,
  andra: 'Ändra',
  laggTillDatum: 'Lägg till provdatum',
  /** Banan. */
  bana: {
    idag: 'i dag',
    nivakollForslag: 'nivåkoll, förslag',
    ovningsprovForslag: 'övningsprov, förslag',
    provet: (dag: Dag) => `provet ${kortDatum(dag)}`,
    oppetSlut: 'tills det sitter',
    gjorda: (n: number) => (n === 1 ? '1 dag' : `${n} dagar`),
    aria: (gjorda: number, kvar: number | null) =>
      kvar == null
        ? `Banan utan provdatum: ${gjorda} dagar med träning hittills.`
        : `Banan till provdagen: ${gjorda} dagar med träning, ${kvar} dagar kvar.`,
  },
  /** Nästa steg. */
  nastaSteg: 'Nästa steg',
  stang: 'Stäng',
  stangEtikett: 'Stäng första steget',
  tips: 'Tips:',
  las: 'Ingår i Premium',
  /** Fler steg. */
  flerSteg: 'Fler steg',
  flerStegRad: 'ur dina resultat',
  /** Dagsmål. */
  dagsmal: 'Dagsmål',
  dagsmalAv: (gjort: number, mal: number) => `${Math.min(gjort, mal)} av ${mal}`,
  iRad: (n: number) => (n === 1 ? '1 dag i rad' : `${n} dagar i rad`),
  ingetDagsmal: 'Inget dagsmål',
  valjDagsmal: 'Välj',
  dagsmalAria: (gjort: number, mal: number, rad: number) =>
    `Dagsmål: ${Math.min(gjort, mal)} av ${mal} test i dag. ${rad} dagar i rad.`,
  /** Så ligger du till. */
  saLigger: 'Så ligger du till',
  utveckling: 'Din utveckling',
  ingarI: (namn: string) => `Ingår i ${namn}`,
  /** Fortsätt där du slutade. */
  fortsatt: 'Fortsätt där du slutade',
  /** Plankortet utan plan. */
  plankort: {
    eyebrow: 'Plan inför provet',
    titel: 'Vet du vilket test du ska göra?',
    text: 'Välj, så framhäver vi det och föreslår vad du övar fram till provdagen.',
    ja: 'Ja, jag vet',
    inteAn: 'Inte än, träna brett',
    hopfalldTitel: 'Plan inför provet',
    hopfalldText: 'Vet du vilket test? Välj, så framhäver vi det.',
    valj: 'Välj',
  },
  /** Flikarna på golvet (skissens wflikar). */
  flikar: { hem: 'Hem', tester: 'Tester', utveckling: 'Din utveckling', etikett: 'Rekryteringstester' },
} as const

/** "Ons 19 nov": väggens datumrad. */
export function datumRad(dag: Dag): string {
  return `${veckodagVersal(dag).slice(0, 3)} ${kortDatum(dag)}`
}

/** Väljaren Plan inför provet (Ingang): dagsmålet och Avsluta planen (skissens ark). */
export const PLANVAL = {
  /** Datumstegets ledtråd utan ordet pass (utkast v4: planen föreslår, låser inte). */
  datumLedtrad: 'Datumet ger nedräkning och bana. Vi föreslår nivåkoll och ett övningsprov två dagar före, och allt är öppet hela tiden.',
  dagsmal: {
    fraga: 'Vill du ha ett dagsmål?',
    valfritt: 'valfritt',
    val: [
      { mal: 1, titel: 'Ett test om dagen', rad: 'Cirka tio minuter' },
      { mal: 2, titel: 'Två om dagen', rad: 'Träning och nivåkoll eller prov' },
      { mal: null, titel: 'Inget dagsmål', rad: 'Målet är ditt. Vi räknar inte missar.' },
    ] as const,
  },
  avsluta: {
    lank: 'Avsluta planen',
    rubrik: 'Avsluta planen?',
    text: 'Allt du gjort sparas: grafen, nivåerna och resultaten ligger kvar i Din utveckling. Du tränar vidare fritt och kan lägga en ny plan när som helst.',
    ja: 'Avsluta planen',
    nej: 'Behåll planen',
    arbetar: 'Avslutar…',
    fel: 'Det gick inte att avsluta planen. Försök igen om en stund.',
  },
} as const
