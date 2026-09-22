/**
 * Tester for Trafikens jamforelse och eftersläp (spec-admin-tydlighet sida 6).
 *
 * Det viktiga: korten jamfor lika manga dagar MED DATA. Tre dagar som Google
 * inte levererat far inte hamna i den senaste perioden som nollor.
 */

import { describe, it, expect } from 'vitest';
import {
  efterslapFran,
  fyllTillIdag,
  intervall,
  jamforDagarMedData,
  klickText,
  summera,
  type Dagsrad,
} from '../berakning';

function dag(iso: string, klick: number | null, position: number | null = null, visningar?: number | null): Dagsrad {
  return {
    dag: iso,
    klick,
    visningar: visningar === undefined ? (klick === null ? null : klick * 10) : visningar,
    ctr: null,
    position,
  };
}

/** 6 sep till 22 sep. 20 till 22 sep har Google inte levererat. */
function serie(): Dagsrad[] {
  const ut: Dagsrad[] = [];
  for (let d = 6; d <= 22; d++) {
    const iso = `2026-09-${String(d).padStart(2, '0')}`;
    // Vecka fore (6-12 sep): 10 klick om dagen. Senaste veckan (13-19): 20.
    const klick = d >= 20 ? null : d >= 13 ? 20 : 10;
    ut.push(dag(iso, klick, 14.5));
  }
  return ut;
}

describe('Trafik, jamforelse med lika manga dagar med data', () => {
  it('hoppar over dagarna Google inte levererat', () => {
    const j = jamforDagarMedData(serie(), 7);
    expect(j.antalNu).toBe(7);
    expect(j.antalFore).toBe(7);
    expect(j.granser).toEqual({
      start: '2026-09-13',
      slut: '2026-09-19',
      foreStart: '2026-09-06',
      foreSlut: '2026-09-12',
    });
    expect(j.period.klick).toBe(140);
    expect(j.foregaende.klick).toBe(70);
  });

  it('raknar en lucka mitt i serien bort i stallet for som noll', () => {
    const s = serie();
    // 15 sep saknas: perioden tar en dag tidigare i stallet.
    s.find((r) => r.dag === '2026-09-15')!.klick = null;
    s.find((r) => r.dag === '2026-09-15')!.visningar = null;
    const j = jamforDagarMedData(s, 7);
    expect(j.antalNu).toBe(7);
    expect(j.granser.start).toBe('2026-09-12');
    expect(j.period.klick).toBe(6 * 20 + 10);
    // Bara sex dagar finns kvar fore: 6 till 11 sep.
    expect(j.antalFore).toBe(6);
    expect(j.granser.foreStart).toBe('2026-09-06');
    expect(j.granser.foreSlut).toBe('2026-09-11');
  });

  it('sager hur manga dagar som fanns nar historiken ar for kort', () => {
    const j = jamforDagarMedData(serie().slice(-8), 7);
    // 15-19 sep har data, 20-22 inte: fem dagar, ingen foregaende period.
    expect(j.antalNu).toBe(5);
    expect(j.antalFore).toBe(0);
    expect(j.foregaende.klick).toBe(0);
  });

  it('viktar snittpositionen med visningar', () => {
    const s = summera([dag('2026-09-01', 1, 5, 1000), dag('2026-09-02', 1, 90, 3)]);
    expect(s.position).toBeCloseTo(5.25, 1);
    expect(summera([]).position).toBeNull();
  });
});

describe('Trafik, datumintervall', () => {
  it('skriver manaden en gang inom samma manad', () => {
    expect(intervall('2026-09-20', '2026-09-22')).toBe('20 till 22 sep');
    expect(intervall('2026-08-24', '2026-09-19')).toBe('24 aug till 19 sep');
    expect(intervall('2026-09-19', '2026-09-19')).toBe('19 sep');
  });
});

describe('Trafik, eftersläp', () => {
  it('fyller serien fram till i dag och hittar zonens start', () => {
    const kort = serie().slice(0, 14); // slutar 19 sep
    const fylld = fyllTillIdag(kort, '2026-09-22');
    expect(fylld.at(-1)!.dag).toBe('2026-09-22');
    expect(fylld.at(-1)!.klick).toBeNull();
    expect(efterslapFran(fylld, '2026-09-19')).toBe('2026-09-20');
    expect(efterslapFran(fylld, '2026-09-22')).toBeNull();
  });

  it('skriver meningen under klickdiagrammet', () => {
    const s = serie();
    s.find((r) => r.dag === '2026-09-19')!.klick = 15;
    expect(klickText(s, '2026-09-19')).toBe(
      '205 klick 6 till 19 sep. Senaste dag med data 19 sep: 15 klick, snittposition 14,5. 20 till 22 sep är inte noll, Google har inte levererat dem.'
    );
  });

  it('sager ental nar en dag saknas och inget nar allt ar levererat', () => {
    const s = serie().slice(0, 15); // till 20 sep
    expect(klickText(s, '2026-09-19')).toMatch(/20 sep är inte noll, Google har inte levererat den\.$/);
    const hel = serie().slice(0, 14);
    expect(klickText(hel, '2026-09-19')).not.toMatch(/inte levererat/);
    expect(klickText([], null)).toBe('Google har inte levererat någon dag i fönstret än.');
  });
});
