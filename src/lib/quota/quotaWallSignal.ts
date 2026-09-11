// Signalerar till livscykelmailen att användaren slagit i en kvotvägg
// (docs/plan-konvertering.md, D3). Kvotrutterna ska inte behöva känna till
// vare sig admin-klienten eller mailsystemet, därför den här enradaren.
//
// Fire-and-forget i dubbel bemärkelse: den väntar inte in resultatet och den
// kan aldrig kasta. En trasig maillogg får inte förvandla ett 429-svar till
// ett 500-svar.

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { recordQuotaWall } from '@/lib/email/lifecycle/hooks';

/** Anropas direkt före ett 429-svar. Returnerar inget, kastar aldrig. */
export function signalQuotaWall(userId: string, feature: string): void {
  try {
    const admin = getSupabaseAdmin() as never;
    void Promise.resolve(recordQuotaWall(admin, userId, feature)).catch((error) => {
      console.error('[quota] signalQuotaWall misslyckades:', error?.message);
    });
  } catch (error) {
    console.error('[quota] signalQuotaWall kunde inte starta:', error);
  }
}
