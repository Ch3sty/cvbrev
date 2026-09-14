/**
 * GET /api/admin/funnel?veckor=8&kalla=alla
 *
 * Färdiga aggregat för Funnel-sidan: tratten per vecka och källa,
 * funktionsanvändning, oanvända funktioner, retentionskohorter och
 * datakvalitetsnoterna. Aldrig råtabeller.
 *
 * Sidan använder inte rutten i kritiska vägen, den läser samma funktion
 * direkt på servern. Rutten finns för att kunna hämta samma siffror utanför
 * gränssnittet, till exempel i en veckorapport.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { hamtaFunnelData } from '@/app/admin/funnel/data';
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
    const kalla = request.nextUrl.searchParams.get('kalla');

    const data = await hamtaFunnelData(veckor);

    const veckorFiltrerade = kalla
      ? data.veckor.filter((v) => v.kalla === kalla)
      : data.veckor;

    return NextResponse.json({ ...data, veckor: veckorFiltrerade });
  } catch (err) {
    await loggaRuttfel('/api/admin/funnel', err);
    return NextResponse.json(
      { error: 'Kunde inte hämta funneldata' },
      { status: 500 }
    );
  }
}
