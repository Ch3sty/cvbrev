/**
 * Tester for Mejlsidans nyckellogik och formatering.
 *
 * Tva saker testas sarskilt: att veckodigesten normaliseras till en nyckel
 * (annars blir varje vecka ett eget "livscykelsteg" och listan vaxer for
 * evigt), och att handelsekonstanterna saknar email.-prefix. Det andra ar
 * planens uttryckliga varning: en fraga pa email.delivered ger noll rader
 * och ser ut som ett trasigt system.
 */

import { describe, it, expect } from 'vitest';
import { stegNyckel } from '../data';
import { antal, grad, kortAdress, mallNamn, procent, tidpunkt } from '../format';
import { EMAIL_EVENT, EMAIL_EVENT_TYPES } from '@/lib/admin/email';

describe('Mejl, livscykelsteg', () => {
  it('kanner igen de schemalagda mallarna som steg', () => {
    expect(stegNyckel('rt_day0')).toBe('rt_day0');
    expect(stegNyckel('rt_day10')).toBe('rt_day10');
    expect(stegNyckel('winback_14')).toBe('winback_14');
    expect(stegNyckel('trial_day5')).toBe('trial_day5');
    expect(stegNyckel('quota_back')).toBe('quota_back');
  });

  it('normaliserar veckodigesten till en enda nyckel', () => {
    // Utan detta blir weekly_digest_2026w37 och weekly_digest_2026w38 tva
    // olika steg, och listan far en ny rad varje vecka for alltid.
    expect(stegNyckel('weekly_digest_2026w37')).toBe('weekly_digest');
    expect(stegNyckel('weekly_digest_2026w38')).toBe('weekly_digest');
  });

  it('raknar inte kampanjer och transaktionsmejl som livscykelsteg', () => {
    expect(stegNyckel('campaign:sokta-tjanster')).toBeNull();
    expect(stegNyckel('interest_message')).toBeNull();
    expect(stegNyckel('recruiter_interest')).toBeNull();
  });
});

describe('Mejl, handelsetyper', () => {
  it('saknar email.-prefix', () => {
    // Planens avsnitt 4.6: kolumnen lagrar delivered, inte email.delivered.
    for (const typ of EMAIL_EVENT_TYPES) {
      expect(typ.startsWith('email.')).toBe(false);
    }
    expect(EMAIL_EVENT.DELIVERED).toBe('delivered');
    expect(EMAIL_EVENT.BOUNCED).toBe('bounced');
  });
});

describe('Mejl, formatering', () => {
  it('ger null i stallet for division med noll', () => {
    // En mall utan levererade mejl har ingen oppnandegrad. Noll procent vore
    // en losning, men den pastar att ingen oppnade nar svaret ar att ingen
    // fick mejlet.
    expect(grad(5, 0)).toBeNull();
    expect(grad(115, 242)).toBeCloseTo(0.4752, 3);
  });

  it('laser grader som andel', () => {
    expect(procent(0.4752, 0)).toBe('48 %');
    expect(procent(null)).toBe('–');
  });

  it('skriver saknade tal som tankstreck', () => {
    expect(antal(null)).toBe('–');
    expect(antal(251)).toBe('251');
    expect(tidpunkt(null)).toBe('–');
  });

  it('namnger mallar pa svenska och lamnar okanda i fred', () => {
    expect(mallNamn('quota_back')).toBe('Kvoten tillbaka');
    expect(mallNamn('rt_day3')).toBe('Reverse trial, dag 3');
    expect(mallNamn('weekly_digest')).toBe('Veckodigest');
    expect(mallNamn('campaign:sokta-tjanster')).toBe('Kampanj: sokta-tjanster');
    // En ny mall visas som sig sjalv i stallet for att gissas.
    expect(mallNamn('helt_ny_mall')).toBe('helt_ny_mall');
  });

  it('kortar langa adresser men behaller domanen', () => {
    expect(kortAdress('kort@jobbcoach.ai')).toBe('kort@jobbcoach.ai');
    const lang = kortAdress('en-mycket-lang-adress-har@exempeldoman.se');
    expect(lang).toContain('@exempeldoman.se');
    expect(lang.length).toBeLessThan(41);
  });
});
