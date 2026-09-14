/**
 * Skälen bakom en träff (docs/plan-jobbmatchning.md, avsnitt 2 punkt 2).
 *
 * "Varje träff förklarar sig." En procentsiffra ensam säger ingenting: den
 * är vår modells tal om användaren, inte användarens bild av jobbet.
 *
 * Runda 2: skälen var för tunna. En träff visade "1 av dina roller ·
 * Stockholm", en annan bara "Stockholm", och en rad stod helt utan skäl.
 * Två saker ändrades. Skälen räknas nu ur samma uträkning som matchgraden
 * (match-score.ts) i stället för ur en egen parallell logik, så att talet och
 * texten aldrig kan säga emot varandra. Och det finns alltid minst två skäl:
 * ort och färskhet finns på varje annons, så en tom rad är alltid ett
 * beräkningsfel, aldrig ett faktum om annonsen.
 *
 * Ordningen är bestämd: roller, kompetenser, ort, färskhet. Det starkaste
 * argumentet först, det svagaste sist.
 */

import { scoreJob, type MatchScore } from './match-score';
import type { ActiveCVData } from '../getJobbmatchningData';

export interface MatchReasons {
  /** Minst två skäl, i ordningen roller, kompetenser, ort, färskhet. */
  reasons: string[];
  /**
   * Skäl som bara hör hemma i detaljarket. "Inga uttalade krav i annonsen"
   * är en upplysning om annonsen, inte ett argument för träffen, och har
   * inget i listan att göra.
   */
  detailReasons: string[];
  score: MatchScore;
}

/**
 * "publicerad i går" i stället för ett datum. Färskhet är det enda tidsvärde
 * som betyder något i en träfflista.
 */
export function publishedLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return null;

  const dagar = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (dagar <= 0) return 'publicerad i dag';
  if (dagar === 1) return 'publicerad i går';
  if (dagar < 7) return `publicerad för ${dagar} dagar sedan`;
  if (dagar < 14) return 'publicerad förra veckan';
  return `publicerad ${d.toLocaleDateString('sv-SE')}`;
}

/**
 * Skälen för en träff, tillsammans med matchgraden de bygger på.
 *
 * Anroparen kan skicka in en redan uträknad poäng. Listan räknar poängen en
 * gång per annons när den sorterar, och raden ska inte räkna om samma sak.
 */
export function buildMatchReasons(
  job: Record<string, any>,
  cv: ActiveCVData | null,
  onskadeOrter: string[] = [],
  precomputed?: MatchScore
): MatchReasons {
  const score = precomputed ?? scoreJob(job, cv, onskadeOrter);

  const reasons: string[] = [];
  const detailReasons: string[] = [];

  // 1. Roller. "2 av dina 3 roller" säger både hur mycket som träffade och
  //    hur mycket det fanns att träffa. Ett tal utan nämnare säger inget.
  if (score.roleHits > 0 && score.roleTotal > 0) {
    reasons.push(
      score.roleTotal === 1
        ? 'Din roll matchar'
        : `${score.roleHits} av dina ${score.roleTotal} roller`
    );
  }

  // 2. Kompetenser. Har annonsen en utskriven kravprofil räknar vi mot den.
  //    Har den inte det (och det har de allra flesta inte: tjugo av 600 i en
  //    riktig sökning) räknar vi i stället hur många av CV:ts kompetenser som
  //    nämns i annonstexten. Vi säger då också det, i stället för att påstå
  //    att annonsen krävt något den aldrig skrivit ut.
  if (score.hasStatedSkills && score.skillHits > 0) {
    reasons.push(`${score.skillHits} av ${score.skillTotal} kompetenser i kravprofilen`);
  } else if (!score.hasStatedSkills) {
    if (score.skillHits > 0) {
      reasons.push(
        score.skillHits === 1
          ? '1 av dina kompetenser nämns i annonsen'
          : `${score.skillHits} av dina kompetenser nämns i annonsen`
      );
    }
    detailReasons.push('Kompetenser: inga uttalade krav i annonsen');
  }

  // 3. Ort. Distans går före kommunnamnet: kan jobbet göras hemifrån är det
  //    den upplysningen som betyder något, inte var kontoret råkar ligga.
  if (score.isRemote) reasons.push('Distans');
  else if (score.locationLabel) reasons.push(score.locationLabel);

  // 4. Färskhet. Alltid sist, alltid tillgänglig, och därmed garanten för
  //    att ingen rad står tom.
  const publicerad = publishedLabel(job.publication_date);
  if (publicerad) reasons.push(publicerad);

  // Har allt ovan ändå fallerat (annons utan ort och utan datum) säger vi det
  // som faktiskt gäller i stället för att lämna raden tom.
  if (reasons.length < 2) {
    if (score.locationLabel && !reasons.includes(score.locationLabel)) {
      reasons.push(score.locationLabel);
    }
  }
  if (reasons.length < 2) reasons.push('Liknar din bakgrund');

  return { reasons: reasons.slice(0, 4), detailReasons, score };
}

/** Samma sak, men för raden "senaste publicerad i går" i panelen ovanför. */
export function senasteLabel(jobs: Array<Record<string, any>>): string | null {
  const datum = jobs
    .map((j) => j.publication_date)
    .filter((d): d is string => typeof d === 'string' && d !== '')
    .sort()
    .reverse();
  if (datum.length === 0) return null;
  const label = publishedLabel(datum[0]);
  return label ? label.replace('publicerad ', '') : null;
}
