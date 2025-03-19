// src/lib/supabase/server.ts
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { type Database } from '@/types/database.types'

// För serverkomponenter och API-routes
// OBS: Den förväntar sig att du skickar in cookie‑lagret direkt (exempelvis: createServerClient({ cookies }))
export const createServerClient = ({ cookies }) => {
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookies.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookies.set(name, value, options)
          } catch (error) {
            // Kan ignoreras om anropat från en Server Component
          }
        },
        remove(name, options) {
          try {
            cookies.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            // Kan ignoreras om anropat från en Server Component
          }
        },
      },
    }
  )
}
