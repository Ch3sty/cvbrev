// src/app/api/stripe/create-trial-session/route.ts
// ==================================================
// Skapar Stripe embedded checkout session för trial
// Steg 2 i Moz-stil signup flow

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: NextRequest) {
  try {
    const { stripeCustomerId, userId, email } = await request.json()

    // Validate input
    if (!stripeCustomerId || !userId || !email) {
      return NextResponse.json({
        error: 'Saknade parametrar'
      }, { status: 400 })
    }

    console.log(`[CREATE TRIAL SESSION] Creating for customer: ${stripeCustomerId}`)

    // Get price ID from environment
    const priceId = process.env.STRIPE_TRIAL_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID

    if (!priceId) {
      console.error('[CREATE TRIAL SESSION] No price ID configured')
      return NextResponse.json({
        error: 'Konfigurationsfel. Kontakta support.'
      }, { status: 500 })
    }

    // Base URL for return
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai'

    // Create Stripe embedded checkout session
    // For trials: Default behavior collects payment method immediately
    // Do NOT specify payment_method_collection - let Stripe use default
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'subscription',
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId,
          email,
          signupFlow: 'moz-style',
          trialSource: 'trial-signup-page'
        }
      },
      return_url: `${baseUrl}/trial-signup/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId,
        email,
        signupFlow: 'moz-style',
        isNewUser: 'true'
      }
    })

    console.log(`[CREATE TRIAL SESSION] Session created: ${session.id}`)

    return NextResponse.json({
      clientSecret: session.client_secret
    })

  } catch (error: any) {
    console.error('[CREATE TRIAL SESSION] Error:', error)
    return NextResponse.json({
      error: 'Kunde inte skapa checkout-session. Försök igen.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
