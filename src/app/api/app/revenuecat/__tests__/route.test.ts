import { beforeEach, describe, expect, it, vi } from 'vitest';

const insatta: Array<Record<string, unknown>> = [];
const profilAndringar: Array<Record<string, unknown>> = [];

// Minimal Supabase-klient: premium_grants med unikt event-id och en profil.
vi.mock('@/lib/supabase/admin', () => {
  const kedja = (tabell: string) => {
    const q: Record<string, unknown> = {};
    const tillbaka = () => q;
    Object.assign(q, {
      insert: async (rad: Record<string, unknown>) => {
        if (insatta.some((r) => r.stripe_event_id === rad.stripe_event_id)) return { error: { code: '23505', message: 'dubblett' } };
        insatta.push(rad);
        return { error: null };
      },
      select: tillbaka,
      eq: tillbaka,
      in: tillbaka,
      gt: async () => ({ data: [], error: null }),
      maybeSingle: async () => ({ data: { premium_until: null, premium_source: null, subscription_status: null, subscription_tier: 'free' }, error: null }),
      update: (andring: Record<string, unknown>) => {
        if (tabell === 'profiles') profilAndringar.push(andring);
        return { eq: async () => ({ error: null }) };
      },
    });
    return q;
  };
  return { getSupabaseAdmin: () => ({ from: kedja }) };
});

import { POST } from '../route';

const ANV = '11111111-2222-3333-4444-555555555555';

function anrop(kropp: unknown, auth: string | null = 'rc-hemlighet') {
  return new Request('http://localhost/api/app/revenuecat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: auth } : {}) },
    body: typeof kropp === 'string' ? kropp : JSON.stringify(kropp),
  });
}

const kop = {
  api_version: '1.0',
  event: {
    id: 'CD489E0E-5D4B-4B5C-9E1A-0D0B6C9E2F11',
    type: 'INITIAL_PURCHASE',
    app_user_id: ANV,
    original_app_user_id: ANV,
    aliases: [ANV],
    product_id: 'testklar_premium:manad',
    period_type: 'NORMAL',
    store: 'PLAY_STORE',
    environment: 'PRODUCTION',
    purchased_at_ms: Date.now(),
    expiration_at_ms: Date.now() + 30 * 86400_000,
    event_timestamp_ms: Date.now(),
  },
};

describe('POST /api/app/revenuecat', () => {
  beforeEach(() => {
    insatta.length = 0;
    profilAndringar.length = 0;
    process.env.REVENUECAT_WEBHOOK_AUTH = 'rc-hemlighet';
  });

  it('401 utan eller med fel Authorization', async () => {
    expect((await POST(anrop(kop, null))).status).toBe(401);
    expect((await POST(anrop(kop, 'fel'))).status).toBe(401);
    expect(insatta).toHaveLength(0);
  });

  it('401 när hemligheten saknas i miljön', async () => {
    delete process.env.REVENUECAT_WEBHOOK_AUTH;
    expect((await POST(anrop(kop))).status).toBe(401);
  });

  it('400 för en trasig kropp', async () => {
    expect((await POST(anrop('{inte json'))).status).toBe(400);
    expect((await POST(anrop({ event: { type: 'RENEWAL' } }))).status).toBe(400);
  });

  it('ett köp skriver premium_grants en gång, även när händelsen skickas om', async () => {
    const svar = await POST(anrop(kop));
    expect(svar.status).toBe(200);
    expect(await svar.json()).toMatchObject({ ok: true, atgard: 'beviljad' });
    const igen = await POST(anrop(kop, 'Bearer rc-hemlighet'));
    expect(await igen.json()).toMatchObject({ atgard: 'dubblett' });
    expect(insatta).toHaveLength(1);
    expect(insatta[0]).toMatchObject({ user_id: ANV, scope: 'allt', source: 'play', stripe_event_id: `revenuecat:${kop.event.id}` });
    expect(profilAndringar[0]).toMatchObject({ subscription_tier: 'premium', premium_source: 'play' });
  });

  it('200 utan åtgärd för RevenueCats testhändelse', async () => {
    const svar = await POST(anrop({ event: { ...kop.event, id: 'test-1', type: 'TEST' } }));
    expect(svar.status).toBe(200);
    expect(await svar.json()).toMatchObject({ atgard: 'ingen' });
  });
});
