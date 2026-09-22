import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  UNDANTAG_EPOST_MONSTER,
  arTestEpost,
  byggUndantag,
  hogqlUteslutning,
  pgLista,
  tomtUndantag,
  undantagText,
  uteslut,
} from '../undantag';

/**
 * Undantagna konton (ägarens beslut 2026-09-22): adminkontot och testkonton
 * räknas aldrig. Regeln finns på två ställen, databasfunktionen och
 * undantag.ts, och det här testet håller dem lika.
 */

const MIGRATION = path.resolve(
  __dirname,
  '../../../../supabase/migrations/20260922220000_admin_undantagna_konton.sql'
);

describe('mönstren', () => {
  it('är samma i migrationen som i undantag.ts', () => {
    const sql = fs.readFileSync(MIGRATION, 'utf8');
    const listor = [...sql.matchAll(/like any \(array\[([^\]]+)\]\)/g)].map((m) =>
      m[1].split(',').map((s) => s.trim().replace(/^'|'$/g, ''))
    );
    expect(listor.length).toBeGreaterThanOrEqual(2);
    for (const lista of listor) expect(lista).toEqual([...UNDANTAG_EPOST_MONSTER]);
  });

  it('känner igen testkontona', () => {
    expect(arTestEpost('b4-qa-cv@jobbcoach-qa.test')).toBe(true);
    expect(arTestEpost('qa-admin-1@jobbcoach-qa.example.com')).toBe(true);
    expect(arTestEpost('qa-b6-1790066557811@jobbcoach-qa.test')).toBe(true);
    expect(arTestEpost('nagon@exempel.test')).toBe(true);
    expect(arTestEpost('QA-stor@firma.se')).toBe(true);
  });

  it('räknar gomer@gomer.se och vanliga kunder som riktiga kunder', () => {
    expect(arTestEpost('gomer@gomer.se')).toBe(false);
    expect(arTestEpost('anna.qvist@gmail.com')).toBe(false);
    expect(arTestEpost('test@testbolaget.se')).toBe(false);
    expect(arTestEpost(null)).toBe(false);
  });
});

describe('byggUndantag', () => {
  const u = byggUndantag([
    { userId: 'a1', email: 'agare@x.se', skal: 'admin', stripeKund: 'cus_A' },
    { userId: 't1', email: 't@jobbcoach-qa.test', skal: 'test', stripeKund: null },
  ]);

  it('slår upp id och Stripe-kund', () => {
    expect(u.har('a1')).toBe(true);
    expect(u.har('t1')).toBe(true);
    expect(u.har('kund')).toBe(false);
    expect(u.har(null)).toBe(false);
    expect([...u.stripeKunder]).toEqual(['cus_A']);
  });

  it('skriver hur många som är undantagna', () => {
    expect(undantagText(u)).toBe('1 adminkonto och 1 testkonto undantagna');
    expect(undantagText(tomtUndantag())).toBe('Inga konton undantagna');
    expect(
      undantagText(byggUndantag([{ userId: 'a', email: null, skal: 'admin', stripeKund: null }]))
    ).toBe('1 adminkonto undantaget');
  });
});

describe('uteslut', () => {
  function attrapp() {
    const anrop: string[] = [];
    const q = {
      not(k: string, op: string, v: string) {
        anrop.push(`not ${k} ${op} ${v}`);
        return q;
      },
      or(v: string) {
        anrop.push(`or ${v}`);
        return q;
      },
    };
    return { q, anrop };
  }
  const u = byggUndantag([{ userId: 'a1', email: null, skal: 'admin', stripeKund: null }]);

  it('lägger not in på en kolumn som aldrig är null', () => {
    const { q, anrop } = attrapp();
    uteslut(q, 'id', u);
    expect(anrop).toEqual(['not id in (a1)']);
  });

  it('släpper igenom null på en nullbar kolumn', () => {
    const { q, anrop } = attrapp();
    uteslut(q, 'user_id', u, true);
    expect(anrop).toEqual(['or user_id.is.null,user_id.not.in.(a1)']);
  });

  it('rör inte frågan när inget är undantaget', () => {
    const { q, anrop } = attrapp();
    uteslut(q, 'id', tomtUndantag());
    expect(anrop).toEqual([]);
  });

  it('pgLista', () => {
    expect(pgLista(['a', 'b'])).toBe('(a,b)');
  });
});

describe('hogqlUteslutning', () => {
  it('utesluter på distinct_id, is_internal och e-postmönster', () => {
    const u = byggUndantag([
      { userId: 'ccb52d89-12dd-4cf4-b487-7b6d1731e201', email: null, skal: 'admin', stripeKund: null },
    ]);
    const s = hogqlUteslutning(u);
    expect(s.startsWith(' and ')).toBe(true);
    expect(s).toContain("distinct_id in ('ccb52d89-12dd-4cf4-b487-7b6d1731e201')");
    expect(s).toContain('toString(person.properties.is_internal)');
    // PostHogs parser godtar inte \. i en sträng.
    expect(s).not.toContain('\\.');
    expect(s).toContain('([.]test$|jobbcoach-qa|^qa-)');
  });

  it('kan inte injicera SQL via ett id', () => {
    const u = byggUndantag([{ userId: "x') or 1=1 --", email: null, skal: 'test', stripeKund: null }]);
    expect(hogqlUteslutning(u)).not.toContain('or 1=1');
  });
});

import { raknaNyaBetalande, kundId } from '../collect';

describe('nya betalande = kundens första lyckade debitering', () => {
  const stripe = (tidigare: Record<string, boolean>) =>
    ({
      charges: {
        list: async ({ customer }: { customer: string }) => ({
          data: tidigare[customer] ? [{ paid: true, status: 'succeeded' }] : [],
        }),
      },
    }) as never;

  it('räknar dagspasset som ny och en förnyelse som inte ny', async () => {
    const lyckade = [
      { customer: 'cus_gomer', created: 100 },
      { customer: 'cus_mnd', created: 200 },
    ] as never;
    expect(await raknaNyaBetalande(stripe({ cus_mnd: true }), lyckade)).toBe(1);
  });

  it('räknar samma kund en gång per dag', async () => {
    const lyckade = [
      { customer: 'cus_a', created: 100 },
      { customer: { id: 'cus_a' }, created: 50 },
    ] as never;
    expect(await raknaNyaBetalande(stripe({}), lyckade)).toBe(1);
  });

  it('kundId tar både sträng och objekt', () => {
    expect(kundId('cus_x')).toBe('cus_x');
    expect(kundId({ id: 'cus_y' })).toBe('cus_y');
    expect(kundId(null)).toBe(null);
  });
});
