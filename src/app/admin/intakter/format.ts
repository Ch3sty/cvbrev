/**
 * Formatering och smaberakningar for Intakter (docs/plan-admin.md avsnitt 4.2).
 *
 * Ligger lokalt i sidan, inte i src/lib/admin: vag 1 ar ett kontrakt som inte
 * ska roras, och formateringen har ar Intakters egen. MetricCard formaterar
 * aldrig sjalv, sa allt som ska in i ett kort passerar en av funktionerna
 * harifran.
 *
 * Alla belopp i kronor med tabular-nums, enligt uppdraget. Ore ar
 * lagringsenheten hela vagen fran Stripe och admin_daily_metrics; kronor
 * uppstar forst i den har filen.
 */

import {
  PAKET_KOLUMN,
  PAKET_ORDNING,
  type DagligaMetrik,
  type PaketNyckel,
} from '@/lib/admin/collect';
import { PLANS } from '@/lib/plans/plans';
import { MATSTART } from '@/lib/admin/tomt';

/** Kronor ur ore, utan decimaler. 59 900 ore blir "599 kr". */
export function kronor(ore: number | null | undefined): string {
  if (typeof ore !== 'number' || !Number.isFinite(ore)) return '–';
  return `${Math.round(ore / 100).toLocaleString('sv-SE')} kr`;
}

/**
 * Kronor med en decimal for sma tal. Anvands dar skillnaden mellan 99,67 och
 * 100 kr betyder nagot, alltsa i MRR-vattenfallet.
 */
export function kronorExakt(ore: number | null | undefined): string {
  if (typeof ore !== 'number' || !Number.isFinite(ore)) return '–';
  const kr = ore / 100;
  return `${kr.toLocaleString('sv-SE', {
    minimumFractionDigits: kr % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} kr`;
}

/** Ett antal. Null blir tankstreck, aldrig noll: en lucka ar inte en nolla. */
export function antal(v: number | null | undefined): string {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '–';
  return v.toLocaleString('sv-SE');
}

/** Procent med en decimal. Tar andelen som 0 till 1. */
export function procent(andel: number | null | undefined): string {
  if (typeof andel !== 'number' || !Number.isFinite(andel)) return '–';
  return `${(andel * 100).toLocaleString('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })} %`;
}

/**
 * Procentuell forandring mellan tva tal, som andel.
 *
 * Noll i namnaren ger null i stallet for Infinity: "oandligt manga procent
 * upp fran noll" ar inget som gar att rita eller lasa. Kortet visar da ingen
 * delta-rad alls.
 */
export function forandring(
  nu: number | null | undefined,
  forut: number | null | undefined
): number | null {
  if (typeof nu !== 'number' || !Number.isFinite(nu)) return null;
  if (typeof forut !== 'number' || !Number.isFinite(forut)) return null;
  if (forut === 0) return null;
  return (nu - forut) / forut;
}

/** Deltat som text, med tecken. 0,124 blir "12,4 %". */
export function deltaText(andel: number | null): string | undefined {
  if (andel === null) return undefined;
  return `${(Math.abs(andel) * 100).toLocaleString('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })} %`;
}

/** Datum som "14 sep". Kort form for x-axlar och tabellrader. */
export function kortDatum(dag: string): string {
  const d = new Date(`${dag}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return dag;
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Stockholm',
  }).format(d);
}

/**
 * ISO-veckonummer for en YYYY-MM-DD-strang.
 *
 * Aterkommer i churntabellen, dar agaren tanker i veckonummer snarare an i
 * mandagsdatum.
 */
export function veckonummer(dag: string): number {
  const d = new Date(`${dag}T12:00:00Z`);
  const dagNr = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dagNr + 3);
  const forstaTorsdag = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const forstaDagNr = (forstaTorsdag.getUTCDay() + 6) % 7;
  forstaTorsdag.setUTCDate(forstaTorsdag.getUTCDate() - forstaDagNr + 3);
  return 1 + Math.round((d.getTime() - forstaTorsdag.getTime()) / (7 * 24 * 3600 * 1000));
}

/** Mandagen i veckan som datumet ligger i. Samma regel som collect.ts. */
export function mandagen(dag: string): string {
  const d = new Date(`${dag}T12:00:00Z`);
  const veckodag = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - veckodag);
  return d.toISOString().slice(0, 10);
}

/**
 * Lasbara etiketter for cancel_intents.reason.
 *
 * Nycklarna ar de fyra som VALID_REASONS i
 * src/app/api/subscription/cancel-intent/route.ts slapper igenom. En femte
 * dyker upp den dag flodet byggs ut; da visas den rana nyckeln i stallet for
 * att falla bort ur tabellen.
 */
export const CHURNORSAK: Record<string, string> = {
  fick_jobb: 'Fick jobb',
  for_dyrt: 'För dyrt',
  anvander_inte: 'Använder det inte',
  saknar_funktion: 'Saknar en funktion',
};

export function churnorsak(nyckel: string | null): string {
  if (!nyckel) return 'Ingen orsak angiven';
  return CHURNORSAK[nyckel] ?? nyckel;
}

/**
 * Lasbara etiketter for produktstegen.
 *
 * Steget kommer ur Stripe-prisets intervall, inte ur ett namn: ett pris som
 * byter namn i Stripe ska inte byta rad i fordelningen.
 */
export const PLANSTEG: Record<string, string> = {
  daypass: 'Dagspass',
  week: 'Vecka',
  month: 'Månad',
  quarter: 'Kvartal',
  ovrigt: 'Övrigt',
};

export type PlanNyckel = keyof typeof PLANSTEG;

/**
 * Avgor produktsteg ur ett Stripe-pris.
 *
 * Priset 299 kr har recurring.interval month i Stripe trots att prisstegen
 * sager kvartal (planens avsnitt 10). Darfor gar identifieringen i forsta
 * hand pa price id mot env, som ar det checkouten faktiskt anvander, och
 * bara i andra hand pa intervallet. Annars hade kvartalsprenumeranterna
 * hamnat under Manad.
 */
export function planstegFranPris(
  prisId: string | null | undefined,
  interval: string | null | undefined,
  intervalCount: number | null | undefined,
  engangs = false
): PlanNyckel {
  const env = (namn: string) => process.env[namn];

  if (prisId) {
    if (prisId === env('STRIPE_PRICE_DAYPASS')) return 'daypass';
    if (prisId === env('STRIPE_PRICE_WEEK')) return 'week';
    if (prisId === env('STRIPE_PRICE_QUARTER')) return 'quarter';
    // STRIPE_TRIAL_PRICE_ID står kvar trots att den kortkrävande provperioden
    // är borttagen (B7). Priset ligger kvar på gamla fakturor, och utan raden
    // hamnar historisk intäkt under 'ovrigt' i stället för Månad. Den läses
    // bara här, aldrig för att sälja något.
    if (
      prisId === env('NEXT_PUBLIC_STRIPE_PRICE_ID') ||
      prisId === env('STRIPE_PRICE_ID') ||
      prisId === env('STRIPE_TRIAL_PRICE_ID')
    ) {
      return 'month';
    }
  }

  if (engangs || !interval) return 'daypass';

  const steg = typeof intervalCount === 'number' && intervalCount > 0 ? intervalCount : 1;
  if (interval === 'day') return 'daypass';
  if (interval === 'week') return 'week';
  if (interval === 'month') return steg >= 3 ? 'quarter' : 'month';
  if (interval === 'year') return 'quarter';
  return 'ovrigt';
}

// ---------------------------------------------------------------------------
// MRR-vattenfall
// ---------------------------------------------------------------------------

/**
 * Dagen da MRR-historiken blir sann. Samma konstant som Oversikt
 * (MATSTART.mrr i src/lib/admin/tomt.ts), sa sidorna aldrig sager olika.
 *
 * Backfyllningen 2026-09-14 gav varje dag dagens MRR, eftersom Stripe inte
 * har nagon historisk MRR att lasa. Serien ar darfor en rak linje bakat och
 * far inte lasas som att ingenting hant. Datumet star i gransnittet varje
 * gang MRR ritas over ett fonster som stracker sig fore det.
 */
export const MRR_SANN_FRAN: string = MATSTART.mrr;

export interface Vattenfall {
  fran: number;
  nytt: number;
  churn: number;
  till: number;
  franDag: string;
  tillDag: string;
}

/**
 * Vattenfallet fran MRR for 30 dagar sedan till MRR nu.
 *
 * Stripe har ingen historisk MRR, sa de backfyllda dagarna fore
 * MRR_SANN_FRAN bar alla dagens varde. Ett vattenfall over ett fonster som
 * stracker sig dit blir darfor exakt noll i forandring, vilket ar sant om
 * datan men inte om verksamheten. Funktionen returnerar null i det laget i
 * stallet for att rita en tom stapel som ser ut som stiltje.
 */
export function byggVattenfall(dagar: DagligaMetrik[]): Vattenfall | null {
  const medMrr = dagar.filter((d) => typeof d.mrr_ore === 'number');
  if (medMrr.length < 2) return null;

  const nu = medMrr[0];
  const tidigare = medMrr[Math.min(30, medMrr.length - 1)];

  if (tidigare.dag < MRR_SANN_FRAN) return null;

  const fran = tidigare.mrr_ore ?? 0;
  const till = nu.mrr_ore ?? 0;

  // Nytt och churn ur dagsraderna i fonstret, inte ur differensen: en
  // prenumeration som bade startat och sagts upp inom fonstret syns i bada
  // staplarna och tar ut sig sjalv i summan, vilket ar ratt.
  const fonster = medMrr.filter((d) => d.dag > tidigare.dag && d.dag <= nu.dag);
  const nyttAntal = fonster.reduce((s, d) => s + (d.new_paying ?? 0), 0);
  const churnAntal = fonster.reduce((s, d) => s + (d.churned ?? 0), 0);

  // Genomsnittligt manadsbelopp per prenumeration i fonstret, sa staplarna
  // far en storlek i kronor och inte i antal.
  const snitt = nu.active_subs && nu.active_subs > 0 ? till / nu.active_subs : 0;

  return {
    fran,
    nytt: Math.round(nyttAntal * snitt),
    // Noll churn ska vara 0 och inte -0. Unar minus pa en nolla ger negativ
    // nolla i JavaScript, och toLocaleString skriver ut den som "-0 kr".
    churn: churnAntal === 0 ? 0 : -Math.round(churnAntal * snitt),
    till,
    franDag: tidigare.dag,
    tillDag: nu.dag,
  };
}

// ---------------------------------------------------------------------------
// Per paket
// ---------------------------------------------------------------------------

/**
 * Aktiva och normaliserad MRR per paket (docs/plan-paket-och-onboarding.md
 * avsnitt 5).
 *
 * Antalet aktiva kommer ur de sex kolumnerna i admin_daily_metrics, som
 * collect.ts fyller pa Stripes price-id. MRR raknas har och inte i collect:
 * priset bor redan i PLANS, och da behover tabellen bara bara talet som
 * faktiskt varierar, alltsa antalet.
 *
 * Normaliseringen ar hela poangen med raden. Ett veckopris pa 99 kr ar
 * 429 kr i manaden, inte 99, och utan omraekningen ser veckopaketen ut att
 * tjana en femtedel av vad de tjanar. Allt-dagen ar ett engangskop och har
 * darfor ingen MRR alls, precis som i mrrOreFranSubscriptions: den intakten
 * syns i revenue_ore i stallet.
 */
export interface PaketRad {
  nyckel: PaketNyckel;
  namn: string;
  aktiva: number | null;
  /** Null for Allt-dagen: ett engangskop ar ingen aterkommande intakt. */
  mrrOre: number | null;
}

/** Manader per period. 52 veckor pa 12 manader, samma faktor som collect. */
function manaderPerPeriod(langd: string): number | null {
  if (langd === 'vecka') return 12 / 52;
  if (langd === 'månad') return 1;
  if (langd === 'kvartal') return 3;
  return null;
}

export function paketRader(senaste: DagligaMetrik | null): PaketRad[] {
  const prisPerNyckel = new Map(PLANS.map((p) => [p.key, p]));

  return PAKET_ORDNING.map(({ nyckel, namn }) => {
    const aktiva = senaste ? ((senaste[PAKET_KOLUMN[nyckel]] as number | null) ?? null) : null;
    const plan = prisPerNyckel.get(nyckel as (typeof PLANS)[number]['key']);

    let mrrOre: number | null = null;
    if (plan && typeof aktiva === 'number') {
      const manader = manaderPerPeriod(plan.length);
      mrrOre = manader === null ? null : Math.round((plan.amount * 100 * aktiva) / manader);
    }

    // Namnet ur PLANS ar sanningen, PAKET_ORDNING ar reserven.
    return { nyckel, namn: plan?.name ?? namn, aktiva, mrrOre };
  });
}
