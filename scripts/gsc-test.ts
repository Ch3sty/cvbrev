/**
 * Testar kopplingen till Google Search Console via servicekontot.
 * Kör: npx tsx scripts/gsc-test.ts
 *
 * Läser GSC_SERVICE_ACCOUNT_JSON och GSC_SITE_URL ur .env.local och hämtar
 * de senaste 28 dagarnas topp 20 sidor (klick, visningar, CTR, position).
 */

import 'dotenv/config';
import { config } from 'dotenv';
import { google } from 'googleapis';

config({ path: '.env.local' });

async function main() {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON;
  const siteUrl = process.env.GSC_SITE_URL;
  if (!raw || !siteUrl) {
    throw new Error('GSC_SERVICE_ACCOUNT_JSON eller GSC_SITE_URL saknas i .env.local');
  }

  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2); // GSC ligger ca två dagar efter
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const res = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: fmt(start),
      endDate: fmt(end),
      dimensions: ['page'],
      rowLimit: 20,
    },
  });

  const rows = res.data.rows ?? [];
  console.log(`Egendom: ${siteUrl}  Period: ${fmt(start)} till ${fmt(end)}  Rader: ${rows.length}\n`);
  console.log('klick  visn   ctr    pos   sida');
  for (const r of rows) {
    const page = String(r.keys?.[0] ?? '').replace('https://www.jobbcoach.ai', '');
    console.log(
      String(r.clicks ?? 0).padStart(5),
      String(r.impressions ?? 0).padStart(6),
      ((r.ctr ?? 0) * 100).toFixed(1).padStart(5) + '%',
      (r.position ?? 0).toFixed(1).padStart(5),
      ' ' + page
    );
  }
}

main().catch((err) => {
  console.error('GSC-test misslyckades:', err?.message ?? err);
  process.exit(1);
});
