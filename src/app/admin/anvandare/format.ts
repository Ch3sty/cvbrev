/**
 * Formatering och paketlogik for Anvandare.
 *
 * Talen skrivs alltid med svenska tusentalsavgransare och renderas i
 * tabular-nums, sa kolumner star i linje nedat. Datum skrivs kort och
 * relativt: en admin som skummar en lista pa 50 rader laser "3 dagar sedan"
 * snabbare an ett ISO-datum, men behover det exakta i title-attributet.
 *
 * Inga streck (spec-admin-tydlighet 2026-09-22, princip 1). Ett datum som
 * saknas ar antingen "aldrig" eller "okant, fore <matstart>", och det ar
 * anroparen som vet vilket.
 *
 * Ren modul utan serverberoenden: klientkomponenter och tester laser den.
 */

import { PLAN_BY_KEY, type PlanKey } from '@/lib/plans/plans';
import { datumKort, tidKort } from '@/lib/admin/tomt';

/** Ett antal, till exempel 1 204. Noll och null ar "0", aldrig streck. */
export function tal(n: number | null | undefined): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '0';
  return n.toLocaleString('sv-SE');
}

/** Datum och tid, exakt. Anvands i title och i tidslinjen. */
export function exaktTid(iso: string | null | undefined, saknas = 'okänd tid'): string {
  if (!iso) return saknas;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return saknas;
  return d.toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Bara datum, till exempel 14 sep 2026. */
export function kortDatum(iso: string | null | undefined, saknas = 'okänt datum'): string {
  if (!iso) return saknas;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return saknas;
  return d.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Relativ tid pa svenska, avrundad nedat. "Nyss" under en minut.
 *
 * Tar en referenstidpunkt sa att server och klient kan rakna fran samma nu
 * och texten inte hoppar vid hydrering.
 */
export function sedan(
  iso: string | null | undefined,
  nu: number = Date.now()
): string {
  if (!iso) return 'Aldrig';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'Aldrig';

  const sek = Math.max(0, Math.floor((nu - t) / 1000));
  if (sek < 60) return 'Nyss';

  const min = Math.floor(sek / 60);
  if (min < 60) return `${min} min sedan`;

  const tim = Math.floor(min / 60);
  if (tim < 24) return `${tim} h sedan`;

  const dag = Math.floor(tim / 24);
  if (dag < 30) return `${dag} ${dag === 1 ? 'dag' : 'dagar'} sedan`;

  const man = Math.floor(dag / 30);
  if (man < 12) return `${man} ${man === 1 ? 'månad' : 'månader'} sedan`;

  const ar = Math.floor(dag / 365);
  return `${ar} år sedan`;
}

/**
 * Ett datum som kan saknas av tva skal: det har aldrig hant, eller det
 * hande innan vi borjade mata. Kontot skapades fore matstarten betyder att
 * vi inte vet; skapades det efter vet vi att det inte hant.
 */
export function datumEllerOrsak(
  iso: string | null | undefined,
  kontoSkapat: string | null | undefined,
  matstart: string
): string {
  if (iso) return kortDatum(iso);
  const start = Date.parse(matstart.length === 10 ? `${matstart}T00:00:00Z` : matstart);
  const skapat = kontoSkapat ? Date.parse(kontoSkapat) : Number.NaN;
  if (Number.isNaN(skapat) || skapat < start) return `okänt, före ${datumKort(matstart)}`;
  return 'aldrig';
}

/** Ett namn att visa nar full_name saknas. */
export function visningsnamn(namn: string | null, epost: string | null): string {
  if (namn && namn.trim()) return namn.trim();
  if (epost) return epost.split('@')[0];
  return 'Namnlos';
}

// ---------------------------------------------------------------------------
// Paket
// ---------------------------------------------------------------------------

/** Provperioden vid registrering, med e-post eller med Google. */
export const TRIAL_KALLOR = ['signup_trial', 'oauth_signup_trial'] as const;

/** Stripe-statusar som betyder att kunden betalar. */
export const BETALANDE_STATUS = ['active', 'past_due'] as const;

/**
 * Gruppen en rad hor till. Filtret i data.ts uttrycker exakt samma regel i
 * PostgREST, och testet haller dem lika.
 *
 *   betalande        levande Stripe-prenumeration, eller engangskop som galler
 *   provperiod       provperiod som galler (registreringens eller Stripes)
 *   provperiod_slut  provperiod vid registrering som gatt ut
 *   tilldelad        premium fran admin eller bonus, utan betalning
 *   gratis           allt annat
 *   undantagen       adminkonto eller testkonto, raknas aldrig
 */
export type PaketGrupp =
  | 'betalande'
  | 'provperiod'
  | 'provperiod_slut'
  | 'tilldelad'
  | 'gratis'
  | 'undantagen';

export interface PaketUnderlag {
  undantag?: string | null;
  subscription_status: string | null;
  premium_source: string | null;
  premium_scope?: string | null;
  premium_until: string | null;
  /** Paketet ur prenumerationens pris, slaget upp pa servern. */
  planKey?: PlanKey | null;
}

export interface PaketEtikett {
  grupp: PaketGrupp;
  /** Paketnamnet i bestamd form, eller Provperiod, Gratis, Admin, Testkonto. */
  namn: string;
  /** Lopande prenumeration: "Galler till" blir "lopande sedan <datum>". */
  lopande: boolean;
  /** Undantagets skal, nar raden ar undantagen. */
  undantag: 'admin' | 'test' | null;
}

function giltig(until: string | null, nu: number): boolean {
  if (!until) return false;
  const t = Date.parse(until);
  return !Number.isNaN(t) && t > nu;
}

/** Paketet for en lopande prenumeration: priset forst, behorigheten som reserv. */
function prenumerationsNamn(planKey: PlanKey | null | undefined, scope: string | null | undefined): string {
  if (planKey) return PLAN_BY_KEY[planKey].name;
  if (scope === 'cv') return PLAN_BY_KEY.cv_week.name;
  if (scope === 'tester') return PLAN_BY_KEY.test_week.name;
  return 'Allt, okänd längd';
}

/** Engangskopet ur premium_source, till exempel onetime_1d. */
function engangsNamn(source: string): string {
  const dagar = Number.parseInt(source.replace(/^onetime_/, ''), 10);
  if (dagar === 1) return PLAN_BY_KEY.all_day.name;
  return Number.isFinite(dagar) ? `Engångsköp ${dagar} dagar` : 'Engångsköp';
}

/**
 * Raden som paket, i bestamd form. Ordningen ar regeln:
 *
 *   1. Undantagna konton ar Admin eller Testkonto, oavsett vad de har.
 *   2. Levande Stripe-prenumeration (active, past_due) ar betalande.
 *   3. Stripe-trial ar provperiod.
 *   4. Engangskop som galler ar betalande.
 *   5. Premium fran admin ar tilldelad sa lange den galler (null = utan slut).
 *   6. Provperiod vid registrering: pagar eller slut.
 *   7. Ovriga bonuskallor som galler ar tilldelade.
 *   8. Allt annat ar gratis.
 */
export function paketEtikett(rad: PaketUnderlag, nu: number = Date.now()): PaketEtikett {
  const ut = (grupp: PaketGrupp, namn: string, lopande = false): PaketEtikett => ({
    grupp,
    namn,
    lopande,
    undantag: null,
  });

  if (rad.undantag === 'admin' || rad.undantag === 'test') {
    return {
      grupp: 'undantagen',
      namn: rad.undantag === 'admin' ? 'Admin' : 'Testkonto',
      lopande: false,
      undantag: rad.undantag,
    };
  }

  const status = rad.subscription_status;
  const kalla = rad.premium_source;

  if (status === 'active' || status === 'past_due') {
    return ut('betalande', prenumerationsNamn(rad.planKey, rad.premium_scope), true);
  }
  if (status === 'trialing') return ut('provperiod', 'Provperiod');

  if (kalla?.startsWith('onetime_') && giltig(rad.premium_until, nu)) {
    return ut('betalande', engangsNamn(kalla));
  }

  if (kalla === 'admin' && (!rad.premium_until || giltig(rad.premium_until, nu))) {
    return ut('tilldelad', 'Tilldelad av admin');
  }

  if (kalla && (TRIAL_KALLOR as readonly string[]).includes(kalla)) {
    return giltig(rad.premium_until, nu)
      ? ut('provperiod', 'Provperiod')
      : ut('provperiod_slut', 'Provperiod slut');
  }

  if (kalla && kalla !== 'admin' && !kalla.startsWith('onetime_') && giltig(rad.premium_until, nu)) {
    return ut('tilldelad', KALLA_TEXT[kalla] ?? 'Bonusdagar');
  }

  return ut('gratis', 'Gratis');
}

/**
 * "Galler till" for en rad.
 *
 * Lopande prenumeration: "lopande sedan 24 dec" nar startdagen ar kand ur
 * Stripe, annars "lopande". Engangs och provperiod: tidpunkten. Provperiod
 * slut: nar den gick ut. Gratis har inget att galla till.
 */
export function gallerTill(
  etikett: PaketEtikett,
  rad: Pick<PaketUnderlag, 'premium_until'>,
  lopandeSedan?: string | null
): string {
  if (etikett.grupp === 'undantagen') return 'räknas inte';
  if (etikett.lopande) return lopandeSedan ? `löpande sedan ${datumKort(lopandeSedan)}` : 'löpande';
  if (etikett.grupp === 'gratis') return 'inget paket';
  if (etikett.grupp === 'provperiod_slut') {
    return rad.premium_until ? `gick ut ${datumKort(rad.premium_until)}` : 'gått ut';
  }
  if (!rad.premium_until) return 'utan slutdag';
  return tidKort(rad.premium_until);
}

/** premium_source pa svenska. */
export const KALLA_TEXT: Record<string, string> = {
  stripe: 'Stripe',
  admin: 'Tilldelad av admin',
  signup_trial: 'Provperiod vid registrering',
  oauth_signup_trial: 'Provperiod vid registrering med Google',
  onboarding_completion: 'Bonus för slutförd introduktion',
  guest_invitation: 'Inbjudan från en vän',
  reward_extension: 'Bonusdagar',
};

export function kallaText(source: string | null | undefined): string {
  if (!source) return 'ingen';
  if (source.startsWith('onetime_')) return `Engångsköp, ${engangsNamn(source)}`;
  return KALLA_TEXT[source] ?? source;
}

/** Stripes prenumerationsstatus pa svenska. */
const STATUS_TEXT: Record<string, string> = {
  active: 'aktiv',
  trialing: 'provperiod i Stripe',
  past_due: 'betalningen släpar',
  canceled: 'uppsagd',
  incomplete: 'ofullständig',
  incomplete_expired: 'ofullständig, avbruten',
  unpaid: 'obetald',
  paused: 'pausad',
};

export function statusText(status: string | null | undefined): string {
  if (!status) return 'ingen prenumeration';
  return STATUS_TEXT[status] ?? status;
}

/** premium_scope pa svenska. */
export function behorighetText(scope: string | null | undefined): string {
  if (scope === 'cv') return 'CV-spåret';
  if (scope === 'tester') return 'Testspåret';
  if (scope === 'allt') return 'Allt';
  return 'ingen';
}
