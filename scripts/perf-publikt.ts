/**
 * Prestandabudget för de publika sidorna.
 *
 * Samma emulering som scripts/perf-inloggat.ts (Pixel 7, 3x CPU-strypning,
 * LTE) men utan inloggning. Sidurvalet styrs av Search Console: topp 40 på
 * klick plus de tio med högst visningsvolym och lägst CTR, hämtat av
 * scripts/_gsc-publikt.ts till scripts/.publikt-urval.json.
 *
 *   npm run perf:publikt -- --port 8300 --korningar 3
 *   npm run perf:publikt -- --port 8300 --filter artiklar
 *
 * Budget: startsidan under 1000 ms, artiklar och exempelsidor under 1500 ms,
 * CLS 0. Grinden fäller vid mer än 20 procent över budget eller CLS över
 * 0,002, samma tolerans som det inloggade läget.
 */
import { laddaEnv } from './_env';
import puppeteer, { type Browser } from 'puppeteer-core';
import fs from 'node:fs';

laddaEnv();

const CHROME_KANDIDATER = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

/** CLS under detta är sub-pixelavrundning i mätningen, inte ett synligt skifte. */
const CLS_BRUS = 0.002;

const BUDGET_START = 1000;
const BUDGET_SIDA = 1500;

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

function median(v: number[]): number {
  const s = [...v].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

interface Matning {
  lcp: number;
  cls: number;
  fcp: number;
  ttfb: number;
  forfragningar: number;
  bytes: number;
  textLangd: number;
}

async function main() {
  const port = arg('port', '8300')!;
  const bas = `http://localhost:${port}`;
  const korningar = Number(arg('korningar', '3'));
  const filter = arg('filter');
  const jsonUt = arg('json');

  const chrome = CHROME_KANDIDATER.find((p) => fs.existsSync(p));
  if (!chrome) throw new Error('Hittade ingen Chrome eller Edge.');

  const urvalFil = 'scripts/.publikt-urval.json';
  if (!fs.existsSync(urvalFil)) {
    throw new Error(`${urvalFil} saknas. Kör först: npx tsx scripts/_gsc-publikt.ts`);
  }
  const data = JSON.parse(fs.readFileSync(urvalFil, 'utf8'));

  // Ankarlänkar mäts som sin bassida, dubbletter bort.
  const sidor = [
    ...new Map(
      (data.urval as Array<{ path: string; clicks: number; impressions: number }>).map((r) => {
        const p = r.path.split('#')[0] || '/';
        return [p, { path: p, clicks: r.clicks, impressions: r.impressions }];
      })
    ).values(),
  ].filter((s) => !filter || s.path.includes(filter));

  const svar = await fetch(bas + '/').catch(() => null);
  if (!svar) {
    throw new Error(
      `Ingen server på ${bas}. Kör först:\n` +
        `  NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npx next build\n` +
        `  NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npx next start -p ${port}`
    );
  }

  const browser: Browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  async function mat(url: string): Promise<Matning> {
    const page = await browser.newPage();
    try {
      await page.emulate({
        viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
        userAgent:
          'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
      });
      const cdp = await page.createCDPSession();
      // Varje mätning ska spegla ett förstabesök. Utan detta återanvänder
      // Chrome cachade resurser mellan sidorna och rapporterar 0 kB.
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 3 });
      await cdp.send('Network.enable');
      // Cachestyrningen MÅSTE ligga efter Network.enable. Anropas den före
      // ignoreras den tyst, och då mäter vi varm cache: samma artikel gav
      // 42 kB och 500 ms i en körning och 600 kB och 1900 ms i nästa.
      await cdp.send("Network.clearBrowserCache");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 70,
        downloadThroughput: (12 * 1024 * 1024) / 8,
        uploadThroughput: (3 * 1024 * 1024) / 8,
      });
      await page.evaluateOnNewDocument(() => {
        (window as unknown as Record<string, unknown>).__lcp = 0;
        (window as unknown as Record<string, unknown>).__cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) {
            (window as unknown as Record<string, unknown>).__lcp = e.startTime;
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) {
            const s = e as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!s.hadRecentInput) {
              const w = window as unknown as Record<string, number>;
              w.__cls = (w.__cls ?? 0) + (s.value ?? 0);
            }
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      await new Promise((r) => setTimeout(r, 1500));
      return await page.evaluate(() => {
        const w = window as unknown as Record<string, number>;
        const nav = performance.getEntriesByType('navigation')[0] as
          | PerformanceNavigationTiming
          | undefined;
        const fcp = performance.getEntriesByName('first-contentful-paint')[0];
        const resurser = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        return {
          lcp: Math.round(w.__lcp || 0),
          cls: Number((w.__cls || 0).toFixed(3)),
          fcp: Math.round(fcp?.startTime ?? 0),
          ttfb: Math.round(nav?.responseStart ?? 0),
          forfragningar: resurser.length,
          bytes: Math.round(resurser.reduce((a, r) => a + (r.transferSize || 0), 0) / 1024),
          textLangd: document.body.innerText.length,
        };
      });
    } finally {
      await page.close();
    }
  }

  console.log(`Server: ${bas}   Körningar: ${korningar}   Sidor: ${sidor.length}`);
  console.log('Emulering: Pixel 7, 3x CPU-strypning, LTE (70 ms latens), utan inloggning\n');

  const resultat: Array<{ path: string; clicks: number; budget: number; m: Matning | null }> = [];
  for (const s of sidor) {
    const budget = s.path === '/' ? BUDGET_START : BUDGET_SIDA;
    const korda: Matning[] = [];
    for (let i = 0; i < korningar; i++) {
      try {
        korda.push(await mat(bas + s.path));
      } catch (e) {
        console.log(`${s.path.padEnd(50)} FEL: ${(e as Error).message.slice(0, 50)}`);
      }
    }
    if (!korda.length) {
      resultat.push({ path: s.path, clicks: s.clicks, budget, m: null });
      continue;
    }
    const m: Matning = {
      lcp: median(korda.map((k) => k.lcp)),
      cls: median(korda.map((k) => k.cls)),
      fcp: median(korda.map((k) => k.fcp)),
      ttfb: median(korda.map((k) => k.ttfb)),
      forfragningar: median(korda.map((k) => k.forfragningar)),
      bytes: median(korda.map((k) => k.bytes)),
      textLangd: median(korda.map((k) => k.textLangd)),
    };
    resultat.push({ path: s.path, clicks: s.clicks, budget, m });
    const ok = m.lcp <= budget && m.cls <= CLS_BRUS;
    console.log(
      `${ok ? 'OK  ' : 'ÖVER'} ${s.path.padEnd(50)} LCP ${String(m.lcp).padStart(5)} (${budget})  ` +
        `CLS ${String(m.cls).padStart(5)}  FCP ${String(m.fcp).padStart(4)}  ${String(m.bytes).padStart(4)} kB`
    );
  }

  await browser.close();

  console.log('\n\nSAMMANFATTNING');
  console.log(
    'sida'.padEnd(50) + 'klick'.padStart(6) + 'LCP'.padStart(7) + 'FCP'.padStart(7) +
      'CLS'.padStart(7) + 'TTFB'.padStart(6) + 'kB'.padStart(6) + '  status'
  );
  console.log('-'.repeat(104));
  let over = 0;
  for (const r of resultat) {
    if (!r.m) {
      console.log(r.path.padEnd(50) + '  (mätning misslyckades)');
      continue;
    }
    const ok = r.m.lcp <= r.budget && r.m.cls <= CLS_BRUS;
    if (!ok) over++;
    console.log(
      r.path.padEnd(50) + String(r.clicks).padStart(6) + String(r.m.lcp).padStart(7) +
        String(r.m.fcp).padStart(7) + String(r.m.cls).padStart(7) + String(r.m.ttfb).padStart(6) +
        String(r.m.bytes).padStart(6) + (ok ? '  OK' : '  ÖVER BUDGET')
    );
  }
  const matta = resultat.filter((r) => r.m).length;
  console.log('-'.repeat(104));
  console.log(`${matta - over} av ${matta} inom budget.`);

  if (jsonUt) {
    fs.writeFileSync(
      jsonUt,
      JSON.stringify({ tid: new Date().toISOString(), bas, korningar, resultat }, null, 2)
    );
    console.log(`Sparat till ${jsonUt}`);
  }

  // Grindvakt, samma tolerans som det inloggade läget.
  const TOLERANS = Number(arg('tolerans', '20')) / 100;
  const spruckna = resultat.filter((r) => r.m && r.m.lcp > r.budget * (1 + TOLERANS));
  if (spruckna.length) {
    console.log(`\nFEL: ${spruckna.length} sida(or) over budget med mer an ${Math.round(TOLERANS * 100)} procent:`);
    for (const r of spruckna) {
      console.log(`  ${r.path.padEnd(50)} ${r.m!.lcp} ms mot budget ${r.budget}`);
    }
    process.exitCode = 1;
    return;
  }
  const skiftande = resultat.filter((r) => r.m && r.m.cls > CLS_BRUS);
  if (skiftande.length) {
    console.log(`\nFEL: ${skiftande.length} sida(or) med layoutskifte (CLS ska vara 0):`);
    for (const r of skiftande) console.log(`  ${r.path.padEnd(50)} CLS ${r.m!.cls}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e?.message ?? e);
  process.exit(1);
});
