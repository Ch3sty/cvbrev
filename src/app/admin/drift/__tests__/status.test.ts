/**
 * Tester for Drifts delstegsstatus, webhookens senaste kop och
 * uteslutningen av felrader fran undantagna konton.
 */

import { describe, it, expect } from 'vitest';
import { delstegStatus, felFranUndantag, kopText, senasteKop, type MetrikRad } from '../status';
import { byggUndantag } from '@/lib/admin/undantag';

function rad(dag: string, varden: Partial<MetrikRad> = {}): MetrikRad {
  return { dag, uppdaterad: `${dag}T17:48:00Z`, mrr_ore: 44700, gsc_clicks: null, new_accounts: 3, ...varden };
}

describe('Drift, status per delsteg', () => {
  it('ser GSC som ligger tre dagar efter som normalt', () => {
    const rader = [rad('2026-09-22'), rad('2026-09-21'), rad('2026-09-20'), rad('2026-09-19', { gsc_clicks: 15 })];
    const status = delstegStatus(rader, '2026-09-21', '2026-09-22');
    expect(status.map((s) => [s.namn, s.ok])).toEqual([
      ['Stripe', true],
      ['GSC', true],
      ['PostHog', true],
      ['Supabase', true],
    ]);
    expect(status[1].text).toBe('Senaste dag med klick 19 sep, Google ligger 3 dagar efter, vilket är normalt.');
  });

  it('flaggar det delsteg som inte skrev sitt tal', () => {
    const rader = [rad('2026-09-22', { mrr_ore: null, new_accounts: null }), rad('2026-09-12', { gsc_clicks: 4 })];
    const status = delstegStatus(rader, null, '2026-09-22');
    expect(status.filter((s) => !s.ok).map((s) => s.namn)).toEqual(['Stripe', 'GSC', 'PostHog', 'Supabase']);
    expect(status[0].text).toBe('MRR saknas på raden för 22 sep.');
  });
});

describe('Drift, webhookens senaste kop', () => {
  it('tar grantens paketnamn nar Allt-dagen ocksa skrev paket_started_at', () => {
    const kop = senasteKop([
      { userId: 'k', tid: '2026-09-22T12:14:05Z', paket: 'CV-veckan', kalla: 'profil' },
      { userId: 'k', tid: '2026-09-22T12:14:00Z', paket: 'Allt-dagen', kalla: 'grant' },
      { userId: 'x', tid: '2026-09-20T08:00:00Z', paket: 'Testveckan', kalla: 'profil' },
    ]);
    expect(kop?.paket).toBe('Allt-dagen');
    expect(kopText(kop, '2026-09-22T08:51:00Z')).toBe(
      'Senaste köp som webhooken bokförde: 22 sep kl. 14.14, Allt-dagen.'
    );
  });

  it('sager sedan nar nar inget kop finns', () => {
    expect(kopText(null, '2026-09-22T08:51:00Z')).toBe(
      'Webhooken har inte bokfört något köp sedan 22 sep kl. 10.51.'
    );
  });
});

describe('Drift, fel fran undantagna konton', () => {
  const u = byggUndantag([{ userId: 'agaren', email: null, skal: 'admin', stripeKund: null }]);

  it('kanner igen bade user_id och userId i metadata', () => {
    expect(felFranUndantag({ user_id: 'agaren' }, u)).toBe(true);
    expect(felFranUndantag({ userId: 'agaren' }, u)).toBe(true);
    expect(felFranUndantag({ userId: 'kund' }, u)).toBe(false);
    expect(felFranUndantag(null, u)).toBe(false);
    expect(felFranUndantag('text', u)).toBe(false);
  });
});
