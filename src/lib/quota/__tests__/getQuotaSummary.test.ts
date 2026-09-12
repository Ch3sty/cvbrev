import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseMock, type TableResponse } from '@/lib/candidate/__tests__/supabaseMock';

// Premiumkontrollen har egna regler (admin, premium_until, subscription_tier)
// och testas där. Här styr vi den bara, för att låsa vad limit blir.
let isPremium = false;
vi.mock('@/lib/supabase/premiumAccess', () => ({
  userHasPremiumAccess: () => Promise.resolve(isPremium),
}));

import { getQuotaSummary } from '../getQuotaSummary';
import {
  DAILY_LIMIT_LETTERS,
  DAILY_LIMIT_CHAT_MESSAGES,
  DAILY_LIMIT_TEST_SESSIONS,
  CV_ANALYSIS_LIMIT,
  startOfTodayStockholm,
} from '../quotaService';

interface Counts {
  chat?: number;
  analysis?: number;
  tests?: number;
}

function run(
  profile: Record<string, unknown> | null,
  counts: Counts = {},
  overrides: Record<string, TableResponse> = {}
) {
  const { client } = createSupabaseMock({
    profiles: { data: profile },
    ai_messages: { count: counts.chat ?? 0 },
    cv_analysis_jobs: { count: counts.analysis ?? 0 },
    logic_test_v4_sessions: { count: counts.tests ?? 0 },
    ...overrides,
  });
  return getQuotaSummary(client, 'user-1');
}

const byKey = (summary: Awaited<ReturnType<typeof getQuotaSummary>>) =>
  Object.fromEntries(summary.items.map((i) => [i.key, i]));

/** En tidpunkt som ligger inom dagens fönster i svensk tid. */
const todayStamp = () =>
  new Date(startOfTodayStockholm().getTime() + 60_000).toISOString();

beforeEach(() => {
  isPremium = false;
});

describe('getQuotaSummary: premium', () => {
  it('ger limit null på alla fyra poster', async () => {
    isPremium = true;

    const summary = await run({
      weekly_letter_count: 3,
      weekly_letter_first_used_at: todayStamp(),
    });

    expect(summary.isPremium).toBe(true);
    expect(summary.items).toHaveLength(4);
    expect(summary.items.map((i) => i.key)).toEqual([
      'letters',
      'analysis',
      'chat',
      'tests',
    ]);
    for (const item of summary.items) {
      expect(item.limit).toBeNull();
    }
  });

  it('visar ändå faktisk förbrukning för premium', async () => {
    isPremium = true;

    const summary = await run(
      { weekly_letter_count: 3, weekly_letter_first_used_at: todayStamp() },
      { chat: 42, analysis: 2, tests: 5 }
    );

    const items = byKey(summary);
    expect(items.letters.used).toBe(3);
    expect(items.analysis.used).toBe(2);
    expect(items.chat.used).toBe(42);
    expect(items.tests.used).toBe(5);
  });
});

describe('getQuotaSummary: gratis', () => {
  it('ger de faktiska taken ur quotaService', async () => {
    const summary = await run(null);

    const items = byKey(summary);
    expect(summary.isPremium).toBe(false);
    expect(items.letters.limit).toBe(DAILY_LIMIT_LETTERS);
    expect(items.analysis.limit).toBe(CV_ANALYSIS_LIMIT);
    expect(items.chat.limit).toBe(DAILY_LIMIT_CHAT_MESSAGES);
    expect(items.tests.limit).toBe(DAILY_LIMIT_TEST_SESSIONS);
  });

  it('räknar förbrukning ur räkningarna, null blir noll', async () => {
    const summary = await run(null, { chat: 7, analysis: 1, tests: 1 });

    const items = byKey(summary);
    expect(items.chat.used).toBe(7);
    expect(items.analysis.used).toBe(1);
    expect(items.tests.used).toBe(1);
  });

  it('etiketterna är oförändrade', async () => {
    const summary = await run(null);

    expect(summary.items.map((i) => i.label)).toEqual([
      'Brev',
      'Analys',
      'Chatt',
      'Tester',
    ]);
  });
});

describe('getQuotaSummary: resolveDailyLetterCounter respekteras', () => {
  it('räknar brev som förbrukade när fönstret startade i dag', async () => {
    const summary = await run({
      weekly_letter_count: 1,
      weekly_letter_first_used_at: todayStamp(),
    });

    expect(byKey(summary).letters.used).toBe(1);
  });

  it('nollställer brev när fönstret är från i går', async () => {
    const yesterday = new Date(
      startOfTodayStockholm().getTime() - 3600_000
    ).toISOString();

    const summary = await run({
      weekly_letter_count: 5,
      weekly_letter_first_used_at: yesterday,
    });

    // Räknaren i databasen är kvar, men logiskt är den 0 i dag.
    expect(byKey(summary).letters.used).toBe(0);
  });

  it('nollställer brev när fönsterstarten saknas', async () => {
    const summary = await run({
      weekly_letter_count: 4,
      weekly_letter_first_used_at: null,
    });

    expect(byKey(summary).letters.used).toBe(0);
  });

  it('saknad profilrad ger noll förbrukade brev', async () => {
    const summary = await run(null);

    expect(byKey(summary).letters.used).toBe(0);
  });
});

describe('getQuotaSummary: nästa nollställning', () => {
  it('ligger i framtiden och är en giltig ISO-tid', async () => {
    const summary = await run(null);

    expect(Number.isNaN(Date.parse(summary.nextResetAt))).toBe(false);
    expect(Date.parse(summary.nextResetAt)).toBeGreaterThan(Date.now());
  });
});
