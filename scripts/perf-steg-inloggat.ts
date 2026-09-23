/**
 * Var tiden går på hemskärmen, steg för steg.
 *
 * perf-inloggat.ts säger hur lång tid LCP tar. Det här skriptet delar upp
 * samma sidladdning i de steg som ligger på den kritiska vägen, så att en
 * åtgärd kan riktas mot rätt steg:
 *
 *   auth        en rundtur till Supabase Auth (auth.getUser), som proxyn,
 *               layouten och sidan tidigare gjorde var för sig
 *   rekryterare proxyns uppslag i recruiter_profiles när cookien saknas
 *   summering   getDashboardSummary, layoutens datahämtning (körs ur src,
 *               alltså den kod som står i arbetskopian, inte den byggda)
 *   server      hela serversvaret för sidan (fetch med sessionscookie, TTFB),
 *               med och utan proxyns rekryterarcookie
 *   webbläsare  Pixel 7 med 3x CPU och LTE: svar, FCP, hydrering och LCP,
 *               JavaScript över nätet och förhämtningar (RSC) före LCP
 *
 *   npx tsx scripts/perf-steg-inloggat.ts --port 5214
 *   npx tsx scripts/perf-steg-inloggat.ts --port 5214 --sidor /dashboard,/dashboard/profil --korningar 5
 *
 * Kräver ett produktionsbygge som kör på porten. Kontot är detsamma som i
 * perf-inloggat.ts: det med mest data.
 */
import { laddaEnv } from './_env';
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

laddaEnv();

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

function median(v: number[]): number {
  const s = [...v].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

async function tid<T>(fn: () => Promise<T>): Promise<number> {
  const t = performance.now();
  await fn();
  return Math.round(performance.now() - t);
}

/**
 * Sonderna i sidan står som sträng: tsx lindar namngivna funktioner i
 * __name(), som inte finns i sidan, och då dör en sond tyst.
 */
const SONDER = `(function(){
  window.__lcp = 0; window.__hyd = 0;
  new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ window.__lcp = e.startTime; }); })
    .observe({ type: 'largest-contentful-paint', buffered: true });
  var t = function(){
    var el = document.querySelector('main');
    if (el && Object.getOwnPropertyNames(el).some(function(k){ return k.indexOf('__react') === 0; })) {
      window.__hyd = performance.now(); return;
    }
    setTimeout(t, 10);
  };
  setTimeout(t, 10);
})()`;

async function main() {
  const port = arg('port', '5214')!;
  const bas = `http://localhost:${port}`;
  const korningar = Number(arg('korningar', '5'));
  const sidor = (arg('sidor', '/dashboard,/dashboard/profil') as string).split(',');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const sb = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Samma kontoval som perf-inloggat.ts.
  const [{ data: a }, { data: s }, { data: l }] = await Promise.all([
    sb.from('job_applications').select('user_id').limit(4000),
    sb.from('logic_test_v4_sessions').select('user_id').limit(4000),
    sb.from('letters').select('user_id').limit(4000),
  ]);
  const poang = new Map<string, number>();
  for (const [rader, vikt] of [[a, 3], [s, 3], [l, 1]] as const) {
    for (const r of (rader ?? []) as Array<{ user_id: string | null }>) {
      if (r.user_id) poang.set(r.user_id, (poang.get(r.user_id) ?? 0) + vikt);
    }
  }
  const userId = [...poang.entries()].sort((x, y) => y[1] - x[1])[0][0];
  const { data: u } = await sb.auth.admin.getUserById(userId);
  const epost = u!.user!.email!;

  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost });
  const { data: sess } = await sb.auth.verifyOtp({ type: 'magiclink', token_hash: link!.properties.hashed_token });
  const session = sess!.session!;

  const projektRef = url.split('//')[1].split('.')[0];
  const cookieNamn = `sb-${projektRef}-auth-token`;
  const payload =
    'base64-' +
    Buffer.from(
      JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: 'bearer',
        user: session.user,
      })
    ).toString('base64');
  const CHUNK = 3200;
  const kakor: Array<{ name: string; value: string }> = [];
  if (payload.length <= CHUNK) kakor.push({ name: cookieNamn, value: payload });
  else
    for (let i = 0, n = 0; i < payload.length; i += CHUNK, n++)
      kakor.push({ name: `${cookieNamn}.${n}`, value: payload.slice(i, i + CHUNK) });
  const cookieHeader = kakor.map((k) => `${k.name}=${k.value}`).join('; ');

  // Klient bunden till användarens token, som layoutens cookieklient.
  const anvandarKlient = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${session.access_token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { getDashboardSummary } = await import('../src/lib/dashboard/getSummary');

  // Uppvärmning: första anropet betalar TLS-handskakningen.
  await anvandarKlient.auth.getUser(session.access_token);
  await getDashboardSummary(anvandarKlient, userId);

  const auth: number[] = [];
  const rek: number[] = [];
  const sum: number[] = [];
  for (let i = 0; i < korningar; i++) {
    auth.push(await tid(() => anvandarKlient.auth.getUser(session.access_token)));
    rek.push(await tid(async () => sb.from('recruiter_profiles').select('status').eq('user_id', userId).maybeSingle()));
    sum.push(await tid(() => getDashboardSummary(anvandarKlient, userId)));
  }

  console.log(`Konto: ${epost}   Server: ${bas}   Körningar: ${korningar}\n`);
  console.log('STEG (Node mot Supabase, median)');
  console.log(`  auth.getUser, en rundtur        ${median(auth)} ms`);
  console.log(`  recruiter_profiles, en rundtur  ${median(rek)} ms`);
  console.log(`  getDashboardSummary             ${median(sum)} ms`);

  const chrome = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].find((p) => fs.existsSync(p))!;
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });

  for (const sida of sidor) {
    // Serversvaret utan webbläsare: med och utan rekryterarcookien, så
    // proxyns uppslag syns för sig.
    const utan: number[] = [];
    const med: number[] = [];
    for (let i = 0; i < korningar; i++) {
      for (const [lista, extra] of [
        [utan, ''],
        [med, `; jc_recruiter=${userId}:0`],
      ] as const) {
        const t = performance.now();
        const r = await fetch(bas + sida, { headers: { cookie: cookieHeader + extra }, redirect: 'manual' });
        const ttfb = performance.now() - t;
        await r.text();
        lista.push(Math.round(ttfb));
      }
    }

    const matt: Array<Record<string, number>> = [];
    for (let i = 0; i < Math.min(korningar, 3); i++) {
      const p = await browser.newPage();
      await p.emulate({
        viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
        userAgent:
          'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
      });
      const cdp = await p.createCDPSession();
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 3 });
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 70,
        downloadThroughput: (12 * 1024 * 1024) / 8,
        uploadThroughput: (3 * 1024 * 1024) / 8,
      });
      for (const k of kakor) await p.setCookie({ ...k, url: bas, path: '/' });
      await p.evaluateOnNewDocument(SONDER);
      await p.goto(bas + sida, { waitUntil: 'networkidle0', timeout: 60000 });
      await new Promise((r) => setTimeout(r, 1500));
      matt.push(
        await p.evaluate(() => {
          const w = window as unknown as Record<string, number>;
          const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const fcp = performance.getEntriesByName('first-contentful-paint')[0];
          const resurser = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
          const skript = resurser.filter((r) => /\.js(\?|$)/.test(r.name));
          const rsc = resurser.filter((r) => r.name.includes('_rsc='));
          return {
            forhamtningar: rsc.length,
            forhamtningarForeLcp: rsc.filter((r) => r.startTime < w.__lcp).length,
            api: resurser.filter((r) => ['/api/', '/rest/v1', '/auth/v1'].some((d) => r.name.includes(d))).length,
            svar: Math.round(nav.responseStart),
            html: Math.round(nav.responseEnd),
            fcp: Math.round(fcp?.startTime ?? 0),
            lcp: Math.round(w.__lcp),
            hydrering: Math.round(w.__hyd),
            jsKb: Math.round(skript.reduce((acc, r) => acc + (r.transferSize || 0), 0) / 1024),
          };
        })
      );
      await p.close();
    }
    const m = (k: string) => median(matt.map((x) => x[k]));
    console.log(`\n${sida}`);
    console.log(`  server TTFB utan rekryterarcookie  ${median(utan)} ms`);
    console.log(`  server TTFB med rekryterarcookie   ${median(med)} ms`);
    console.log(
      `  Pixel 7: svar ${m('svar')} ms, HTML klar ${m('html')} ms, FCP ${m('fcp')} ms, LCP ${m('lcp')} ms, hydrering ${m('hydrering')} ms, JS ${m('jsKb')} kB`
    );
    console.log(
      `  förhämtningar (RSC) ${m('forhamtningar')}, varav före LCP ${m('forhamtningarForeLcp')}, API-anrop ${m('api')}`
    );
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
