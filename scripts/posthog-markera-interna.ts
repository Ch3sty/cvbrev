/**
 * Sätter personegenskapen is_internal = true i PostHog på alla undantagna
 * konton (ägarens adminkonto och testkonton), ur databasfunktionen
 * admin_undantagna_konton().
 *
 *   npx tsx scripts/posthog-markera-interna.ts
 *
 * Klienten sätter egenskapen själv från 2026-09-22 (PostHogProvider vid
 * identify för testkonton, MarkeraIntern i adminlayouten för superadmin).
 * Skriptet tar historiken: personer som redan finns i PostHog och kanske
 * aldrig loggar in igen. Skickar en $set-händelse per konto med projektets
 * publika token, samma väg som src/lib/analytics/server.ts.
 */

import { laddaEnv } from './_env';

laddaEnv();

async function main() {
  const { getSupabaseAdmin } = await import('../src/lib/supabase/admin');
  const { hamtaUndantag, undantagText } = await import('../src/lib/admin/undantag');

  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = (process.env.POSTHOG_HOST ?? process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.posthog.com').replace(/\/$/, '');
  if (!token) throw new Error('NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN saknas');

  const u = await hamtaUndantag(getSupabaseAdmin() as any);
  console.log(`${undantagText(u)}.`);

  // Raderade QA-konton (analysen 2026-11-08, punkt 5b). De finns inte längre
  // i databasen, så admin_undantagna_konton() ser dem inte, men deras
  // händelser ligger kvar i PostHog. Listan är en JSON-fil med id:n som
  // kontrollerats mot auth.users (finns inte) och klassats som QA.
  //   npx tsx scripts/posthog-markera-interna.ts --raderade <fil.json>
  const i = process.argv.indexOf('--raderade');
  if (i > 0) {
    const fs = await import('node:fs');
    const ids = JSON.parse(fs.readFileSync(process.argv[i + 1], 'utf8')) as string[];
    const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    const ogiltiga = ids.filter((id) => !UUID.test(id));
    if (ogiltiga.length) throw new Error(`ogiltiga id: ${ogiltiga.join(', ')}`);
    // Ett id som finns i databasen är inget raderat konto. Det markeras inte här.
    const admin = getSupabaseAdmin() as any;
    const kvar = new Set<string>();
    for (const id of ids) {
      const { data, error } = await admin.auth.admin.getUserById(id);
      if (data?.user) kvar.add(id);
      else if (error && error.status !== 404 && !/not found/i.test(error.message ?? '')) {
        throw new Error(`kunde inte kontrollera ${id}: ${error.message}`);
      }
    }
    let ok = 0;
    for (const id of ids) {
      if (kvar.has(id)) {
        console.log(`hoppar över ${id}: kontot finns`);
        continue;
      }
      const res = await fetch(`${host}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: token,
          event: '$set',
          distinct_id: id,
          properties: { $set: { is_internal: true, intern_skal: 'raderat_qa' } },
          timestamp: new Date().toISOString(),
        }),
      });
      if (res.ok) ok++;
      else console.log(`${id}  ${res.status}`);
    }
    console.log(`Raderade QA-konton markerade: ${ok} av ${ids.length}.`);
  }

  for (const k of u.konton) {
    const res = await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: token,
        event: '$set',
        distinct_id: k.userId,
        properties: { $set: { is_internal: true, intern_skal: k.skal } },
        timestamp: new Date().toISOString(),
      }),
    });
    console.log(`${k.skal.padEnd(5)} ${k.email ?? k.userId}  ${res.status}`);
  }
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
