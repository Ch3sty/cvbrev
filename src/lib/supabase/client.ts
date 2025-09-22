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
            if (value === 'undefined' || value === 'null' || value === '' || value === '""' || value === "''") {
              return undefined;
            }

            // Special handling for Supabase auth cookies
            if (name.includes('auth-token') || name.includes('refresh-token') || name.includes('provider-token') || name.includes('sb-')) {
              // Handle base64 encoded values
              if (value.startsWith('base64-')) {
                return value;
              }

              // Handle quotes around the value (common from old auth-helpers)
              let cleanValue = value;
              if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
                  (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
                cleanValue = cleanValue.slice(1, -1);
              }

              // Try to decode URI component
              try {
                const decoded = decodeURIComponent(cleanValue);
                // Check if decoded value is valid
                if (decoded === 'undefined' || decoded === 'null' || decoded === '' || decoded === '""' || decoded === "''") {
                  return undefined;
                }

                // If it's a JSON string after decoding, try to parse it
                if ((decoded.startsWith('{') && decoded.endsWith('}')) ||
                    (decoded.startsWith('[') && decoded.endsWith(']'))) {
                  try {
                    return JSON.parse(decoded);
                  } catch {
                    // Return the decoded string if it's not valid JSON
                    return decoded;
                  }
                }

                return decoded;
              } catch {
                // If decoding fails, try the original value
                return cleanValue;
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
            // Log error in development, silently handle in production
            if (process.env.NODE_ENV === 'development') {
              console.warn('Cookie parsing error for', name, ':', error);
            }
            return undefined;
          }
        },
        set(name: string, value: string, options?: any) {
          if (typeof document === 'undefined') return;

          try {
            // Prevent setting invalid values
            if (value === 'undefined' || value === undefined as any || value === null || value === 'null' || value === '') {
              // Remove the cookie instead
              this.remove(name, options);
              return;
            }

            // Clean the value before setting
            let cleanValue = value;

            // Remove any existing quotes that might be causing issues
            if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
                (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
              cleanValue = cleanValue.slice(1, -1);
            }

            // Validate that the value isn't still invalid after cleaning
            if (cleanValue === 'undefined' || cleanValue === 'null' || cleanValue === '') {
              this.remove(name, options);
              return;
            }

            // Handle encoding properly for Supabase auth cookies
            let cookieValue = cleanValue;
            if (name.includes('auth-token') || name.includes('refresh-token') || name.includes('provider-token') || name.includes('sb-')) {
              // For auth cookies, ensure proper encoding
              if (!cleanValue.startsWith('base64-')) {
                try {
                  // Test if it's valid JSON before encoding
                  if (cleanValue.startsWith('{') || cleanValue.startsWith('[')) {
                    JSON.parse(cleanValue); // Validate JSON
                  }
                  cookieValue = encodeURIComponent(cleanValue);
                } catch (jsonError) {
                  // If JSON is invalid, don't set the cookie
                  if (process.env.NODE_ENV === 'development') {
                    console.warn('Invalid JSON value for cookie', name, ':', jsonError);
                  }
                  return;
                }
              }
            } else {
              // For other cookies, encode if not already encoded and not base64
              if (!cleanValue.includes('%') && !cleanValue.startsWith('base64-')) {
                cookieValue = encodeURIComponent(cleanValue);
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
            // Log error in development, silently handle in production
            if (process.env.NODE_ENV === 'development') {
              console.warn('Cookie setting error for', name, ':', error);
            }
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