import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Resend } from 'resend'
import { generateInvitationEmailHTML, generateInvitationEmailText } from '@/lib/email/invitation-email-generator'

const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const body = await request.json()
    const { guestEmail, personalMessage } = body

    if (!guestEmail || !isValidEmail(guestEmail)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is premium
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_until, full_name')
      .eq('id', user.id)
      .single()

    const isPremium = profile?.premium_until && new Date(profile.premium_until) > new Date()

    if (!isPremium) {
      return NextResponse.json({ error: 'Premium membership required' }, { status: 403 })
    }

    // Check monthly allowance
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'

    let { data: allowance } = await supabase
      .from('monthly_guest_allowances')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single()

    // Create allowance if it doesn't exist
    if (!allowance) {
      // Calculate bonus based on user level
      const { data: userStats } = await supabase
        .from('global_user_stats')
        .select('current_level')
        .eq('user_id', user.id)
        .single()

      const level = userStats?.current_level || 1
      let bonus = 0
      if (level >= 50) bonus = 999 // Unlimited
      else if (level >= 40) bonus = 4
      else if (level >= 30) bonus = 3
      else if (level >= 20) bonus = 2
      else if (level >= 10) bonus = 1

      const { data: newAllowance, error: allowanceError } = await supabase
        .from('monthly_guest_allowances')
        .insert({
          user_id: user.id,
          month: currentMonth,
          base_allowance: 1,
          bonus_allowance: bonus,
          used_invitations: 0
        })
        .select()
        .single()

      if (allowanceError) {
        console.error('Error creating allowance:', allowanceError)
        return NextResponse.json({ error: 'Failed to create allowance' }, { status: 500 })
      }

      allowance = newAllowance
    }

    // Check if user has invitations left
    const totalAllowance = allowance.base_allowance + allowance.bonus_allowance
    if (allowance.used_invitations >= totalAllowance && totalAllowance < 999) {
      return NextResponse.json({
        error: 'No invitations remaining this month',
        allowance: {
          total: totalAllowance,
          used: allowance.used_invitations,
          remaining: 0
        }
      }, { status: 403 })
    }

    // Check if guest is already invited or registered
    const { data: existingInvite } = await supabase
      .from('guest_invitations')
      .select('*')
      .eq('guest_email', guestEmail)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json({
        error: 'This person already has a pending invitation'
      }, { status: 400 })
    }

    // Generate unique invitation code
    const invitationCode = generateInvitationCode()

    // Create invitation
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days to accept

    const { data: invitation, error: inviteError } = await supabase
      .from('guest_invitations')
      .insert({
        inviter_id: user.id,
        guest_email: guestEmail,
        invitation_code: invitationCode,
        status: 'pending',
        premium_days: 7,
        source: 'monthly_allowance',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Update used invitations count
    await supabase
      .from('monthly_guest_allowances')
      .update({ used_invitations: allowance.used_invitations + 1 })
      .eq('user_id', user.id)
      .eq('month', currentMonth)

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitationCode}`
    const inviterName = profile?.full_name || 'En vän'

    try {
      // Generate professional email templates
      const htmlContent = generateInvitationEmailHTML({
        inviterName,
        guestEmail,
        personalMessage,
        inviteUrl,
        invitationCode
      })

      const textContent = generateInvitationEmailText({
        inviterName,
        guestEmail,
        personalMessage,
        inviteUrl,
        invitationCode
      })

      await resend.emails.send({
        from: 'Jobbcoach.ai <no-reply@jobbcoach.ai>',
        to: guestEmail,
        subject: `${inviterName} bjuder in dig till 7 dagars kostnadsfri Premium!`,
        html: htmlContent,
        text: textContent
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Don't fail the request if email fails
    }

    // Award XP to inviter
    await supabase.rpc('add_xp_with_cap_check', {
      p_user_id: user.id,
      p_amount: 25,
      p_source: 'guest_invitation',
      p_description: 'Skickade gästinbjudan'
    })

    return NextResponse.json({
      success: true,
      data: {
        invitationId: invitation.id,
        invitationCode,
        inviteUrl,
        guestEmail,
        expiresAt: invitation.expires_at,
        remainingInvitations: totalAllowance - allowance.used_invitations - 1
      }
    })

  } catch (error) {
    console.error('Unexpected error sending invitation:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function generateInvitationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code.match(/.{1,4}/g)?.join('-') || code
}