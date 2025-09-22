// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '@/types/database.types'

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Handle cookie parsing errors gracefully
          if (typeof document === 'undefined') return undefined;

          try {
            const cookies = document.cookie.split('; ');
            const cookie = cookies.find(c => c.startsWith(`${name}=`));
            return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
          } catch (error) {
            console.warn('Cookie parsing error:', error);
            return undefined;
          }
        },
        set(name: string, value: string, options?: any) {
          // Handle cookie setting errors gracefully
          if (typeof document === 'undefined') return;

          try {
            let cookieString = `${name}=${encodeURIComponent(value)}`;

            if (options?.maxAge) {
              cookieString += `; Max-Age=${options.maxAge}`;
            }
            if (options?.path) {
              cookieString += `; Path=${options.path}`;
            }
            if (options?.domain) {
              cookieString += `; Domain=${options.domain}`;
            }
            if (options?.secure) {
              cookieString += '; Secure';
            }
            if (options?.sameSite) {
              cookieString += `; SameSite=${options.sameSite}`;
            }

            document.cookie = cookieString;
          } catch (error) {
            console.warn('Cookie setting error:', error);
          }
        },
        remove(name: string, options?: any) {
          // Remove cookie by setting it with expired date
          if (typeof document === 'undefined') return;

          try {
            let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;

            if (options?.path) {
              cookieString += `; Path=${options.path}`;
            }
            if (options?.domain) {
              cookieString += `; Domain=${options.domain}`;
            }

            document.cookie = cookieString;
          } catch (error) {
            console.warn('Cookie removal error:', error);
          }
        },
      },
    }
  )
}