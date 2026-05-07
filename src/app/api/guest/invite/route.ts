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

    // Check if user is premium or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('premium_until, subscription_tier, full_name')
      .eq('id', user.id)
      .single()

    // Check if user is admin (admins can send unlimited invitations)
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = adminUser?.role === 'admin' || adminUser?.role === 'super_admin'

    // Check both manual premium (premium_until) and Stripe subscription (subscription_tier)
    const hasPremiumUntil = profile?.premium_until && new Date(profile.premium_until) > new Date()
    const hasPremiumTier = profile?.subscription_tier === 'premium'
    const isPremium = hasPremiumUntil || hasPremiumTier

    if (!isPremium && !isAdmin) {
      return NextResponse.json({ error: 'Premium membership required' }, { status: 403 })
    }

    // Check weekly allowance (skip for admin users)
    let allowance = null

    if (!isAdmin) {
      const now = new Date()
      const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

      // Get existing weekly allowance
      const { data: weeklyAllowance } = await supabase
        .from('weekly_guest_allowances')
        .select('*')
        .eq('user_id', user.id)
        .single()

      allowance = weeklyAllowance

      // Initialize or reset if needed
      if (!allowance) {
        // Create new allowance (will be initialized on first use below)
        const { data: newAllowance, error: allowanceError } = await supabase
          .from('weekly_guest_allowances')
          .insert({
            user_id: user.id,
            base_allowance: 5, // 5 invitations per week for premium users
            used_invitations: 0,
            first_used_at: null,
            reset_at: null
          })
          .select()
          .single()

        if (allowanceError) {
          console.error('Error creating allowance:', allowanceError)
          return NextResponse.json({ error: 'Failed to create allowance' }, { status: 500 })
        }

        allowance = newAllowance
      } else {
        // Check if we need to reset (7 days have passed)
        if (allowance.reset_at && now.getTime() >= new Date(allowance.reset_at).getTime()) {
          // Reset the weekly allowance
          const { data: resetAllowance, error: resetError } = await supabase
            .from('weekly_guest_allowances')
            .update({
              used_invitations: 0,
              first_used_at: null,
              reset_at: null
            })
            .eq('user_id', user.id)
            .select()
            .single()

          if (resetError) {
            console.error('Error resetting allowance:', resetError)
            return NextResponse.json({ error: 'Failed to reset allowance' }, { status: 500 })
          }

          allowance = resetAllowance
        }
      }

      // Initialize timestamps on first use in the period
      if (!allowance.first_used_at) {
        const resetAt = new Date(now.getTime() + SEVEN_DAYS_MS)

        const { data: updatedAllowance, error: updateError } = await supabase
          .from('weekly_guest_allowances')
          .update({
            first_used_at: now.toISOString(),
            reset_at: resetAt.toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating allowance timestamps:', updateError)
          return NextResponse.json({ error: 'Failed to update allowance' }, { status: 500 })
        }

        allowance = updatedAllowance
      }

      // Check if user has invitations left
      const totalAllowance = allowance.base_allowance
      if (allowance.used_invitations >= totalAllowance) {
        return NextResponse.json({
          error: 'No invitations remaining this week',
          allowance: {
            total: totalAllowance,
            used: allowance.used_invitations,
            remaining: 0,
            resetAt: allowance.reset_at
          }
        }, { status: 403 })
      }
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
        trial_duration_days: 2,
        source: 'weekly_allowance',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Update used invitations count (only for non-admin users)
    if (!isAdmin && allowance) {
      await supabase
        .from('weekly_guest_allowances')
        .update({ used_invitations: allowance.used_invitations + 1 })
        .eq('user_id', user.id)
    }

    // Send invitation email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.jobbcoach.ai'
    const inviteUrl = `${baseUrl}/invite/${invitationCode}`
    const inviterName = profile?.full_name || 'En vän'

    console.log('Invitation URL:', inviteUrl) // Debug log

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
      user_id_param: user.id,
      xp_amount: 25,
      source_param: 'guest_invitation',
      description_param: 'Skickade gästinbjudan'
    })

    // Calculate remaining invitations for response
    let remainingInvitations = 999 // Unlimited for admin
    if (!isAdmin && allowance) {
      const totalAllowance = allowance.base_allowance
      remainingInvitations = totalAllowance - allowance.used_invitations - 1
    }

    return NextResponse.json({
      success: true,
      data: {
        invitationId: invitation.id,
        invitationCode,
        inviteUrl,
        guestEmail,
        expiresAt: invitation.expires_at,
        remainingInvitations
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