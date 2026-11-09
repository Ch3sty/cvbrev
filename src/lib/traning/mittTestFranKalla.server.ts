// src/lib/traning/mittTestFranKalla.server.ts
// =============================================================================
// Valet "Mitt test" som följer med från artikeln till kontot (saas-leads
// slutliga beslut 2026-11-10, beslut 4 och 6, och 2.3 "som dold parameter,
// inget nytt steg").
//
// /dashboard/valkommen anropar sattMittTestFranKalla för ett nytt konto med
// kakan jc_provkalla. Planen får valet tyst (mittTest.ts planFranVal), utan
// provdatum och utan variant. Finns redan en plan rörs den inte: valet som
// användaren gjort själv går alltid före artikeln.
//
// Svaret säger om provdatumskärmen ska visas: bara för I-prov och lokförare,
// och bara när planen saknar datum.
// =============================================================================

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fragaProvdatumEfterKonto, type Provkalla } from '@/lib/analytics/provkalla';
import { planFranVal, type MittTest } from './mittTest';

export interface MittTestFranKalla {
  /** Valet som står på planen efter anropet, eller null. */
  mittTest: MittTest | null;
  /** Sattes valet nu (inte redan på planen)? */
  satt: boolean;
  /** Provdatumskärmen efter kontot (beslut 4). */
  provdatumSkarm: boolean;
}

const INGET: MittTestFranKalla = { mittTest: null, satt: false, provdatumSkarm: false };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sattMittTestFranKalla(admin: SupabaseClient<any>, userId: string, kalla: Provkalla | null): Promise<MittTestFranKalla> {
  if (!kalla?.mitt_test) return INGET;
  try {
    const { data: fore, error: lasFel } = await admin
      .from('test_planer')
      .select('mitt_test, provdatum')
      .eq('user_id', userId)
      .maybeSingle();
    if (lasFel) throw lasFel;
    if (fore) {
      const val = (fore.mitt_test as MittTest | null) ?? null;
      return { mittTest: val, satt: false, provdatumSkarm: fragaProvdatumEfterKonto(val) && !fore.provdatum };
    }
    const p = planFranVal(kalla.mitt_test, null, []);
    const { error } = await admin
      .from('test_planer')
      .upsert({ user_id: userId, ...p, uppdaterad_at: new Date().toISOString() }, { onConflict: 'user_id', ignoreDuplicates: true });
    if (error) throw error;
    return { mittTest: kalla.mitt_test, satt: true, provdatumSkarm: fragaProvdatumEfterKonto(kalla.mitt_test) };
  } catch (e) {
    // Valet är en genväg, inte ett krav: utan det landar kontot som förut.
    console.error('[mitt_test] kunde inte sätta valet från artikeln:', e);
    return INGET;
  }
}
