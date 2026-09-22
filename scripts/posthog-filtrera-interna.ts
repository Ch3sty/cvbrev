/**
 * Lägger filtret "inte intern" på varje insikt i PostHog-dashboarden
 * "Paket och onboarding" (968012), så att ägarens adminkonto och testkonton
 * aldrig räknas där heller (spec-admin-tydlighet 2026-09-22, princip 6).
 *
 *   npx tsx scripts/posthog-filtrera-interna.ts [dashboard-id]
 *
 * Projektet kör personegenskaper på händelsen (persons on events), så ett
 * personfilter på is_internal träffar bara händelser efter att egenskapen
 * sattes. Därför går filtret via en kohort, som utvärderas mot personens
 * nuvarande egenskaper och alltså tar hela historiken:
 *
 *   kohorten "Adminen: undantagna konton" = is_internal är true, eller
 *   e-post matchar samma mönster som src/lib/admin/undantag.ts
 *   varje insikt får filtret "inte i kohorten"
 *
 * Idempotent: kohorten skapas en gång och återanvänds, filtret ersätts.
 * Skriptet skriver bara kohorten och insikternas query, inget annat.
 */

import { laddaEnv } from './_env';

laddaEnv();

const key = process.env.POSTHOG_PERSONAL_API_KEY!;
const pid = process.env.POSTHOG_PROJECT_ID!;
const host = process.env.POSTHOG_HOST ?? 'https://eu.posthog.com';
const dashboard = process.argv[2] ?? '968012';

const KOHORT_NAMN = 'Adminen: undantagna konton';

const KOHORT_FILTER = {
  properties: {
    type: 'OR',
    values: [
      { type: 'AND', values: [{ key: 'is_internal', type: 'person', value: ['true'], operator: 'exact' }] },
      { type: 'AND', values: [{ key: 'email', type: 'person', value: '([.]test$|jobbcoach-qa|^qa-)', operator: 'regex' }] },
    ],
  },
};

async function api(path: string, init?: RequestInit) {
  const r = await fetch(`${host}/api/projects/${pid}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j).slice(0, 300)}`);
  return j;
}

async function kohort(): Promise<number> {
  const lista = await api(`/cohorts/?limit=200`);
  const finns = (lista.results ?? []).find((c: { name: string; deleted?: boolean }) => c.name === KOHORT_NAMN && !c.deleted);
  if (finns) {
    await api(`/cohorts/${finns.id}/`, { method: 'PATCH', body: JSON.stringify({ filters: KOHORT_FILTER }) });
    return finns.id;
  }
  const ny = await api(`/cohorts/`, {
    method: 'POST',
    body: JSON.stringify({ name: KOHORT_NAMN, description: 'Ägarens adminkonto och testkonton. Styrs av is_internal (satt av appen) och e-postmönstret i src/lib/admin/undantag.ts.', filters: KOHORT_FILTER, is_static: false }),
  });
  return ny.id;
}

async function main() {
  const kohortId = await kohort();
  console.log(`Kohort ${kohortId}: ${KOHORT_NAMN}`);
  const FILTER = [{ type: 'cohort', key: 'id', value: kohortId, operator: 'not_in' }];
  const d = await api(`/dashboards/${dashboard}/`);
  console.log(`Dashboard: ${d.name}`);
  for (const t of d.tiles ?? []) {
    const i = t.insight;
    if (!i?.query?.source) continue;
    const q = structuredClone(i.query);
    // Ta bort tidigare personfilter från första versionen av skriptet och
    // ett tidigare kohortfilter mot samma kohort.
    const befintliga = (q.source.properties ?? []).filter(
      (p: { key?: string; type?: string; value?: unknown }) =>
        !(p.type === 'person' && (p.key === 'is_internal' || p.key === 'email')) &&
        !(p.type === 'cohort' && p.value === kohortId)
    );
    q.source.properties = [...befintliga, ...FILTER];
    await api(`/insights/${i.id}/`, { method: 'PATCH', body: JSON.stringify({ query: q }) });
    console.log(`  ${i.short_id} ${i.name}: filter satt`);
  }
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
