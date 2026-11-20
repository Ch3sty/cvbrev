// src/lib/tester/installningar.server.ts
// =============================================================================
// Träna-inställningen (plan-testflode-2026-11-20 beslut 3): kryssrutan
// "Förklaring efter varje svar" på Träna-startskärmen, sparad per konto i
// profiles.test_installningar (nullbar jsonb, migreringen
// 20261120200000_profiles_test_installningar.sql). En gränssnittsinställning,
// ingen personuppgift. Skrivs bara av /api/traning/installningar; null eller
// saknad kolumn betyder standardläget (på).
// =============================================================================

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

export interface TestInstallningar {
  forklaring_efter_svar: boolean;
}

export const STANDARD_INSTALLNINGAR: TestInstallningar = { forklaring_efter_svar: true };

export function lasInstallningar(varde: unknown): TestInstallningar {
  const v = varde as Partial<TestInstallningar> | null;
  return {
    forklaring_efter_svar: typeof v?.forklaring_efter_svar === 'boolean' ? v.forklaring_efter_svar : STANDARD_INSTALLNINGAR.forklaring_efter_svar,
  };
}

/** Läser med service role, villkorat på id. Fel och saknad kolumn ger standardläget. */
export async function lasTestInstallningar(admin: Klient, userId: string): Promise<TestInstallningar> {
  try {
    const { data, error } = await admin.from('profiles').select('test_installningar').eq('id', userId).maybeSingle();
    if (error) return STANDARD_INSTALLNINGAR;
    return lasInstallningar((data as { test_installningar?: unknown } | null)?.test_installningar ?? null);
  } catch {
    return STANDARD_INSTALLNINGAR;
  }
}

export async function sparaTestInstallningar(admin: Klient, userId: string, ny: Partial<TestInstallningar>): Promise<TestInstallningar | null> {
  const nu = await lasTestInstallningar(admin, userId);
  const sammanslagen: TestInstallningar = { ...nu, ...ny };
  const { error } = await admin.from('profiles').update({ test_installningar: sammanslagen }).eq('id', userId);
  if (error) {
    console.error('[installningar] kunde inte spara', error);
    return null;
  }
  return sammanslagen;
}
