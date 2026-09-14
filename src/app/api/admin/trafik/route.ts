/**
 * GET /api/admin/trafik?dagar=30
 *
 * Samma aggregat som sidan, som JSON. Sidan sjalv anropar inte rutten: den
 * ar serverrenderad och laser datalagret direkt, vilket sparar en rundtur och
 * ar skillnaden mellan 1,5 sekunder och inte.
 *
 * Rutten finns for anrop utifran, till exempel ett skript eller en framtida
 * export. Den svarar med fardiga aggregat och aldrig med en ratabell.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { loggaAdminFel } from '@/lib/admin/collect';
import { hamtaTrafik, GSC_FORDROJNING_DAGAR, PERIOD_DAGAR } from '@/app/admin/trafik/data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  try {
    const rat = Number(request.nextUrl.searchParams.get('dagar'));
    const dagar = Number.isFinite(rat) ? Math.max(7, Math.min(rat, 365)) : 30;

    const data = await hamtaTrafik(dagar);

    return NextResponse.json({
      ...data,
      fordrojningDagar: GSC_FORDROJNING_DAGAR,
      periodDagar: PERIOD_DAGAR,
    });
  } catch (fel) {
    const meddelande = fel instanceof Error ? fel.message : String(fel);
    await loggaAdminFel(
      getSupabaseAdmin() as any,
      'route',
      `trafik: ${meddelande}`,
      { rutt: '/api/admin/trafik' }
    );
    return NextResponse.json(
      { error: 'Kunde inte läsa trafikdata' },
      { status: 500 }
    );
  }
}
