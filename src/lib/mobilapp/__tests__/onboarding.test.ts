import { describe, expect, it } from 'vitest';
import {
  arSteg,
  lasSamtycke,
  planKropp,
  planremsa,
  planSammanfattning,
  provdatumFor,
  samtyckeCookie,
  stegRad,
  tolkaMinne,
  STANDARD,
} from '../onboarding';
import { arNyIdentitet } from '../onboarding-overforing.server';

const IDAG = '2026-11-13';

describe('provdatumFor', () => {
  it('räknar snabbvalen från i dag', () => {
    expect(provdatumFor('1v', null, IDAG)).toBe('2026-11-20');
    expect(provdatumFor('2v', null, IDAG)).toBe('2026-11-27');
    expect(provdatumFor('3v', null, IDAG)).toBe('2026-12-04');
    expect(provdatumFor('1m', null, IDAG)).toBe('2026-12-13');
  });
  it('vet inte än ger ingen dag', () => {
    expect(provdatumFor('ej', '2026-12-01', IDAG)).toBeNull();
  });
  it('kalendern tar bara giltiga dagar från i dag och framåt', () => {
    expect(provdatumFor('kal', '2026-12-24', IDAG)).toBe('2026-12-24');
    expect(provdatumFor('kal', '2026-11-01', IDAG)).toBeNull();
    expect(provdatumFor('kal', 'nonsens', IDAG)).toBeNull();
    expect(provdatumFor('kal', '2028-01-01', IDAG)).toBeNull();
  });
});

describe('planen', () => {
  it('sammanfattar med webbens byggPlan', () => {
    const p = planSammanfattning('2026-12-04', IDAG);
    expect(p.rubrik).toBe('Planen till 4 december');
    expect(p.dagar).toBe(21);
    expect(p.text).toMatch(/^21 dagar, \d+ pass, .* och två övningsprov$/);
  });
  it('utan datum en rullande vecka', () => {
    expect(planSammanfattning(null, IDAG).rubrik).toBe('Planen, en vecka i taget');
    const r = planremsa(null, IDAG);
    expect(r[0]).toBe('matning');
    expect(r).toHaveLength(8);
  });
  it('remsan slutar på provdagen', () => {
    const r = planremsa('2026-11-20', IDAG);
    expect(r[r.length - 1]).toBe('prov');
    expect(r[r.length - 2]).toBe('general');
  });
  it('kroppen till plan-API:t är webbens planFranVal plus provdatum', () => {
    const k = planKropp({ test: 'iprov', datum: '1v', kalender: null }, IDAG);
    expect(k.mitt_test).toBe('iprov');
    expect(k.provdatum).toBe('2026-11-20');
    expect(k.leverantor).toBeNull();
    expect(planKropp({ test: 'matrigma', datum: 'ej', kalender: null }, IDAG)).toMatchObject({ leverantor: 'matrigma', provdatum: null, testtyper: ['matris'] });
  });
});

describe('minnet', () => {
  it('tål trasigt och okänt innehåll', () => {
    expect(tolkaMinne(null)).toEqual(STANDARD);
    expect(tolkaMinne('{inte json')).toEqual(STANDARD);
    expect(tolkaMinne(JSON.stringify({ test: 'okant', datum: 'x', niva: 42, klar: 'ja' }))).toEqual(STANDARD);
  });
  it('läser giltiga val', () => {
    const m = tolkaMinne(JSON.stringify({ test: 'shl', datum: 'kal', kalender: '2026-12-01', samtycke: false, niva: 5, klar: true }));
    expect(m).toEqual({ test: 'shl', datum: 'kal', kalender: '2026-12-01', samtycke: false, niva: 5, klar: true });
  });
});

describe('samtycket', () => {
  it('skriver samma cookie som webbens kakbanner', () => {
    expect(samtyckeCookie(true, true)).toBe('cvBrevCookieConsent=true;max-age=15552000;path=/;SameSite=Lax;Secure');
    expect(samtyckeCookie(false, false)).toBe('cvBrevCookieConsent=false;max-age=15552000;path=/;SameSite=Lax');
  });
  it('läser svaret ur cookien', () => {
    expect(lasSamtycke('a=1; cvBrevCookieConsent=true; b=2')).toBe(true);
    expect(lasSamtycke('cvBrevCookieConsent=false')).toBe(false);
    expect(lasSamtycke('a=1')).toBeNull();
  });
});

describe('stegen', () => {
  it('känner igen stegen', () => {
    expect(arSteg('konto')).toBe(true);
    expect(arSteg('admin')).toBe(false);
  });
  it('stegraden har fyra streck', () => {
    expect(stegRad('test')).toEqual(['gjord', 'nu', 'kvar', 'kvar']);
    expect(stegRad('samtycke')).toEqual(['gjord', 'gjord', 'gjord', 'nu']);
  });
});

describe('arNyIdentitet', () => {
  const nu = Date.parse('2026-11-13T12:00:00Z');
  it('godtar en identitet från de senaste femton minuterna', () => {
    expect(arNyIdentitet([{ provider: 'email', created_at: '2026-11-13T11:50:00Z' }], 'email', nu)).toBe(true);
  });
  it('nekar en gammal identitet och fel leverantör', () => {
    expect(arNyIdentitet([{ provider: 'email', created_at: '2026-11-13T11:00:00Z' }], 'email', nu)).toBe(false);
    expect(arNyIdentitet([{ provider: 'email', created_at: '2026-11-13T11:59:00Z' }], 'google', nu)).toBe(false);
    expect(arNyIdentitet(null, 'email', nu)).toBe(false);
  });
});

describe('planens rad', () => {
  it('en nivåkoll, inte ett', () => {
    expect(planSammanfattning('2026-11-27', IDAG).text).toMatch(/, en nivåkoll och /);
  });
});
