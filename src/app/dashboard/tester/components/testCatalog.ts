import type { TestSlug } from '@/hooks/use-all-test-stats';
import { getTestConfig } from '../testConfig';
import { ovningsprovHref } from '@/lib/traning/rutter';
import type { Provtyp } from '@/lib/ovningsprov/format';
import { figurserierSynliga } from '@/lib/figurserierV1/status';
import { deduktivSynlig } from '@/lib/deduktivV1/status';
import type {
  TestCardVariant,
  TestCategoryLabel,
  TestLevelLabel,
} from './TestCard';

/**
 * Gemensam källa för testernas metadata. Används av både hubbens "Tester"-flik
 * (korten) och "Din utveckling"-fliken så titlar/frågeantal aldrig spretar.
 */

export type TestGroupKey = 'logik' | 'figurer' | 'deduktiv' | 'verbal' | 'numerisk' | 'personlighet';

/**
 * Frågeantal och tid kommer ur testConfig, som är enda sanningen. Katalogen
 * hade egna siffror (60 för verbalen, 32 för numeriskt grund) som inte
 * stämde med testsidorna, så hubbens kort visade "29 av 60" bredvid en
 * procent räknad på 48.
 */
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

/**
 * Provraden under nivåerna: övningsprovet mot klockan i planens format
 * (riktlinjer-tester-v2 1.5). Samma rad på logik, verbalt och numeriskt;
 * texten byggs av provradTexter(ovningsformat(typ, leverantör, variant)) och
 * raden visar inget tal. Startarket ligger på ovningsprovHref(typ).
 */
export interface ProvDef {
  typ: Provtyp;
  /** Startarket för övningsprovet. */
  href: string;
}

/** Övningsprovet kräver test_exam_mode på alla tre testtyper (riktlinjerna 1.7). */
export const PROV_FEATURE = 'test_exam_mode' as const;

/** Vad varje nivå gör, i stället för rang (riktlinjerna 2.3, granskningen 6.1). Aldrig "lätt". */
export const NIVA_GOR: Record<Exclude<TestGroupKey, 'personlighet'>, Record<TestLevelLabel, string>> = {
  logik: { Grund: 'en regel', Avancerad: 'två regler', Expert: 'tre regler' },
  figurer: { Grund: 'en regel', Avancerad: 'två regler', Expert: 'tre regler' },
  deduktiv: { Grund: 'tre villkor', Avancerad: 'fem villkor', Expert: 'villkor i rörelse' },
  verbal: { Grund: 'svaret står i texten', Avancerad: 'två ståndpunkter', Expert: 'argument' },
  numerisk: { Grund: 'läs av och räkna', Avancerad: 'flera räknesteg', Expert: 'prognos, marginal' },
};

/** Faktaradens enhet per testtyp. */
export const ENHET: Record<Exclude<TestGroupKey, 'personlighet'>, string> = {
  logik: 'uppgifter',
  figurer: 'uppgifter',
  deduktiv: 'uppgifter',
  verbal: 'påståenden',
  numerisk: 'frågor',
};

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
  /** Provraden för kognitiva testtyper. Saknas för personlighet. */
  prov?: ProvDef;
  /**
   * Provraden när övningsprovet inte finns för testtypen än: dämpad, utan
   * lås och pil (figurserier i omgång 2, beställningen A6 punkt 6).
   */
  provTyst?: { rad1: string; rad2: string };
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

/** Figurserier (beställningen omgång 2, A6 punkt 6). Samma kort som logiken. */
export const FIGURSERIE_TESTS: CognitiveTestDef[] = [
  {
    slug: 'figurserier-grund',
    variant: 'matrix-grund',
    title: 'Figurserier',
    method: 'Mönsterigenkänning · figurserier',
    categoryLabel: 'Logik',
    levelLabel: 'Grund',
    ...counts('figurserier-grund'),
    isPremiumLocked: false,
  },
  {
    slug: 'figurserier-avancerad',
    variant: 'matrix-avancerad',
    title: 'Figurserier',
    method: 'Mönsterigenkänning · figurserier',
    categoryLabel: 'Logik',
    levelLabel: 'Avancerad',
    ...counts('figurserier-avancerad'),
    isPremiumLocked: false,
  },
  {
    slug: 'figurserier-expert',
    variant: 'matrix-expert',
    title: 'Figurserier',
    method: 'Mönsterigenkänning · figurserier',
    categoryLabel: 'Logik',
    levelLabel: 'Expert',
    ...counts('figurserier-expert'),
    isPremiumLocked: false,
  },
];

/** Deduktiv slutledning (beställningen omgång 3, B1; copy-omgang3.md 4.1). */
export const DEDUKTIV_TESTS: CognitiveTestDef[] = (['grund', 'avancerad', 'expert'] as const).map((niva) => ({
  slug: `deduktiv-${niva}` as TestSlug,
  variant: niva === 'grund' ? 'matrix-grund' : niva === 'avancerad' ? 'matrix-avancerad' : 'matrix-expert',
  title: 'Deduktiv slutledning',
  method: 'Slutledning · villkor i text',
  categoryLabel: 'Logik',
  levelLabel: niva === 'grund' ? 'Grund' : niva === 'avancerad' ? 'Avancerad' : 'Expert',
  ...counts(`deduktiv-${niva}`),
  isPremiumLocked: false,
}));

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

/**
 * Figurseriernas grupp. Står mellan logik och verbalt när testet syns
 * (figurserierSynliga: banken befordrad, eller QA-flaggan lokalt).
 */
const FIGURER_GROUP: TestGroup = {
  key: 'figurer',
  heading: 'Figurserier',
  blurb:
    'Fem figurer i rad och en lucka sist. Du väljer figuren som fortsätter serien. Formatet finns i SHL Verify och Aon scales ix.',
  searchHint: 'Kallas även induktivt test eller figurserie',
  cognitive: FIGURSERIE_TESTS,
  personality: [],
  provTyst: { rad1: 'Övningsprov mot klockan', rad2: 'Inte än för figurserier. Logikens övningsprov övar tempot.' },
};

/**
 * Deduktiv slutledning. Står efter figurserierna när banken är befordrad
 * (deduktivSynlig). Inget övningsprov än: provraden är dämpad.
 */
const DEDUKTIV_GROUP: TestGroup = {
  key: 'deduktiv',
  heading: 'Deduktiv slutledning',
  blurb:
    'Några personer, några villkor och en fråga: vem står var, och vad måste då gälla? Du räknar inte och ritar inget, du håller reda på villkoren. Formatet finns i SHL Verify G+ och i Aons deduktiva test.',
  searchHint: 'Kallas även deduktivt test, logiskt resonemang eller schemapussel',
  cognitive: DEDUKTIV_TESTS,
  personality: [],
  provTyst: { rad1: 'Övningsprov mot klockan', rad2: 'Inte än för deduktiv slutledning. Logikens övningsprov övar tempot.' },
};

export const TEST_GROUPS: TestGroup[] = [
  {
    key: 'logik',
    heading: 'Logiktest',
    blurb:
      'Du ser en serie figurer och ska lista ut vilken som kommer härnäst. Det vanligaste momentet i ett rekryteringstest, och det som mäter problemlösning.',
    searchHint: 'Kallas även IQ-test, begåvningstest eller matrigma',
    cognitive: LOGIK_TESTS,
    personality: [],
    prov: { typ: 'logik', href: ovningsprovHref('logik') },
  },
  ...(figurserierSynliga() ? [FIGURER_GROUP] : []),
  ...(deduktivSynlig() ? [DEDUKTIV_GROUP] : []),
  {
    key: 'verbal',
    heading: 'Verbalt test',
    blurb:
      'Läs en kort text och avgör om olika påståenden stämmer. Mäter hur du tolkar och drar slutsatser ur skriven information, något nästan alla jobb kräver.',
    searchHint: 'Kallas även verbalt resonemang eller läsförståelsetest',
    cognitive: VERBAL_TESTS,
    personality: [],
    // De gamla provsidorna står kvar för gamla resultat, men ingen rad pekar
    // dit (riktlinjerna 1.5, samma lösning som matrislogik-prov i spec 19.6).
    prov: { typ: 'verbal', href: ovningsprovHref('verbal') },
  },
  {
    key: 'numerisk',
    heading: 'Numeriskt test',
    blurb:
      'Tolka tabeller och diagram och räkna ut svaret under tidspress. Mäter sifferförståelse, vanligt för tjänster med budget, analys eller försäljning.',
    searchHint: 'Kallas även numeriskt resonemang eller mattetest',
    cognitive: NUMERISK_TESTS,
    personality: [],
    prov: { typ: 'numerisk', href: ovningsprovHref('numerisk') },
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
