import { describe, expect, it } from 'vitest';
import { anvandareForHandelse, hanteraRevenuecat, kallaForHandelse, rattNyckel, type KopLager, type RcHandelse } from '../kopRevenuecat';

const ANV = '11111111-2222-3333-4444-555555555555';
const NU = new Date('2026-11-13T12:00:00Z');
const OM_30 = Date.parse('2026-12-13T12:00:00Z');

type Grant = { id: string; user_id: string; stripe_event_id: string; days: number; source: string; scope: string; premium_until_after: string; granted_at: string };
type Profil = { premium_until: string | null; premium_source: string | null; subscription_status: string | null; subscription_tier: string | null };

/** premium_grants och profiles i minnet, med samma unika event-id som tabellen. */
function minne(profil: Profil | null = { premium_until: null, premium_source: null, subscription_status: null, subscription_tier: 'free' }) {
  const grants: Grant[] = [];
  const profiler = new Map<string, Profil>();
  if (profil) profiler.set(ANV, { ...profil });
  let klocka = NU.getTime();
  const lager: KopLager = {
    async skrivGrant(rad) {
      if (grants.some((g) => g.stripe_event_id === rad.stripe_event_id)) return false;
      grants.push({ ...rad, id: `g${grants.length + 1}`, granted_at: new Date(klocka).toISOString() });
      return true;
    },
    async aktivaAppGrants(userId, efter) {
      return grants.filter((g) => g.user_id === userId && g.source.startsWith('play') && g.premium_until_after > efter);
    },
    async sattGrantSlut(id, slut) {
      const g = grants.find((x) => x.id === id);
      if (g) g.premium_until_after = slut;
    },
    async hamtaProfil(userId) {
      return profiler.get(userId) ?? null;
    },
    async uppdateraProfil(userId, andring) {
      const p = profiler.get(userId);
      if (p) Object.assign(p, andring);
    },
  };
  return { lager, grants, profil: () => profiler.get(ANV)!, satt: (ms: number) => (klocka = ms) };
}

/** Exempelhändelse i RevenueCats format (webhook v1, fältet event). */
function handelse(type: string, extra: Partial<RcHandelse> = {}): RcHandelse {
  return {
    id: `evt-${type}-${Math.random().toString(36).slice(2)}`,
    type,
    app_user_id: ANV,
    original_app_user_id: ANV,
    aliases: [ANV],
    product_id: 'testklar_premium:manad',
    store: 'PLAY_STORE',
    environment: 'PRODUCTION',
    event_timestamp_ms: NU.getTime(),
    expiration_at_ms: OM_30,
    ...extra,
  };
}

describe('kopRevenuecat', () => {
  it('INITIAL_PURCHASE skriver en grants-rad med scope allt, källa play och sluttid, och sätter profilen', async () => {
    const m = minne();
    const u = await hanteraRevenuecat(m.lager, handelse('INITIAL_PURCHASE'), NU);
    expect(u.atgard).toBe('beviljad');
    expect(m.grants).toHaveLength(1);
    expect(m.grants[0]).toMatchObject({ user_id: ANV, scope: 'allt', source: 'play', days: 30, premium_until_after: new Date(OM_30).toISOString() });
    expect(m.grants[0].stripe_event_id.startsWith('revenuecat:evt-INITIAL_PURCHASE')).toBe(true);
    expect(m.profil()).toMatchObject({ subscription_tier: 'premium', premium_until: new Date(OM_30).toISOString(), premium_source: 'play' });
  });

  it('är idempotent på RevenueCats event-id', async () => {
    const m = minne();
    const e = handelse('INITIAL_PURCHASE');
    await hanteraRevenuecat(m.lager, e, NU);
    const igen = await hanteraRevenuecat(m.lager, e, NU);
    expect(igen.atgard).toBe('dubblett');
    expect(m.grants).toHaveLength(1);
  });

  it('RENEWAL förlänger med en ny rad', async () => {
    const m = minne();
    await hanteraRevenuecat(m.lager, handelse('INITIAL_PURCHASE'), NU);
    const nasta = Date.parse('2027-01-13T12:00:00Z');
    await hanteraRevenuecat(m.lager, handelse('RENEWAL', { expiration_at_ms: nasta }), NU);
    expect(m.grants).toHaveLength(2);
    expect(m.profil().premium_until).toBe(new Date(nasta).toISOString());
  });

  it('PRODUCT_CHANGE och UNCANCELLATION ger Premium till utgången', async () => {
    for (const typ of ['PRODUCT_CHANGE', 'UNCANCELLATION']) {
      const m = minne();
      const u = await hanteraRevenuecat(m.lager, handelse(typ), NU);
      expect(u.atgard).toBe('beviljad');
      expect(m.grants[0].premium_until_after).toBe(new Date(OM_30).toISOString());
    }
  });

  it('SUBSCRIPTION_EXTENDED förlänger till den nya sluttiden, en gång per händelse', async () => {
    const m = minne();
    await hanteraRevenuecat(m.lager, handelse('INITIAL_PURCHASE'), NU);
    const ny = Date.parse('2027-01-13T12:00:00Z');
    const e = handelse('SUBSCRIPTION_EXTENDED', { expiration_at_ms: ny });
    expect(await hanteraRevenuecat(m.lager, e, NU)).toMatchObject({ atgard: 'beviljad' });
    expect(await hanteraRevenuecat(m.lager, e, NU)).toMatchObject({ atgard: 'dubblett' });
    expect(m.grants).toHaveLength(2);
    expect(m.grants[1]).toMatchObject({ scope: 'allt', source: 'play', premium_until_after: new Date(ny).toISOString() });
    expect(m.profil().premium_until).toBe(new Date(ny).toISOString());
  });

  it('CANCELLATION behåller Premium till periodens slut', async () => {
    const m = minne();
    await hanteraRevenuecat(m.lager, handelse('INITIAL_PURCHASE'), NU);
    const u = await hanteraRevenuecat(m.lager, handelse('CANCELLATION', { cancel_reason: 'UNSUBSCRIBE' }), NU);
    expect(u.atgard).toBe('avslutad');
    expect(m.grants[0].premium_until_after).toBe(new Date(OM_30).toISOString());
    expect(m.profil()).toMatchObject({ subscription_tier: 'premium', premium_until: new Date(OM_30).toISOString() });
  });

  it('CANCELLATION efter återbetalning kortar raden till återbetalningen', async () => {
    const m = minne();
    await hanteraRevenuecat(m.lager, handelse('INITIAL_PURCHASE'), NU);
    const senare = new Date(NU.getTime() + 3600_000);
    m.satt(senare.getTime());
    await hanteraRevenuecat(m.lager, handelse('CANCELLATION', { cancel_reason: 'CUSTOMER_SUPPORT', expiration_at_ms: senare.getTime() - 1000, event_timestamp_ms: senare.getTime() }), senare);
    expect(m.grants[0].premium_until_after).toBe(new Date(senare.getTime() - 1000).toISOString());
    expect(m.profil().subscription_tier).toBe('free');
  });

  it('EXPIRATION avslutar raderna och profilen', async () => {
    const m = minne();
    await hanteraRevenuecat(m.lager, handelse('INITIAL_PURCHASE'), NU);
    const efter = new Date(OM_30 + 60_000);
    m.satt(efter.getTime());
    const u = await hanteraRevenuecat(m.lager, handelse('EXPIRATION', { event_timestamp_ms: efter.getTime() }), efter);
    expect(u).toMatchObject({ atgard: 'avslutad', rader: 0 });
    expect(m.profil()).toMatchObject({ premium_until: new Date(OM_30).toISOString(), subscription_tier: 'free' });
  });

  it('en sent levererad EXPIRATION kapar inte en nyare förnyelse', async () => {
    const m = minne();
    const gammal = handelse('EXPIRATION', { event_timestamp_ms: NU.getTime() - 5000, expiration_at_ms: NU.getTime() - 10_000 });
    await hanteraRevenuecat(m.lager, handelse('RENEWAL'), NU);
    await hanteraRevenuecat(m.lager, gammal, NU);
    expect(m.grants[0].premium_until_after).toBe(new Date(OM_30).toISOString());
    expect(m.profil().subscription_tier).toBe('premium');
  });

  it('BILLING_ISSUE med respit behåller Premium respiten ut, utan respit slutar den', async () => {
    const m = minne();
    await hanteraRevenuecat(m.lager, handelse('INITIAL_PURCHASE'), NU);
    const respit = OM_30 + 7 * 86400_000;
    const u = await hanteraRevenuecat(m.lager, handelse('BILLING_ISSUE', { expiration_at_ms: respit }), NU);
    expect(u.atgard).toBe('beviljad');

    const n = minne();
    await hanteraRevenuecat(n.lager, handelse('INITIAL_PURCHASE'), NU);
    const senare = new Date(NU.getTime() + 1000);
    const v = await hanteraRevenuecat(n.lager, handelse('BILLING_ISSUE', { expiration_at_ms: NU.getTime() - 1, event_timestamp_ms: senare.getTime() }), senare);
    expect(v.atgard).toBe('avslutad');
    expect(n.grants[0].premium_until_after).toBe(senare.toISOString());
  });

  it('rör inte profilen för en kund med levande Stripe-prenumeration eller admin-premium', async () => {
    const m = minne({ premium_until: null, premium_source: null, subscription_status: 'active', subscription_tier: 'premium' });
    await hanteraRevenuecat(m.lager, handelse('INITIAL_PURCHASE'), NU);
    expect(m.profil().premium_source).toBe(null);

    const a = minne({ premium_until: '2027-06-01T00:00:00.000Z', premium_source: 'admin', subscription_status: null, subscription_tier: 'premium' });
    await hanteraRevenuecat(a.lager, handelse('INITIAL_PURCHASE'), NU);
    expect(a.profil()).toMatchObject({ premium_until: '2027-06-01T00:00:00.000Z', premium_source: 'admin' });
    await hanteraRevenuecat(a.lager, handelse('EXPIRATION', { expiration_at_ms: NU.getTime() }), NU);
    expect(a.profil()).toMatchObject({ premium_until: '2027-06-01T00:00:00.000Z', subscription_tier: 'premium' });
  });

  it('ignorerar okänd användare, testhändelser och redan utgångna köp', async () => {
    const m = minne();
    expect(await hanteraRevenuecat(m.lager, handelse('INITIAL_PURCHASE', { app_user_id: '$RCAnonymousID:abc', original_app_user_id: '$RCAnonymousID:abc', aliases: [] }), NU)).toMatchObject({ atgard: 'ingen', orsak: 'okand_anvandare' });
    expect(await hanteraRevenuecat(m.lager, handelse('TEST'), NU)).toMatchObject({ atgard: 'ingen' });
    expect(await hanteraRevenuecat(m.lager, handelse('RENEWAL', { expiration_at_ms: NU.getTime() - 1 }), NU)).toMatchObject({ atgard: 'ingen', orsak: 'redan_utgangen' });
    expect(m.grants).toHaveLength(0);
  });

  it('läser användaren ur alias och källan ur butik och miljö', () => {
    expect(anvandareForHandelse({ id: 'x', type: 'RENEWAL', app_user_id: '$RCAnonymousID:1', aliases: ['$RCAnonymousID:1', ANV.toUpperCase()] })).toBe(ANV);
    expect(kallaForHandelse({ store: 'PLAY_STORE', environment: 'SANDBOX' })).toBe('play_sandbox');
    expect(kallaForHandelse({ store: 'APP_STORE', environment: 'PRODUCTION' })).toBe('app_store');
  });

  it('jämför Authorization med och utan Bearer', () => {
    expect(rattNyckel('hemligt', 'hemligt')).toBe(true);
    expect(rattNyckel('Bearer hemligt', 'hemligt')).toBe(true);
    expect(rattNyckel('hemligT', 'hemligt')).toBe(false);
    expect(rattNyckel('hemligt', undefined)).toBe(false);
    expect(rattNyckel(null, 'hemligt')).toBe(false);
  });
});
