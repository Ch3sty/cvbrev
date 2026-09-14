/**
 * Tester for Trafikens formatering.
 *
 * Formateringen ar dar felen faktiskt uppstar pa den har sidan: CTR lagras
 * som andel men laser som procent, position skrivs med en decimal, och
 * positionsdeltat har vant tecken eftersom ett lagre tal ar en battre
 * placering. Alla tre gar att fa fel utan att nagot kraschar.
 */

import { describe, it, expect } from 'vitest';
import {
  antal,
  deltaPosition,
  deltaProcent,
  forandring,
  kortDatum,
  position,
  procent,
  sokvag,
} from '../format';

describe('Trafik, formatering', () => {
  it('skriver saknade tal som tankstreck, aldrig som nolla', () => {
    // En nolla dar datan saknas ser ut som ett ras. Det ar hela poangen med
    // att GSC-luckor lagras som null.
    expect(antal(null)).toBe('–');
    expect(procent(null)).toBe('–');
    expect(position(null)).toBe('–');
    expect(deltaProcent(null)).toBe('–');
    expect(antal(0)).toBe('0');
  });

  it('laser CTR som andel, inte som procenttal', () => {
    expect(procent(0.008629989212513484)).toBe('0,86 %');
    expect(procent(0.5, 0)).toBe('50 %');
  });

  it('skriver position med exakt en decimal', () => {
    expect(position(18.600216684723726)).toBe('18,6');
    expect(position(22)).toBe('22,0');
  });

  it('satter ut tecken pa klickdelta och anvander riktigt minustecken', () => {
    expect(deltaProcent(0.12)).toBe('+12 %');
    expect(deltaProcent(-0.3)).toBe('−30 %');
    expect(deltaProcent(0)).toBe('0 %');
  });

  it('vander tecknet pa positionsdelta sa att uppat betyder battre', () => {
    // Positionen gick fran 18 till 21, alltsa tre steg samre. Talet ar +3
    // men ska skrivas som en forsamring, alltsa med minus.
    expect(deltaPosition(3)).toBe('−3,0');
    expect(deltaPosition(-2.5)).toBe('+2,5');
    expect(deltaPosition(0)).toBe('0');
  });

  it('ger null i stallet for oandligheten nar basen ar noll', () => {
    expect(forandring(10, 0)).toBeNull();
    expect(forandring(15, 10)).toBeCloseTo(0.5);
    expect(forandring(5, 10)).toBeCloseTo(-0.5);
  });

  it('kortar en GSC-sidnyckel till sokvagen', () => {
    expect(sokvag('https://jobbcoach.ai/artiklar/logiska-tester')).toBe(
      '/artiklar/logiska-tester'
    );
    expect(sokvag('https://jobbcoach.ai/')).toBe('/');
    // En nyckel som inte ar en URL lamnas i fred i stallet for att kastas.
    expect(sokvag('inte-en-url')).toBe('inte-en-url');
  });

  it('formaterar datum till kort svensk form', () => {
    expect(kortDatum('2026-09-12')).toBe('12 sep');
  });
});
