import { describe, it, expect } from 'vitest';
import type { KopRad } from '@/lib/admin/kop';
import type { DagligaMetrik } from '@/lib/admin/collect';
import {
  svenskDag,
  svenskMidnatt,
  sorteraHandelser,
  tidEtikett,
  kopHandelser,
  senasteKop,
  tomListaText,
  provperiodHandelse,
  kontoHandelse,
  sparHandelser,
  uppsagningHandelser,
  felHandelse,
  mrrPaketText,
  gscVecka,
  type Handelse,
} from '../sedanIgar';
import { oppnandegrad } from '../data';

// "Sedan i går" ska svara på morgonfrågan på fem sekunder. Det som kostar
// om det blir fel: ordningen (nyast först, köp inflätade bland resten),
// etiketten (klockslag i dag, "i går" före klockslaget annars) och att
// interna köp aldrig syns här.

function kop(varden: Partial<KopRad> = {}): KopRad {
  return {
    id: 'ch_1',
    tid: '2026-09-22T12:14:00Z',
    paket: 'all_day',
    paketNamn: 'Dagspasset',
    beloppOre: 4900,
    typ: 'engangs',
    ny: true,
    aterbetalning: false,
    userId: '580ee411-aaaa-bbbb-cccc-000000000000',
    email: null,
    betalsatt: 'Klarna',
    internt: false,
    ...varden,
  };
}

// 22 sep 2026 21.00 svensk tid (sommartid, UTC+2).
const NU = new Date('2026-09-22T19:00:00Z');

describe('svenskDag och svenskMidnatt', () => {
  it('ger den svenska dagen, inte UTC-dagen', () => {
    // 23.30 UTC 22 sep är 01.30 svensk tid 23 sep.
    expect(svenskDag('2026-09-22T23:30:00Z')).toBe('2026-09-23');
  });

  it('ger midnatt svensk tid på sommartid', () => {
    expect(svenskMidnatt(NU).toISOString()).toBe('2026-09-21T22:00:00.000Z');
  });

  it('ger midnatt svensk tid på vintertid', () => {
    expect(svenskMidnatt(new Date('2026-11-10T12:00:00Z')).toISOString()).toBe(
      '2026-11-09T23:00:00.000Z'
    );
  });
});

describe('sorteraHandelser', () => {
  const h = (id: string, tid: string, heldag = false): Handelse => ({
    id,
    typ: 'fel',
    tid,
    heldag,
    text: id,
  });

  it('lägger nyast först', () => {
    const ut = sorteraHandelser([
      h('a', '2026-09-22T03:00:00Z'),
      h('b', '2026-09-22T12:14:00Z'),
      h('c', '2026-09-21T20:00:00Z'),
    ]);
    expect(ut.map((x) => x.id)).toEqual(['b', 'a', 'c']);
  });

  it('flätar in köpen bland Supabase-händelserna', () => {
    const ut = sorteraHandelser([
      h('konton', '2026-09-22T15:00:00Z', true),
      h('provperiod', '2026-09-22T03:00:00Z'),
      ...kopHandelser([kop()], NU.getTime() - 86400000),
    ]);
    expect(ut.map((x) => x.id)).toEqual(['konton', 'ch_1', 'provperiod']);
  });

  it('behåller ordningen mellan lika tider', () => {
    const ut = sorteraHandelser([h('x', '2026-09-22T10:00:00Z'), h('y', '2026-09-22T10:00:00Z')]);
    expect(ut.map((x) => x.id)).toEqual(['x', 'y']);
  });

  it('ändrar inte listan den fick', () => {
    const in_ = [h('a', '2026-09-21T10:00:00Z'), h('b', '2026-09-22T10:00:00Z')];
    sorteraHandelser(in_);
    expect(in_.map((x) => x.id)).toEqual(['a', 'b']);
  });
});

describe('tidEtikett', () => {
  it('skriver klockslaget för en händelse i dag', () => {
    const h = kopHandelser([kop()], 0)[0];
    expect(tidEtikett(h, NU)).toBe('14.14');
  });

  it('skriver "i går" före klockslaget för en händelse i går', () => {
    const h = kopHandelser([kop({ tid: '2026-09-21T20:30:00Z' })], 0)[0];
    expect(tidEtikett(h, NU)).toBe('i går 22.30');
  });

  it('skriver "i dag" eller "i går" för en heldagshändelse', () => {
    const idag: Handelse = { id: 'k', typ: 'konton', tid: '2026-09-22T15:00:00Z', heldag: true, dag: '2026-09-22', text: '' };
    const igar: Handelse = { ...idag, dag: '2026-09-21' };
    expect(tidEtikett(idag, NU)).toBe('i dag');
    expect(tidEtikett(igar, NU)).toBe('i går');
  });
});

describe('kopHandelser', () => {
  it('skriver paket, kort konto-id och ny kund', () => {
    const [h] = kopHandelser([kop()], 0);
    expect(h.text).toBe('Köp: Dagspasset, konto 580ee411, ny kund');
    expect(h.beloppOre).toBe(4900);
  });

  it('kallar en löpande betalning som inte är ny för förnyelse', () => {
    const [h] = kopHandelser([kop({ typ: 'lopande', ny: false, paketNamn: 'Hela paketet, en månad' })], 0);
    expect(h.text).toContain('förnyelse');
  });

  it('visar aldrig interna köp', () => {
    expect(kopHandelser([kop({ internt: true })], 0)).toEqual([]);
  });

  it('tar bara med köp inom dygnet', () => {
    const fran = NU.getTime() - 86400000;
    expect(kopHandelser([kop({ tid: '2026-09-20T10:00:00Z' })], fran)).toEqual([]);
  });

  it('skriver återbetalningar som egen rad med minusbelopp', () => {
    const [h] = kopHandelser([kop({ aterbetalning: true, beloppOre: -4900 })], 0);
    expect(h.text.startsWith('Återbetalning')).toBe(true);
    expect(h.beloppOre).toBe(-4900);
  });
});

describe('senasteKop och tomListaText', () => {
  it('hoppar över interna köp och återbetalningar', () => {
    const r = senasteKop([
      kop({ id: 'a', tid: '2026-09-10T10:00:00Z' }),
      kop({ id: 'b', tid: '2026-09-20T10:00:00Z', internt: true }),
      kop({ id: 'c', tid: '2026-09-21T10:00:00Z', aterbetalning: true }),
    ]);
    expect(r?.id).toBe('a');
  });

  it('säger sedan när, med gårdagens klockslag', () => {
    expect(tomListaText(NU)).toBe('Inget hänt sedan i går kl. 21.00.');
  });
});

describe('händelserna ur Supabase', () => {
  it('slår ihop utgångna provperioder till en rad på senaste tiden', () => {
    const h = provperiodHandelse(['2026-09-22T03:00:00Z', '2026-09-22T05:00:00Z']);
    expect(h?.text).toBe('2 provperioder gick ut utan köp');
    expect(h?.tid).toBe('2026-09-22T05:00:00Z');
    expect(provperiodHandelse([])).toBeNull();
  });

  it('räknar nya konton som en heldagshändelse', () => {
    const h = kontoHandelse(['2026-09-22T08:00:00Z', '2026-09-22T15:00:00Z'], '2026-09-22');
    expect(h?.text).toBe('2 nya konton');
    expect(h?.heldag).toBe(true);
    expect(kontoHandelse(['2026-09-22T08:00:00Z'], '2026-09-22')?.text).toBe('1 nytt konto');
  });

  it('skriver spårvalen med uppdelning per spår', () => {
    const [h] = sparHandelser([
      { dag: '2026-09-22', dimension: '', personer: 2, uppdaterad: '2026-09-22T17:48:00Z' },
      { dag: '2026-09-22', dimension: 'cv', personer: 1, uppdaterad: '2026-09-22T17:48:00Z' },
      { dag: '2026-09-22', dimension: 'allt', personer: 1, uppdaterad: '2026-09-22T17:48:00Z' },
    ]);
    expect(h.text).toBe('2 personer valde spår (1 CV, 1 Hela paketet)');
  });

  it('tar bara i dag och i går för uppsägningar, och hoppar över nollor', () => {
    const ut = uppsagningHandelser(
      [
        { dag: '2026-09-22', churned: 1 },
        { dag: '2026-09-21', churned: 0 },
        { dag: '2026-09-20', churned: 3 },
      ],
      '2026-09-22'
    );
    expect(ut.map((h) => h.text)).toEqual(['1 uppsägning i Stripe']);
  });

  it('slår ihop felen till en rad med senaste källan', () => {
    const h = felHandelse([
      { kalla: 'cron', created_at: '2026-09-22T01:00:00Z' },
      { kalla: 'route', created_at: '2026-09-22T09:00:00Z' },
    ]);
    expect(h?.text).toBe('2 fel i loggen, senast från route');
    expect(felHandelse([])).toBeNull();
  });
});

describe('mrrPaketText', () => {
  const rad = (v: Partial<DagligaMetrik>) => ({ dag: '2026-09-22', ...v }) as DagligaMetrik;

  it('skriver antal gånger paket och pris', () => {
    expect(mrrPaketText(rad({ active_all_month: 3 }))).toBe('3 × Hela paketet, en månad 149 kr');
  });

  it('lämnar Dagspasset utanför, den har ingen MRR', () => {
    expect(mrrPaketText(rad({ active_all_month: 3, active_all_day: 1 }))).toBe(
      '3 × Hela paketet, en månad 149 kr'
    );
  });

  it('säger det när ingen betalar löpande', () => {
    expect(mrrPaketText(rad({}))).toBe('inga löpande kunder');
    expect(mrrPaketText(null)).toBe('inga löpande kunder');
  });
});

describe('gscVecka', () => {
  it('jämför sju dagar med data mot sju dagar med data, inte kalenderdagar', () => {
    const rader = [
      { dag: '2026-09-22', gsc_clicks: null },
      { dag: '2026-09-21', gsc_clicks: null },
      { dag: '2026-09-20', gsc_clicks: null },
      ...Array.from({ length: 14 }, (_, i) => ({
        dag: `2026-09-${String(19 - i).padStart(2, '0')}`,
        gsc_clicks: i < 7 ? 20 : 10,
      })),
    ];
    const g = gscVecka(rader);
    expect(g.klick).toBe(140);
    expect(g.fore).toBe(70);
    expect(g.fran).toBe('2026-09-13');
    expect(g.till).toBe('2026-09-19');
    expect(g.senasteDag).toBe('2026-09-19');
  });

  it('ger ingen jämförelse när veckan före inte har sju dagar', () => {
    const g = gscVecka([{ dag: '2026-09-19', gsc_clicks: 15 }]);
    expect(g.klick).toBe(15);
    expect(g.fore).toBeNull();
  });
});

describe('oppnandegrad', () => {
  it('passerar aldrig 100 procent', () => {
    expect(oppnandegrad(13, 15)).toBe(100);
  });

  it('ger null när inget skickats', () => {
    expect(oppnandegrad(0, 0)).toBeNull();
  });

  it('avrundar till en decimal', () => {
    expect(oppnandegrad(87, 64)).toBe(73.6);
  });
});
