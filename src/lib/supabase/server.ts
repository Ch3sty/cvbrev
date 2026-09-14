// src/lib/supabase/server.ts
import {
  createServerClient as createSupabaseServerClient,
  type CookieMethodsServer,
} from '@supabase/ssr'
import { type Database } from '@/types/database.types'

/**
 * Cookie-lagret som anropare skickar in. Två former förekommer i kodbasen:
 *
 *  1. Ett Next-cookie-store (`await cookies()`) i Server Components och Route
 *     Handlers. Det har getAll/set och saknar ofta skrivrätt i RSC.
 *  2. Ett handrullat lager i proxy/middleware som speglar skrivningar till både
 *     request och response (se src/lib/supabase/middleware.ts).
 *
 * Vi normaliserar båda till @supabase/ssr:s getAll/setAll-API. Det gamla
 * get/set/remove-API:t är utfasat och kan inte skriva tillbaka hela cookie-
 * uppsättningen atomärt vid en tokenförnyelse, vilket gav halvskrivna
 * sessioner och refresh token reuse (`token_revoked`).
 */
type IncomingCookieStore = {
  getAll?: () => Array<{ name: string; value: string }>
  get?: (name: string) => { value?: string } | string | undefined
  set?: (...args: any[]) => void
  setAll?: (cookies: Array<{ name: string; value: string; options?: any }>) => void
  delete?: (...args: any[]) => void
}

function normalizeCookies(store: IncomingCookieStore): CookieMethodsServer {
  return {
    getAll() {
      try {
        if (typeof store.getAll === 'function') {
          return store.getAll()
        }
      } catch (error) {
        console.warn('Supabase cookie getAll error:', error)
      }
      return []
    },
    setAll(cookiesToSet) {
      try {
        if (typeof store.setAll === 'function') {
          store.setAll(cookiesToSet)
          return
        }
        if (typeof store.set === 'function') {
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options)
          }
        }
      } catch {
        // Förväntat när setAll anropas från en Server Component: där går det
        // inte att skriva cookies. Proxyn (updateSession) har redan förnyat
        // och skrivit tillbaka sessionen för den här requesten, så det är
        // säkert att svälja felet här.
      }
    },
  }
}

// För serverkomponenter och API-routes.
// OBS: Den förväntar sig att du skickar in cookie-lagret direkt
// (exempelvis: createServerClient({ cookies: await cookies() })).
export const createServerClient = ({ cookies }: { cookies: any }) => {
  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: normalizeCookies(cookies as IncomingCookieStore),
    }
  )
}
