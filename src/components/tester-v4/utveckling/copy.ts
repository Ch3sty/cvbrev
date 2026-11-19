// src/components/tester-v4/utveckling/copy.ts
// Texterna i Din utveckling, ordagrant ur skissen (docs/design/smal-plan-2026-11-18/skiss.html,
// webben, fliken Din utveckling). Inga talstreck, svenska facktermer, aldrig ordet pass.

import { kortDatum, datumText } from '@/lib/traning/rubrik';
import type { Dag } from '@/lib/traning/datum';
import type { PunktSlag, UtvecklingsPunkt } from '@/lib/tester/v4/typer';
import type { MonsterLage } from '@/lib/tester/v4/typer';
import type { Period } from './geometri';

export const UTV = {
  brand: 'Rekryteringstester',
  eyebrow: 'Din utveckling',
  rubrikUtanPlan: 'Alla testtyper',
  dagarKvar: (n: number) => `${n} ${n === 1 ? 'dag' : 'dagar'} kvar`,
  dagarKvarRad: ' till provet.',
  provetIdag: 'Provet är i dag.',
  matta: (n: number, av: number) => `${n} av ${av}`,
  mattaRad: ' testtyper mätta.',
  undertext: ' Träning, nivåkoll och prov i samma graf. Nivåerna läggs aldrig ihop.',
  /** Väggens rad utan plan, kort nog för en rad på dator bredvid Välj prov. */
  undertextKort: ' Träning, nivåkoll och prov i samma graf.',
  utanDatum: 'Inget provdatum än.',

  graf: {
    eyebrow: 'Nivån över tid',
    meta: 'träning, nivåkoll och prov',
    tom: 'Gör Nivåkollen i en testtyp, så får grafen sin första linje.',
    tomKnapp: 'Mät din nivå',
    tomPeriod: 'Inget i den här perioden. Välj Allt för hela historiken.',
    valjPunkt: 'Tryck på en punkt för detaljer.',
    aria: 'Nivån över tid, en linje per testtyp. Nivåkoll som ring, träning som punkt, övningsprov som fyrkant på tidslinjen. Välj en punkt med piltangenterna och Enter.',
    tidslinje: 'prov och övning',
    provet: 'provet',
    idag: 'i dag',
    historikLast: 'Hela historiken ingår i Premium',
    zon: { grund: 'Grund', avancerad: 'Avancerad', expert: 'Expert' },
  },

  chips: {
    typEtikett: 'Testtyp i grafen',
    periodEtikett: 'Period',
    alla: 'Alla',
    period: { '4v': '4 veckor', plan: 'Planen', allt: 'Allt' } as Record<Period, string>,
  },

  legend: {
    nivakoll: 'Nivåkoll',
    trana: 'Träning',
    ovningsprov: 'Övningsprov',
    ingarI: (namn: string) => `ingår i ${namn}`,
    ovriga: 'övriga testtyper',
  },

  slag: { nivakoll: 'Nivåkoll', trana: 'Träning', ovningsprov: 'Övningsprov' } as Record<PunktSlag, string>,

  detalj: {
    oppna: 'Öppna',
    oppnaTyp: 'Öppna testtypen',
    raknasInte: 'Övning, räknas inte',
    utanNiva: 'Ingen nivå än',
    nivaEtikett: 'nivå',
    ratt: (r: number, a: number) => `${r} av ${a}`,
    rattOrd: 'rätt',
    uppgifter: (a: number) => `${a} uppgifter`,
    overTid: (n: number) => `${n} över provets tid`,
    inomTid: 'allt inom provets tid',
    stang: 'Stäng detaljen',
  },

  /** Kortet under väggen (skissen 2026-11-19): vad kurvan säger, i ord. Nivån själv står i bandet. */
  kurvan: {
    etikett: 'Vad kurvan säger',
    forsta: {
      meta: 'Ingen mätning än',
      rubrik: 'Kurvan börjar med Nivåkollen',
      rubrikTyp: (typ: string) => `Ingen kurva i ${typ} än`,
      skal: 'Åtta minuter i en testtyp, så får grafen sin första punkt. Varje mätning efter det visar om du rör dig.',
      skalGrund: (typ: string) => `${typ} mäts med ett nivåtest på grundnivån. Det ger kurvan sin första punkt.`,
      tips: 'Gör den utvilad. Den väljer nivån för din träning.',
    },
    still: {
      meta: (dagar: number) => `${dagar} dagar sedan sist`,
      rubrik: 'Kurvan har stått still',
      skal: (typ: string) => `Din senaste mätning i ${typ} är mer än två veckor gammal. En ny Nivåkoll visar var du ligger i dag.`,
      tips: 'Högst en Nivåkoll om dagen räknas.',
    },
    upp: {
      meta: 'Uppåt',
      rubrik: (typ: string, steg: string) => `Uppåt i ${typ}, ungefär ${steg}`,
      skal: (dag: string) => `Sedan första mätningen ${dag} har du rört dig uppåt på skalan.`,
      underProvet: ' Nästa steg är avancerad nivå, där proven ligger.',
      iProvet: ' Du är inne på provets nivå. Nu gäller det att hålla den mot klockan.',
      overProvet: ' Du ligger över provets nivå. Håll den varm fram till provet.',
      tips: 'Träning på din nivå är det som flyttar kurvan.',
    },
    ned: {
      meta: 'Nedåt',
      rubrik: (typ: string) => `Kurvan har gått ned i ${typ}`,
      rubrikMonster: (monster: string) => `Du tappar mest på ${monster}`,
      skal: 'En svacka är vanlig och säger mest om dagsformen. Träning på din nivå tar dig tillbaka.',
      skalMonster: (ratt: number, antal: number) => `${ratt} av ${antal} rätt i det mönstret. Där finns det mest att hämta.`,
      tips: 'Gör nästa mätning när du är utvilad.',
    },
    stadig: {
      meta: 'Stadigt',
      rubrik: (typ: string) => `Kurvan ligger stadigt i ${typ}`,
      skal: 'Skillnaden sedan första mätningen ryms i mätningens osäkerhet. Träning på din nivå är det som flyttar den.',
      tips: 'Tio minuter om dagen räcker långt.',
    },
    enPunkt: {
      meta: 'En mätning hittills',
      rubrik: (typ: string) => `Första punkten är satt i ${typ}`,
      skal: 'En mätning till om en vecka visar om du rör dig. Under tiden flyttar träningen kurvan.',
      skalLast: 'Utan Premium visas senaste punkten per testtyp. Hela kurvan, och hur du rört dig, ingår i Premium.',
      tips: 'Tio minuter om dagen räcker långt.',
    },
    knapp: {
      matDinNiva: 'Mät din nivå',
      trana: 'Träna',
      tranaMonster: 'Träna på mönstret',
      grund: 'Testa grundnivån',
      ovningsprov: 'Gör ett övningsprov',
    },
    steg: (n: number) => (n <= 1 ? 'ett steg' : `${['', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio'][n] ?? n} steg`),
    panel: {
      rubrikPlan: 'Mot provets nivå',
      rubrikUtanPlan: 'Din nivå',
      omatt: 'Inte mätt än. Provet ligger på avancerad nivå.',
      omattUtanPlan: 'Inte mätt än. De flesta rekryteringstest ligger på avancerad nivå.',
      under: 'Provet ligger på avancerad nivå, från fyra på skalan.',
      inne: 'Du ligger inom provets nivå, den avancerade zonen.',
      over: 'Du ligger över provets nivå, i expertzonen.',
      utanPlan: 'De flesta rekryteringstest ligger på avancerad nivå, mellan fyra och sju.',
    },
  },

  nivaPerTyp: {
    eyebrow: 'Nivå per testtyp',
    meta: 'tryck för att välja i grafen',
  },

  resultat: {
    eyebrow: 'Resultat',
    metaAlla: 'nivåkoller och prov, alla typer',
    metaTyp: 'allt i vald typ',
    tom: 'Inga resultat än.',
    visaAlla: (n: number) => `Visa alla ${n}`,
    visaFarre: 'Visa färre',
    historikLast: 'Äldre resultat ingår i Premium',
  },

  monster: {
    eyebrow: 'Mönstren i figurer och mönster',
    summa: (s: number, m: number, o: number) => `${s} säkra · ${m} mötta · ${o} inte mötta`,
    lage: { omott: 'inte mött', mott: 'mött', saker: 'säker', snabb: 'snabb' } as Record<MonsterLage, string>,
    svar: (r: number, a: number) => `${r} av ${a} rätt`,
    legend: { omott: 'inte mött', mott: 'mött, andel rätt', saker: 'säker', snabb: 'snabb' } as Record<MonsterLage, string>,
    forklaring:
      'Säker: minst sex svar nära din nivå på fjorton dagar, minst fem rätt. Snabb: säker och högst ett över provets tid. Under sex svar står antalet, aldrig ett omdöme. Tryck på ett mönster för att träna på det.',
    tranaAria: (namn: string) => `Träna på mönstret ${namn}`,
    las: 'Träna på mönstren ingår i Premium',
  },
} as const;

export const kort = (d: Dag) => kortDatum(d);
export const lang = (d: Dag) => datumText(d);

/** Punktens slag i ord. Nivån ur ett fast nivåtest (talserier, spatial, ordförråd) heter Nivåtest, inte Nivåkoll. */
export const slagEtikett = (p: Pick<UtvecklingsPunkt, 'slag' | 'kalla'>) => (p.kalla === 'nivatest' ? 'Nivåtest' : UTV.slag[p.slag]);
