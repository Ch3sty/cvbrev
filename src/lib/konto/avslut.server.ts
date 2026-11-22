// src/lib/konto/avslut.server.ts
// Läser det som avslutsraden behöver, före raderingen
// (docs/beslut-mejl-och-radering-2026-11-22.md, 2b och 2c punkt 3).
//
// Ger null för undantagna konton (testadresser och admin): de ska aldrig
// räknas i statistiken. För klicktestet utanför produktionen går undantaget
// att stänga av med AVSLUT_TESTA_UNDANTAG=1; i produktionen läses variabeln
// aldrig.

import type { SupabaseClient } from '@supabase/supabase-js'
import { arTestEpost } from '@/lib/admin/undantag'
import { harBetalat } from '@/lib/kampanj/kampanj'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import {
  aktivitetIntervall,
  alderIntervall,
  antalIntervall,
  helaDygn,
  kvartalFor,
  lasAnledning,
  testIntervall,
  type AvslutRad,
  type Kalla,
} from './avslut'

export interface AvslutOpts {
  kalla: Kalla
  anledning?: string | null
}

/** Sant bara utanför produktionen och bara med AVSLUT_TESTA_UNDANTAG=1. */
export function testaUndantagAv(): boolean {
  return process.env.AVSLUT_TESTA_UNDANTAG === '1' && process.env.VERCEL_ENV !== 'production'
}

async function rakna(admin: SupabaseClient, tabell: string, userId: string, slutford = false): Promise<number> {
  let q = admin.from(tabell).select('*', { count: 'exact', head: true }).eq('user_id', userId)
  if (slutford) q = q.not('completed_at', 'is', null)
  const { count, error } = await q
  if (error) throw new Error(`${tabell}: ${error.message}`)
  return count ?? 0
}

/**
 * Avslutsraden för kontot, eller null när kontot är undantaget. Kastar vid
 * läsfel; raderingen fångar det och raderar ändå.
 */
export async function lasAvslut(
  admin: SupabaseClient,
  userId: string,
  opts: AvslutOpts,
  nu: Date = new Date()
): Promise<AvslutRad | null> {
  const { data: profil, error } = await admin
    .from('profiles')
    .select('created_at, last_active, email, subscription_id, subscription_status, paket_started_at, premium_source')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error(`profiles: ${error.message}`)
  const p = (profil ?? {}) as {
    created_at?: string | null
    last_active?: string | null
    email?: string | null
    subscription_id?: string | null
    subscription_status?: string | null
    paket_started_at?: string | null
    premium_source?: string | null
  }

  if (!testaUndantagAv()) {
    if (arTestEpost(p.email)) return null
    const { data: adminRad } = await admin.from('admin_users').select('id').eq('id', userId).maybeSingle()
    if (adminRad) return null
  }

  const [cv, brev, logik, personlighet, sokta, hadePremium] = await Promise.all([
    rakna(admin, 'cv_texts', userId),
    rakna(admin, 'letters', userId),
    rakna(admin, 'logic_test_v4_sessions', userId, true),
    rakna(admin, 'personality_test_sessions', userId, true),
    rakna(admin, 'job_applications', userId),
    userHasAccess(admin, userId, 'any'),
  ])

  const skapad = p.created_at ? new Date(p.created_at) : null
  const dagar = skapad && !Number.isNaN(skapad.getTime()) ? helaDygn(skapad, nu) : 0

  return {
    kvartal: kvartalFor(nu),
    kalla: opts.kalla,
    kontots_alder: alderIntervall(dagar),
    hade_premium: hadePremium,
    har_betalat: harBetalat(p) || p.premium_source === 'play',
    antal_cv: antalIntervall(cv),
    antal_brev: antalIntervall(brev),
    antal_test: testIntervall(logik + personlighet),
    antal_sokta: antalIntervall(sokta),
    dagar_sedan_aktivitet: aktivitetIntervall(p.last_active, nu),
    anledning: lasAnledning(opts.anledning),
  }
}
