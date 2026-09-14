/**
 * Skälen bakom en träff (docs/plan-jobbmatchning.md, avsnitt 2 punkt 2).
 *
 * "Varje träff förklarar sig." En procentsiffra ensam säger ingenting: den
 * är vår modells tal om användaren, inte användarens bild av jobbet. Två
 * till tre skäl i klartext säger varför, och det är också vad betalväggen
 * säljer.
 *
 * Allt härleds ur det edge-funktionen match-jobs redan skickar. Ingen ny
 * fråga, ingen ny kolumn: vi räknar bara ihop det som står i svaret.
 */

import type { ActiveCVData } from '../getJobbmatchningData';

/** Normalisering så "React.js" och "react js" räknas som samma kompetens. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.\-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Kompetenserna annonsen faktiskt ber om, både krav och önskemål. */
function jobSkills(job: Record<string, any>): string[] {
  const from = (bucket: unknown): string[] =>
    Array.isArray(bucket)
      ? bucket
          .map((s: any) => (typeof s === 'string' ? s : s?.label ?? s?.name ?? ''))
          .filter((s: string) => s.trim() !== '')
      : [];

  const alla = [
    ...from(job.must_have?.skills),
    ...from(job.nice_to_have?.skills),
    ...from(job.enrichedSkills),
  ];

  // Dedup på normaliserad form, men behåll annonsens egen stavning.
  const sedda = new Set<string>();
  return alla.filter((s) => {
    const n = norm(s);
    if (n === '' || sedda.has(n)) return false;
    sedda.add(n);
    return true;
  });
}

export interface MatchReasons {
  /** Två till tre korta skäl, redan formulerade för visning. */
  reasons: string[];
  /** Hur många av CV:ts roller som ligger nära annonsens titel. */
  roleHits: number;
  /** Matchade kompetenser av annonsens totala. */
  skillHits: number;
  skillTotal: number;
}

/**
 * Räknar ut skälen för en träff. Håller sig till tre skäl: fler blir en
 * uppräkning i stället för en förklaring.
 */
export function buildMatchReasons(
  job: Record<string, any>,
  cv: ActiveCVData | null
): MatchReasons {
  const rubrik = norm(String(job.headline ?? ''));

  // En roll räknas som träff om dess namn eller något av taxonomins
  // alternativa namn förekommer i annonsens rubrik.
  const roller = cv?.extracted_occupations ?? [];
  const roleHits = roller.filter((occ) => {
    const kandidater = [occ.normalized, occ.original, ...(occ.alternative_labels ?? [])];
    return kandidater.some((k) => {
      const n = norm(String(k ?? ''));
      return n.length > 2 && rubrik.includes(n);
    });
  }).length;

  const cvSkills = new Set((cv?.extracted_skills ?? []).map(norm));
  const annonsSkills = jobSkills(job);
  const skillTotal = annonsSkills.length;
  const skillHits = annonsSkills.filter((s) => cvSkills.has(norm(s))).length;

  const ort =
    job.workplace_address?.municipality ||
    job.workplace_address?.region ||
    null;

  const reasons: string[] = [];

  if (roleHits > 0) {
    reasons.push(
      roleHits === 1 ? '1 av dina roller' : `${roleHits} av dina roller`
    );
  }

  if (skillTotal > 0 && skillHits > 0) {
    reasons.push(`${skillHits} av ${skillTotal} kompetenser`);
  }

  if (ort) reasons.push(String(ort));

  // Har varken roll eller kompetens gett utslag säger vi det som faktiskt
  // fällde avgörandet i stället för att hitta på ett skäl.
  if (reasons.length === 0 && typeof job.relevance === 'number') {
    reasons.push('Liknar din bakgrund');
  }

  return { reasons: reasons.slice(0, 3), roleHits, skillHits, skillTotal };
}

/**
 * "publicerad i går" i stället för ett datum. Färskhet är det enda tidsvärde
 * som betyder något i en träfflista.
 */
export function publishedLabel(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const dagar = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (dagar <= 0) return 'publicerad i dag';
  if (dagar === 1) return 'publicerad i går';
  if (dagar < 7) return `publicerad för ${dagar} dagar sedan`;
  if (dagar < 14) return 'publicerad förra veckan';
  return `publicerad ${d.toLocaleDateString('sv-SE')}`;
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
