// src/lib/recruiter/poolSearch.ts
// Delad sök- och rankningslogik för kandidatpoolen. Används av
// /api/recruiter/pool och av bevakningscronen, så filtreringen aldrig
// divergerar mellan portalen och mailen.
//
// Sökprincip (FAS A1 i docs/plan-rekryterare-v2.md):
//   - Fritexten tokeniseras (gemener, whitespace/komma, stoppord bort).
//   - AND-logik: VARJE token måste träffa någonstans i kandidatens haystack.
//   - Relevanspoäng per token: roll/historiktitel +3, kompetens +2,
//     pitch/kontexttagg +1. Titelmatch väger alltså tyngre än kompetensmatch.
//   - matchReasons byggs serverside så rankningen är förklarbar i UI:t.
//
// Lönespann: budgetfiltret trycks ned som WHERE-villkor i SQL. Värdena
// SELECT:as aldrig och lämnar aldrig servern.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import {
  buildCandidateCard,
  createPercentileContext,
  FAMILY_LABELS,
  type CandidateCard,
  type CandidateProfileRow,
  type EducationLevelBucket,
  type FamilyKey,
} from './candidateData';
import { visibleProfilesQuery } from './candidateAccess';

type Admin = SupabaseClient<Database>;

export type SeniorityBucket = 'junior' | 'mid' | 'senior' | 'expert';
export type PoolSortKey = 'relevance' | 'seniority' | 'recent' | 'testScore';

export interface PoolFilters {
  /** Fritext: roll, kompetens, teknik. */
  q?: string | null;
  seniority?: SeniorityBucket[];
  regions?: string[];
  availability?: string | null;
  workplace?: string[];
  extent?: string[];
  employmentTypes?: string[];
  /** Percentilgolv, t.ex. 90 för "topp 10 %". */
  minPercentile?: number | null;
  /** Golvet gäller VALDA familjer; tomt = någon familj (som tidigare). */
  testFamilies?: FamilyKey[];
  strengths?: string[];
  archetypes?: string[];
  educationLevels?: EducationLevelBucket[];
  /** Månadsbudget i kr. Kandidater utan angivet löneanspråk inkluderas. */
  budget?: number | null;
  driversLicense?: boolean | null;
}

export interface PoolCandidate extends CandidateCard {
  /** Serverbyggd förklaring till varför kandidaten rankas som den gör (max 3). */
  matchReasons: string[];
}

export interface PoolSearchResult {
  candidates: PoolCandidate[];
  total: number;
  /**
   * Kandidater som klarar sökningens övriga krav men inte visar styrkor
   * (när filtret Personlighetsstyrka är på) eller inte har någon visad
   * arbetsstil (när filtret Arbetsstil är på). Kandidater som visar andra
   * styrkor än de valda räknas inte. 0 när inget av filtren är på. Ingår i
   * candidates och total bara när anroparen bett om det (inkluderaDolda).
   */
  utanPersonlighet: number;
}

export interface PoolSearchOptions {
  /** Ta med kandidaterna i utanPersonlighet bland träffarna ("Visa även dem"). */
  inkluderaDolda?: boolean;
}

/** Vilka nycklar en sparad sökning får innehålla (whitelist vid POST). */
export const POOL_FILTER_KEYS = [
  'q',
  'seniority',
  'regions',
  'availability',
  'workplace',
  'extent',
  'employmentTypes',
  'minPercentile',
  'testFamilies',
  'strengths',
  'archetypes',
  'educationLevels',
  'budget',
  'driversLicense',
] as const;

const STOPWORDS = new Set([
  'och', 'med', 'som', 'i', 'på', 'för', 'av', 'till', 'en', 'ett', 'eller',
  'inom', 'hos', 'the', 'and',
]);

export function tokenizeQuery(q: string | null | undefined): string[] {
  if (!q) return [];
  return q
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

const SENIORITY_BUCKETS: Record<SeniorityBucket, (years: number) => boolean> = {
  junior: (y) => y >= 0 && y <= 2,
  mid: (y) => y >= 3 && y <= 5,
  senior: (y) => y >= 6 && y <= 9,
  expert: (y) => y >= 10,
};

interface TokenMatch {
  score: number;
  matchedInTitle: string[];
  matchedInSkill: string[];
  matchedInPitch: string[];
}

/** AND-logik: null om någon token saknar träff, annars poäng + var det träffade. */
function matchTokens(card: CandidateCard, tokens: string[]): TokenMatch | null {
  const titleText = [card.role ?? '', ...card.historyTitles].join(' ').toLowerCase();
  const skillText = card.skills.join(' ').toLowerCase();
  const pitchText = [card.pitch ?? '', ...card.contextTags].join(' ').toLowerCase();

  const result: TokenMatch = { score: 0, matchedInTitle: [], matchedInSkill: [], matchedInPitch: [] };

  for (const token of tokens) {
    let tokenScore = 0;
    if (titleText.includes(token)) {
      tokenScore = 3;
      result.matchedInTitle.push(token);
    } else if (skillText.includes(token)) {
      tokenScore = 2;
      result.matchedInSkill.push(token);
    } else if (pitchText.includes(token)) {
      tokenScore = 1;
      result.matchedInPitch.push(token);
    }
    if (tokenScore === 0) return null;
    result.score += tokenScore;
  }
  return result;
}

/**
 * Kompletthetspoängen, bara tiebreak. Visade styrkor ger ingen poäng
 * (ägarbeslut 2026-11-22): ingen ska hamna längre ned för att inte visa
 * sin personlighet.
 */
export function completenessScore(card: CandidateCard): number {
  return (
    card.testBadges.length * 3 +
    (card.yearsOfExperience ? 2 : 0) +
    (card.skills.length ? 1 : 0)
  );
}

function bestPercentile(card: CandidateCard): { percentile: number; family: FamilyKey } | null {
  let best: { percentile: number; family: FamilyKey } | null = null;
  for (const badge of card.testBadges) {
    if (badge.percentile !== null && (!best || badge.percentile > best.percentile)) {
      best = { percentile: badge.percentile, family: badge.family };
    }
  }
  return best;
}

function buildMatchReasons(card: CandidateCard, match: TokenMatch | null): string[] {
  const reasons: string[] = [];

  if (match) {
    const matchedTokens = [...match.matchedInTitle, ...match.matchedInSkill, ...match.matchedInPitch];
    const fields = [
      match.matchedInTitle.length > 0 ? 'roll' : null,
      match.matchedInSkill.length > 0 ? 'kompetenser' : null,
      match.matchedInPitch.length > 0 ? 'pitch' : null,
    ].filter(Boolean) as string[];
    if (matchedTokens.length > 0 && fields.length > 0) {
      reasons.push(`Matchar "${matchedTokens.join(', ')}" i ${fields.join(' och ')}`);
    }
  }

  const best = bestPercentile(card);
  if (best) {
    reasons.push(`Topp ${Math.max(1, 100 - best.percentile)} % i ${FAMILY_LABELS[best.family]}`);
  }

  if (card.yearsOfExperience) {
    reasons.push(`${card.yearsOfExperience} års erfarenhet`);
  }

  return reasons.slice(0, 3);
}

function sortCandidates<T extends { card: CandidateCard; relevance: number }>(
  candidates: T[],
  sort: PoolSortKey,
  hasQuery: boolean
): T[] {
  const byCompleteness = (a: CandidateCard, b: CandidateCard) => {
    const diff = completenessScore(b) - completenessScore(a);
    if (diff !== 0) return diff;
    return (b.yearsOfExperience ?? 0) - (a.yearsOfExperience ?? 0);
  };

  return [...candidates].sort((a, b) => {
    switch (sort) {
      case 'seniority':
        return (
          (b.card.yearsOfExperience ?? 0) - (a.card.yearsOfExperience ?? 0) ||
          byCompleteness(a.card, b.card)
        );
      case 'recent': {
        const aTime = a.card.activeSince ? Date.parse(a.card.activeSince) : 0;
        const bTime = b.card.activeSince ? Date.parse(b.card.activeSince) : 0;
        return bTime - aTime || byCompleteness(a.card, b.card);
      }
      case 'testScore': {
        const aBest = bestPercentile(a.card)?.percentile ?? -1;
        const bBest = bestPercentile(b.card)?.percentile ?? -1;
        return (
          bBest - aBest ||
          b.card.testBadges.length - a.card.testBadges.length ||
          byCompleteness(a.card, b.card)
        );
      }
      case 'relevance':
      default:
        if (hasQuery && b.relevance !== a.relevance) return b.relevance - a.relevance;
        return byCompleteness(a.card, b.card);
    }
  });
}

/**
 * Kör hela sökningen: strukturella filter i SQL, härledda filter efter
 * kortbygget, relevansrankning och matchförklaringar. Returnerar ALLA träffar
 * (paginering är anroparens ansvar) så cron kan diffa mot last_notified_at.
 */
export async function runPoolSearch(
  admin: Admin,
  filters: PoolFilters,
  sort: PoolSortKey = 'relevance',
  options: PoolSearchOptions = {}
): Promise<PoolSearchResult> {
  // Strukturella filter trycks ned i frågan; fritext/percentil/styrka m.fl.
  // filtreras efter kortbygget eftersom de kräver härledd data.
  // Samma ingång som alla andra rekryterarvägar (candidateAccess.ts).
  let query = (await visibleProfilesQuery(admin)).query.order('updated_at', { ascending: false });

  if (filters.regions?.length) query = query.overlaps('regions', filters.regions);
  if (filters.availability) query = query.eq('availability', filters.availability);
  if (filters.workplace?.length) query = query.overlaps('workplace', filters.workplace);
  if (filters.extent?.length) query = query.overlaps('extent', filters.extent);
  if (filters.employmentTypes?.length) {
    query = query.overlaps('employment_types', filters.employmentTypes);
  }
  if (filters.driversLicense) query = query.eq('drivers_license', true);
  // Budget: WHERE-villkor utan att kolumnen någonsin SELECT:as. Kandidater
  // som inte angett löneanspråk sållas inte bort på saknad data.
  if (filters.budget && Number.isFinite(filters.budget)) {
    query = query.or(`salary_min.is.null,salary_min.lte.${Math.round(filters.budget)}`);
  }

  const { data: rows, error } = await query;
  if (error) {
    console.error('poolSearch: kunde inte läsa candidate_profiles', error);
    return { candidates: [], total: 0, utanPersonlighet: 0 };
  }

  const profiles = (rows ?? []) as CandidateProfileRow[];

  // Delad percentilkontext: aggregatfrågorna körs en gång per test_type.
  const ctx = createPercentileContext(admin);
  const cards = await Promise.all(profiles.map((row) => buildCandidateCard(admin, row, ctx)));

  const tokens = tokenizeQuery(filters.q);
  const hasQuery = tokens.length > 0;

  const matched: Array<{ card: CandidateCard; relevance: number; match: TokenMatch | null }> = [];
  let utanPersonlighet = 0;

  for (const card of cards) {
    // Utan yrkesroll hör profilen inte hemma i poolen (candidateAccess.ts).
    if (!card.role?.trim()) continue;

    // Fritext: AND över alla tokens, annars bort.
    let match: TokenMatch | null = null;
    if (hasQuery) {
      match = matchTokens(card, tokens);
      if (!match) continue;
    }

    if (filters.seniority?.length) {
      const years = card.yearsOfExperience;
      if (years === null) continue;
      if (!filters.seniority.some((bucket) => SENIORITY_BUCKETS[bucket]?.(years))) continue;
    }

    if (filters.minPercentile !== null && filters.minPercentile !== undefined) {
      const families =
        filters.testFamilies && filters.testFamilies.length > 0 ? filters.testFamilies : null;
      const hit = card.testBadges.some(
        (b) =>
          b.percentile !== null &&
          b.percentile >= filters.minPercentile! &&
          (families === null || families.includes(b.family))
      );
      if (!hit) continue;
    }

    if (filters.educationLevels?.length) {
      if (
        !card.educationLevelBucket ||
        !filters.educationLevels.includes(card.educationLevelBucket)
      ) {
        continue;
      }
    }

    // Personlighetsfiltren sist, så att vi vet att övriga krav är uppfyllda.
    // Den som inte visar styrkor (eller ingen arbetsstil) räknas för sig och
    // kan tas med; den som visar andra styrkor än de valda gör inte det.
    let doljer = false;
    if (filters.strengths?.length) {
      if (!filters.strengths.some((s) => card.personalityStrengths.includes(s))) {
        if (card.personalityStrengths.length > 0) continue;
        doljer = true;
      }
    }

    if (filters.archetypes?.length) {
      if (!card.workStyleArchetype || !filters.archetypes.includes(card.workStyleArchetype)) {
        if (card.workStyleArchetype) continue;
        doljer = true;
      }
    }

    if (doljer) {
      utanPersonlighet += 1;
      if (!options.inkluderaDolda) continue;
    }

    matched.push({ card, relevance: match?.score ?? 0, match });
  }

  const sorted = sortCandidates(matched, sort, hasQuery);

  return {
    candidates: sorted.map((entry) => ({
      ...entry.card,
      matchReasons: buildMatchReasons(entry.card, entry.match),
    })),
    total: matched.length,
    utanPersonlighet,
  };
}
