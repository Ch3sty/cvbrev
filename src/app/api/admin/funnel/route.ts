/**
 * GET /api/admin/funnel?veckor=8
 *
 * Färdiga aggregat för Tratt, vyerna Veckor och Användning: veckorna med
 * besökare, nya konton, köpsteg och köp, funktionsanvändning, oanvända
 * funktioner, retentionskohorter och datakvalitetsnoterna. Aldrig
 * råtabeller, och undantagna konton räknas aldrig.
 *
 * Sidan /admin/tratt använder inte rutten, den läser samma funktioner
 * direkt på servern. Rutten finns för att kunna hämta samma siffror utanför
 * gränssnittet, till exempel i en veckorapport.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { hamtaUndantagCachad } from '@/lib/admin/metrics';
import { hamtaFunnelData } from '@/app/admin/tratt/funnel-data';
import { loggaRuttfel } from '@/app/admin/drift/logg';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  try {
    const veckor = Math.max(
      2,
      Math.min(Number(request.nextUrl.searchParams.get('veckor')) || 8, 26)
    );
    const u = await hamtaUndantagCachad();
    const data = await hamtaFunnelData(veckor, u.konton);
    return NextResponse.json(data);
  } catch (err) {
    await loggaRuttfel('/api/admin/funnel', err);
    return NextResponse.json(
      { error: 'Kunde inte hämta funneldata' },
      { status: 500 }
    );
  }
}
