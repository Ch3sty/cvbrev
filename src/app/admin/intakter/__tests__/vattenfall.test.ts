/**
 * Tester for MRR-vattenfallet.
 *
 * Det som ska halla ar att vattenfallet vagrar rita sig nar underlaget ar de
 * backfyllda dagarna. Stripe har ingen historisk MRR, sa backfyllningen
 * 2026-09-14 gav varje dag fore 2026-09-15 dagens varde. Ett vattenfall over
 * den perioden visar exakt noll forandring, vilket ar sant om tabellen men
 * falskt om verksamheten. Null ar ratt svar dar, och sidan skriver ut varfor
 * i stallet for att rita stiltje.
 *
 * byggVattenfall bor i format.ts och inte i data.ts, just for att den ar en
 * ren funktion: data.ts drar in server-only och Supabase-klienten, och en
 * testfil som maste mocka bada for att na en ren berakning ar ett tecken pa
 * att berakningen ligger fel.
 */

import { describe, it, expect } from 'vitest';
import { byggVattenfall, MRR_SANN_FRAN } from '../format';
import type { DagligaMetrik } from '@/lib/admin/collect';

/** En dagsrad med bara det vattenfallet bryr sig om. Resten ar null. */
function rad(
  dag: string,
  mrr: number | null,
  extra: Partial<DagligaMetrik> = {}
): DagligaMetrik {
  return {
    dag,
    mrr_ore: mrr,
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
    ...extra,
  };
}

/** Dagar i fallande ordning, som hamtaDagligaMetrik ger dem. */
function serie(
  franDag: string,
  antalDagar: number,
  mrr: (i: number) => number | null,
  extra: (i: number) => Partial<DagligaMetrik> = () => ({})
): DagligaMetrik[] {
  const ut: DagligaMetrik[] = [];
  const start = new Date(`${franDag}T12:00:00Z`);
  for (let i = 0; i < antalDagar; i += 1) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - i);
    ut.push(rad(d.toISOString().slice(0, 10), mrr(i), extra(i)));
  }
  return ut;
}

describe('byggVattenfall', () => {
  it('ger null med farre an tva dagar', () => {
    expect(byggVattenfall([])).toBeNull();
    expect(byggVattenfall([rad('2026-10-20', 59_900)])).toBeNull();
  });

  it('ger null nar fonstret nar in i den backfyllda historiken', () => {
    // Backfyllningen gav varje dag fore MRR_SANN_FRAN dagens varde, sa en
    // forandring pa noll dar ar ett matfel och inte en observation.
    const dagar = serie('2026-09-14', 60, () => 59_900);
    expect(byggVattenfall(dagar)).toBeNull();
  });

  it('ritar vattenfallet nar hela fonstret ligger efter MRR_SANN_FRAN', () => {
    const dagar = serie(
      '2026-11-20',
      40,
      (i) => 59_900 + (40 - i) * 100,
      (i) => ({ active_subs: 4, new_paying: i < 30 ? 1 : 0, churned: 0 })
    );

    const v = byggVattenfall(dagar);
    expect(v).not.toBeNull();
    expect(v!.tillDag).toBe('2026-11-20');
    expect(v!.franDag > MRR_SANN_FRAN).toBe(true);
    expect(v!.till).toBeGreaterThan(v!.fran);
    expect(v!.nytt).toBeGreaterThan(0);
    expect(v!.churn).toBe(0);
  });

  it('skriver churn som ett negativt belopp', () => {
    const dagar = serie(
      '2026-11-20',
      40,
      () => 59_900,
      (i) => ({ active_subs: 4, new_paying: 0, churned: i < 5 ? 1 : 0 })
    );

    const v = byggVattenfall(dagar);
    expect(v).not.toBeNull();
    expect(v!.churn).toBeLessThan(0);
    expect(v!.nytt).toBe(0);
  });

  it('hoppar over dagar utan MRR i stallet for att rakna dem som noll', () => {
    // En lucka i mitten far inte bli en nolla: da hade vattenfallet visat ett
    // ras och en aterhamtning som aldrig hant.
    const dagar = serie(
      '2026-11-20',
      40,
      (i) => (i === 10 ? null : 59_900),
      () => ({ active_subs: 4, new_paying: 0, churned: 0 })
    );

    const v = byggVattenfall(dagar);
    expect(v).not.toBeNull();
    expect(v!.fran).toBe(59_900);
    expect(v!.till).toBe(59_900);
  });

  it('klarar ett fonster kortare an trettio dagar', () => {
    const dagar = serie(
      '2026-11-20',
      10,
      () => 59_900,
      () => ({ active_subs: 4, new_paying: 0, churned: 0 })
    );

    const v = byggVattenfall(dagar);
    expect(v).not.toBeNull();
    expect(v!.franDag).toBe(dagar[dagar.length - 1].dag);
  });
});
