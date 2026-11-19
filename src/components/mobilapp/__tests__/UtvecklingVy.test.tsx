import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { fixturUtveckling } from '@/lib/tester/v4/fixturer';
import { tomStart, typRader } from '@/lib/mobilapp/utveckling';
import UtvecklingVy from '../UtvecklingVy';

function rita(lage: 'a' | 'b' | 'c', niva: 'gratis' | 'premium', typ: Parameters<typeof typRader>[1], over: Partial<ReturnType<typeof fixturUtveckling>> = {}) {
  const data = { ...fixturUtveckling(lage, niva), ...over };
  return render(
    <UtvecklingVy data={data} typ={typ} rader={typRader(data, typ)} tom={tomStart(data)} marken={new Set(['forsta_matningen'])} initial="CK" />,
  );
}

describe('appens UtvecklingVy på v4', () => {
  it('tomläget bara utan punkter, med rätt knapp och utan pris för gratis', () => {
    const d = fixturUtveckling('a', 'gratis');
    const { container } = rita('a', 'gratis', null, {
      punkter: [],
      gratis: { ...d.gratis, nivakollGjord: {} },
      typer: d.typer.map((t) => ({ ...t, niva: { ...t.niva, status: 'omatt' as const, niva: null } })),
    });
    expect(container.querySelector('[data-tomt="nivakoll"]')).not.toBeNull();
    const knapp = screen.getByRole('link', { name: 'Gör Nivåkollen' });
    expect(knapp.getAttribute('href')).toBe('/dashboard/tester/pass?typ=matning');
    expect(container.textContent).not.toMatch(/\bpass\b/i);
  });

  it('Premium: kurvan med ring, punkt och fyrkant, mönstren och tempot', () => {
    const { container } = rita('b', 'premium', 'matris');
    const kurva = container.querySelector('svg.tk-kurva')!;
    expect(kurva.querySelector('[data-form="ring"]')).not.toBeNull();
    expect(kurva.querySelector('[data-form="punkt"]')).not.toBeNull();
    expect(kurva.querySelector('[data-form="fyrkant"]')).not.toBeNull();
    expect(kurva.getAttribute('viewBox')).toBe('0 0 380 262');
    expect(screen.getByText('dag 4 av 10')).toBeTruthy();
    expect(container.querySelector('[data-sektion="monster"] a')).not.toBeNull();
    expect(screen.getByRole('region', { name: 'Tempo' }).textContent).toContain('4 av 20 över provets tid');
    expect(container.textContent).not.toContain('Hela historiken ingår i Premium');
  });

  it('gratis: en punkt, låset på historiken och mönstren som bild', () => {
    const { container } = rita('a', 'gratis', 'matris');
    expect(container.querySelectorAll('svg.tk-kurva [data-form]')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /Hela historiken ingår i Premium/ }).getAttribute('href')).toBe('/priser');
    expect(container.querySelector('[data-sektion="monster"] li a')).toBeNull();
  });

  it('raderna väljer typen med ?typ=, märkena följer setet', () => {
    const { container } = rita('a', 'premium', 'deduktiv');
    const nivaer = within(screen.getByRole('region', { name: 'Nivå per testtyp' }));
    expect(nivaer.getByRole('link', { name: /Deduktiv slutledning/ }).getAttribute('aria-current')).toBe('true');
    expect(nivaer.getByRole('link', { name: /Figurer och mönster/ }).getAttribute('href')).toBe('?typ=matris');
    expect(container.querySelector('[data-sektion="monster"]')).toBeNull();
    expect(container.querySelector('[data-marke="forsta_matningen"]')?.className).toBe('nadd');
    expect(container.querySelector('[data-marke="nivan_upp"]')?.className).toBe('');
  });
});
