import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { EPOST_LANDNING, sakerVag } from '@/lib/konto/epostbyte'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const redirect_to = sakerVag(searchParams.get('redirect_to'), '/auth/reset-password')

  if (token_hash && type) {
    const cookieStore = await cookies()
    const supabase = createServerClient({ cookies: cookieStore })

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      if (type === 'email_change') {
        // Säkert e-postbyte (/api/konto/byt-epost): den första länken ger
        // varken session eller användare, bytet väntar på den andra. Den
        // sista byter adressen i auth.users och loggar in.
        if (!data.user) return NextResponse.redirect(new URL(`${EPOST_LANDNING}?steg=halvvags`, request.url))
        if (data.user.email) {
          // profiles.email följer inte auth.users av sig själv, och glömt
          // lösenord slår upp kontot på profilens adress.
          try {
            await (getSupabaseAdmin() as any).from('profiles').update({ email: data.user.email }).eq('id', data.user.id)
          } catch (e) {
            console.error('[auth/confirm] profilens e-post kunde inte uppdateras:', e)
          }
        }
        return NextResponse.redirect(new URL(`${EPOST_LANDNING}?steg=klart`, request.url))
      }
      // Redirect to the specified page (usually /auth/reset-password)
      return NextResponse.redirect(new URL(redirect_to, request.url))
    }

    console.error('Error verifying token:', error)
  }

  // Return to error page if something went wrong
  return NextResponse.redirect(new URL('/auth/error', request.url))
}
