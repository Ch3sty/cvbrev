/**
 * Fyller admin_daily_metrics bakat i tiden.
 *
 * Kor: npx tsx scripts/admin-backfill.ts [antal dagar] [--hoppa-gsc] [--hoppa-posthog]
 * Standard ar 90 dagar, alltsa planens avsnitt 5.5.
 *
 * Med --bara-flode skrivs bara admin_flode_daily (kopflodet och
 * onboardingen per dag ur PostHog), ingenting annat.
 *
 * Med --bara-anvandning skrivs bara de fyra anvandningskolumnerna
 * (cv_uploaded, letters_created, tests_completed, templates_downloaded), och
 * ingenting annat rors. Det ar lagets enda satt att fylla nya kolumner bakat:
 * en vanlig omkorning gor en full upsert, och ett --hoppa-gsc dar hade
 * skrivit null over de 88 dagar som redan har GSC-siffror. Stripe, GSC och
 * PostHog anropas inte alls i det laget, sa 90 dagar tar sekunder i stallet
 * for tiotals minuter.
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

import { laddaEnv } from './_env';

laddaEnv();

async function main() {
  const args = process.argv.slice(2);
  const antalDagar = Number(args.find((a) => /^\d+$/.test(a)) ?? 90);
  const hoppaGsc = args.includes('--hoppa-gsc');
  const hoppaPosthog = args.includes('--hoppa-posthog');
  const baraAnvandning = args.includes('--bara-anvandning');
  const baraFlode = args.includes('--bara-flode');

  // Importeras forst efter att .env.local lasts in, annars saknas nycklarna
  // nar modulerna initieras.
  const { getSupabaseAdmin } = await import('../src/lib/supabase/admin');
  const { collectAdminMetrics, samlaAnvandning, samlaFlode, dagStr } = await import(
    '../src/lib/admin/collect'
  );

  const admin = getSupabaseAdmin() as any;

  if (baraAnvandning) {
    await backfyllAnvandning(admin, antalDagar, samlaAnvandning, dagStr);
    return;
  }

  if (baraFlode) {
    await backfyllFlode(admin, antalDagar, samlaFlode, dagStr);
    return;
  }

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

/**
 * Skriver bara de fyra anvandningskolumnerna, en dag i taget.
 *
 * Upsert pa dag, sa en dag som annu inte finns skapas och en som finns far
 * sina ovriga kolumner ororda: PostgREST skriver bara de falt som skickas.
 * Det ar hela poangen med det har laget. En full omkorning hade gatt mot
 * Stripe nittio ganger och, med --hoppa-gsc, skrivit null over de 88 dagar
 * som redan har GSC-siffror.
 */
async function backfyllAnvandning(
  admin: any,
  antalDagar: number,
  samlaAnvandning: (admin: any, dag: string) => Promise<Record<string, number>>,
  dagStr: (d?: Date) => string
) {
  console.log(
    `Backfyller ${antalDagar} dagar, bara anvandningskolumnerna.\n`
  );

  let ok = 0;
  let fel = 0;
  const nu = Date.now();
  const summor: Record<string, number> = {};

  for (let i = antalDagar - 1; i >= 0; i--) {
    const dag = dagStr(new Date(nu - i * 24 * 60 * 60 * 1000));

    try {
      const tal = await samlaAnvandning(admin, dag);
      const { error } = await admin
        .from('admin_daily_metrics')
        .upsert({ dag, ...tal }, { onConflict: 'dag' });
      if (error) throw new Error(error.message);

      for (const [k, v] of Object.entries(tal)) {
        summor[k] = (summor[k] ?? 0) + v;
      }

      const rad = Object.entries(tal)
        .map(([k, v]) => `${k}:${v}`)
        .join(' ');
      // Bara dagar med nagot att visa, annars ar 90 rader nollor brus.
      if (Object.values(tal).some((v) => v > 0)) console.log(`${dag}  ${rad}`);
      ok++;
    } catch (err) {
      fel++;
      console.error(`${dag}  FEL  ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\n${ok} dagar skrivna, ${fel} misslyckade.`);
  console.log('Summa over perioden:');
  for (const [k, v] of Object.entries(summor)) console.log(`  ${k}: ${v}`);
}

/**
 * Skriver bara admin_flode_daily, en dag i taget, ur PostHog.
 *
 * Med --bara-flode rors varken admin_daily_metrics, GSC eller Stripe: det ar
 * ett HogQL-anrop per dag och ingenting annat. Anvands nar /admin/flode ska
 * fa historik utan att en full omkorning skriver over andra kolumner.
 * Handelserna ar nya 2026-09-22, sa dagar fore det ger bara pageview och
 * signup_completed, vilket ar korrekt och inte en lucka.
 */
async function backfyllFlode(
  admin: any,
  antalDagar: number,
  samlaFlode: (dag: string) => Promise<Array<Record<string, unknown>> | null>,
  dagStr: (d?: Date) => string
) {
  console.log(`Backfyller ${antalDagar} dagar, bara admin_flode_daily.\n`);

  let ok = 0;
  let fel = 0;
  const nu = Date.now();

  for (let i = antalDagar - 1; i >= 0; i--) {
    const dag = dagStr(new Date(nu - i * 24 * 60 * 60 * 1000));
    try {
      const rader = await samlaFlode(dag);
      if (!rader) throw new Error('PostHog-nycklarna saknas');
      await admin.from('admin_flode_daily').delete().eq('dag', dag);
      const { error } = await admin
        .from('admin_flode_daily')
        .upsert(rader, { onConflict: 'dag,handelse,dimension' });
      if (error) throw new Error(error.message);
      const handelser = rader.filter((r) => r.dimension === '' && r.handelse !== '_samlad');
      console.log(
        `${dag}  ${handelser.map((r) => `${r.handelse}:${r.personer}`).join(' ') || 'inga handelser'}`
      );
      ok++;
    } catch (err) {
      fel++;
      console.error(`${dag}  FEL  ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\n${ok} dagar skrivna, ${fel} misslyckade.`);
}

main().catch((err) => {
  console.error('Backfyllningen misslyckades:', err?.message ?? err);
  process.exit(1);
});
