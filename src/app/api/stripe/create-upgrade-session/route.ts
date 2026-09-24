// src/app/api/stripe/create-upgrade-session/route.ts
// ======================================================
// Skapar Stripe embedded checkout session för uppgradering
// För befintliga användare som vill uppgradera till Premium
//
// Sedan paketen infördes (docs/plan-paket-och-onboarding.md avsnitt 5) har
// rutten två utgångar. Har kunden redan en levande prenumeration byter vi pris
// på den i stället för att öppna en kassa (valjByte i src/lib/stripe/paketByte.ts):
// spår till Hela paketet med proration, CV-paketet och Träningspaketet
// sinsemellan utan, och svaret blir { upgraded: true }. Nedgradering och
// längdbyte går inte direkt och får 409 med beskedet. Utan prenumeration blir
// det en vanlig embedded checkout som förut.

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import {
  findLiveSubscription,
  alreadySubscribedResponse,
} from '@/lib/stripe/guard-existing-subscription'
import { valjByte } from '@/lib/stripe/paketByte'
import { PAKETBYTE } from '@/components/pricing/paket-copy'
import {
  getSubscriptionPriceAllowlist,
  getStripePriceId,
  priceIdToPlanKey,
} from '@/lib/stripe/planPrices'
import { PLAN_BY_KEY, isPlanKey } from '@/lib/plans/plans'
import { PAKETSKARM } from '@/lib/onboarding/program'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[CREATE UPGRADE SESSION] User not authenticated:', userError?.message || 'No user')
      return NextResponse.json({
        error: 'Du måste vara inloggad'
      }, { status: 401 })
    }

    // Klienten skickar antingen planKey (nya vägen) eller priceId (den gamla
    // prenumerationssidan). Båda landar i samma price-id och samma paket.
    const body = await request.json().catch(() => ({}))
    const { planKey, priceId: rawPriceId, consent } = body as {
      planKey?: unknown
      priceId?: unknown
      consent?: unknown
    }

    let priceId: string
    if (isPlanKey(planKey)) {
      if (PLAN_BY_KEY[planKey].mode !== 'subscription') {
        return NextResponse.json({ error: 'Paketet är inget abonnemang' }, { status: 400 })
      }
      try {
        priceId = getStripePriceId(planKey)
      } catch (error) {
        console.error('[CREATE UPGRADE SESSION]', error)
        return NextResponse.json(
          { error: 'Produkten är inte tillgänglig just nu. Försök igen senare.' },
          { status: 503 }
        )
      }
    } else if (typeof rawPriceId === 'string' && rawPriceId) {
      priceId = rawPriceId
    } else {
      return NextResponse.json({ error: 'Saknar produktval' }, { status: 400 })
    }

    // Bara prenumerationspaketen får tecknas här. Klienten har aldrig fria
    // händer med price id.
    const allowedPriceIds = getSubscriptionPriceAllowlist()
    if (!allowedPriceIds.includes(priceId)) {
      console.warn(`[CREATE UPGRADE SESSION] Blockerade price id utanför allowlist: ${priceId}`)
      return NextResponse.json({
        error: 'Ogiltigt produktval'
      }, { status: 400 })
    }

    const requestedPlanKey = isPlanKey(planKey) ? planKey : priceIdToPlanKey(priceId)
    const requestedScope = requestedPlanKey ? PLAN_BY_KEY[requestedPlanKey].scope : null

    console.log(`[CREATE UPGRADE SESSION] Creating upgrade session for user: ${user.id}`)

    // Get or create Stripe customer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[CREATE UPGRADE SESSION] Error fetching profile:', profileError)
      return NextResponse.json({
        error: 'Kunde inte hämta profil'
      }, { status: 500 })
    }

    let customerId = profile?.stripe_customer_id

    // Validate existing customer ID or create new one
    if (customerId) {
      try {
        // Try to retrieve the customer to verify it exists in Stripe
        await stripe.customers.retrieve(customerId)
        console.log(`[CREATE UPGRADE SESSION] Verified existing Stripe customer: ${customerId}`)
      } catch (error: any) {
        console.warn(`[CREATE UPGRADE SESSION] Customer ${customerId} not found in Stripe. Creating new customer.`, error.message)
        customerId = null // Force creation of new customer
      }
    }

    // Create Stripe customer if doesn't exist or was invalid
    if (!customerId) {
      console.log(`[CREATE UPGRADE SESSION] Creating new Stripe customer for user ${user.id}`)
      const customer = await stripe.customers.create({
        email: user.email || profile.email,
        name: user.user_metadata?.full_name || undefined,
        metadata: { supabaseUUID: user.id }
      })
      customerId = customer.id

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)

      console.log(`[CREATE UPGRADE SESSION] Created Stripe customer: ${customerId}`)
    }

    // Spärr: teckna aldrig ett andra abonnemang åt någon som redan har ett.
    // En levande prenumeration byter pris i stället, och valjByte avgör hur:
    // uppgradering direkt med mellanskillnaden, sidbyte direkt utan proration,
    // nedgradering och längdbyte först vid nästa förnyelse.
    const existing = await findLiveSubscription(customerId)
    if (existing) {
      const val = valjByte(existing.planKey, requestedPlanKey)

      if (val.typ === 'uppgradering' || val.typ === 'sidbyte') {
        const subscription = await stripe.subscriptions.retrieve(existing.id)
        const itemId = subscription.items.data[0]?.id
        if (!itemId) {
          console.error(`[CREATE UPGRADE SESSION] ${existing.id} saknar rad att byta pris på.`)
          return NextResponse.json({ error: 'Kunde inte byta paket. Försök igen.' }, { status: 500 })
        }

        // Uppgradering: always_invoice fakturerar mellanskillnaden direkt, så
        // kunden får Hela paketet samma sekund och inte vid nästa dragning.
        // Sidbyte: samma belopp och längd, så ingen proration, ingen faktura
        // och inget kvitto. Dragningsdagen står kvar. En uppsägning står
        // också kvar: den som sagt upp och byter spår har inte ångrat sig.
        const uppgradering = val.typ === 'uppgradering'
        await stripe.subscriptions.update(existing.id, {
          items: [{ id: itemId, price: priceId }],
          proration_behavior: uppgradering ? 'always_invoice' : 'none',
          ...(uppgradering ? { cancel_at_period_end: false } : {}),
          metadata: {
            userId: user.id,
            supabaseUUID: user.id,
            planKey: requestedPlanKey ?? '',
            scope: requestedScope ?? '',
            source: uppgradering ? 'upgrade-track-to-all' : 'sidbyte-track-to-track',
          },
        })

        console.log(
          `[CREATE UPGRADE SESSION] ${user.id}: ${val.typ} ${existing.planKey} till ${requestedPlanKey} på ${existing.id}.`
        )

        // Profilen skrivs direkt, inte först när webhooken kommer. Klienten
        // hämtar om sidan i nästa sekund och ska då se det nya paketet
        // (köptestet 2026-09-24, bugg 3). Webhooken skriver samma värden när
        // customer.subscription.updated landar. Paketet läses ur price_id.
        try {
          const profilData: Record<string, unknown> = {
            premium_scope: requestedScope,
            price_id: priceId,
            subscription_tier: 'premium',
          }
          if (uppgradering) profilData.cancel_at_period_end = false
          // Ett sidbyte byter spår, och hemskärmens ordning följer spåret.
          else profilData.onboarding_track = requestedScope
          const { error: profilFel } = await (getSupabaseAdmin() as any)
            .from('profiles')
            .update(profilData)
            .eq('id', user.id)
          if (profilFel) console.error('[CREATE UPGRADE SESSION] Profilen kunde inte skrivas:', profilFel.message)
        } catch (error) {
          console.error('[CREATE UPGRADE SESSION] Profilen kastade:', error)
        }
        return NextResponse.json({
          upgraded: true,
          byte: val.typ,
          planKey: requestedPlanKey,
          scope: requestedScope,
        })
      }

      if (val.typ === 'vidFornyelse') {
        // Inget schemalagt byte finns i appen. Beskedet säger när bytet kan
        // ske, och länken går till kundportalen där uppsägningen görs.
        return NextResponse.json(
          {
            error: PAKETBYTE.vidFornyelse(val.skal),
            vidFornyelse: true,
            skal: val.skal,
            manageUrl: PAKETBYTE.portalHref,
          },
          { status: 409 }
        )
      }

      console.warn(`[CREATE UPGRADE SESSION] Kund ${customerId} har redan ${existing.id} (${existing.status}). Blockerar dubblett.`)
      return NextResponse.json(alreadySubscribedResponse(existing), { status: 409 })
    }

    // Härifrån och ned skapas en ny checkout, alltså ett nytt köp, och då
    // gäller samma krav som i create-plan-session: ångerrättssamtycket måste
    // vara dokumenterat (avsnitt 8). Prisbytet ovan är ingen ny kassa utan en
    // ändring på en prenumeration kunden redan sagt ja till, så det kravet
    // ligger efter den grenen och inte före.
    if (consent !== true) {
      return NextResponse.json(
        { error: 'Du måste godkänna att tjänsten påbörjas direkt för att kunna köpa.' },
        { status: 400 }
      )
    }

    const samtyckeMetadata = {
      angerratt_samtycke_at: new Date().toISOString(),
      angerratt_samtycke_text: PAKETSKARM.samtycke,
    }

    // Base URL for return
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai'

    // Create Stripe embedded checkout session for IMMEDIATE payment (NO TRIAL)
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      locale: 'sv',
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      // NO trial_period_days - immediate payment
      subscription_data: {
        metadata: {
          userId: user.id,
          supabaseUUID: user.id,
          email: user.email || profile.email,
          planKey: requestedPlanKey ?? '',
          scope: requestedScope ?? '',
          upgradeFlow: 'existing-user-upgrade',
          source: 'prenumeration-page',
          ...samtyckeMetadata
        }
      },
      return_url: `${baseUrl}/dashboard/profil/prenumeration?session_id={CHECKOUT_SESSION_ID}&upgraded=true`,
      metadata: {
        userId: user.id,
        supabaseUUID: user.id,
        email: user.email || profile.email,
        planKey: requestedPlanKey ?? '',
        scope: requestedScope ?? '',
        upgradeFlow: 'existing-user-upgrade',
        isNewUser: 'false',
        ...samtyckeMetadata
      }
    })

    console.log(`[CREATE UPGRADE SESSION] Session created: ${session.id}`)

    return NextResponse.json({
      clientSecret: session.client_secret
    })

  } catch (error: any) {
    console.error('[CREATE UPGRADE SESSION] Error:', error)
    return NextResponse.json({
      error: 'Kunde inte skapa checkout-session. Försök igen.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
