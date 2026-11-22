/**
 * Rester i PostHog efter konton som redan är raderade
 * (docs/beslut-mejl-och-radering-2026-11-22.md, 2d).
 *
 * Torrkörning är förval: skriptet räknar och visar, och raderar ingenting.
 *   npx tsx scripts/radera-posthog-rester.ts
 * Radering, bara efter ägarens ja och med POSTHOG_RADERA_NYCKEL satt:
 *   npx tsx scripts/radera-posthog-rester.ts --kor
 * Med --alla stryks villkor 4 (e-post); torrkörningen visar båda antalen.
 *
 * Urvalet:
 *   1. alla distinct_id som är ett uuid av version 4 (HogQL mot person_distinct_ids),
 *   2. minus de som finns i auth.users,
 *   3. minus personer som också har något id som finns i auth.users
 *      (sammanslagna med ett befintligt konto),
 *   4. bara personer med egenskapen email.
 * Med --kor anropas bulk_delete med delete_events: true i omgångar om högst
 * 1 000 distinct_ids. Läsningarna använder POSTHOG_PERSONAL_API_KEY (läsrätt)
 * och Supabase med servernyckeln (bara läsning av auth.users).
 */

import { createClient } from '@supabase/supabase-js';
import { laddaEnv } from './_env';
import { hogql } from './posthog-query';

laddaEnv();

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SIDA = 50_000;
const OMGANG = 1_000;

/**
 * Alla rader, sida för sida. PostHog tillåter inte OFFSET med en personlig
 * nyckel, så sidorna tas med nyckelpaginering: första kolumnen är nyckeln,
 * sorterad stigande, och nästa sida börjar efter förra sidans sista värde.
 */
async function allaRader(fraga: (efter: string) => string): Promise<unknown[][]> {
  const ut: unknown[][] = [];
  let efter = '';
  for (;;) {
    const { results } = await hogql(fraga(efter.replace(/'/g, "\'")));
    ut.push(...results);
    if (results.length < SIDA) break;
    efter = String(results[results.length - 1][0]);
  }
  return ut;
}

async function kontonIAuth(): Promise<Set<string>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const nyckel = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !nyckel) throw new Error('NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY saknas');
  const admin = createClient(url, nyckel, { auth: { persistSession: false } });
  const ids = new Set<string>();
  for (let sida = 1; ; sida++) {
    const { data, error } = await admin.auth.admin.listUsers({ page: sida, perPage: 1000 });
    if (error) throw new Error(`auth.users: ${error.message}`);
    for (const u of data.users) ids.add(u.id.toLowerCase());
    if (data.users.length < 1000) break;
  }
  return ids;
}

export interface PosthogUrval {
  personer: number;
  distinctIds: string[];
}

/** Ren del av urvalet, testbar utan nätverk. */
export function valjRester(
  par: Array<{ distinctId: string; personId: string }>,
  medEpost: Set<string>,
  konton: Set<string>
): PosthogUrval {
  const perPerson = new Map<string, string[]>();
  for (const { distinctId, personId } of par) {
    const lista = perPerson.get(personId) ?? [];
    lista.push(distinctId.toLowerCase());
    perPerson.set(personId, lista);
  }
  const distinctIds: string[] = [];
  let personer = 0;
  for (const [personId, ids] of perPerson) {
    if (!medEpost.has(personId)) continue;
    if (ids.some((id) => konton.has(id))) continue;
    const v4 = ids.filter((id) => UUID_V4.test(id));
    if (v4.length === 0) continue;
    personer += 1;
    distinctIds.push(v4[0]);
  }
  return { personer, distinctIds };
}

async function main() {
  const kor = process.argv.includes('--kor');

  const par = (await allaRader((e) => `select distinct_id, toString(person_id) from person_distinct_ids where distinct_id > '${e}' order by distinct_id limit ${SIDA}`)).map(
    ([d, p]) => ({ distinctId: String(d), personId: String(p) })
  );
  const medEpost = new Set(
    (await allaRader((e) => `select toString(id) as pid from persons where properties.email is not null and properties.email != '' and toString(id) > '${e}' order by pid limit ${SIDA}`)).map(
      ([id]) => String(id)
    )
  );
  const konton = await kontonIAuth();
  // --alla stryker villkoret om e-post: då tas också personer vars id av
  // version 4 inte finns i auth.users men som saknar egenskapen email.
  // Beslutets urval är utan flaggan.
  const alla = process.argv.includes('--alla');
  const medEpostUrval = valjRester(par, medEpost, konton);
  const utanEpostVillkor = valjRester(par, new Set(par.map((p) => p.personId)), konton);
  const urval = alla ? utanEpostVillkor : medEpostUrval;

  const raknaHandelser = async (ids: string[]) => {
    let n = 0;
    for (let i = 0; i < ids.length; i += OMGANG) {
      const lista = ids.slice(i, i + OMGANG).map((id) => `'${id}'`).join(',');
      const { results } = await hogql(`select count() from events where person_id in (select person_id from person_distinct_ids where distinct_id in (${lista}))`);
      n += Number(results[0]?.[0] ?? 0);
    }
    return n;
  };

  console.log(`Konton i auth.users: ${konton.size}`);
  console.log(`Personer i PostHog med e-post och utan konto: ${medEpostUrval.personer}, händelser hos dem: ${await raknaHandelser(medEpostUrval.distinctIds)}`);
  console.log(`Personer utan konto oavsett e-post (--alla): ${utanEpostVillkor.personer}, händelser hos dem: ${await raknaHandelser(utanEpostVillkor.distinctIds)}`);
  console.log(`Urvalet som raderas med --kor${alla ? ' --alla' : ''}: ${urval.personer} personer`);

  if (!kor) {
    console.log('Torrkörning: inget raderat. Kör med --kor efter ägarens ja.');
    return;
  }

  const nyckel = process.env.POSTHOG_RADERA_NYCKEL;
  const projekt = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.POSTHOG_HOST ?? 'https://eu.posthog.com';
  if (!nyckel || !projekt) throw new Error('POSTHOG_RADERA_NYCKEL eller POSTHOG_PROJECT_ID saknas, inget raderat');

  let raderade = 0;
  for (let i = 0; i < urval.distinctIds.length; i += OMGANG) {
    const del = urval.distinctIds.slice(i, i + OMGANG);
    const res = await fetch(`${host}/api/projects/${projekt}/persons/bulk_delete/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${nyckel}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ distinct_ids: del, delete_events: true }),
    });
    if (res.status < 200 || res.status >= 300) throw new Error(`PostHog svarade ${res.status} efter ${raderade} raderade`);
    raderade += del.length;
    console.log(`Raderade ${raderade} av ${urval.distinctIds.length}`);
  }
}

if (process.argv[1] && process.argv[1].endsWith('radera-posthog-rester.ts')) {
  main().catch((err) => {
    console.error(err?.message ?? err);
    process.exit(1);
  });
}
