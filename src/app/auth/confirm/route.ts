import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const redirect_to = searchParams.get('redirect_to') || '/auth/reset-password'

  if (token_hash && type) {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      // Redirect to the specified page (usually /auth/reset-password)
      return NextResponse.redirect(new URL(redirect_to, request.url))
    }

    console.error('Error verifying token:', error)
  }

  // Return to error page if something went wrong
  return NextResponse.redirect(new URL('/auth/error', request.url))
}
