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

/**
 * Auth-låset med frist.
 *
 * Biblioteket tar ett navigator.locks-lås på sessionen före varje anrop som
 * behöver access-token, och begär det med oändlig väntetid (-1). Håller en
 * annan flik låset (till exempel en tokenförnyelse som hakat upp sig) blir
 * promisen aldrig klar och avvisas aldrig, så inte ens try/catch hjälper.
 * 2026-09-15 stod CV-analysen still i 90 sekunder av exakt det skälet.
 *
 * Här får varje förvärv högst fem sekunder. Går fristen ut kör vi anropet
 * utan lås: en sällsynt dubbel förnyelse är bättre än ett flöde som hänger.
 */
const LOCK_TIMEOUT_MS = 5000

async function boundedLock<R>(
  name: string,
  acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> {
  if (typeof navigator === 'undefined' || !navigator.locks) return fn()
  const timeout = acquireTimeout < 0 ? LOCK_TIMEOUT_MS : acquireTimeout
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await navigator.locks.request(name, { signal: controller.signal }, () => fn())
  } catch (error) {
    if (controller.signal.aborted) return fn()
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { lock: boundedLock } }
  )
}
