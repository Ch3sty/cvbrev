// src/app/api/stripe/create-customer-portal-session/route.ts
// ==============================================================
// Skapar Stripe Customer Portal Session för embedded portal
// Användaren kan hantera sin prenumeration direkt på sidan

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Get the current user from Supabase
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[CREATE CUSTOMER PORTAL SESSION] User not authenticated:', userError)
      return NextResponse.json({
        error: 'Du måste vara inloggad'
      }, { status: 401 })
    }

    // Get user profile to find Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.stripe_customer_id) {
      console.error('[CREATE CUSTOMER PORTAL SESSION] No Stripe customer ID found:', profileError)
      return NextResponse.json({
        error: 'Ingen Stripe-kund hittades för ditt konto'
      }, { status: 400 })
    }

    console.log(`[CREATE CUSTOMER PORTAL SESSION] Creating session for customer: ${profile.stripe_customer_id}`)

    // Base URL for return
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai'

    // Create Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${baseUrl}/dashboard/profil/prenumeration`,
    })

    console.log(`[CREATE CUSTOMER PORTAL SESSION] Session created: ${portalSession.id}`)

    return NextResponse.json({
      sessionId: portalSession.id,
      url: portalSession.url
    })

  } catch (error: any) {
    console.error('[CREATE CUSTOMER PORTAL SESSION] Error:', error)
    return NextResponse.json({
      error: 'Kunde inte skapa portal-session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
