/**
 * Skrivningen till admin_error_log, med rutten ifylld.
 *
 * Våg 1:s loggaAdminFel i src/lib/admin/collect.ts skriver alltid
 * `rutt: null`, eftersom den bara anropas från cronens delsteg där källan är
 * hela informationen. Drift-sidan grupperar fel per rutt enligt planens
 * avsnitt 4.7, och en kolumn som alltid är null går inte att gruppera på.
 * Våg 1-filen får inte ändras, så skrivningen med rutt ligger här i stället.
 * Det står i rapporten som en avvikelse.
 *
 * Kastar aldrig vidare: en loggning som fäller anropet den skulle beskriva
 * är värre än ingen loggning.
 */

import { getSupabaseAdmin } from '@/lib/supabase/admin';

/** Källorna admin_error_log känner igen. */
export type Felkalla = 'route' | 'edge' | 'auth' | 'cron';

export async function loggaFel(
  kalla: Felkalla,
  rutt: string | null,
  fel: unknown,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const meddelande =
      fel instanceof Error ? fel.message : String(fel ?? 'Okänt fel');

    const admin = getSupabaseAdmin() as any;
    await admin.from('admin_error_log').insert({
      kalla,
      rutt,
      meddelande: meddelande.slice(0, 1000),
      metadata: metadata ?? null,
    });
  } catch (err) {
    console.error('[admin/drift] kunde inte skriva admin_error_log:', err);
  }
}

/** Genvägen för en API-rutt som fallerar. */
export function loggaRuttfel(
  rutt: string,
  fel: unknown,
  metadata?: Record<string, unknown>
): Promise<void> {
  return loggaFel('route', rutt, fel, metadata);
}
