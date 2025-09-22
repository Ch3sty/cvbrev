// src/lib/supabase/server.ts
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { type Database } from '@/types/database.types'

// För serverkomponenter och API-routes
// OBS: Den förväntar sig att du skickar in cookie‑lagret direkt (exempelvis: createServerClient({ cookies }))
export const createServerClient = ({ cookies }: { cookies: any }) => {
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            const cookie = cookies.get(name);
            // Handle both string and object cookie values
            if (typeof cookie === 'string') {
              return cookie;
            }
            return cookie?.value;
          } catch (error) {
            console.warn('Server cookie get error:', error);
            return undefined;
          }
        },
        set(name: string, value: string, options: any) {
          try {
            cookies.set(name, value, options)
          } catch (error) {
            // Kan ignoreras om anropat från en Server Component
            console.debug('Server cookie set - expected in Server Components');
          }
        },
        remove(name: string, options: any) {
          try {
            cookies.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            // Kan ignoreras om anropat från en Server Component
            console.debug('Server cookie remove - expected in Server Components');
          }
        },
      },
    }
  )
}