// Träningsmejlen (riktlinjer tester v2, "Ägarbeslut 2026-10-11 kväll"):
// pass_dag2, dagen_fore_provet och vecka_utan_datum. Mallarna renderas mot en
// Supabase-dubbel i minnet; inga mejl skickas (Resend är utbytt).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const h = vi.hoisted(() => ({
  scope: null as null | 'allt' | 'tester' | 'cv',
  tema: 'vridning' as string | null,
  send: vi.fn(async (_: any) => ({ data: { id: 're_1' }, error: null })),
  cancel: vi.fn(async (_: string) => ({ data: { id: 're_1' }, error: null }) as any),
}));

vi.mock('@/lib/supabase/premiumAccess', () => ({ getUserScope: vi.fn(async () => h.scope) }));
vi.mock('../traningsmejl-tema', () => ({ dagensTemaFor: vi.fn(async () => h.tema) }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: h.send, cancel: h.cancel };
  },
}));

import { fakeSupabase } from './fakeSupabase';
import type { LifecycleContext } from '../types';
import { resolveLifecycleEmail } from '../registry';
import {
  passDag2Mejl,
  dagenForeProvetMejl,
  veckaUtanDatumMejl,
  PASS_FORM,
  VECKA_KARNA,
  VECKA_DATUMFRAGA,
  betalvaggText,
} from '../templates/traning';
import { stockholmKlockslag, valjTraningsmejl, avbrytSchemalagtPassmejl } from '../traningsmejl';
import { scheduleTraningsmejl, scheduleKomIgangMejl, runLifecycleEmails, schemalaggTill } from '../runner';
import { familjNamn } from '@/lib/logicTestV7/familjer';
import { ovningsformat } from '@/lib/ovningsprov/format';

const IDAG = '2026-10-12'; // måndag, sommartid
const NU = new Date('2026-10-12T06:00:00.000Z'); // morgonslotten, 08:00 svensk tid
const IGAR = '2026-10-11';
const VECKA_SEDAN = '2026-10-05';
const IMORGON = '2026-10-13';

/** Ett ögonblick mitt på en svensk dag (12:00 sommartid). */
const mitt = (dag: string) => `${dag}T10:00:00.000Z`;

function profil(id: string) {
  return {
    id,
    email: `${id}@exempel.se`,
    full_name: 'Anna Berg',
    subscription_tier: null,
    subscription_status: null,
    current_period_end: null,
    premium_until: null,
    premium_source: null,
    quota_emails_opt_out: false,
    weekly_digest_opt_out: false,
    last_active: null,
    created_at: null,
  };
}

function ctx(db: ReturnType<typeof fakeSupabase>, userId: string, metadata: Record<string, unknown>): LifecycleContext {
  return { admin: db.client, userId, profile: profil(userId) as any, metadata };
}

/** En användare som gjorde Nivåkollen i går och valde tid. */
function grund(opts: { passTid?: string | null; provdatum?: string | null; utanKolumn?: boolean; forsta?: string } = {}) {
  const forsta = opts.forsta ?? IGAR;
  const plan: Record<string, unknown> = {
    user_id: 'u1',
    testtyper: ['matris'],
    leverantor: 'matrigma',
    variant: null,
    provdatum: opts.provdatum ?? null,
  };
  if (!opts.utanKolumn) plan.pass_tid = opts.passTid === undefined ? 'morgon' : opts.passTid;
  return fakeSupabase({
    test_planer: [plan],
    test_nivapunkter: [{ user_id: 'u1', test_kind: 'matris', dag: forsta, typ: 'matning', niva: 5.4, skapad_at: mitt(forsta) }],
    logic_test_v4_sessions: [{ id: 's1', user_id: 'u1', test_type: 'matrislogik-matning', completed_at: mitt(forsta) }],
    email_schedule: [],
    email_log: [],
  });
}

function utanTalstreck(...texter: string[]) {
  for (const t of texter) {
    expect(t).not.toContain(String.fromCharCode(0x2014));
    expect(t).not.toContain(String.fromCharCode(0x2013));
  }
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NU);
  h.scope = 'allt';
  h.tema = 'vridning';
  h.send.mockClear();
  h.cancel.mockClear();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('svensk tid', () => {
  it.each([
    ['2026-10-12', '07:00', '2026-10-12T05:00:00.000Z'],
    ['2026-10-12', '11:30', '2026-10-12T09:30:00.000Z'],
    ['2026-10-12', '18:00', '2026-10-12T16:00:00.000Z'],
    ['2026-10-12', '08:00', '2026-10-12T06:00:00.000Z'],
    // Vintertid börjar 25 oktober 03:00.
    ['2026-10-24', '07:00', '2026-10-24T05:00:00.000Z'],
    ['2026-10-25', '07:00', '2026-10-25T06:00:00.000Z'],
    ['2026-10-25', '00:00', '2026-10-24T22:00:00.000Z'],
    ['2026-10-26', '08:00', '2026-10-26T07:00:00.000Z'],
    ['2026-11-03', '18:00', '2026-11-03T17:00:00.000Z'],
    // Sommartid börjar 29 mars 02:00.
    ['2026-03-28', '18:00', '2026-03-28T17:00:00.000Z'],
    ['2026-03-29', '00:00', '2026-03-28T23:00:00.000Z'],
    ['2026-03-29', '08:00', '2026-03-29T06:00:00.000Z'],
    ['2026-03-29', '11:30', '2026-03-29T09:30:00.000Z'],
  ])('%s %s svensk tid är %s', (dag, klocka, iso) => {
    expect(stockholmKlockslag(dag, klocka).toISOString()).toBe(iso);
  });

  it('runnern lämnar en framtida tid till Resend och skickar en passerad direkt', () => {
    expect(schemalaggTill('2026-10-12T16:00:00.000Z', NU)).toBe('2026-10-12T16:00:00.000Z');
    expect(schemalaggTill('2026-10-12T05:00:00.000Z', NU)).toBeUndefined();
    expect(schemalaggTill('2026-10-12T06:00:30.000Z', NU)).toBeUndefined();
    expect(schemalaggTill(undefined, NU)).toBeUndefined();
  });
});

describe('registret', () => {
  it('hittar mallarna ur dagsuffixet', () => {
    expect(resolveLifecycleEmail(`pass_dag2_${IDAG}`)?.type).toBe('pass_dag2');
    expect(resolveLifecycleEmail(`dagen_fore_provet_${IDAG}`)?.type).toBe('dagen_fore_provet');
    expect(resolveLifecycleEmail(`vecka_utan_datum_${IDAG}`)?.type).toBe('vecka_utan_datum');
  });
});

describe('pass_dag2', () => {
  it('Premium: temat, formen, nivån, länken till passet och avregistreringen', async () => {
    const db = grund();
    const r = await passDag2Mejl.render(ctx(db, 'u1', { dag: IDAG, pass_tid: 'morgon' }));
    const tema = familjNamn('vridning')!;
    expect(r.subject).toBe(`Dagens pass: ${tema}`);
    expect(r.preheader).toBe(PASS_FORM);
    expect(PASS_FORM).toBe('Nio uppgifter, cirka tio minuter.');
    expect(r.html).toContain(`Hej Anna. Dagens tema: ${tema}. Nio uppgifter, cirka tio minuter.`);
    expect(r.html).toContain('Din nivå är 5,4. Passet utgår från den.');
    expect(r.html).toContain('https://www.jobbcoach.ai/dashboard/tester/pass?typ=pass&utm_source=lifecycle');
    expect(r.html).toContain('Starta passet');
    expect(r.html).toContain('/api/email/unsubscribe?uid=u1');
    expect(r.html).not.toContain('ingår i Premium');
    utanTalstreck(r.subject, r.preheader, r.html);
  });

  it('gratis: hemvyn som länk och en rak mening om Premium', async () => {
    h.scope = null;
    const db = grund();
    const r = await passDag2Mejl.render(ctx(db, 'u1', { dag: IDAG }));
    expect(r.html).toContain('Din nivå är 5,4. Dagens pass ingår i Premium.');
    expect(r.html).toContain('https://www.jobbcoach.ai/dashboard/tester?utm_source=lifecycle');
    expect(r.html).not.toContain('pass?typ=pass');
    expect(r.html).toContain('Se dagens pass');
    expect(r.html).toContain('/api/email/unsubscribe?uid=u1');
    utanTalstreck(r.subject, r.preheader, r.html);
  });

  it('utan tema står Blandade mönster', async () => {
    h.tema = null;
    const r = await passDag2Mejl.render(ctx(grund(), 'u1', { dag: IDAG }));
    expect(r.subject).toBe('Dagens pass: Blandade mönster');
  });

  it.each([
    ['morgon', IDAG, '2026-10-12T05:00:00.000Z'],
    ['lunch', IDAG, '2026-10-12T09:30:00.000Z'],
    ['kvall', IDAG, '2026-10-12T16:00:00.000Z'],
    ['morgon', '2026-11-03', '2026-11-03T06:00:00.000Z'],
    ['lunch', '2026-11-03', '2026-11-03T10:30:00.000Z'],
    ['kvall', '2026-11-03', '2026-11-03T17:00:00.000Z'],
  ])('vald tid %s den %s ger skickaVid %s', async (passTid, dag, iso) => {
    const r = await passDag2Mejl.render(ctx(grund({ passTid }), 'u1', { dag }));
    expect(r.skickaVid).toBe(iso);
  });

  it('skickas dag 2 när tid är vald och passet inte är gjort', async () => {
    expect(await passDag2Mejl.shouldSend(ctx(grund(), 'u1', { dag: IDAG }))).toBe(true);
  });

  it('tyst utan vald tidpunkt, och när kolumnen saknas', async () => {
    expect(await passDag2Mejl.shouldSend(ctx(grund({ passTid: null }), 'u1', { dag: IDAG }))).toBe(false);
    expect(await passDag2Mejl.shouldSend(ctx(grund({ utanKolumn: true }), 'u1', { dag: IDAG }))).toBe(false);
  });

  it('tyst när dagens pass redan är gjort', async () => {
    const db = grund();
    db.tables.logic_test_v4_sessions.push({ id: 's2', user_id: 'u1', test_type: 'matrislogik-pass', completed_at: '2026-10-12T05:30:00.000Z' });
    expect(await passDag2Mejl.shouldSend(ctx(db, 'u1', { dag: IDAG }))).toBe(false);
  });

  it('ett pass i går räknas inte som dagens', async () => {
    const db = grund();
    db.tables.logic_test_v4_sessions.push({ id: 's2', user_id: 'u1', test_type: 'matrislogik-pass', completed_at: '2026-10-11T21:30:00.000Z' });
    expect(await passDag2Mejl.shouldSend(ctx(db, 'u1', { dag: IDAG }))).toBe(true);
  });

  it('tyst när Nivåkollen inte var i går', async () => {
    expect(await passDag2Mejl.shouldSend(ctx(grund({ forsta: '2026-10-10' }), 'u1', { dag: IDAG }))).toBe(false);
  });

  it('tyst för en rad som gäller en annan dag än i dag', async () => {
    expect(await passDag2Mejl.shouldSend(ctx(grund({ forsta: '2026-10-10' }), 'u1', { dag: IGAR }))).toBe(false);
  });

  it('högst två: tyst när två träningsmejl redan gått, och när passmejlet redan gått', async () => {
    const db = grund();
    db.tables.email_schedule.push(
      { user_id: 'u1', email_type: 'dagen_fore_provet_2026-09-01', sent_at: '2026-09-01T06:00:00Z', canceled_at: null },
      { user_id: 'u1', email_type: 'vecka_utan_datum_2026-09-20', sent_at: '2026-09-20T06:00:00Z', canceled_at: null }
    );
    expect(await passDag2Mejl.shouldSend(ctx(db, 'u1', { dag: IDAG }))).toBe(false);

    const db2 = grund();
    db2.tables.email_schedule.push({ user_id: 'u1', email_type: 'pass_dag2_2026-09-01', sent_at: '2026-09-01T06:00:00Z', canceled_at: null });
    expect(await passDag2Mejl.shouldSend(ctx(db2, 'u1', { dag: IDAG }))).toBe(false);

    // Andra mejl räknas inte, och inte heller ett avbrutet passmejl.
    const db3 = grund();
    db3.tables.email_schedule.push(
      { user_id: 'u1', email_type: 'komigang_2026-10-01', sent_at: '2026-10-01T06:00:00Z', canceled_at: null },
      { user_id: 'u1', email_type: 'komigang_2026-10-02', sent_at: '2026-10-02T06:00:00Z', canceled_at: null },
      { user_id: 'u1', email_type: 'pass_dag2_2026-09-01', sent_at: '2026-09-01T06:00:00Z', canceled_at: '2026-09-01T07:00:00Z' }
    );
    expect(await passDag2Mejl.shouldSend(ctx(db3, 'u1', { dag: IDAG }))).toBe(true);
  });
});

describe('dagen_fore_provet', () => {
  it('Premium: formatet och länken till övningsprovets startark', async () => {
    const db = grund({ provdatum: IMORGON });
    const r = await dagenForeProvetMejl.render(ctx(db, 'u1', { dag: IDAG, provdatum: IMORGON }));
    expect(r.subject).toBe('Provet är i morgon. Gör övningsprovet i dag.');
    expect(r.preheader).toBe('Samma format som Matrigma, cirka 35 uppgifter på 40 minuter.');
    expect(r.html).toContain('Hej Anna. Gör övningsprovet i dag, så vet du hur klockan känns innan det gäller.');
    expect(r.html).toContain('Samma format som Matrigma: cirka 35 uppgifter på 40 minuter. Sitt ostört, provet lämnas in när tiden är ute.');
    expect(r.html).toContain('https://www.jobbcoach.ai/dashboard/tester/ovningsprov/logik?utm_source=lifecycle');
    expect(r.html).toContain('Starta övningsprovet');
    expect(r.html).toContain('/api/email/unsubscribe?uid=u1');
    expect(r.skickaVid).toBe('2026-10-12T06:00:00.000Z');
    utanTalstreck(r.subject, r.preheader, r.html);
  });

  it('08:00 svensk tid även på vintern', async () => {
    const r = await dagenForeProvetMejl.render(ctx(grund({ provdatum: '2026-11-04' }), 'u1', { dag: '2026-11-03' }));
    expect(r.skickaVid).toBe('2026-11-03T07:00:00.000Z');
  });

  it('planens första kognitiva testtyp styr startarket', async () => {
    const db = grund({ provdatum: IMORGON });
    db.tables.test_planer[0].testtyper = ['personlighet', 'verbal', 'matris'];
    db.tables.test_planer[0].leverantor = 'shl';
    const r = await dagenForeProvetMejl.render(ctx(db, 'u1', { dag: IDAG }));
    expect(r.html).toContain('/dashboard/tester/ovningsprov/verbal?');
    expect(r.preheader).toBe('Samma format som SHL Verify verbal, 32 påståenden på 20 minuter.');
  });

  it('gratis: betalväggens budskap ur 1.7 och köpknappen', async () => {
    h.scope = null;
    const db = grund({ provdatum: IMORGON });
    const r = await dagenForeProvetMejl.render(ctx(db, 'u1', { dag: IDAG }));
    expect(betalvaggText(ovningsformat('logik', 'matrigma', null))).toBe(
      'Övningsprovet i samma format som Matrigma, cirka 35 uppgifter på 40 minuter. Månaden täcker hela vägen.'
    );
    expect(r.html).toContain('Övningsprovet i samma format som Matrigma, cirka 35 uppgifter på 40 minuter. Månaden täcker hela vägen.');
    expect(r.html).toContain('Köp Jobbcoach Premium, 149 kr i månaden');
    expect(r.html).toContain('/dashboard/valj-spar?paket=all_month&steg=kop&plats=mejl_dagen_fore_provet');
    expect(r.html).not.toContain('ovningsprov/logik');
    expect(r.html).toContain('/api/email/unsubscribe?uid=u1');
    utanTalstreck(r.subject, r.preheader, r.html);
  });

  it('skickas när datumet är i morgon, tyst när det flyttats eller tagits bort', async () => {
    expect(await dagenForeProvetMejl.shouldSend(ctx(grund({ provdatum: IMORGON }), 'u1', { dag: IDAG }))).toBe(true);
    expect(await dagenForeProvetMejl.shouldSend(ctx(grund({ provdatum: '2026-10-20' }), 'u1', { dag: IDAG }))).toBe(false);
    expect(await dagenForeProvetMejl.shouldSend(ctx(grund({ provdatum: null }), 'u1', { dag: IDAG }))).toBe(false);
  });

  it('gäller även gratis utan Nivåkoll, men högst två', async () => {
    const db = fakeSupabase({
      test_planer: [{ user_id: 'u1', testtyper: [], leverantor: null, variant: null, provdatum: IMORGON }],
      email_schedule: [],
    });
    expect(await dagenForeProvetMejl.shouldSend(ctx(db, 'u1', { dag: IDAG }))).toBe(true);
    db.tables.email_schedule.push(
      { user_id: 'u1', email_type: 'pass_dag2_2026-10-01', sent_at: '2026-10-01T06:00:00Z', canceled_at: null },
      { user_id: 'u1', email_type: 'vecka_utan_datum_2026-10-06', sent_at: '2026-10-06T06:00:00Z', canceled_at: null }
    );
    expect(await dagenForeProvetMejl.shouldSend(ctx(db, 'u1', { dag: IDAG }))).toBe(false);
  });
});

describe('vecka_utan_datum', () => {
  it('ägarens text, två länkar och avregistreringen', async () => {
    const db = grund({ forsta: VECKA_SEDAN });
    const r = await veckaUtanDatumMejl.render(ctx(db, 'u1', { dag: IDAG }));
    expect(r.subject).toBe('En vecka sedan din nivåkoll. Har du klättrat?');
    expect(r.preheader).toBe('Ny nivåkoll, åtta minuter. Och har du fått ett datum?');
    expect(VECKA_KARNA + ' ' + VECKA_DATUMFRAGA).toBe(
      'En vecka sedan din nivåkoll. Kolla igen och se om du har klättrat. Har du fått ett datum för testet?'
    );
    expect(r.html).toContain(`Hej Anna. ${VECKA_KARNA} Förra gången landade du på 5,4.`);
    expect(r.html).toContain(`${VECKA_DATUMFRAGA} Lägg in det, så räknar vi ner till provdagen.`);
    expect(r.html).toContain('https://www.jobbcoach.ai/dashboard/tester/pass?typ=matning&utm_source=lifecycle');
    expect(r.html).toContain('https://www.jobbcoach.ai/dashboard/tester/installningar?steg=3&utm_source=lifecycle');
    expect(r.html).toContain('Kolla igen, 8 min');
    expect(r.html).toContain('Lägg in datumet');
    expect(r.html).toContain('/api/email/unsubscribe?uid=u1');
    expect(r.html).not.toContain('ingår i Premium');
    expect(r.skickaVid).toBeUndefined();
    utanTalstreck(r.subject, r.preheader, r.html);
  });

  it('gratis: ny nivåkoll ingår i Premium, sagt rakt', async () => {
    h.scope = null;
    const r = await veckaUtanDatumMejl.render(ctx(grund({ forsta: VECKA_SEDAN }), 'u1', { dag: IDAG }));
    expect(r.html).toContain('Ny nivåkoll ingår i Premium.');
  });

  it('skickas dag 7 utan datum och utan ny nivåkoll', async () => {
    expect(await veckaUtanDatumMejl.shouldSend(ctx(grund({ forsta: VECKA_SEDAN }), 'u1', { dag: IDAG }))).toBe(true);
  });

  it('tyst när en ny nivåkoll gjorts (punkt eller session)', async () => {
    const db = grund({ forsta: VECKA_SEDAN });
    db.tables.test_nivapunkter.push({ user_id: 'u1', test_kind: 'matris', dag: '2026-10-10', typ: 'ommatning', niva: 5.9, skapad_at: mitt('2026-10-10') });
    expect(await veckaUtanDatumMejl.shouldSend(ctx(db, 'u1', { dag: IDAG }))).toBe(false);

    const db2 = grund({ forsta: VECKA_SEDAN });
    db2.tables.logic_test_v4_sessions.push({ id: 's9', user_id: 'u1', test_type: 'matrislogik-matning', completed_at: mitt('2026-10-11') });
    expect(await veckaUtanDatumMejl.shouldSend(ctx(db2, 'u1', { dag: IDAG }))).toBe(false);
  });

  it('tyst när datum lagts in', async () => {
    expect(
      await veckaUtanDatumMejl.shouldSend(ctx(grund({ forsta: VECKA_SEDAN, provdatum: '2026-10-30' }), 'u1', { dag: IDAG }))
    ).toBe(false);
  });

  it('tyst när två redan gått', async () => {
    const db = grund({ forsta: VECKA_SEDAN });
    db.tables.email_schedule.push(
      { user_id: 'u1', email_type: 'pass_dag2_2026-10-06', sent_at: '2026-10-06T06:00:00Z', canceled_at: null },
      { user_id: 'u1', email_type: 'dagen_fore_provet_2026-10-08', sent_at: '2026-10-08T06:00:00Z', canceled_at: null }
    );
    expect(await veckaUtanDatumMejl.shouldSend(ctx(db, 'u1', { dag: IDAG }))).toBe(false);
  });
});

describe('urvalet i morgonslotten', () => {
  function urvalsDb() {
    const punkt = (user_id: string, dag: string, typ = 'matning') => ({ user_id, test_kind: 'matris', dag, typ, niva: 5, skapad_at: mitt(dag) });
    const plan = (user_id: string, extra: Record<string, unknown> = {}) => ({
      user_id,
      testtyper: ['matris'],
      leverantor: null,
      variant: null,
      provdatum: null,
      pass_tid: null,
      ...extra,
    });
    return fakeSupabase({
      test_nivapunkter: [
        punkt('a', IGAR), // dag 2, vald tid: pass_dag2
        punkt('b', IGAR), // dag 2, ingen tid: inget
        punkt('c', VECKA_SEDAN), // dag 7 utan datum: vecka_utan_datum
        punkt('d', VECKA_SEDAN),
        punkt('d', '2026-10-09', 'ommatning'), // ny nivåkoll: inget
        punkt('f', IGAR), // dag 2 och provet i morgon: bara dagen_fore_provet
        punkt('g', VECKA_SEDAN), // två mejl redan: inget
        punkt('i', '2026-10-08'), // dag 4: inget
        punkt('j', VECKA_SEDAN), // datum inlagt efter dag 2: inget i dag
      ],
      logic_test_v4_sessions: [
        // h: Nivåkoll i går utan punkt, men en tidigare session: ny nivåkoll, inget
        { id: 'h1', user_id: 'h', test_type: 'matrislogik-matning', completed_at: mitt('2026-10-01') },
        { id: 'h2', user_id: 'h', test_type: 'matrislogik-matning', completed_at: mitt(IGAR) },
        // k: Nivåkoll i går bara som session (ingen punkt), vald tid: pass_dag2
        { id: 'k1', user_id: 'k', test_type: 'matrislogik-matning', completed_at: '2026-10-11T21:30:00.000Z' },
      ],
      test_planer: [
        plan('a', { pass_tid: 'lunch' }),
        plan('b'),
        plan('c'),
        plan('d'),
        plan('e', { provdatum: IMORGON }), // bara datum: dagen_fore_provet
        plan('f', { pass_tid: 'kvall', provdatum: IMORGON }),
        plan('g'),
        plan('h', { pass_tid: 'morgon' }),
        plan('j', { provdatum: '2026-10-20' }),
        plan('k', { pass_tid: 'kvall' }),
      ],
      email_schedule: [
        { user_id: 'g', email_type: 'pass_dag2_2026-09-30', sent_at: '2026-09-30T06:00:00Z', canceled_at: null },
        { user_id: 'g', email_type: 'dagen_fore_provet_2026-10-02', sent_at: '2026-10-02T06:00:00Z', canceled_at: null },
      ],
    });
  }

  it('väljer dag 2, dag 7 och dagen före, ett mejl per användare', async () => {
    const urval = await valjTraningsmejl(urvalsDb().client, NU);
    const per = Object.fromEntries(urval.map((u) => [u.userId, u.emailType]));
    expect(per).toEqual({
      a: `pass_dag2_${IDAG}`,
      c: `vecka_utan_datum_${IDAG}`,
      e: `dagen_fore_provet_${IDAG}`,
      f: `dagen_fore_provet_${IDAG}`,
      k: `pass_dag2_${IDAG}`,
    });
  });

  it('scheduleTraningsmejl lägger raderna till nu och returnerar vilka som fick ett', async () => {
    const db = urvalsDb();
    const r = await scheduleTraningsmejl(db.client, NU);
    expect(r).toMatchObject({ pass_dag2: 2, dagen_fore_provet: 2, vecka_utan_datum: 1 });
    expect([...r.anvandare].sort()).toEqual(['a', 'c', 'e', 'f', 'k']);
    const nya = db.tables.email_schedule.filter((x) => x.sent_at === null);
    expect(nya).toHaveLength(5);
    for (const rad of nya) expect(rad.send_after).toBe(NU.toISOString());
    expect(nya.find((x) => x.user_id === 'a')?.metadata).toEqual({ dag: IDAG, pass_tid: 'lunch' });

    // Omkörning samma morgon ger inga dubbletter.
    await scheduleTraningsmejl(db.client, NU);
    expect(db.tables.email_schedule.filter((x) => x.sent_at === null)).toHaveLength(5);
  });

  it('den som fått ett träningsmejl i dag får ingen komigang samma dag', async () => {
    const framtid = '2026-11-12T06:00:00.000Z';
    const betalande = (id: string) => ({
      id,
      email: `${id}@exempel.se`,
      premium_scope: 'allt',
      premium_until: framtid,
      current_period_end: framtid,
      subscription_status: 'active',
      price_id: null,
      cancel_at_period_end: false,
      quota_emails_opt_out: false,
    });
    const db = fakeSupabase({ profiles: [betalande('a'), betalande('z')], email_schedule: [] });
    const r = await scheduleKomIgangMejl(db.client, NU, ['a']);
    expect(r.komigang).toBe(1);
    expect(db.tables.email_schedule.map((x) => x.user_id)).toEqual(['z']);
  });
});

describe('sändningen', () => {
  it('runnern skickar passmejlet med scheduledAt på vald tid', async () => {
    const db = grund({ passTid: 'kvall' });
    db.tables.profiles = [profil('u1')];
    db.tables.email_schedule.push({
      id: 'r1',
      user_id: 'u1',
      email_type: `pass_dag2_${IDAG}`,
      send_after: NU.toISOString(),
      sent_at: null,
      canceled_at: null,
      attempts: 0,
      metadata: { dag: IDAG, pass_tid: 'kvall' },
    });
    const res = await runLifecycleEmails(db.client);
    expect(res.sent).toBe(1);
    expect(h.send).toHaveBeenCalledTimes(1);
    const arg = h.send.mock.calls[0][0];
    expect(arg.scheduledAt).toBe('2026-10-12T16:00:00.000Z');
    expect(arg.subject).toBe(`Dagens pass: ${familjNamn('vridning')}`);
    expect(db.tables.email_log[0]).toMatchObject({ resend_id: 're_1', email_type: `pass_dag2_${IDAG}` });
  });

  it('dagen före provet på sommaren: 08:00 har redan slagit, mejlet går direkt', async () => {
    const db = grund({ provdatum: IMORGON });
    db.tables.profiles = [profil('u1')];
    db.tables.email_schedule.push({
      id: 'r2',
      user_id: 'u1',
      email_type: `dagen_fore_provet_${IDAG}`,
      send_after: NU.toISOString(),
      sent_at: null,
      canceled_at: null,
      attempts: 0,
      metadata: { dag: IDAG },
    });
    await runLifecycleEmails(db.client);
    expect(h.send).toHaveBeenCalledTimes(1);
    expect(h.send.mock.calls[0][0].scheduledAt).toBeUndefined();
  });

  it('avregistrerad får inget', async () => {
    const db = grund();
    db.tables.profiles = [{ ...profil('u1'), quota_emails_opt_out: true }];
    db.tables.email_schedule.push({
      id: 'r3',
      user_id: 'u1',
      email_type: `pass_dag2_${IDAG}`,
      send_after: NU.toISOString(),
      sent_at: null,
      canceled_at: null,
      attempts: 0,
      metadata: { dag: IDAG },
    });
    const res = await runLifecycleEmails(db.client);
    expect(res.canceled).toBe(1);
    expect(h.send).not.toHaveBeenCalled();
  });
});

describe('avbrytSchemalagtPassmejl', () => {
  function skickatDb() {
    return fakeSupabase({
      email_schedule: [
        { id: 'r1', user_id: 'u1', email_type: `pass_dag2_${IDAG}`, sent_at: NU.toISOString(), canceled_at: null },
      ],
      email_log: [{ user_id: 'u1', email_type: `pass_dag2_${IDAG}`, resend_id: 're_77' }],
    });
  }

  it('avbryter dagens schemalagda passmejl hos Resend och slutar räkna det', async () => {
    const db = skickatDb();
    const ok = await avbrytSchemalagtPassmejl(db.client, 'u1');
    expect(ok).toBe(true);
    expect(h.cancel).toHaveBeenCalledWith('re_77');
    expect(db.tables.email_schedule[0].canceled_at).toBeTruthy();
  });

  it('en osänd rad avbryts i email_schedule', async () => {
    const db = fakeSupabase({
      email_schedule: [{ id: 'r1', user_id: 'u1', email_type: `pass_dag2_${IDAG}`, sent_at: null, canceled_at: null }],
      email_log: [],
    });
    expect(await avbrytSchemalagtPassmejl(db.client, 'u1')).toBe(false);
    expect(db.tables.email_schedule[0].canceled_at).toBeTruthy();
    expect(h.cancel).not.toHaveBeenCalled();
  });

  it('kastar aldrig: Resend-fel, Resend som kastar och trasig databas ger false', async () => {
    h.cancel.mockResolvedValueOnce({ data: null, error: { message: 'Email already sent' } });
    const db = skickatDb();
    expect(await avbrytSchemalagtPassmejl(db.client, 'u1')).toBe(false);
    expect(db.tables.email_schedule[0].canceled_at).toBeNull();

    h.cancel.mockRejectedValueOnce(new Error('nätverk'));
    expect(await avbrytSchemalagtPassmejl(skickatDb().client, 'u1')).toBe(false);

    const trasig = { from: () => { throw new Error('nere'); } } as any;
    expect(await avbrytSchemalagtPassmejl(trasig, 'u1')).toBe(false);
  });

  it('rör bara dagens mejl', async () => {
    const db = skickatDb();
    expect(await avbrytSchemalagtPassmejl(db.client, 'u1', { now: new Date('2026-10-13T08:00:00Z') })).toBe(false);
    expect(h.cancel).not.toHaveBeenCalled();
  });
});
