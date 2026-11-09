/**
 * Torrtest av dag 2-mejlet (pass_dag2). Skickar ingenting och skriver
 * ingenting: kör samma urval som morgonslotten (valjTraningsmejl) mot
 * produktionen för en given dag och visar vilka som skulle få mejlet, uppdelat
 * på betalande och gratis, avregistrerade och interna konton.
 *
 *   npx tsx scripts/torrtest-dag2.ts            (i morgon, svensk tid)
 *   npx tsx scripts/torrtest-dag2.ts 2026-11-10
 *   npx tsx scripts/torrtest-dag2.ts 2026-11-10 --json
 *
 * Utskicksdagen D väljer dem vars första Nivåkoll var D minus ett. För i
 * morgon räknas alltså dagens Nivåkollar fram till nu.
 */

import { laddaEnv } from './_env';
laddaEnv();

import { createClient } from '@supabase/supabase-js';
import { valjTraningsmejl, stockholmKlockslag, PASS_DAG2_TYPE, PASS_DAG2_KLOCKA, lasNivakollar } from '../src/lib/email/lifecycle/traningsmejl';
import { dagSthlm, laggTill, arGiltigDag } from '../src/lib/traning/datum';
import { getUserScope } from '../src/lib/supabase/premiumAccess';
import { scopeHasFeature } from '../src/lib/access/features';

async function main() {
  const arg = process.argv.slice(2).find((a) => !a.startsWith('--'));
  const json = process.argv.includes('--json');
  const dag = arg && arGiltigDag(arg) ? arg : laggTill(dagSthlm(new Date()), 1);
  const kl = stockholmKlockslag(dag, PASS_DAG2_KLOCKA);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY saknas');
  const admin = createClient(url, key, { auth: { persistSession: false } });

  const urval = (await valjTraningsmejl(admin as any, kl)).filter((u) => u.typ === PASS_DAG2_TYPE);
  const ids = urval.map((u) => u.userId);

  const [{ data: profiler, error: pErr }, { data: undantag, error: uErr }, kollar] = await Promise.all([
    ids.length
      ? admin.from('profiles').select('id, email, full_name, quota_emails_opt_out').in('id', ids)
      : Promise.resolve({ data: [], error: null } as any),
    admin.rpc('admin_undantagna_konton'),
    lasNivakollar(admin as any, ids),
  ]);
  if (pErr) throw pErr;
  if (uErr) throw uErr;
  const interna = new Set(((undantag ?? []) as { user_id: string }[]).map((r) => r.user_id));
  const perId = new Map(((profiler ?? []) as any[]).map((p) => [p.id, p]));

  const rader = [];
  for (const id of ids) {
    const p = perId.get(id);
    const scope = await getUserScope(admin as any, id).catch(() => null);
    rader.push({
      id,
      betalande: scopeHasFeature(scope as any, 'tests_above_base'),
      avregistrerad: p?.quota_emails_opt_out === true,
      saknarEpost: !p?.email,
      intern: interna.has(id),
      harNamn: Boolean((p?.full_name ?? '').trim()),
      niva: kollar.get(id)?.niva ?? null,
      harGenomgang: Boolean(kollar.get(id)?.sessionId),
    });
  }

  const gar = rader.filter((r) => !r.avregistrerad && !r.saknarEpost);
  const summa = {
    utskicksdag: dag,
    klockslag: `${PASS_DAG2_KLOCKA} svensk tid (${kl.toISOString()})`,
    nivakollDag: laggTill(dag, -1),
    kandidater: rader.length,
    skulleSkickas: gar.length,
    varavBetalande: gar.filter((r) => r.betalande).length,
    varavGratis: gar.filter((r) => !r.betalande).length,
    varavInterna: gar.filter((r) => r.intern).length,
    utanInterna: gar.filter((r) => !r.intern).length,
    avregistrerade: rader.filter((r) => r.avregistrerad).length,
    utanEpost: rader.filter((r) => r.saknarEpost).length,
  };

  if (json) console.log(JSON.stringify({ summa, rader }, null, 2));
  else {
    console.log(summa);
    console.table(rader.map((r) => ({ ...r, id: r.id.slice(0, 8) })));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
