import { describe, it, expect } from 'vitest';
import { byggVeckor, placera, testEtikett } from '../funnel-data';

// Veckotratten kan ljuga på tre sätt, och alla tre kostar ett felaktigt
// beslut:
//
// 1. En vecka utan insamling blir 0 och ser ut som ett ras.
// 2. Nya konton räknas ur PostHog (signup_completed) i stället för ur
//    databasen, så Veckor och Köpvägen visar olika tal.
// 3. Köp summeras fel över veckans dagar, eller en dag utan insamling
//    räknas som noll.

describe('byggVeckor', () => {
  const funnel = [
    { vecka: '2026-09-21', kalla: 'alla', steg: 'pageview', antal: 115 },
    { vecka: '2026-09-21', kalla: 'alla', steg: 'signup_completed', antal: 1 },
    { vecka: '2026-09-21', kalla: 'alla', steg: 'track_selected', antal: 2 },
    { vecka: '2026-09-21', kalla: 'alla', steg: 'purchase_step_viewed', antal: 0 },
    { vecka: '2026-09-21', kalla: 'allt', steg: 'track_selected', antal: 1 },
    { vecka: '2026-09-21', kalla: 'allt', steg: 'subscription_paid', antal: 1 },
    { vecka: '2026-09-14', kalla: 'alla', steg: 'pageview', antal: 330 },
    { vecka: '2026-09-14', kalla: 'alla', steg: 'paywall_shown', antal: 3 },
  ];

  it('ger en rad per vecka, senaste först, även veckor utan data', () => {
    const v = byggVeckor('2026-09-07', '2026-09-22', funnel, [], []);
    expect(v.map((r) => r.vecka)).toEqual(['2026-09-21', '2026-09-14', '2026-09-07']);
    expect(v[2].besokare).toBeNull();
  });

  it('läser besökare och köpsteg ur PostHog och null där steget saknas', () => {
    const [nu, forra] = byggVeckor('2026-09-14', '2026-09-22', funnel, [], []);
    expect(nu.besokare).toBe(115);
    expect(nu.steg.track_selected).toBe(2);
    expect(nu.steg.purchase_step_viewed).toBe(0);
    expect(nu.steg.checkout_started).toBeNull();
    expect(forra.steg.track_selected).toBeNull();
    expect(nu.perPaket.allt.track_selected).toBe(1);
    expect(nu.perPaket.allt.subscription_paid).toBe(1);
    expect(nu.perPaket.cv.track_selected).toBeNull();
  });

  it('räknar nya konton ur databasen per svensk vecka, inte ur signup_completed', () => {
    const konton = [
      '2026-09-21T08:00:00Z',
      '2026-09-22T10:00:00Z',
      // Söndag 20 sep kl. 23.30 svensk tid: veckan före.
      '2026-09-20T21:30:00Z',
      // Söndag 20 sep kl. 22.30 UTC är måndag 21 sep kl. 00.30 svensk tid.
      '2026-09-20T22:30:00Z',
    ];
    const [nu, forra] = byggVeckor('2026-09-14', '2026-09-22', funnel, konton, []);
    expect(nu.nyaKonton).toBe(3);
    expect(forra.nyaKonton).toBe(1);
  });

  it('ger null för nya konton när databasen inte svarade, aldrig 0', () => {
    const [nu] = byggVeckor('2026-09-21', '2026-09-22', funnel, [], [], false);
    expect(nu.nyaKonton).toBeNull();
  });

  it('summerar köp per vecka och hoppar över dagar utan insamling', () => {
    const dagar = [
      { dag: '2026-09-22', new_paying: 1 },
      { dag: '2026-09-21', new_paying: null },
      { dag: '2026-09-15', new_paying: 0 },
    ];
    const [nu, forra, aldre] = byggVeckor('2026-09-07', '2026-09-22', funnel, [], dagar);
    expect(nu.kop).toBe(1);
    expect(forra.kop).toBe(0);
    expect(aldre.kop).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Funktionsanvändningen ur sanningskällorna
// ---------------------------------------------------------------------------

// Talen på Funnel räknades tidigare ur user_activities, som skrivs
// fire-and-forget från klienten. Tester och mallnedladdningar syntes därför
// inte alls: test_completed skrevs bara när resultatsidan faktiskt
// renderades. Omskrivningen räknar på tabellerna i stället, och då är det
// fönsterindelningen som kan ljuga.
//
// Två fel kostar ett felaktigt beslut här:
//
// 1. "Veckan innan" överlappar "senaste sju", så varje rad räknas två gånger
//    och deltat blir systematiskt fel.
// 2. 30-dagarsfönstret görs till en tredje hink i stället för en summa, så
//    30-dagarstalet blir mindre än 7-dagarstalet.

describe('placera', () => {
  // Fasta gränser, så testet inte är beroende av när det körs.
  const f = {
    fran7: '2026-09-14T00:00:00.000Z',
    fran14: '2026-09-07T00:00:00.000Z',
    fran30: '2026-08-22T00:00:00.000Z',
  };

  it('lägger en färsk rad i senaste sju och i trettio', () => {
    const v = placera('2026-09-20T10:00:00.000Z', f);
    expect(v.senaste7).toBe(true);
    expect(v.forra7).toBe(false);
    expect(v.senaste30).toBe(true);
  });

  it('lägger en rad från veckan innan i forra7, inte i senaste7', () => {
    const v = placera('2026-09-10T10:00:00.000Z', f);
    expect(v.senaste7).toBe(false);
    expect(v.forra7).toBe(true);
    expect(v.senaste30).toBe(true);
  });

  it('räknar aldrig samma rad i både senaste7 och forra7', () => {
    // Deltat är antal7 minus antalForra7. Överlappar hinkarna blir deltat
    // alltid noll och sidan säger att ingenting rör sig.
    for (const tid of [
      '2026-09-21T00:00:00.000Z',
      '2026-09-14T00:00:00.000Z',
      '2026-09-13T23:59:59.999Z',
      '2026-09-07T00:00:00.000Z',
      '2026-08-25T00:00:00.000Z',
    ]) {
      const v = placera(tid, f);
      expect(v.senaste7 && v.forra7).toBe(false);
    }
  });

  it('tar med gränsen fran7 i senaste sju, inte i veckan innan', () => {
    const v = placera(f.fran7, f);
    expect(v.senaste7).toBe(true);
    expect(v.forra7).toBe(false);
  });

  it('låter trettio dagar täcka både senaste sju och veckan innan', () => {
    expect(placera('2026-09-20T00:00:00.000Z', f).senaste30).toBe(true);
    expect(placera('2026-09-10T00:00:00.000Z', f).senaste30).toBe(true);
    expect(placera('2026-08-25T00:00:00.000Z', f).senaste30).toBe(true);
  });

  it('lämnar en rad äldre än trettio dagar utanför alla tre', () => {
    // Raden hämtas ändå: 37 dagar behövs för att veckan innan ska gå att
    // räkna. Den ska bara inte synas i något av talen.
    const v = placera('2026-08-18T00:00:00.000Z', f);
    expect(v.senaste7).toBe(false);
    expect(v.forra7).toBe(false);
    expect(v.senaste30).toBe(false);
  });
});

describe('testEtikett', () => {
  it('översätter de kända testtyperna till läsbar svenska', () => {
    expect(testEtikett('matrislogik')).toBe('Matrislogik');
    expect(testEtikett('numerical-reasoning')).toBe('Numerisk');
    expect(testEtikett('verbal-resonemang')).toBe('Verbal');
    expect(testEtikett('personlighet-grund')).toBe('Personlighet');
  });

  it('visar en okänd testtyp rå i stället för att dölja den', () => {
    // En ny testtyp ska synas på sidan direkt, inte försvinna tills någon
    // kommer ihåg att fylla på tabellen.
    expect(testEtikett('helt-nytt-test')).toBe('helt-nytt-test');
  });
});
