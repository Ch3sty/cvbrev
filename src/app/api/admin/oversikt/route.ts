/**
 * GET /api/admin/oversikt
 *
 * Samma aggregat som sidan /admin renderar, som JSON. Sidan sjalv anropar
 * aldrig den har rutten: den kallar hamtaOversikt direkt pa servern, eftersom
 * ett extra HTTP-hopp i kritiska vagen ar precis det som gor LCP under 1,5
 * sekunder svart. Rutten finns for planens avsnitt 5.4, for felsokning och
 * for den dag nagot utanfor adminen behover samma tal.
 *
 * Svarar med fardiga aggregat, aldrig med rader ur en tabell.
 */

import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { hamtaOversikt } from './data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  try {
    const data = await hamtaOversikt();
    return NextResponse.json(data);
  } catch (fel) {
    console.error('[admin/oversikt] kunde inte bygga oversikten:', fel);
    return NextResponse.json(
      { error: 'Kunde inte lasa oversikten' },
      { status: 500 }
    );
  }
}
