import 'server-only';

/**
 * Sidhuvudets och filtermenyns tal i Anvandare: antal per grupp och de
 * undantagna kontona.
 *
 * Egen modul och inte data.ts, eftersom Filter.tsx ar en klientkomponent som
 * importerar konstanterna dar. Cachen och adminens metrikmodul far aldrig
 * folja med in i klientens bunt.
 *
 * En enda fraga: databasfunktionen admin_user_grupper() svarar med en rad per
 * grupp (migrationen 20260922233000_admin_user_grupper.sql). Tidigare var det
 * sex count-fragor mot admin_user_rows plus en lasning av undantagen, alltsa
 * sju rundturer. Villkoren i funktionen ar desamma som i tillampaGrupp i
 * data.ts och andras tillsammans med dem.
 *
 * Cachad 15 minuter med adminens tagg, som ovriga adminsidor, sa "Hamta nu"
 * rensar den. Listan ar fortfarande ocachad (planens avsnitt 4.4): en admin
 * som just gett nagon premium ser raden direkt, talet i filtret inom femton
 * minuter.
 */

import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  ADMIN_CACHE_SEKUNDER,
  ADMIN_METRICS_TAG,
  hamtaUndantagCachad,
} from '@/lib/admin/metrics';
import type { UndantagetKonto } from '@/lib/admin/undantag';
import { GRUPPER, type Grupp } from './data';

export interface Oversikt {
  /** Antal per grupp. "alla" ar aldrig med undantagna. */
  antal: Record<Grupp, number>;
  /** De undantagna kontona, for sidhuvudets undantagText. */
  undantagna: UndantagetKonto[];
}

const hamtaGruppAntal = unstable_cache(
  async (): Promise<Record<Grupp, number>> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = getSupabaseAdmin() as any;
    const { data, error } = await admin.rpc('admin_user_grupper', {
      nu: new Date().toISOString(),
    });
    if (error) throw new Error(`admin_user_grupper: ${error.message}`);

    const antal = Object.fromEntries(GRUPPER.map((g) => [g.nyckel, 0])) as Record<Grupp, number>;
    for (const r of (data ?? []) as Array<{ grupp: string; antal: number | string }>) {
      if (r.grupp in antal) antal[r.grupp as Grupp] = Number(r.antal) || 0;
    }
    return antal;
  },
  ['admin-anvandare-grupper'],
  { revalidate: ADMIN_CACHE_SEKUNDER, tags: [ADMIN_METRICS_TAG] }
);

export async function hamtaOversikt(): Promise<Oversikt> {
  const [antal, undantag] = await Promise.all([hamtaGruppAntal(), hamtaUndantagCachad()]);
  return { antal, undantagna: undantag.konton };
}
