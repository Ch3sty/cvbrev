/**
 * Raderade konton på /admin/anvandare (docs/beslut-mejl-och-radering-2026-11-22.md,
 * 2c punkt 8). Läser konto_avslut och räknar ihop. Visas bara som antal och
 * fördelningar, aldrig rad för rad och aldrig i korstabeller, och
 * fördelningen först när minst fem konton har raderats, så att ingen enskild
 * rad går att känna igen.
 *
 * Tabellen finns först när migreringen 20261123090000_konto_avslut har körts.
 * Saknas den, eller svarar den inte, ger läsningen ett tomt resultat och
 * sidan visar sitt tomma läge, aldrig ett fel.
 */

import { ANLEDNINGAR, type AvslutRad } from '@/lib/konto/avslut';

/** Fördelningen visas från så många raderade konton. */
export const AVSLUT_MINSTA_ANTAL = 5;

const SIDA = 1000;

export interface Andel {
  etikett: string;
  antal: number;
}

export interface AvslutSammanstallning {
  antal: number;
  perKvartal: Array<{ etikett: string; antal: number }>;
  anledning: Andel[];
  alder: Andel[];
  premium: Andel[];
  senastAktiv: Andel[];
  anvandning: Andel[];
}

type Rad = Pick<
  AvslutRad,
  | 'kvartal'
  | 'kontots_alder'
  | 'hade_premium'
  | 'har_betalat'
  | 'antal_cv'
  | 'antal_brev'
  | 'antal_test'
  | 'antal_sokta'
  | 'dagar_sedan_aktivitet'
  | 'anledning'
>;

const ALDER: Array<[AvslutRad['kontots_alder'], string]> = [
  ['under_1_dag', 'Under en dag'],
  ['1_7_dagar', '1 till 7 dagar'],
  ['8_30_dagar', '8 till 30 dagar'],
  ['31_90_dagar', '31 till 90 dagar'],
  ['91_365_dagar', '91 till 365 dagar'],
  ['over_1_ar', 'Över ett år'],
];

const AKTIV: Array<[AvslutRad['dagar_sedan_aktivitet'], string]> = [
  ['under_1', 'Under ett dygn sedan'],
  ['1_7', '1 till 7 dagar sedan'],
  ['8_30', '8 till 30 dagar sedan'],
  ['31_90', '31 till 90 dagar sedan'],
  ['over_90', 'Över 90 dagar sedan'],
  ['okant', 'Okänt'],
];

/** "2026 kvartal 4" ur '2026-10-01'. */
export function kvartalEtikett(kvartal: string): string {
  const [ar, man] = kvartal.split('-').map(Number);
  return `${ar} kvartal ${Math.floor((man - 1) / 3) + 1}`;
}

/** Ren sammanställning, testbar utan databas. */
export function sammanstall(rader: Rad[]): AvslutSammanstallning {
  const rakna = <T,>(fn: (r: Rad) => T, v: T) => rader.filter((r) => fn(r) === v).length;

  const kvartal = new Map<string, number>();
  for (const r of rader) kvartal.set(r.kvartal, (kvartal.get(r.kvartal) ?? 0) + 1);

  return {
    antal: rader.length,
    perKvartal: [...kvartal.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, antal]) => ({ etikett: kvartalEtikett(k), antal })),
    anledning: [
      ...ANLEDNINGAR.map((a) => ({ etikett: a.etikett, antal: rakna((r) => r.anledning, a.nyckel) })),
      { etikett: 'Ingen anledning vald', antal: rader.filter((r) => !r.anledning).length },
    ],
    alder: ALDER.map(([v, etikett]) => ({ etikett, antal: rakna((r) => r.kontots_alder, v) })),
    premium: [
      { etikett: 'Hade Premium vid avslutet', antal: rakna((r) => r.hade_premium, true) },
      { etikett: 'Har betalat någon gång', antal: rakna((r) => r.har_betalat, true) },
    ],
    senastAktiv: AKTIV.map(([v, etikett]) => ({ etikett, antal: rakna((r) => r.dagar_sedan_aktivitet, v) })),
    anvandning: [
      { etikett: 'Minst ett CV', antal: rader.filter((r) => r.antal_cv !== '0').length },
      { etikett: 'Minst ett brev', antal: rader.filter((r) => r.antal_brev !== '0').length },
      { etikett: 'Minst ett test', antal: rader.filter((r) => r.antal_test !== '0').length },
      { etikett: 'Minst en sökt tjänst', antal: rader.filter((r) => r.antal_sokta !== '0').length },
    ],
  };
}

/**
 * Läser alla rader, sida för sida (PostgREST kapar tyst vid 1 000). Kastar
 * aldrig: ett fel, till exempel att tabellen inte finns än, ger noll rader.
 */
export async function hamtaAvslut(admin: any): Promise<AvslutSammanstallning> {
  const rader: Rad[] = [];
  try {
    for (let fran = 0; ; fran += SIDA) {
      const { data, error } = await admin
        .from('konto_avslut')
        .select(
          'kvartal, kontots_alder, hade_premium, har_betalat, antal_cv, antal_brev, antal_test, antal_sokta, dagar_sedan_aktivitet, anledning'
        )
        // Tabellen har inget id (policyn: raden innehåller aldrig något id).
        // Sorteringen går på alla lästa kolumner: rader som hamnar lika är då
        // identiska, så sidindelningen ger rätt antal av varje sort.
        .order('kvartal')
        .order('kontots_alder')
        .order('hade_premium')
        .order('har_betalat')
        .order('antal_cv')
        .order('antal_brev')
        .order('antal_test')
        .order('antal_sokta')
        .order('dagar_sedan_aktivitet')
        .order('anledning')
        .range(fran, fran + SIDA - 1);
      if (error) {
        console.error('[admin/anvandare] konto_avslut gick inte att läsa:', error.message);
        return sammanstall([]);
      }
      const sida = (data ?? []) as Rad[];
      rader.push(...sida);
      if (sida.length < SIDA) break;
    }
  } catch (e) {
    console.error('[admin/anvandare] konto_avslut:', e instanceof Error ? e.message : String(e));
    return sammanstall([]);
  }
  return sammanstall(rader);
}
