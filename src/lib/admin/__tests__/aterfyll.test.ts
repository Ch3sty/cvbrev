import { describe, it, expect } from 'vitest';
import {
  gscLuckor,
  funnelLuckor,
  dagBakat,
  ATERFYLL_GSC_MAX,
  ATERFYLL_FUNNEL_MAX,
} from '../collect';

/**
 * Aterfyllningen finns for att admin_gsc_daily stod still pa 2026-09-12 och
 * gsc_clicks var null 13 till 20 september: Vercel saknade GSC-nycklarna, och
 * nattkorningen samlar bara gardagen. Nycklarna kunde alltsa laggas tillbaka
 * utan att en enda av de atta dagarna nagonsin fylldes.
 */

const IDAG = '2026-09-21';

describe('dagBakat', () => {
  it('flyttar bakat over en manadsgrans', () => {
    expect(dagBakat('2026-09-02', 5)).toBe('2026-08-28');
  });

  it('flyttar framat med ett negativt antal', () => {
    expect(dagBakat('2026-08-31', -1)).toBe('2026-09-01');
  });
});

describe('gscLuckor', () => {
  it('hittar dagarna som saknar klick, aldst forst', () => {
    // Rader finns till och med 12 sep, sedan null.
    const rader = [
      { dag: '2026-09-12', gsc_clicks: 288 },
      { dag: '2026-09-13', gsc_clicks: null },
      { dag: '2026-09-14', gsc_clicks: null },
      { dag: '2026-09-15', gsc_clicks: null },
    ];
    // Aldst forst: luckan langst bak ar den som annars aldrig hinns med.
    const luckor = gscLuckor(rader, IDAG, 100);
    expect(luckor[0]).toBe(dagBakat(IDAG, 30));
    expect(luckor).toContain('2026-09-13');
    expect(luckor).not.toContain('2026-09-12');
  });

  it('tar de aldsta luckorna forst nar de ar fler an taket', () => {
    // Fem per korning, och de fem aldsta. En nyare lucka fylls i nasta natt.
    const rader = [{ dag: '2026-09-13', gsc_clicks: null }];
    const luckor = gscLuckor(rader, IDAG);
    expect(luckor).toHaveLength(ATERFYLL_GSC_MAX);
    expect(luckor[0]).toBe(dagBakat(IDAG, 30));
    expect(luckor).not.toContain('2026-09-13');
  });

  it('tar hogst fem dagar per korning', () => {
    expect(gscLuckor([], IDAG)).toHaveLength(ATERFYLL_GSC_MAX);
  });

  it('hoppar over de tre senaste dygnen, som GSC annu inte hunnit leverera', () => {
    const luckor = gscLuckor([], IDAG, 100);
    expect(luckor).not.toContain('2026-09-21');
    expect(luckor).not.toContain('2026-09-20');
    expect(luckor).not.toContain('2026-09-19');
    expect(luckor).toContain('2026-09-18');
  });

  it('ger inga luckor nar varje dag i fonstret har klick', () => {
    const rader = [];
    for (let i = 0; i <= 30; i++) {
      rader.push({ dag: dagBakat(IDAG, i), gsc_clicks: 100 });
    }
    expect(gscLuckor(rader, IDAG)).toEqual([]);
  });

  it('raknar noll klick som data, inte som lucka', () => {
    // En dag med noll klick ar en matning. Skulle den raknas som lucka hade
    // aterfyllningen fragat om den varje natt utan att nagot forandrades.
    const rader = [];
    for (let i = 0; i <= 30; i++) {
      rader.push({ dag: dagBakat(IDAG, i), gsc_clicks: 0 });
    }
    expect(gscLuckor(rader, IDAG)).toEqual([]);
  });

  it('gar inte langre bak an trettio dagar', () => {
    const luckor = gscLuckor([], IDAG, 100);
    expect(luckor.every((d) => d >= dagBakat(IDAG, 30))).toBe(true);
  });
});

describe('funnelLuckor', () => {
  it('hittar veckor som saknas helt', () => {
    const luckor = funnelLuckor([], IDAG, 100);
    expect(luckor).toHaveLength(8);
    // Aldst forst.
    expect(luckor[0] < luckor[luckor.length - 1]).toBe(true);
  });

  it('tar hogst tva veckor per korning', () => {
    expect(funnelLuckor([], IDAG)).toHaveLength(ATERFYLL_FUNNEL_MAX);
  });

  it('hoppar over veckor som redan finns', () => {
    const alla = funnelLuckor([], IDAG, 100);
    const utan = funnelLuckor(
      alla.slice(0, 2).map((v) => ({ vecka: v })),
      IDAG,
      100
    );
    expect(utan).toHaveLength(6);
    expect(utan).not.toContain(alla[0]);
  });

  it('raknar inte innevarande vecka som lucka', () => {
    // Den fylls anda av dagens insamling.
    const luckor = funnelLuckor([], IDAG, 100);
    expect(luckor).not.toContain('2026-09-21'); // mandag denna vecka
  });
});
