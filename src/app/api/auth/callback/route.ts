// app/auth/callback/route.ts
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';
  const origin = requestUrl.origin; // Använd origin för säkrare omdirigering

  if (code) {
    // Hämta cookie-lagret (med await som önskat)
    const cookieStore = await cookies();

    // Samma klient som resten av appen: getAll/setAll, så sessionen skrivs
    // tillbaka i ett svep i stället för cookie för cookie.
    const supabase = createServerClient({ cookies: cookieStore });
    try {
        // Försök att byta OAuth-code mot en session
        const { error, data } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            console.log("OAuth code exchange successful. Redirecting to:", redirectTo);
            // Omdirigera till önskad destination
            return NextResponse.redirect(`${origin}${redirectTo}`);
        } else {
            // Om Supabase returnerade ett fel vid bytet
            console.error("Supabase error exchanging code for session:", error?.message);
        }
    } catch(e: any) {
        // Om något annat oväntat fel inträffade
        console.error("Unexpected error during code exchange:", e.message);
    }
  } else {
      // Om ingen kod fanns i URL:en
      console.warn("No OAuth code found in callback request.");
  }

  // Fallback: Omdirigera till inloggningssidan med ett felmeddelande
  console.log("Redirecting back to login due to error or missing code.");
  // Omdirigera till /login, använd origin
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`);
}