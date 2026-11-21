// Verifierar spärren på cv_analysis_jobs i prod med två egna testkonton som
// skapas och raderas (migreringen 20261121120000_cv_analysis_jobs_serverlas).
//
// Kör från repots rot: node scripts/verifiera-analysjobb-sparr.mjs
//
// Går att köra både före och efter migreringen. Före migreringen visar den
// läckan (result går att läsa, egna rader går att skapa) och slutar med
// kod 1; efter migreringen ska allt vara OK och koden 0.
//
// Belastning: två konton, två CV-rader, två jobbrader och ett tjugotal små
// frågor. Städningen raderar bara de egna raderna per id och räknar före.
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)
    .filter((r) => r.includes('=') && !r.startsWith('#'))
    .map((r) => { const i = r.indexOf('='); return [r.slice(0, i).trim(), r.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !ANON || !SERVICE) {
  console.error('Saknar NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY eller SUPABASE_SERVICE_ROLE_KEY i .env.local');
  process.exit(2);
}
const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

const PREFIX = 'qa-analysjobb-sparr-';
const DOMAN = '@jobbcoach-qa.test';
const resultat = [];
const ok = (namn, villkor, info = '') => { resultat.push({ namn, ok: !!villkor, info }); };
const nekad = (r) => r.error?.code === '42501';

// Allt som skapas, för städningen.
const skapat = { anvandare: [], cv: [], jobb: [] };

const RESULTAT = {
  analysisType: 'full',
  profileSummary: { currentText: 'QA', improvedText: 'QA-förslag som bara servern får lämna ut.' },
  roleBasedImprovements: [],
  skillSuggestions: [],
  generalImprovements: [],
};

async function nyttKonto(namn) {
  const epost = `${PREFIX}${namn}-${Date.now()}${DOMAN}`;
  const losen = `Qa!${Math.random().toString(36).slice(2)}Aa1`;
  const { data, error } = await admin.auth.admin.createUser({ email: epost, password: losen, email_confirm: true });
  if (error) throw error;
  const uid = data.user.id;
  skapat.anvandare.push(uid);
  // Vänta in profilraden från handle_new_user (cv_texts kan peka på den).
  for (let i = 0; i < 10; i++) {
    const { data: p } = await admin.from('profiles').select('id').eq('id', uid).maybeSingle();
    if (p) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  const klient = createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: loginFel } = await klient.auth.signInWithPassword({ email: epost, password: losen });
  if (loginFel) throw loginFel;
  return { uid, klient };
}

async function nyttCvOchJobb(uid) {
  const { data: cv, error: cvFel } = await admin
    .from('cv_texts')
    .insert({ user_id: uid, file_name: 'QA spärrtest', original_file_path: `qa/${uid}/sparrtest.pdf`, cv_text: 'QA spärrtest' })
    .select('id')
    .single();
  if (cvFel) throw new Error(`cv_texts: ${cvFel.message}`);
  skapat.cv.push(cv.id);
  const { data: jobb, error: jobbFel } = await admin
    .from('cv_analysis_jobs')
    .insert({
      user_id: uid,
      cv_id: cv.id,
      status: 'completed',
      usage_counted: false,
      completion_handled: true,
      display_name: 'QA spärrtest',
      completed_at: new Date().toISOString(),
      result: RESULTAT,
    })
    .select('id')
    .single();
  if (jobbFel) throw new Error(`cv_analysis_jobs: ${jobbFel.message}`);
  skapat.jobb.push(jobb.id);
  return { cvId: cv.id, jobbId: jobb.id };
}

let lage = 'okänt';
try {
  const a = await nyttKonto('a');
  const b = await nyttKonto('b');
  const egen = await nyttCvOchJobb(a.uid);
  const annans = await nyttCvOchJobb(b.uid);
  const anv = a.klient;

  // (a) select result på egen rad
  const rA = await anv.from('cv_analysis_jobs').select('result').eq('id', egen.jobbId);
  const resultSyns = !rA.error && (rA.data ?? []).some((r) => r.result);
  lage = resultSyns ? 'FÖRE migreringen (result går att läsa)' : nekad(rA) ? 'EFTER migreringen' : 'oklart';
  ok('(a) select result med användarens JWT nekas', nekad(rA), rA.error?.message ?? (resultSyns ? 'result kom tillbaka: läckan finns' : 'inget fel, men inget result heller'));

  // (b) select * nekas eller saknar result
  const rB = await anv.from('cv_analysis_jobs').select('*').eq('id', egen.jobbId);
  const bOk = nekad(rB) || (!rB.error && (rB.data ?? []).every((r) => !('result' in r)));
  ok('(b) select * nekas eller saknar result', bOk, rB.error?.message ?? (rB.data?.[0] && 'result' in rB.data[0] ? 'result fanns med i svaret' : ''));

  // result via en JSON-väg (result->...) ska också nekas
  const rB2 = await anv.from('cv_analysis_jobs').select('id, forslag:result->profileSummary').eq('id', egen.jobbId);
  ok('(b) select result->profileSummary nekas', nekad(rB2), rB2.error?.message ?? 'fältet kom tillbaka');

  // (c) select id,status på egen rad fungerar
  const rC = await anv.from('cv_analysis_jobs').select('id, status, cv_id, display_name, usage_counted, completed_at').eq('id', egen.jobbId);
  ok('(c) select id, status med mera på egen rad fungerar', !rC.error && rC.data?.length === 1 && rC.data[0].status === 'completed', rC.error?.message ?? `rader: ${rC.data?.length}`);

  const rC2 = await anv.from('cv_analysis_jobs').select('id', { count: 'exact', head: true }).eq('user_id', a.uid).eq('usage_counted', false);
  ok('(c) räkningen som kvoten gör fungerar', !rC2.error && rC2.count === 1, rC2.error?.message ?? `count: ${rC2.count}`);

  // (d) insert, update och delete nekas
  const rIns = await anv
    .from('cv_analysis_jobs')
    .insert({ user_id: a.uid, cv_id: egen.cvId, status: 'pending', usage_counted: false })
    .select('id');
  // Före migreringen kan raden skapas: den läggs till i städningen. Svaret
  // kan sakna id om SELECT-rättigheten saknas, så vi letar också med admin.
  for (const r of rIns.data ?? []) if (r?.id) skapat.jobb.push(r.id);
  if (!rIns.error) {
    const { data: extra } = await admin.from('cv_analysis_jobs').select('id').eq('user_id', a.uid).eq('status', 'pending');
    for (const r of extra ?? []) if (!skapat.jobb.includes(r.id)) skapat.jobb.push(r.id);
  }
  ok('(d) insert med användarens JWT nekas', nekad(rIns), rIns.error?.message ?? 'raden skapades');

  const rUpd = await anv.from('cv_analysis_jobs').update({ usage_counted: true, display_name: 'ändrad' }).eq('id', egen.jobbId).select('id');
  const { data: efterUpd } = await admin.from('cv_analysis_jobs').select('usage_counted, display_name').eq('id', egen.jobbId).single();
  const oforandrad = efterUpd?.usage_counted === false && efterUpd?.display_name === 'QA spärrtest';
  ok('(d) update med användarens JWT nekas', nekad(rUpd) && oforandrad, rUpd.error?.message ?? (oforandrad ? 'inget fel, noll rader (RLS), men rättigheten finns kvar' : 'raden ändrades'));

  const rDel = await anv.from('cv_analysis_jobs').delete().eq('id', egen.jobbId).select('id');
  const { data: efterDel } = await admin.from('cv_analysis_jobs').select('id').eq('id', egen.jobbId);
  const finnsKvar = (efterDel ?? []).length === 1;
  ok('(d) delete med användarens JWT nekas', nekad(rDel) && finnsKvar, rDel.error?.message ?? (finnsKvar ? 'inget fel, noll rader (RLS), men rättigheten finns kvar' : 'raden raderades'));

  // (e) andras rader syns inte
  const rE = await anv.from('cv_analysis_jobs').select('id, status').eq('id', annans.jobbId);
  ok('(e) en annan användares rad syns inte', !rE.error && (rE.data ?? []).length === 0, rE.error?.message ?? `rader: ${rE.data?.length}`);
  const rE2 = await anv.from('cv_analysis_jobs').select('id').eq('user_id', b.uid);
  ok('(e) filter på annans user_id ger inga rader', !rE2.error && (rE2.data ?? []).length === 0, rE2.error?.message ?? `rader: ${rE2.data?.length}`);

  // Utloggad (bara publika nyckeln)
  const utloggad = createClient(URL, ANON, { auth: { persistSession: false } });
  const rU = await utloggad.from('cv_analysis_jobs').select('id').eq('id', egen.jobbId);
  ok('Utloggad ser ingenting', nekad(rU) || (!rU.error && (rU.data ?? []).length === 0), rU.error?.message ?? `rader: ${rU.data?.length}`);

  // dashboard_summering() ska fungera med användarens JWT (läser inte result)
  const rS = await anv.rpc('dashboard_summering');
  ok('dashboard_summering() fungerar med användarens JWT', !rS.error && rS.data && typeof rS.data === 'object', rS.error?.message);

  // Servern (service role) läser result som förut
  const rS2 = await admin.from('cv_analysis_jobs').select('result').eq('id', egen.jobbId).eq('user_id', a.uid).single();
  ok('Servern (service role) läser result', !rS2.error && rS2.data?.result?.analysisType === 'full', rS2.error?.message);
} catch (fel) {
  ok('Körningen gick igenom utan undantag', false, fel instanceof Error ? fel.message : String(fel));
} finally {
  // Städning: bara egna rader, per id, räkna före delete.
  const stada = async (tabell, kolumn, ids) => {
    if (ids.length === 0) return;
    const { count: fore } = await admin.from(tabell).select(kolumn, { count: 'exact', head: true }).in(kolumn, ids);
    const { error } = await admin.from(tabell).delete().in(kolumn, ids);
    const { count: efter } = await admin.from(tabell).select(kolumn, { count: 'exact', head: true }).in(kolumn, ids);
    resultat.push({ namn: `Städning: ${tabell} ${fore} -> ${efter}`, ok: !error && efter === 0, info: error?.message ?? '' });
  };
  await stada('cv_analysis_jobs', 'id', skapat.jobb);
  await stada('cv_texts', 'id', skapat.cv);
  await stada('profiles', 'id', skapat.anvandare);
  for (const uid of skapat.anvandare) {
    const { error } = await admin.auth.admin.deleteUser(uid);
    resultat.push({ namn: `Städning: auth-användaren ${uid.slice(0, 8)} raderad`, ok: !error, info: error?.message ?? '' });
  }
}

console.log(`Läge: ${lage}`);
for (const r of resultat) console.log(`${r.ok ? 'OK  ' : 'FEL '} ${r.namn}${r.ok || !r.info ? '' : '  (' + r.info + ')'}`);
process.exit(resultat.every((r) => r.ok) ? 0 : 1);
