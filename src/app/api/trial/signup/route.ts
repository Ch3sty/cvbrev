// src/app/api/trial/signup/route.ts
// ==================================
// Backend API för att skapa ny trial-användare
// Steg 1 i Moz-stil signup flow

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/server'
import crypto from 'crypto'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Password validation
function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Lösenordet måste vara minst 8 tecken' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Lösenordet måste innehålla minst en stor bokstav' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Lösenordet måste innehålla minst en siffra' }
  }
  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email och lösenord krävs'
      }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({
        error: 'Ogiltig e-postadress'
      }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({
        error: passwordValidation.error
      }, { status: 400 })
    }

    console.log(`[TRIAL SIGNUP] Creating account for: ${email}`)

    const supabaseAdmin = getSupabaseAdmin() as any

    // Check if user already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingProfile) {
      console.log(`[TRIAL SIGNUP] User already exists: ${email}`)
      return NextResponse.json({
        error: 'Ett konto med denna e-postadress finns redan. Logga in istället.'
      }, { status: 400 })
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for trial users
      user_metadata: {
        full_name: email.split('@')[0], // Temporary name from email
        trial_signup: true,
        signup_incomplete: true, // Will be set to false after payment
        signup_flow: 'moz-style',
        signup_date: new Date().toISOString()
      }
    })

    if (authError || !authData.user) {
      console.error('[TRIAL SIGNUP] Failed to create auth user:', authError)
      return NextResponse.json({
        error: 'Kunde inte skapa konto. Försök igen.'
      }, { status: 500 })
    }

    const userId = authData.user.id
    console.log(`[TRIAL SIGNUP] Auth user created: ${userId}`)

    // Create Stripe customer
    try {
      const customer = await stripe.customers.create({
        email,
        name: email.split('@')[0],
        metadata: {
          supabaseUUID: userId,
          signupFlow: 'moz-style',
          trialSource: 'homepage_cta'
        }
      })

      console.log(`[TRIAL SIGNUP] Stripe customer created: ${customer.id}`)

      // Update profile with Stripe customer ID
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          stripe_customer_id: customer.id
        })
        .eq('id', userId)

      if (updateError) {
        console.error('[TRIAL SIGNUP] Failed to update profile:', updateError)
        // Don't fail the request, we can retry this later
      }

      // Return success
      return NextResponse.json({
        success: true,
        userId,
        email,
        stripeCustomerId: customer.id
      })

    } catch (stripeError: any) {
      console.error('[TRIAL SIGNUP] Stripe customer creation failed:', stripeError)

      // Delete the auth user since we couldn't create Stripe customer
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      } catch (deleteError) {
        console.error('[TRIAL SIGNUP] Failed to cleanup user:', deleteError)
      }

      return NextResponse.json({
        error: 'Kunde inte skapa Stripe-kund. Försök igen.'
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('[TRIAL SIGNUP] Unexpected error:', error)
    return NextResponse.json({
      error: 'Ett oväntat fel uppstod. Försök igen senare.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
