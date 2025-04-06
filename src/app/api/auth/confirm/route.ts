// app/api/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  // Fortsätt använda new URL(request.url).searchParams för att enkelt hämta query params
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  // *** KORRIGERING: Använd request.nextUrl.origin för att hämta bas-URL ***
  const origin = request.nextUrl.origin;

  // Omdirigera till felsida direkt om parametrar saknas
  if (!token_hash || !type) {
    console.warn("Confirm route called without token_hash or type.");
    // Använd den korrekta origin för redirect
    return NextResponse.redirect(`${origin}/auth/error?message=Invalid confirmation link`);
  }

  // Anropa cookies() med await för att hämta cookie-objektet asynkront
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash,
  });

  if (!error) {
    // Lyckad verifiering! Användaren är nu inloggad.
    // Omdirigera till profilsidan.
    console.log(`Email type '${type}' confirmed successfully. Redirecting to /profile.`);
    // Använd den korrekta origin för redirect
    return NextResponse.redirect(`${origin}/profile`);
  }

  // Om verifiering misslyckades
  console.error("Error verifying OTP:", error.message);
  // Omdirigera användaren till en felsida med instruktioner
  // Skicka med felmeddelandet för felsökning eller visa ett generiskt fel.
  const errorMessage = encodeURIComponent(error.message || "Verification failed");
  // Använd den korrekta origin för redirect
  return NextResponse.redirect(`${origin}/auth/error?message=${errorMessage}`);
}

// Kommentar om felsidan behålls som påminnelse
// Du bör också skapa en enkel felsida, t.ex. app/auth/error/page.tsx
// som kan visa meddelandet från query parametern.