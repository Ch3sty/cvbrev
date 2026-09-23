/**
 * Hämtar Search Console-data för SEO-tillväxtanalysen (docs/rapporter/analys-seo-tillvaxt-*).
 *
 *   npx tsx scripts/analys-seo-tillvaxt.ts [utfil.json]
 *
 * Hämtar per dag, per sida, per fråga och per sida+fråga från 12 juni till
 * senaste dag med data, uppdelat i delperioderna juni-juli, augusti och
 * september, samt de senaste 14 dagarna mot de 14 dagarna före. Bara läsning.
 */
import { laddaEnv } from './_env';
import { google } from 'googleapis';
import fs from 'node:fs';
laddaEnv();

const START = '2026-06-12';
const UT = process.argv[2] ?? 'scripts/.data-seo-tillvaxt.json';

async function main() {
  const credentials = JSON.parse(process.env.GSC_SERVICE_ACCOUNT_JSON!);
  const siteUrl = process.env.GSC_SITE_URL!;
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
  const sc = google.searchconsole({ version: 'v1', auth });

  // Paginerar tills API:t tar slut (max 25 000 per anrop).
  const q = async (body: Record<string, unknown>, max = 50000) => {
    const out: any[] = [];
    for (let startRow = 0; startRow < max; startRow += 25000) {
      const res = await sc.searchanalytics.query({ siteUrl, requestBody: { ...body, rowLimit: 25000, startRow } });
      const rows = res.data.rows ?? [];
      out.push(...rows);
      if (rows.length < 25000) break;
    }
    return out;
  };

  let endDate = '';
  const now = new Date();
  for (let i = 1; i <= 10; i++) {
    const d = new Date(now); d.setUTCDate(d.getUTCDate() - i);
    const s = d.toISOString().slice(0, 10);
    const rows = await q({ startDate: s, endDate: s, dimensions: ['date'] }, 1);
    if (rows.length) { endDate = s; break; }
  }
  console.error('Senaste dag med data:', endDate);
  const minus = (s: string, n: number) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };

  const perioder: [string, string, string][] = [
    ['junjul', START, '2026-07-31'],
    ['aug', '2026-08-01', '2026-08-31'],
    ['sep', '2026-09-01', endDate],
    ['senaste14', minus(endDate, 13), endDate],
    ['fore14', minus(endDate, 27), minus(endDate, 14)],
    ['forra_rapporten', START, '2026-09-09'],
    ['sedan9sep', '2026-09-10', endDate],
  ];

  const out: any = { start: START, end: endDate, perioder: {} };
  out.byDate = await q({ startDate: START, endDate, dimensions: ['date'] });
  out.byDateCountry = await q({ startDate: START, endDate, dimensions: ['date', 'country'], dimensionFilterGroups: [{ filters: [{ dimension: 'country', operator: 'equals', expression: 'swe' }] }] });
  out.byPage = await q({ startDate: START, endDate, dimensions: ['page'] });
  out.byQuery = await q({ startDate: START, endDate, dimensions: ['query'] });
  out.byDevice = await q({ startDate: START, endDate, dimensions: ['device'] });
  out.byCountry = await q({ startDate: START, endDate, dimensions: ['country'] });
  for (const [namn, s, e] of perioder) {
    const [tot, pages, queries, qp, dev] = await Promise.all([
      q({ startDate: s, endDate: e, dimensions: [] }),
      q({ startDate: s, endDate: e, dimensions: ['page'] }),
      q({ startDate: s, endDate: e, dimensions: ['query'] }),
      q({ startDate: s, endDate: e, dimensions: ['query', 'page'] }),
      q({ startDate: s, endDate: e, dimensions: ['device'] }),
    ]);
    out.perioder[namn] = { start: s, end: e, totals: tot[0] ?? null, pages, queries, queryPage: qp, devices: dev };
    console.error(namn, s, e, 'sidor', pages.length, 'frågor', queries.length, 'fråga+sida', qp.length);
  }
  fs.writeFileSync(UT, JSON.stringify(out));
  console.error('Skrev', UT);
}
main().catch((e) => { console.error(e?.message ?? e); process.exit(1); });
