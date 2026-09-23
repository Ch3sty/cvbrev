/**
 * Rena beräkningar för Tratt (spec-admin-tydlighet 2026-09-22, punkt 8 och
 * 11). Inga serverberoenden, så filen går att testa utan att mocka
 * Supabase, Stripe eller Next-cachen. Datafilerna hämtar och anropar
 * funktionerna här.
 *
 * Tratt ersätter Flöde och Funnel: en tratt, ett tal per steg, en källa per
 * steg. Konton ur profiles, spårval, köpsteg och kassa ur PostHog via
 * admin_flode_daily och admin_funnel_weekly, köp och intäkt ur Stripe via
 * kop.ts.
 */

import { dagBakat, dagStr, type PaketNyckel } from '@/lib/admin/collect';
import type { KopRad } from '@/lib/admin/kop';
import { FEATURES, suggestPlan, type Feature } from '@/lib/access/features';
import { KOM_IGANG_LISTA, brickaText, type BrickaKey } from '@/lib/onboarding/komigang';
import type { AdminSerieRoll } from '@/components/admin/AdminChart';
import { MATSTART, datumKort, kronor, tal, tidKort } from '@/lib/admin/tomt';

const DYGN_MS = 86_400_000;

/** Trappan (andelar) visas först när så här många har nått köpsteget. */
export const TRAPPA_MINST = 5;
/** Diagram visas först när serien har så här många dagar med data. */
export const DIAGRAM_DAGAR = 7;
/** Kom igång och förnyelser blir diagram från så här många köpare. */
export const KOPARE_MINST = 5;

/** Små tal som ord i löptext: "minst fem", inte "minst 5". */
export function talOrd(n: number): string {
  const ord = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio'];
  return ord[n] ?? tal(n);
}

// ---------------------------------------------------------------------------
// Paketen
// ---------------------------------------------------------------------------

/** De tre spåren som säljs. */
export type Paket = 'cv' | 'tester' | 'allt';
export const PAKETEN: readonly Paket[] = ['cv', 'tester', 'allt'];

export const PAKET_NAMN: Record<Paket, string> = {
  cv: 'CV-veckan',
  tester: 'Testveckan',
  allt: 'Allt',
};

/**
 * Spårfärgerna ur designsystemet (avsnitt 12): CV-veckan blå, Testveckan
 * brun, Allt ink. Färgen följer paketet på varje diagram och i varje
 * tabell, aldrig rangordningen, och står alltid bredvid ett namn.
 */
export const PAKET_ROLL: Record<Paket, AdminSerieRoll> = {
  cv: 'cv',
  tester: 'test',
  allt: 'allt',
};

/** Samma färger som bakgrundsklass, för rutor och staplar i serverkod. */
export const PAKET_YTA: Record<Paket, string> = {
  cv: 'bg-diagram-cv',
  tester: 'bg-diagram-test',
  allt: 'bg-diagram-allt',
};

/** Plan- eller spårvärdet i dimensionen till ett spår. */
export function paketFranDimension(dim: string): Paket | null {
  if (dim === 'cv' || dim.startsWith('cv_')) return 'cv';
  if (dim === 'tester' || dim.startsWith('test_')) return 'tester';
  if (dim === 'allt' || dim.startsWith('all_')) return 'allt';
  return null;
}

/** Stripe-paketet (cv_week, all_day ...) till sitt spår. */
export function sparFranPaket(paket: PaketNyckel | null): Paket | null {
  return paket ? paketFranDimension(paket) : null;
}

export interface FlodeRad {
  dag: string;
  handelse: string;
  dimension: string;
  antal: number;
  personer: number;
}

// ---------------------------------------------------------------------------
// Fönstret
// ---------------------------------------------------------------------------

export type FonsterNyckel = 'paket' | '7' | '30';
export const FONSTER_VAL: ReadonlyArray<{ nyckel: FonsterNyckel; namn: string }> = [
  { nyckel: 'paket', namn: 'Sedan paketen' },
  { nyckel: '7', namn: '7 dagar' },
  { nyckel: '30', namn: '30 dagar' },
];

export interface FonsterVal {
  nyckel: FonsterNyckel;
  /** Fönstrets början som ISO-tid. */
  franIso: string;
  /** Första svenska dagen i fönstret, YYYY-MM-DD. */
  franDag: string;
  /** I dag, svensk tid. */
  tillDag: string;
  /** Svenska dagar i fönstret, dagen i dag medräknad. */
  dagar: number;
  /** "sedan paketen släpptes 22 sep kl. 10.51" eller "senaste 7 dagarna". */
  etikett: string;
  /** Fönstret sidan visar utan val. */
  standard: FonsterNyckel;
}

/** Midnatt en svensk dag, som ISO-tid i UTC. Klarar sommar- och vintertid. */
export function svenskMidnattIso(dag: string): string {
  const utc = Date.parse(`${dag}T00:00:00Z`);
  const timme = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Stockholm',
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(new Date(utc))
  );
  return new Date(utc - timme * 3_600_000).toISOString();
}

/** Hela dagar mellan två YYYY-MM-DD. */
function dagarMellan(fran: string, till: string): number {
  return Math.round((Date.parse(`${till}T12:00:00Z`) - Date.parse(`${fran}T12:00:00Z`)) / DYGN_MS);
}

/**
 * Standardfönstret: "sedan paketen släpptes" tills 30 dagar finns, sedan
 * 30 dagar. Ett 30-dagarsfönster med åtta dagar paket i ser ut som en
 * sida som inte säljer.
 */
export function standardFonster(nu: Date = new Date()): FonsterNyckel {
  return nu.getTime() - Date.parse(MATSTART.paket) >= 30 * DYGN_MS ? '30' : 'paket';
}

/** Fönstret ur ?fonster=, med standard när värdet saknas eller är okänt. */
export function valjFonster(param: string | undefined, nu: Date = new Date()): FonsterVal {
  const standard = standardFonster(nu);
  const nyckel: FonsterNyckel =
    param === 'paket' || param === '7' || param === '30' ? param : standard;
  const tillDag = dagStr(nu);

  if (nyckel === 'paket') {
    const franDag = dagStr(new Date(MATSTART.paket));
    return {
      nyckel,
      franIso: MATSTART.paket,
      franDag,
      tillDag,
      dagar: Math.max(1, dagarMellan(franDag, tillDag) + 1),
      etikett: `sedan paketen släpptes ${tidKort(MATSTART.paket)}`,
      standard,
    };
  }

  const n = Number(nyckel);
  const franDag = dagBakat(tillDag, n - 1);
  return {
    nyckel,
    franIso: svenskMidnattIso(franDag),
    franDag,
    tillDag,
    dagar: n,
    etikett: `senaste ${n} dagarna`,
    standard,
  };
}

/** Den senare av två ISO-tider. */
export function senaste(a: string, b: string): string {
  return Date.parse(a) >= Date.parse(b) ? a : b;
}

/**
 * Mätstarten om den ligger inne i fönstret, annars null. En händelse som
 * började mätas efter fönstrets början ska säga "mäts från", inte låtsas
 * att dagarna före var noll.
 */
export function matsFranIFonster(matstart: string, franIso: string): string | null {
  return Date.parse(matstart) > Date.parse(franIso) ? matstart : null;
}

// ---------------------------------------------------------------------------
// Veckorna
// ---------------------------------------------------------------------------

/** När varje steg började mätas. Null: har alltid mätts. */
export const STEG_MATSTART: Record<string, string | null> = {
  pageview: null,
  nya_konton: null,
  signup_completed: MATSTART.signupHandelse,
  track_selected: MATSTART.paket,
  purchase_step_viewed: MATSTART.kopvag,
  checkout_started: MATSTART.kopvag,
  subscription_paid: null,
  kop: null,
};

export type VeckoStatus = 'matt' | 'delvis' | 'fore';

/**
 * Om ett steg mättes en vecka. "fore": hela veckan ligger före mätstarten
 * och visas grått med "mäts från", aldrig som 0. "delvis": mätstarten
 * ligger inne i veckan, talet gäller bara dagarna efter.
 */
export function veckaStatus(steg: string, mandag: string): VeckoStatus {
  const start = STEG_MATSTART[steg];
  if (!start) return 'matt';
  const startMs = Date.parse(start);
  const veckaStart = Date.parse(svenskMidnattIso(mandag));
  const veckaSlut = Date.parse(svenskMidnattIso(dagBakat(mandag, -7)));
  if (startMs >= veckaSlut) return 'fore';
  if (startMs > veckaStart) return 'delvis';
  return 'matt';
}

/** ISO-veckonumret för ett datum. */
export function isoVecka(dag: string): number {
  const d = new Date(`${dag}T12:00:00Z`);
  const veckodag = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - veckodag + 3);
  const forstaTorsdag = new Date(Date.UTC(d.getUTCFullYear(), 0, 4, 12));
  const forstaVeckodag = (forstaTorsdag.getUTCDay() + 6) % 7;
  forstaTorsdag.setUTCDate(forstaTorsdag.getUTCDate() - forstaVeckodag + 3);
  return 1 + Math.round((d.getTime() - forstaTorsdag.getTime()) / (7 * DYGN_MS));
}

export interface VeckaInfo {
  nummer: number;
  /** Dag 1 till 7 i veckan. 7 för en avslutad vecka. */
  dag: number;
  pagaende: boolean;
  /** "v. 39, dag 2 av 7" eller "v. 38". */
  etikett: string;
}

/**
 * Veckan som börjar på mandag, sedd från i dag. En pågående vecka jämförs
 * aldrig rakt mot hela veckor: 115 besökare på två dagar mot 330 på sju
 * är inget ras.
 */
export function veckaInfo(mandag: string, idag: string): VeckaInfo {
  const nummer = isoVecka(mandag);
  const diff = dagarMellan(mandag, idag);
  const pagaende = diff >= 0 && diff < 7;
  const dag = pagaende ? diff + 1 : 7;
  return {
    nummer,
    dag,
    pagaende,
    etikett: pagaende ? `v. ${nummer}, dag ${dag} av 7` : `v. ${nummer}`,
  };
}

// ---------------------------------------------------------------------------
// Var det tar stopp
// ---------------------------------------------------------------------------

export const FEATURE_NAMN: Record<Feature, string> = {
  cv_templates_all: 'Alla CV-mallar',
  cv_export: 'Ladda ned CV',
  cv_analysis_full: 'Full CV-analys',
  letter_download: 'Ladda ned brev',
  tests_above_base: 'Tester över grundnivå',
  test_exam_mode: 'Provläge',
  test_history: 'Testhistorik',
  chat_unlimited: 'Jobbcoachen utan tak',
  interview_unlimited: 'Intervjuprovet utan tak',
  job_matches_all: 'Alla jobbmatchningar',
  bli_upptackt: 'Bli upptäckt',
  linkedin: 'LinkedIn-profilen',
};

export interface BlockeringRad {
  feature: string;
  namn: string;
  /** Paketet betalväggen föreslår för funktionen, alltså det som säljs. */
  paket: Paket;
  roll: AdminSerieRoll;
  /** Unika personer per dag, summerade. */
  personer: number;
  antal: number;
}

function featureNamn(feature: string): string {
  return (FEATURE_NAMN as Record<string, string>)[feature] ?? feature;
}

function paketForFeature(feature: string): Paket {
  if (!(feature in FEATURES)) return 'allt';
  const plan = suggestPlan(feature as Feature);
  return plan === 'cv_week' ? 'cv' : plan === 'test_week' ? 'tester' : 'allt';
}

/** Blockeringar per funktion ur flöderaderna. */
export function byggBlockeringar(rader: FlodeRad[], handelse: string): BlockeringRad[] {
  const per = new Map<string, { personer: number; antal: number }>();
  for (const r of rader) {
    if (r.handelse !== handelse || !r.dimension) continue;
    const a = per.get(r.dimension) ?? { personer: 0, antal: 0 };
    a.personer += r.personer;
    a.antal += r.antal;
    per.set(r.dimension, a);
  }
  return [...per.entries()]
    .map(([feature, a]) => {
      const paket = paketForFeature(feature);
      return { feature, namn: featureNamn(feature), paket, roll: PAKET_ROLL[paket], ...a };
    })
    .sort((a, b) => b.personer - a.personer || b.antal - a.antal || a.namn.localeCompare(b.namn, 'sv'));
}

/** Dagarna som har minst en spärr eller ett grått val, stigande. */
export function stoppDagar(rader: FlodeRad[]): string[] {
  const dagar = new Set<string>();
  for (const r of rader) {
    if ((r.handelse === 'feature_blocked' || r.handelse === 'gray_option_tapped') && r.dimension && r.antal > 0) {
      dagar.add(r.dag);
    }
  }
  return [...dagar].sort();
}

const forstaLiten = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const gang = (n: number) => `${tal(n)} ${n === 1 ? 'gång' : 'gånger'}`;
const personer = (n: number) => `${tal(n)} ${n === 1 ? 'person' : 'personer'}`;

/**
 * "Var det tar stopp" som en mening, tills det finns sju dagar med data:
 * "1 spärr i dag: full CV-analys, 4 gånger av 1 person, paketet som säljs
 * där är CV-veckan. Gråa val: 0 sedan 22 sep kl. 19.02."
 *
 * period: "i dag" eller fönstrets etikett. graFran: när gråa val började
 * räknas i fönstret.
 */
export function stoppMening(
  blockerade: BlockeringRad[],
  graVal: BlockeringRad[],
  period: string,
  graFran: string
): string {
  const n = blockerade.length;
  let text: string;
  if (!n) {
    text = `0 spärrar ${period}.`;
  } else {
    const delar = blockerade
      .slice(0, 3)
      .map(
        (b) =>
          `${forstaLiten(b.namn)}, ${gang(b.antal)} av ${personer(b.personer)}, paketet som säljs där är ${PAKET_NAMN[b.paket]}`
      );
    const fler = n > 3 ? `; och ${n - 3} till` : '';
    text = `${n} ${n === 1 ? 'spärr' : 'spärrar'} ${period}: ${delar.join('; ')}${fler}.`;
  }

  if (!graVal.length) {
    text += ` Gråa val: 0 sedan ${tidKort(graFran)}.`;
  } else {
    const summa = graVal.reduce((s, g) => s + g.antal, 0);
    const topp = graVal[0];
    text += ` Gråa val: ${gang(summa)}, flest på ${forstaLiten(topp.namn)} (${PAKET_NAMN[topp.paket]}).`;
  }
  return text;
}

// ---------------------------------------------------------------------------
// Kom igång
// ---------------------------------------------------------------------------

export interface BrickaAndel {
  key: BrickaKey;
  namn: string;
  /** Andel av köparna som provat brickan inom 24 timmar, 0 till 100. */
  inom24: number | null;
  /** Inom sju dygn. */
  inom7d: number | null;
}

export interface KomIgangPaket {
  paket: Paket;
  namn: string;
  /** Köpare med minst 24 timmar sedan köpet. */
  kopare24: number;
  /** Köpare med minst sju dygn sedan köpet. */
  kopare7d: number;
  /** Köpare totalt, även de som köpte nyss. */
  kopare: number;
  brickor: BrickaAndel[];
  /** Andel av kopare24 som provat allt inom 24 timmar. */
  alltInom24: number | null;
  /** Andel av kopare7d som provat allt inom sju dygn. */
  alltInom7d: number | null;
}

export interface KopareRad {
  premium_scope: string | null;
  paket_started_at: string | null;
  onboarding_steps: Record<string, unknown> | null;
}

const TIM = 3_600_000;

function tidMs(v: unknown): number | null {
  if (typeof v !== 'string') return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

/** Kom igång per paket ur köparna. */
export function byggKomIgang(kopare: KopareRad[], nu: Date = new Date()): KomIgangPaket[] {
  const nuMs = nu.getTime();

  return PAKETEN.map((paket) => {
    const lista = KOM_IGANG_LISTA[paket];
    const mina = kopare.filter((k) => k.premium_scope === paket && tidMs(k.paket_started_at) !== null);
    const med24 = mina.filter((k) => nuMs - (tidMs(k.paket_started_at) as number) >= 24 * TIM);
    const med7d = mina.filter((k) => nuMs - (tidMs(k.paket_started_at) as number) >= 7 * 24 * TIM);

    const provadInom = (k: KopareRad, key: BrickaKey, gransMs: number): boolean => {
      const start = tidMs(k.paket_started_at) as number;
      const t = tidMs(k.onboarding_steps?.[key]);
      return t !== null && t - start <= gransMs;
    };

    const andel = (grupp: KopareRad[], test: (k: KopareRad) => boolean): number | null =>
      grupp.length ? Math.round((grupp.filter(test).length / grupp.length) * 100) : null;

    const brickor: BrickaAndel[] = lista.map((key) => ({
      key,
      namn: brickaText(key, paket).titel,
      inom24: andel(med24, (k) => provadInom(k, key, 24 * TIM)),
      inom7d: andel(med7d, (k) => provadInom(k, key, 7 * 24 * TIM)),
    }));

    return {
      paket,
      namn: PAKET_NAMN[paket],
      kopare: mina.length,
      kopare24: med24.length,
      kopare7d: med7d.length,
      brickor,
      alltInom24: andel(med24, (k) => lista.every((key) => provadInom(k, key, 24 * TIM))),
      alltInom7d: andel(med7d, (k) => lista.every((key) => provadInom(k, key, 7 * 24 * TIM))),
    };
  });
}

/** Kom igång som en rad, tills det finns fem köpare att följa. */
export function komIgangRad(kopare: number): string {
  return `Kom igång mäts för köp efter ${tidKort(MATSTART.kopvag)} (${tal(kopare)} hittills). Diagrammet visas från ${talOrd(KOPARE_MINST)} köpare.`;
}

// ---------------------------------------------------------------------------
// Förnyelser
// ---------------------------------------------------------------------------

export interface FornyelseVecka {
  /** "Vecka 1" till "Vecka 4". */
  vecka: string;
  cv: number | null;
  tester: number | null;
  allt: number | null;
}

export interface FornyelseData {
  veckor: FornyelseVecka[];
  /** Prenumerationer som är minst en vecka gamla, per paket. */
  kohort: Record<Paket, number>;
  /** Vecka 1 till 2 per paket, 0 till 100. */
  veckaTva: Record<Paket, number | null>;
  /** Alla veckoprenumerationer, oavsett ålder. */
  veckokopare: number;
  /** Första veckoprenumerationen, sekunder. Null när ingen finns. */
  forstaVeckokop: number | null;
  tillganglig: boolean;
  fel?: string;
}

export const VECKOPAKET: Record<Paket, PaketNyckel> = { cv: 'cv_week', tester: 'test_week', allt: 'all_week' };

export interface SubRad {
  paket: Paket;
  created: number;
  betaldaFakturor: number;
}

/**
 * Kohortkurvan ur prenumerationer och betalda fakturor. Vecka n räknas bara
 * på prenumerationer som är gamla nog att ha nått dit: en som köptes i går
 * kan inte ha förnyats och får inte dra ner kurvan.
 */
export function byggFornyelser(
  subs: SubRad[],
  nuSek: number
): Pick<FornyelseData, 'veckor' | 'kohort' | 'veckaTva' | 'veckokopare' | 'forstaVeckokop'> {
  const VECKA = 7 * 86_400;
  const kohort: Record<Paket, number> = { cv: 0, tester: 0, allt: 0 };
  const veckaTva: Record<Paket, number | null> = { cv: null, tester: null, allt: null };

  // Ett dygns frist efter periodgränsen: förnyelsefakturan dras vid
  // gränsen men kan ta timmar att gå igenom.
  const FRIST = 86_400;

  const andel = (paket: Paket, vecka: number): number | null => {
    const gamlaNog = subs.filter(
      (s) => s.paket === paket && nuSek - s.created >= (vecka - 1) * VECKA + (vecka > 1 ? FRIST : 0)
    );
    if (!gamlaNog.length) return null;
    const kvar = gamlaNog.filter((s) => s.betaldaFakturor >= vecka).length;
    return Math.round((kvar / gamlaNog.length) * 100);
  };

  for (const p of PAKETEN) {
    kohort[p] = subs.filter((s) => s.paket === p && nuSek - s.created >= VECKA + FRIST).length;
    veckaTva[p] = andel(p, 2);
  }

  const veckor: FornyelseVecka[] = [1, 2, 3, 4].map((v) => ({
    vecka: `Vecka ${v}`,
    cv: andel('cv', v),
    tester: andel('tester', v),
    allt: andel('allt', v),
  }));

  const forstaVeckokop = subs.length ? Math.min(...subs.map((s) => s.created)) : null;
  return { veckor, kohort, veckaTva, veckokopare: subs.length, forstaVeckokop };
}

/**
 * Förnyelser som en rad, tills det finns fem veckoköpare som är gamla nog:
 * "Förnyelser kan läsas när första veckoköparen är sju dagar gammal,
 * tidigast 29 sep."
 */
export function fornyelseRad(veckokopare: number, forstaVeckokopSek: number | null, nu: Date = new Date()): string {
  if (forstaVeckokopSek === null) {
    const tidigast = new Date(Date.parse(MATSTART.paket) + 7 * DYGN_MS).toISOString();
    return `Förnyelser kan läsas när första veckoköparen är sju dagar gammal, tidigast ${datumKort(tidigast)}. 0 veckoköpare hittills.`;
  }
  const lasbar = forstaVeckokopSek * 1000 + 7 * DYGN_MS;
  const antal = `${tal(veckokopare)} veckoköpare`;
  if (lasbar > nu.getTime()) {
    return `Förnyelser kan läsas när första veckoköparen är sju dagar gammal, ${datumKort(new Date(lasbar).toISOString())}. ${antal} hittills.`;
  }
  return `${antal} hittills, första förnyelsen kunde dras ${datumKort(new Date(lasbar).toISOString())}. Diagrammet visas från ${talOrd(KOPARE_MINST)} veckoköpare.`;
}

// ---------------------------------------------------------------------------
// Köpen ur Stripe (kop.ts)
// ---------------------------------------------------------------------------

/** En förnyelse av en löpande prenumeration, inte ett köp i köpvägen. */
export function arFornyelse(r: KopRad): boolean {
  return r.typ === 'lopande' && !r.ny;
}

/** Köp i fönstret: inga interna, inga återbetalningar, inga förnyelser. */
export function kopIFonster(rader: KopRad[], franIso: string, tillIso?: string): KopRad[] {
  const fran = Date.parse(franIso);
  const till = tillIso ? Date.parse(tillIso) : Infinity;
  return rader.filter((r) => {
    const t = Date.parse(r.tid);
    return !r.internt && !r.aterbetalning && !arFornyelse(r) && t >= fran && t < till;
  });
}

/** "Allt-dagen 49 kr, 22 sep kl. 14.14". */
export function kopText(r: KopRad): string {
  return `${r.paketNamn} ${kronor(r.beloppOre)}, ${tidKort(r.tid)}`;
}

/** Uppräkning av köp, högst tre, med "och N till". */
export function kopLista(rader: KopRad[]): string {
  const delar = rader.slice(0, 3).map(kopText);
  const fler = rader.length > 3 ? ` och ${rader.length - 3} till` : '';
  return `${delar.join('; ')}${fler}`;
}

/**
 * Toppkortet "Köpsteget till betalt". Aldrig ett streck: under fem som sett
 * köpsteget står mätstarten och vad som hänt, därefter andelen.
 */
export function kopstegKort(
  kopsteget: number,
  kopEfter: KopRad[],
  kopFore: KopRad[]
): { varde: string; jamforelse: string; matsFran: boolean } {
  if (kopsteget >= TRAPPA_MINST) {
    const andel = Math.round((kopEfter.length / kopsteget) * 100);
    return {
      varde: `${andel} %`,
      jamforelse: `${tal(kopEfter.length)} köp av ${tal(kopsteget)} som sett köpsteget sedan ${tidKort(MATSTART.kopvag)}.`,
      matsFran: false,
    };
  }
  const delar: string[] = [];
  if (kopFore.length) {
    delar.push(`${tal(kopFore.length)} köp före mätstart: ${kopLista(kopFore)}.`);
  }
  if (kopsteget > 0 || kopEfter.length) {
    delar.push(`${tal(kopsteget)} har sett köpsteget, ${tal(kopEfter.length)} köp efter mätstart.`);
  }
  delar.push(`Första andel när minst ${talOrd(TRAPPA_MINST)} sett köpsteget.`);
  return { varde: `Mäts från ${tidKort(MATSTART.kopvag)}`, jamforelse: delar.join(' '), matsFran: true };
}

export interface IntaktRad {
  paket: PaketNyckel | null;
  namn: string;
  spar: Paket | null;
  nya: number;
  fornyelser: number;
  /** Netto i öre, återbetalningar dragna. */
  ore: number;
}

/** Paket som alltid har en rad, även med noll köp: det som säljs. */
const ALLTID_RAD: PaketNyckel[] = ['cv_week', 'test_week'];

/**
 * Intäkt per paket i fönstret, Allt-dagen med, interna bort, återbetalningar
 * dragna från sitt paket. Högst intäkt först.
 */
export function intaktPerPaket(rader: KopRad[], franIso: string): IntaktRad[] {
  const fran = Date.parse(franIso);
  const per = new Map<string, IntaktRad>();
  const rad = (paket: PaketNyckel | null, namn: string): IntaktRad => {
    const nyckel = paket ?? 'okant';
    let r = per.get(nyckel);
    if (!r) {
      r = { paket, namn, spar: sparFranPaket(paket), nya: 0, fornyelser: 0, ore: 0 };
      per.set(nyckel, r);
    }
    return r;
  };

  for (const r of rader) {
    if (r.internt || Date.parse(r.tid) < fran) continue;
    const ut = rad(r.paket, r.paket ? r.paketNamn : 'Okänt paket');
    ut.ore += r.beloppOre;
    if (r.aterbetalning) continue;
    if (arFornyelse(r)) ut.fornyelser += 1;
    else ut.nya += 1;
  }
  const namn: Record<string, string> = { cv_week: 'CV-veckan', test_week: 'Testveckan' };
  for (const p of ALLTID_RAD) if (!per.has(p)) rad(p, namn[p]);

  return [...per.values()].sort((a, b) => b.ore - a.ore || b.nya + b.fornyelser - (a.nya + a.fornyelser));
}

/** "1 nytt", "3 förnyelser", "1 nytt, 2 förnyelser" eller "0". */
export function kopAntalText(r: Pick<IntaktRad, 'nya' | 'fornyelser'>): string {
  const delar: string[] = [];
  if (r.nya) delar.push(`${tal(r.nya)} ${r.nya === 1 ? 'nytt' : 'nya'}`);
  if (r.fornyelser) delar.push(`${tal(r.fornyelser)} ${r.fornyelser === 1 ? 'förnyelse' : 'förnyelser'}`);
  return delar.length ? delar.join(', ') : '0';
}

export interface IntaktDag {
  dag: string;
  cv: number | null;
  tester: number | null;
  allt: number | null;
}

/**
 * Intäkt per dag och spår i kronor, en rad per dag i fönstret. Dagar utan
 * köp i ett spår är 0, dagar utan köp alls har null i alla tre så att
 * diagramregeln räknar punkterna rätt.
 */
export function intaktPerDag(rader: KopRad[], fonster: Pick<FonsterVal, 'franIso' | 'franDag' | 'tillDag'>): IntaktDag[] {
  const fran = Date.parse(fonster.franIso);
  const per = new Map<string, IntaktDag>();
  for (const r of rader) {
    if (r.internt || Date.parse(r.tid) < fran) continue;
    const spar = sparFranPaket(r.paket);
    if (!spar) continue;
    const dag = dagStr(new Date(r.tid));
    const d = per.get(dag) ?? { dag, cv: 0, tester: 0, allt: 0 };
    d[spar] = (d[spar] ?? 0) + Math.round(r.beloppOre / 100);
    per.set(dag, d);
  }
  const ut: IntaktDag[] = [];
  for (let i = dagarMellan(fonster.franDag, fonster.tillDag); i >= 0; i--) {
    const dag = dagBakat(fonster.tillDag, i);
    ut.push(per.get(dag) ?? { dag, cv: null, tester: null, allt: null });
  }
  return ut;
}
