/**
 * POST /api/admin/intakter/refresh
 *
 * Knappen "Hamta nu" pa Intakter. Tvingar on-demand-pafyllning av gardagen
 * och i dag hittills i admin_daily_metrics via fyllPaDag() fran vag 1, som
 * har 15 minuters sparr per dag och rensar cachetaggen efterat.
 *
 * Avvikelse fran planens avsnitt 5.4: rutten ligger under intakter/ och inte
 * under metrics/, eftersom agent B bara ager src/app/api/admin/intakter/**.
 * Se rapporten. Funktionen ar densamma, och ingen annan sida anropar den an.
 */

import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { fyllPaDag } from '@/lib/admin/metrics';
import { dagStr, loggaAdminFel } from '@/lib/admin/collect';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
// Insamlingen gor fyra delsteg med tio sekunders tidsgrans var.
export const maxDuration = 60;

export async function POST() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  try {
    // Gardagen forst, sedan i dag hittills.
    //
    // Skalet: i dag ar ett halvt dygn och har darfor halva siffror, medan
    // gardagen ar det senaste hela dygn vi kan visa. Knappen hamtade bara i
    // dag, och nar Stripe-delsteget inte hann klart skrev den en tom rad som
    // sedan tog over sidan. Nu fylls bada, och kortet star pa senaste dag med
    // data medan texten sager att i dag fortfarande samlas in.
    const idag = dagStr();
    const igar = dagStr(new Date(Date.now() - 24 * 60 * 60 * 1000));

    const resultatIgar = await fyllPaDag(igar);
    const resultatIdag = await fyllPaDag(idag);

    return NextResponse.json({
      ok: true,
      ...resultatIdag,
      igar: resultatIgar,
      // Sidan visar "I dag hittills" nar dagens rad annu saknar Stripe-tal.
      kordes: resultatIdag.kordes || resultatIgar.kordes,
    });
  } catch (err) {
    const meddelande = err instanceof Error ? err.message : String(err);
    console.error('[api/admin/intakter/refresh]', meddelande);
    return NextResponse.json({ ok: false, error: meddelande }, { status: 500 });
  }
}
