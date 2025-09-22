import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const body = await request.json()
    const { invitationCode } = body

    if (!invitationCode) {
      return NextResponse.json({ error: 'Invitation code is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Please sign in to accept invitation' }, { status: 401 })
    }

    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('guest_invitations')
      .select(`
        *,
        inviter:profiles!inviter_id (
          full_name,
          email
        )
      `)
      .eq('invitation_code', invitationCode)
      .eq('status', 'pending')
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      // Mark as expired
      await supabase
        .from('guest_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
    }

    // Check if user is already premium
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_until')
      .eq('id', user.id)
      .single()

    const currentlyPremium = profile?.premium_until && new Date(profile.premium_until) > new Date()

    if (currentlyPremium) {
      return NextResponse.json({
        error: 'You already have an active premium subscription',
        isPremium: true
      }, { status: 400 })
    }

    // Accept the invitation
    const premiumEndDate = new Date()
    premiumEndDate.setDate(premiumEndDate.getDate() + invitation.trial_duration_days)

    // Update guest's premium status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        premium_until: premiumEndDate.toISOString(),
        premium_source: 'guest_invitation'
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating premium status:', updateError)
      return NextResponse.json({ error: 'Failed to activate premium' }, { status: 500 })
    }

    // Update invitation status
    await supabase
      .from('guest_invitations')
      .update({
        status: 'accepted',
        guest_user_id: user.id,
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    // Award XP to both inviter and guest
    await supabase.rpc('add_xp_with_cap_check', {
      p_user_id: user.id,
      p_amount: 100,
      p_source: 'invitation_accepted',
      p_description: 'Accepterade Premium-inbjudan'
    })

    await supabase.rpc('add_xp_with_cap_check', {
      p_user_id: invitation.inviter_id,
      p_amount: 50,
      p_source: 'invitation_accepted',
      p_description: 'Din gäst accepterade inbjudan'
    })

    // Create notification for inviter
    await supabase
      .from('notifications')
      .insert({
        user_id: invitation.inviter_id,
        type: 'invitation_accepted',
        title: 'Din gäst har accepterat!',
        message: `${user.email} har accepterat din Premium-inbjudan och får 7 dagars gratis Premium.`,
        metadata: { guest_id: user.id }
      })

    return NextResponse.json({
      success: true,
      data: {
        premiumDays: invitation.trial_duration_days,
        premiumUntil: premiumEndDate.toISOString(),
        inviterName: invitation.inviter?.full_name || 'En vän',
        message: `Välkommen till Premium! Du har fått ${invitation.trial_duration_days} dagars gratis Premium från ${invitation.inviter?.full_name || 'en vän'}.`
      }
    })

  } catch (error) {
    console.error('Unexpected error accepting invitation:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const url = new URL(request.url)
    const code = url.searchParams.get('code')

    if (!code) {
      return NextResponse.json({ error: 'Invitation code is required' }, { status: 400 })
    }

    // Get invitation details
    const { data: invitation, error } = await supabase
      .from('guest_invitations')
      .select(`
        *,
        inviter:profiles!inviter_id (
          full_name,
          email
        )
      `)
      .eq('invitation_code', code)
      .single()

    if (error || !invitation) {
      return NextResponse.json({ error: 'Invalid invitation code' }, { status: 404 })
    }

    // Check status
    if (invitation.status === 'expired') {
      return NextResponse.json({
        valid: false,
        reason: 'expired',
        message: 'This invitation has expired'
      })
    }

    if (invitation.status === 'accepted') {
      return NextResponse.json({
        valid: false,
        reason: 'already_used',
        message: 'This invitation has already been used'
      })
    }

    // Check expiry date
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from('guest_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return NextResponse.json({
        valid: false,
        reason: 'expired',
        message: 'This invitation has expired'
      })
    }

    return NextResponse.json({
      valid: true,
      data: {
        inviterName: invitation.inviter?.full_name || 'En vän',
        premiumDays: invitation.trial_duration_days,
        expiresAt: invitation.expires_at
      }
    })

  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}