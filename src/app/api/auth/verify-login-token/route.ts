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

    // Create a magic link session for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!
    })

    if (linkError || !linkData) {
      console.error('[VERIFY LOGIN TOKEN] Failed to generate session:', linkError)
      return NextResponse.json({
        error: 'Kunde inte skapa session'
      }, { status: 500 })
    }

    // Extract the session tokens from the magic link
    // The hashed_token in linkData can be used to create a session
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    // Set the session using the generated link's session data
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: linkData.properties.access_token,
      refresh_token: linkData.properties.refresh_token
    })

    if (sessionError) {
      console.error('[VERIFY LOGIN TOKEN] Failed to set session:', sessionError)
      return NextResponse.json({
        error: 'Kunde inte aktivera session'
      }, { status: 500 })
    }

    console.log(`[VERIFY LOGIN TOKEN] Session created for user: ${user.id}`)

    return NextResponse.json({
      success: true,
      userId: user.id
    })

  } catch (error: any) {
    console.error('[VERIFY LOGIN TOKEN] Unexpected error:', error)
    return NextResponse.json({
      error: 'Ett oväntat fel uppstod'
    }, { status: 500 })
  }
}
