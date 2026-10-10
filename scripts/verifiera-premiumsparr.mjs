// Verifierar premiumspärren i prod med ett eget testkonto som skapas och raderas.
// Kör: node scripts/verifiera-premiumsparr.mjs
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
const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

const epost = `qa-premiumsparr-${Date.now()}@jobbcoach-qa.test`;
const losen = `Qa!${Math.random().toString(36).slice(2)}Aa1`;
const resultat = [];
const ok = (namn, villkor, info = '') => { resultat.push({ namn, ok: !!villkor, info }); };

const { data: skapad, error: skapaFel } = await admin.auth.admin.createUser({ email: epost, password: losen, email_confirm: true });
if (skapaFel) throw skapaFel;
const uid = skapad.user.id;

try {
  const anv = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: loginFel } = await anv.auth.signInWithPassword({ email: epost, password: losen });
  if (loginFel) throw loginFel;

  // Vänta in profilraden från handle_new_user
  for (let i = 0; i < 10; i++) {
    const { data } = await admin.from('profiles').select('id').eq('id', uid).maybeSingle();
    if (data) break;
    await new Promise((r) => setTimeout(r, 500));
  }

  const forsok = async (falt) => anv.from('profiles').update(falt).eq('id', uid).select('id');

  let r = await forsok({ subscription_tier: 'premium' });
  ok('Sätta subscription_tier=premium nekas', r.error?.code === '42501', r.error?.message);
  r = await forsok({ premium_until: '2030-01-01T00:00:00Z', premium_scope: 'allt' });
  ok('Sätta premium_until/premium_scope nekas', r.error?.code === '42501', r.error?.message);
  r = await forsok({ subscription_status: 'active' });
  ok('Sätta subscription_status nekas', r.error?.code === '42501', r.error?.message);

  r = await forsok({ full_name: 'QA Spärrtest', phone: '070-000 00 00' });
  ok('Namn och telefon går att spara', !r.error && r.data?.length === 1, r.error?.message);
  r = await forsok({ contact_email: 'annan@exempel.se' });
  ok('contact_email går att spara', !r.error && r.data?.length === 1, r.error?.message);

  r = await forsok({ stripe_customer_id: 'cus_qa_test' });
  ok('stripe_customer_id NULL -> värde tillåts (steg 1)', !r.error, r.error?.message);
  r = await forsok({ stripe_customer_id: 'cus_annan' });
  ok('stripe_customer_id byte nekas', r.error?.code === '42501', r.error?.message);

  // Servern (som webhooken) får fortfarande ge premium
  const s = await admin.from('profiles').update({ subscription_tier: 'premium', premium_scope: 'allt' }).eq('id', uid).select('subscription_tier');
  ok('Servern (service role) kan sätta premium', !s.error && s.data?.[0]?.subscription_tier === 'premium', s.error?.message);

  // Anonym (utloggad) skrivning
  const anon = createClient(URL, ANON, { auth: { persistSession: false } });
  const a = await anon.from('profiles').update({ full_name: 'x' }).eq('id', uid).select('id');
  ok('Utloggad kan inte skriva', !!a.error || (a.data ?? []).length === 0, a.error?.message);
} finally {
  // Städning: bara det egna kontot, räkna före delete
  const { count } = await admin.from('profiles').select('id', { count: 'exact', head: true }).eq('id', uid);
  await admin.from('profiles').delete().eq('id', uid);
  await admin.auth.admin.deleteUser(uid);
  const { count: kvar } = await admin.from('profiles').select('id', { count: 'exact', head: true }).eq('id', uid);
  resultat.push({ namn: `Städning: profiles ${count} -> ${kvar}, auth-användaren raderad`, ok: kvar === 0 });
}

for (const r of resultat) console.log(`${r.ok ? 'OK  ' : 'FEL '} ${r.namn}${r.ok || !r.info ? '' : '  (' + r.info + ')'}`);
process.exit(resultat.every((r) => r.ok) ? 0 : 1);
