/**
 * Test och datum: ingången E1 till E3 och E3-P (spec-rummen våg 2,
 * konceptets ingång). Första vyn för den som valde tester eller intervju vid
 * registreringen och saknar plan (?forsta=1), och sidan där typ, leverantör
 * och provdatum ändras och tas bort ("Test och datum" i sidomenyn).
 *
 * Planen läses här på servern; går läsningen fel börjar ingången tom, och
 * sparandet säger ifrån om det inte går (aldrig "sparat" på fel).
 */
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { dagSthlm } from '@/lib/traning/datum';
import Ingang, { type IngangPlan } from '@/components/traning/Ingang';

export default async function Installningar({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');
  const sp = await searchParams;

  let plan: IngangPlan | null = null;
  try {
    const { data, error } = await testSkrivKlient()
      .from('test_planer')
      .select('testtyper, leverantor, variant, provdatum, utfall')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    plan = (data as IngangPlan | null) ?? null;
  } catch (e) {
    console.error('[traning] installningar, planen:', e);
  }

  const stegParam = Number(Array.isArray(sp.steg) ? sp.steg[0] : sp.steg);
  const steg = stegParam === 2 || stegParam === 3 ? stegParam : 1;

  return <Ingang idag={dagSthlm()} plan={plan} startSteg={steg} forsta={sp.forsta === '1'} />;
}
