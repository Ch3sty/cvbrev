import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { generateConfirmationEmailHTML, generateConfirmationEmailText } from '@/lib/email/confirmation-email-generator'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

// Service role client for admin operations
const getServiceSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, fullName, userId, isInvitation, inviterName, invitationCode } = body

    if (!email || !fullName || !userId) {
      return NextResponse.json({
        error: 'Email, fullName, and userId are required'
      }, { status: 400 })
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 24) // 24 hour expiry

    // Store token in database using service role
    const supabase = getServiceSupabase()

    // Create or update confirmation token
    const { error: tokenError } = await supabase
      .from('email_confirmations')
      .upsert({
        user_id: userId,
        email: email,
        token: confirmationToken,
        expires_at: tokenExpiry.toISOString(),
        is_invitation: isInvitation || false,
        invitation_code: invitationCode || null,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (tokenError) {
      console.error('Error storing confirmation token:', tokenError)
      return NextResponse.json({
        error: 'Failed to create confirmation token'
      }, { status: 500 })
    }

    // Generate confirmation URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.jobbcoach.ai'
    const confirmationUrl = isInvitation && invitationCode
      ? `${baseUrl}/api/auth/confirm-email?token=${confirmationToken}&invite=${invitationCode}`
      : `${baseUrl}/api/auth/confirm-email?token=${confirmationToken}`

    // Send email via Resend
    const emailData = {
      userEmail: email,
      userName: fullName,
      confirmationUrl,
      isInvitation,
      inviterName
    }

    const { data, error: emailError } = await resend.emails.send({
      from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
      to: email,
      subject: isInvitation
        ? `${inviterName} har bjudit in dig till Jobbcoach.ai Premium!`
        : 'Bekräfta din e-postadress - Jobbcoach.ai',
      html: generateConfirmationEmailHTML(emailData),
      text: generateConfirmationEmailText(emailData)
    })

    if (emailError) {
      console.error('Error sending confirmation email:', emailError)
      return NextResponse.json({
        error: 'Failed to send confirmation email',
        details: emailError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
      emailId: data?.id
    })

  } catch (error) {
    console.error('Unexpected error in send-confirmation:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}