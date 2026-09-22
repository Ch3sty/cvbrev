import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { radUtanNull, collectAdminMetrics } from '../collect';

/**
 * Skrivsteget i collectAdminMetrics.
 *
 * Buggen: en korning dar alla delsteg misslyckades eller hoppades skrev anda
 * en rad i admin_daily_metrics, med varje tal null. Raden blev sedan
 * sidornas "senaste dag med data" och slog ut MRR, ARR och aktiva
 * prenumerationer pa bade Intakter och Oversikt.
 *
 * Tva regler testas: en tom rad skrivs aldrig, och en delvis rad skriver bara
 * sina egna kolumner sa att en tidigare korning inte nollstalls.
 */

describe('radUtanNull', () => {
  it('tar bort kolumner som ar null och undefined', () => {
    expect(
      radUtanNull({
        dag: '2026-09-21',
        mrr_ore: 480000,
        gsc_clicks: null,
        new_accounts: undefined as never,
      })
    ).toEqual({ mrr_ore: 480000 });
  });

  it('behaller noll', () => {
    // Noll nya betalande ar en matning. Skulle den falla bort hade dagen
    // sett ut som en lucka.
    expect(radUtanNull({ dag: '2026-09-21', new_paying: 0 })).toEqual({
      new_paying: 0,
    });
  });

  it('ger ett tomt objekt nar allt ar null', () => {
    expect(radUtanNull({ dag: '2026-09-21', mrr_ore: null, churned: null })).toEqual(
      {}
    );
  });

  it('tar aldrig med dag', () => {
    expect(radUtanNull({ dag: '2026-09-21', mrr_ore: 1 })).not.toHaveProperty('dag');
  });
});

/** En Supabase-attrapp som bara noterar vad som skrivs vart. */
function fejkAdmin() {
  const upserts: Array<{ tabell: string; rader: unknown }> = [];
  const insert: Array<{ tabell: string; rad: unknown }> = [];

  const klient = {
    upserts,
    insert,
    // Undantagen lases forst i collectAdminMetrics. Tom lista i attrappen.
    rpc() {
      return Promise.resolve({ data: [], error: null });
    },
    from(tabell: string) {
      const kedja: Record<string, unknown> = {
        upsert(rader: unknown) {
          upserts.push({ tabell, rader });
          return Promise.resolve({ error: null });
        },
        insert(rad: unknown) {
          insert.push({ tabell, rad });
          return Promise.resolve({ error: null });
        },
        select() {
          return kedja;
        },
        eq() {
          return kedja;
        },
        gte() {
          return kedja;
        },
        lt() {
          return kedja;
        },
        not() {
          return kedja;
        },
        or() {
          return kedja;
        },
        in() {
          return kedja;
        },
        limit() {
          return Promise.resolve({ data: [], count: 0 });
        },
        then(lost: (v: unknown) => unknown) {
          return Promise.resolve({ data: [], count: 0 }).then(lost);
        },
      };
      return kedja;
    },
  };

  return klient as typeof klient & Record<string, unknown>;
}

describe('collectAdminMetrics, skrivsteget', () => {
  const miljo = { ...process.env };

  beforeEach(() => {
    // Inga nycklar: Stripe, GSC och PostHog hoppas over, precis som pa en
    // Vercel-instans som saknar dem.
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.GSC_SERVICE_ACCOUNT_JSON;
    delete process.env.GSC_SITE_URL;
    delete process.env.POSTHOG_PERSONAL_API_KEY;
    delete process.env.POSTHOG_PROJECT_ID;
  });

  afterEach(() => {
    process.env = { ...miljo };
    vi.restoreAllMocks();
  });

  it('skriver ingen rad nar alla delsteg gav null', async () => {
    const admin = fejkAdmin();
    // Supabase-delsteget far ocksa falla: da finns inget varde alls.
    const trasig = {
      ...admin,
      from(tabell: string) {
        if (tabell === 'admin_daily_metrics' || tabell === 'admin_error_log') {
          return admin.from(tabell);
        }
        throw new Error('Supabase svarar inte');
      },
    };

    const res = await collectAdminMetrics(trasig as never, '2026-09-21');

    expect(res.skrev).toBe(false);
    const skrivningar = admin.upserts.filter(
      (u) => u.tabell === 'admin_daily_metrics'
    );
    expect(skrivningar).toHaveLength(0);
  });

  it('skriver bara kolumnerna som fick varde', async () => {
    const admin = fejkAdmin();

    const res = await collectAdminMetrics(admin as never, '2026-09-21');

    expect(res.skrev).toBe(true);
    const skrivning = admin.upserts.find((u) => u.tabell === 'admin_daily_metrics');
    expect(skrivning).toBeDefined();

    const rad = skrivning!.rader as Record<string, unknown>;
    expect(rad.dag).toBe('2026-09-21');

    // Stripe och GSC hoppades over, alltsa far deras kolumner inte skrivas:
    // en uttrycklig null hade raderat en tidigare korningnings siffror.
    expect(rad).not.toHaveProperty('mrr_ore');
    expect(rad).not.toHaveProperty('gsc_clicks');

    // Supabase-delsteget kordes och gav nollor ur attrappen.
    expect(rad.new_accounts).toBe(0);
  });
});
