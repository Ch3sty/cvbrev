// Godkännandet i adminen skickar mailet till rekryteraren en gång.

/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createFakeDb, fakeAdmin, type FakeDb } from '@/lib/recruiter/__tests__/fakeAdmin';

const REK = '22222222-2222-4222-8222-222222222222';
let db: FakeDb;
const skickade: any[] = [];

vi.mock('@/lib/admin/requireSuperAdmin', () => ({
  requireSuperAdmin: async () => ({ ok: true, userId: 'agare', email: 'agare@exempel.test' }),
}));
vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [] }) }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => fakeAdmin(db) }));
vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: async (m: any) => {
        skickade.push(m);
        return { data: { id: 'x' }, error: null };
      },
    };
  },
}));

import { POST } from '../route';

function beslut(action: 'approve' | 'reject') {
  return POST(
    new NextRequest('http://localhost/api/admin/recruiters', {
      method: 'POST',
      body: JSON.stringify({ userId: REK, action }),
    })
  );
}

beforeEach(() => {
  skickade.length = 0;
  process.env.RESEND_API_KEY = 'test';
  db = createFakeDb({
    email_log: [],
    profiles: [{ id: REK, email: 'rut@exempel.test', full_name: 'Rut Rekryterare' }],
    recruiter_profiles: [{ user_id: REK, contact_name: 'Rut Rekryterare', status: 'pending' }],
  });
});

describe('godkännandet i adminen', () => {
  it('godkänn skickar mailet, ett nytt godkännande efter tillbakadragning skickar inte igen', async () => {
    expect((await (await beslut('approve')).json()).mailSkickat).toBe(true);
    await beslut('reject');
    expect((await (await beslut('approve')).json()).mailSkickat).toBe(false);
    expect(skickade).toHaveLength(1);
    expect(skickade[0].subject).toBe('Ditt rekryterarkonto är godkänt');
  });

  it('avslag skickar inget', async () => {
    await beslut('reject');
    expect(skickade).toHaveLength(0);
  });
});
