/**
 * IP-baserad rate limiting för publika, oautentiserade routes
 * (docs/plan-konvertering.md, C6).
 *
 * Vi lagrar aldrig rå IP. Adressen hashas med en peppar ur miljön, så en
 * databasdump inte går att koppla tillbaka till enskilda besökare. Räknaren
 * ligger i public_rate_limits med ett dygnsfönster per (ip_hash, scope).
 */

import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Hashar en IP. Pepparen sätts i RATE_LIMIT_PEPPER, annars en fast fallback. */
export function hashIp(ip: string): string {
  const pepper = process.env.RATE_LIMIT_PEPPER ?? 'jobbcoach'
  return createHash('sha256').update(ip + pepper).digest('hex')
}

/**
 * Plockar klientens IP ur proxy-headers. Vercel sätter x-forwarded-for;
 * första adressen är klienten, resten är proxykedjan.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/** Början av det dygnsfönster tidpunkten faller i (UTC-midnatt). */
function windowStart(now: Date): string {
  const start = new Date(now)
  start.setUTCHours(0, 0, 0, 0)
  return start.toISOString()
}

export interface RateLimitResult {
  allowed: boolean
  used: number
  limit: number
  /** När fönstret nollställs. */
  resetAt: string
}

/**
 * Räknar upp och kontrollerar kvoten för en IP inom ett scope.
 *
 * Vid databasfel släpper vi igenom: en trasig räknare får inte stänga
 * funktionen för alla. Det globala dygnstaket är skyddet mot skenande kostnad.
 */
export async function checkIpRateLimit(
  admin: SupabaseClient<any>,
  ip: string,
  scope: string,
  limit: number,
  now: Date = new Date()
): Promise<RateLimitResult> {
  const ipHash = hashIp(ip)
  const start = windowStart(now)
  const resetAt = new Date(new Date(start).getTime() + 24 * 60 * 60 * 1000).toISOString()

  try {
    const { data: existing } = await admin
      .from('public_rate_limits')
      .select('count')
      .eq('ip_hash', ipHash)
      .eq('scope', scope)
      .eq('window_start', start)
      .maybeSingle()

    const used = (existing as { count?: number } | null)?.count ?? 0

    if (used >= limit) {
      return { allowed: false, used, limit, resetAt }
    }

    await admin
      .from('public_rate_limits')
      .upsert(
        { ip_hash: ipHash, scope, window_start: start, count: used + 1 },
        { onConflict: 'ip_hash,scope,window_start' }
      )

    return { allowed: true, used: used + 1, limit, resetAt }
  } catch (err) {
    console.error('[rate-limit] Kunde inte läsa eller skriva kvot:', err)
    return { allowed: true, used: 0, limit, resetAt }
  }
}

export interface BudgetResult {
  allowed: boolean
  used: number
  limit: number
}

/**
 * Globalt dygnstak per scope. Skyddar mot att en enskild dag kostar mer än
 * vi tänkt, oavsett hur många IP-adresser trafiken kommer från.
 *
 * Till skillnad från IP-kvoten stänger vi vid databasfel: taket är hela
 * poängen, och ett tak som inte går att läsa är inget tak.
 */
export async function checkDailyBudget(
  admin: SupabaseClient<any>,
  scope: string,
  limit: number,
  now: Date = new Date()
): Promise<BudgetResult> {
  const day = now.toISOString().slice(0, 10)

  try {
    const { data: existing } = await admin
      .from('public_generation_budget')
      .select('count')
      .eq('day', day)
      .eq('scope', scope)
      .maybeSingle()

    const used = (existing as { count?: number } | null)?.count ?? 0

    if (used >= limit) {
      return { allowed: false, used, limit }
    }

    await admin
      .from('public_generation_budget')
      .upsert({ day, scope, count: used + 1 }, { onConflict: 'day,scope' })

    return { allowed: true, used: used + 1, limit }
  } catch (err) {
    console.error('[rate-limit] Kunde inte läsa dygnstaket:', err)
    return { allowed: false, used: limit, limit }
  }
}
