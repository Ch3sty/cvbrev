// src/app/api/subscription/retention-offer/route.ts
// Erbjudandena i uppsägningsflödet (docs/plan-konvertering.md, D6).
//
// POST { offer: 'pause' | 'discount', intentId? }
//   pause    → pause_collection i tre månader (fick jobb)
//   discount → kupong retention_49_2m, 49 kr i två månader (för dyrt)
//
// Båda gäller EN gång per användare. Spärren läser cancel_intents med
// offer_accepted = true, så en accepterad rabatt aldrig kan tas ut två gånger.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/server';

const RETENTION_COUPON = 'retention_49_2m';
const PAUSE_MONTHS = 3;

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const offer = body?.offer;
    if (offer !== 'pause' && offer !== 'discount') {
      return NextResponse.json({ error: 'Ogiltigt erbjudande' }, { status: 400 });
    }

    const admin = getSupabaseAdmin() as any;

    // En gång per användare.
    const { data: previous } = await admin
      .from('cancel_intents')
      .select('id')
      .eq('user_id', user.id)
      .eq('offer_accepted', true)
      .limit(1);

    if ((previous ?? []).length > 0) {
      return NextResponse.json(
        { error: 'already_used', message: 'Du har redan använt ett erbjudande.' },
        { status: 409 }
      );
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('subscription_id, subscription_status')
      .eq('id', user.id)
      .maybeSingle();

    const subscriptionId = profile?.subscription_id;
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Ingen aktiv prenumeration' }, { status: 400 });
    }
    if (!['active', 'trialing', 'past_due'].includes(profile?.subscription_status ?? '')) {
      return NextResponse.json({ error: 'Prenumerationen är inte aktiv' }, { status: 400 });
    }

    if (offer === 'pause') {
      const resumesAt = Math.floor(Date.now() / 1000) + PAUSE_MONTHS * 30 * 24 * 60 * 60;
      await stripe.subscriptions.update(subscriptionId, {
        pause_collection: { behavior: 'void', resumes_at: resumesAt },
      });
    } else {
      await stripe.subscriptions.update(subscriptionId, {
        coupon: RETENTION_COUPON,
      });
    }

    // Markera erbjudandet som accepterat på den senaste intent-raden.
    const intentId = typeof body?.intentId === 'string' ? body.intentId : null;
    if (intentId) {
      await admin
        .from('cancel_intents')
        .update({ offer_shown: offer, offer_accepted: true })
        .eq('id', intentId)
        .eq('user_id', user.id);
    } else {
      await admin.from('cancel_intents').insert({
        user_id: user.id,
        reason: offer === 'pause' ? 'fick_jobb' : 'for_dyrt',
        offer_shown: offer,
        offer_accepted: true,
      });
    }

    return NextResponse.json({
      success: true,
      offer,
      ...(offer === 'pause'
        ? { resumesAt: new Date(Date.now() + PAUSE_MONTHS * 30 * 24 * 60 * 60 * 1000).toISOString() }
        : {}),
    });
  } catch (error: any) {
    console.error('[retention-offer] error:', error?.message);
    return NextResponse.json({ error: 'Kunde inte genomföra erbjudandet' }, { status: 500 });
  }
}
