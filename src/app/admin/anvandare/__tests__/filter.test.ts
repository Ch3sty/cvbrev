/**
 * Tester for filtret och formateringen i Anvandare.
 *
 * Bada ar ren logik utan databas, och bada ar precis de stallen dar en tyst
 * bugg blir en lista som ser rimlig ut men visar fel personer. Filtret maste
 * tala skrap i adressen, och nivalogiken maste halla isar trial och premium:
 * en reverse trial ar formellt premium_tier utan att ha betalat.
 */

import { describe, it, expect } from 'vitest';
import { filterFranSok, sokFranFilter, lasKalla, STANDARDFILTER } from '../data';
import { niva, sedan, tal, visningsnamn, kortDatum } from '../format';

describe('filterFranSok', () => {
  it('ger standardfiltret for tom sokstrang', () => {
    expect(filterFranSok({})).toEqual(STANDARDFILTER);
  });

  it('laser alla filtren ur sokparametrarna', () => {
    expect(
      filterFranSok({
        niva: 'premium',
        aktivitet: '7',
        harCv: '1',
        harBrev: '1',
        kalla: 'google',
        sok: '  anna  ',
        sortering: 'brev',
        riktning: 'asc',
        sida: '3',
      })
    ).toEqual({
      niva: 'premium',
      aktivitet: '7',
      harCv: true,
      harBrev: true,
      kalla: 'google',
      sok: 'anna',
      sortering: 'brev',
      riktning: 'asc',
      sida: 3,
    });
  });

  it('faller till standard for okanda varden', () => {
    const f = filterFranSok({
      niva: 'guld',
      aktivitet: '400',
      sortering: 'drop table',
      riktning: 'sidledes',
      sida: '-2',
    });
    expect(f.niva).toBe('alla');
    expect(f.aktivitet).toBe('alla');
    expect(f.sortering).toBe('senast_aktiv');
    expect(f.riktning).toBe('desc');
    expect(f.sida).toBe(1);
  });

  it('tar forsta vardet nar en parameter upprepas', () => {
    expect(filterFranSok({ niva: ['trial', 'premium'] }).niva).toBe('trial');
  });

  it('kapar for langa fritexter', () => {
    const f = filterFranSok({ sok: 'a'.repeat(500) });
    expect(f.sok.length).toBe(80);
  });
});

describe('sokFranFilter', () => {
  it('skriver ingenting for standardfiltret', () => {
    expect(sokFranFilter(STANDARDFILTER)).toBe('');
  });

  it('gar fram och tillbaka utan att tappa nagot', () => {
    const start = {
      ...STANDARDFILTER,
      niva: 'trial' as const,
      aktivitet: '30' as const,
      harCv: true,
      kalla: 'linkedin',
      sok: 'anna',
      sortering: 'cv' as const,
      riktning: 'asc' as const,
      sida: 4,
    };
    const sok = sokFranFilter(start);
    const params = Object.fromEntries(new URLSearchParams(sok.slice(1)));
    expect(filterFranSok(params)).toEqual(start);
  });
});

describe('lasKalla', () => {
  it('laser en ren strang', () => {
    expect(lasKalla('google')).toBe('google');
  });

  it('laser source ur ett objekt', () => {
    expect(lasKalla({ source: 'linkedin', medium: 'cpc' })).toBe('linkedin');
  });

  it('faller tillbaka pa utm_source', () => {
    expect(lasKalla({ utm_source: 'nyhetsbrev' })).toBe('nyhetsbrev');
  });

  it('ger null for null, tomt och okanda former', () => {
    expect(lasKalla(null)).toBeNull();
    expect(lasKalla({})).toBeNull();
    expect(lasKalla({ okand: 'x' })).toBeNull();
  });
});

describe('niva', () => {
  it('kallar en Stripe-trial for trial', () => {
    expect(
      niva({
        subscription_tier: 'premium',
        subscription_status: 'trialing',
        premium_source: null,
      })
    ).toBe('Trial');
  });

  it('kallar en reverse trial for trial, inte premium', () => {
    expect(
      niva({
        subscription_tier: 'premium',
        subscription_status: null,
        premium_source: 'signup_trial',
      })
    ).toBe('Trial');
    expect(
      niva({
        subscription_tier: 'premium',
        subscription_status: null,
        premium_source: 'oauth_signup_trial',
      })
    ).toBe('Trial');
  });

  it('kallar betalande och admin-tilldelade for premium', () => {
    expect(
      niva({
        subscription_tier: 'premium',
        subscription_status: 'active',
        premium_source: null,
      })
    ).toBe('Premium');
    expect(
      niva({
        subscription_tier: 'premium',
        subscription_status: 'active',
        premium_source: 'admin',
      })
    ).toBe('Premium');
  });

  it('kallar allt annat for gratis, aven uppsagda', () => {
    expect(
      niva({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        premium_source: null,
      })
    ).toBe('Gratis');
  });
});

describe('format', () => {
  it('skriver tal med svenska tusental och tankstreck for null', () => {
    // Svensk gruppering anvander smalt mellanslag, inte vanligt mellanslag.
    expect(tal(1234)).toMatch(/^1\s234$/);
    expect(tal(null)).toBe('–');
    expect(tal(0)).toBe('0');
  });

  it('skriver relativ tid pa svenska', () => {
    const nu = Date.parse('2026-09-14T12:00:00Z');
    expect(sedan(new Date(nu - 30_000).toISOString(), nu)).toBe('Nyss');
    expect(sedan(new Date(nu - 5 * 60_000).toISOString(), nu)).toBe('5 min sedan');
    expect(sedan(new Date(nu - 3 * 3_600_000).toISOString(), nu)).toBe('3 h sedan');
    expect(sedan(new Date(nu - 86_400_000).toISOString(), nu)).toBe('1 dag sedan');
    expect(sedan(new Date(nu - 4 * 86_400_000).toISOString(), nu)).toBe('4 dagar sedan');
    expect(sedan(null, nu)).toBe('Aldrig');
  });

  it('tal skrap i datumfalten utan att kasta', () => {
    expect(sedan('inte ett datum')).toBe('Aldrig');
    expect(kortDatum('inte ett datum')).toBe('–');
    expect(kortDatum(null)).toBe('–');
  });

  it('faller tillbaka pa e-postens forsta del utan namn', () => {
    expect(visningsnamn(null, 'anna.svensson@example.com')).toBe('anna.svensson');
    expect(visningsnamn('  Anna  ', 'a@b.se')).toBe('Anna');
    expect(visningsnamn(null, null)).toBe('Namnlos');
  });
});
