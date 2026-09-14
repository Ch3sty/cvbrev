/**
 * Träfflistans urval och ordning (runda 2).
 *
 * Förut visades allt: 393 rader, alla med 95 %, betalväggen flera hundra
 * rader ned. En lista som inte väljer åt användaren har lämnat tillbaka
 * arbetet hon kom för att slippa. Nu väljer vi: topp 25, sorterade på
 * matchgrad med färskhet som skiljedomare när två annonser är lika bra.
 *
 * Färskheten som tiebreak är inte kosmetik. Två lika bra annonser skiljer sig
 * i en enda praktisk sak: den som publicerades i går har färre sökande än den
 * som legat ute i en månad.
 */

import { scoreJob, type MatchScore } from './match-score';
import type { ActiveCVData } from '../getJobbmatchningData';

/** Hur många träffar listan visar. Fler blir en databas, inte ett urval. */
export const TOP_N = 25;

/**
 * Matchgraden som krävs för att kallas en träff. Under 60 är det inte ett
 * jobb som passar utan ett jobb som finns.
 */
export const MATCH_THRESHOLD = 60;

export interface RankedJob {
  job: Record<string, any>;
  score: MatchScore;
}

/**
 * Poängsätter och sorterar hela listan, och skär den vid topp 25.
 *
 * Returnerar både urvalet och hur många som klarade tröskeln, eftersom
 * rubriken ovanför listan behöver båda talen: "600 annonser lästa, 25 passar
 * dig bäst" när det finns fler än 25 över tröskeln, annars det faktiska
 * antalet.
 */
export function rankMatches(
  jobs: Array<Record<string, any>>,
  cv: ActiveCVData | null,
  onskadeOrter: string[] = [],
  topN: number = TOP_N
): { ranked: RankedJob[]; aboveThreshold: number; scoredTotal: number } {
  const scored: RankedJob[] = jobs.map((job) => ({
    job,
    score: scoreJob(job, cv, onskadeOrter),
  }));

  scored.sort((a, b) => {
    if (b.score.score !== a.score.score) return b.score.score - a.score.score;
    // Lika matchgrad: färskast först.
    const ta = Date.parse(String(a.job.publication_date ?? '')) || 0;
    const tb = Date.parse(String(b.job.publication_date ?? '')) || 0;
    return tb - ta;
  });

  const aboveThreshold = scored.filter((s) => s.score.score >= MATCH_THRESHOLD).length;

  return {
    ranked: scored.slice(0, topN),
    aboveThreshold,
    scoredTotal: scored.length,
  };
}

/**
 * Raden ovanför listan: "600 annonser lästa, 25 passar dig bäst".
 *
 * Klarar färre än 25 tröskeln säger vi det antalet i stället, utan "bäst":
 * "600 annonser lästa, 11 passar dig". Att skriva 25 när elva passar vore
 * att räkna upp fjorton annonser vi själva underkänt.
 */
export function readCountLabel(
  adsRead: number,
  aboveThreshold: number,
  shown: number
): string {
  const lasta = adsRead.toLocaleString('sv-SE');
  if (aboveThreshold >= shown && shown > 0) {
    return `${lasta} annonser lästa, ${shown} passar dig bäst`;
  }
  const antal = Math.min(aboveThreshold, shown);
  if (antal === 0) return `${lasta} annonser lästa, inga starka träffar`;
  return `${lasta} annonser lästa, ${antal} passar dig`;
}
