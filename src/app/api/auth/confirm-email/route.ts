import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client for admin operations
const getServiceSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    const inviteCode = url.searchParams.get('invite')

    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=invalid_token', request.url)
      )
    }

    const supabase = getServiceSupabase()

    // Get confirmation record
    const { data: confirmation, error: fetchError } = await supabase
      .from('email_confirmations')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError || !confirmation) {
      console.error('Token not found:', fetchError)
      return NextResponse.redirect(
        new URL('/login?error=invalid_token', request.url)
      )
    }

    // Check if token is expired
    if (new Date(confirmation.expires_at) < new Date()) {
      // Delete expired token
      await supabase
        .from('email_confirmations')
        .delete()
        .eq('token', token)

      return NextResponse.redirect(
        new URL('/login?error=token_expired', request.url)
      )
    }

    // Confirm the user's email in auth.users
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      confirmation.user_id,
      { email_confirm: true }
    )

    if (confirmError) {
      console.error('Error confirming email:', confirmError)
      return NextResponse.redirect(
        new URL('/login?error=confirmation_failed', request.url)
      )
    }

    // Delete the used token
    await supabase
      .from('email_confirmations')
      .delete()
      .eq('token', token)

    // Redirect based on whether this was an invitation
    if (confirmation.is_invitation && confirmation.invitation_code) {
      // Redirect to invitation page with success message
      return NextResponse.redirect(
        new URL(`/invite/${confirmation.invitation_code}?confirmed=true`, request.url)
      )
    } else {
      // Regular registration - redirect to login with success
      return NextResponse.redirect(
        new URL('/login?confirmed=true', request.url)
      )
    }

  } catch (error) {
    console.error('Unexpected error in confirm-email:', error)
    return NextResponse.redirect(
      new URL('/login?error=server_error', request.url)
    )
  }
}