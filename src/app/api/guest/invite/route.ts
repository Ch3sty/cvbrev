import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
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
        .select('level')
        .eq('user_id', user.id)
        .single()

      const level = userStats?.level || 1
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
      await resend.emails.send({
        from: 'Jobbcoach.ai <no-reply@jobbcoach.ai>',
        to: guestEmail,
        subject: `${inviterName} bjuder in dig till Jobbcoach.ai Premium`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1e1b4b; margin-bottom: 10px;">Du har blivit inbjuden till Jobbcoach.ai Premium!</h1>
            </div>

            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
              <h2 style="margin: 0 0 10px 0; font-size: 24px;">7 dagars gratis Premium</h2>
              <p style="margin: 0; font-size: 18px;">Upplev alla premium-funktioner helt kostnadsfritt</p>
            </div>

            <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
              ${inviterName} har bjudit in dig att prova Jobbcoach.ai Premium gratis i 7 dagar!
            </p>

            ${personalMessage ? `
              <div style="background: #f7fafc; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
                <p style="color: #2d3748; font-style: italic; margin: 0;">
                  "${personalMessage}"
                </p>
                <p style="color: #718096; font-size: 14px; margin-top: 10px;">- ${inviterName}</p>
              </div>
            ` : ''}

            <h3 style="color: #1e1b4b; margin-top: 30px;">Vad ingår i Premium?</h3>
            <ul style="color: #4a5568; line-height: 1.8;">
              <li>Obegränsade AI-genererade personliga brev</li>
              <li>Professionella CV-mallar och analyser</li>
              <li>Personlig karriärvägledning med AI</li>
              <li>1.5x snabbare XP-intjäning</li>
              <li>Tillgång till alla premium-funktioner</li>
            </ul>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Aktivera din gratis Premium
              </a>
            </div>

            <p style="color: #718096; font-size: 14px; text-align: center; margin-top: 30px;">
              Inbjudan giltig i 30 dagar. Ingen betalningsinformation krävs.
            </p>
          </div>
        `
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