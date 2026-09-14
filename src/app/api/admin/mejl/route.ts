/**
 * GET /api/admin/mejl?dagar=90
 *
 * Aggregaten bakom /admin/mejl som JSON. Sidan anropar inte rutten: den
 * serverrenderar och laser datalagret direkt.
 *
 * Varfor en ny rutt och inte email-stats: den befintliga rutten raknar
 * engagemang per mall korrekt (distinkta resend_id, ratt event_type utan
 * prefix) och behalls darfor orord enligt planens avsnitt 2. Men den saknar
 * fyra av de sex mätvärdena i avsnitt 4.6: livscykelsteg, kon i
 * email_schedule, veckodigestens effekt och studsande adresser. Den filtrerar
 * dessutom email_events pa created_at, sa en oppning som kommer dagen efter
 * ett utskick i fonstrets kant faller bort. Den har rutten joinar pa
 * resend_id i stallet och tappar ingenting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { loggaAdminFel } from '@/lib/admin/collect';
import { hamtaMejl, DIGEST_FONSTER_TIMMAR } from '@/app/admin/mejl/data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  try {
    const rat = Number(request.nextUrl.searchParams.get('dagar'));
    const dagar = Number.isFinite(rat) ? Math.max(7, Math.min(rat, 365)) : 90;

    const data = await hamtaMejl(dagar);

    return NextResponse.json({
      ...data,
      dagar,
      digestFonsterTimmar: DIGEST_FONSTER_TIMMAR,
      // Utan hemligheten skriver webhooken ingenting, och da stannar
      // leverans- och oppnandegraden pa noll utan att nagot ser trasigt ut.
      webhookKonfigurerad: Boolean(process.env.RESEND_WEBHOOK_SECRET),
    });
  } catch (fel) {
    const meddelande = fel instanceof Error ? fel.message : String(fel);
    await loggaAdminFel(
      getSupabaseAdmin() as any,
      'route',
      `mejl: ${meddelande}`,
      { rutt: '/api/admin/mejl' }
    );
    return NextResponse.json(
      { error: 'Kunde inte läsa mejlstatistik' },
      { status: 500 }
    );
  }
}
