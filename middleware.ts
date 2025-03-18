import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  
  // Skapa en supabase-klient med korrekt cookie-hantering
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Konvertera eventuella options.expires (Date-objekt) till sträng
          res.cookies.set({
            name,
            value,
            ...options,
          });
          // Uppdatera responsen som vi ska returnera
          return res;
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
          // Uppdatera responsen som vi ska returnera
          return res;
        },
      },
    }
  );
  
  // Synka session (detta uppdaterar automatiskt cookies via `set` ovan)
  await supabase.auth.getSession();
  
  // Returnera responsen med korrekt uppdaterade cookies
  return res;
}

// Kör middleware på alla routes som kan behöva autentisering
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};