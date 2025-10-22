// src/lib/learning/course-prioritization.ts
/**
 * Utility functions for intelligent course prioritization and learning strategy determination
 */

import { filterRelevantCourses } from './course-filtering';

export type LearningStrategy = 'career_change' | 'adaptation' | 'refinement';
export type LegacyLearningPath = 'quick' | 'balanced' | 'comprehensive';

export interface Course {
  type?: 'course' | 'certification' | 'degree' | 'self-study' | 'project';
  title: string;
  provider?: string;
  direct_url?: string;
  duration?: string;
  cost?: string;
  description?: string;
  skillsCovered?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  format?: string;
  efficiency?: number; // Number of skills this course covers
  start_date?: string;
  study_format?: string;
  relevance?: string;
  priority?: 'essential' | 'recommended' | 'optional';
  language?: 'sv' | 'en' | 'other';
}

export interface StrategyConfig {
  strategy: LearningStrategy;
  title: string;
  description: string;
  emoji: string;
  fullDescription: string;
  defaultHoursPerWeek: number;
  prioritization: 'long_education' | 'mixed' | 'short_courses';
}

/**
 * Parse cost from various formats to a numeric value
 * Handles: "Gratis", "0 kr", "1500 SEK", "$1500", "1 500 kr", etc.
 */
export function parseCost(costString?: string): number {
  if (!costString) return -1; // Unknown cost

  const lowerCost = costString.toLowerCase().trim();

  // Check for free indicators
  if (
    lowerCost === 'gratis' ||
    lowerCost === 'free' ||
    lowerCost === '0 kr' ||
    lowerCost === '0' ||
    lowerCost.includes('csn-berättigad') ||
    lowerCost.includes('ingen kostnad')
  ) {
    return 0;
  }

  // Extract numeric value, removing spaces and common currency symbols
  const numericMatch = costString.match(/\d+[\s]?\d*/g);
  if (numericMatch) {
    const value = parseInt(numericMatch[0].replace(/\s/g, ''));
    return isNaN(value) ? -1 : value;
  }

  return -1; // Could not parse
}

/**
 * Parse duration to hours for comparison
 * Handles: "4 veckor", "3 månader", "1 år", "40 timmar", etc.
 */
export function parseDurationToHours(durationString?: string): number {
  if (!durationString) return 0;

  const lower = durationString.toLowerCase();
  const numMatch = durationString.match(/\d+/);
  if (!numMatch) return 0;

  const num = parseInt(numMatch[0]);

  if (lower.includes('timm')) return num;
  if (lower.includes('dag')) return num * 8;
  if (lower.includes('veck')) return num * 40;
  if (lower.includes('månad') || lower.includes('month')) return num * 160;
  if (lower.includes('år') || lower.includes('year')) return num * 1600;
  if (lower.includes('termin') || lower.includes('semester')) return num * 800;

  return num; // Assume hours if no unit
}

/**
 * Identify if a course is from a subsidized/free provider
 */
export function isFreeOrSubsidized(course: Course): boolean {
  const cost = parseCost(course.cost);
  if (cost === 0) return true;

  const provider = course.provider?.toLowerCase() || '';
  const title = course.title.toLowerCase();

  // Check for known free/subsidized providers
  const freeProviders = [
    'komvux',
    'folkhögskola',
    'högskola',
    'universitet',
    'university',
    'csn',
    'arbetsförmedlingen',
    'yh',
    'yrkeshögskola'
  ];

  return freeProviders.some(p => provider.includes(p) || title.includes(p));
}

/**
 * Determine learning strategy based on match score
 */
export function determineStrategy(matchScore: number): LearningStrategy {
  if (matchScore < 40) return 'career_change';
  if (matchScore < 70) return 'adaptation';
  return 'refinement';
}

/**
 * Get strategy configuration including copy for UI
 */
export function getStrategyConfig(strategy: LearningStrategy): StrategyConfig {
  const configs: Record<LearningStrategy, StrategyConfig> = {
    career_change: {
      strategy: 'career_change',
      title: 'Strukturerad utvecklingsplan',
      emoji: '📚',
      description: 'Omfattande utbildning för karriärbyte',
      fullDescription: `Baserat på din nuvarande kompetens och målrollen ser vi att en mer omfattande utbildningssatsning ger bäst resultat. Vi har därför prioriterat längre utbildningar från högskolor och komvux som ger dig en solid grund.\n\nDessa utbildningar är ofta CSN-berättigade och kostnadsfria.`,
      defaultHoursPerWeek: 15,
      prioritization: 'long_education'
    },
    adaptation: {
      strategy: 'adaptation',
      title: 'Skräddarsydd utvecklingsplan',
      emoji: '✨',
      description: 'Mix av gratis och betalda kurser',
      fullDescription: `Du har redan en god grund att stå på. Vi har identifierat specifika kompetensområden där fördjupning gör skillnad. Planen innehåller både kostnadsfria utbildningar och kompletterande kurser för att accelerera din utveckling.`,
      defaultHoursPerWeek: 10,
      prioritization: 'mixed'
    },
    refinement: {
      strategy: 'refinement',
      title: 'Förfina din expertis',
      emoji: '🎖️',
      description: 'Riktade kurser och certifieringar',
      fullDescription: `Du matchar redan väl mot rollen. Våra rekommendationer fokuserar på specialisering och certifieringar som stärker din profil ytterligare. Vi har valt kurser som ger snabb kompetenslyft inom strategiska områden.`,
      defaultHoursPerWeek: 5,
      prioritization: 'short_courses'
    }
  };

  return configs[strategy];
}

/**
 * Map legacy learning path values to new strategy
 */
export function mapLegacyPath(legacyPath: LegacyLearningPath): LearningStrategy {
  const mapping: Record<LegacyLearningPath, LearningStrategy> = {
    quick: 'refinement',
    balanced: 'adaptation',
    comprehensive: 'career_change'
  };

  return mapping[legacyPath];
}

/**
 * Sort courses based on strategy and cost
 * IMPORTANT: Filters out gymnasium courses first - users have already completed gymnasium
 */
export function prioritizeCourses(
  courses: Course[],
  matchScore: number
): Course[] {
  // Step 1: Filter out gymnasium courses - keep only adult education
  const relevantCourses = filterRelevantCourses(courses);

  const strategy = determineStrategy(matchScore);
  const config = getStrategyConfig(strategy);

  return [...relevantCourses].sort((a, b) => {
    // Priority 1: Free courses first
    const aCost = parseCost(a.cost);
    const bCost = parseCost(b.cost);
    const aIsFree = aCost === 0 || isFreeOrSubsidized(a);
    const bIsFree = bCost === 0 || isFreeOrSubsidized(b);

    if (aIsFree && !bIsFree) return -1;
    if (!aIsFree && bIsFree) return 1;

    // Priority 2: Within same cost category, sort by duration based on strategy
    const aDuration = parseDurationToHours(a.duration);
    const bDuration = parseDurationToHours(b.duration);

    if (config.prioritization === 'long_education') {
      // Prefer longer courses (career change)
      return bDuration - aDuration;
    } else if (config.prioritization === 'short_courses') {
      // Prefer shorter courses (refinement)
      return aDuration - bDuration;
    }

    // For 'mixed', keep original order within cost category
    return 0;
  });
}

/**
 * Group courses by cost type for UI display
 */
export function groupCoursesByCost(courses: Course[]): {
  free: Course[];
  paid: Course[];
} {
  const free: Course[] = [];
  const paid: Course[] = [];

  courses.forEach(course => {
    const cost = parseCost(course.cost);
    if (cost === 0 || isFreeOrSubsidized(course)) {
      free.push(course);
    } else {
      paid.push(course);
    }
  });

  return { free, paid };
}

/**
 * Add badge information to courses for UI display
 */
export function getCourseBadges(course: Course): string[] {
  const badges: string[] = [];

  const cost = parseCost(course.cost);
  if (cost === 0) {
    badges.push('Gratis');
  }

  if (isFreeOrSubsidized(course)) {
    const provider = course.provider?.toLowerCase() || '';
    const title = course.title.toLowerCase();

    if (provider.includes('komvux') || title.includes('komvux')) {
      badges.push('Komvux');
    }
    if (provider.includes('högskola') || provider.includes('universitet')) {
      badges.push('Högskola');
    }
    if (course.cost?.toLowerCase().includes('csn')) {
      badges.push('CSN-berättigad');
    }
    if (provider.includes('yh') || provider.includes('yrkeshögskola')) {
      badges.push('YH');
    }
  }

  return badges;
}
