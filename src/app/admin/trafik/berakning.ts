/**
 * Rena beräkningar för Trafik (spec-admin-tydlighet 2026-09-22, sida 6).
 *
 * Ligger utanför data.ts så att både sidan och testerna kan använda dem utan
 * supabase-klienten och utan next/cache.
 *
 * Två saker som var fel före omgången:
 *
 * 1. Periodjämförelsen räknade kalenderdagar. De två eller tre sista dagarna
 *    har Google inte levererat, så den senaste perioden hade färre dagar än
 *    den den jämfördes mot och såg ut som ett ras. Nu jämförs lika många
 *    dagar MED DATA: de sju senaste dagarna med data mot de sju före dem.
 *
 * 2. Dagarna Google inte levererat ritades som tom yta. Nu fylls serien fram
 *    till i dag med null, och sidan ritar luckan som en grå zon märkt
 *    "Google ligger efter".
 */

import { datumKort, tal } from '@/lib/admin/tomt';
import { position as formateraPosition } from './format';

export interface Dagsrad {
  dag: string;
  klick: number | null;
  visningar: number | null;
  ctr: number | null;
  position: number | null;
}

export interface Summa {
  klick: number;
  visningar: number;
  ctr: number | null;
  position: number | null;
}

export interface Jamforelse {
  /** Antal dagar med data i varje period. */
  dagar: number;
  period: Summa;
  foregaende: Summa;
  /** Hur många dagar med data perioderna faktiskt fick. */
  antalNu: number;
  antalFore: number;
  /** Första och sista dagen i varje period, null när perioden är tom. */
  granser: {
    start: string | null;
    slut: string | null;
    foreStart: string | null;
    foreSlut: string | null;
  };
}

/** En dag har data när Google levererat klick eller visningar för den. */
export function harData(r: Pick<Dagsrad, 'klick' | 'visningar'>): boolean {
  return r.klick !== null || r.visningar !== null;
}

/** Summerar dagsrader. Snittpositionen viktas med visningar. */
export function summera(rader: Dagsrad[]): Summa {
  let klick = 0;
  let visningar = 0;
  let vikt = 0;
  let viktVisningar = 0;
  for (const r of rader) {
    klick += r.klick ?? 0;
    visningar += r.visningar ?? 0;
    if (r.position !== null && r.visningar) {
      vikt += r.position * r.visningar;
      viktVisningar += r.visningar;
    }
  }
  return {
    klick,
    visningar,
    ctr: visningar > 0 ? klick / visningar : null,
    position: viktVisningar > 0 ? vikt / viktVisningar : null,
  };
}

/**
 * Jämför de `dagar` senaste dagarna med data mot de `dagar` dagarna med data
 * före dem. Dagar utan data (Googles eftersläp, enstaka luckor) hoppas över i
 * stället för att räknas som noll.
 */
export function jamforDagarMedData(serie: Dagsrad[], dagar = 7): Jamforelse {
  const medData = [...serie].sort((a, b) => a.dag.localeCompare(b.dag)).filter(harData);
  const nu = medData.slice(-dagar);
  const fore = medData.slice(Math.max(0, medData.length - dagar * 2), medData.length - nu.length);

  return {
    dagar,
    period: summera(nu),
    foregaende: summera(fore),
    antalNu: nu.length,
    antalFore: fore.length,
    granser: {
      start: nu[0]?.dag ?? null,
      slut: nu.at(-1)?.dag ?? null,
      foreStart: fore[0]?.dag ?? null,
      foreSlut: fore.at(-1)?.dag ?? null,
    },
  };
}

/**
 * "20 till 22 sep" inom samma manad, "24 aug till 19 sep" over en
 * manadsgrans, "19 sep" nar det ar en dag.
 */
export function intervall(fran: string | null, till: string | null): string {
  if (!fran || !till) return datumKort(fran ?? till);
  if (fran === till) return datumKort(fran);
  if (fran.slice(0, 7) === till.slice(0, 7)) {
    return `${Number(fran.slice(8, 10))} till ${datumKort(till)}`;
  }
  return `${datumKort(fran)} till ${datumKort(till)}`;
}

function nastaDag(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Fyller serien med null-rader för varje saknad dag fram till och med idag.
 * Insamlingen skriver inte alltid en rad för de sista dagarna, och utan
 * raderna finns ingen x-position att rita eftersläpets zon på.
 */
export function fyllTillIdag(serie: Dagsrad[], idag: string): Dagsrad[] {
  if (!serie.length) return serie;
  const perDag = new Map(serie.map((r) => [r.dag, r]));
  const ut: Dagsrad[] = [];
  const sista = serie.reduce((m, r) => (r.dag > m ? r.dag : m), idag);
  for (let dag = serie[0].dag; dag <= sista; dag = nastaDag(dag)) {
    ut.push(perDag.get(dag) ?? { dag, klick: null, visningar: null, ctr: null, position: null });
  }
  return ut;
}

/** Första dagen efter senaste dag med data, om den finns i serien. */
export function efterslapFran(serie: Dagsrad[], senastMedData: string | null): string | null {
  if (!senastMedData) return null;
  return serie.find((r) => r.dag > senastMedData)?.dag ?? null;
}

/**
 * Meningen under klickdiagrammet:
 * "451 klick 24 aug till 19 sep. Senaste dag med data 19 sep: 15 klick,
 * snittposition 14,5. 20 till 22 sep är inte noll, Google har inte
 * levererat dem."
 */
export function klickText(serie: Dagsrad[], senastMedData: string | null): string {
  const medData = serie.filter(harData);
  if (!medData.length || !senastMedData) {
    return 'Google har inte levererat någon dag i fönstret än.';
  }
  const summa = summera(medData);
  const forsta = serie[0].dag;
  const sista = medData.find((r) => r.dag === senastMedData) ?? medData[medData.length - 1];

  const delar = [
    `${tal(summa.klick)} klick ${intervall(forsta, senastMedData)}.`,
    `Senaste dag med data ${datumKort(senastMedData)}: ${tal(sista.klick)} klick${
      sista.position !== null ? `, snittposition ${formateraPosition(sista.position)}` : ''
    }.`,
  ];

  const efter = serie.filter((r) => r.dag > senastMedData);
  if (efter.length === 1) {
    delar.push(`${datumKort(efter[0].dag)} är inte noll, Google har inte levererat den.`);
  } else if (efter.length > 1) {
    delar.push(
      `${intervall(efter[0].dag, efter[efter.length - 1].dag)} är inte noll, Google har inte levererat dem.`
    );
  }
  return delar.join(' ');
}

/** Dagens datum i svensk tid, YYYY-MM-DD. */
export function idagSverige(nu: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(nu);
}
