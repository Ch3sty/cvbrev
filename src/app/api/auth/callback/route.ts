import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    // Skicka in cookie‑objektet direkt (resultatet av await cookies())
    const cookieStore = await cookies();
    const supabase = createServerClient({ cookies: cookieStore })
    
    // Försök att byta OAuth-code mot en session
    await supabase.auth.exchangeCodeForSession(code)
  }
  
  // Omdirigera till profil efter inloggning
  return NextResponse.redirect(new URL('/profile', request.url))
}
