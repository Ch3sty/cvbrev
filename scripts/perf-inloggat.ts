/**
 * Prestandabudget för det inloggade läget.
 *
 * Loggar in med ett riktigt konto, mäter LCP, CLS och antal rundturer före
 * första innehåll på varje route under /dashboard, och skriver en tabell.
 * Kör den före och efter varje större ändring.
 *
 *   npx tsx scripts/perf-inloggat.ts                     # alla routes, 3 körningar
 *   npx tsx scripts/perf-inloggat.ts --korningar 1       # snabbare
 *   npx tsx scripts/perf-inloggat.ts --port 5200         # mot en server som redan kör
 *   npx tsx scripts/perf-inloggat.ts --filter tester     # bara routes som matchar
 *   npx tsx scripts/perf-inloggat.ts --json ut.json      # spara resultatet
 *
 * Kräver att `npx next build` har körts och att en produktionsserver kör på
 * porten (`npx next start -p 5200`). Mätningen emulerar Pixel 7 med 3x
 * CPU-strypning och LTE, alltså ungefär en vanlig mobil på mobilnät.
 *
 * Budget (docs/rapporter/perf-inloggat-2026-09-12.md):
 *   dashboard och profil      under 1000 ms
 *   listor och hubbar         under 1500 ms
 *   flödessidor               under 2000 ms
 *   CLS                       0 överallt
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import puppeteer, { type Browser } from 'puppeteer-core';
import fs from 'node:fs';

config({ path: '.env.local' });

const CHROME_KANDIDATER = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

type Budget = 'kritisk' | 'lista' | 'flode';

const BUDGET_MS: Record<Budget, number> = {
  kritisk: 1000,
  lista: 1500,
  flode: 2000,
};

interface RouteDef {
  path: string;
  namn: string;
  budget: Budget;
  /** Slås upp i databasen först, till exempel ett brev-id. */
  dynamisk?: 'letter' | 'application' | 'testSession';
}

const ROUTES: RouteDef[] = [
  { path: '/dashboard', namn: 'dashboard', budget: 'kritisk' },
  { path: '/dashboard/profil', namn: 'profil', budget: 'kritisk' },
  { path: '/dashboard/profil/cv', namn: 'profil/cv', budget: 'lista' },
  { path: '/dashboard/profil/prenumeration', namn: 'prenumeration', budget: 'lista' },
  { path: '/dashboard/sokta-tjanster', namn: 'sokta-tjanster', budget: 'lista' },
  { path: '/dashboard/sokta-tjanster/ID', namn: 'sokta-tjanster/[id]', budget: 'lista', dynamisk: 'application' },
  { path: '/dashboard/mina-brev', namn: 'mina-brev', budget: 'lista' },
  { path: '/dashboard/mina-brev/ID', namn: 'mina-brev/[id]', budget: 'lista', dynamisk: 'letter' },
  { path: '/dashboard/cv-mallar', namn: 'cv-mallar', budget: 'lista' },
  { path: '/dashboard/tester', namn: 'tester', budget: 'lista' },
  { path: '/dashboard/tester/matrislogik-grund', namn: 'tester/[slug]', budget: 'lista' },
  { path: '/dashboard/bli-upptackt', namn: 'bli-upptackt', budget: 'lista' },
  { path: '/dashboard/meddelanden', namn: 'meddelanden', budget: 'lista' },
  { path: '/dashboard/kontakt', namn: 'kontakt', budget: 'lista' },
  { path: '/dashboard/skapa-brev', namn: 'skapa-brev', budget: 'flode' },
  { path: '/dashboard/skapa-cv', namn: 'skapa-cv', budget: 'flode' },
  { path: '/dashboard/cv-analys', namn: 'cv-analys', budget: 'flode' },
  { path: '/dashboard/jobbmatchning', namn: 'jobbmatchning', budget: 'flode' },
  { path: '/dashboard/jobbcoachen', namn: 'jobbcoachen', budget: 'flode' },
  { path: '/dashboard/linkedin-optimizer', namn: 'linkedin-optimizer', budget: 'flode' },
  { path: '/dashboard/arbetsstil', namn: 'arbetsstil', budget: 'flode' },
];

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

interface Matning {
  lcp: number;
  cls: number;
  fcp: number;
  rundturer: number;
  textLangd: number;
  forfragningar: number;
}

function median(v: number[]): number {
  const s = [...v].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

async function main() {
  const port = arg('port', '5200')!;
  const bas = `http://localhost:${port}`;
  const korningar = Number(arg('korningar', '3'));
  const filter = arg('filter');
  const jsonUt = arg('json');

  const chrome = CHROME_KANDIDATER.find((p) => fs.existsSync(p));
  if (!chrome) throw new Error('Hittade ingen Chrome eller Edge. Installera en, eller ange sökvägen i skriptet.');

  const res = await fetch(bas + '/login').catch(() => null);
  if (!res) {
    throw new Error(
      `Ingen server på ${bas}. Kör först:\n` +
        `  NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npx next build\n` +
        `  NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npx next start -p ${port}`
    );
  }

  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Ett konto med data, så mätningen speglar en verklig vy och inte tomma listor.
  const { data: profiler } = await sb
    .from('profiles')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(25);

  let epost: string | null = null;
  let userId: string | null = null;
  for (const p of profiler ?? []) {
    const { data } = await sb.auth.admin.getUserById(p.id);
    if (data?.user?.email) {
      epost = data.user.email;
      userId = p.id;
      break;
    }
  }
  if (!epost || !userId) throw new Error('Hittade inget konto att mäta med.');

  // Slå upp riktiga id:n för de dynamiska routerna.
  const [{ data: brev }, { data: ansokningar }] = await Promise.all([
    sb.from('letters').select('id').eq('user_id', userId).limit(1),
    sb.from('job_applications').select('id').eq('user_id', userId).limit(1),
  ]);
  const idPerTyp: Record<string, string | null> = {
    letter: brev?.[0]?.id ?? null,
    application: ansokningar?.[0]?.id ?? null,
    testSession: null,
  };

  // Skapa en session och plantera cookien direkt. Magic link-redirect pekar
  // mot produktion och fungerar inte lokalt.
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost });
  const { data: sess, error: sessFel } = await sb.auth.verifyOtp({
    type: 'magiclink',
    token_hash: link!.properties.hashed_token,
  });
  if (sessFel || !sess?.session) throw new Error('Kunde inte skapa session: ' + sessFel?.message);

  const projektRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0];
  const cookieNamn = `sb-${projektRef}-auth-token`;
  const payload =
    'base64-' +
    Buffer.from(
      JSON.stringify({
        access_token: sess.session.access_token,
        refresh_token: sess.session.refresh_token,
        expires_at: sess.session.expires_at,
        expires_in: sess.session.expires_in,
        token_type: 'bearer',
        user: sess.session.user,
      })
    ).toString('base64');

  const browser: Browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  async function nySida() {
    const page = await browser.newPage();
    await page.emulate({
      viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
      userAgent:
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
    });
    const cdp = await page.createCDPSession();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 3 });
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 70,
      downloadThroughput: (12 * 1024 * 1024) / 8,
      uploadThroughput: (3 * 1024 * 1024) / 8,
    });

    const CHUNK = 3200;
    if (payload.length <= CHUNK) {
      await page.setCookie({ name: cookieNamn, value: payload, url: bas, path: '/' });
    } else {
      for (let i = 0, n = 0; i < payload.length; i += CHUNK, n++) {
        await page.setCookie({ name: `${cookieNamn}.${n}`, value: payload.slice(i, i + CHUNK), url: bas, path: '/' });
      }
    }

    await page.evaluateOnNewDocument(() => {
      (window as any).__lcp = 0;
      (window as any).__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) (window as any).__lcp = e.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) {
          const s = e as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
          if (!s.hadRecentInput) (window as any).__cls += s.value ?? 0;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    return page;
  }

  async function mat(url: string): Promise<Matning> {
    const page = await nySida();
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await new Promise((r) => setTimeout(r, 2000));
      return await page.evaluate(() => {
        const lcp = (window as any).__lcp || 0;
        const resurser = performance.getEntriesByType('resource');
        const api = resurser.filter(
          (r) =>
            r.name.indexOf('/api/') >= 0 || r.name.indexOf('/rest/v1') >= 0 || r.name.indexOf('/auth/v1') >= 0
        );
        const fcp = performance.getEntriesByName('first-contentful-paint')[0];
        return {
          lcp: Math.round(lcp),
          cls: Number(((window as any).__cls || 0).toFixed(3)),
          fcp: Math.round(fcp?.startTime ?? 0),
          rundturer: api.filter((r) => r.startTime <= lcp).length,
          textLangd: document.body.innerText.length,
          forfragningar: resurser.length,
        };
      });
    } finally {
      await page.close();
    }
  }

  const valda = ROUTES.filter((r) => !filter || r.namn.includes(filter) || r.path.includes(filter));
  console.log(`Konto: ${epost}`);
  console.log(`Server: ${bas}   Körningar per route: ${korningar}   Routes: ${valda.length}`);
  console.log('Emulering: Pixel 7, 3x CPU-strypning, LTE (70 ms latens)\n');

  const resultat: Array<{ namn: string; budget: Budget; m: Matning | null; hoppat?: string }> = [];

  for (const route of valda) {
    let path = route.path;
    if (route.dynamisk) {
      const id = idPerTyp[route.dynamisk];
      if (!id) {
        console.log(`${route.namn.padEnd(24)} hoppas över (ingen ${route.dynamisk} för kontot)`);
        resultat.push({ namn: route.namn, budget: route.budget, m: null, hoppat: `ingen ${route.dynamisk}` });
        continue;
      }
      path = path.replace('ID', id);
    }

    const korda: Matning[] = [];
    for (let i = 0; i < korningar; i++) {
      try {
        korda.push(await mat(bas + path));
      } catch (e) {
        console.log(`${route.namn.padEnd(24)} FEL: ${(e as Error).message.slice(0, 60)}`);
      }
    }
    if (!korda.length) {
      resultat.push({ namn: route.namn, budget: route.budget, m: null, hoppat: 'mätning misslyckades' });
      continue;
    }

    const m: Matning = {
      lcp: median(korda.map((k) => k.lcp)),
      cls: median(korda.map((k) => k.cls)),
      fcp: median(korda.map((k) => k.fcp)),
      rundturer: median(korda.map((k) => k.rundturer)),
      textLangd: median(korda.map((k) => k.textLangd)),
      forfragningar: median(korda.map((k) => k.forfragningar)),
    };
    resultat.push({ namn: route.namn, budget: route.budget, m });

    const tak = BUDGET_MS[route.budget];
    const status = m.lcp <= tak && m.cls === 0 ? 'OK ' : 'ÖVER';
    console.log(
      `${status} ${route.namn.padEnd(24)} LCP ${String(m.lcp).padStart(5)} ms (budget ${tak})` +
        `  CLS ${String(m.cls).padStart(5)}  rundturer ${String(m.rundturer).padStart(2)}  text ${m.textLangd}`
    );
  }

  await browser.close();

  console.log('\n\nSAMMANFATTNING');
  console.log('sida'.padEnd(24) + 'budget'.padEnd(9) + 'LCP'.padStart(8) + 'FCP'.padStart(8) + 'CLS'.padStart(8) + 'rundt.'.padStart(8) + 'förfr.'.padStart(8) + '  status');
  console.log('-'.repeat(80));
  let over = 0;
  for (const r of resultat) {
    if (!r.m) {
      console.log(r.namn.padEnd(24) + r.budget.padEnd(9) + '  (' + r.hoppat + ')');
      continue;
    }
    const tak = BUDGET_MS[r.budget];
    const klar = r.m.lcp <= tak && r.m.cls === 0;
    if (!klar) over++;
    console.log(
      r.namn.padEnd(24) +
        r.budget.padEnd(9) +
        String(r.m.lcp).padStart(8) +
        String(r.m.fcp).padStart(8) +
        String(r.m.cls).padStart(8) +
        String(r.m.rundturer).padStart(8) +
        String(r.m.forfragningar).padStart(8) +
        (klar ? '  OK' : '  ÖVER BUDGET')
    );
  }
  const matta = resultat.filter((r) => r.m).length;
  console.log('-'.repeat(80));
  console.log(`${matta - over} av ${matta} inom budget.`);

  if (jsonUt) {
    fs.writeFileSync(jsonUt, JSON.stringify({ tid: new Date().toISOString(), bas, korningar, resultat }, null, 2));
    console.log(`Sparat till ${jsonUt}`);
  }
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
