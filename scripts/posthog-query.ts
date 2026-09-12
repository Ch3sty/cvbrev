/**
 * Kör en HogQL-fråga mot PostHog från terminalen.
 * Kör: npx tsx scripts/posthog-query.ts "select event, count() from events where timestamp > now() - interval 7 day group by event order by 2 desc"
 *
 * Läser POSTHOG_PERSONAL_API_KEY, POSTHOG_PROJECT_ID och POSTHOG_HOST ur .env.local.
 */

import { config } from 'dotenv';

config({ path: '.env.local' });

export async function hogql(query: string): Promise<{ columns: string[]; results: unknown[][] }> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.POSTHOG_HOST ?? 'https://eu.posthog.com';
  if (!key || !projectId) {
    throw new Error('POSTHOG_PERSONAL_API_KEY eller POSTHOG_PROJECT_ID saknas i .env.local');
  }

  const res = await fetch(`${host}/api/projects/${projectId}/query/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`PostHog ${res.status}: ${data?.detail ?? JSON.stringify(data).slice(0, 300)}`);
  }
  return { columns: data.columns ?? [], results: data.results ?? [] };
}

async function main() {
  const query = process.argv.slice(2).join(' ').trim();
  if (!query) {
    console.error('Ange en HogQL-fråga som argument.');
    process.exit(1);
  }
  const { columns, results } = await hogql(query);
  console.log(columns.join('\t'));
  for (const row of results) console.log(row.map((v) => String(v)).join('\t'));
  console.log(`\n${results.length} rader`);
}

if (process.argv[1] && process.argv[1].endsWith('posthog-query.ts')) {
  main().catch((err) => {
    console.error(err?.message ?? err);
    process.exit(1);
  });
}
