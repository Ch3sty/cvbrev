// src/app/api/stripe/create-plan-session/route.ts
// ================================================
// En checkout-rutt för hela prisstegen (A5/A6 i docs/plan-konvertering.md).
// Klienten skickar en PlanKey, aldrig ett price id. Engångsköp blir
// mode 'payment', prenumerationer mode 'subscription'. Svaret är
// { url } till Stripes hostade checkout.

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import { findLiveSubscription, alreadySubscribedResponse } from '@/lib/stripe/guard-existing-subscription'
import { PLAN_BY_KEY, isPlanKey } from '@/lib/plans/plans'
import { getStripePriceId } from '@/lib/stripe/planPrices'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Du måste vara inloggad' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { plan, source } = body as { plan?: unknown; source?: unknown }

    if (!isPlanKey(plan)) {
      return NextResponse.json({ error: 'Okänt produktval' }, { status: 400 })
    }
    const selected = PLAN_BY_KEY[plan]

    let priceId: string
    try {
      priceId = getStripePriceId(plan)
    } catch (error) {
      console.error('[CREATE PLAN SESSION]', error)
      return NextResponse.json(
        { error: 'Produkten är inte tillgänglig just nu. Försök igen senare.' },
        { status: 503 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = (profile as { stripe_customer_id?: string | null } | null)?.stripe_customer_id ?? null

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId)
      } catch {
        customerId = null
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || (profile as { email?: string } | null)?.email || undefined,
        name: user.user_metadata?.full_name || undefined,
        metadata: { supabaseUUID: user.id },
      })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    // Samma spärr som övriga checkout-rutter: teckna aldrig ett andra
    // abonnemang åt någon som redan har ett levande. Engångsköp får passera,
    // de skapar ingen prenumeration.
    if (selected.kind === 'recurring') {
      const existing = await findLiveSubscription(customerId)
      if (existing) {
        return NextResponse.json(alreadySubscribedResponse(existing), { status: 409 })
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai'
    const metadata: Record<string, string> = {
      supabaseUUID: user.id,
      userId: user.id,
      plan: selected.key,
      grantDays: String(selected.days ?? 0),
      productKind: selected.kind === 'one_time' ? 'onetime' : 'subscription',
      source: typeof source === 'string' ? source.slice(0, 80) : 'unknown',
    }

    const session = await stripe.checkout.sessions.create({
      mode: selected.kind === 'one_time' ? 'payment' : 'subscription',
      customer: customerId,
      locale: 'sv',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?premium_activated=true&plan=${selected.key}`,
      cancel_url: `${baseUrl}/priser`,
      metadata,
      ...(selected.kind === 'one_time'
        ? { payment_intent_data: { metadata } }
        : { subscription_data: { metadata } }),
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Kunde inte starta betalningen.' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[CREATE PLAN SESSION] Error:', error)
    return NextResponse.json(
      { error: 'Kunde inte starta betalningen. Försök igen.' },
      { status: 500 }
    )
  }
}
