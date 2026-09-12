import type { TestSlug } from '@/hooks/use-all-test-stats';
import { getTestConfig } from '../testConfig';
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

/**
 * Frågeantal och tid kommer ur testConfig, som är enda sanningen. Katalogen
 * hade egna siffror (60 för verbalen, 32 för numeriskt grund) som inte
 * stämde med testsidorna, så hubbens kort visade "29 av 60" bredvid en
 * procent räknad på 48.
 */
/** Provets frågeantal och tid, också ur testConfig. */
function provCounts(slug: string): { totalQuestions: number; minutes: number } {
  const c = getTestConfig(slug);
  return { totalQuestions: c?.totalQuestions ?? 0, minutes: c?.minutes ?? 0 };
}

function counts(slug: string): { questionCount: number; timeLabel: string } {
  const c = getTestConfig(slug);
  return {
    questionCount: c?.totalQuestions ?? 0,
    timeLabel: String(c?.minutes ?? 0),
  };
}

export interface CognitiveTestDef {
  slug: TestSlug;
  variant: TestCardVariant;
  /** Sökvänlig titel (t.ex. "Logiktest"). */
  title: string;
  /** Metod/undertext (t.ex. "Mönsterigenkänning · matriser"). */
  method: string;
  categoryLabel: TestCategoryLabel;
  levelLabel: TestLevelLabel;
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

export interface ProvDef {
  /** Startsidan för provet. */
  href: string;
  /** Session-API för senaste prov-resultat. */
  sessionEndpoint: string;
  totalQuestions: number;
  minutes: number;
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
  /** Prov-kort (4:e kortet) för kognitiva testtyper. Saknas för personlighet. */
  prov?: ProvDef;
}

export const LOGIK_TESTS: CognitiveTestDef[] = [
  {
    slug: 'matrislogik-grund',
    variant: 'matrix-grund',
    title: 'Logiktest',
    method: 'Mönsterigenkänning · matriser',
    categoryLabel: 'Logik',
    levelLabel: 'Grund',
    ...counts('matrislogik-grund'),
    isPremiumLocked: false,
  },
  {
    slug: 'matrislogik-avancerad',
    variant: 'matrix-avancerad',
    title: 'Logiktest',
    method: 'Mönsterigenkänning · matriser',
    categoryLabel: 'Logik',
    levelLabel: 'Avancerad',
    ...counts('matrislogik-avancerad'),
    isPremiumLocked: false,
  },
  {
    slug: 'matrislogik-expert',
    variant: 'matrix-expert',
    title: 'Logiktest',
    method: 'Mönsterigenkänning · matriser',
    categoryLabel: 'Logik',
    levelLabel: 'Expert',
    ...counts('matrislogik-expert'),
    isPremiumLocked: false,
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
    ...counts('verbal-resonemang'),
    isPremiumLocked: false,
  },
  {
    slug: 'verbal-resonemang-v2',
    variant: 'verbal-v2',
    title: 'Verbalt resonemang',
    method: 'Läsförståelse · slutledning',
    categoryLabel: 'Språk',
    levelLabel: 'Avancerad',
    ...counts('verbal-resonemang-v2'),
    isPremiumLocked: false,
  },
  {
    slug: 'verbal-resonemang-expert',
    variant: 'verbal-v2',
    title: 'Verbalt resonemang',
    method: 'Argumentationsanalys · felslut',
    categoryLabel: 'Språk',
    levelLabel: 'Expert',
    ...counts('verbal-resonemang-expert'),
    isPremiumLocked: false,
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
    ...counts('numeriskt-test'),
    isPremiumLocked: false,
  },
  {
    slug: 'numeriskt-test-v2',
    variant: 'numerical-v2',
    title: 'Numeriskt test',
    method: 'Tabeller · diagram · andelar',
    categoryLabel: 'Siffror',
    levelLabel: 'Avancerad',
    ...counts('numeriskt-test-v2'),
    isPremiumLocked: false,
  },
  {
    slug: 'numeriskt-test-expert',
    variant: 'numerical-v2',
    title: 'Numeriskt test',
    method: 'Investeringskalkyl · optimering',
    categoryLabel: 'Siffror',
    levelLabel: 'Expert',
    ...counts('numeriskt-test-expert'),
    isPremiumLocked: false,
  },
];

export const PERSONALITY_TESTS: PersonalityTestDef[] = [
  {
    slug: 'personlighet-grund',
    variant: 'personality-grund',
    title: 'Personlighetstest',
    levelLabel: 'Grund',
    ...counts('personlighet-grund'),
    isPremiumLocked: false,
  },
  {
    slug: 'personlighet-avancerad',
    variant: 'personality-avancerad',
    title: 'Personlighetstest',
    levelLabel: 'Avancerad',
    ...counts('personlighet-avancerad'),
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
    prov: {
      href: '/dashboard/tester/matrislogik-prov',
      sessionEndpoint: '/api/logicTestProv/session',
      ...provCounts('matrislogik-prov'),
    },
  },
  {
    key: 'verbal',
    heading: 'Verbalt test',
    blurb:
      'Läs en kort text och avgör om olika påståenden stämmer. Mäter hur du tolkar och drar slutsatser ur skriven information, något nästan alla jobb kräver.',
    searchHint: 'Kallas även verbalt resonemang eller läsförståelsetest',
    cognitive: VERBAL_TESTS,
    personality: [],
    prov: {
      href: '/dashboard/tester/verbal-resonemang-prov',
      sessionEndpoint: '/api/verbalTestProv/session',
      ...provCounts('verbal-resonemang-prov'),
    },
  },
  {
    key: 'numerisk',
    heading: 'Numeriskt test',
    blurb:
      'Tolka tabeller och diagram och räkna ut svaret under tidspress. Mäter sifferförståelse, vanligt för tjänster med budget, analys eller försäljning.',
    searchHint: 'Kallas även numeriskt resonemang eller mattetest',
    cognitive: NUMERISK_TESTS,
    personality: [],
    prov: {
      href: '/dashboard/tester/numeriskt-test-prov',
      sessionEndpoint: '/api/numericalTestProv/session',
      ...provCounts('numeriskt-test-prov'),
    },
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
