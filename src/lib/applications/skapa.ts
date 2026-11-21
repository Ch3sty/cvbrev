// src/lib/applications/skapa.ts
// Att skapa en sökt tjänst: valideringen och skrivningen som POST
// /api/applications alltid gjort, flyttad hit så att "Markera som sökt" på
// en Ska sökas-rad (POST /api/jobbsok/ska-sokas/[id]/sokt) skapar tjänsten
// på exakt samma sätt. Idempotent på letter_id.
//
// Bara server. Skriver med användarens session (RLS på job_applications).

import type { SupabaseClient } from '@supabase/supabase-js';
import type { JobApplication } from './status';
import { markeraBricka } from '@/lib/onboarding/komigang-server';

const VALID_CHANNELS = ['ad', 'unsolicited', 'network'];

export type SkapaFel =
  | { status: 400; error: string; code: 'job_title' | 'company' }
  | { status: 404; error: string; code: 'letter_not_found' }
  | { status: 500; error: string; code: 'insert_failed' };

export type SkapaSvar =
  | { ok: true; data: JobApplication; alreadyExists: boolean }
  | ({ ok: false } & SkapaFel);

/** Svensk kalenderdag i dag, 'YYYY-MM-DD'. */
function idagSv(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

export async function skapaSoktTjanst(
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  body: Record<string, unknown>
): Promise<SkapaSvar> {
  const jobTitle = typeof body.job_title === 'string' ? body.job_title.trim() : '';
  const company = typeof body.company === 'string' ? body.company.trim() : '';
  if (!jobTitle || jobTitle.length > 200) {
    return { ok: false, status: 400, error: 'Tjänstetitel krävs (max 200 tecken)', code: 'job_title' };
  }
  if (!company || company.length > 200) {
    return { ok: false, status: 400, error: 'Arbetsgivare krävs (max 200 tecken)', code: 'company' };
  }

  const channel = typeof body.application_channel === 'string' && VALID_CHANNELS.includes(body.application_channel)
    ? body.application_channel
    : 'ad';
  const location = typeof body.location === 'string' ? body.location.trim().slice(0, 200) || null : null;
  const jobAdUrl = typeof body.job_ad_url === 'string' ? body.job_ad_url.trim().slice(0, 2048) || null : null;
  const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 4000) || null : null;
  const letterId = typeof body.letter_id === 'string' && body.letter_id ? body.letter_id : null;
  const cvId = typeof body.cv_id === 'string' && body.cv_id ? body.cv_id : null;

  // Datum: YYYY-MM-DD, förvalt idag. Framtida datum tillåts inte.
  // (Förut UTC-dagen; nu svensk dag, så att en loggning efter midnatt hamnar rätt.)
  let appliedAt = idagSv();
  if (typeof body.applied_at === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.applied_at)) {
    if (body.applied_at <= appliedAt) appliedAt = body.applied_at;
  }

  if (letterId) {
    // Idempotens: finns redan en ansökan för det här brevet, returnera den.
    const { data: existing } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('letter_id', letterId)
      .maybeSingle();
    if (existing) {
      return { ok: true, data: existing as JobApplication, alreadyExists: true };
    }

    // Brevet måste tillhöra användaren.
    const { data: letter } = await supabase
      .from('letters')
      .select('id')
      .eq('id', letterId)
      .eq('user_id', userId)
      .maybeSingle();
    if (!letter) {
      return { ok: false, status: 404, error: 'Brevet hittades inte', code: 'letter_not_found' };
    }
  }

  const { data: created, error: insertError } = await supabase
    .from('job_applications')
    .insert({
      user_id: userId,
      job_title: jobTitle,
      company,
      location,
      application_channel: channel,
      job_ad_url: jobAdUrl,
      letter_id: letterId,
      cv_id: cvId,
      notes,
      applied_at: appliedAt,
    })
    .select()
    .single();

  if (insertError || !created) {
    console.error('Fel vid skapande av ansökan:', insertError);
    return { ok: false, status: 500, error: insertError?.message || 'Kunde inte spara den sökta tjänsten', code: 'insert_failed' };
  }

  // Första händelsen i tidslinjen; triggern sätter current_status = 'applied'.
  const { error: eventError } = await supabase
    .from('job_application_events')
    .insert({ application_id: created.id, event_type: 'applied', occurred_at: appliedAt });
  if (eventError) {
    console.error('Fel vid skapande av ansökt-händelse:', eventError);
  }

  // Kallad till test (Jobbsöket omgång 2, 9.16): bara från testvägen och bara
  // när rutan är kryssad. En egen insert efter applied, så att triggern sätter
  // test_invited också när båda händelserna har samma dag (created_at avgör).
  let status: JobApplication['current_status'] = 'applied';
  if (!eventError && arKalladTillTest(body)) {
    status = (await skrivKalladTillTest(supabase, created.id)) ? 'test_invited' : 'applied';
  }

  // Kom igång-brickan "Logga en tjänst du har sökt" (Jobbsöket omgång 2).
  // Mäter onboarding_step_completed första gången och kastar aldrig.
  void markeraBricka(userId, 'sokt_tjanst');

  return { ok: true, data: { ...(created as JobApplication), current_status: status }, alreadyExists: false };
}

/** Testvägens två adresser (9.14). */
export const TESTVAG_FRAN = ['test-hem', 'test-hem-plan'] as const;

/** kallad_till_test gäller bara när det är true och anropet kommer från testvägen. */
export function arKalladTillTest(body: Record<string, unknown>): boolean {
  return body.kallad_till_test === true && typeof body.fran === 'string' && (TESTVAG_FRAN as readonly string[]).includes(body.fran);
}

/**
 * Skriver "Kallad till test" i dag (svensk tid), med ett försök till. Faller
 * båda loggas felet och tjänsten står kvar som sökt. Före migreringen
 * 20261122120000 nekar databasens villkor typen, och det blir just det läget.
 */
async function skrivKalladTillTest(supabase: SupabaseClient<any, any, any>, applicationId: string): Promise<boolean> {
  const rad = { application_id: applicationId, event_type: 'test_invited', occurred_at: idagSv() };
  for (let forsok = 0; forsok < 2; forsok++) {
    const { error } = await supabase.from('job_application_events').insert(rad);
    if (!error) return true;
    if (forsok === 1) console.error('Fel vid skapande av händelsen kallad till test:', error);
  }
  return false;
}
