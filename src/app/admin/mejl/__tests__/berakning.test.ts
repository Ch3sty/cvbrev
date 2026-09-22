/**
 * Tester for Mejlsidans rakning per utskick (spec-admin-tydlighet 2026-09-22).
 *
 * Det som gick fel: 21 sep hade 13 skickade och 15 oppnade, alltsa over
 * 100 %, eftersom oppningar raknades som handelser per dag. Har raknas varje
 * utskick hogst en gang, och ett oppnat utskick raknas alltid som levererat.
 */

import { describe, it, expect } from 'vitest';
import {
  aggregera,
  kopNyckel,
  uteslutUtskick,
  utfall,
  type HandelseRad,
  type LoggRad,
} from '../berakning';
import { byggUndantag } from '@/lib/admin/undantag';

function logg(id: string, typ = 'quota_back', user: string | null = 'u1', till = 'kund@exempel.se'): LoggRad {
  return {
    resend_id: id,
    email_type: typ,
    recipient: till,
    sent_at: '2026-09-21T08:00:00Z',
    user_id: user,
  };
}

function h(id: string, typ: string): HandelseRad {
  return { resend_id: id, event_type: typ };
}

describe('Mejl, oppnandegrad per utskick', () => {
  it('raknar ett utskick som oppnat en gang oavsett antal oppningar', () => {
    const agg = aggregera(
      [logg('a'), logg('b')],
      [h('a', 'delivered'), h('a', 'opened'), h('a', 'opened'), h('a', 'opened'), h('b', 'delivered')]
    );
    expect(agg.totalt.skickade).toBe(2);
    expect(agg.totalt.levererade).toBe(2);
    expect(agg.totalt.oppnade).toBe(1);
  });

  it('passerar aldrig 100 % aven nar delivered saknas', () => {
    // 13 skickade, alla oppnade, flera oppnade tva ganger, bara fem med
    // delivered. Forr blev det 15 oppnade av 5 levererade.
    const loggar = Array.from({ length: 13 }, (_, i) => logg(`m${i}`));
    const handelser: HandelseRad[] = [];
    loggar.forEach((l, i) => {
      if (i < 5) handelser.push(h(l.resend_id!, 'delivered'));
      handelser.push(h(l.resend_id!, 'opened'));
      if (i < 2) handelser.push(h(l.resend_id!, 'opened'));
    });
    const agg = aggregera(loggar, handelser);
    expect(agg.totalt.oppnade).toBe(13);
    expect(agg.totalt.oppnade).toBeLessThanOrEqual(agg.totalt.levererade);
    for (const v of agg.perVecka) {
      expect(v.oppnandegrad).not.toBeNull();
      expect(v.oppnandegrad!).toBeLessThanOrEqual(1);
    }
    for (const r of agg.perMall) expect(r.oppnade).toBeLessThanOrEqual(r.levererade);
  });

  it('raknar ett klickat utskick som levererat', () => {
    expect(utfall(new Set(['clicked']))).toEqual({
      levererad: true,
      oppnad: false,
      klickad: true,
      studsad: false,
    });
    expect(utfall(undefined).levererad).toBe(false);
  });
});

describe('Mejl, undantagna konton', () => {
  const u = byggUndantag([{ userId: 'agaren', email: 'agare@jobbcoach.ai', skal: 'admin', stripeKund: null }]);

  it('raknar bort agarens konto och testadresser', () => {
    const { kvar, bort } = uteslutUtskick(
      [
        logg('a', 'quota_back', 'agaren', 'agare@jobbcoach.ai'),
        logg('b', 'quota_back', null, 'b4-qa-cv@jobbcoach-qa.test'),
        logg('c', 'quota_back', 'raderad', 'qa-b6@exempel.se'),
        logg('d', 'quota_back', 'kund', 'kund@exempel.se'),
      ],
      u
    );
    expect(bort).toBe(3);
    expect(kvar.map((k) => k.resend_id)).toEqual(['d']);
  });
});

describe('Mejl, kopmejl som egen grupp', () => {
  it('kanner igen kvitto, kom igang, paketet fornyas och uppsagningen', () => {
    expect(kopNyckel('receipt')).toBe('receipt');
    expect(kopNyckel('komigang_2026-09-25')).toBe('komigang');
    expect(kopNyckel('paket_fornyas_2026-09-28')).toBe('paket_fornyas');
    expect(kopNyckel('canceled_until_sunday')).toBe('canceled_until_sunday');
    expect(kopNyckel('quota_back')).toBeNull();
    expect(kopNyckel('winback_14')).toBeNull();
  });

  it('samlar hjalpredans dagliga mejl under en rad', () => {
    const agg = aggregera(
      [logg('a', 'komigang_2026-09-23'), logg('b', 'komigang_2026-09-24'), logg('c', 'receipt'), logg('d', 'winback_14')],
      []
    );
    const kop = Object.fromEntries(agg.perKop.map((r) => [r.nyckel, r.skickade]));
    expect(kop).toEqual({ komigang: 2, receipt: 1 });
    expect(agg.perSteg.map((r) => r.nyckel)).toEqual(['winback_14']);
  });
});
