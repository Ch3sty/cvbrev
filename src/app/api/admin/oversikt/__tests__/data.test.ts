import { describe, it, expect } from 'vitest';
import {
  nummer,
  delta,
  tal,
  summa,
  dagBakat,
  type MetrikNyckel,
} from '../data';
import type { DagligaMetrik } from '@/lib/admin/collect';

// Oversiktens hela poang ar jamforelsen: "mer an i gar" och "mer an samma dag
// forra veckan". Raknar den fel har sager sidan att MRR rasat nar det i sjalva
// verket ar GSC som inte svarat. De tre fallen som maste halla ar darfor att
// null aldrig blir noll, att veckojamforelsen tar ratt datum och inte rad
// nummer sju, och att summeringen hoppar over luckor utan att rakna dem som
// nollor i taljaren.

function rad(dag: string, varden: Partial<DagligaMetrik> = {}): DagligaMetrik {
  return {
    dag,
    mrr_ore: null,
    revenue_ore: null,
    new_paying: null,
    churned: null,
    active_subs: null,
    trialing_subs: null,
    failed_payments: null,
    new_accounts: null,
    active_users: null,
    gsc_clicks: null,
    gsc_impressions: null,
    gsc_ctr: null,
    gsc_position: null,
    emails_sent: null,
    emails_opened: null,
    ai_cost_sek: null,
    ...varden,
  };
}

describe('nummer', () => {
  it('later ett tal passera', () => {
    expect(nummer(12)).toBe(12);
  });

  it('tolkar numeric-kolumner som kommer som strang', () => {
    // gsc_position och ai_cost_sek ar numeric i Postgres och nar oss som
    // strang genom PostgREST.
    expect(nummer('18.6')).toBeCloseTo(18.6);
  });

  it('later null vara null, inte noll', () => {
    expect(nummer(null)).toBeNull();
    expect(nummer(undefined)).toBeNull();
  });

  it('avvisar skrap i stallet for att ge NaN', () => {
    expect(nummer('inte ett tal')).toBeNull();
  });
});

describe('delta', () => {
  it('raknar skillnaden nar bada sidorna finns', () => {
    expect(delta(12, 8)).toBe(4);
    expect(delta(8, 12)).toBe(-4);
  });

  it('ger inget delta nar dagens matning saknas', () => {
    expect(delta(null, 8)).toBeNull();
  });

  it('ger inget delta nar jamforelsedagen saknas', () => {
    // En GSC-lucka i gar far inte se ut som att alla klick forsvann.
    expect(delta(12, null)).toBeNull();
  });
});

describe('tal', () => {
  const rader = new Map<string, DagligaMetrik>([
    ['2026-09-14', rad('2026-09-14', { gsc_clicks: 20, new_accounts: 3 })],
    ['2026-09-13', rad('2026-09-13', { gsc_clicks: 12, new_accounts: 5 })],
    ['2026-09-07', rad('2026-09-07', { gsc_clicks: 30 })],
  ]);

  it('jamfor mot i gar och mot samma dag forra veckan', () => {
    const t = tal(rader, '2026-09-14', '2026-09-13', '2026-09-07', 'gsc_clicks');
    expect(t.varde).toBe(20);
    expect(t.motIgar).toBe(8);
    expect(t.motForraVeckan).toBe(-10);
  });

  it('ger null for den jamforelse vars dag saknar matning', () => {
    const t = tal(rader, '2026-09-14', '2026-09-13', '2026-09-07', 'new_accounts');
    expect(t.motIgar).toBe(-2);
    // 7 september har ingen new_accounts, alltsa ingen veckojamforelse.
    expect(t.motForraVeckan).toBeNull();
  });

  it('ger null rakt igenom nar dagen sjalv saknas i tabellen', () => {
    const t = tal(rader, '2026-09-15', '2026-09-14', '2026-09-08', 'gsc_clicks');
    expect(t.varde).toBeNull();
    expect(t.motIgar).toBeNull();
    expect(t.motForraVeckan).toBeNull();
  });
});

describe('summa', () => {
  const rader = [
    rad('2026-09-14', { emails_sent: 6 }),
    rad('2026-09-13', { emails_sent: 17 }),
    rad('2026-09-12', { emails_sent: null }),
    rad('2026-09-11', { emails_sent: 1 }),
    rad('2026-09-10', { emails_sent: 4 }),
  ];

  it('summerar bakat fran senaste dagen', () => {
    expect(summa(rader, 'emails_sent' as MetrikNyckel, 2)).toBe(23);
  });

  it('hoppar over luckor utan att stoppa summeringen', () => {
    expect(summa(rader, 'emails_sent' as MetrikNyckel, 5)).toBe(28);
  });

  it('kan forskjutas, sa veckan innan gar att jamfora med', () => {
    expect(summa(rader, 'emails_sent' as MetrikNyckel, 2, 3)).toBe(5);
  });

  it('ger noll nar fonstret ligger utanfor datan', () => {
    expect(summa(rader, 'emails_sent' as MetrikNyckel, 3, 10)).toBe(0);
  });
});

describe('dagBakat', () => {
  it('gar en dag bakat', () => {
    expect(dagBakat('2026-09-14', 1)).toBe('2026-09-13');
  });

  it('gar sju dagar bakat till samma veckodag', () => {
    expect(dagBakat('2026-09-14', 7)).toBe('2026-09-07');
  });

  it('klarar manadsskifte', () => {
    expect(dagBakat('2026-09-01', 1)).toBe('2026-08-31');
  });

  it('klarar arsskifte', () => {
    expect(dagBakat('2026-01-01', 7)).toBe('2025-12-25');
  });

  it('flyttar inte datumet over sommartidsgransen', () => {
    // Sverige gar over till vintertid 25 oktober 2026. Rakningen sker pa
    // klockan tolv UTC just for att en timmes forskjutning inte ska tippa
    // datumet.
    expect(dagBakat('2026-10-26', 1)).toBe('2026-10-25');
    expect(dagBakat('2026-10-25', 1)).toBe('2026-10-24');
  });
});
