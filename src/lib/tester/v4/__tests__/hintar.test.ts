import { describe, expect, it } from 'vitest';
import { byggHintar, type HintIn, type HintTypIn } from '../hintar';
import { fixturTester } from '../fixturer';
import { NIVA_OSAKERHET } from '../niva-lage';
import { TEST_TYP_ORDNING, type PlanV4, type TestTypId } from '../typer';

const omatt = { status: 'omatt' as const, niva: null, osakerhet: NIVA_OSAKERHET, tak: 7.5 };
const matt = (niva: number) => ({ status: 'matt' as const, niva, osakerhet: NIVA_OSAKERHET, tak: 7.5 });

function typ(t: TestTypId, over: Partial<HintTypIn> = {}): HintTypIn {
  return { typ: t, niva: omatt, senasteNivakoll: null, traningarSedanNivakoll: 0, svagaste: null, tempo: null, nivakollFinns: true, provad: false, synlig: true, ...over };
}

const plan = (over: Partial<PlanV4> = {}): PlanV4 => ({
  mittTest: 'alva',
  namn: 'Alva Logic',
  typer: ['matris'],
  provdatum: '2026-11-25',
  dagarKvar: 7,
  planStart: '2026-11-15',
  dagsmal: null,
  format: null,
  ovningsprov: { namn: 'Övningsprov Alva', meta: '20 uppgifter', href: '/dashboard/tester/ovningsprov/logik', foreslagenDag: '2026-11-23' },
  franArtikel: false,
  ...over,
});

const inp = (over: Partial<HintIn> = {}): HintIn => ({ idag: '2026-11-18', plan: null, typer: TEST_TYP_ORDNING.map((t) => typ(t)), premium: true, nivakollGjord: {}, ...over });

describe('hintmotorn', () => {
  it('0: artikel utan data ger bara första steget, stängbart', () => {
    const h = byggHintar(inp({ plan: plan({ franArtikel: true, provdatum: null, dagarKvar: null }) }));
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject({ typ: 'forsta_steg', testtyp: 'matris', stangbar: true });
    expect(h[0].rubrik).toBe('Inför Alva Logic: börja med Nivåkollen i figurer och mönster');
  });

  it('prioritetsordningen med plan: nivåkoll saknas, mönster, tempo, sju dagar, provet nära', () => {
    const typer = TEST_TYP_ORDNING.map((t) => typ(t));
    const ip = plan({ mittTest: 'iprov', namn: 'I-provet', typer: ['ordforrad', 'spatial', 'talserie'], dagarKvar: 5, provdatum: '2026-11-23' });
    typer[TEST_TYP_ORDNING.indexOf('spatial')] = typ('spatial');
    typer[TEST_TYP_ORDNING.indexOf('ordforrad')] = typ('ordforrad', { niva: { ...omatt, status: 'paborjad', svar: { besvarade: 8, antal: 12 } }, provad: true });
    typer[TEST_TYP_ORDNING.indexOf('talserie')] = typ('talserie', { niva: matt(4.2), provad: true, senasteNivakoll: '2026-11-08', traningarSedanNivakoll: 3, svagaste: { namn: 'Växande steg', family: 'v', ratt: 3, antal: 6 }, tempo: 0.34 });
    // Matrisen ingår inte i planen och får inga hintar i 1 till 4.
    typer[0] = typ('matris', { niva: matt(6), provad: true, senasteNivakoll: '2026-10-01', svagaste: { namn: 'Figuren speglas', family: 'spegling', ratt: 1, antal: 6 } });
    const h = byggHintar(inp({ plan: ip, typer }));
    expect(h.map((x) => `${x.typ}:${x.testtyp}`)).toEqual(['nivakoll_saknas:spatial', 'nivakoll_paborjad:ordforrad', 'svagt_monster:talserie', 'tempo:talserie', 'nivakoll_igen:talserie']);
    expect(h.length).toBeLessThanOrEqual(5);
    expect(h[1].skal).toBe('8 av 12 svar. Fyra till, så får du ett nivåtal.');
  });

  it('provet nära kommer med när plats finns', () => {
    const typer = TEST_TYP_ORDNING.map((t) => (t === 'matris' ? typ(t, { niva: matt(6), provad: true, senasteNivakoll: '2026-11-15' }) : typ(t)));
    const h = byggHintar(inp({ plan: plan(), typer }));
    expect(h.map((x) => x.typ)).toEqual(['provet_nara']);
    expect(h[0].rubrik).toBe('Övningsprov Alva om 5 dagar');
  });

  it('ny användare utan plan och utan data: första steget, Nivåkollen i figurer och mönster', () => {
    const h = byggHintar(inp());
    expect(h).toHaveLength(1);
    expect(h[0]).toMatchObject({ typ: 'forsta_steg', testtyp: 'matris', stangbar: true, rubrik: 'Börja med Nivåkollen i figurer och mönster' });
    expect(h[0].knapp).toMatchObject({ slag: 'nivakoll', las: null });
  });

  it('utan plan med data: högst två omätta som förslag', () => {
    const typer = TEST_TYP_ORDNING.map((t) => (t === 'matris' ? typ(t, { niva: matt(5), provad: true, senasteNivakoll: '2026-11-17' }) : typ(t)));
    const h = byggHintar(inp({ typer }));
    expect(h.map((x) => x.typ)).toEqual(['prova_nytt', 'prova_nytt']);
  });

  it('I-provet gratis med dagens kvot slut: grundnivåns hint är låst med I morgon', () => {
    const ip = plan({ mittTest: 'iprov', namn: 'I-provet', typer: ['ordforrad', 'spatial', 'talserie'], dagarKvar: 12, provdatum: '2026-11-30' });
    const typer = TEST_TYP_ORDNING.map((t) =>
      t === 'matris' ? typ(t, { niva: matt(5), provad: true, senasteNivakoll: '2026-11-17' }) : ['ordforrad', 'spatial', 'talserie'].includes(t) ? typ(t, { nivakollFinns: false }) : typ(t)
    );
    const slut = byggHintar(inp({ plan: ip, typer, premium: false, grundKvarIdag: 0 }));
    expect(slut[0]).toMatchObject({ typ: 'nivakoll_saknas', knapp: { slag: 'niva_test', las: { skal: 'kvot', chip: 'I morgon' } } });
    const kvar = byggHintar(inp({ plan: ip, typer, premium: false, grundKvarIdag: 1 }));
    expect(kvar[0].knapp.las).toBeNull();
  });

  it('inget pekar: en hint ändå', () => {
    const typer = TEST_TYP_ORDNING.map((t) => typ(t, { niva: matt(5), provad: true, senasteNivakoll: '2026-11-17' }));
    const h = byggHintar(inp({ typer }));
    expect(h).toHaveLength(1);
    expect(h[0].typ).toBe('prova_nytt');
  });

  it('gratis: Träna och övningsprov låses med "Ingår i Premium", första Nivåkollen är öppen', () => {
    const typer = TEST_TYP_ORDNING.map((t) => (t === 'matris' ? typ(t, { niva: matt(6), provad: true, senasteNivakoll: '2026-11-17', svagaste: { namn: 'Figuren speglas', family: 'spegling', ratt: 2, antal: 6 } }) : typ(t)));
    const h = byggHintar(inp({ premium: false, typer, nivakollGjord: { matris: true } }));
    expect(h[0]).toMatchObject({ typ: 'svagt_monster' });
    expect(h[0].knapp.las).toEqual({ skal: 'premium', chip: 'Ingår i Premium' });
    const nk = h.find((x) => x.typ === 'prova_nytt')!;
    expect(nk.knapp.las).toBeNull();
  });
});

describe('fixturerna', () => {
  it('ger skissens hintar för I-provet', () => {
    const d = fixturTester('c', 'premium');
    expect(d.hintar[0]).toMatchObject({ typ: 'nivakoll_saknas', testtyp: 'spatial' });
    expect(d.typer.slice(0, 3).map((t) => t.id)).toEqual(['ordforrad', 'spatial', 'talserie']);
    expect(d.typer[0].ingarIPlan).toBe(true);
  });

  it('omätt typ: Träna blir Nivåkollen först, för gratis och Premium', () => {
    for (const niva of ['gratis', 'premium'] as const) {
      const t = fixturTester('a', niva).menyer.figurserie.trana;
      expect(t, niva).toMatchObject({ slag: 'nivakoll', etikett: 'Gör Nivåkollen först', las: null });
    }
    expect(fixturTester('a', 'gratis').menyer.figurserie.trana.meta).toBe('Gratis en gång');
    expect(fixturTester('a', 'gratis').typer.find((k) => k.id === 'figurserie')!.primar).toMatchObject({ slag: 'nivakoll', las: null });
  });

  it('gratis med kvoten använd: grundnivån säger I morgon, Träna är låst', () => {
    const d = fixturTester('a', 'gratis', { kvotAnvand: true });
    const m = d.menyer.matris;
    expect(m.nivaer[0].las).toEqual({ skal: 'kvot', chip: 'I morgon' });
    expect(m.nivaer[1].las?.skal).toBe('premium');
    expect(m.trana.las?.skal).toBe('premium');
    expect(m.nivakoll.las).toEqual({ skal: 'nivakoll_gjord', chip: 'Igen med Premium' });
    expect(d.menyer.figurserie.nivakoll.meta).toBe('Gratis en gång');
  });

  it('inget "pass" i fixturernas text', () => {
    const text = JSON.stringify([fixturTester('a', 'gratis'), fixturTester('b', 'premium'), fixturTester('c', 'premium'), fixturTester('b', 'gratis', { artikel: true })]).replace(/"href":"[^"]*"/g, '');
    expect(text).not.toMatch(/\b[Pp]ass\b/);
    expect(text).not.toContain(String.fromCharCode(0x2014));
  });
});
