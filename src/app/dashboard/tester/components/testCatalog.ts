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
  /** Kort, pedagogisk mening om vad testtypen är (för en oinsatt användare). */
  blurb: string;
  /** Vad det också kallas / vad man söker efter. Visas som liten hjälptext. */
  searchHint: string;
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
    blurb:
      'Du ser en serie figurer och ska lista ut vilken som kommer härnäst. Det vanligaste momentet i ett rekryteringstest, och det som mäter problemlösning.',
    searchHint: 'Kallas även IQ-test, begåvningstest eller matrigma',
    cognitive: LOGIK_TESTS,
    personality: [],
  },
  {
    key: 'verbal',
    heading: 'Verbalt test',
    blurb:
      'Läs en kort text och avgör om olika påståenden stämmer. Mäter hur du tolkar och drar slutsatser ur skriven information, något nästan alla jobb kräver.',
    searchHint: 'Kallas även verbalt resonemang eller läsförståelsetest',
    cognitive: VERBAL_TESTS,
    personality: [],
  },
  {
    key: 'numerisk',
    heading: 'Numeriskt test',
    blurb:
      'Tolka tabeller och diagram och räkna ut svaret under tidspress. Mäter sifferförståelse, vanligt för tjänster med budget, analys eller försäljning.',
    searchHint: 'Kallas även numeriskt resonemang eller mattetest',
    cognitive: NUMERISK_TESTS,
    personality: [],
  },
  {
    key: 'personlighet',
    heading: 'Personlighetstest',
    blurb:
      'Svara ärligt på påståenden om hur du är. Du tävlar inte mot någon, utan får en profil som visar dina styrkor och hur en rekryterare läser dig.',
    searchHint: 'Kallas även Big Five, personlighetsprofil eller självskattning',
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
