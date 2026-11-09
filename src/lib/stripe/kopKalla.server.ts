// src/lib/stripe/kopKalla.server.ts
// =============================================================================
// Köpet kopplat till källan och valet (saas-leads beslut 6, 2026-11-10, och
// säljgranskningen avsnitt 4: "Köp i Stripe med kontots id, så att Supabase
// kan koppla köpet till källa och val").
//
// Kassans metadata har redan supabaseUUID, så köpet går att koppla till
// profiles.acquisition_source och test_planer i Supabase. Här läggs källan,
// valet och dagarna till provet också i Stripe, som de såg ut vid köpet, så
// att Stripe-exporten går att läsa utan Supabase och att ett senare ändrat
// val inte skriver om historien.
//
// Läsfel ger tom metadata: kassan får aldrig stoppas av mätning.
// =============================================================================

import 'server-only';
import { arGiltigDag, dagSthlm, dagarMellan } from '@/lib/traning/datum';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function kopKallaMetadata(admin: any, userId: string): Promise<Record<string, string>> {
  try {
    const [profilRes, planRes] = await Promise.all([
      admin.from('profiles').select('acquisition_source').eq('id', userId).maybeSingle(),
      admin.from('test_planer').select('mitt_test, mitt_test_variant, provdatum').eq('user_id', userId).maybeSingle(),
    ]);
    const ut: Record<string, string> = {};
    const acq = profilRes?.data?.acquisition_source as Record<string, unknown> | null | undefined;
    if (acq && typeof acq.kalla === 'string') ut.konto_kalla = acq.kalla.slice(0, 120);
    const plan = planRes?.data as { mitt_test?: unknown; mitt_test_variant?: unknown; provdatum?: unknown } | null | undefined;
    if (plan && typeof plan.mitt_test === 'string') ut.mitt_test = plan.mitt_test;
    if (plan && typeof plan.mitt_test_variant === 'string') ut.mitt_test_variant = plan.mitt_test_variant;
    if (plan && arGiltigDag(plan.provdatum)) {
      ut.provdatum = plan.provdatum;
      ut.provdatum_dagar_kvar = String(dagarMellan(dagSthlm(), plan.provdatum));
    }
    return ut;
  } catch (e) {
    console.error('[stripe] kopKallaMetadata:', e);
    return {};
  }
}
