import { describe, it, expect, vi } from 'vitest';

vi.mock('next/cache', () => ({ unstable_cache: (f: unknown) => f, revalidateTag: () => {} }));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdmin: () => ({}) }));

import { byggKopRad, summera, paketNamn, type KopRad } from '../kop';
import { byggUndantag, tomtUndantag } from '../undantag';

/** Köpet 22 sep 14.14 så som Stripe returnerade det (id och kund förkortade). */
const DAGSPASS = {
  id: 'py_1',
  created: Date.parse('2026-09-22T12:14:49Z') / 1000,
  amount: 4900,
  customer: 'cus_gomer',
  invoice: null,
  metadata: { planKey: 'all_day', plan: 'all_day', userId: '580ee411' },
  payment_method_details: { type: 'klarna' },
} as any;

const FORNYELSE = {
  id: 'ch_1',
  created: Date.parse('2026-09-09T18:26:56Z') / 1000,
  amount: 14900,
  customer: 'cus_mnd',
  invoice: { billing_reason: 'subscription_cycle', lines: { data: [{ price: { id: 'price_x' } }] } },
  metadata: {},
  payment_method_details: { type: 'card' },
} as any;

describe('byggKopRad', () => {
  const profiler = new Map([['cus_gomer', { id: '580ee411', email: 'gomer@gomer.se' }]]);

  it('gör dagspasset till en ny engångsrad med paket och konto', () => {
    const r = byggKopRad(DAGSPASS, false, profiler, tomtUndantag());
    expect(r).toMatchObject({
      paket: 'all_day',
      paketNamn: 'Dagspasset',
      beloppOre: 4900,
      typ: 'engangs',
      ny: true,
      userId: '580ee411',
      email: 'gomer@gomer.se',
      betalsatt: 'Klarna',
      internt: false,
    });
  });

  it('gör en månadsfaktura till en löpande förnyelse', () => {
    const r = byggKopRad(FORNYELSE, false, new Map(), tomtUndantag());
    expect(r.typ).toBe('lopande');
    // subscription_cycle är alltid en förnyelse, även utan historik.
    expect(r.ny).toBe(false);
  });

  it('märker ett undantaget kontos köp som internt', () => {
    const u = byggUndantag([{ userId: 'agare', email: null, skal: 'admin', stripeKund: 'cus_gomer' }]);
    expect(byggKopRad(DAGSPASS, false, profiler, u).internt).toBe(true);
  });

  it('skriver Hela paketet, en månad med å', () => {
    expect(paketNamn('all_month')).toBe('Hela paketet, en månad');
    expect(paketNamn(null)).toBe('Okänt paket');
  });
});

describe('summera', () => {
  const rad = (p: Partial<KopRad>): KopRad => ({
    id: 'x',
    tid: '2026-09-22T12:00:00Z',
    paket: 'all_month',
    paketNamn: 'Hela paketet, en månad',
    beloppOre: 14900,
    typ: 'lopande',
    ny: false,
    aterbetalning: false,
    userId: null,
    email: null,
    betalsatt: null,
    internt: false,
    ...p,
  });

  it('räknar 30 dagar som specen: 496 kr, 447 löpande, 49 engångs', () => {
    const s = summera([
      rad({}),
      rad({}),
      rad({}),
      rad({ paket: 'all_day', typ: 'engangs', beloppOre: 4900, ny: true }),
    ]);
    expect(s).toMatchObject({
      totaltOre: 49600,
      lopandeOre: 44700,
      engangsOre: 4900,
      antalLopande: 3,
      antalEngangs: 1,
      nyaBetalande: 1,
    });
  });

  it('räknar aldrig interna köp och drar av återbetalningar', () => {
    const s = summera([
      rad({ internt: true, typ: 'engangs', beloppOre: 4900, ny: true }),
      rad({}),
      rad({ aterbetalning: true, beloppOre: -14900 }),
    ]);
    expect(s.totaltOre).toBe(0);
    expect(s.aterbetaltOre).toBe(14900);
    expect(s.nyaBetalande).toBe(0);
  });
});
