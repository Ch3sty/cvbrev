import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logUserActivity } from '@/lib/activity-logger'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Service role client for checking user existence
const getServiceSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createServiceClient(supabaseUrl, supabaseServiceKey)
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

    const serviceSupabase = getServiceSupabase()

    // Check if user exists with this email (for activity logging)
    const { data: profile } = await serviceSupabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', email)
      .single()

    // Use Supabase client library's resetPasswordForEmail
    // This will use Supabase's built-in email system with proper token handling
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobbcoach.ai'}/auth/reset-password`
    })

    if (resetError) {
      console.error('Error sending reset email:', resetError)
      // Still return success to prevent email enumeration
    }

    // Log the password reset request if user exists
    if (profile) {
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
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      success: true,
      message: 'Om e-postadressen finns i vårt system kommer du få ett mejl med instruktioner.'
    }, { status: 200 })

  } catch (error) {
    console.error('Unexpected error in forgot-password:', error)
    return NextResponse.json({
      error: 'Ett oväntat fel uppstod. Försök igen senare.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
