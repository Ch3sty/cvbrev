/**
 * Gemensamt för rutterna under /api/jobbsok: sessionen, kroppen, felsvaren
 * och ägarkontrollen. Nya tabeller (job_saved_ads, job_application_followups)
 * skrivs med admin-klienten efter att sessionen kontrollerats; varje
 * skrivning filtrerar själv på user_id.
 *
 * Bara server.
 */
import 'server-only'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { arUuid } from './validering'
import { arSchemaFel } from './schema'
import type { Klient } from './server'
import type { JobApplication } from './typer'

export { arSchemaFel }

export interface Session {
  supabase: Klient
  user: User
}

/** Sessionen, eller ett färdigt 401-svar. */
export async function krav(): Promise<Session | NextResponse> {
  const supabase = createServerClient({ cookies: await cookies() }) as Klient
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Ej autentiserad', code: 'unauthorized' }, { status: 401 })
  return { supabase, user }
}

export function admin(): Klient {
  return getSupabaseAdmin() as unknown as Klient
}

export function felSvar(status: number, code: string, error: string, extra: Record<string, unknown> = {}): NextResponse {
  return NextResponse.json({ error, code, ...extra }, { status })
}

export const MIGRERING_SAKNAS = () =>
  felSvar(503, 'migrering_saknas', 'Funktionen är inte på plats än. Försök igen senare.')

/** JSON-kroppen, eller null när den inte går att läsa. Tom kropp ger {}. */
export async function lasKropp(request: Request): Promise<Record<string, unknown> | null> {
  const text = await request.text().catch(() => null)
  if (text === null) return null
  if (!text.trim()) return {}
  try {
    const v = JSON.parse(text)
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** Den sökta tjänsten om den är användarens. Läses med sessionen (RLS). */
export async function agdTjanst(supabase: Klient, userId: string, id: string): Promise<JobApplication | null> {
  if (!arUuid(id)) return null
  const { data } = await supabase.from('job_applications').select('*').eq('id', id).eq('user_id', userId).maybeSingle()
  return (data as JobApplication | null) ?? null
}
