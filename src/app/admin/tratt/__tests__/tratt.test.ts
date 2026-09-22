import { describe, it, expect } from 'vitest';
import type { KopRad } from '@/lib/admin/kop';
import { MATSTART } from '@/lib/admin/tomt';
import {
  byggBlockeringar,
  fornyelseRad,
  intaktPerDag,
  intaktPerPaket,
  isoVecka,
  kopAntalText,
  kopIFonster,
  kopstegKort,
  komIgangRad,
  matsFranIFonster,
  standardFonster,
  stoppDagar,
  stoppMening,
  svenskMidnattIso,
  valjFonster,
  veckaInfo,
  veckaStatus,
} from '../berakning';

// Tratt ersätter Flöde och Funnel. De nya rena funktionerna bär sidans
// löften: fönstret "sedan paketen släpptes", att en pågående vecka aldrig
// jämförs rakt mot hela veckor, att en vecka före mätstart är "mäts från"
// och inte 0, och att inga kort visar streck.

function kop(del: Partial<KopRad>): KopRad {
  return {
    id: 'ch_1',
    tid: '2026-09-22T12:14:00Z',
    paket: 'all_day',
    paketNamn: 'Allt-dagen',
    beloppOre: 4900,
    typ: 'engangs',
    ny: true,
    aterbetalning: false,
    userId: 'u1',
    email: null,
    betalsatt: 'Klarna',
    internt: false,
    ...del,
  };
}

describe('svenskMidnattIso', () => {
  it('ger midnatt svensk tid i både sommar- och vintertid', () => {
    expect(svenskMidnattIso('2026-09-22')).toBe('2026-09-21T22:00:00.000Z');
    expect(svenskMidnattIso('2026-12-01')).toBe('2026-11-30T23:00:00.000Z');
  });
});

describe('fönstret', () => {
  it('är "sedan paketen släpptes" tills 30 dagar finns, sedan 30 dagar', () => {
    expect(standardFonster(new Date('2026-09-23T10:00:00Z'))).toBe('paket');
    expect(standardFonster(new Date('2026-10-22T08:50:00Z'))).toBe('paket');
    expect(standardFonster(new Date('2026-10-22T08:52:00Z'))).toBe('30');
  });

  it('börjar vid paketsläppet utan val', () => {
    const f = valjFonster(undefined, new Date('2026-09-23T10:00:00Z'));
    expect(f.nyckel).toBe('paket');
    expect(f.franIso).toBe(MATSTART.paket);
    expect(f.franDag).toBe('2026-09-22');
    expect(f.tillDag).toBe('2026-09-23');
    expect(f.dagar).toBe(2);
    expect(f.etikett).toBe('sedan paketen släpptes 22 sep kl. 10.51');
  });

  it('räknar 7 dagar som sju svenska dagar med i dag', () => {
    const f = valjFonster('7', new Date('2026-09-23T10:00:00Z'));
    expect(f.franDag).toBe('2026-09-17');
    expect(f.franIso).toBe('2026-09-16T22:00:00.000Z');
    expect(f.dagar).toBe(7);
    expect(f.etikett).toBe('senaste 7 dagarna');
    expect(f.standard).toBe('paket');
  });

  it('faller tillbaka på standard för ett okänt värde, men behåller ett uttryckligt val', () => {
    const nov = new Date('2026-11-01T10:00:00Z');
    expect(valjFonster('90', nov).nyckel).toBe('30');
    expect(valjFonster('paket', nov).nyckel).toBe('paket');
  });

  it('säger "mäts från" bara när mätstarten ligger inne i fönstret', () => {
    expect(matsFranIFonster(MATSTART.kopvag, MATSTART.paket)).toBe(MATSTART.kopvag);
    expect(matsFranIFonster(MATSTART.kopvag, '2026-09-23T00:00:00Z')).toBeNull();
  });
});

describe('veckorna', () => {
  it('ger ISO-veckonummer', () => {
    expect(isoVecka('2026-09-21')).toBe(39);
    expect(isoVecka('2026-09-27')).toBe(39);
    expect(isoVecka('2026-01-01')).toBe(1);
    expect(isoVecka('2021-01-03')).toBe(53);
  });

  it('märker pågående vecka med dag X av 7', () => {
    expect(veckaInfo('2026-09-21', '2026-09-22')).toEqual({
      nummer: 39,
      dag: 2,
      pagaende: true,
      etikett: 'v. 39, dag 2 av 7',
    });
    expect(veckaInfo('2026-09-21', '2026-09-27').dag).toBe(7);
    expect(veckaInfo('2026-09-21', '2026-09-27').pagaende).toBe(true);
    expect(veckaInfo('2026-09-14', '2026-09-22')).toMatchObject({ pagaende: false, etikett: 'v. 38', dag: 7 });
  });

  it('visar veckor före ett stegs mätstart som "fore", aldrig som mätta', () => {
    // Köpsteget mäts från 22 sep kl. 19.02.
    expect(veckaStatus('purchase_step_viewed', '2026-09-14')).toBe('fore');
    expect(veckaStatus('purchase_step_viewed', '2026-09-21')).toBe('delvis');
    expect(veckaStatus('purchase_step_viewed', '2026-09-28')).toBe('matt');
    // signup_completed från 11 sep kl. 22.08.
    expect(veckaStatus('signup_completed', '2026-08-31')).toBe('fore');
    expect(veckaStatus('signup_completed', '2026-09-07')).toBe('delvis');
    // Spårvalet från paketsläppet 22 sep.
    expect(veckaStatus('track_selected', '2026-09-14')).toBe('fore');
    // Besökare och nya konton har ingen mätstart.
    expect(veckaStatus('pageview', '2026-08-24')).toBe('matt');
    expect(veckaStatus('nya_konton', '2026-08-24')).toBe('matt');
  });
});

describe('var det tar stopp', () => {
  const rader = [
    { dag: '2026-09-22', handelse: 'feature_blocked', dimension: '', antal: 4, personer: 1 },
    { dag: '2026-09-22', handelse: 'feature_blocked', dimension: 'cv_analysis_full', antal: 4, personer: 1 },
    { dag: '2026-09-22', handelse: '$pageview', dimension: '', antal: 100, personer: 40 },
  ];

  it('räknar dagar med data utan totalraden', () => {
    expect(stoppDagar(rader)).toEqual(['2026-09-22']);
  });

  it('skriver specens mening när datan är liten', () => {
    const text = stoppMening(byggBlockeringar(rader, 'feature_blocked'), [], 'i dag', MATSTART.kopvag);
    expect(text).toBe(
      '1 spärr i dag: full CV-analys, 4 gånger av 1 person, paketet som säljs där är CV-veckan. Gråa val: 0 sedan 22 sep kl. 19.02.'
    );
  });

  it('skriver 0 i stället för ingenting', () => {
    expect(stoppMening([], [], 'senaste 7 dagarna', MATSTART.kopvag)).toBe(
      '0 spärrar senaste 7 dagarna. Gråa val: 0 sedan 22 sep kl. 19.02.'
    );
  });
});

describe('köpen', () => {
  const alltDagen = kop({});
  const fornyelse = kop({ id: 'ch_2', paket: 'all_month', paketNamn: 'Allt-månaden', beloppOre: 14900, typ: 'lopande', ny: false, tid: '2026-09-20T08:00:00Z' });
  const internt = kop({ id: 'ch_3', internt: true, tid: '2026-09-22T18:00:00Z' });
  const ater = kop({ id: 're_1', aterbetalning: true, beloppOre: -4900, ny: false, tid: '2026-09-22T19:00:00Z' });
  const cvVeckan = kop({ id: 'ch_4', paket: 'cv_week', paketNamn: 'CV-veckan', beloppOre: 7900, tid: '2026-09-23T09:00:00Z' });

  it('räknar köp i fönstret utan interna, återbetalningar och förnyelser', () => {
    const rader = [cvVeckan, ater, internt, alltDagen, fornyelse];
    expect(kopIFonster(rader, MATSTART.paket).map((r) => r.id)).toEqual(['ch_4', 'ch_1']);
    expect(kopIFonster(rader, MATSTART.paket, MATSTART.kopvag).map((r) => r.id)).toEqual(['ch_1']);
    expect(kopIFonster(rader, MATSTART.kopvag).map((r) => r.id)).toEqual(['ch_4']);
  });

  it('visar mätstart och köpet före den i stället för ett streck', () => {
    const k = kopstegKort(0, [], [alltDagen]);
    expect(k.matsFran).toBe(true);
    expect(k.varde).toBe('Mäts från 22 sep kl. 19.02');
    expect(k.jamforelse).toBe(
      '1 köp före mätstart: Allt-dagen 49 kr, 22 sep kl. 14.14. Första andel när minst fem sett köpsteget.'
    );
    expect(k.varde).not.toContain('–');
  });

  it('ger andelen först när fem sett köpsteget', () => {
    expect(kopstegKort(4, [cvVeckan], []).matsFran).toBe(true);
    const k = kopstegKort(10, [cvVeckan, cvVeckan], []);
    expect(k.varde).toBe('20 %');
    expect(k.matsFran).toBe(false);
  });

  it('har intäkt per paket med Allt-dagen, utan interna och med återbetalningen dragen', () => {
    const rader = intaktPerPaket([cvVeckan, ater, internt, alltDagen, fornyelse], MATSTART.paket);
    const per = Object.fromEntries(rader.map((r) => [r.namn, r]));
    expect(per['Allt-dagen']).toMatchObject({ nya: 1, ore: 0, spar: 'allt' });
    expect(per['CV-veckan']).toMatchObject({ nya: 1, ore: 7900, spar: 'cv' });
    // Förnyelsen 20 sep ligger före fönstret.
    expect(per['Allt-månaden']).toBeUndefined();
    // Det som säljs står med även utan köp.
    expect(per['Testveckan']).toMatchObject({ nya: 0, fornyelser: 0, ore: 0 });
    expect(rader[0].namn).toBe('CV-veckan');
  });

  it('skriver köpen som i specen', () => {
    expect(kopAntalText({ nya: 0, fornyelser: 3 })).toBe('3 förnyelser');
    expect(kopAntalText({ nya: 1, fornyelser: 0 })).toBe('1 nytt');
    expect(kopAntalText({ nya: 2, fornyelser: 1 })).toBe('2 nya, 1 förnyelse');
    expect(kopAntalText({ nya: 0, fornyelser: 0 })).toBe('0');
  });

  it('bygger intäkt per dag och spår med null för dagar utan köp', () => {
    const dagar = intaktPerDag([cvVeckan, alltDagen, internt], {
      franIso: MATSTART.paket,
      franDag: '2026-09-22',
      tillDag: '2026-09-24',
    });
    expect(dagar).toEqual([
      { dag: '2026-09-22', cv: 0, tester: 0, allt: 49 },
      { dag: '2026-09-23', cv: 79, tester: 0, allt: 0 },
      { dag: '2026-09-24', cv: null, tester: null, allt: null },
    ]);
  });
});

describe('rader i stället för tomma diagram', () => {
  it('säger när förnyelserna kan läsas, tidigast 29 sep', () => {
    expect(fornyelseRad(0, null)).toBe(
      'Förnyelser kan läsas när första veckoköparen är sju dagar gammal, tidigast 29 sep. 0 veckoköpare hittills.'
    );
    const forsta = Date.parse('2026-09-24T10:00:00Z') / 1000;
    expect(fornyelseRad(1, forsta, new Date('2026-09-25T10:00:00Z'))).toBe(
      'Förnyelser kan läsas när första veckoköparen är sju dagar gammal, 1 okt. 1 veckoköpare hittills.'
    );
  });

  it('säger att Kom igång mäts för köp efter köpvägens mätstart', () => {
    expect(komIgangRad(0)).toBe(
      'Kom igång mäts för köp efter 22 sep kl. 19.02 (0 hittills). Diagrammet visas från fem köpare.'
    );
  });
});
