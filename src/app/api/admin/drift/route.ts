/**
 * GET /api/admin/drift
 *
 * Färdiga aggregat för Drift-sidan: fel per rutt, hängande analysjobb,
 * kvotträffar, AI-kostnad per funktion, mejl i kö och cronens senaste
 * körning. Aldrig råtabeller.
 *
 * Rutten finns för att kunna larma utanför gränssnittet, till exempel från
 * ett skript. Sidan läser samma funktion direkt på servern.
 */

import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { hamtaDriftData } from '@/app/admin/drift/data';
import { loggaRuttfel } from '@/app/admin/drift/logg';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  try {
    const data = await hamtaDriftData();
    return NextResponse.json(data);
  } catch (err) {
    await loggaRuttfel('/api/admin/drift', err);
    return NextResponse.json(
      { error: 'Kunde inte hämta driftdata' },
      { status: 500 }
    );
  }
}
