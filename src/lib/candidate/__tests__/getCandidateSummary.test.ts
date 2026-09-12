import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseMock, type ChainCall, type TableResponse } from './supabaseMock';

// Admin-klienten används bara för percentilräkningen. Här härmar vi bara
// count-svaren, så testet kör utan env-variabler och utan nätverk.
let adminCounts: (chain: ChainCall[]) => TableResponse;

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () =>
    createSupabaseMock({
      logic_test_v4_sessions: (chain) => adminCounts(chain),
    }).client,
}));

import {
  getCandidateSummary,
  deriveStrengthLabels,
  pickBestSession,
  percentileFrom,
  MIN_PERCENTILE_SAMPLE,
  FAMILIES,
  STRENGTH_MAP,
} from '../getCandidateSummary';

/** En kedja med .lt() är "antal under användarens score", annars totalen. */
function counts(total: number, below: number) {
  return (chain: ChainCall[]): TableResponse =>
    chain.some((c) => c.method === 'lt') ? { count: below } : { count: total };
}

const session = (test_type: string, score: number, completed_at: string) => ({
  test_type,
  score,
  completed_at,
});

function run(
  sessions: Array<{ test_type: string; score: number; completed_at: string }>,
  extra: Record<string, TableResponse> = {}
) {
  const { client } = createSupabaseMock({
    logic_test_v4_sessions: { data: sessions },
    user_personality_profile: { data: null },
    active_cv_for_matching: { data: null },
    cv_texts: { data: null },
    ...extra,
  });
  return getCandidateSummary(client, 'user-1', null);
}

beforeEach(() => {
  // Standard: gott om underlag, så percentilen får visas.
  adminCounts = counts(100, 60);
});

describe('getCandidateSummary: familjeresultat', () => {
  it('ger tomt resultat för familjer utan sessioner', async () => {
    const summary = await run([]);

    for (const key of Object.keys(FAMILIES) as Array<keyof typeof FAMILIES>) {
      expect(summary.results[key]).toEqual({
        done: false,
        bestScore: null,
        level: null,
        percentile: null,
        completedAt: null,
      });
    }
  });

  it('väljer högsta score och mappar test_type till rätt nivå', async () => {
    const summary = await run([
      session('matrislogik', 55, '2026-01-01T10:00:00Z'),
      session('matrislogik-expert', 88, '2026-02-01T10:00:00Z'),
      session('matrislogik-avancerad', 70, '2026-03-01T10:00:00Z'),
    ]);

    expect(summary.results.matrislogik).toMatchObject({
      done: true,
      bestScore: 88,
      level: 'expert',
      completedAt: '2026-02-01T10:00:00Z',
    });
    // Familjer utan sessioner påverkas inte.
    expect(summary.results.verbal.done).toBe(false);
    expect(summary.results.numerisk.done).toBe(false);
  });

  it('föredrar högre nivå vid lika score, därefter senast slutförd', async () => {
    const summary = await run([
      session('verbal-resonemang', 80, '2026-05-01T10:00:00Z'),
      session('verbal-resonemang-avancerad-finns-ej', 80, '2026-06-01T10:00:00Z'),
      session('verbal-resonemang-v2', 80, '2026-01-01T10:00:00Z'),
    ]);

    // Okända test_type ingår inte i familjen alls.
    expect(summary.results.verbal.level).toBe('avancerad');
    expect(summary.results.verbal.completedAt).toBe('2026-01-01T10:00:00Z');
  });

  it('håller familjerna isär', async () => {
    const summary = await run([
      session('matrislogik', 40, '2026-01-01T10:00:00Z'),
      session('numerical-reasoning-expert', 95, '2026-01-02T10:00:00Z'),
    ]);

    expect(summary.results.matrislogik).toMatchObject({ bestScore: 40, level: 'grund' });
    expect(summary.results.numerisk).toMatchObject({ bestScore: 95, level: 'expert' });
    expect(summary.results.verbal.done).toBe(false);
  });
});

describe('getCandidateSummary: percentilgränsen', () => {
  it('visar ingen percentil under MIN_PERCENTILE_SAMPLE', async () => {
    adminCounts = counts(MIN_PERCENTILE_SAMPLE - 1, 20);

    const summary = await run([session('matrislogik', 90, '2026-01-01T10:00:00Z')]);

    expect(summary.results.matrislogik.done).toBe(true);
    expect(summary.results.matrislogik.bestScore).toBe(90);
    expect(summary.results.matrislogik.percentile).toBeNull();
  });

  it('visar percentil exakt på gränsen', async () => {
    adminCounts = counts(MIN_PERCENTILE_SAMPLE, 5);

    const summary = await run([session('matrislogik', 90, '2026-01-01T10:00:00Z')]);

    expect(summary.results.matrislogik.percentile).toBe(20);
  });

  it('räknar percentilen som andel under användarens score', async () => {
    adminCounts = counts(200, 150);

    const summary = await run([session('matrislogik', 90, '2026-01-01T10:00:00Z')]);

    expect(summary.results.matrislogik.percentile).toBe(75);
  });

  it('percentileFrom: null-underlag ger null, aldrig division med noll', () => {
    expect(percentileFrom(null, null)).toBeNull();
    expect(percentileFrom(0, 0)).toBeNull();
    expect(percentileFrom(MIN_PERCENTILE_SAMPLE - 1, 10)).toBeNull();
    expect(percentileFrom(50, null)).toBe(0);
  });
});

describe('getCandidateSummary: styrkor lämnar servern som etiketter', () => {
  const PROFILE = {
    openness: 20,
    conscientiousness: 95,
    extraversion: 30,
    agreeableness: 88,
    neuroticism: 10,
    facet_scores: null,
  };

  it('returnerar de två främsta som etiketter, inte som poäng', async () => {
    const summary = await run([], {
      user_personality_profile: { data: PROFILE },
    });

    expect(summary.personality.done).toBe(true);
    expect(summary.personality.strengths).toHaveLength(2);

    const labels = STRENGTH_MAP.map((s) => s.label);
    for (const strength of summary.personality.strengths) {
      expect(typeof strength).toBe('string');
      expect(labels).toContain(strength);
    }

    // Ingen råpoäng får finnas i svaret, varken som tal eller i strängform.
    const serialized = JSON.stringify(summary.personality.strengths);
    for (const value of [20, 95, 30, 88, 10]) {
      expect(serialized).not.toContain(String(value));
    }
  });

  it('inverterar neuroticism: låg neuroticism blir Stresstålig', async () => {
    const summary = await run([], {
      user_personality_profile: {
        data: {
          openness: 50,
          conscientiousness: 50,
          extraversion: 50,
          agreeableness: 50,
          neuroticism: 2,
          facet_scores: null,
        },
      },
    });

    expect(summary.personality.strengths[0]).toBe('Stresstålig');
  });

  it('hög neuroticism ger inte Stresstålig', () => {
    const strengths = deriveStrengthLabels({
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 99,
    });

    expect(strengths).not.toContain('Stresstålig');
  });

  it('saknad personlighetsprofil ger tom, låst personality', async () => {
    const summary = await run([]);

    expect(summary.personality).toMatchObject({
      done: false,
      strengths: [],
      workStyle: null,
      cardWorkStyle: null,
      workStyleReport: null,
      ownReport: null,
      contextTagOptions: [],
      hasAdvancedTest: false,
    });
  });

  it('grundtestare utan facet_scores får hasAdvancedTest false', async () => {
    const summary = await run([], {
      user_personality_profile: { data: { ...PROFILE, facet_scores: {} } },
    });

    expect(summary.personality.hasAdvancedTest).toBe(false);
  });

  it('saknade Big Five-värden behandlas som 50', () => {
    // Alla lika: ordningen faller tillbaka på STRENGTH_MAP:s ordning.
    expect(deriveStrengthLabels({})).toEqual(['Strukturerad', 'Samarbetsvillig']);
  });
});

describe('getCandidateSummary: kompetenser och fallback', () => {
  it('använder extraktionen när den finns och kapar till åtta', async () => {
    const summary = await run([], {
      active_cv_for_matching: {
        data: {
          extracted_skills: Array.from({ length: 12 }, (_, i) => `skill-${i}`),
          extracted_occupations: [{ original: 'Utvecklare', normalized: 'Systemutvecklare' }],
          extracted_location: 'Göteborg',
        },
      },
    });

    expect(summary.skills.skills).toHaveLength(8);
    expect(summary.skills.occupation).toBe('Systemutvecklare');
    expect(summary.skills.location).toBe('Göteborg');
  });

  it('faller tillbaka på structured_data när extraktionen saknas', async () => {
    const summary = await run([], {
      cv_texts: {
        data: {
          structured_data: {
            experience: [{ position: 'Projektledare' }],
            skills: ['Excel', 'Ledarskap'],
            personalInfo: { city: 'Malmö' },
          },
        },
      },
    });

    expect(summary.skills).toEqual({
      skills: ['Excel', 'Ledarskap'],
      occupation: 'Projektledare',
      location: 'Malmö',
    });
  });

  it('läser kompetenser ur kategorigrupper i structured_data', async () => {
    const summary = await run([], {
      cv_texts: {
        data: {
          structured_data: {
            roles: [{ title: 'Ekonom' }],
            skills: [
              { category: 'System', skills: ['SAP', 'Fortnox'] },
              { category: 'Språk', skills: ['Engelska'] },
            ],
            personalInfo: { location: 'Uppsala' },
          },
        },
      },
    });

    expect(summary.skills.skills).toEqual(['SAP', 'Fortnox', 'Engelska']);
    expect(summary.skills.occupation).toBe('Ekonom');
    expect(summary.skills.location).toBe('Uppsala');
  });

  it('läcker aldrig filnamnet ur cv_texts', async () => {
    const summary = await run([], {
      cv_texts: {
        data: {
          file_name: 'Anna Andersson CV.pdf',
          structured_data: { skills: ['Excel'] },
        },
      },
    });

    expect(JSON.stringify(summary)).not.toContain('Anna Andersson');
  });

  it('fel vid CV-läsningen ger tomt underlag, inte ett kastat fel', async () => {
    const summary = await run([], {
      active_cv_for_matching: { data: null, error: { message: 'boom' } },
      cv_texts: { data: null, error: { message: 'boom' } },
    });

    expect(summary.skills).toEqual({ skills: [], occupation: null, location: null });
  });
});

describe('pickBestSession', () => {
  const types = FAMILIES.matrislogik.types;

  it('returnerar null när ingen session matchar familjen', () => {
    expect(pickBestSession([], types)).toBeNull();
    expect(
      pickBestSession([session('verbal-resonemang', 90, '2026-01-01T00:00:00Z')], types)
    ).toBeNull();
  });

  it('muterar inte inskickad lista', () => {
    const rows = [
      session('matrislogik', 10, '2026-01-01T00:00:00Z'),
      session('matrislogik-expert', 90, '2026-01-02T00:00:00Z'),
    ];
    const before = [...rows];
    pickBestSession(rows, types);
    expect(rows).toEqual(before);
  });
});
