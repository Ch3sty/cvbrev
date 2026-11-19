// De två felen från skärmdumparna (briefen 2026-11-18): "dag 38 av 45" och
// märket Provdagen före provdagen.
import { describe, expect, it } from 'vitest';
import { byggBana, dagAvPlan } from '../bana';
import { giltigaMilstolpar, nyaMilstolpar } from '@/lib/traning/milstolpar';
import { validerPlan } from '@/lib/traning/testplan';

describe('dag N av M räknas från planens start', () => {
  it('kontot med första nivåkollen 11 okt och plan sedan 15 nov', () => {
    expect(dagAvPlan('2026-11-15', '2026-11-25', '2026-11-18')).toEqual({ dag: 4, av: 10 });
  });
  it('utan datum: inget "av"', () => {
    expect(dagAvPlan('2026-11-15', null, '2026-11-18')).toBeNull();
  });
  it('banan börjar på planens start, inte på första nivåkollen', () => {
    const b = byggBana({ planStart: '2026-11-15', provdatum: '2026-11-25', idag: '2026-11-18', gjordaDagar: ['2026-10-11', '2026-11-15', '2026-11-17'], senasteNivakoll: '2026-11-14' });
    expect(b[0]).toEqual({ dag: '2026-11-15', status: 'gjord' });
    expect(b.find((d) => d.dag === '2026-11-16')?.status).toBe('kommande');
    expect(b.find((d) => d.dag === '2026-11-18')?.status).toBe('idag');
    expect(b.find((d) => d.dag === '2026-11-21')?.forslag).toBe('nivakoll');
    expect(b.find((d) => d.dag === '2026-11-23')?.forslag).toBe('ovningsprov');
    expect(b[b.length - 1]).toEqual({ dag: '2026-11-25', status: 'prov' });
  });
  it('öppet slut utan datum', () => {
    const b = byggBana({ planStart: '2026-11-18', provdatum: null, idag: '2026-11-18', gjordaDagar: [], senasteNivakoll: null });
    expect(b).toHaveLength(11);
    expect(b.some((d) => d.status === 'prov')).toBe(false);
  });
  it('PUT tar emot dagsmålet 1 till 3 eller null', () => {
    expect(validerPlan({ dagsmal: 2 }, '2026-11-18')).toEqual({ ok: true, data: { dagsmal: 2 } });
    expect(validerPlan({ dagsmal: null }, '2026-11-18')).toEqual({ ok: true, data: { dagsmal: null } });
    expect(validerPlan({ dagsmal: 4 }, '2026-11-18')).toEqual({ ok: false, fel: 'ogiltigt_dagsmal' });
  });
});

describe('märket Provdagen', () => {
  const mil = [
    { nyckel: 'forsta_matningen', nadd_at: '2026-10-11', visad_at: null },
    { nyckel: 'provdagen', nadd_at: '2026-10-28', visad_at: null },
  ];
  it('före datumet: dolt även om raden finns från ett tidigare datum', () => {
    expect(giltigaMilstolpar(mil, '2026-11-25', '2026-11-18').map((m) => m.nyckel)).toEqual(['forsta_matningen']);
  });
  it('på provdagen: dolt; dagen efter: synligt', () => {
    expect(giltigaMilstolpar(mil, '2026-11-25', '2026-11-25')).toHaveLength(1);
    expect(giltigaMilstolpar(mil, '2026-11-25', '2026-11-26')).toHaveLength(2);
  });
  it('utan datum: dolt', () => {
    expect(giltigaMilstolpar(mil, null, '2026-11-26')).toHaveLength(1);
  });
  it('registreras bara efter datumet', () => {
    const bas = { sessioner: [], punkter: [], redan: [] };
    expect(nyaMilstolpar({ ...bas, provdatum: '2026-11-25', idag: '2026-11-25' })).not.toContain('provdagen');
    expect(nyaMilstolpar({ ...bas, provdatum: '2026-11-25', idag: '2026-11-26' })).toContain('provdagen');
  });
});
