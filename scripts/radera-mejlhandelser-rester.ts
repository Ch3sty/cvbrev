/**
 * Mejlhändelser efter konton som redan är raderade
 * (docs/beslut-mejl-och-radering-2026-11-22.md, 2d).
 *
 * Samma villkor som SQL:en i beslutet: händelser i email_events till adresser
 * som inte hör till något konto i dag (auth.users, profiles.email,
 * profiles.contact_email), utom våra egna (@jobbcoach.ai).
 *
 * Torrkörning är förval: skriptet räknar och visar, och raderar ingenting.
 *   npx tsx scripts/radera-mejlhandelser-rester.ts
 * Radering, bara efter ägarens ja:
 *   npx tsx scripts/radera-mejlhandelser-rester.ts --kor
 * Raderingen går på radernas id, i omgångar om 200, aldrig på ett mönster.
 * Adresserna skrivs aldrig ut, bara antal.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { laddaEnv } from './_env';
import { arTestEpost } from '../src/lib/admin/undantag';

laddaEnv();

const SIDA = 1000;

/** Mottagaren som SQL:en läser den: payload->'to'->>0, annars payload->>'to'. */
export function mottagare(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const to = (payload as { to?: unknown }).to;
  const v = Array.isArray(to) ? to[0] : to;
  return typeof v === 'string' ? v.toLowerCase() : null;
}

/** Ren del av urvalet, testbar utan databas. */
export function valjHandelser(
  handelser: Array<{ id: string; payload: unknown }>,
  kontonsAdresser: Set<string>
): { ids: string[]; adresser: Set<string> } {
  const ids: string[] = [];
  const adresser = new Set<string>();
  for (const h of handelser) {
    const a = mottagare(h.payload);
    // SQL:ens "not in" ger okänt för null: rader utan mottagare tas inte.
    if (a === null) continue;
    if (kontonsAdresser.has(a)) continue;
    if (a.endsWith('@jobbcoach.ai')) continue;
    ids.push(h.id);
    adresser.add(a);
  }
  return { ids, adresser };
}

async function lasAlla<T>(fraga: (fran: number, till: number) => PromiseLike<{ data: T[] | null; error: any }>): Promise<T[]> {
  const ut: T[] = [];
  for (let fran = 0; ; fran += SIDA) {
    const { data, error } = await fraga(fran, fran + SIDA - 1);
    if (error) throw new Error(error.message);
    ut.push(...(data ?? []));
    if ((data ?? []).length < SIDA) break;
  }
  return ut;
}

async function kontonsAdresser(admin: SupabaseClient): Promise<Set<string>> {
  const ut = new Set<string>();
  for (let sida = 1; ; sida++) {
    const { data, error } = await admin.auth.admin.listUsers({ page: sida, perPage: 1000 });
    if (error) throw new Error(`auth.users: ${error.message}`);
    for (const u of data.users) if (u.email) ut.add(u.email.toLowerCase());
    if (data.users.length < 1000) break;
  }
  const profiler = await lasAlla<{ email: string | null; contact_email: string | null }>((f, t) =>
    admin.from('profiles').select('email, contact_email').order('id').range(f, t)
  );
  for (const p of profiler) {
    if (p.email) ut.add(p.email.toLowerCase());
    if (p.contact_email) ut.add(p.contact_email.toLowerCase());
  }
  return ut;
}

async function main() {
  const kor = process.argv.includes('--kor');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const nyckel = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !nyckel) throw new Error('NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY saknas');
  const admin = createClient(url, nyckel, { auth: { persistSession: false } });

  const adresser = await kontonsAdresser(admin);
  const handelser = await lasAlla<{ id: string; payload: unknown }>((f, t) =>
    admin.from('email_events').select('id, payload').order('id').range(f, t)
  );
  const urval = valjHandelser(handelser, adresser);
  const test = [...urval.adresser].filter((a) => arTestEpost(a)).length;

  console.log(`Händelser i email_events: ${handelser.length}`);
  console.log(`Att radera: ${urval.ids.length} rader till ${urval.adresser.size} adresser`);
  console.log(`  varav testkonton: ${test} adresser, övriga: ${urval.adresser.size - test} adresser`);

  if (!kor) {
    console.log('Torrkörning: inget raderat. Kör med --kor efter ägarens ja.');
    return;
  }

  let raderade = 0;
  for (let i = 0; i < urval.ids.length; i += 200) {
    const del = urval.ids.slice(i, i + 200);
    const { error } = await admin.from('email_events').delete().in('id', del);
    if (error) throw new Error(`email_events efter ${raderade} raderade: ${error.message}`);
    raderade += del.length;
  }
  console.log(`Raderade ${raderade} rader.`);
}

if (process.argv[1] && process.argv[1].endsWith('radera-mejlhandelser-rester.ts')) {
  main().catch((err) => {
    console.error(err?.message ?? err);
    process.exit(1);
  });
}
