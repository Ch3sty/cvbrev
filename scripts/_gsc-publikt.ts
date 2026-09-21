/** Hamtar urvalet publika sidor for prestandamatningen. */
import { laddaEnv } from './_env';
import { google } from 'googleapis';
import fs from 'node:fs';
laddaEnv();

async function main() {
  const credentials = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON!);
  const siteUrl = process.env.GSC_SITE_URL!;
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
  const sc = google.searchconsole({ version: 'v1', auth });

  const end = new Date(); end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 27);
  const f = (d: Date) => d.toISOString().slice(0, 10);

  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: { startDate: f(start), endDate: f(end), dimensions: ['page'], rowLimit: 500 },
  });
  const rows = (res.data.rows ?? []).map((r) => ({
    url: String(r.keys?.[0] ?? ''),
    path: String(r.keys?.[0] ?? '').replace(/^https:\/\/(www\.)?jobbcoach\.ai/, ''),
    clicks: r.clicks ?? 0, impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0, position: r.position ?? 0,
  }));

  const topp40 = [...rows].sort((a, b) => b.clicks - a.clicks).slice(0, 40);
  const lagCtr = [...rows]
    .filter((r) => r.impressions >= 150 && !topp40.some((t) => t.path === r.path))
    .sort((a, b) => a.ctr - b.ctr || b.impressions - a.impressions)
    .slice(0, 10);

  const urval = [...topp40, ...lagCtr];
  fs.writeFileSync('scripts/.publikt-urval.json', JSON.stringify({ period: [f(start), f(end)], topp40, lagCtr, urval }, null, 1));
  console.log(`Period ${f(start)} till ${f(end)}. Topp40 + ${lagCtr.length} lag-CTR = ${urval.length} sidor.`);
  console.log('\nTOPP 15 PA KLICK');
  topp40.slice(0, 15).forEach((r) => console.log(`  ${String(r.clicks).padStart(4)} klick ${String(r.impressions).padStart(6)} visn ${(r.ctr*100).toFixed(1).padStart(5)}% pos${r.position.toFixed(1).padStart(5)}  ${r.path}`));
  console.log('\nLAGST CTR (hog volym)');
  lagCtr.forEach((r) => console.log(`  ${String(r.clicks).padStart(4)} klick ${String(r.impressions).padStart(6)} visn ${(r.ctr*100).toFixed(2).padStart(5)}% pos${r.position.toFixed(1).padStart(5)}  ${r.path}`));
}
main().catch((e) => { console.error(e?.message ?? e); process.exit(1); });
