import { describe, expect, it } from 'vitest';
import { kurvPunkter, serieText, typForSymbol, veckaFor } from '../vyer';

describe('vyer', () => {
  it('serietexten säger dagarna utan skuld', () => {
    expect(serieText({ dagar: 0, status: 'ingen', gjordIdag: false })).toBe('Dagarna i rad börjar i dag.');
    expect(serieText({ dagar: 1, status: 'pagar', gjordIdag: true })).toBe('Första dagen i rad.');
    expect(serieText({ dagar: 4, status: 'pagar', gjordIdag: false })).toBe('Fyra dagar i rad. Dagens pass gör det fem.');
    expect(serieText({ dagar: 5, status: 'pagar', gjordIdag: true })).toBe('Fem dagar i rad.');
    expect(serieText({ dagar: 3, status: 'pausad', gjordIdag: false })).toBe('Dagarna i rad pausar, inget bryts.');
  });

  it('veckoraden går måndag till söndag med söndag fri och paus före provet', () => {
    // 2026-11-13 är en fredag; provet 2026-11-15 ger paus fredag till söndag.
    const v = veckaFor({
      idag: '2026-11-13',
      plandagar: [{ dag: '2026-11-10', typ: 'pass', status: 'gjord' }],
      serie: { dagar: 1, status: 'pagar', gjordIdag: false },
      plan: null,
    });
    expect(v.map((d) => d.etikett)).toEqual(['mån', 'tis', 'ons', 'tor', 'fre', 'lör', 'sön']);
    expect(v.map((d) => d.status)).toEqual(['kvar', 'gjord', 'kvar', 'kvar', 'idag', 'kvar', 'fri']);
    expect(v[4].idag).toBe(true);
    const medProv = veckaFor({
      idag: '2026-11-13',
      plandagar: [],
      serie: { dagar: 0, status: 'pausad', gjordIdag: false },
      plan: { provdatum: '2026-11-15' } as never,
    });
    expect(medProv.slice(4).map((d) => d.status)).toEqual(['paus', 'paus', 'paus']);
  });

  it('kurvans punkter räknas i dagar från starten', () => {
    const k = kurvPunkter(
      [
        { dag: '2026-11-03', niva: 5.2, typ: 'pass' },
        { dag: '2026-11-01', niva: 5, typ: 'matning' },
      ],
      '2026-11-01',
      '2026-11-24',
      '2026-11-03',
    );
    expect(k.punkter).toEqual([
      { x: 0, niva: 5, matning: true },
      { x: 2, niva: 5.2, matning: false },
    ]);
    expect(k.provX).toBe(23);
    expect(k.dagar).toBe(23);
  });

  it('hemvyns symboler blir appens figurer', () => {
    expect(typForSymbol('siffror')).toBe('numerisk');
    expect(typForSymbol('figurer')).toBe('figurserie');
    expect(typForSymbol('jobb')).toBe('plan');
  });
});
