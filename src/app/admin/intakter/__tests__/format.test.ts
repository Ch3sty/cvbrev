/**
 * Tester for Intakters formatering och planstegsidentifiering.
 *
 * MRR-normaliseringen per intervall (manadsbeloppOre) tacks redan av
 * src/lib/admin/__tests__/collect.test.ts fran vag 1, med atta fall for
 * manad, kvartal, ar, halvar, vecka, platser, engangskop och saknat belopp.
 * Den upprepas darfor inte har. Det som ar nytt pa den har sidan, och alltsa
 * otestat fore de har raderna, ar tva saker:
 *
 * 1. Vilket produktsteg ett Stripe-pris hor till. Priset 299 kr har
 *    recurring.interval month trots att prisstegen sager kvartal, sa en
 *    identifiering pa intervall lagger kvartalskunderna under Manad och
 *    fordelningen blir fel.
 * 2. Att ett tomt varde blir tankstreck och inte noll. En lucka som ritas som
 *    en nolla ser ut som ett ras.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  kronor,
  kronorExakt,
  antal,
  procent,
  forandring,
  deltaText,
  mandagen,
  veckonummer,
  churnorsak,
  planstegFranPris,
} from '../format';

describe('kronor', () => {
  it('raknar ore till kronor', () => {
    expect(kronor(59_900)).toBe('599 kr');
  });

  it('ger tankstreck for null, aldrig noll kronor', () => {
    expect(kronor(null)).toBe('–');
    expect(kronor(undefined)).toBe('–');
  });

  it('later noll vara noll', () => {
    expect(kronor(0)).toBe('0 kr');
  });

  it('avrundar till hela kronor', () => {
    expect(kronor(9_967)).toBe('100 kr');
  });
});

describe('kronorExakt', () => {
  it('behaller decimaler nar de finns', () => {
    expect(kronorExakt(9_967)).toBe('99,67 kr');
  });

  it('skriver jamna belopp utan decimaler', () => {
    expect(kronorExakt(59_900)).toBe('599 kr');
  });

  it('ger tankstreck for null', () => {
    expect(kronorExakt(null)).toBe('–');
  });
});

describe('antal', () => {
  it('ger tankstreck for null, inte noll', () => {
    expect(antal(null)).toBe('–');
    expect(antal(0)).toBe('0');
  });
});

describe('procent', () => {
  it('skriver en andel som procent', () => {
    expect(procent(0.25)).toBe('25 %');
  });

  it('avrundar till en decimal', () => {
    expect(procent(0.1234)).toBe('12,3 %');
  });

  it('ger tankstreck for null', () => {
    expect(procent(null)).toBe('–');
  });
});

describe('forandring', () => {
  it('raknar procentuell forandring', () => {
    expect(forandring(120, 100)).toBeCloseTo(0.2);
    expect(forandring(80, 100)).toBeCloseTo(-0.2);
  });

  it('ger null nar namnaren ar noll i stallet for Infinity', () => {
    expect(forandring(5, 0)).toBeNull();
  });

  it('ger null nar nagot varde saknas', () => {
    expect(forandring(null, 100)).toBeNull();
    expect(forandring(100, null)).toBeNull();
  });
});

describe('deltaText', () => {
  it('skriver beloppet utan tecken, fargen bar riktningen', () => {
    expect(deltaText(-0.2)).toBe('20 %');
    expect(deltaText(0.2)).toBe('20 %');
  });

  it('ger undefined for null sa kortet utelamnar raden', () => {
    expect(deltaText(null)).toBeUndefined();
  });
});

describe('mandagen', () => {
  it('ger samma dag for en mandag', () => {
    expect(mandagen('2026-09-14')).toBe('2026-09-14');
  });

  it('gar bakat till mandagen for en sondag', () => {
    expect(mandagen('2026-09-13')).toBe('2026-09-07');
  });

  it('ger samma mandag for alla dagar i veckan', () => {
    const dagar = [
      '2026-09-14',
      '2026-09-15',
      '2026-09-16',
      '2026-09-17',
      '2026-09-18',
      '2026-09-19',
      '2026-09-20',
    ];
    for (const d of dagar) {
      expect(mandagen(d)).toBe('2026-09-14');
    }
  });
});

describe('veckonummer', () => {
  it('ger ISO-vecka', () => {
    expect(veckonummer('2026-01-05')).toBe(2);
  });

  it('later alla dagar i en vecka ge samma nummer', () => {
    expect(veckonummer('2026-09-14')).toBe(veckonummer('2026-09-20'));
  });
});

describe('churnorsak', () => {
  it('oversatter de fyra kanda orsakerna', () => {
    expect(churnorsak('for_dyrt')).toBe('För dyrt');
    expect(churnorsak('fick_jobb')).toBe('Fick jobb');
    expect(churnorsak('anvander_inte')).toBe('Använder det inte');
    expect(churnorsak('saknar_funktion')).toBe('Saknar en funktion');
  });

  it('visar en okand nyckel ran i stallet for att tappa raden', () => {
    expect(churnorsak('nytt_skal')).toBe('nytt_skal');
  });

  it('sager ifran nar orsak saknas helt', () => {
    expect(churnorsak(null)).toBe('Ingen orsak angiven');
  });
});

describe('planstegFranPris', () => {
  const sparat = { ...process.env };

  beforeEach(() => {
    process.env.STRIPE_PRICE_DAYPASS = 'price_dag';
    process.env.STRIPE_PRICE_WEEK = 'price_vecka';
    process.env.STRIPE_PRICE_QUARTER = 'price_kvartal';
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID = 'price_manad';
  });

  afterEach(() => {
    process.env = { ...sparat };
  });

  it('kanner igen varje steg pa price id', () => {
    expect(planstegFranPris('price_dag', null, null, true)).toBe('daypass');
    expect(planstegFranPris('price_vecka', 'week', 1)).toBe('week');
    expect(planstegFranPris('price_manad', 'month', 1)).toBe('month');
    expect(planstegFranPris('price_kvartal', 'month', 1)).toBe('quarter');
  });

  it('later price id sla intervallet for kvartalspriset', () => {
    // Det har ar hela poangen med funktionen. Kvartalspriset 299 kr har
    // recurring.interval month i Stripe. En identifiering pa intervall hade
    // gett month och lagt kvartalskunderna i fel rad.
    expect(planstegFranPris('price_kvartal', 'month', 1)).toBe('quarter');
  });

  it('faller tillbaka pa intervallet for ett okant pris', () => {
    expect(planstegFranPris('price_okant', 'month', 1)).toBe('month');
    expect(planstegFranPris('price_okant', 'month', 3)).toBe('quarter');
    expect(planstegFranPris('price_okant', 'week', 1)).toBe('week');
    expect(planstegFranPris('price_okant', 'day', 1)).toBe('daypass');
    expect(planstegFranPris('price_okant', 'year', 1)).toBe('quarter');
  });

  it('raknar ett engangskop utan intervall som dagspass', () => {
    expect(planstegFranPris('price_okant', null, null, true)).toBe('daypass');
  });

  it('ger ovrigt for ett intervall Stripe inte har', () => {
    expect(planstegFranPris('price_okant', 'fortnight', 1)).toBe('ovrigt');
  });
});
