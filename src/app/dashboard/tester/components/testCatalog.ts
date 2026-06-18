import type { TestSlug } from '@/hooks/use-all-test-stats';
import type {
  TestCardVariant,
  TestCategoryLabel,
  TestLevelLabel,
} from './TestCard';

/**
 * Gemensam källa för testernas metadata. Används av både hubbens "Tester"-flik
 * (korten) och "Din utveckling"-fliken så titlar/frågeantal aldrig spretar.
 */

export type TestGroupKey = 'logik' | 'verbal' | 'numerisk' | 'personlighet';

export interface CognitiveTestDef {
  slug: TestSlug;
  variant: TestCardVariant;
  /** Sökvänlig titel (t.ex. "Logiktest"). */
  title: string;
  /** Metod/undertext (t.ex. "Mönsterigenkänning · matriser"). */
  method: string;
  categoryLabel: TestCategoryLabel;
  levelLabel: TestLevelLabel;
  /** Om true bakas nivån in i titeln och nivå-pillret döljs på kortet. */
  levelInTitle?: boolean;
  questionCount: number;
  timeLabel: string;
  isPremiumLocked: boolean;
}

export interface PersonalityTestDef {
  slug: 'personlighet-grund' | 'personlighet-avancerad';
  variant: 'personality-grund' | 'personality-avancerad';
  title: string;
  levelLabel: TestLevelLabel;
  questionCount: number;
  timeLabel: string;
  isPremiumLocked: boolean;
}

export interface TestGroup {
  key: TestGroupKey;
  /** Gruppens rubrik = den sökvänliga testtypen. */
  heading: string;
  /** Kort mening om vad testtypen mäter. */
  blurb: string;
  cognitive: CognitiveTestDef[];
  personality: PersonalityTestDef[];
}

export const LOGIK_TESTS: CognitiveTestDef[] = [
  {
    slug: 'matrislogik-grund',
    variant: 'matrix-grund',
    title: 'Logiktest Grund',
    method: 'Mönsterigenkänning · matriser',
    categoryLabel: 'Logik',
    levelLabel: 'Grund',
    levelInTitle: true,
    questionCount: 15,
    timeLabel: '20',
    isPremiumLocked: false,
  },
  {
    slug: 'matrislogik-avancerad',
    variant: 'matrix-avancerad',
    title: 'Logiktest Avancerad',
    method: 'Mönsterigenkänning · matriser',
    categoryLabel: 'Logik',
    levelLabel: 'Avancerad',
    levelInTitle: true,
    questionCount: 15,
    timeLabel: '25',
    isPremiumLocked: true,
  },
  {
    slug: 'matrislogik-expert',
    variant: 'matrix-expert',
    title: 'Logiktest Expert',
    method: 'Mönsterigenkänning · matriser',
    categoryLabel: 'Logik',
    levelLabel: 'Expert',
    levelInTitle: true,
    questionCount: 15,
    timeLabel: '30',
    isPremiumLocked: true,
  },
];

export const VERBAL_TESTS: CognitiveTestDef[] = [
  {
    slug: 'verbal-resonemang',
    variant: 'verbal-v1',
    title: 'Verbalt resonemang',
    method: 'Läsförståelse · slutledning',
    categoryLabel: 'Språk',
    levelLabel: 'Grund',
    questionCount: 48,
    timeLabel: '20',
    isPremiumLocked: false,
  },
  {
    slug: 'verbal-resonemang-v2',
    variant: 'verbal-v2',
    title: 'Verbalt resonemang',
    method: 'Läsförståelse · slutledning',
    categoryLabel: 'Språk',
    levelLabel: 'Avancerad',
    questionCount: 48,
    timeLabel: '25',
    isPremiumLocked: true,
  },
];

export const NUMERISK_TESTS: CognitiveTestDef[] = [
  {
    slug: 'numeriskt-test',
    variant: 'numerical-v1',
    title: 'Numeriskt test',
    method: 'Tabeller · diagram · andelar',
    categoryLabel: 'Siffror',
    levelLabel: 'Grund',
    questionCount: 24,
    timeLabel: '20',
    isPremiumLocked: false,
  },
  {
    slug: 'numeriskt-test-v2',
    variant: 'numerical-v2',
    title: 'Numeriskt test',
    method: 'Tabeller · diagram · andelar',
    categoryLabel: 'Siffror',
    levelLabel: 'Avancerad',
    questionCount: 24,
    timeLabel: '25',
    isPremiumLocked: true,
  },
];

export const PERSONALITY_TESTS: PersonalityTestDef[] = [
  {
    slug: 'personlighet-grund',
    variant: 'personality-grund',
    title: 'Personlighetstest',
    levelLabel: 'Grund',
    questionCount: 50,
    timeLabel: '10',
    isPremiumLocked: false,
  },
  {
    slug: 'personlighet-avancerad',
    variant: 'personality-avancerad',
    title: 'Personlighetstest',
    levelLabel: 'Avancerad',
    questionCount: 120,
    timeLabel: '25',
    isPremiumLocked: true,
  },
];

export const TEST_GROUPS: TestGroup[] = [
  {
    key: 'logik',
    heading: 'Logiktest',
    blurb: 'Hitta mönstret i matriser och figurserier. Det vanligaste momentet i begåvningstest.',
    cognitive: LOGIK_TESTS,
    personality: [],
  },
  {
    key: 'verbal',
    heading: 'Verbalt resonemang',
    blurb: 'Dra korrekta slutsatser ur texter. Mäter språklig analysförmåga.',
    cognitive: VERBAL_TESTS,
    personality: [],
  },
  {
    key: 'numerisk',
    heading: 'Numeriskt test',
    blurb: 'Tolka tabeller och diagram under tidspress. Mäter sifferförståelse.',
    cognitive: NUMERISK_TESTS,
    personality: [],
  },
  {
    key: 'personlighet',
    heading: 'Personlighetstest',
    blurb: 'Se vad dina svar säger rekryteraren, och lär känna dig själv bättre.',
    cognitive: [],
    personality: PERSONALITY_TESTS,
  },
];

/** Platt lista över alla kognitiva test (för utvecklingsvyn). */
export const ALL_COGNITIVE_TESTS: CognitiveTestDef[] = [
  ...LOGIK_TESTS,
  ...VERBAL_TESTS,
  ...NUMERISK_TESTS,
];
