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
