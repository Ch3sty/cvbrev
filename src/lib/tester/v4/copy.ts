// src/lib/tester/v4/copy.ts
// De delade fraserna i v4, ordagrant ur skissen (smal-plan-2026-11-18/skiss.html)
// och utkast v4. Inga talstreck, inget "pass" utåt, svenska facktermer.
// Ren, går att importera från klienten.

import { DELTYP_NAMN } from '@/lib/traning/mittTest';
import { nivakollAntalTid, nivakollOmfang } from '@/lib/nivakoll/omfang';
import type { TestTypId, Zon } from './typer';

export const ZON_NAMN: Readonly<Record<Zon, string>> = {
  grund: 'Grund',
  avancerad: 'Avancerad',
  expert: 'Expert',
};

export const ZON_RUBRIK: Readonly<Record<Zon, string>> = {
  grund: 'Grundnivå',
  avancerad: 'Avancerad nivå',
  expert: 'Expertnivå',
};

export function typNamn(typ: TestTypId): string {
  return DELTYP_NAMN[typ];
}

/** Nivåkollens tid i typen, med versal: "Sju minuter" (nivakoll/omfang). */
export function nivakollMinuterOrd(typ: TestTypId): string {
  const o = nivakollOmfang(typ);
  if (!o) return 'Några minuter';
  const ord = nivakollAntalTid(o).split('cirka ')[1] ?? '';
  return ord ? ord[0].toUpperCase() + ord.slice(1) : 'Några minuter';
}

/** Gemener mitt i en mening: "Gör Nivåkollen i spatial förmåga". */
export function typNamnSmall(typ: TestTypId): string {
  return DELTYP_NAMN[typ].toLowerCase();
}

/** Raden under namnet utan plan. Aldrig "Ingår i", det är reserverat för planens prov. */
export const KALLAS: Readonly<Record<TestTypId, string>> = {
  matris: 'Kallas även Matrigma eller logiktest',
  figurserie: 'Förekommer i SHL Verify och Aon',
  deduktiv: 'Förekommer i SHL Verify och Aon',
  verbal: 'Förekommer i SHL Verify och Aon',
  numerisk: 'Förekommer i SHL Verify och Aon',
  talserie: 'Kallas även talföljder',
  spatial: 'Kallas även rumsuppfattning',
  ordforrad: 'Förekommer i I-provet',
};

/** Testa dig-kortets tre nivårader per typ (skissens nivaer). */
export const NIVA_RADER: Readonly<Record<TestTypId, Readonly<Record<Zon, string>>>> = {
  matris: { grund: 'Lär dig reglerna: en regel', avancerad: 'Provets normala nivå: två regler', expert: 'Svårare än de flesta prov: tre regler' },
  figurserie: { grund: 'Lär dig reglerna: en regel', avancerad: 'Provets normala nivå: två regler', expert: 'Svårare än de flesta prov: tre regler' },
  deduktiv: { grund: 'Lär dig reglerna: tre villkor', avancerad: 'Provets normala nivå: fem villkor', expert: 'Svårare än de flesta prov: villkor i rörelse' },
  verbal: { grund: 'Lär dig reglerna: svaret står i texten', avancerad: 'Provets normala nivå: två ståndpunkter', expert: 'Svårare än de flesta prov: argument' },
  numerisk: { grund: 'Lär dig reglerna: läs av och räkna', avancerad: 'Provets normala nivå: flera räknesteg', expert: 'Svårare än de flesta prov: prognos, marginal' },
  talserie: { grund: 'Lär dig reglerna: en lucka', avancerad: 'Provets normala nivå: två luckor', expert: 'Svårare än de flesta prov: blandade regler' },
  spatial: { grund: 'Lär dig reglerna: en vikning', avancerad: 'Provets normala nivå: två vikningar', expert: 'Svårare än de flesta prov: speglingar, klipp' },
  ordforrad: { grund: 'Lär dig reglerna: vardagsord', avancerad: 'Provets normala nivå: formella ord', expert: 'Svårare än de flesta prov: lånord' },
};

/** Antal uppgifter i typens fasta nivåtest (testConfig.ts). */
export const NIVA_TEST_ANTAL: Readonly<Record<TestTypId, Readonly<Record<Zon, number>>>> = {
  matris: { grund: 15, avancerad: 15, expert: 15 },
  figurserie: { grund: 15, avancerad: 15, expert: 15 },
  deduktiv: { grund: 12, avancerad: 12, expert: 12 },
  verbal: { grund: 40, avancerad: 40, expert: 32 },
  numerisk: { grund: 20, avancerad: 20, expert: 20 },
  talserie: { grund: 15, avancerad: 15, expert: 15 },
  spatial: { grund: 15, avancerad: 15, expert: 15 },
  ordforrad: { grund: 20, avancerad: 20, expert: 20 },
};

export function nivaRadText(typ: TestTypId, zon: Zon): string {
  return `${NIVA_RADER[typ][zon]}. ${NIVA_TEST_ANTAL[typ][zon]} uppgifter.`;
}

export const ETIKETT = {
  trana: 'Träna',
  matDinNiva: 'Mät din nivå',
  gorNivakollen: 'Gör Nivåkollen',
  fortsatt: 'Fortsätt',
  ovningsprov: 'Gör ett övningsprov',
  personlighet: 'Gör personlighetstestet',
  oppnaAllt: 'Öppna allt',
} as const;

export const TRANA = {
  eyebrow: 'Träna',
  rubrik: 'Träning som följer din nivå',
  /** Med svagaste mönstret: ", just nu växande steg". */
  text: (monster?: string | null) =>
    `Svårare när du klarar dig, lättare när du tappar, så det är alltid lagom svårt. Förklaring efter varje svar och mer av det du tappar${monster ? `, just nu ${monster.toLowerCase()}` : ''}. Räknas i din utveckling.`,
  kort: 'Följer din nivå, förklaring efter varje svar.',
  forstNivakoll: 'Gör Nivåkollen först',
} as const;

export const TESTA_DIG = {
  eyebrow: 'Testa dig på en nivå',
  rubrik: 'En fast svårighet, som ett prov',
  text: 'Du får resultat i procent. Flyttar inte din nivå.',
} as const;

export const MAT_DIG = {
  eyebrow: 'Mät dig',
  nivakollRubrik: 'Nivåkollen, mät din nivå',
  /** Typens eget omfång: "Nio uppgifter, cirka sju minuter. Högst en om dagen räknas." */
  nivakollText: (typ: TestTypId): string => {
    const o = nivakollOmfang(typ);
    return o ? `${nivakollAntalTid(o)}. Högst en om dagen räknas.` : 'Högst en om dagen räknas.';
  },
  ovningsprovMatris: 'Övningsprov mot klockan',
  // Formatvalet finns inte på startarket än; formatet följer planen inför provet.
  ovningsprovMatrisText: 'I samma format som Matrigma eller Alva Logic, enligt din plan inför provet. Utan förklaringar.',
  ovningsprovText: (meta: string) => `${meta}. Utan förklaringar.`,
  ovningsprovTyp: 'Övningsprov mot klockan',
  ovningsprovTypText: 'I provets format, utan förklaringar.',
} as const;

export const LAS_CHIP = {
  premium: 'Ingår i Premium',
  premiumKort: 'Premium',
  kvot: 'I morgon',
  nivakollGjord: 'Igen med Premium',
} as const;

export const META = {
  kvarIdag: '1 kvar i dag',
  gratisEnGang: 'Gratis en gång',
  nivakollPaborjad: 'Nivåkoll påbörjad',
} as const;

export function ingarI(provNamn: string): string {
  return `Ingår i ${provNamn}`;
}

export function ingarIDelar(provNamn: string, n: number): string {
  return `Ingår i ${provNamn} · ${n} ${n === 1 ? 'del' : 'delar'}`;
}

export function inteI(provNamn: string): string {
  return `Används i andra rekryteringstest, inte i ${provNamn}`;
}

/** Nivåtestets startsida, grundnivån utan paket: raden under startknappen. */
export const GRUND_GRATISRAD = 'Ett grundnivåtest om dagen ingår gratis, valfri testtyp. 1 kvar i dag.';

export const GRATISRAD = {
  rubrikKvar: 'Ett grundnivåtest om dagen, gratis',
  rubrikSlut: 'Det här var grundnivån',
  text: (kvar: boolean, prisrad: string, namn: string) =>
    `${kvar ? 'Valfri testtyp. Där Nivåkollen finns gör du den en gång gratis. Genomgången av svaren är alltid öppen. ' : ''}Proven ligger på avancerad nivå. Öva där, så ofta du vill, med Premium, ${prisrad}. Träna, avancerad och expert, Nivåkollen när du vill, övningsprov och hela historiken ingår så länge du har ${namn}.`,
  knapp: 'Öppna allt',
} as const;

/** Hintarnas texter (utkast v4 avsnitt 2, skissens hintar()). */
export const HINT = {
  forstaSteg: (provNamn: string, typ: TestTypId) => ({
    eyebrow: 'Första steget',
    rubrik: `Inför ${provNamn}: börja med Nivåkollen i ${typNamnSmall(typ)}`,
    skal: `${nivakollMinuterOrd(typ)}, och du vet var du ligger. Sedan tränar du på din nivå tills provdagen. Alla andra tester är öppna också.`,
    tips: 'Gör den utvilad. Den väljer nivån för din träning.',
  }),
  forstaStegUtanPlan: (typ: TestTypId) => ({
    eyebrow: 'Första steget',
    rubrik: `Börja med Nivåkollen i ${typNamnSmall(typ)}`,
    skal: `${nivakollMinuterOrd(typ)}, och du vet var du ligger. ${typNamn(typ)} är det som oftast ingår i rekryteringstest. Alla andra tester är öppna också.`,
    tips: 'Gör den utvilad. Den väljer nivån för din träning.',
  }),
  nivakollSaknas: (provNamn: string, typ: TestTypId) => ({
    eyebrow: 'Nivåkoll saknas',
    rubrik: `Gör Nivåkollen i ${typNamnSmall(typ)}`,
    skal: `${typNamn(typ)} ingår i ${provNamn} och är inte mätt än.`,
    tips: `${nivakollMinuterOrd(typ)}. Den väljer nivån för din träning.`,
  }),
  /** Typen saknar Nivåkoll än: grundnivån ger en första bild. */
  grundnivaSaknas: (provNamn: string, typ: TestTypId) => ({
    eyebrow: 'Inte testad än',
    rubrik: `Testa dig på grundnivån i ${typNamnSmall(typ)}`,
    skal: `${typNamn(typ)} ingår i ${provNamn} och du har inte provat den än.`,
    tips: 'Lär dig reglerna först. Resultatet får du i procent.',
  }),
  nivakollPaborjad: (typ: TestTypId, besvarade: number, antal: number) => ({
    eyebrow: 'Nivåkoll påbörjad',
    rubrik: `Gör klart Nivåkollen i ${typNamnSmall(typ)}`,
    skal: `${besvarade} av ${antal} svar. ${antalOrd(antal - besvarade)} till, så får du ett nivåtal.`,
    tips: 'Resultatet sparas mellan gångerna.',
  }),
  /** ova: rubriken ur monsterNamn.ts ("Öva på växande steg"); utan den mönstrets namn. */
  svagtMonster: (typ: TestTypId, monster: string, ratt: number, antal: number, ova?: string | null) => ({
    eyebrow: 'Svagaste mönstret',
    rubrik: ova ?? `Träna på ${monster.toLowerCase()}`,
    skal: `${ratt} av ${antal} rätt i ${typNamnSmall(typ)}. Här tappar du mest.`,
    tips: MONSTER_TIPS[typ],
  }),
  tempo: (typ: TestTypId, procent: number) => ({
    eyebrow: 'Tempot',
    rubrik: `Träna ${typNamnSmall(typ)} mot klockan`,
    skal: `${procent} % av uppgifterna tar längre än provets tid. Reglerna kan du.`,
    tips: 'Hoppa över och kom tillbaka. Provet straffar inte en hoppad uppgift mer än ett fel.',
  }),
  nivakollIgen: (typ: TestTypId, datum: string, traningar: number) => ({
    eyebrow: 'Sju dagar sedan sist',
    rubrik: `Dags att se om nivån rört sig i ${typNamnSmall(typ)}`,
    skal: `Senaste Nivåkollen ${datum}, ${traningar} ${traningar === 1 ? 'träning' : 'träningar'} sedan dess.`,
    tips: 'Högst en om dagen räknas. Gör den när du är utvilad.',
  }),
  provetNara: (ovningsprov: string, dagar: number, foreslagen: string) => ({
    eyebrow: 'Provet nära',
    rubrik: dagar <= 0 ? `${ovningsprov} i dag` : `${ovningsprov} om ${dagar} ${dagar === 1 ? 'dag' : 'dagar'}`,
    skal: `Vi föreslår ett ${foreslagen}, två dagar före provet. Gör det när du vill.`,
    tips: 'Gör det samma tid på dagen som provet.',
  }),
  provaNytt: (typ: TestTypId) => ({
    eyebrow: 'Prova något nytt',
    rubrik: `Gör Nivåkollen i ${typNamnSmall(typ)}`,
    skal: `Du har inte mött den än. ${nivakollMinuterOrd(typ)}, så får den sin linje i grafen.`,
    tips: 'Gör den utvilad. Den väljer nivån för din träning.',
  }),
  provaNyttGrund: (typ: TestTypId) => ({
    eyebrow: 'Prova något nytt',
    rubrik: `Testa dig på grundnivån i ${typNamnSmall(typ)}`,
    skal: 'Du har inte mött den än. Lär dig reglerna på grundnivån.',
    tips: 'Resultatet får du i procent.',
  }),
  ingetPekar: (typ: TestTypId) => ({
    eyebrow: 'Prova något nytt',
    rubrik: `Gör Nivåkollen i ${typNamnSmall(typ)}`,
    skal: 'Inget i din data pekar åt något håll just nu. En ny testtyp ger en ny linje i grafen.',
    tips: `${nivakollMinuterOrd(typ)}.`,
  }),
  ingetPekarTrana: (typ: TestTypId) => ({
    eyebrow: 'Fortsätt',
    rubrik: `Träna ${typNamnSmall(typ)}`,
    skal: 'Inget i din data pekar åt något håll just nu. Träningen håller nivån lagom svår.',
    tips: 'Tio minuter räcker.',
  }),
} as const;

const MONSTER_TIPS: Readonly<Record<TestTypId, string>> = {
  matris: 'Leta efter axeln först, sedan vad som byter sida.',
  figurserie: 'Följ en sak i taget genom serien: form, antal, läge.',
  deduktiv: 'Skriv upp villkoren innan du tittar på alternativen.',
  verbal: 'Svaret ska stå i texten. Det du vet sedan förut räknas inte.',
  numerisk: 'Läs rubriken och enheten innan du räknar.',
  talserie: 'Skriv upp skillnaden mellan talen innan du gissar.',
  spatial: 'Följ en enda markering genom vikningen.',
  ordforrad: 'Sätt ordet i en mening innan du väljer.',
};

const ORD = ['Noll', 'En', 'Två', 'Tre', 'Fyra', 'Fem', 'Sex', 'Sju', 'Åtta', 'Nio', 'Tio', 'Elva', 'Tolv'];
function antalOrd(n: number): string {
  return ORD[n] ?? String(n);
}

const MANAD = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
/** "11 nov" ur 'YYYY-MM-DD'. */
export function kortDag(dag: string): string {
  const [, m, d] = dag.split('-').map(Number);
  return `${d} ${MANAD[m - 1]}`;
}

export const FORTSATT = {
  trana: (typ: TestTypId) => `Träna, ${typNamnSmall(typ)}`,
  nivakoll: (typ: TestTypId) => `Nivåkoll, ${typNamnSmall(typ)}`,
  ovningsprov: (namn: string) => namn,
} as const;
