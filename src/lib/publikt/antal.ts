/**
 * Talen som de publika sidorna visar om tjänsten: antal konton och antal
 * personliga brev. Samma källa för startsidans talrad och Om oss, läst en
 * gång per dygn (sidornas revalidate). Går ett tal inte att läsa, eller är
 * det noll, blir det null och beviset faller bort.
 */
import { getSupabaseAdmin } from '@/lib/supabase/admin';

async function rakna(tabell: 'profiles' | 'letters'): Promise<number | null> {
  try {
    const { count } = await getSupabaseAdmin().from(tabell).select('*', { count: 'exact', head: true });
    return typeof count === 'number' && count > 0 ? count : null;
  } catch {
    return null;
  }
}

/** Antal konton (profiles). */
export function antalKonton(): Promise<number | null> {
  return rakna('profiles');
}

/** Antal personliga brev (letters). */
export function antalBrev(): Promise<number | null> {
  return rakna('letters');
}
