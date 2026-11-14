// src/lib/traning/mittTest.ts
// =============================================================================
// "Mitt test är …" (brief-tester-steg2-2026-11-09.md avsnitt 6, skissen
// skiss-tester-steg2-2026-11-09.html fliken Mitt test). Valet i ingången
// styr vilka deltester som ingår, passens rotation, övningsprovets format och
// vad Alla tester lyfter överst. Planen (plan.ts) rör sig inte; bara vilket
// pass en passdag får.
//
// Lagras i test_planer.mitt_test, mitt_test_variant och extra_typer
// (20261109140000_test_planer_mitt_test.sql). leverantor, variant och
// testtyper skrivs som förut för de val som har en motsvarighet där, så att
// all äldre kod (formatet, mejlen, hemvyn) läser planen som i dag. Gamla
// planer utan mitt_test läses ur leverantor (mittTestUrPlan).
//
// Ren fil, går att importera från klienten.
// =============================================================================

import { iprovProvSynligt, steg2Synlig } from '@/lib/tester/steg2Status';
import { laggTill, dagarMellan, type Dag } from './datum';

export const MITT_TEST = ['iprov', 'matrigma', 'alva', 'shl', 'aon', 'lokforare', 'annat', 'personlighet'] as const;
export type MittTest = (typeof MITT_TEST)[number];

/** Varianterna som lagras. "Vet inte" lagras som null. */
export const MITT_VARIANTER = ['polis', 'varnplikt', 'officer', 'klassisk', 'adaptiv'] as const;
export type MittVariant = (typeof MITT_VARIANTER)[number];
export const IPROV_VARIANTER = ['polis', 'varnplikt', 'officer'] as const;
export type IprovVariant = (typeof IPROV_VARIANTER)[number];

/** Alla deltester i produkten, i kryssrutornas ordning (skissen, Annat eller vet inte). */
export const DELTYPER = ['matris', 'figurserie', 'deduktiv', 'verbal', 'ordforrad', 'numerisk', 'talserie', 'spatial', 'personlighet'] as const;
export type Deltyp = (typeof DELTYPER)[number];

/** De fyra som test_planer.testtyper tar. */
export const GAMLA_TYPER = ['matris', 'numerisk', 'verbal', 'personlighet'] as const;
/** De nya som lagras i extra_typer. */
export const EXTRA_TYPER = ['figurserie', 'deduktiv', 'talserie', 'spatial', 'ordforrad'] as const;
export type ExtraTyp = (typeof EXTRA_TYPER)[number];

export function arMittTest(v: unknown): v is MittTest {
  return (MITT_TEST as readonly unknown[]).includes(v);
}
export function arMittVariant(v: unknown): v is MittVariant {
  return (MITT_VARIANTER as readonly unknown[]).includes(v);
}
export function arDeltyp(v: unknown): v is Deltyp {
  return (DELTYPER as readonly unknown[]).includes(v);
}

/** Finns deltypen för användare? De tre nya först när motor och vy är klara. */
export function deltypSynlig(t: Deltyp): boolean {
  if (t === 'talserie' || t === 'spatial' || t === 'ordforrad') return steg2Synlig(t);
  return true;
}

/**
 * Deltesterna per val, i passrotationens ordning (briefen 6.1). I-prov 2025:
 * ord (synonymer och motsatsord), spatial förmåga (pappersvikning och
 * tärningar) och talserier. Lokförare: Aons delar som vi har.
 */
const DELTESTER: Record<Exclude<MittTest, 'annat'>, readonly Deltyp[]> = {
  iprov: ['ordforrad', 'spatial', 'talserie'],
  matrigma: ['matris'],
  alva: ['matris'],
  shl: ['numerisk', 'deduktiv', 'figurserie', 'verbal'],
  aon: ['figurserie', 'numerisk', 'verbal', 'deduktiv'],
  lokforare: ['figurserie', 'verbal', 'numerisk', 'deduktiv'],
  personlighet: ['personlighet'],
};

/** Valen som syns i ingången. Polisen eller Försvarsmakten när minst en av I-provets typer finns. */
export function synligaVal(): MittTest[] {
  return MITT_TEST.filter((v) => v !== 'iprov' || DELTESTER.iprov.some(deltypSynlig));
}

/**
 * Deltesterna som ingår i planen, bara de som finns. "Annat eller vet inte"
 * tar kryssrutorna; utan kryss figurer och mönster, det som oftast ingår.
 */
export function deltester(val: MittTest | null, kryss: readonly string[] = []): Deltyp[] {
  const lista = val && val !== 'annat' ? DELTESTER[val] : DELTYPER.filter((t) => kryss.includes(t));
  const synliga = lista.filter(deltypSynlig);
  return synliga.length ? [...synliga] : ['matris'];
}

/** Passen roterar bara mellan deltester med pass (personlighet har inget pass). */
export function passtyper(val: MittTest | null, kryss: readonly string[] = []): Deltyp[] {
  return deltester(val, kryss).filter((t) => t !== 'personlighet');
}

/**
 * Passrotationen (briefen 6.2): dagens pass är deltestet på tur, räknat från
 * planens start. Dag 0 det första, dag 1 det andra och så vidare. Vilodagar
 * räknas med, så att samma datum alltid ger samma typ oavsett när sidan
 * ritas. Null när planen bara har ett deltest eller inget pass.
 */
export function passForDag(typer: readonly Deltyp[], start: Dag, dag: Dag): Deltyp | null {
  if (typer.length === 0) return null;
  const n = dagarMellan(start, dag);
  const i = ((n % typer.length) + typer.length) % typer.length;
  return typer[i];
}

/** Rotationen för en vecka från start, för veckoraden. */
export function rotationVecka(typer: readonly Deltyp[], start: Dag, fran: Dag, dagar = 7): { dag: Dag; typ: Deltyp | null }[] {
  return Array.from({ length: dagar }, (_, i) => {
    const dag = laggTill(fran, i);
    return { dag, typ: passForDag(typer, start, dag) };
  });
}

/* --------------------------------------------------------- Lagring */

export interface LagradPlan {
  testtyper?: string[] | null;
  leverantor?: string | null;
  variant?: string | null;
  mitt_test?: string | null;
  mitt_test_variant?: string | null;
  extra_typer?: string[] | null;
}

/** Valet ur en sparad plan. Planer från före steg 2 läses ur leverantor. */
export function mittTestUrPlan(p: LagradPlan | null | undefined): MittTest | null {
  if (!p) return null;
  if (arMittTest(p.mitt_test)) return p.mitt_test;
  const lev = p.leverantor;
  if (lev === 'matrigma' || lev === 'alva' || lev === 'shl' || lev === 'aon') return lev;
  const typer = p.testtyper ?? [];
  if (typer.length === 1 && typer[0] === 'personlighet') return 'personlighet';
  if (lev === 'annat' || typer.length > 0) return 'annat';
  return null;
}

/** Kryssen under Annat ur en sparad plan: testtyper och extra_typer. */
export function kryssUrPlan(p: LagradPlan | null | undefined): Deltyp[] {
  if (!p) return [];
  const alla = [...(p.testtyper ?? []), ...(p.extra_typer ?? [])];
  return DELTYPER.filter((t) => alla.includes(t));
}

/** Deltesterna för en sparad plan (null: ingen plan, eller tom). */
export function deltesterForPlan(p: LagradPlan | null | undefined): Deltyp[] | null {
  const val = mittTestUrPlan(p);
  if (!val) return null;
  return deltester(val, kryssUrPlan(p));
}

/**
 * Vad som skrivs till test_planer för ett val. leverantor och variant följer
 * med för valen som har en motsvarighet i formatet (tempo.ts), testtyper får
 * de fyra gamla och extra_typer resten, så att äldre läsare ser planen.
 * Lokförare tränar i Aons tempo (briefen 6.1), därför leverantor aon.
 */
export function planFranVal(val: MittTest, variant: MittVariant | null, kryss: readonly string[]): {
  mitt_test: MittTest;
  mitt_test_variant: MittVariant | null;
  testtyper: string[];
  extra_typer: string[];
  leverantor: string | null;
  variant: string | null;
} {
  const typer: Deltyp[] = val === 'annat' ? DELTYPER.filter((t) => kryss.includes(t)) : [...DELTESTER[val]];
  const delar = typer.length ? typer : (['matris'] as Deltyp[]);
  const leverantor = val === 'lokforare' ? 'aon' : val === 'iprov' || val === 'personlighet' ? null : val;
  const v =
    val === 'iprov'
      ? variant && (IPROV_VARIANTER as readonly string[]).includes(variant)
        ? variant
        : null
      : val === 'matrigma' && (variant === 'klassisk' || variant === 'adaptiv')
        ? variant
        : null;
  return {
    mitt_test: val,
    mitt_test_variant: v,
    testtyper: delar.filter((t) => (GAMLA_TYPER as readonly string[]).includes(t)),
    extra_typer: delar.filter((t) => (EXTRA_TYPER as readonly string[]).includes(t)),
    leverantor,
    variant: val === 'matrigma' ? v : null,
  };
}

/* ------------------------------------------------------------ Texter */

/** Korten i ingången: vanligt språk först, leverantören som andra rad (skissen). */
export const MITT_TEST_KORT: Record<MittTest, { titel: string; rad: string }> = {
  iprov: { titel: 'Polisen eller Försvarsmakten', rad: 'I-provet. Även mönstringen' },
  matrigma: { titel: 'Matrigma', rad: 'Assessio' },
  alva: { titel: 'Alva Logic', rad: 'Alva Labs' },
  shl: { titel: 'SHL Verify', rad: 'SHL, även G+' },
  aon: { titel: 'Aon scales', rad: 'cut-e' },
  lokforare: { titel: 'Lokförare', rad: 'TCC, ProTrain, Trafikverksskolan, MTR' },
  annat: { titel: 'Annat eller vet inte', rad: 'Du väljer delar själv' },
  personlighet: { titel: 'Bara personlighetstest', rad: 'Inga rätta svar' },
};

/** Namnet i raden "Mitt test" och i kontexten. */
export function mittTestNamn(val: MittTest, variant?: string | null): string {
  if (val === 'iprov') {
    const vem = variant === 'varnplikt' ? 'Mönstringen' : variant === 'officer' ? 'Officersprogrammet' : variant === 'polis' ? 'Polisen' : null;
    return vem ? `${vem}, I-provet` : 'I-provet';
  }
  if (val === 'annat') return 'Eget urval';
  if (val === 'personlighet') return 'Personlighetstest';
  return MITT_TEST_KORT[val].titel;
}

/** Deltestets namn i rotationen och i "Så lägger vi upp det". */
export const DELTYP_NAMN: Record<Deltyp, string> = {
  matris: 'Figurer och mönster',
  figurserie: 'Figurserier',
  deduktiv: 'Deduktiv slutledning',
  verbal: 'Ord och text',
  ordforrad: 'Ordförråd',
  numerisk: 'Siffror och tabeller',
  talserie: 'Talserier',
  spatial: 'Spatial förmåga',
  personlighet: 'Personlighet',
};

/** Kort namn i veckoraden (skissen: Ord, Spatial, Talserier). */
export const DELTYP_KORT: Record<Deltyp, string> = {
  matris: 'Figurer',
  figurserie: 'Serier',
  deduktiv: 'Deduktivt',
  verbal: 'Text',
  ordforrad: 'Ord',
  numerisk: 'Siffror',
  talserie: 'Talserier',
  spatial: 'Spatial',
  personlighet: 'Person',
};

const PASS_ORD: Record<Deltyp, string> = {
  matris: 'figurer och mönster',
  figurserie: 'figurserier',
  deduktiv: 'deduktivt',
  verbal: 'text',
  ordforrad: 'ord',
  numerisk: 'siffror',
  talserie: 'talserier',
  spatial: 'spatial förmåga',
  personlighet: 'personlighet',
};

/** "a, b och c" */
export function upprakning(ord: readonly string[]): string {
  if (ord.length <= 1) return ord.join('');
  return `${ord.slice(0, -1).join(', ')} och ${ord[ord.length - 1]}`;
}

function versalForst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TALORD = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio'];

export interface UppleggRad {
  nyckel: 'passen' | 'provet' | 'alla';
  titel: string;
  text: string;
}

/**
 * Kortet "Så lägger vi upp det" (skissen): vad valet ger, innan man går
 * vidare. Övningsprovets rad tar formatet ur ovningsprovText, som ingången
 * räknar fram ur format.ts så att talen aldrig står som fasta tal här.
 */
export function upplagg(val: MittTest, kryss: readonly string[], ovningsprovText: string | null): UppleggRad[] {
  if (val === 'personlighet') {
    return [{ nyckel: 'passen', titel: 'Personligheten', text: 'Inga pass och ingen nivå. Vi visar hur profilen tolkas.' }];
  }
  const typer = passtyper(val, kryss);
  const ord = typer.map((t) => PASS_ORD[t]);
  const rader: UppleggRad[] = [];
  const tempo = val === 'lokforare' ? ', i Aons tempo' : '';
  rader.push({
    nyckel: 'passen',
    titel: 'Passen',
    text:
      typer.length > 1
        ? `${versalForst(upprakning(ord))} i tur och ordning${tempo}.`
        : `${versalForst(ord[0] ?? 'figurer och mönster')} varje passdag${tempo}.`,
  });
  if (ovningsprovText) rader.push({ nyckel: 'provet', titel: 'Övningsprovet', text: ovningsprovText });
  const n = deltester(val, kryss).length;
  if (n > 1) {
    rader.push({
      nyckel: 'alla',
      titel: 'Alla tester',
      text: `Dina ${n < TALORD.length ? TALORD[n] : n} deltester överst, resten under Fler tester.`,
    });
  } else {
    rader.push({ nyckel: 'alla', titel: 'Alla tester', text: 'Ditt deltest överst, resten under Fler tester.' });
  }
  return rader;
}

/** Övningsprovets rad för I-prov 2025, när provpaketet finns. */
export function iprovProvText(): string | null {
  return iprovProvSynligt() ? 'I-provet, övningsprov: sex deltester i provets ordning, två dagar före.' : null;
}

export const MITT_TEST_COPY = {
  fraga: 'Vad ska du göra för test?',
  ledtrad: 'Namnet står i kallelsen eller mejlet. Vet du inte, så börjar vi med det som oftast ingår.',
  variantRubrik: 'Vilket av dem?',
  iprovVariant: { polis: 'Polisen', varnplikt: 'Värnplikt', officer: 'Officersprogrammet', vetInte: 'Vet inte' },
  iprovVariantMeta: 'Valet ändrar bara texten i resultatet.',
  lokforare: 'Koncentration, reaktion och minne ingår också i urvalet. Dem övar vi inte än.',
  upplaggRubrik: 'Så lägger vi upp det',
  kryssFraga: 'Vad ska du testas på?',
  kryssLedtrad: 'Välj det som står i kallelsen. Vet du inte, så börjar vi med figurer och mönster.',
  tomt: 'Välj ett test.',
  allaRad: { titel: (namn: string) => namn, meta: (dagar: number | null) => (dagar != null && dagar > 0 ? `Mitt test. ${dagar === 1 ? '1 dag' : `${dagar} dagar`} kvar.` : 'Mitt test.'), andra: 'Ändra' },
  ingar: 'Ingår i ditt test',
  fler: 'Fler tester',
} as const;
