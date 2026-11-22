// Urvalet i scheduleKomIgangMejl (beslut-mejl-och-radering 1a): förnyelsebeskedet
// är transaktionellt och går också till den som stängt av påminnelser, men
// Kom igång-mejlet gör det inte. Inga mejl skickas (Resend är utbytt).
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/supabase/premiumAccess', () => ({ getUserScope: vi.fn(async () => 'allt') }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: vi.fn(), cancel: vi.fn() };
  },
}));

import { fakeSupabase } from './fakeSupabase';
import { scheduleKomIgangMejl } from '../runner';

// Torsdag 12 november 2026, 08.00 svensk tid (morgonslotten).
const NU = new Date('2026-11-12T07:00:00.000Z');
const DATUM = '2026-11-12';
const omTimmar = (h: number) => new Date(NU.getTime() + h * 3600000).toISOString();

function betalande(over: Record<string, unknown> = {}) {
  return {
    id: 'u1',
    email: 'u1@exempel.se',
    premium_scope: 'allt',
    premium_until: omTimmar(20),
    current_period_end: omTimmar(20),
    subscription_status: 'active',
    price_id: null,
    cancel_at_period_end: false,
    quota_emails_opt_out: false,
    ...over,
  };
}

describe('scheduleKomIgangMejl och avregistreringen', () => {
  it('avregistrerad betalande med förnyelse om 20 timmar får förnyelsebeskedet', async () => {
    const db = fakeSupabase({ profiles: [betalande({ quota_emails_opt_out: true })], email_schedule: [] });
    const r = await scheduleKomIgangMejl(db.client, NU);
    expect(r.fornyas).toBe(1);
    expect(db.tables.email_schedule.map((x) => x.email_type)).toEqual([`paket_fornyas_${DATUM}`]);
  });

  it('avregistrerad betalande med förnyelse om fem dagar får ingenting, inte heller Kom igång', async () => {
    const fem = omTimmar(5 * 24);
    const db = fakeSupabase({
      profiles: [betalande({ quota_emails_opt_out: true, premium_until: fem, current_period_end: fem })],
      email_schedule: [],
    });
    const r = await scheduleKomIgangMejl(db.client, NU);
    expect(r).toEqual({ komigang: 0, fornyas: 0, skipped: 1 });
    expect(db.tables.email_schedule).toEqual([]);
  });

  it('samma profil utan avregistrering och förnyelse om fem dagar får Kom igång som förut', async () => {
    const fem = omTimmar(5 * 24);
    const db = fakeSupabase({
      profiles: [betalande({ premium_until: fem, current_period_end: fem })],
      email_schedule: [],
    });
    const r = await scheduleKomIgangMejl(db.client, NU);
    expect(r.komigang).toBe(1);
    expect(db.tables.email_schedule.map((x) => x.email_type)).toEqual([`komigang_${DATUM}`]);
  });

  it('uppsagd och avregistrerad får ingenting', async () => {
    const db = fakeSupabase({
      profiles: [betalande({ quota_emails_opt_out: true, cancel_at_period_end: true })],
      email_schedule: [],
    });
    const r = await scheduleKomIgangMejl(db.client, NU);
    expect(r.fornyas).toBe(0);
    expect(r.komigang).toBe(0);
    expect(db.tables.email_schedule).toEqual([]);
  });
});
