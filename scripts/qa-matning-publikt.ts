/**
 * Kontroll av sidvisningen på publika sidor (2026-10-13).
 *
 * Går mot ett produktionsbygge och kontrollerar i riktig Chrome att:
 *  A. en ny besökare som inte rör sidan ger en $pageview, skickad efter load
 *     och utan att någon PostHog-cookie eller localStorage sätts,
 *  B. Acceptera i cookie-raden byter till sparat id (ph_-cookie efter klicket),
 *  C. den som redan accepterat får cookien direkt,
 *  D. Avvisa lämnar PostHog utan cookie.
 *
 * Anropen till PostHogs händelseadresser fångas och besvaras lokalt, så att
 * kontrollen inte skickar riktiga händelser till projektet. Payloaden
 * packas upp (gzip-js) och händelsenamnen loggas.
 *
 *   npx tsx scripts/qa-matning-publikt.ts --port 8312
 *   npx tsx scripts/qa-matning-publikt.ts --port 8312 --ut docs/qa/matning-publikt
 */
import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find((p) => fs.existsSync(p));

function arg(namn: string, fallback: string): string {
  const i = process.argv.indexOf('--' + namn);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const port = arg('port', '8312');
const bas = `http://localhost:${port}`;
const ut = arg('ut', 'docs/qa/matning-publikt');
fs.mkdirSync(ut, { recursive: true });

const UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36';

interface Anrop {
  ms: number;
  url: string;
  handelser: string[];
}

interface Resultat {
  scenario: string;
  sida: string;
  loadMs: number | null;
  lcpMs: number | null;
  posthogJsMs: number | null;
  anrop: Anrop[];
  cookiesFore: string[];
  cookiesEfter: string[];
  localStorage: string[];
  sessionStorage: string[];
}

function avkoda(buf: Buffer): string[] {
  let text = '';
  try {
    text = zlib.gunzipSync(buf).toString('utf8');
  } catch {
    text = buf.toString('utf8');
  }
  try {
    if (text.startsWith('data=')) text = Buffer.from(decodeURIComponent(text.slice(5)), 'base64').toString('utf8');
    const j = JSON.parse(text);
    const lista = Array.isArray(j) ? j : j.batch ?? [j];
    return lista.map((e: { event?: string; uuid?: string; properties?: { $pathname?: string } }) =>
      `${e.event}${e.properties?.$pathname ? ' ' + e.properties.$pathname : ''} [${(e.uuid ?? '').slice(-6)}]`
    );
  } catch {
    return ['(kunde inte läsa payload)'];
  }
}

async function ny(browser: Browser): Promise<{ page: Page; anrop: Anrop[]; t0: { v: number } }> {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.emulate({
    viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
    userAgent: UA,
  });
  // posthog-js släpper inte händelser från automatiserade webbläsare
  // (navigator.webdriver); flaggan vid start stänger av markeringen.
  await page.evaluateOnNewDocument(() => {
    (window as unknown as { __lcp: number }).__lcp = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) (window as unknown as { __lcp: number }).__lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  const anrop: Anrop[] = [];
  const t0 = { v: Date.now() };
  // Händelserna läses ur CDP:s postDataEntries, som bär binära kroppar
  // (gzip) oskadda; puppeteer-requestens postData() är en utf8-sträng.
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  cdp.on('Network.requestWillBeSent', (e) => {
    const u = e.request.url;
    if (!/posthog\.com/.test(u)) return;
    const bytes = (e.request.postDataEntries ?? []).map((d) => Buffer.from(d.bytes ?? '', 'base64'));
    anrop.push({
      ms: Date.now() - t0.v,
      url: u.replace(/\?.*/, ''),
      handelser: bytes.length ? avkoda(Buffer.concat(bytes)) : [],
    });
  });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = req.url();
    const arHandelse = /posthog\.com/.test(u) && /\/(e|i\/v0\/e|batch|capture)\/?$/.test(new URL(u).pathname);
    if (arHandelse) {
      // Svaret måste bära CORS-huvuden, annars räknar posthog-js anropet
      // som misslyckat och skickar samma händelse igen (samma uuid).
      void req.respond({
        status: req.method() === 'OPTIONS' ? 204 : 200,
        contentType: 'application/json',
        headers: {
          'Access-Control-Allow-Origin': bas,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        body: req.method() === 'OPTIONS' ? '' : '{"status":1}',
      });
      return;
    }
    void req.continue();
  });
  return { page, anrop, t0 };
}

async function las(page: Page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const ph = (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).find((r) =>
      /posthog/i.test(r.name)
    );
    return {
      loadMs: nav ? Math.round(nav.loadEventEnd) : null,
      lcpMs: Math.round((window as unknown as { __lcp: number }).__lcp) || null,
      posthogJsMs: ph ? Math.round(ph.startTime) : null,
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage),
    };
  });
}

async function cookies(page: Page): Promise<string[]> {
  const c = await page.cookies(bas);
  return c.map((k) => `${k.name}=${k.value.slice(0, 24)}${k.value.length > 24 ? '…' : ''}`);
}

async function scenario(
  browser: Browser,
  namn: string,
  sida: string,
  opts: { samtycke?: 'true' | 'false'; klick?: 'true' | 'false'; bild?: string } = {}
): Promise<Resultat> {
  const { page, anrop, t0 } = await ny(browser);
  if (opts.samtycke) {
    await page.setCookie({ name: 'cvBrevCookieConsent', value: opts.samtycke, url: bas, path: '/' });
  }
  t0.v = Date.now();
  await page.goto(bas + sida, { waitUntil: 'load', timeout: 60000 });
  // Ingen interaktion: bara vänta.
  await new Promise((r) => setTimeout(r, 7000));
  const cookiesFore = await cookies(page);
  if (opts.klick) {
    await page.evaluate((v) => {
      (document.querySelector(`#jc-samtycke [data-samtycke="${v}"]`) as HTMLElement | null)?.click();
    }, opts.klick);
    await new Promise((r) => setTimeout(r, 2000));
  }
  const l = await las(page);
  if (opts.bild) await page.screenshot({ path: path.join(ut, opts.bild) });
  const r: Resultat = {
    scenario: namn,
    sida,
    loadMs: l.loadMs,
    lcpMs: l.lcpMs,
    posthogJsMs: l.posthogJsMs,
    anrop,
    cookiesFore,
    cookiesEfter: await cookies(page),
    localStorage: l.localStorage,
    sessionStorage: l.sessionStorage,
  };
  await page.browserContext().close();
  return r;
}

async function main() {
  if (!CHROME) throw new Error('Hittade ingen Chrome.');
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'] });
  const res: Resultat[] = [];
  try {
    res.push(await scenario(browser, 'A ny besökare, ingen interaktion', '/verktyg/rekryteringstester', { bild: 'a-rekryteringstester-ingen-interaktion.png' }));
    res.push(await scenario(browser, 'A ny besökare, ingen interaktion', '/'));
    res.push(await scenario(browser, 'A ny besökare, ingen interaktion', '/jobbkartan'));
    res.push(await scenario(browser, 'B ny besökare trycker Acceptera', '/verktyg/rekryteringstester', { klick: 'true', bild: 'b-efter-acceptera.png' }));
    res.push(await scenario(browser, 'C har redan accepterat', '/verktyg/rekryteringstester', { samtycke: 'true' }));
    res.push(await scenario(browser, 'D trycker Avvisa', '/verktyg/rekryteringstester', { klick: 'false' }));
  } finally {
    await browser.close();
  }

  const rader: string[] = [`Server ${bas}, ${new Date().toISOString()}`, ''];
  for (const r of res) {
    rader.push(`== ${r.scenario}: ${r.sida}`);
    rader.push(`   LCP ${r.lcpMs} ms, load klar ${r.loadMs} ms, posthog-js hämtas ${r.posthogJsMs ?? '-'} ms`);
    for (const a of r.anrop) rader.push(`   +${a.ms} ms ${a.url}${a.handelser.length ? '  ' + a.handelser.join(', ') : ''}`);
    if (!r.anrop.length) rader.push('   inga anrop till PostHog');
    rader.push(`   cookies före klick: ${r.cookiesFore.join('; ') || '(inga)'}`);
    rader.push(`   cookies efter:      ${r.cookiesEfter.join('; ') || '(inga)'}`);
    rader.push(`   localStorage: ${r.localStorage.join(', ') || '(tom)'}   sessionStorage: ${r.sessionStorage.join(', ') || '(tom)'}`);
    rader.push('');
  }
  const text = rader.join('\n');
  console.log(text);
  fs.writeFileSync(path.join(ut, 'logg.txt'), text);
  fs.writeFileSync(path.join(ut, 'logg.json'), JSON.stringify(res, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
