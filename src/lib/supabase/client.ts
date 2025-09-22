// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '@/types/database.types'
import { parseCookies, parseCookieValue, stringifyCookieValue } from './cookie-helpers'

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined;

          try {
            const cookies = parseCookies(document.cookie);
            const value = cookies[name];

            if (!value) return undefined;

            // Special handling for Supabase auth cookies
            if (name.includes('auth-token') || name.includes('refresh-token') || name.includes('provider-token')) {
              // These should be returned as-is
              try {
                return decodeURIComponent(value);
              } catch {
                return value;
              }
            }

            // For other cookies, try to parse JSON if applicable
            return parseCookieValue(value);
          } catch (error) {
            // Silently handle errors to avoid console spam
            return undefined;
          }
        },
        set(name: string, value: string, options?: any) {
          if (typeof document === 'undefined') return;

          try {
            // Don't encode if it's already a string that looks encoded
            const cookieValue = typeof value === 'string' && !value.includes('%')
              ? encodeURIComponent(value)
              : value;

            let cookieString = `${name}=${cookieValue}`;

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
            // Silently handle errors
          }
        },
        remove(name: string, options?: any) {
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
            // Silently handle errors
          }
        },
      },
    }
  )
}