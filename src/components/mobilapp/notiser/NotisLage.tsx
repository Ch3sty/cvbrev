/**
 * Serverdelen av notisfrågan: läser om kontot har ett klart pass och någon
 * telefon i app_enheter, och ritar NotisFraga. Ligger i en Suspense i
 * flikarnas layout, så att frågorna aldrig håller upp vyn (prestandabudgeten).
 *
 * Saknas tabellen (migreringen inte körd) visas ingen fråga alls.
 */
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { NIVAKOLL_TEST_TYPER } from '@/lib/nivakoll/niva';
import NotisFraga from './NotisFraga';

export default async function NotisLage({ userId }: { userId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin() as any;
  const [enheter, pass] = await Promise.all([
    // Ingen head-fråga här: den ger inget fel när tabellen saknas.
    admin.from('app_enheter').select('id').eq('user_id', userId).limit(1),
    admin
      .from('logic_test_v4_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .not('test_type', 'in', `(${NIVAKOLL_TEST_TYPER.map((t) => `"${t}"`).join(',')})`),
  ]);
  if (enheter.error || pass.error) return null;
  const harEnhet = (enheter.data ?? []).length > 0;
  return <NotisFraga visa={!harEnhet && (pass.count ?? 0) > 0} harEnhet={harEnhet} />;
}
