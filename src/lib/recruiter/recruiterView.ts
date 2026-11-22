// src/lib/recruiter/recruiterView.ts
//
// VITLISTAN. Det enda stället där kandidatdata formas för en rekryterares
// webbläsare (poolen, detaljsidan, förhandspanelen, jämförelsen, inkorgen,
// projekten och delningslänken). Varje rutt som skickar kandidatdata till en
// rekryterare eller till den som öppnar en delad länk går igenom
// toRecruiterCard eller toRecruiterDetail. Funktionerna bygger ett NYTT
// objekt fält för fält: ett fält som läggs till i kandidatdatan längre in
// (candidateData.ts) når aldrig webbläsaren förrän någon skriver in det här.
//
// Regeln, ägarbeslut 2026-11-22:
//   Före kandidatens ja (anonym profil utan accepterat intresse) skickas
//   INGEN fritext ur CV:t. Kvar är strukturerade uppgifter som inte pekar ut
//   personen: yrkesroll, titel per anställning med längd i år (inga datum),
//   kompetenser, region, språk, utbildningsnivå och inriktning utan lärosäte,
//   styrkor i ord, villkor och testens placering. Beskrivningar,
//   arbetsgivare, lärosäten, examensår, namn och e-post hålls inne.
//   Efter ja, eller när kandidaten valt Öppen profil, visas det samtycket
//   säger: arbetsgivare, beskrivningar, lärosäten och namn. E-post kräver
//   alltid ett accepterat intresse. Lönespannet lämnar aldrig servern.
//
// Pitch och kontexttaggar är kandidatens egna ord, skrivna i Bli upptäckt för
// rekryterare, inte CV-text. De följer med i båda lägena.
//
// Kvarvarande risk som inte går att filtrera bort maskinellt: en titel kan
// innehålla arbetsgivarens namn ("Platschef på X"), och kandidaten kan skriva
// ett namn i sin pitch. Vi skickar bara titelfältet och pitchen som de är.

import type {
  CandidateCard,
  CandidateDetail,
  EducationLevelBucket,
  FamilyKey,
  Level,
  WorkStyleReport,
  CardWorkStyle,
} from './candidateData';
import type { WorkStyle } from './workStyle';
import { badgeLabel, FAMILY_LABELS } from './candidateData';
import { synligPercentil } from './placering';

export interface RecruiterAccess {
  /** Arbetsgivare, beskrivningar, lärosäten och namn. */
  contactUnlocked: boolean;
  /** E-post: bara vid accepterat intresse, aldrig enbart öppen profil. */
  emailUnlocked: boolean;
}

/** Läget före kandidatens ja. */
export const ANONYM_ATKOMST: RecruiterAccess = { contactUnlocked: false, emailUnlocked: false };

export function accessFor(
  visibility: string | null | undefined,
  interestStatus: string | null | undefined
): RecruiterAccess {
  const accepted = interestStatus === 'accepted';
  return { contactUnlocked: accepted || visibility === 'open', emailUnlocked: accepted };
}

export interface RecruiterTestBadge {
  family: FamilyKey;
  label: string;
  level: Level | null;
  percentile: number | null;
  sampleSize: number | null;
  /** Bara datumet, aldrig klockslaget. */
  testDate: string | null;
}

export interface RecruiterCard {
  /**
   * Kandidatens id mot rekryteraren: candidate_profiles.public_id, aldrig
   * kontots id (se candidateAccess.ts).
   */
  candidateId: string;
  role: string | null;
  skills: string[];
  regions: string[];
  availability: string | null;
  workplace: string[];
  extent: string[];
  driversLicense: boolean;
  testBadges: RecruiterTestBadge[];
  personalityStrengths: string[];
  visibility: 'anonymous' | 'open';
  yearsOfExperience: number | null;
  latestRole: { title: string; years: number | null } | null;
  educationLevel: string | null;
  educationLevelBucket: EducationLevelBucket | null;
  pitch: string | null;
  historyTitles: string[];
  workStyleArchetype: string | null;
  cardWorkStyle: CardWorkStyle | null;
  activeSince: string | null;
  contextTags: string[];
  /** Bara i poolens svar. */
  matchReasons?: string[];
}

export interface RecruiterExperience {
  position: string | null;
  /** null före ja. */
  company: string | null;
  /** Före ja längden i ord ("3 år"), efter ja perioden med datum. */
  period: string | null;
  /** null före ja. */
  description: string | null;
  /** true när CV:t har en beskrivning som hålls inne till efter ja. */
  descriptionHidden: boolean;
}

export interface RecruiterEducation {
  /** null före ja. */
  school: string | null;
  degree: string | null;
  /** null före ja: examensåret ihop med inriktningen pekar för nära personen. */
  year: string | null;
  /** true när CV:t har ett lärosäte som hålls inne till efter ja. */
  schoolHidden: boolean;
}

export interface RecruiterTestResult {
  family: FamilyKey;
  level: Level;
  percentile: number | null;
  sampleSize: number | null;
  completedAt: string | null;
  attempts: number;
}

export interface RecruiterDetail extends RecruiterCard {
  experience: RecruiterExperience[];
  education: RecruiterEducation[];
  testResults: RecruiterTestResult[];
  languages: string[];
  workStyle: WorkStyle | null;
  interviewGuide: string[];
  workStyleReport: WorkStyleReport | null;
  personalityTestedAt: string | null;
  personalityStale: boolean;
  fullName: string | null;
  email: string | null;
}

function dateOnly(value: string | null | undefined): string | null {
  if (typeof value !== 'string' || value.length < 10) return null;
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null;
}

function strings(list: readonly unknown[] | null | undefined): string[] {
  return (list ?? []).filter((v): v is string => typeof v === 'string');
}

function badge(b: CandidateCard['testBadges'][number]): RecruiterTestBadge {
  // Placeringsregeln (placering.ts) gäller också här, även om kortet redan
  // byggts efter den: etiketten byggs om ur det som får visas.
  const percentile = synligPercentil(b.percentile);
  return {
    family: b.family,
    label: b.level ? badgeLabel(b.family, b.level, percentile) : FAMILY_LABELS[b.family],
    level: b.level,
    percentile,
    sampleSize: percentile === null ? null : b.sampleSize,
    testDate: dateOnly(b.testDate),
  };
}

/**
 * Träffkortet. Kortet bär aldrig fritext ur CV:t i något läge, så samma form
 * gäller före och efter ja.
 */
export function toRecruiterCard(
  card: CandidateCard & { matchReasons?: string[] },
  candidateId: string
): RecruiterCard {
  const out: RecruiterCard = {
    candidateId,
    role: card.role ?? null,
    skills: strings(card.skills),
    regions: strings(card.regions),
    availability: card.availability ?? null,
    workplace: strings(card.workplace),
    extent: strings(card.extent),
    driversLicense: Boolean(card.driversLicense),
    testBadges: (card.testBadges ?? []).map(badge),
    personalityStrengths: strings(card.personalityStrengths),
    visibility: card.visibility === 'open' ? 'open' : 'anonymous',
    yearsOfExperience: card.yearsOfExperience ?? null,
    latestRole: card.latestRole
      ? { title: card.latestRole.title, years: card.latestRole.years ?? null }
      : null,
    educationLevel: card.educationLevel ?? null,
    educationLevelBucket: card.educationLevelBucket ?? null,
    pitch: card.pitch ?? null,
    historyTitles: strings(card.historyTitles),
    workStyleArchetype: card.workStyleArchetype ?? null,
    cardWorkStyle: card.cardWorkStyle ?? null,
    activeSince: dateOnly(card.activeSince),
    contextTags: strings(card.contextTags),
  };
  if (card.matchReasons) out.matchReasons = strings(card.matchReasons);
  return out;
}

/** Detaljprofilen, formad efter rekryterarens åtkomst. */
export function toRecruiterDetail(
  detail: CandidateDetail,
  candidateId: string,
  access: RecruiterAccess
): RecruiterDetail {
  const open = access.contactUnlocked;

  const experience: RecruiterExperience[] = (detail.experience ?? []).map((e) =>
    open
      ? {
          position: e.position ?? null,
          company: e.company ?? null,
          period: e.period ?? null,
          description: e.description ?? null,
          descriptionHidden: false,
        }
      : {
          position: e.position ?? null,
          company: null,
          period: e.duration ?? null,
          description: null,
          descriptionHidden: Boolean(e.description),
        }
  );

  const education: RecruiterEducation[] = (detail.education ?? [])
    .map((e) =>
      open
        ? { school: e.school ?? null, degree: e.degree ?? null, year: e.year ?? null, schoolHidden: false }
        : { school: null, degree: e.degree ?? null, year: null, schoolHidden: Boolean(e.school) }
    )
    // Före ja är en rad utan inriktning bara ett lärosäte: den visas inte alls.
    .filter((e) => open || e.degree !== null);

  let workStyleReport = detail.workStyleReport ?? null;
  if (workStyleReport && !open) {
    workStyleReport = { ...workStyleReport, onboarding: null, interviewGuide: null };
  }

  return {
    ...toRecruiterCard(detail, candidateId),
    experience,
    education,
    testResults: (detail.testResults ?? []).map((r) => ({
      family: r.family,
      level: r.level,
      percentile: synligPercentil(r.percentile),
      sampleSize: synligPercentil(r.percentile) === null ? null : r.sampleSize,
      completedAt: dateOnly(r.completedAt),
      attempts: r.attempts,
    })),
    languages: strings(detail.languages),
    workStyle: detail.workStyle ?? null,
    interviewGuide: open ? strings(detail.interviewGuide) : [],
    workStyleReport,
    personalityTestedAt: dateOnly(detail.personalityTestedAt),
    personalityStale: Boolean(detail.personalityStale),
    fullName: open ? detail.fullName ?? null : null,
    email: access.emailUnlocked ? detail.email ?? null : null,
  };
}
