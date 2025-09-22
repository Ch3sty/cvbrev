// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '@/types/database.types'
import { parseCookies } from './cookie-helpers'
// Import storage initializer to ensure it runs first
import './storage-init'

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

            // Handle invalid values
            if (value === 'undefined' || value === 'null' || value === '') {
              return undefined;
            }

            // Special handling for Supabase auth cookies
            if (name.includes('auth-token') || name.includes('refresh-token') || name.includes('provider-token') || name.includes('sb-')) {
              // Handle base64 encoded values
              if (value.startsWith('base64-')) {
                return value;
              }

              // Try to decode URI component
              try {
                const decoded = decodeURIComponent(value);
                // Check if decoded value is valid
                if (decoded === 'undefined' || decoded === 'null' || decoded === '') {
                  return undefined;
                }
                return decoded;
              } catch {
                return value;
              }
            }

            // For JSON-like values, parse safely
            if (value.startsWith('{') || value.startsWith('[')) {
              try {
                return JSON.parse(value);
              } catch {
                // Not valid JSON, return as string
                return value;
              }
            }

            // Return as-is for other values
            return value;
          } catch (error) {
            // Silently handle errors to avoid console spam
            return undefined;
          }
        },
        set(name: string, value: string, options?: any) {
          if (typeof document === 'undefined') return;

          try {
            // Prevent setting invalid values
            if (value === 'undefined' || value === undefined as any || value === null || value === 'null') {
              // Remove the cookie instead
              this.remove(name, options);
              return;
            }

            // Handle encoding properly
            let cookieValue = value;
            if (typeof value === 'string') {
              // Don't double-encode
              if (!value.includes('%') && !value.startsWith('base64-')) {
                cookieValue = encodeURIComponent(value);
              }
            }

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