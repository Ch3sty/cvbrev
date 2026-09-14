/**
 * Fyller admin_daily_metrics bakat i tiden.
 *
 * Kor: npx tsx scripts/admin-backfill.ts [antal dagar] [--hoppa-gsc] [--hoppa-posthog]
 * Standard ar 90 dagar, alltsa planens avsnitt 5.5.
 *
 * Engangsskript. Efter backfyllningen haller cronen tabellen aktuell genom
 * midnattsslotten i /api/cron/pricing-sync.
 *
 * Tva saker att vanta sig:
 *
 * 1. GSC ger bara vad Google har kvar, och provanropet 2026-09-14 visade bara
 *    fem dagar med rader i ett trettiodagarsfonster. Tomma dagar skrivs som
 *    null, aldrig som noll. En nolla hade last som ett ras.
 * 2. MRR ar ett nulage, inte historik. Stripe har ingen "MRR den 4 juli", sa
 *    varje backfylld dag far dagens MRR. Fran och med nu ar serien sann, men
 *    de forsta nittio dagarna ar en rak linje. Det ar medvetet och sagt har
 *    sa att ingen laser den som en platt forsaljning.
 */

import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  const args = process.argv.slice(2);
  const antalDagar = Number(args.find((a) => /^\d+$/.test(a)) ?? 90);
  const hoppaGsc = args.includes('--hoppa-gsc');
  const hoppaPosthog = args.includes('--hoppa-posthog');

  // Importeras forst efter att .env.local lasts in, annars saknas nycklarna
  // nar modulerna initieras.
  const { getSupabaseAdmin } = await import('../src/lib/supabase/admin');
  const { collectAdminMetrics, dagStr } = await import('../src/lib/admin/collect');

  const admin = getSupabaseAdmin() as any;

  console.log(
    `Backfyller ${antalDagar} dagar${hoppaGsc ? ', utan GSC' : ''}${
      hoppaPosthog ? ', utan PostHog' : ''
    }.\n`
  );

  let ok = 0;
  let fel = 0;
  const nu = Date.now();

  // Aldsta dagen forst, sa en avbruten korning lamnar en sammanhangande serie.
  for (let i = antalDagar - 1; i >= 0; i--) {
    const dag = dagStr(new Date(nu - i * 24 * 60 * 60 * 1000));

    try {
      const res = await collectAdminMetrics(admin, dag, { hoppaGsc, hoppaPosthog });
      const steg = Object.entries(res.delsteg)
        .map(([k, v]) => `${k}:${v}`)
        .join(' ');
      console.log(
        `${dag}  ${res.skrev ? 'skrev' : 'MISSLYCKADES'}  ${steg}${
          res.fel.length ? `  ${res.fel.join('; ')}` : ''
        }`
      );
      if (res.skrev) ok++;
      else fel++;
    } catch (err) {
      fel++;
      console.error(`${dag}  FEL  ${err instanceof Error ? err.message : err}`);
    }
  }

  const { count } = await admin
    .from('admin_daily_metrics')
    .select('*', { count: 'exact', head: true });

  console.log(`\n${ok} dagar skrivna, ${fel} misslyckade.`);
  console.log(`admin_daily_metrics har nu ${count ?? 0} rader.`);
}

main().catch((err) => {
  console.error('Backfyllningen misslyckades:', err?.message ?? err);
  process.exit(1);
});
