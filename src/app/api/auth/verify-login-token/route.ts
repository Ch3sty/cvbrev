// src/app/api/auth/verify-login-token/route.ts
// ==============================================
// Verifierar login token och loggar in användaren
// Används av trial-signup return page för auto-login

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({
        error: 'Token saknas'
      }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin() as any

    // Fetch and validate token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('login_tokens')
      .select('user_id, expires_at, used')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      console.error('[VERIFY LOGIN TOKEN] Token not found:', tokenError)
      return NextResponse.json({
        error: 'Ogiltig login-token'
      }, { status: 401 })
    }

    // Check if token is already used
    if (tokenData.used) {
      console.error('[VERIFY LOGIN TOKEN] Token already used')
      return NextResponse.json({
        error: 'Token har redan använts'
      }, { status: 401 })
    }

    // Check if token has expired
    const expiresAt = new Date(tokenData.expires_at)
    if (expiresAt < new Date()) {
      console.error('[VERIFY LOGIN TOKEN] Token expired')
      return NextResponse.json({
        error: 'Token har gått ut. Försök logga in manuellt.'
      }, { status: 401 })
    }

    console.log(`[VERIFY LOGIN TOKEN] Token valid for user: ${tokenData.user_id}`)

    // Mark token as used
    await supabaseAdmin
      .from('login_tokens')
      .update({
        used: true,
        used_at: new Date().toISOString()
      })
      .eq('token', token)

    // Get user's email for creating session
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      tokenData.user_id
    )

    if (userError || !user) {
      console.error('[VERIFY LOGIN TOKEN] User not found:', userError)
      return NextResponse.json({
        error: 'Användare hittades inte'
      }, { status: 404 })
    }

    // Generate a one-time magic link for auto-login
    // This is the most reliable way to create a session from server-side
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!
    })

    if (linkError || !linkData) {
      console.error('[VERIFY LOGIN TOKEN] Failed to generate magic link:', linkError)
      return NextResponse.json({
        error: 'Kunde inte skapa inloggningslänk'
      }, { status: 500 })
    }

    // Get hashed_token directly from properties (Supabase returns it directly)
    const hashedToken = linkData.properties.hashed_token

    if (!hashedToken) {
      console.error('[VERIFY LOGIN TOKEN] No hashed token found in properties')
      return NextResponse.json({
        error: 'Kunde inte generera auto-login token'
      }, { status: 500 })
    }

    console.log(`[VERIFY LOGIN TOKEN] Magic link generated for user: ${user.id}`)

    // Return the hashed token for frontend to verify and create session
    return NextResponse.json({
      success: true,
      userId: user.id,
      tokenHash: hashedToken,
      email: user.email
    })

  } catch (error: any) {
    console.error('[VERIFY LOGIN TOKEN] Unexpected error:', error)
    return NextResponse.json({
      error: 'Ett oväntat fel uppstod'
    }, { status: 500 })
  }
}
