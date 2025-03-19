import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    // Anropa cookies() med await för att hämta cookie-objektet asynkront
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore });

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Omdirigera användaren till angiven omdirigerings-URL eller appens rot
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // Omdirigera användaren till en felsida med instruktioner
  return NextResponse.redirect(new URL('/error', request.url));
}
