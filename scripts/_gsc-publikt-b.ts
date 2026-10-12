/**
 * Urvalet för del B:s SEO-grind (spec-publikt-v2 del B 4.1): de 20 mest
 * klickade artiklarna, CV-exemplen och brevexemplen i Search Console de
 * senaste 90 dagarna. Skriver scripts/.publikt-urval-b.json.
 */
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
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 89);
  const f = (d: Date) => d.toISOString().slice(0, 10);
  const res = await sc.searchanalytics.query({
    siteUrl,
    requestBody: { startDate: f(start), endDate: f(end), dimensions: ['page'], rowLimit: 2000 },
  });
  const rows = (res.data.rows ?? []).map((r) => ({
    path: String(r.keys?.[0] ?? '').replace(/^https:\/\/(www\.)?jobbcoach\.ai/, '').split('#')[0].split('?')[0],
    clicks: r.clicks ?? 0,
  }));
  const summa = new Map<string, number>();
  for (const r of rows) summa.set(r.path, (summa.get(r.path) ?? 0) + r.clicks);
  const sorterad = [...summa].sort((a, b) => b[1] - a[1]);
  const topp = (re: RegExp) => sorterad.filter(([p]) => re.test(p)).slice(0, 20).map(([path, clicks]) => ({ path, clicks }));
  const ut = {
    period: [f(start), f(end)],
    artiklar: topp(/^\/artiklar\/[^/]+$/),
    cv: topp(/^\/cv-exempel\/[^/]+$/),
    brev: topp(/^\/personligt-brev-exempel\/[^/]+$/),
  };
  fs.writeFileSync('scripts/.publikt-urval-b.json', JSON.stringify(ut, null, 1));
  for (const k of ['artiklar', 'cv', 'brev'] as const) console.log(k, ut[k].map((r) => `${r.path} ${r.clicks}`).join('\n  '));
}
main().catch((e) => { console.error(e?.message ?? e); process.exit(1); });
