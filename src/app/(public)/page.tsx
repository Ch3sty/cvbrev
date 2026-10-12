/**
 * Startsidan, publikt v2 (docs/design/spec-publikt-v2-del-a-2026-10-12.md
 * avsnitt 5.1). Sektionerna bor i src/components/publikt/start/Startsidan.tsx.
 *
 * h1, title och description är oförändrade (SEO-spärren). Antalet konton
 * visas i hjältens talrad (ägarens beslut 9).
 */
import AuthRedirect from '@/components/landing/AuthRedirect';
import PubliktSida from '@/components/publikt/PubliktSida';
import Startsidan from '@/components/publikt/start/Startsidan';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const revalidate = 86400;

/** Antal konton för heron, läst en gång per dygn. Saknas det faller beviset bort. */
async function antalKonton(): Promise<number | null> {
  try {
    const { count } = await getSupabaseAdmin().from('profiles').select('*', { count: 'exact', head: true });
    return typeof count === 'number' && count > 0 ? count : null;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const konton = await antalKonton();
  return (
    <PubliktSida>
      <AuthRedirect />
      <Startsidan konton={konton} />
    </PubliktSida>
  );
}
