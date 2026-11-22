// src/lib/recruiter/auth.ts
// Gemensam auktorisering för rekryterar-API:erna.
//
// Flöde: cookie-auth (401 om utloggad) → recruiter_profiles-raden läses via
// användarens egen klient (RLS: ägaren läser sin rad). Saknas raden eller är
// status inte 'approved' svarar vi 403 { code: 'not_approved', status } så
// klienten kan visa rätt vy (registrera/väntar/avslagen).
//
// Villkoren (ägarbeslut 2026-11-22): en godkänd rekryterare som inte har
// godkänt villkoren för rekryterare får 403 { code: 'villkor_saknas' } från
// alla rutter som använder requireApprovedRecruiter, så att poolen aldrig
// visas innan villkoren är godkända. Se src/lib/recruiter/villkor.ts.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { harGodkantVillkor } from './villkor';

export type RecruiterStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface RecruiterRow {
  user_id: string;
  company_name: string | null;
  contact_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  villkor_godkanda_at: string | null;
  villkor_version: string | null;
}

export interface RecruiterAuth {
  user: User;
  recruiter: RecruiterRow | null;
}

/** Inloggad användare + eventuell rekryterarrad. null = ej inloggad. */
export async function getRecruiterAuth(): Promise<RecruiterAuth | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: recruiter } = await (supabase as any)
    .from('recruiter_profiles')
    .select('user_id, company_name, contact_name, status, villkor_godkanda_at, villkor_version')
    .eq('user_id', user.id)
    .maybeSingle();

  return { user, recruiter: (recruiter as RecruiterRow | null) ?? null };
}

export type ApprovedRecruiter = { user: User; recruiter: RecruiterRow };

/**
 * Kräver godkänd rekryterare. Returnerar antingen kontexten eller ett färdigt
 * felsvar (401/403) som routen ska returnera direkt.
 */
export async function requireApprovedRecruiter(): Promise<
  { ok: true; ctx: ApprovedRecruiter } | { ok: false; response: NextResponse }
> {
  const auth = await getRecruiterAuth();
  if (!auth) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  if (!auth.recruiter || auth.recruiter.status !== 'approved') {
    const status: RecruiterStatus = auth.recruiter?.status ?? 'none';
    return {
      ok: false,
      response: NextResponse.json({ code: 'not_approved', status }, { status: 403 }),
    };
  }
  if (!harGodkantVillkor(auth.recruiter)) {
    return {
      ok: false,
      response: NextResponse.json({ code: 'villkor_saknas', status: 'approved' }, { status: 403 }),
    };
  }
  return { ok: true, ctx: { user: auth.user, recruiter: auth.recruiter } };
}
