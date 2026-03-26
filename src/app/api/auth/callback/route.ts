// app/auth/callback/route.ts
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
// Importera den *ursprungliga* createServerClient från @supabase/ssr och CookieOptions
import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
import { type Database } from '@/types/database.types'; // Antag att du har denna typ

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';
  const origin = requestUrl.origin; // Använd origin för säkrare omdirigering

  if (code) {
    // Hämta cookie-lagret (med await som önskat)
    const cookieStore = await cookies();

    // *** Skapa Supabase-klienten direkt här ***
    // Detta är nödvändigt pga hur cookies() fungerar i Route Handlers
    // och hur din nuvarande server.ts helper är designad.
    const supabase = createSupabaseServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            // Använd den hämtade cookieStore
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Försök att sätta cookie via cookieStore
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Ignorera fel som kan uppstå i Server Components/Route Handlers
              // eftersom `set` är avsett för Server Actions/Middleware
              console.warn(`Callback Route: Failed to set cookie "${name}". This might be expected in a Route Handler. Error:`, error);
            }
          },
          remove(name: string, options: CookieOptions) {
            // Försök att ta bort cookie via cookieStore med den nya delete-metoden
            try {
              cookieStore.delete({ name, ...options }); // Använd delete
            } catch (error) {
              // Ignorera fel på samma sätt som för set
              console.warn(`Callback Route: Failed to delete cookie "${name}". This might be expected in a Route Handler. Error:`, error);
            }
          },
        },
      }
    );

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