import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, trialSource } = await request.json()

    // Validera e-post
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({
        error: 'Giltig e-postadress krävs'
      }, { status: 400 })
    }

    console.log(`[TRIAL] Initiating trial for: ${email}`)

    const supabaseAdmin = getSupabaseAdmin()

    // 1. Kolla om användare redan finns
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, stripe_customer_id, subscription_tier')
      .eq('email', email)
      .single()

    let userId: string
    let stripeCustomerId: string | null = null
    let isNewUser = false

    if (existingProfile) {
      // Användare finns redan
      userId = existingProfile.id
      stripeCustomerId = existingProfile.stripe_customer_id

      // Kolla om de redan har premium
      if (existingProfile.subscription_tier === 'premium') {
        return NextResponse.json({
          error: 'Du har redan ett Premium-konto. Logga in för att fortsätta.',
          code: 'ALREADY_PREMIUM',
          loginUrl: '/login'
        }, { status: 400 })
      }

      console.log(`[TRIAL] Existing user found: ${userId}`)
    } else {
      // 2. Skapa nytt konto med random lösenord
      const randomPassword = crypto.randomBytes(32).toString('hex')

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: email.split('@')[0], // Temporary name från email
          trial_initiated: true,
          trial_source: trialSource,
          password_set: false
        }
      })

      if (authError || !authData.user) {
        console.error('[TRIAL] Failed to create user:', authError)
        return NextResponse.json({
          error: 'Kunde inte skapa konto. Försök igen.'
        }, { status: 500 })
      }

      userId = authData.user.id
      isNewUser = true
      console.log(`[TRIAL] Created new user: ${email}, ID: ${userId}`)
    }

    // 3. Hämta eller skapa Stripe Customer
    if (!stripeCustomerId) {
      try {
        const customer = await stripe.customers.create({
          email,
          name: email.split('@')[0],
          metadata: {
            supabaseUUID: userId,
            trialSource: trialSource || 'unknown'
          }
        })

        stripeCustomerId = customer.id

        // Uppdatera profile med Stripe customer ID
        await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', userId)

        console.log(`[TRIAL] Created Stripe customer: ${stripeCustomerId}`)
      } catch (stripeError: any) {
        console.error('[TRIAL] Failed to create Stripe customer:', stripeError)
        return NextResponse.json({
          error: 'Kunde inte skapa Stripe-kund. Försök igen.'
        }, { status: 500 })
      }
    }

    // 4. Skapa Stripe Checkout Session med 7-dagars trial
    const priceId = process.env.STRIPE_TRIAL_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID

    if (!priceId) {
      console.error('[TRIAL] No price ID configured')
      return NextResponse.json({
        error: 'Konfigurationsfel. Kontakta support.'
      }, { status: 500 })
    }

    try {
      const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        subscription_data: {
          trial_period_days: 7,
          metadata: {
            supabaseUUID: userId,
            trialSource: trialSource || 'homepage_cta'
          }
        },
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai'}/auth/trial-pending?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai'}?trial=cancelled`,
        allow_promotion_codes: false, // Trial already active
        metadata: {
          supabaseUUID: userId,
          email,
          trialSource: trialSource || 'unknown',
          isNewUser: isNewUser.toString()
        }
      })

      console.log(`[TRIAL] Created checkout session: ${session.id} for user: ${userId}`)

      return NextResponse.json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id
      })

    } catch (stripeError: any) {
      console.error('[TRIAL] Failed to create checkout session:', stripeError)
      return NextResponse.json({
        error: 'Kunde inte skapa checkout-session. Försök igen.'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('[TRIAL] Error initiating trial:', error)
    return NextResponse.json({
      error: 'Ett oväntat fel uppstod. Försök igen senare.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// Hjälpfunktion för e-postvalidering
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
