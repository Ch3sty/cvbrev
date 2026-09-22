/**
 * Tester for filtret, paketetiketten och formateringen i Anvandare.
 *
 * Allt ar ren logik utan databas, och allt ar precis de stallen dar en tyst
 * bugg blir en lista som ser rimlig ut men visar fel personer. Filtret maste
 * tala skrap i adressen, paketetiketten maste halla isar betalande,
 * provperiod och utgangen provperiod, och undantagna konton far aldrig
 * hamna i en total.
 */

import { describe, it, expect } from 'vitest';
import {
  filterFranSok,
  sokFranFilter,
  lasKalla,
  tillampaGrupp,
  visaKalla,
  GRUPPER,
  STANDARDFILTER,
  type FiltrerbarFraga,
  type Grupp,
} from '../data';
import {
  datumEllerOrsak,
  gallerTill,
  kallaText,
  kortDatum,
  paketEtikett,
  sedan,
  statusText,
  tal,
  visningsnamn,
  type PaketUnderlag,
} from '../format';

const NU = Date.parse('2026-09-22T18:00:00Z');
const OM_EN_DAG = '2026-09-23T12:14:51Z';
const I_GAR = '2026-09-21T10:00:00Z';

function rad(over: Partial<PaketUnderlag> = {}): PaketUnderlag {
  return {
    undantag: null,
    subscription_status: null,
    premium_source: null,
    premium_scope: null,
    premium_until: null,
    planKey: null,
    ...over,
  };
}

describe('filterFranSok', () => {
  it('ger standardfiltret for tom sokstrang', () => {
    expect(filterFranSok({})).toEqual(STANDARDFILTER);
  });

  it('laser alla filtren ur sokparametrarna', () => {
    expect(
      filterFranSok({
        grupp: 'betalande',
        aktivitet: '7',
        harCv: '1',
        harBrev: '1',
        kalla: 'google',
        sok: '  anna  ',
        sortering: 'brev',
        riktning: 'asc',
        sida: '3',
      })
    ).toEqual({
      grupp: 'betalande',
      aktivitet: '7',
      harCv: true,
      harBrev: true,
      kalla: 'google',
      sok: 'anna',
      sortering: 'brev',
      riktning: 'asc',
      sida: 3,
    });
  });

  it('kanner igen alla sex grupperna', () => {
    for (const g of GRUPPER) {
      expect(filterFranSok({ grupp: g.nyckel }).grupp).toBe(g.nyckel);
    }
  });

  it('faller till standard for okanda varden, aven gamla niva-lankar', () => {
    const f = filterFranSok({
      grupp: 'guld',
      niva: 'premium',
      aktivitet: '400',
      sortering: 'drop table',
      riktning: 'sidledes',
      sida: '-2',
    });
    expect(f.grupp).toBe('alla');
    expect(f.aktivitet).toBe('alla');
    expect(f.sortering).toBe('senast_aktiv');
    expect(f.riktning).toBe('desc');
    expect(f.sida).toBe(1);
  });

  it('tar forsta vardet nar en parameter upprepas', () => {
    expect(filterFranSok({ grupp: ['gratis', 'betalande'] }).grupp).toBe('gratis');
  });

  it('kapar for langa fritexter', () => {
    const f = filterFranSok({ sok: 'a'.repeat(500) });
    expect(f.sok.length).toBe(80);
  });
});

describe('sokFranFilter', () => {
  it('skriver ingenting for standardfiltret', () => {
    expect(sokFranFilter(STANDARDFILTER)).toBe('');
  });

  it('gar fram och tillbaka utan att tappa nagot', () => {
    const start = {
      ...STANDARDFILTER,
      grupp: 'provperiod_slut' as const,
      aktivitet: '30' as const,
      harCv: true,
      kalla: 'linkedin',
      sok: 'anna',
      sortering: 'cv' as const,
      riktning: 'asc' as const,
      sida: 4,
    };
    const sok = sokFranFilter(start);
    const params = Object.fromEntries(new URLSearchParams(sok.slice(1)));
    expect(filterFranSok(params)).toEqual(start);
  });
});

describe('lasKalla', () => {
  it('laser en ren strang', () => {
    expect(lasKalla('google')).toBe('google');
  });

  it('laser source ur ett objekt', () => {
    expect(lasKalla({ source: 'linkedin', medium: 'cpc' })).toBe('linkedin');
  });

  it('faller tillbaka pa utm_source', () => {
    expect(lasKalla({ utm_source: 'nyhetsbrev' })).toBe('nyhetsbrev');
  });

  it('ger null for null, tomt och okanda former', () => {
    expect(lasKalla(null)).toBeNull();
    expect(lasKalla({})).toBeNull();
    expect(lasKalla({ okand: 'x' })).toBeNull();
  });
});

describe('visaKalla', () => {
  it('doljer kolumnen tills en tiondel har en kalla', () => {
    expect(visaKalla(1, 328)).toBe(false);
    expect(visaKalla(32, 328)).toBe(false);
    expect(visaKalla(33, 328)).toBe(true);
    expect(visaKalla(0, 0)).toBe(false);
  });
});

describe('paketEtikett', () => {
  it('kallar dagspasset Allt-dagen och betalande (gomer 22 sep)', () => {
    const e = paketEtikett(
      rad({ premium_source: 'onetime_1d', premium_until: OM_EN_DAG }),
      NU
    );
    expect(e).toMatchObject({ grupp: 'betalande', namn: 'Allt-dagen', lopande: false });
  });

  it('ett utgånget dagspass ar gratis', () => {
    const e = paketEtikett(rad({ premium_source: 'onetime_1d', premium_until: I_GAR }), NU);
    expect(e).toMatchObject({ grupp: 'gratis', namn: 'Gratis' });
  });

  it('namnger lopande prenumerationer ur priset', () => {
    expect(
      paketEtikett(rad({ subscription_status: 'active', planKey: 'all_month', premium_scope: 'allt' }), NU)
    ).toMatchObject({ grupp: 'betalande', namn: 'Allt-månaden', lopande: true });
    expect(
      paketEtikett(rad({ subscription_status: 'active', planKey: 'all_quarter' }), NU).namn
    ).toBe('Allt-kvartalet');
    expect(paketEtikett(rad({ subscription_status: 'past_due', planKey: 'all_week' }), NU).grupp).toBe(
      'betalande'
    );
  });

  it('faller tillbaka pa behorigheten nar priset ar okant', () => {
    expect(paketEtikett(rad({ subscription_status: 'active', premium_scope: 'cv' }), NU).namn).toBe(
      'CV-veckan'
    );
    expect(paketEtikett(rad({ subscription_status: 'active', premium_scope: 'tester' }), NU).namn).toBe(
      'Testveckan'
    );
    expect(paketEtikett(rad({ subscription_status: 'active', premium_scope: 'allt' }), NU).namn).toBe(
      'Allt, okänd längd'
    );
  });

  it('skiljer pagaende provperiod fran utgangen', () => {
    expect(
      paketEtikett(rad({ premium_source: 'signup_trial', premium_until: OM_EN_DAG }), NU)
    ).toMatchObject({ grupp: 'provperiod', namn: 'Provperiod' });
    expect(
      paketEtikett(rad({ premium_source: 'oauth_signup_trial', premium_until: I_GAR }), NU)
    ).toMatchObject({ grupp: 'provperiod_slut', namn: 'Provperiod slut' });
    // De tolv kontona som stod som Trial: kallan kvar, tiden slut.
    expect(
      paketEtikett(rad({ premium_source: 'signup_trial', premium_scope: 'allt', premium_until: I_GAR }), NU).grupp
    ).toBe('provperiod_slut');
  });

  it('en Stripe-trial ar provperiod', () => {
    expect(paketEtikett(rad({ subscription_status: 'trialing' }), NU).grupp).toBe('provperiod');
  });

  it('en betald prenumeration vinner over en gammal provperiodskalla', () => {
    expect(
      paketEtikett(rad({ subscription_status: 'active', premium_source: 'signup_trial', planKey: 'all_week' }), NU)
    ).toMatchObject({ grupp: 'betalande', namn: 'Allt-veckan' });
  });

  it('premium fran admin ar tilldelad, inte betalande', () => {
    expect(paketEtikett(rad({ premium_source: 'admin' }), NU)).toMatchObject({
      grupp: 'tilldelad',
      namn: 'Tilldelad av admin',
    });
    expect(paketEtikett(rad({ premium_source: 'admin', premium_until: I_GAR }), NU).grupp).toBe('gratis');
  });

  it('undantagna ar Admin eller Testkonto oavsett vad de har', () => {
    expect(
      paketEtikett(rad({ undantag: 'admin', subscription_status: 'active', premium_source: 'admin' }), NU)
    ).toMatchObject({ grupp: 'undantagen', namn: 'Admin', undantag: 'admin' });
    expect(
      paketEtikett(rad({ undantag: 'test', subscription_status: 'active', premium_scope: 'cv' }), NU)
    ).toMatchObject({ grupp: 'undantagen', namn: 'Testkonto', undantag: 'test' });
  });

  it('allt annat ar gratis, aven uppsagda', () => {
    expect(paketEtikett(rad({ subscription_status: 'canceled' }), NU).namn).toBe('Gratis');
    expect(paketEtikett(rad(), NU).namn).toBe('Gratis');
  });
});

describe('gallerTill', () => {
  it('skriver lopande sedan startdagen, eller bara lopande', () => {
    const e = paketEtikett(rad({ subscription_status: 'active', planKey: 'all_month' }), NU);
    expect(gallerTill(e, rad(), '2025-12-24T10:00:00Z')).toBe('löpande sedan 24 dec');
    expect(gallerTill(e, rad())).toBe('löpande');
  });

  it('skriver tidpunkten for engangs och provperiod', () => {
    const r = rad({ premium_source: 'onetime_1d', premium_until: '2026-09-23T12:14:00Z' });
    expect(gallerTill(paketEtikett(r, NU), r)).toBe('23 sep kl. 14.14');
  });

  it('har aldrig ett streck', () => {
    const fall = [
      rad(),
      rad({ premium_source: 'signup_trial', premium_until: I_GAR }),
      rad({ premium_source: 'admin' }),
      rad({ undantag: 'test' }),
    ];
    for (const r of fall) {
      const text = gallerTill(paketEtikett(r, NU), r);
      expect(text).not.toMatch(/[–—]/);
      expect(text.length).toBeGreaterThan(0);
    }
  });
});

/**
 * En fejkad PostgREST-fraga som bara spelar in anropen. Rackar for att se
 * att varje grupp utom "Admin och test" borjar med undantag is null.
 */
class Inspelning implements FiltrerbarFraga<Inspelning> {
  anrop: string[] = [];
  is(kolumn: string, varde: null) {
    this.anrop.push(`is:${kolumn}:${String(varde)}`);
    return this;
  }
  not(kolumn: string, operator: string, varde: unknown) {
    this.anrop.push(`not:${kolumn}:${operator}:${String(varde)}`);
    return this;
  }
  or(filter: string) {
    this.anrop.push(`or:${filter}`);
    return this;
  }
}

describe('tillampaGrupp', () => {
  const nuIso = new Date(NU).toISOString();

  it('utesluter undantagna i varje grupp utom Admin och test', () => {
    for (const g of GRUPPER) {
      const q = tillampaGrupp(new Inspelning(), g.nyckel as Grupp, nuIso);
      if (g.nyckel === 'undantagna') {
        expect(q.anrop).toEqual(['not:undantag:is:null']);
      } else {
        expect(q.anrop[0]).toBe('is:undantag:null');
        expect(q.anrop.some((a) => a.startsWith('not:undantag'))).toBe(false);
      }
    }
  });

  it('Alla ar bara uteslutningen, inget annat villkor', () => {
    expect(tillampaGrupp(new Inspelning(), 'alla', nuIso).anrop).toEqual(['is:undantag:null']);
  });

  it('lagger varje gruppvillkor i ett enda or()', () => {
    for (const g of ['betalande', 'provperiod', 'provperiod_slut', 'gratis'] as const) {
      const q = tillampaGrupp(new Inspelning(), g, nuIso);
      expect(q.anrop.filter((a) => a.startsWith('or:'))).toHaveLength(1);
      expect(q.anrop.join(' ')).toContain(nuIso);
    }
  });

  it('provperiodskallorna ar aldrig gratis', () => {
    const q = tillampaGrupp(new Inspelning(), 'gratis', nuIso);
    const villkor = q.anrop.find((a) => a.startsWith('or:')) ?? '';
    // Varje gren utom den med kalla null utesluter provperiodskallorna.
    const grenar = villkor.slice(3).split(/,(?=and\()/);
    for (const gren of grenar) {
      if (gren.includes('premium_source.is.null')) continue;
      expect(gren).toContain('premium_source.not.in.(signup_trial,oauth_signup_trial');
    }
  });
});

describe('totaler utan undantagna', () => {
  /**
   * Samma regel som sidhuvudet: en total ar summan av grupperna utan
   * undantagna, och en undantagen rad hamnar bara i sin egen grupp.
   */
  function raknaGrupper(rader: PaketUnderlag[]): Record<string, number> {
    const antal: Record<string, number> = { alla: 0 };
    for (const r of rader) {
      const g = paketEtikett(r, NU).grupp;
      antal[g] = (antal[g] ?? 0) + 1;
      if (g !== 'undantagen') antal.alla += 1;
    }
    return antal;
  }

  it('raknar aldrig adminkontot eller testkonton i en total', () => {
    const antal = raknaGrupper([
      rad({ undantag: 'admin', subscription_status: 'active', premium_source: 'admin' }),
      rad({ undantag: 'test', subscription_status: 'active', premium_scope: 'cv' }),
      rad({ undantag: 'test' }),
      rad({ premium_source: 'onetime_1d', premium_until: OM_EN_DAG }),
      rad({ subscription_status: 'active', planKey: 'all_month' }),
      rad({ premium_source: 'signup_trial', premium_until: I_GAR }),
      rad(),
    ]);
    expect(antal.alla).toBe(4);
    expect(antal.betalande).toBe(2);
    expect(antal.undantagen).toBe(3);
    expect(antal.provperiod_slut).toBe(1);
    expect(antal.gratis).toBe(1);
  });
});

describe('format', () => {
  it('skriver tal med svenska tusental och noll for null', () => {
    // Svensk gruppering anvander smalt mellanslag, inte vanligt mellanslag.
    expect(tal(1234)).toMatch(/^1\s234$/);
    expect(tal(null)).toBe('0');
    expect(tal(0)).toBe('0');
  });

  it('skriver relativ tid pa svenska', () => {
    const nu = Date.parse('2026-09-14T12:00:00Z');
    expect(sedan(new Date(nu - 30_000).toISOString(), nu)).toBe('Nyss');
    expect(sedan(new Date(nu - 5 * 60_000).toISOString(), nu)).toBe('5 min sedan');
    expect(sedan(new Date(nu - 3 * 3_600_000).toISOString(), nu)).toBe('3 h sedan');
    expect(sedan(new Date(nu - 86_400_000).toISOString(), nu)).toBe('1 dag sedan');
    expect(sedan(new Date(nu - 4 * 86_400_000).toISOString(), nu)).toBe('4 dagar sedan');
    expect(sedan(null, nu)).toBe('Aldrig');
  });

  it('tal skrap i datumfalten utan att kasta och utan streck', () => {
    expect(sedan('inte ett datum')).toBe('Aldrig');
    expect(kortDatum('inte ett datum')).toBe('okänt datum');
    expect(kortDatum(null)).toBe('okänt datum');
  });

  it('skiljer aldrig fran okant fore matstart', () => {
    expect(datumEllerOrsak(null, '2026-08-01T10:00:00Z', '2026-09-15')).toBe('okänt, före 15 sep');
    expect(datumEllerOrsak(null, '2026-09-20T10:00:00Z', '2026-09-15')).toBe('aldrig');
    expect(datumEllerOrsak(null, null, '2026-09-15')).toBe('okänt, före 15 sep');
    expect(datumEllerOrsak('2026-09-20T10:00:00Z', '2026-08-01T10:00:00Z', '2026-09-15')).not.toMatch(
      /okänt|aldrig/
    );
  });

  it('byter raa systemvarden mot svenska ord', () => {
    expect(kallaText('onetime_1d')).toBe('Engångsköp, Allt-dagen');
    expect(kallaText('signup_trial')).toBe('Provperiod vid registrering');
    expect(kallaText(null)).toBe('ingen');
    expect(statusText('active')).toBe('aktiv');
    expect(statusText(null)).toBe('ingen prenumeration');
  });

  it('faller tillbaka pa e-postens forsta del utan namn', () => {
    expect(visningsnamn(null, 'anna.svensson@example.com')).toBe('anna.svensson');
    expect(visningsnamn('  Anna  ', 'a@b.se')).toBe('Anna');
    expect(visningsnamn(null, null)).toBe('Namnlos');
  });
});
