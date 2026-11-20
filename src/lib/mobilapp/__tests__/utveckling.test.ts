import { describe, expect, it } from 'vitest';
import { fixturUnderlag, fixturUtveckling, FIXTUR_IDAG } from '@/lib/tester/v4/fixturer';
import { TEST_TYP_ORDNING, type Gratislage, type UtvecklingsPunkt } from '@/lib/tester/v4/typer';
import { dagAv, kurvaFor, markenV4, startFor, tempoFor, tomStart, typRader, valdTyp } from '../utveckling';

const g = (over: Partial<Gratislage> = {}) => ({ premium: false, nivakollGjord: {}, grundKvarIdag: 1, ...over });
/** Ett nytt konto: inga punkter, inget mätt, ingen Nivåkoll gjord. */
const tom = (lage: 'a' | 'b' | 'c', niva: 'gratis' | 'premium' = 'gratis') => {
  const d = fixturUtveckling(lage, niva);
  return {
    ...d,
    punkter: [] as UtvecklingsPunkt[],
    gratis: { ...d.gratis, nivakollGjord: {} },
    typer: d.typer.map((t) => ({ ...t, niva: { ...t.niva, status: 'omatt' as const, niva: null, svar: undefined } })),
  };
};
const p = (over: Partial<UtvecklingsPunkt>): UtvecklingsPunkt => ({
  id: Math.random().toString(36).slice(2),
  typ: 'matris',
  dag: '2026-11-01',
  slag: 'nivakoll',
  niva: 5,
  raknas: true,
  resultat: null,
  overTid: null,
  href: null,
  ...over,
});

describe('startFor: aldrig en betalvägg för gratis', () => {
  it('Nivåkollen där den finns och inte är gjord', () => {
    expect(startFor('matris', g())).toEqual({ slag: 'nivakoll', href: '/dashboard/tester/pass?typ=matning' });
    expect(startFor('verbal', g())?.slag).toBe('nivakoll');
  });
  it('gjord Nivåkoll är Premium: ingen knapp för gratis, men för Premium', () => {
    expect(startFor('verbal', g({ nivakollGjord: { verbal: true } }))).toBeNull();
    expect(startFor('verbal', g({ premium: true, nivakollGjord: { verbal: true } }))?.slag).toBe('nivakoll');
  });
  it('talserier, spatial och ordförråd: Nivåkollen sedan etapp 6, en gång gratis', () => {
    expect(startFor('talserie', g())).toEqual({ slag: 'nivakoll', href: '/dashboard/tester/pass?typ=nivakoll&kind=talserie' });
    expect(startFor('spatial', g({ grundKvarIdag: 0 }))?.slag).toBe('nivakoll');
    expect(startFor('ordforrad', g({ nivakollGjord: { ordforrad: true } }))).toBeNull();
    expect(startFor('ordforrad', g({ premium: true, grundKvarIdag: 0, nivakollGjord: { ordforrad: true } }))?.slag).toBe('nivakoll');
  });
});

describe('tomläget (M3)', () => {
  it('utan plan: matrisens Nivåkoll', () => {
    expect(tomStart(tom('a'))).toMatchObject({ typ: 'matris', slag: 'nivakoll', href: '/dashboard/tester/pass?typ=matning' });
  });
  it('I-provet: planens första typ, ordförråd, med Nivåkollen (etapp 6)', () => {
    const ut = tomStart(tom('c'));
    expect(ut).toMatchObject({ typ: 'ordforrad', slag: 'nivakoll', href: '/dashboard/tester/pass?typ=nivakoll&kind=ordforrad' });
  });
  it('I-provet med Nivåkollen i ordförråd gjord: nästa typ med fri Nivåkoll, aldrig betalväggen', () => {
    const d = tom('c');
    const ut = tomStart({ ...d, gratis: { ...d.gratis, grundKvarIdag: 0, nivakollGjord: { ordforrad: true } } });
    expect(ut.slag).toBe('nivakoll');
    expect(ut.typ).not.toBe('ordforrad');
  });
  it('gamla Nivåkollen gjord i matrisen: nästa typ, inte betalväggen', () => {
    const d = tom('a');
    expect(tomStart({ ...d, gratis: { ...d.gratis, nivakollGjord: { matris: true } } })).toMatchObject({ typ: 'figurserie', slag: 'nivakoll' });
  });
  it('allt stängt för gratis: typens meny i Tester', () => {
    const d = tom('a');
    const alla = Object.fromEntries(TEST_TYP_ORDNING.map((t) => [t, true]));
    const ut = tomStart({ ...d, gratis: { ...d.gratis, grundKvarIdag: 0, nivakollGjord: alla } });
    expect(ut).toMatchObject({ slag: 'meny', href: '/dashboard/tester/alla?typ=matris' });
  });
});

describe('dag N av M från planens start', () => {
  it('räknas från planStart, inte från första nivåkollen', () => {
    expect(dagAv({ planStart: '2026-11-15', provdatum: '2026-11-25' }, '2026-11-18')).toEqual({ dag: 4, av: 10 });
  });
  it('utan datum eller efter provet: ingen rad', () => {
    expect(dagAv({ planStart: '2026-11-15', provdatum: null }, '2026-11-18')).toBeNull();
    expect(dagAv({ planStart: '2026-11-15', provdatum: '2026-11-17' }, '2026-11-18')).toBeNull();
  });
});

describe('vald typ och rader (B1)', () => {
  it('?typ= väljer typen, annars första mätta i planens ordning', () => {
    const d = fixturUtveckling('b', 'premium');
    expect(valdTyp(d, 'deduktiv')).toBe('deduktiv');
    expect(valdTyp(d, ['verbal'])).toBe('verbal');
    expect(valdTyp(d, 'hittepa')).toBe('matris');
    expect(valdTyp(d, 'figurserie', (t) => t !== 'figurserie')).toBe('matris');
  });
  it('nivån ur typer[].niva, påbörjad Nivåkoll som svar, omätt med start', () => {
    const d = fixturUtveckling('a', 'gratis');
    const r = typRader(d, 'matris');
    expect(r.find((x) => x.id === 'matris')).toMatchObject({ text: '6,3', href: '?typ=matris', vald: true });
    expect(r.find((x) => x.id === 'ordforrad')?.text).toBe('8 av 12 svar');
    expect(r.find((x) => x.id === 'figurserie')).toMatchObject({ text: 'Nivåkoll, 7 min', href: '/dashboard/tester/pass?typ=nivakoll&kind=figurserie' });
  });
  it('med plan: planens typer först och övriga bara med något att visa', () => {
    const d = fixturUtveckling('b', 'premium');
    const ids = typRader(d, 'matris').map((x) => x.id);
    expect(ids[0]).toBe('matris');
    expect(ids).not.toContain('figurserie');
    expect(ids).toContain('deduktiv');
  });
  it('nivån från ett nivåtest märks', () => {
    const d = fixturUtveckling('a', 'premium');
    const data = {
      ...d,
      punkter: [...d.punkter, p({ typ: 'spatial', kalla: 'nivatest', niva: 4.1, provNamn: 'Nivåtest, grundnivå' })],
      typer: d.typer.map((t) => (t.id === 'spatial' ? { ...t, niva: { status: 'matt' as const, niva: 4.1, osakerhet: 0.6, tak: 7.5 } } : t)),
    };
    expect(typRader(data, null).find((x) => x.id === 'spatial')?.text).toBe('4,1 ur nivåtestet');
  });
});

describe('kurvan ur v4:s geometri', () => {
  it('ring för Nivåkoll, punkt för träning och nivåtest, fyrkant för övningsprov på tidslinjen', () => {
    const d = fixturUtveckling('a', 'premium');
    const m = kurvaFor(d, 'matris');
    const former = new Set(m.markorer.map((x) => x.form));
    expect(former).toEqual(new Set(['ring', 'punkt', 'fyrkant']));
    expect(m.markorer.every((x) => x.punkt.typ === 'matris' && !x.dold)).toBe(true);
    const prov = m.markorer.find((x) => x.form === 'fyrkant')!;
    expect(prov.paLinjen).toBe(false);
    expect(prov.y).toBe(m.matt.yTid);
    const nt = kurvaFor({ ...d, punkter: [p({ typ: 'talserie', kalla: 'nivatest', niva: 3.9 })] }, 'talserie');
    expect(nt.markorer[0].form).toBe('punkt');
  });
  it('gratis: bara senaste punkten', () => {
    const d = fixturUtveckling('a', 'gratis');
    expect(d.historikLast).toBe(true);
    expect(kurvaFor(d, 'matris').markorer).toHaveLength(1);
  });
});

describe('tempo', () => {
  it('senaste punkten med tid mot provets tid', () => {
    const t = tempoFor(fixturUtveckling('a', 'premium').punkter, 'matris');
    expect(t).toMatchObject({ over: 4, antal: 20 });
    expect(tempoFor([], 'matris')).toBeNull();
  });
});

describe('märkena följer v4 (K4)', () => {
  const alla = TEST_TYP_ORDNING.flatMap((t) => fixturUnderlag('a', 'premium').typer[t].punkter);
  it('ur punkterna i alla typer: nivåkoll, nivån upp och övningsprov', () => {
    const m = markenV4({ milstolpar: [], allaPunkter: alla, plan: null, idag: FIXTUR_IDAG, nivakollGjord: {} });
    expect([...m].sort()).toEqual(['forsta_matningen', 'generalrepetitionen', 'nivan_upp']);
  });
  it('ett nivåtest är ingen Nivåkoll', () => {
    const m = markenV4({ milstolpar: [], allaPunkter: [p({ typ: 'spatial', kalla: 'nivatest' })], plan: null, idag: FIXTUR_IDAG, nivakollGjord: {} });
    expect(m.has('forsta_matningen')).toBe(false);
  });
  it('nivån upp först vid en hel nivå över första punkten', () => {
    const in_ = (n: number) => markenV4({ milstolpar: [], allaPunkter: [p({ niva: 6.3 }), p({ dag: '2026-11-02', slag: 'trana', niva: n })], plan: null, idag: FIXTUR_IDAG, nivakollGjord: {} });
    expect(in_(6.9).has('nivan_upp')).toBe(false);
    expect(in_(7.0).has('nivan_upp')).toBe(true);
  });
  it('Provdagen bara efter provdatumet, även om motorns rad finns', () => {
    const bas = { milstolpar: [{ nyckel: 'provdagen' }, { nyckel: 'forsta_veckan' }], allaPunkter: [], nivakollGjord: {} };
    expect(markenV4({ ...bas, plan: { provdatum: '2026-11-25' }, idag: '2026-11-18' }).has('provdagen')).toBe(false);
    expect(markenV4({ ...bas, plan: { provdatum: '2026-11-25' }, idag: '2026-11-26' }).has('provdagen')).toBe(true);
    expect(markenV4({ ...bas, plan: null, idag: '2026-11-26' }).has('forsta_veckan')).toBe(true);
  });
});
