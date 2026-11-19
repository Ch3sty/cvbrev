// Idag i appen på testernas v4-modell (DEL D, B2): dagkortet är första
// hinten, Så ligger du till är typernas nivåband, dagsmålet och Fortsätt
// står, gratisraden kommer ur v4:s gratisläge och ordet "pass" syns inte.

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

vi.mock('@/lib/analytics/events', () => ({ capture: vi.fn() }));

import { capture } from '@/lib/analytics/events';
import IdagVy from '../IdagVy';
import { fixturTester, fixturUnderlag } from '@/lib/tester/v4/fixturer';
import { GRATISRAD, GRUND_GRATISRAD } from '@/lib/tester/v4/copy';
import { dagkortVariant, dagsmalText, gratisLage, hintMal, idagRubrik, typerAttVisa, veckaV4 } from '@/lib/mobilapp/idag';
import type { TesterV4Data } from '@/lib/tester/v4/typer';

beforeEach(() => {
  vi.mocked(capture).mockClear();
  try {
    window.localStorage.clear();
  } catch {
    /* jsdom */
  }
});

const vy = (data: TesterV4Data, aktiva = fixturUnderlag('b', 'premium').aktivaDagar) =>
  render(<IdagVy data={data} aktivaDagar={aktiva} dag="Torsdag 19 november" initial="CK" />);

describe('IdagVy (v4)', () => {
  it('Premium med plan: hint 1 som dagkort, nedräkning, dagsmål, Så ligger du till och Fortsätt', () => {
    const data = fixturTester('b', 'premium');
    const { container } = vy(data);
    const kort = container.querySelector('.tk-dagkort')!;
    expect(kort.textContent).toContain(data.hintar[0].rubrik);
    expect(kort.querySelector('a')!.getAttribute('href')).toBe(hintMal(data.hintar[0]));
    expect(container.querySelector('h1')!.textContent).toBe(idagRubrik(data.plan));
    expect(container.querySelector('[data-dagsmal]')!.textContent).toBe(dagsmalText(data.dagsmal));
    const typer = container.querySelectorAll('[data-sa-ligger] [data-typ]');
    expect(typer.length).toBe(typerAttVisa(data.typer, data.plan).length);
    // Nivån som band med taket i det tillgängliga namnet.
    expect(container.querySelector('[data-sa-ligger] svg[data-status="matt"]')!.getAttribute('aria-label')).toMatch(/tak i dag 7,5/);
    expect(container.querySelector('[data-fortsatt]')).not.toBeNull();
    expect(container.querySelector('[data-gratis]')).toBeNull();
    expect(container.textContent).not.toMatch(/\bpass(et|en)?\b/i);
    expect(container.textContent).not.toContain('—');
  });

  it('hint_visad och hint_klickad går med plattform app', () => {
    const data = fixturTester('b', 'premium');
    const { container } = vy(data);
    const visade = vi.mocked(capture).mock.calls.filter((c) => c[0] === 'hint_visad');
    expect(visade.length).toBeGreaterThan(0);
    expect(visade.every((c) => (c[1] as { plattform: string }).plattform === 'app')).toBe(true);
    fireEvent.click(container.querySelector('.tk-dagkort a')!);
    const klick = vi.mocked(capture).mock.calls.find((c) => c[0] === 'hint_klickad');
    expect(klick?.[1]).toMatchObject({ plattform: 'app', plats: 0, hint_id: data.hintar[0].id });
  });

  it('gratis med kvoten kvar: raden om ett grundnivåtest om dagen', () => {
    const data = fixturTester('a', 'gratis');
    const { container } = vy(data, []);
    expect(gratisLage(data.gratis)).toBe('kvar');
    expect(container.querySelector('[data-gratis="kvar"]')!.textContent).toBe(GRUND_GRATISRAD);
  });

  it('gratis efter dagens test: Det här var grundnivån, priset ur v4 och kvot_slut_visad', () => {
    const data = fixturTester('a', 'gratis', { kvotAnvand: true });
    const { container } = vy(data, [data.idag]);
    const rad = container.querySelector('[data-gratis="gjord"]')!;
    expect(rad.textContent).toContain(GRATISRAD.rubrikSlut);
    expect(rad.textContent).toContain(data.gratis.pris.prisrad);
    expect(rad.querySelector('a')!.textContent).toBe(data.gratis.pris.knapp);
    expect(vi.mocked(capture).mock.calls.some((c) => c[0] === 'kvot_slut_visad' && (c[1] as { plattform: string }).plattform === 'app')).toBe(true);
    // Veckoraden: i dag gjord.
    expect(container.querySelector('.tk-vecka .idag')).not.toBeNull();
  });
});

describe('idag.ts', () => {
  it('rubriken: nedräkning, provdagen och utan plan', () => {
    const plan = fixturTester('b', 'premium').plan!;
    expect(idagRubrik(null)).toBe('Idag');
    expect(idagRubrik({ ...plan, dagarKvar: 7 })).toBe(`7 dagar till ${plan.namn}`);
    expect(idagRubrik({ ...plan, dagarKvar: 1 })).toBe(`1 dag till ${plan.namn}`);
    expect(idagRubrik({ ...plan, dagarKvar: 0 })).toBe('Provet är i dag');
    expect(idagRubrik({ ...plan, dagarKvar: null, provdatum: null })).toBe(plan.namn);
  });
  it('dagkortet blir natt två dagar före provet', () => {
    const d = fixturTester('b', 'premium');
    expect(dagkortVariant({ ...d.plan!, dagarKvar: 2 }, d.hintar[0])).toBe('natt');
    expect(dagkortVariant({ ...d.plan!, dagarKvar: 12 }, { ...d.hintar[0], typ: 'tempo' })).toBe('koppar');
    expect(dagkortVariant(null, null)).toBe('vit');
  });
  it('veckoraden räknar aldrig missar', () => {
    const v = veckaV4('2026-11-19', ['2026-11-16', '2026-11-19']);
    expect(v.map((d) => d.status)).toEqual(['gjord', 'kvar', 'kvar', 'gjord', 'kvar', 'kvar', 'kvar']);
    expect(v[3].idag).toBe(true);
    expect(v.some((d) => d.status === 'missad')).toBe(false);
  });
  it('dagsmålet och dagarna i rad', () => {
    expect(dagsmalText({ mal: 2, gjortIdag: 1, dagarIRad: 4 })).toBe('Dagsmål 1 av 2 i dag. Fyra dagar i rad.');
    expect(dagsmalText({ mal: null, gjortIdag: 0, dagarIRad: 1 })).toBe('En dag i rad.');
    expect(dagsmalText({ mal: null, gjortIdag: 0, dagarIRad: 0 })).toMatch(/^Dagarna i rad börjar/);
  });
});
