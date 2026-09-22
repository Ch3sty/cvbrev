import { describe, it, expect } from 'vitest';
import {
  datumKort,
  tidKort,
  nollSedan,
  matsFran,
  gscEfter,
  kronor,
  tal,
  foreMatstart,
  MATSTART,
} from '../tomt';

describe('tomma tillstånd', () => {
  it('skriver datum och tid i svensk tid', () => {
    expect(datumKort('2026-09-22')).toBe('22 sep');
    expect(tidKort('2026-09-22T12:14:49Z')).toBe('22 sep kl. 14.14');
    expect(tidKort(MATSTART.kopvag)).toBe('22 sep kl. 19.02');
    expect(tidKort(MATSTART.paket)).toBe('22 sep kl. 10.51');
    expect(tidKort('2026-09-22')).toBe('22 sep');
  });

  it('skriver noll som ett tal med sedan när, aldrig streck', () => {
    expect(nollSedan('köp', MATSTART.kopvag)).toBe('0 köp sedan 22 sep kl. 19.02');
    expect(tal(null)).toBe('0');
    expect(kronor(null)).toBe('0 kr');
    expect(kronor(44700)).toBe('447 kr');
  });

  it('säger när något börjar mätas', () => {
    expect(matsFran(MATSTART.kopvag, 'Första andel när minst fem sett köpsteget.')).toBe(
      'Mäts från 22 sep kl. 19.02. Första andel när minst fem sett köpsteget.'
    );
  });

  it('säger att Google ligger efter', () => {
    expect(gscEfter('2026-09-19', 15, '2026-09-22')).toBe(
      'Google ligger 3 dagar efter. 15 klick 19 sep, senaste dag med data.'
    );
    expect(gscEfter(null, null, '2026-09-22')).toContain('inte levererat');
  });

  it('jämför mot mätstart', () => {
    expect(foreMatstart('2026-09-22T12:14:49Z', MATSTART.kopvag)).toBe(true);
    expect(foreMatstart('2026-09-14', MATSTART.mrr)).toBe(true);
    expect(foreMatstart('2026-09-15', MATSTART.mrr)).toBe(false);
  });
});
