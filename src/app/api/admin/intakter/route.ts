/**
 * GET /api/admin/intakter
 *
 * Fardiga aggregat for Intakter, aldrig en ratabell. Sidan sjalv
 * serverrenderar och behover inte rutten; den finns for planens avsnitt 5.4
 * och for att kunna lasa samma siffror fran ett skript eller en rapport utan
 * att skrapa HTML.
 *
 * Belopp lamnas i ore, precis som de ligger i admin_daily_metrics och i
 * Stripe. Omvandlingen till kronor hor till gransnittet.
 */

import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { hamtaIntaktData, hamtaStripeSnapshot } from '@/app/admin/intakter/data';
import { byggVattenfall, MRR_SANN_FRAN } from '@/app/admin/intakter/format';
import { loggaAdminFel } from '@/lib/admin/collect';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const dagar = Math.max(7, Math.min(Number(url.searchParams.get('dagar') ?? 90) || 90, 365));
  // Stripe-delen kostar ett externt anrop och hoppas over med ?stripe=0.
  const medStripe = url.searchParams.get('stripe') !== '0';

  try {
    const data = await hamtaIntaktData(dagar);
    const stripe = medStripe ? await hamtaStripeSnapshot() : null;

    const senaste = data.senaste;
    const mrrOre = senaste?.mrr_ore ?? null;

    return NextResponse.json({
      ok: true,
      senasteDag: senaste?.dag ?? null,
      mrr_ore: mrrOre,
      arr_ore: typeof mrrOre === 'number' ? mrrOre * 12 : null,
      aktiva: senaste?.active_subs ?? null,
      trialande: senaste?.trialing_subs ?? null,
      misslyckade_betalningar: senaste?.failed_payments ?? null,
      nya_betalande_per_dag: data.dagar
        .map((d) => ({ dag: d.dag, antal: d.new_paying }))
        .reverse(),
      intakt_per_dag_ore: data.dagar
        .map((d) => ({ dag: d.dag, ore: d.revenue_ore }))
        .reverse(),
      mrr_per_dag_ore: data.dagar.map((d) => ({ dag: d.dag, ore: d.mrr_ore })).reverse(),
      churn_per_vecka: data.churnVeckor,
      // Trial till betalt kraver Stripe: i profiles nollstaller webhooken
      // premium_source vid betalning, sa kohorten raderar sig sjalv nar den
      // konverterar. trialPagaende ar bara namnaren, alltsa hur manga som bar
      // en trialkalla just nu.
      trial_pagaende: data.trialPagaende,
      trial_till_betalt: stripe?.trial ?? null,
      vattenfall: byggVattenfall(data.dagar),
      plan_mix: stripe?.planMix ?? null,
      kuponger: stripe?.kuponger ?? null,
      misslyckade: stripe?.misslyckade ?? null,
      obetalda_fakturor: stripe
        ? { antal: stripe.obetaldaFakturor, ore: stripe.obetaldaFakturorOre }
        : null,
      datakvalitet: {
        premium_grants_rader: data.premiumGrantsRader,
        mrr_sann_fran: MRR_SANN_FRAN,
        not: 'premium_grants är tom historiskt, Stripe är primärkälla för nya betalande. MRR-historik före mrr_sann_fran är backfylld med dagens värde och är platt.',
      },
    });
  } catch (err) {
    const meddelande = err instanceof Error ? err.message : String(err);
    console.error('[api/admin/intakter]', meddelande);
    // Drift-sidan laser admin_error_log, sa ett fel har ska synas dar och
    // inte bara i serverloggen. Loggningen far aldrig kasta vidare: da hade
    // ett skrivfel i felloggen dolt det ursprungliga felet.
    try {
      await loggaAdminFel(getSupabaseAdmin() as any, 'route', meddelande, {
        rutt: '/api/admin/intakter',
      });
    } catch {
      // Redan loggat till konsolen ovan.
    }
    return NextResponse.json({ ok: false, error: meddelande }, { status: 500 });
  }
}
