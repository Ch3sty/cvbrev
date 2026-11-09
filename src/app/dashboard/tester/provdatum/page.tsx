/**
 * Provdatumskärmen efter kontot (saas-leads beslut 4, 2026-11-10). Visas av
 * /dashboard/valkommen för nya konton som kom från en artikel med valet
 * I-prov eller lokförare och saknar provdatum. Ingångens datumsteg som ett
 * eget steg, med varianten för I-prov på samma skärm. Går att hoppa över;
 * ?nasta= är dit kontot var på väg (smakprovets genomgång eller hemvyn).
 *
 * Aldrig i kontosteget: registreringen är e-post och lösenord, som skissen.
 */
import { redirect } from 'next/navigation';
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare';
import { testSkrivKlient } from '@/lib/tests/skrivKlient';
import { dagSthlm } from '@/lib/traning/datum';
import { TRANING_RUTT } from '@/lib/traning/rutter';
import { fragaProvdatumEfterKonto } from '@/lib/analytics/provkalla';
import Ingang, { type IngangPlan } from '@/components/traning/Ingang';

export const metadata = { title: 'När är provet?' };

/** Bara sökvägar inom appen. */
function sakerNasta(raw: unknown): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (typeof v !== 'string' || !v.startsWith('/') || v.startsWith('//') || v.startsWith('/\\')) return TRANING_RUTT.hem;
  if (v.startsWith(TRANING_RUTT.provdatum)) return TRANING_RUTT.hem;
  return v;
}

export default async function ProvdatumEfterKonto({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await hamtaVerifieradAnvandare();
  if (!user) redirect('/login');
  const sp = await searchParams;
  const nasta = sakerNasta(sp.nasta);

  let plan: IngangPlan | null = null;
  try {
    const { data, error } = await testSkrivKlient()
      .from('test_planer')
      .select('testtyper, leverantor, variant, provdatum, utfall, mitt_test, mitt_test_variant, extra_typer')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    plan = (data as IngangPlan | null) ?? null;
  } catch (e) {
    console.error('[traning] provdatum efter kontot, planen:', e);
  }

  // Bara I-prov och lokförare utan datum. Allt annat går vidare direkt.
  if (!plan || !fragaProvdatumEfterKonto(plan.mitt_test) || plan.provdatum) redirect(nasta);

  return <Ingang idag={dagSthlm()} plan={plan} startSteg="datum" forsta={false} efterKonto={{ nasta }} />;
}
