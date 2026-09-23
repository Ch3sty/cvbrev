import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseMock, type TableResponse } from '@/lib/candidate/__tests__/supabaseMock';
import type { Scope } from '@/lib/access/features';

// Behörigheten har egna regler (admin, premium_until, grants) och testas
// där. Här styr vi bara scopet, för att låsa vad limit blir per rad.
let scope: Scope | null = null;
vi.mock('@/lib/supabase/premiumAccess', () => ({
  getUserScope: () => Promise.resolve(scope),
  userHasPremiumAccess: () => Promise.resolve(scope !== null),
  userHasAccess: () => Promise.resolve(scope !== null),
}));

import { getQuotaSummary } from '../getQuotaSummary';
import {
  DAILY_LIMIT_LETTERS,
  FREE_CHAT_MESSAGES_PER_ACCOUNT,
  DAILY_LIMIT_TEST_SESSIONS,
  CV_ANALYSIS_LIMIT,
  LETTER_WINDOW_DAYS,
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

/** En tidpunkt inom brevets rullande sjudagarsfönster. */
const inomFonstret = () => new Date(Date.now() - 2 * 24 * 3600_000).toISOString();

/** En tidpunkt före fönstret, alltså en räknare som logiskt är noll. */
const foreFonstret = () =>
  new Date(Date.now() - (LETTER_WINDOW_DAYS + 1) * 24 * 3600_000).toISOString();

beforeEach(() => {
  scope = null;
});

describe('getQuotaSummary: Allt', () => {
  it('ger limit null på alla fyra poster', async () => {
    scope = 'allt';

    const summary = await run({
      weekly_letter_count: 3,
      weekly_letter_first_used_at: inomFonstret(),
    });

    expect(summary.isPremium).toBe(true);
    expect(summary.scope).toBe('allt');
    expect(summary.items).toHaveLength(4);
    expect(summary.items.map((i) => i.key)).toEqual(['letters', 'analysis', 'chat', 'tests']);
    for (const item of summary.items) {
      expect(item.limit).toBeNull();
    }
  });

  it('visar ändå faktisk förbrukning', async () => {
    scope = 'allt';

    const summary = await run(
      { weekly_letter_count: 3, weekly_letter_first_used_at: inomFonstret() },
      { chat: 42, analysis: 2, tests: 5 }
    );

    const items = byKey(summary);
    expect(items.letters.used).toBe(3);
    expect(items.analysis.used).toBe(2);
    expect(items.chat.used).toBe(42);
    expect(items.tests.used).toBe(5);
  });
});

describe('getQuotaSummary: per spår', () => {
  it('CV-paketet öppnar CV-raderna men lämnar chatt och tester kvar', async () => {
    scope = 'cv';

    const items = byKey(await run(null));
    expect(items.letters.limit).toBeNull();
    expect(items.analysis.limit).toBeNull();
    // Chatten och testerna ligger i Allt respektive Träningspaketet.
    expect(items.chat.limit).toBe(FREE_CHAT_MESSAGES_PER_ACCOUNT);
    expect(items.tests.limit).toBe(DAILY_LIMIT_TEST_SESSIONS);
  });

  it('Träningspaketet öppnar testraden men lämnar brev och analys kvar', async () => {
    scope = 'tester';

    const items = byKey(await run(null));
    expect(items.tests.limit).toBeNull();
    expect(items.letters.limit).toBe(DAILY_LIMIT_LETTERS);
    expect(items.analysis.limit).toBe(CV_ANALYSIS_LIMIT);
    expect(items.chat.limit).toBe(FREE_CHAT_MESSAGES_PER_ACCOUNT);
  });

  it('varje rad bär featuren som öppnar den', async () => {
    const items = byKey(await run(null));
    expect(items.letters.feature).toBe('letter_download');
    expect(items.analysis.feature).toBe('cv_analysis_full');
    expect(items.chat.feature).toBe('chat_unlimited');
    expect(items.tests.feature).toBe('tests_above_base');
  });
});

describe('getQuotaSummary: gratis', () => {
  it('ger de faktiska taken ur quotaService', async () => {
    const summary = await run(null);

    const items = byKey(summary);
    expect(summary.isPremium).toBe(false);
    expect(summary.scope).toBeNull();
    expect(items.letters.limit).toBe(DAILY_LIMIT_LETTERS);
    expect(items.analysis.limit).toBe(CV_ANALYSIS_LIMIT);
    expect(items.chat.limit).toBe(FREE_CHAT_MESSAGES_PER_ACCOUNT);
    expect(items.tests.limit).toBe(DAILY_LIMIT_TEST_SESSIONS);
  });

  it('analys och chatt är kontokvoter, alltså utan återkomst', async () => {
    const items = byKey(await run(null));
    expect(items.analysis.perAccount).toBe(true);
    expect(items.chat.perAccount).toBe(true);
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

    expect(summary.items.map((i) => i.label)).toEqual(['Brev', 'Analys', 'Chatt', 'Tester']);
  });
});

describe('getQuotaSummary: brevets veckofönster', () => {
  it('räknar brevet som förbrukat inom de sju dygnen', async () => {
    const summary = await run({
      weekly_letter_count: 1,
      weekly_letter_first_used_at: inomFonstret(),
    });

    expect(byKey(summary).letters.used).toBe(1);
  });

  it('nollställer brevet när fönstret löpt ut', async () => {
    const summary = await run({
      weekly_letter_count: 5,
      weekly_letter_first_used_at: foreFonstret(),
    });

    // Räknaren i databasen är kvar, men logiskt är den 0 nu.
    expect(byKey(summary).letters.used).toBe(0);
  });

  it('nollställer brevet när fönsterstarten saknas', async () => {
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
