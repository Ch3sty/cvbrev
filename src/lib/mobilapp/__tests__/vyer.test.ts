import { describe, expect, it } from 'vitest';
import { fixturTester } from '@/lib/tester/v4/fixturer';
import { deltypSynlig, DELTYPER } from '@/lib/traning/mittTest';
import { byggKatalogV4, kurvPunkter, serieText, typForSymbol, typSynlig, veckaFor, zonStaplar } from '../vyer';

describe('vyer', () => {
  it('serietexten säger dagarna utan skuld', () => {
    expect(serieText({ dagar: 0, status: 'ingen', gjordIdag: false })).toBe('Dagarna i rad börjar i dag.');
    expect(serieText({ dagar: 1, status: 'pagar', gjordIdag: true })).toBe('Första dagen i rad.');
    expect(serieText({ dagar: 4, status: 'pagar', gjordIdag: false })).toBe('Fyra dagar i rad. Dagens träning gör det fem.');
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

describe('katalogen ur Tester v4', () => {
  const synligt = (s: string) => /\bpass(et|en)?\b/i.test(s) || s.includes('—');

  it('gratis: grundnivån bär kvoten, Nivåkollen en gång, Träna ingår i Premium', () => {
    const k = byggKatalogV4(fixturTester('a', 'gratis'));
    const matris = k.fler.find((x) => x.typ === 'matris')!;
    const grund = matris.ark.testa.rader[0];
    expect(grund.chip).toEqual({ text: '1 kvar i dag', ton: 'fri' });
    expect(matris.ark.testa.rader[1].chip).toEqual({ text: 'Ingår i Premium', ton: 'las' });
    expect(matris.ark.testa.rader[1].href).toBe('/app/premium');
    expect(matris.ark.trana.knapp).toMatchObject({ las: true, href: '/app/premium', text: 'Träna, ingår i Premium' });
    // Omätt typ: Nivåkollen först, gratis en gång.
    const figur = k.fler.find((x) => x.typ === 'figurserie')!;
    expect(figur.ark.matDig.rader[0].chip).toEqual({ text: 'Gratis en gång', ton: 'fri' });
    expect(k.gratis?.href).toBe('/app/premium');
  });

  it('gratis efter dagens grundnivå: I morgon, och Nivåkollen igen med Premium', () => {
    const k = byggKatalogV4(fixturTester('a', 'gratis', { kvotAnvand: true }));
    const matris = k.fler.find((x) => x.typ === 'matris')!;
    expect(matris.ark.testa.rader[0].chip).toEqual({ text: 'I morgon', ton: 'las' });
    expect(matris.ark.matDig.rader[0].chip).toEqual({ text: 'Igen med Premium', ton: 'las' });
  });

  it('Premium: inga lås, Alva Logic med sin grupp och sitt övningsprov', () => {
    const k = byggKatalogV4(fixturTester('b', 'premium'));
    expect(k.mittTest?.titel).toBe('Mitt test: Alva Logic');
    expect(k.ingarRubrik).toBe('Ingår i Alva Logic · 1 del');
    expect(k.ingar.map((x) => x.typ)).toEqual(['matris']);
    expect(k.flerRubrik).toBe('Används i andra rekryteringstest, inte i Alva Logic');
    expect(k.ovningsprov?.las).toBe(false);
    const matris = k.ingar[0];
    expect(matris.ark.trana.knapp.las).toBe(false);
    expect(matris.ark.testa.rader.every((r) => r.chip === null)).toBe(true);
    expect(matris.ark.monster[0]).toMatchObject({ titel: 'Figuren speglas', meta: '2 av 6 rätt', chip: null });
    expect(matris.nivaTal).toBe('6,3');
    expect(matris.nivaer).toEqual([true, true, false]);
    expect(k.gratis).toBe(null);
  });

  it('raden under namnet är KALLAS och inga synliga texter säger pass', () => {
    for (const lage of ['a', 'b', 'c'] as const) {
      for (const niva of ['gratis', 'premium'] as const) {
        const k = byggKatalogV4(fixturTester(lage, niva));
        for (const x of [...k.ingar, ...k.fler]) {
          const texter = [x.meta, x.alias, x.ark.rad, x.ark.trana.text, x.ark.trana.knapp.text, ...x.ark.testa.rader.flatMap((r) => [r.titel, r.meta]), ...x.ark.matDig.rader.flatMap((r) => [r.titel, r.meta])];
          for (const s of texter) expect(synligt(s), s).toBe(false);
        }
      }
    }
    const a = byggKatalogV4(fixturTester('a', 'gratis'));
    expect(a.fler.find((x) => x.typ === 'talserie')?.alias).toBe('Kallas även talföljder');
  });

  it('typSynlig är v4:s deltypSynlig och staplarna följer zonerna', () => {
    for (const t of DELTYPER) expect(typSynlig(t)).toBe(deltypSynlig(t));
    expect(zonStaplar({ status: 'omatt', niva: null, osakerhet: 0.6, tak: 7.5 })).toEqual([false, false, false]);
    expect(zonStaplar({ status: 'matt', niva: 7.5, osakerhet: 0.6, tak: 7.5 })).toEqual([true, true, true]);
  });
});
