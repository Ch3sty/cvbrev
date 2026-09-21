/** Hämtar GSC-data för analysrapporten. npx tsx scripts/analys-gsc.ts */
import { laddaEnv } from './_env';
import { google } from 'googleapis';
import fs from 'node:fs';
laddaEnv();

const START = '2026-06-12';

async function main() {
  const credentials = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON!);
  const siteUrl = process.env.GSC_SITE_URL!;
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
  const sc = google.searchconsole({ version: 'v1', auth });

  const q = async (body: any) => {
    const res = await sc.searchanalytics.query({ siteUrl, requestBody: body });
    return res.data.rows ?? [];
  };

  // hitta senaste dag med data
  const end = new Date();
  let endDate = '';
  for (let i = 1; i <= 10; i++) {
    const d = new Date(end); d.setUTCDate(d.getUTCDate() - i);
    const s = d.toISOString().slice(0,10);
    const rows = await q({ startDate: s, endDate: s, dimensions: ['date'], rowLimit: 1 });
    if (rows.length) { endDate = s; break; }
  }
  console.error('Senaste dag med data:', endDate);

  const out: any = { start: START, end: endDate };
  out.byDate = await q({ startDate: START, endDate, dimensions: ['date'], rowLimit: 500 });
  out.byDevice = await q({ startDate: START, endDate, dimensions: ['device'], rowLimit: 10 });
  out.byCountry = await q({ startDate: START, endDate, dimensions: ['country'], rowLimit: 30 });
  out.byPage = await q({ startDate: START, endDate, dimensions: ['page'], rowLimit: 200 });
  out.byQuery = await q({ startDate: START, endDate, dimensions: ['query'], rowLimit: 500 });
  out.bySearchAppearance = await q({ startDate: START, endDate, dimensions: ['searchAppearance'], rowLimit: 20 }).catch(()=>[]);

  // tre kalendermånader
  const months = [
    ['2026-06-12','2026-06-30','jun (12-30)'],
    ['2026-07-01','2026-07-31','jul'],
    ['2026-08-01','2026-08-31','aug'],
    ['2026-09-01', endDate, 'sep (del)'],
  ];
  out.months = [];
  for (const [s,e,label] of months) {
    if (s > endDate) continue;
    const totals = await q({ startDate: s, endDate: e > endDate ? endDate : e, dimensions: [], rowLimit: 1 });
    const pages = await q({ startDate: s, endDate: e > endDate ? endDate : e, dimensions: ['page'], rowLimit: 150 });
    const queries = await q({ startDate: s, endDate: e > endDate ? endDate : e, dimensions: ['query'], rowLimit: 200 });
    const devices = await q({ startDate: s, endDate: e > endDate ? endDate : e, dimensions: ['device'], rowLimit: 10 });
    out.months.push({ label, start: s, end: e > endDate ? endDate : e, totals: totals[0] ?? null, pages, queries, devices });
  }

  // frågor med sida (för CTR-analys per sida)
  out.queryPage = await q({ startDate: '2026-08-01', endDate, dimensions: ['query','page'], rowLimit: 500 });

  fs.writeFileSync('scripts/.data-gsc.json', JSON.stringify(out));
  console.error('Klart. Dagar:', out.byDate.length, 'Sidor:', out.byPage.length, 'Frågor:', out.byQuery.length);
}
main().catch(e => { console.error(e?.message ?? e); process.exit(1); });
