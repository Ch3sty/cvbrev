import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseMock, type TableResponse } from '@/lib/candidate/__tests__/supabaseMock';

// Rekryterarprofilerna slås upp med admin-klienten. Här härmas den, så testet
// kör utan env-variabler och utan nätverk.
let recruiterResponse: TableResponse = { data: [] };

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdmin: () =>
    createSupabaseMock({
      recruiter_profiles: () => recruiterResponse,
    }).client,
}));

// Trådstatistiken har egna tester; här låser vi bara att den aldrig
// tillskrivs icke-accepterade intressen.
const unreadByInterest = vi.fn();
vi.mock('@/lib/interests/threadUnread', () => ({
  unreadByInterest: (...args: unknown[]) => unreadByInterest(...args),
}));

import { getCandidateInterests } from '../getCandidateInterests';

const RECRUITER = {
  user_id: 'rec-1',
  company_name: 'Nordbolaget AB',
  contact_name: 'Karin Lund',
  contact_role: 'Rekryteringschef',
  contact_email: 'karin@nordbolaget.se',
  phone: '070-1234567',
  website: 'https://nordbolaget.se',
};

const interest = (id: string, status: 'pending' | 'accepted' | 'declined') => ({
  id,
  recruiter_user_id: 'rec-1',
  message: `Hej, meddelande ${id}`,
  status,
  created_at: '2026-01-01T10:00:00Z',
  responded_at: status === 'pending' ? null : '2026-01-02T10:00:00Z',
});

function run(rows: unknown[]) {
  const { client } = createSupabaseMock({
    candidate_interests: { data: rows },
  });
  return getCandidateInterests(client, 'cand-1');
}

beforeEach(() => {
  recruiterResponse = { data: [RECRUITER] };
  unreadByInterest.mockReset();
  // Statistik finns för varenda tråd. Icke-accepterade ska ändå få noll.
  unreadByInterest.mockResolvedValue(
    new Map([
      ['i-pending', { total: 7, unread: 4 }],
      ['i-accepted', { total: 5, unread: 3 }],
      ['i-declined', { total: 9, unread: 6 }],
    ])
  );
});

describe('getCandidateInterests: kontaktuppgifter', () => {
  it('lämnar ut kontaktkortet endast för accepterade intressen', async () => {
    const result = await run([
      interest('i-pending', 'pending'),
      interest('i-accepted', 'accepted'),
      interest('i-declined', 'declined'),
    ]);

    const byId = Object.fromEntries(result.map((r) => [r.id, r]));

    expect(byId['i-accepted'].recruiterContact).toEqual({
      companyName: 'Nordbolaget AB',
      contactName: 'Karin Lund',
      contactRole: 'Rekryteringschef',
      email: 'karin@nordbolaget.se',
      phone: '070-1234567',
      website: 'https://nordbolaget.se',
    });

    expect(byId['i-pending'].recruiterContact).toBeNull();
    expect(byId['i-declined'].recruiterContact).toBeNull();
  });

  it('läcker inte e-post, telefon eller webb för obesvarade och avböjda', async () => {
    const result = await run([
      interest('i-pending', 'pending'),
      interest('i-declined', 'declined'),
    ]);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('karin@nordbolaget.se');
    expect(serialized).not.toContain('070-1234567');
    expect(serialized).not.toContain('https://nordbolaget.se');
    expect(serialized).not.toContain('Rekryteringschef');
  });

  it('visar företag och kontaktnamn även innan kandidaten svarat', async () => {
    const [row] = await run([interest('i-pending', 'pending')]);

    expect(row.companyName).toBe('Nordbolaget AB');
    expect(row.contactName).toBe('Karin Lund');
    expect(row.recruiterContact).toBeNull();
  });

  it('faller tillbaka på "Okänt företag" när rekryterarprofilen saknas', async () => {
    recruiterResponse = { data: [] };

    const [row] = await run([interest('i-accepted', 'accepted')]);

    expect(row.companyName).toBe('Okänt företag');
    expect(row.contactName).toBeNull();
    expect(row.recruiterContact).toMatchObject({
      companyName: 'Okänt företag',
      email: null,
      phone: null,
    });
  });
});

describe('getCandidateInterests: räknare', () => {
  it('nollställer messageCount och unreadCount för icke-accepterade', async () => {
    const result = await run([
      interest('i-pending', 'pending'),
      interest('i-accepted', 'accepted'),
      interest('i-declined', 'declined'),
    ]);

    const byId = Object.fromEntries(result.map((r) => [r.id, r]));

    expect(byId['i-pending'].messageCount).toBe(0);
    expect(byId['i-pending'].unreadCount).toBe(0);
    expect(byId['i-declined'].messageCount).toBe(0);
    expect(byId['i-declined'].unreadCount).toBe(0);

    expect(byId['i-accepted'].messageCount).toBe(5);
    expect(byId['i-accepted'].unreadCount).toBe(3);
  });

  it('frågar bara efter trådstatistik för accepterade id:n', async () => {
    await run([
      interest('i-pending', 'pending'),
      interest('i-accepted', 'accepted'),
      interest('i-declined', 'declined'),
    ]);

    expect(unreadByInterest).toHaveBeenCalledTimes(1);
    const [, ids, viewerId, role] = unreadByInterest.mock.calls[0];
    expect(ids).toEqual(['i-accepted']);
    expect(viewerId).toBe('cand-1');
    expect(role).toBe('candidate');
  });

  it('ger noll när tråden saknar statistik', async () => {
    unreadByInterest.mockResolvedValue(new Map());

    const [row] = await run([interest('i-accepted', 'accepted')]);

    expect(row.messageCount).toBe(0);
    expect(row.unreadCount).toBe(0);
  });
});

describe('getCandidateInterests: gränsfall', () => {
  it('ger tom lista utan intressen och slår aldrig upp något', async () => {
    const result = await run([]);

    expect(result).toEqual([]);
    expect(unreadByInterest).not.toHaveBeenCalled();
  });

  it('kastar vidare fel från candidate_interests', async () => {
    const { client } = createSupabaseMock({
      candidate_interests: { data: null, error: { message: 'rls' } },
    });

    await expect(getCandidateInterests(client, 'cand-1')).rejects.toMatchObject({
      message: 'rls',
    });
  });
});
