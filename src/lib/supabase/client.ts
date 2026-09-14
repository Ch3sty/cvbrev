// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { type Database } from '@/types/database.types'
// Import storage initializer to ensure it runs first
import './storage-init'

/**
 * Webbläsarklienten använder @supabase/ssr:s inbyggda cookie-hantering.
 *
 * Tidigare fanns ett handrullat get/set/remove-lager här. Det gjorde två saker
 * fel: `get` körde JSON.parse och returnerade ett objekt där biblioteket
 * förväntar sig en sträng, och `set` skrev cookies utan att hantera bibliotekets
 * chunkning (sb-...-auth-token.0/.1). Resultatet blev halvlästa sessioner och
 * en webbläsare som förnyade sin token parallellt med servern, vilket gav
 * refresh token reuse (`token_revoked`).
 *
 * Standardimplementationen läser och skriver document.cookie korrekt, inklusive
 * chunkade auth-cookies, och delar samma cookie-format som serverklienten.
 */
export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
