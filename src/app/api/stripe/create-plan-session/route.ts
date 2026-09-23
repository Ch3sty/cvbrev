// src/app/api/stripe/create-plan-session/route.ts
// ================================================
// En checkout-rutt för alla sex paket (docs/plan-paket-och-onboarding.md
// avsnitt 5). Klienten skickar en PlanKey, aldrig ett price id. Dagspasset
// blir mode 'payment', de fem övriga mode 'subscription'. Ingen trial:
// reverse trial är borta enligt ägarens beslut 3. Svaret är { url } till
// Stripes hostade checkout.

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import {
  findLiveSubscription,
  alreadySubscribedResponse,
  blocksAsDuplicate,
} from '@/lib/stripe/guard-existing-subscription'
import { PLAN_BY_KEY, isPlanKey } from '@/lib/plans/plans'
import { getStripePriceId } from '@/lib/stripe/planPrices'
import { VECKA_START_PATH } from '@/lib/onboarding/steps'
import { PAKETSKARM } from '@/lib/onboarding/program'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Du måste vara inloggad' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { plan, source, consent } = body as {
      plan?: unknown
      source?: unknown
      consent?: unknown
    }

    if (!isPlanKey(plan)) {
      return NextResponse.json({ error: 'Okänt produktval' }, { status: 400 })
    }
    const selected = PLAN_BY_KEY[plan]

    // Ångerrättssamtycket, docs/plan-paket-och-onboarding.md avsnitt 8.
    // Undantaget från ångerrätten på fjorton dagar gäller bara om samtycket
    // är dokumenterat, alltså får ett köp utan kryssruta inte gå igenom.
    // Kravet gäller varje paket: Dagspasset påbörjas lika direkt som de fem
    // löpande, och avsnitt 8 säger uttryckligen att samtycket krävs likväl.
    if (consent !== true) {
      return NextResponse.json(
        { error: 'Du måste godkänna att tjänsten påbörjas direkt för att kunna köpa.' },
        { status: 400 }
      )
    }

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

    // Spärren blockerar bara dubbletter av samma scope. En spårkund som
    // köper Allt är en uppgradering och går via create-upgrade-session.
    // Engångsköp får alltid passera, de skapar ingen prenumeration.
    if (selected.mode === 'subscription') {
      const existing = await findLiveSubscription(customerId)
      if (existing && blocksAsDuplicate(existing, selected.scope)) {
        return NextResponse.json(alreadySubscribedResponse(existing), { status: 409 })
      }
      // Uppgradering från ett spår till Hela paketet byter pris på den befintliga
      // prenumerationen. En andra checkout skulle ge kunden två abonnemang.
      if (existing) {
        return NextResponse.json(
          {
            error: 'Du har redan ett paket. Byt paket i stället för att teckna ett till.',
            upgradeAvailable: true,
            upgradeUrl: '/api/stripe/create-upgrade-session',
            currentScope: existing.scope,
          },
          { status: 409 }
        )
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai'
    // scope och planKey följer med hela vägen till webhooken, som skriver
    // premium_scope ur dem. Saknas de faller webhooken tillbaka på
    // priceIdToPlanKey, vilket bara håller så länge env-raderna stämmer.
    const metadata: Record<string, string> = {
      supabaseUUID: user.id,
      userId: user.id,
      plan: selected.key,
      planKey: selected.key,
      scope: selected.scope,
      grantDays: String(selected.grantDays ?? 0),
      productKind: selected.mode === 'payment' ? 'onetime' : 'subscription',
      source: typeof source === 'string' ? source.slice(0, 80) : 'unknown',
      // Beviset. Tidsstämpeln sätts på servern, aldrig av klienten, och
      // texten hämtas ur samma konstant som kryssrutan renderar, så att
      // metadata och det kunden faktiskt läste inte kan glida isär.
      angerratt_samtycke_at: new Date().toISOString(),
      angerratt_samtycke_text: PAKETSKARM.samtycke,
    }

    const session = await stripe.checkout.sessions.create({
      // Ingen trial_period: reverse trial är borta (ägarens beslut 3).
      mode: selected.mode,
      customer: customerId,
      locale: 'sv',
      line_items: [{ price: priceId, quantity: 1 }],
      // Köpreturen går till veckans start, inte till hemskärmen. Det är där
      // det första steget i paketet ligger.
      success_url: `${baseUrl}${VECKA_START_PATH}?premium_activated=true&plan=${selected.key}`,
      cancel_url: `${baseUrl}/priser`,
      metadata,
      ...(selected.mode === 'payment'
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
