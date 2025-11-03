import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { generatePasswordResetEmailHTML, generatePasswordResetEmailText } from '@/lib/email/password-reset-email-generator'
import { logUserActivity } from '@/lib/activity-logger'

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
    const { email } = body

    if (!email) {
      return NextResponse.json({
        error: 'E-postadress krävs'
      }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // Check if user exists with this email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', email)
      .single()

    // For security reasons, always return success even if email doesn't exist
    // This prevents email enumeration attacks
    if (profileError || !profile) {
      console.log('No user found with email:', email)
      return NextResponse.json({
        success: true,
        message: 'Om e-postadressen finns i vårt system kommer du få ett mejl med instruktioner.'
      }, { status: 200 })
    }

    // Use Supabase's built-in password reset functionality
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jobbcoach.ai'}/auth/reset-password`
      }
    })

    if (resetError) {
      console.error('Error generating reset link:', resetError)
      throw new Error('Kunde inte skapa återställningslänk')
    }

    // Get the reset link from Supabase Admin API
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jobbcoach.ai'}/auth/reset-password`
      }
    })

    if (linkError || !linkData) {
      console.error('Error getting reset link:', linkError)
      throw new Error('Kunde inte generera återställningslänk')
    }

    const resetUrl = linkData.properties?.action_link || linkData.properties?.hashed_token

    if (!resetUrl) {
      console.error('No reset URL generated')
      throw new Error('Kunde inte generera återställningslänk')
    }

    // Generate email content
    const userName = profile.full_name || 'användare'
    const emailHTML = generatePasswordResetEmailHTML({
      userEmail: email,
      userName,
      resetUrl
    })
    const emailText = generatePasswordResetEmailText({
      userEmail: email,
      userName,
      resetUrl
    })

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Jobbcoach.ai <noreply@jobbcoach.ai>',
      to: email,
      subject: 'Återställ ditt lösenord - Jobbcoach.ai',
      html: emailHTML,
      text: emailText
    })

    if (emailError) {
      console.error('Error sending reset email:', emailError)
      throw new Error('Kunde inte skicka återställningsmejl')
    }

    // Log the password reset request
    try {
      await logUserActivity(
        profile.id,
        'password_reset',
        'Begäran om lösenordsåterställning skickad',
        { email: profile.email }
      )
    } catch (logError) {
      console.error('Error logging password reset activity:', logError)
      // Continue anyway - logging is not critical
    }

    return NextResponse.json({
      success: true,
      message: 'Ett mejl med instruktioner har skickats om e-postadressen finns i vårt system.'
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error in forgot-password:', error)
    return NextResponse.json({
      error: 'Ett oväntat fel uppstod. Försök igen senare.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
