/**
 * Den inloggade användaren i en serverkomponent, utan egen rundtur till
 * Supabase Auth när proxyn redan gjort den (anvandare-header.ts).
 *
 * cache() gör att layout, sida och strömmade delar i samma request delar
 * ett svar. Saknas en giltig header, till exempel för en adress som inte gick
 * genom proxyn, görs auth.getUser() som förut. Den här funktionen förnyar
 * aldrig sessionen; det gör bara proxyn.
 */
import 'server-only'
import { cache } from 'react'
import { cookies, headers } from 'next/headers'
import type { User } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { ANVANDARE_HEADER, lasSigneradAnvandare } from '@/lib/supabase/anvandare-header'

export const hamtaVerifieradAnvandare = cache(async (): Promise<User | null> => {
  const h = await headers()
  const franProxyn = await lasSigneradAnvandare(h.get(ANVANDARE_HEADER))
  if (franProxyn) return franProxyn

  const supabase = createServerClient({ cookies: await cookies() })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})
