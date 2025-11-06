// src/app/api/auth/trial-login/route.ts
// ========================================
// Backend API for validating one-time login tokens and creating sessions
// Used for passwordless trial user authentication

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

type LoginToken = Database['public']['Tables']['login_tokens']['Row']

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({
        error: 'Token krävs'
      }, { status: 400 })
    }

    console.log(`[TRIAL LOGIN] Validating token: ${token.substring(0, 8)}...`)

    const supabaseAdmin = getSupabaseAdmin() as any

    // 1. Validate token and check expiration
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('login_tokens')
      .select('*')
      .eq('token', token)
      .single() as { data: LoginToken | null, error: any }

    if (tokenError || !tokenData) {
      console.error('[TRIAL LOGIN] Token not found:', tokenError)
      return NextResponse.json({
        error: 'Ogiltig eller utgången länk',
        code: 'INVALID_TOKEN'
      }, { status: 400 })
    }

    // 2. Check if token has already been used
    if (tokenData.used) {
      console.error('[TRIAL LOGIN] Token already used')
      return NextResponse.json({
        error: 'Denna länk har redan använts',
        code: 'TOKEN_USED'
      }, { status: 400 })
    }

    // 3. Check if token has expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)

    if (now > expiresAt) {
      console.error('[TRIAL LOGIN] Token expired')
      return NextResponse.json({
        error: 'Denna länk har gått ut. Begär en ny inloggningslänk.',
        code: 'TOKEN_EXPIRED'
      }, { status: 400 })
    }

    // 4. Mark token as used
    await supabaseAdmin
      .from('login_tokens')
      .update({
        used: true,
        used_at: now.toISOString()
      })
      .eq('id', tokenData.id)

    console.log(`[TRIAL LOGIN] Token marked as used for user: ${tokenData.user_id}`)

    // 5. Create a session for the user using admin API
    // We use generateLink to get session tokens, then return them to frontend
    const metadata = tokenData.metadata as { email?: string } | null
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: metadata?.email || '',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
      }
    })

    if (sessionError || !sessionData) {
      console.error('[TRIAL LOGIN] Failed to generate session:', sessionError)
      return NextResponse.json({
        error: 'Kunde inte skapa session. Försök igen.',
        code: 'SESSION_ERROR'
      }, { status: 500 })
    }

    console.log(`[TRIAL LOGIN] Session link generated for user: ${tokenData.user_id}`)

    // Extract the token hash from the action link to verify session on frontend
    const actionLink = sessionData.properties?.action_link
    if (!actionLink) {
      console.error('[TRIAL LOGIN] No action link in session data')
      return NextResponse.json({
        error: 'Kunde inte generera inloggningslänk.',
        code: 'SESSION_ERROR'
      }, { status: 500 })
    }

    // Extract hash and hashed_token from the URL for frontend to verify
    const url = new URL(actionLink)
    const tokenHash = url.searchParams.get('token_hash')
    const type = url.searchParams.get('type') || 'magiclink'

    if (!tokenHash) {
      console.error('[TRIAL LOGIN] No token hash in action link')
      return NextResponse.json({
        error: 'Ogiltig session-data.',
        code: 'SESSION_ERROR'
      }, { status: 500 })
    }

    // Return the hash for frontend to verify and create session
    return NextResponse.json({
      success: true,
      tokenHash,
      type,
      userId: tokenData.user_id
    })

  } catch (error: any) {
    console.error('[TRIAL LOGIN] Unexpected error:', error)
    return NextResponse.json({
      error: 'Ett oväntat fel uppstod',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}
