// src/lib/applications/cvComparison.ts
// "CV A ger 30 procent svar, CV B ger 8" (docs/plan-inloggat-omdesign.md,
// avsnitt 5).
//
// Den enda insikt i produkten som ingen konkurrent kan kopiera, eftersom den
// kräver vår egen historik. Den kräver också att vi är ärliga med underlaget:
// svarsfrekvens på tre ansökningar är brus, inte insikt. Därför visas
// jämförelsen bara när det finns minst två CV med loggade ansökningar och
// minst fem ansökningar totalt med känt CV. Under det visas ett tomt
// tillstånd som förklarar vad som saknas.
//
// Klientsäker: ren beräkning, inga server-beroenden.

import { statusHasResponse, type JobApplication } from './status';

/** Minsta antal CV med ansökningar innan en jämförelse säger något. */
export const MIN_CVS_FOR_COMPARISON = 2;

/** Minsta antal ansökningar med känt CV innan vi räknar procent. */
export const MIN_APPLICATIONS_FOR_COMPARISON = 5;

export interface CvPerformance {
  cvId: string;
  /** Filnamnet, eller en fallback när CV:t hunnit tas bort. */
  name: string;
  /** Antal ansökningar som använt det här CV:t. */
  applications: number;
  /** Antal av dem som fått någon form av svar. */
  replies: number;
  /** Svarsfrekvens i hela procent. */
  replyRate: number;
}

export interface CvComparison {
  /** Sant när underlaget räcker för att visa siffrorna. */
  hasEnoughData: boolean;
  /** Raderna, bäst svarsfrekvens först. Tom när underlaget inte räcker. */
  rows: CvPerformance[];
  /** Antal ansökningar som saknar cv_id och därför inte kan räknas. */
  unknownCvCount: number;
  /** Antal CV som har minst en ansökan. */
  cvCount: number;
  /** Antal ansökningar med känt CV. */
  knownCount: number;
}

/**
 * Räknar svar per använt CV.
 *
 * `cvNames` mappar cv_id till filnamn. Saknas ett id har CV:t tagits bort,
 * och raden får en neutral etikett i stället för att försvinna: ansökningarna
 * gjordes ändå.
 */
export function compareCvPerformance(
  applications: JobApplication[],
  cvNames: Record<string, string>
): CvComparison {
  const buckets = new Map<string, { applications: number; replies: number }>();
  let unknownCvCount = 0;

  for (const app of applications) {
    if (!app.cv_id) {
      unknownCvCount++;
      continue;
    }
    const bucket = buckets.get(app.cv_id) ?? { applications: 0, replies: 0 };
    bucket.applications++;
    if (statusHasResponse(app.current_status)) bucket.replies++;
    buckets.set(app.cv_id, bucket);
  }

  const rows: CvPerformance[] = Array.from(buckets.entries()).map(([cvId, b]) => ({
    cvId,
    name: cvNames[cvId] ?? 'Borttaget CV',
    applications: b.applications,
    replies: b.replies,
    replyRate: b.applications === 0 ? 0 : Math.round((b.replies / b.applications) * 100),
  }));

  // Bäst svarsfrekvens först. Vid lika: flest ansökningar, alltså tryggast
  // underlag, före.
  rows.sort((a, b) =>
    b.replyRate === a.replyRate ? b.applications - a.applications : b.replyRate - a.replyRate
  );

  const knownCount = rows.reduce((sum, r) => sum + r.applications, 0);
  const hasEnoughData =
    rows.length >= MIN_CVS_FOR_COMPARISON && knownCount >= MIN_APPLICATIONS_FOR_COMPARISON;

  return {
    hasEnoughData,
    rows: hasEnoughData ? rows : [],
    unknownCvCount,
    cvCount: rows.length,
    knownCount,
  };
}

/**
 * Vad som saknas innan jämförelsen kan visas. Vi säger alltid siffran, så
 * användaren kan planera i stället för att bara se en tom ruta.
 */
export function cvComparisonMissingText(c: CvComparison): string {
  if (c.cvCount < MIN_CVS_FOR_COMPARISON) {
    return 'Vi jämför svarsfrekvens mellan dina CV när du har använt minst två olika. Välj CV när du loggar en ansökan, så börjar vi räkna.';
  }
  const missing = MIN_APPLICATIONS_FOR_COMPARISON - c.knownCount;
  const jobs = missing === 1 ? 'en ansökan' : `${missing} ansökningar`;
  return `Du har använt ${c.cvCount} CV. ${jobs} till med valt CV, så visar vi vilket som ger flest svar.`;
}
