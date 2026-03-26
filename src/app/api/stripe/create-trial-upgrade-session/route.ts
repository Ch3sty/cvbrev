// src/app/api/stripe/create-trial-upgrade-session/route.ts
// ======================================================
// Skapar Stripe embedded checkout session med 7-dagars trial
// För befintliga inloggade användare som vill prova Premium

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[CREATE TRIAL UPGRADE] User not authenticated:', userError?.message || 'No user')
      return NextResponse.json({
        error: 'Du måste vara inloggad'
      }, { status: 401 })
    }

    // Get price ID from request
    const { priceId } = await request.json()

    if (!priceId) {
      return NextResponse.json({
        error: 'Saknar price ID'
      }, { status: 400 })
    }

    console.log(`[CREATE TRIAL UPGRADE] Creating trial upgrade session for user: ${user.id}`)

    // Get or create Stripe customer
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('[CREATE TRIAL UPGRADE] Error fetching profile:', profileError)
      return NextResponse.json({
        error: 'Kunde inte hämta profil'
      }, { status: 500 })
    }

    let customerId = profile?.stripe_customer_id

    // Validate existing customer ID or create new one
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId)
        console.log(`[CREATE TRIAL UPGRADE] Verified existing Stripe customer: ${customerId}`)
      } catch (error: any) {
        console.warn(`[CREATE TRIAL UPGRADE] Customer ${customerId} not found in Stripe. Creating new customer.`, error.message)
        customerId = null
      }
    }

    // Create Stripe customer if doesn't exist or was invalid
    if (!customerId) {
      console.log(`[CREATE TRIAL UPGRADE] Creating new Stripe customer for user ${user.id}`)
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

      console.log(`[CREATE TRIAL UPGRADE] Created Stripe customer: ${customerId}`)
    }

    // Base URL for return
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai'

    // Create Stripe embedded checkout session WITH 7-day trial
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId: user.id,
          email: user.email || profile.email,
          upgradeFlow: 'existing-user-trial-upgrade',
          source: 'prenumeration-page'
        }
      },
      return_url: `${baseUrl}/dashboard/profil/prenumeration?session_id={CHECKOUT_SESSION_ID}&upgraded=true`,
      metadata: {
        userId: user.id,
        email: user.email || profile.email,
        upgradeFlow: 'existing-user-trial-upgrade',
        isNewUser: 'false'
      }
    })

    console.log(`[CREATE TRIAL UPGRADE] Session created: ${session.id}`)

    return NextResponse.json({
      clientSecret: session.client_secret
    })

  } catch (error: any) {
    console.error('[CREATE TRIAL UPGRADE] Error:', error)
    return NextResponse.json({
      error: 'Kunde inte skapa checkout-session. Försök igen.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
