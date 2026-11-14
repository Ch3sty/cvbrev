import 'server-only'

/**
 * Kampanjbehörighet på servern. Visningen (inloggat, köpsteget) läser bara
 * profilen. Kassan läser dessutom Stripe, så att ett konto vars profil
 * saknar spår av ett gammalt köp ändå inte får rabatten.
 */

import { cache } from 'react'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/server'
import { aktivKampanj, harBetalat, type BetalProfil, type Kampanj } from './kampanj'

const FALT = 'subscription_id, subscription_status, paket_started_at, premium_source, stripe_customer_id'

type ProfilRad = BetalProfil & { stripe_customer_id?: string | null }

async function lasProfil(userId: string): Promise<ProfilRad | null> {
  const { data, error } = await (getSupabaseAdmin() as any)
    .from('profiles')
    .select(FALT)
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return (data as ProfilRad | null) ?? null
}

/**
 * Visningens läsning delas inom samma rendering: dashboard-layouten och
 * provsidan frågar båda under kampanjen. Kassan läser alltid färskt.
 */
const lasProfilForVisning = cache(lasProfil)

export interface Behorighet {
  /** Kampanjen som pågår, oavsett konto. */
  kampanj: Kampanj | null
  /** Kontot kan få priset. Null när ingen kampanj pågår. */
  behorig: boolean | null
}

/** För visning: pågående kampanj och om kontot kan få den, ur profilen. */
export async function kampanjForVisning(userId: string, nu: Date): Promise<Behorighet> {
  const kampanj = aktivKampanj(nu)
  if (!kampanj) return { kampanj: null, behorig: null }
  try {
    const profil = await lasProfilForVisning(userId)
    return { kampanj, behorig: !harBetalat(profil) }
  } catch (error) {
    // Ett läsfel visar ingen kampanj. Hellre det än ett pris kassan sedan nekar.
    console.error('[kampanj] kunde inte läsa profilen:', error)
    return { kampanj, behorig: false }
  }
}

/** Har Stripe-kunden någonsin haft en prenumeration eller ett betalt engångsköp? */
async function stripeHarBetalat(customerId: string): Promise<boolean> {
  const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 1 })
  if (subs.data.length > 0) return true
  const pis = await stripe.paymentIntents.list({ customer: customerId, limit: 10 })
  return pis.data.some((pi) => pi.status === 'succeeded')
}

/**
 * Facit i kassan: kampanjen som ska läggas på köpet, eller null. Profilen
 * först (billigt), sedan Stripe. Ett fel mot Stripe ger ingen rabatt.
 */
export async function kampanjForKop(userId: string, customerId: string, nu: Date): Promise<Kampanj | null> {
  const kampanj = aktivKampanj(nu)
  if (!kampanj) return null
  const profil = await lasProfil(userId)
  if (harBetalat(profil)) return null
  try {
    if (await stripeHarBetalat(customerId)) return null
  } catch (error) {
    console.error('[kampanj] Stripe-kontrollen misslyckades, ingen rabatt:', error)
    return null
  }
  return kampanj
}
