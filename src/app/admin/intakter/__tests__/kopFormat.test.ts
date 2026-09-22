import { describe, it, expect } from 'vitest';
import type { KopRad } from '@/lib/admin/kop';
import {
  summeraKop,
  kopIFonster,
  kopTypText,
  senasteNyFore,
  senasteAv,
  intaktPerDag,
  uppraknat,
} from '../kopFormat';
import { MRR_SANN_FRAN } from '../format';
import { MATSTART } from '@/lib/admin/tomt';

// Köpliggaren är svaret på ägarens klagomål: "det framgår ingenstans att
// någon köpt ett dagspass". Felen som kostar är att interna köp räknas, att
// en försäljning hamnar på fel svensk dag, och att dagar utan intäkt ritas
// som nollor så att en ensam försäljning ser ut som ett helt diagram.

function kop(varden: Partial<KopRad> = {}): KopRad {
  return {
    id: 'ch_1',
    tid: '2026-09-22T12:14:00Z',
    paket: 'all_day',
    paketNamn: 'Allt-dagen',
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

const manad = (id: string, tid: string) =>
  kop({ id, tid, typ: 'lopande', ny: false, paket: 'all_month', paketNamn: 'Allt-månaden', beloppOre: 14900 });

// 22 sep 2026 21.00 svensk tid.
const NU = Date.parse('2026-09-22T19:00:00Z');

const RADER = [
  kop(),
  manad('ch_2', '2026-09-09T20:26:00Z'),
  manad('ch_3', '2026-09-02T11:31:00Z'),
  manad('ch_4', '2026-08-31T14:37:00Z'),
  kop({ id: 'ch_int', internt: true, tid: '2026-09-22T10:00:00Z' }),
  kop({ id: 'ch_gammal', tid: '2026-06-25T10:00:00Z', typ: 'lopande', paketNamn: 'Allt-månaden', beloppOre: 14900 }),
];

describe('summeraKop och kopIFonster', () => {
  it('räknar spec-exemplet: 496 kr, varav 447 löpande och 49 engångs', () => {
    const f = kopIFonster(RADER, 30, NU);
    expect(f.summa.totaltOre).toBe(49600);
    expect(f.summa.lopandeOre).toBe(44700);
    expect(f.summa.engangsOre).toBe(4900);
    expect(f.summa.antalLopande).toBe(3);
    expect(f.summa.antalEngangs).toBe(1);
    expect(f.summa.nyaBetalande).toBe(1);
  });

  it('räknar interna rader separat och aldrig i summan', () => {
    const f = kopIFonster(RADER, 30, NU);
    expect(f.interna).toBe(1);
    expect(f.rader.some((r) => r.internt)).toBe(true);
  });

  it('drar av återbetalningar', () => {
    const s = summeraKop([kop(), kop({ id: 're_1', aterbetalning: true, beloppOre: -4900, ny: false })]);
    expect(s.totaltOre).toBe(0);
    expect(s.aterbetaltOre).toBe(4900);
    expect(s.antalEngangs).toBe(1);
  });

  it('lägger raderna nyast först', () => {
    const f = kopIFonster(RADER, 30, NU);
    expect(f.rader[0].id).toBe('ch_1');
  });
});

describe('kopTypText', () => {
  it('skriver de tre typerna i specen', () => {
    expect(kopTypText(kop())).toBe('Ny · engångs');
    expect(kopTypText(manad('x', '2026-09-09T00:00:00Z'))).toBe('Förnyelse · löpande');
    expect(kopTypText(kop({ aterbetalning: true }))).toBe('Återbetalning');
  });

  it('kallar ett upprepat engångsköp för återkommande, inte förnyelse', () => {
    expect(kopTypText(kop({ ny: false }))).toBe('Återkommande · engångs');
  });
});

describe('senasteNyFore och senasteAv', () => {
  it('hittar senaste nya betalande före fönstret', () => {
    const f = kopIFonster(RADER, 30, NU);
    expect(senasteNyFore(RADER, f.franMs)?.id).toBe('ch_gammal');
  });

  it('ger null när ingen ny betalande finns före fönstret', () => {
    expect(senasteNyFore([kop()], NU - 30 * 86400000)).toBeNull();
  });

  it('hoppar över interna rader för senaste engångsköpet', () => {
    expect(senasteAv(RADER, 'engangs')?.id).toBe('ch_1');
  });
});

describe('intaktPerDag', () => {
  it('ger en rad per dag i fönstret, äldst först, sista är i dag', () => {
    const d = intaktPerDag(RADER, 30, NU);
    expect(d).toHaveLength(30);
    expect(d[0].dag).toBe('2026-08-24');
    expect(d[29].dag).toBe('2026-09-22');
  });

  it('grupperar på svensk dag', () => {
    // 22.26 UTC 9 sep är 00.26 svensk tid 10 sep.
    const d = intaktPerDag([manad('x', '2026-09-09T22:26:00Z')], 30, NU);
    expect(d.find((r) => r.dag === '2026-09-10')?.lopande).toBe(14900);
    expect(d.find((r) => r.dag === '2026-09-09')?.lopande).toBeNull();
  });

  it('staplar löpande och engångs var för sig och hoppar över interna', () => {
    const d = intaktPerDag(RADER, 30, NU);
    const idag = d[29];
    expect(idag.engangs).toBe(4900);
    expect(idag.lopande).toBeNull();
  });

  it('ger null, inte noll, en dag utan intäkt', () => {
    const d = intaktPerDag(RADER, 30, NU);
    const medData = d.filter((r) => r.lopande !== null || r.engangs !== null);
    expect(medData).toHaveLength(4);
    expect(d[1].lopande).toBeNull();
    expect(d[1].engangs).toBeNull();
  });
});

describe('uppraknat', () => {
  it('skriver "A, B och C"', () => {
    expect(uppraknat(['CV-veckan', 'Testveckan', 'Allt-veckan'])).toBe(
      'CV-veckan, Testveckan och Allt-veckan'
    );
    expect(uppraknat(['A'])).toBe('A');
    expect(uppraknat([])).toBe('');
  });
});

describe('MRR_SANN_FRAN', () => {
  it('är samma konstant som Översikt använder', () => {
    expect(MRR_SANN_FRAN).toBe(MATSTART.mrr);
  });
});
