/**
 * QA av /admin/flode (D3) och den omgjorda Funnel-sidan.
 *
 * Samma metod som scripts/qa-admin.ts: engångskonto med super_admin i
 * admin_users, desktop 1280 och Pixel 7, LCP och CLS som median av tre,
 * skärmdump per vy till docs/qa/qa-flode-d3/. Kontot raderas alltid till sist.
 *
 *   NEXT_DIST_DIR=.next-d3 npx next start -p 5230
 *   npx tsx scripts/qa-flode-d3.ts --port 5230
 */

import { laddaEnv } from './_env';
import { createClient } from '@supabase/supabase-js';
import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

laddaEnv();

const CHROME_KANDIDATER = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

const UT = "docs/qa/qa-flode-d3";

/** LCP-budget enligt planens avsnitt 9. */
const LCP_BUDGET_MS = 1500;

/** CLS under detta är sub-pixelavrundning i mätningen, inte ett skifte. */
const CLS_BRUS = 0.002;

/** Hur många körningar medianen tas över. */
const KORNINGAR = 3;

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

interface Vy {
  /** Filnamnets stam, blir <namn>-desktop.png och <namn>-pixel7.png. */
  namn: string;
  /** Sökvägen. ID byts mot ett riktigt användar-id. */
  path: string;
  /** Rubrik i QA-tabellen. */
  titel: string;
}

const VYER: Vy[] = [
  { namn: 'flode-30', path: '/admin/flode', titel: 'Flöde 30 dagar' },
  { namn: 'flode-7', path: '/admin/flode?dagar=7', titel: 'Flöde 7 dagar' },
  { namn: 'flode-90', path: '/admin/flode?dagar=90', titel: 'Flöde 90 dagar' },
  { namn: 'funnel', path: '/admin/funnel', titel: 'Funnel' },
];

const PIXEL = {
  viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
};

interface Resultat {
  vy: string;
  titel: string;
  lcp: number;
  cls: number;
  konsolfel: string[];
  httpFel: string[];
  horisontell: boolean;
  sidfot: boolean;
  cookieBanner: boolean;
  recharts: number;
}

function median(v: number[]): number {
  const s = [...v].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

async function main() {
  const port = arg('port', '5210')!;
  const bas = `http://localhost:${port}`;

  const chrome = CHROME_KANDIDATER.find((p) => fs.existsSync(p));
  if (!chrome) throw new Error('Hittade ingen Chrome eller Edge.');

  const svar = await fetch(bas + '/login').catch(() => null);
  if (!svar) throw new Error(`Ingen server på ${bas}. Kör next build och next start -p ${port}.`);

  fs.mkdirSync(UT, { recursive: true });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as any;

  let userId: string | null = null;
  let browser: Browser | null = null;
  const resultat: Resultat[] = [];
  const problem: string[] = [];

  try {
    // ---------------------------------------------------- QA-kontot
    const epost = `qa-admin-${Date.now()}@jobbcoach-qa.example.com`;
    const { data, error } = await sb.auth.admin.createUser({
      email: epost,
      password: 'Qa!' + Math.random().toString(36).slice(2, 12),
      email_confirm: true,
    });
    if (error || !data?.user) throw new Error('Kunde inte skapa konto: ' + error?.message);
    userId = data.user.id;

    await sb
      .from('profiles')
      .upsert({ id: userId, email: epost, full_name: 'QA Admin' }, { onConflict: 'id' });

    // admin_users har kolumnerna id, role, created_at och last_login.
    // Nyckeln heter id, inte user_id, och det finns ingen e-postkolumn.
    const { error: adminFel } = await sb
      .from('admin_users')
      .insert({ id: userId, role: 'super_admin' });
    if (adminFel) throw new Error('Kunde inte ge super_admin: ' + adminFel.message);
    console.log('QA-konto (super_admin):', epost, userId);

    // Ett riktigt användar-id till detaljsidan. Vi tar ett annat än QA-kontot,
    // så att sidan har något att visa.
    const { data: nagon } = await sb
      .from('profiles')
      .select('id')
      .neq('id', userId)
      .limit(1);
    const detaljId: string = nagon?.[0]?.id ?? userId;

    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const projektRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0];
    const cookieNamn = `sb-${projektRef}-auth-token`;

    async function sattCookie(page: Page, eAdress: string) {
      const { data: link } = await sb.auth.admin.generateLink({
        type: 'magiclink',
        email: eAdress,
      });
      const { data: sess, error: fel } = await sb.auth.verifyOtp({
        type: 'magiclink',
        token_hash: (link as any).properties.hashed_token,
      });
      if (fel || !sess?.session) throw new Error('Kunde inte skapa session: ' + fel?.message);
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
      const CHUNK = 3200;
      if (payload.length <= CHUNK) {
        await page.setCookie({ name: cookieNamn, value: payload, url: bas, path: '/' });
      } else {
        for (let i = 0, n = 0; i < payload.length; i += CHUNK, n++) {
          await page.setCookie({
            name: `${cookieNamn}.${n}`,
            value: payload.slice(i, i + CHUNK),
            url: bas,
            path: '/',
          });
        }
      }
    }

    /** Ny sida i given form, inloggad, med LCP- och CLS-observatörer. */
    async function nySida(form: 'desktop' | 'pixel7', eAdress: string): Promise<Page> {
      const page = await browser!.newPage();
      if (form === 'pixel7') await page.emulate(PIXEL);
      else await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

      await sattCookie(page, eAdress);

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

    /**
     * Väntar på att recharts hunnit rita. Diagrammen laddas lazy, så en
     * skärmdump utan väntan visar platshållaren i stället för diagrammet.
     */
    async function vantaPaDiagram(page: Page): Promise<number> {
      try {
        await page.waitForFunction(
          () => document.querySelectorAll('.recharts-surface').length > 0,
          { timeout: 8000 }
        );
      } catch {
        // Sidor utan diagram faller igenom, vilket är rätt.
      }
      return page.evaluate(() => document.querySelectorAll('.recharts-surface').length);
    }

    /** Skärmdump av hela den inre scrollytan. */
    async function skarmdump(page: Page, fil: string, bredd: number) {
      const hojd = await page.evaluate(() => {
        const m = document.querySelector('main.overflow-y-auto') as HTMLElement | null;
        if (m) return Math.max(m.scrollHeight, m.clientHeight);
        return Math.max(document.body.scrollHeight, window.innerHeight);
      });
      const tak = Math.min(Math.ceil(hojd) + 40, 12000);
      await page.setViewport({
        width: bredd,
        height: tak,
        deviceScaleFactor: 2,
        isMobile: bredd < 600,
        hasTouch: bredd < 600,
      });
      // Låt layouten sätta sig i den nya höjden innan vi fotograferar.
      await new Promise((r) => setTimeout(r, 700));
      await page.screenshot({ path: path.join(UT, fil) as `${string}.png` });
    }

    // ------------------------------------------------ mätning per vy
    for (const vy of VYER) {
      const url = bas + vy.path.replace('ID', detaljId);
      console.log('\n=== ' + vy.titel + ' ===');

      const lcpar: number[] = [];
      const clsar: number[] = [];
      let sista: Resultat | null = null;

      for (let i = 0; i < KORNINGAR; i++) {
        const page = await nySida('desktop', epost);
        const konsolfel: string[] = [];
        const httpFel: string[] = [];
        page.on('console', (m) => {
          if (m.type() === 'error') konsolfel.push(m.text().slice(0, 200));
        });
        page.on('pageerror', (e) => konsolfel.push(String(e).slice(0, 200)));
        page.on('response', (r) => {
          const s = r.status();
          if (s >= 400) httpFel.push(`${s} ${r.url().replace(bas, '').slice(0, 90)}`);
        });

        try {
          await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
          const recharts = await vantaPaDiagram(page);
          await new Promise((r) => setTimeout(r, 1500));

          const m = await page.evaluate(() => ({
            lcp: (window as any).__lcp || 0,
            cls: (window as any).__cls || 0,
            horisontell: document.documentElement.scrollWidth > window.innerWidth + 1,
            sidfot: !!document.querySelector('footer'),
            cookieBanner: !!Array.from(document.querySelectorAll('div,section,aside')).find(
              (e) => /cookie|kakor/i.test(e.textContent ?? '') && (e as HTMLElement).offsetHeight > 0
                && (e as HTMLElement).offsetHeight < 400
            ),
          }));

          lcpar.push(m.lcp);
          clsar.push(m.cls);

          if (i === KORNINGAR - 1) {
            sista = {
              vy: vy.namn,
              titel: vy.titel,
              lcp: 0,
              cls: 0,
              konsolfel,
              httpFel,
              horisontell: m.horisontell,
              sidfot: m.sidfot,
              cookieBanner: m.cookieBanner,
              recharts,
            };
            await skarmdump(page, `${vy.namn}-desktop.png`, 1280);
          }
        } finally {
          await page.close();
        }
      }

      // Pixel 7: en körning, för skärmdump och horisontell scroll.
      const mobil = await nySida('pixel7', epost);
      let mobilHorisontell = false;
      try {
        await mobil.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
        await vantaPaDiagram(mobil);
        await new Promise((r) => setTimeout(r, 1200));
        mobilHorisontell = await mobil.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth + 1
        );
        await skarmdump(mobil, `${vy.namn}-pixel7.png`, 412);
      } finally {
        await mobil.close();
      }

      const r: Resultat = {
        ...(sista ?? {
          vy: vy.namn,
          titel: vy.titel,
          konsolfel: [],
          httpFel: [],
          horisontell: false,
          sidfot: false,
          cookieBanner: false,
          recharts: 0,
        }),
        lcp: Math.round(median(lcpar)),
        cls: Number(median(clsar).toFixed(4)),
      } as Resultat;
      r.horisontell = r.horisontell || mobilHorisontell;
      resultat.push(r);

      const clsRen = r.cls <= CLS_BRUS;
      console.log(
        `  LCP ${r.lcp} ms ${r.lcp <= LCP_BUDGET_MS ? 'OK' : 'ÖVER'} | CLS ${r.cls} ${clsRen ? 'OK' : 'SKIFTE'}` +
          ` | diagram ${r.recharts} | konsolfel ${r.konsolfel.length} | http ${r.httpFel.length}` +
          ` | horisontell ${r.horisontell ? 'JA' : 'nej'}`
      );
      if (r.lcp > LCP_BUDGET_MS) problem.push(`${r.titel}: LCP ${r.lcp} ms över budget.`);
      if (!clsRen) problem.push(`${r.titel}: CLS ${r.cls}.`);
      if (r.konsolfel.length) problem.push(`${r.titel}: ${r.konsolfel.length} konsolfel: ${r.konsolfel[0]}`);
      if (r.httpFel.length) problem.push(`${r.titel}: ${r.httpFel.length} HTTP-fel: ${r.httpFel[0]}`);
      if (r.horisontell) problem.push(`${r.titel}: horisontell scroll.`);
      if (r.sidfot) problem.push(`${r.titel}: sidfot syns i adminen.`);
      if (r.cookieBanner) problem.push(`${r.titel}: cookie-banner syns i adminen.`);
    }

    // ------------------------------------- redirect utan super_admin
    console.log('\n=== Redirect utan super_admin ===');
    const utanEpost = `qa-admin-noroll-${Date.now()}@jobbcoach-qa.example.com`;
    const { data: utanData } = await sb.auth.admin.createUser({
      email: utanEpost,
      password: 'Qa!' + Math.random().toString(36).slice(2, 12),
      email_confirm: true,
    });
    const utanId = utanData.user.id;
    await sb
      .from('profiles')
      .upsert({ id: utanId, email: utanEpost, full_name: 'QA Utan roll' }, { onConflict: 'id' });

    const utanSida = await nySida('desktop', utanEpost);
    let slutUrl = '';
    try {
      await utanSida.goto(bas + '/admin', { waitUntil: 'networkidle0', timeout: 60000 });
      slutUrl = utanSida.url();
      console.log('  /admin utan super_admin hamnar på:', slutUrl.replace(bas, ''));
    } finally {
      await utanSida.close();
      await sb.auth.admin.deleteUser(utanId).catch(() => {});
    }
    const redirectOk = slutUrl.includes('/dashboard');
    if (!redirectOk) problem.push(`/admin utan super_admin redirectar inte till /dashboard (hamnade på ${slutUrl}).`);

    // ------------------------------------------------------- utskrift
    console.log('\n\n## Tabell\n');
    console.log('| Vy | LCP (ms) | CLS | Konsolfel | HTTP-fel | Diagram | Skärmdump |');
    console.log('|---|---|---|---|---|---|---|');
    for (const r of resultat) {
      console.log(
        `| ${r.titel} | ${r.lcp}${r.lcp <= LCP_BUDGET_MS ? '' : ' ÖVER'} | ${r.cls} | ` +
          `${r.konsolfel.length} | ${r.httpFel.length} | ${r.recharts} | ${r.vy}-{desktop,pixel7}.png |`
      );
    }

    const inomBudget = resultat.filter((r) => r.lcp <= LCP_BUDGET_MS).length;
    console.log(`\n${inomBudget} av ${resultat.length} vyer inom LCP-budget (${LCP_BUDGET_MS} ms).`);
    console.log(`CLS 0 på ${resultat.filter((r) => r.cls <= CLS_BRUS).length} av ${resultat.length}.`);
    console.log(`Redirect utan super_admin: ${redirectOk ? 'OK' : 'FEL'}`);

    console.log('\n## Problem\n');
    if (problem.length === 0) console.log('Inga.');
    else for (const p of problem) console.log('- ' + p);

    const jsonUt = arg('json');
    if (jsonUt) {
      fs.writeFileSync(jsonUt, JSON.stringify({ resultat, problem, redirectOk }, null, 2));
      console.log('\nJSON: ' + jsonUt);
    }
  } finally {
    if (browser) await browser.close();
    if (userId) {
      await sb.from('admin_users').delete().eq('id', userId);
      const { error } = await sb.auth.admin.deleteUser(userId);
      console.log(error ? 'Kunde INTE radera QA-kontot: ' + error.message : 'QA-kontot raderat, inklusive admin_users-raden.');
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
