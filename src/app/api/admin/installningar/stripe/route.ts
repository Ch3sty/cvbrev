/**
 * GET /api/admin/installningar/stripe
 *
 * Stripe-speglingen bakom Installningar-sidans prisjamforelse: aktiva priser,
 * kuponger och prisernas koppling till produktstegen i PLANS.
 *
 * Tre regler:
 *
 * 1. **Bara lasning.** Adminen skriver aldrig till Stripe. Rutten har ingen
 *    POST och far aldrig fa en. Ett felkonfigurerat pris rattas i Stripes egen
 *    instrumentpanel av agaren, inte harifran.
 * 2. **Inte kritiska vagen.** Sidan laser speglingen ur en 15-minuterscache
 *    i en Suspense-grans (src/app/admin/installningar/stripe.ts), sa forsta
 *    malningen vantar aldrig pa Stripe. Rutten ar den ocachade vagen for
 *    knappen "Las om".
 * 3. **Paginera fran forsta raden.** Fyra priser och tva kuponger ryms i en
 *    sida i dag, vilket ar precis den sortens siffra som goemmer buggen tills
 *    volymen vaxer (planens avsnitt 8).
 */

import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin/requireSuperAdmin';
import { lasStripeSpegling, StripeNyckelSaknas } from '@/app/admin/installningar/stripe';

export const dynamic = 'force-dynamic';

export type { StripePrisrad, StripeKupongrad, StripeSpegling } from '@/app/admin/installningar/stripe';

/**
 * Ocachad lasning. Sidan renderar speglingen fran en 15-minuterscache pa
 * servern, och rutten anvands bara av knappen "Las om", som ska ge en farsk
 * lasning.
 */
export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth.ok) return auth.response;

  try {
    return NextResponse.json(await lasStripeSpegling());
  } catch (error) {
    if (error instanceof StripeNyckelSaknas) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    const meddelande = error instanceof Error ? error.message : 'Okänt fel mot Stripe';
    console.error('[admin/installningar/stripe]', meddelande);
    return NextResponse.json({ error: meddelande }, { status: 502 });
  }
}
