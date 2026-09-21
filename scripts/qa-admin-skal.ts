/**
 * QA av adminskalet: mobilmenyn och vägen tillbaka till appen.
 *
 * Adminen antogs vara desktop, och det gjorde den till en återvändsgränd i
 * telefonen: sidomenyn låg bakom lg, och länken till /dashboard låg i just den
 * sidomenyn. Skriptet klickar igenom rättningen som en ny användare skulle:
 * öppnar menyn med hamburgaren på Pixel 7, byter sida, går tillbaka till
 * appen, och kontrollerar att toppradens "Till appen" finns på båda bredderna.
 *
 *   npx tsx scripts/qa-admin-skal.ts --port 5211
 *
 * Kräver en produktionsserver på porten:
 *   NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 NEXT_DIST_DIR=.next-qa npx next build
 *   NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 NEXT_DIST_DIR=.next-qa npx next start -p 5211
 *
 * QA-kontot får super_admin i admin_users och raderas alltid till sist, även
 * vid fel. Samma mönster som scripts/qa-admin.ts.
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

const UT = 'docs/qa/admin';

/** CLS under detta är sub-pixelavrundning i mätningen, inte ett skifte. */
const CLS_BRUS = 0.002;

/** Minsta träffyta enligt docs/designsystem.md. */
const TRAFFYTA_PX = 44;

const PIXEL = {
  viewport: {
    width: 412,
    height: 915,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
};

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

async function main() {
  const port = arg('port', '5211')!;
  const bas = `http://localhost:${port}`;

  const chrome = CHROME_KANDIDATER.find((p) => fs.existsSync(p));
  if (!chrome) throw new Error('Hittade ingen Chrome eller Edge.');

  const svar = await fetch(bas + '/login').catch(() => null);
  if (!svar) throw new Error(`Ingen server på ${bas}.`);

  fs.mkdirSync(UT, { recursive: true });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as any;

  let userId: string | null = null;
  let browser: Browser | null = null;
  const problem: string[] = [];
  const noteringar: string[] = [];

  try {
    const epost = `qa-skal-${Date.now()}@jobbcoach-qa.example.com`;
    const { data, error } = await sb.auth.admin.createUser({
      email: epost,
      password: 'Qa!' + Math.random().toString(36).slice(2, 12),
      email_confirm: true,
    });
    if (error || !data?.user) throw new Error('Kunde inte skapa konto: ' + error?.message);
    userId = data.user.id;

    await sb
      .from('profiles')
      .upsert({ id: userId, email: epost, full_name: 'QA Skal' }, { onConflict: 'id' });

    const { error: adminFel } = await sb
      .from('admin_users')
      .insert({ id: userId, role: 'super_admin' });
    if (adminFel) throw new Error('Kunde inte ge super_admin: ' + adminFel.message);
    console.log('QA-konto (super_admin):', epost, userId);

    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const projektRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0];
    const cookieNamn = `sb-${projektRef}-auth-token`;

    async function sattCookie(page: Page) {
      const { data: link } = await sb.auth.admin.generateLink({
        type: 'magiclink',
        email: epost,
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

    async function nySida(form: 'desktop' | 'pixel7'): Promise<Page> {
      const page = await browser!.newPage();
      if (form === 'pixel7') await page.emulate(PIXEL);
      else await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });

      await sattCookie(page);

      await page.evaluateOnNewDocument(() => {
        (window as any).__cls = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) {
            const s = e as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!s.hadRecentInput) (window as any).__cls += s.value ?? 0;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });

      return page;
    }

    /** Träffytan på ett element, i CSS-pixlar. */
    async function traffyta(page: Page, valjare: string) {
      return page.evaluate((v) => {
        const el = document.querySelector(v) as HTMLElement | null;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { bredd: Math.round(r.width), hojd: Math.round(r.height) };
      }, valjare);
    }

    // ============================================== Pixel 7: mobilmenyn
    console.log('\n=== Pixel 7, mobilmeny ===');
    const mobil = await nySida('pixel7');
    const mobilfel: string[] = [];
    mobil.on('console', (m) => {
      if (m.type() === 'error') mobilfel.push(m.text().slice(0, 200));
    });
    mobil.on('pageerror', (e) => mobilfel.push(String(e).slice(0, 200)));

    await mobil.goto(bas + '/admin', { waitUntil: 'networkidle2', timeout: 45000 });

    // 1. Hamburgaren finns och är minst 44 px.
    const hamburgare = 'header button[aria-label="Öppna meny"]';
    const hamburgareYta = await traffyta(mobil, hamburgare);
    if (!hamburgareYta) {
      problem.push('Pixel 7: ingen hamburgare i toppraden.');
    } else {
      noteringar.push(
        `Hamburgare: ${hamburgareYta.bredd}x${hamburgareYta.hojd} px.`
      );
      if (hamburgareYta.hojd < TRAFFYTA_PX || hamburgareYta.bredd < TRAFFYTA_PX) {
        problem.push(
          `Pixel 7: hamburgaren är ${hamburgareYta.bredd}x${hamburgareYta.hojd}, under ${TRAFFYTA_PX} px.`
        );
      }
    }

    // 2. "Till appen" i toppraden, även på mobil.
    const tillAppen = 'header a[href="/dashboard"]';
    const tillAppenYta = await traffyta(mobil, tillAppen);
    if (!tillAppenYta) {
      problem.push('Pixel 7: ingen "Till appen" i toppraden.');
    } else {
      noteringar.push(`Till appen (mobil): ${tillAppenYta.bredd}x${tillAppenYta.hojd} px.`);
      if (tillAppenYta.hojd < TRAFFYTA_PX || tillAppenYta.bredd < TRAFFYTA_PX) {
        problem.push(
          `Pixel 7: "Till appen" är ${tillAppenYta.bredd}x${tillAppenYta.hojd}, under ${TRAFFYTA_PX} px.`
        );
      }
    }

    // 3. Menyn är stängd från början.
    const menyFore = await mobil.$('div[role="dialog"][aria-label="Adminmeny"]');
    if (menyFore) problem.push('Pixel 7: menyn låg öppen redan vid sidladdning.');

    // 4. Klicka hamburgaren. Menyn ska öppnas med alla nio sidorna.
    const clsFore = await mobil.evaluate(() => (window as any).__cls as number);
    await mobil.click(hamburgare);
    await new Promise((r) => setTimeout(r, 500));

    const meny = await mobil.$('div[role="dialog"][aria-label="Adminmeny"]');
    if (!meny) {
      problem.push('Pixel 7: hamburgaren öppnade ingen meny.');
    } else {
      const lankar = await mobil.evaluate(() =>
        Array.from(
          document.querySelectorAll('div[role="dialog"] nav a')
        ).map((a) => (a as HTMLAnchorElement).textContent?.trim() ?? '')
      );
      noteringar.push(`Menyn öppen med ${lankar.length} länkar: ${lankar.join(', ')}.`);
      if (lankar.length < 9) {
        problem.push(`Pixel 7: menyn visar bara ${lankar.length} länkar, väntade nio.`);
      }
      // Träffytan på menyraderna.
      const radhojd = await mobil.evaluate(() => {
        const a = document.querySelector('div[role="dialog"] nav a') as HTMLElement | null;
        return a ? Math.round(a.getBoundingClientRect().height) : 0;
      });
      noteringar.push(`Menyrad: ${radhojd} px hög.`);
      if (radhojd < TRAFFYTA_PX) {
        problem.push(`Pixel 7: menyraden är ${radhojd} px, under ${TRAFFYTA_PX} px.`);
      }
    }

    // Skärmdump med menyn öppen: det är den vyn som saknades helt förut.
    await mobil.screenshot({
      path: path.join(UT, 'skal-mobil-meny.png') as `${string}.png`,
    });

    // 5. Öppningen får inte flytta sidan. Arket ligger utanför dokumentflödet.
    const clsEfter = await mobil.evaluate(() => (window as any).__cls as number);
    const clsOppning = clsEfter - clsFore;
    noteringar.push(`CLS vid öppning: ${clsOppning.toFixed(4)}.`);
    if (clsOppning > CLS_BRUS) {
      problem.push(`Pixel 7: menyn flyttade sidan, CLS ${clsOppning.toFixed(4)}.`);
    }

    // 6. Klicka en sida i menyn. Den ska navigera och stänga arket.
    await mobil.evaluate(() => {
      const a = Array.from(
        document.querySelectorAll('div[role="dialog"] nav a')
      ).find((x) => (x as HTMLAnchorElement).getAttribute('href') === '/admin/intakter');
      (a as HTMLAnchorElement)?.click();
    });
    await new Promise((r) => setTimeout(r, 2500));

    const urlEfterNav = mobil.url();
    if (!urlEfterNav.endsWith('/admin/intakter')) {
      problem.push(`Pixel 7: menyklicket gick till ${urlEfterNav}, inte Intäkter.`);
    } else {
      noteringar.push('Menyklick gick till Intäkter.');
    }
    const menyEfterNav = await mobil.$('div[role="dialog"][aria-label="Adminmeny"]');
    if (menyEfterNav) problem.push('Pixel 7: menyn låg kvar öppen efter sidbytet.');
    else noteringar.push('Menyn stängdes vid sidbytet.');

    // 7. Vägen tillbaka till appen.
    await mobil.click('header a[href="/dashboard"]');
    await new Promise((r) => setTimeout(r, 3500));
    const urlEfterHem = mobil.url();
    if (!urlEfterHem.includes('/dashboard')) {
      problem.push(`Pixel 7: "Till appen" gick till ${urlEfterHem}.`);
    } else {
      noteringar.push('"Till appen" gick till /dashboard.');
    }

    if (mobilfel.length) problem.push('Pixel 7 konsolfel: ' + mobilfel.join(' | '));
    await mobil.close();

    // ============================================== Desktop
    console.log('\n=== Desktop 1280 ===');
    const dator = await nySida('desktop');
    const datorfel: string[] = [];
    dator.on('console', (m) => {
      if (m.type() === 'error') datorfel.push(m.text().slice(0, 200));
    });
    dator.on('pageerror', (e) => datorfel.push(String(e).slice(0, 200)));

    await dator.goto(bas + '/admin', { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Sidomenyn syns, hamburgaren är dold, "Till appen" finns ändå.
    const sidomenySynlig = await dator.evaluate(() => {
      const el = document.querySelector('aside') as HTMLElement | null;
      return el ? el.getBoundingClientRect().width > 0 : false;
    });
    if (!sidomenySynlig) problem.push('Desktop: sidomenyn syns inte.');

    const hamburgareSynlig = await dator.evaluate(() => {
      const el = document.querySelector(
        'header button[aria-label="Öppna meny"]'
      ) as HTMLElement | null;
      return el ? el.getBoundingClientRect().width > 0 : false;
    });
    if (hamburgareSynlig) problem.push('Desktop: hamburgaren ska vara dold över lg.');
    else noteringar.push('Desktop: hamburgaren dold, sidomenyn synlig.');

    const tillAppenDator = await traffyta(dator, 'header a[href="/dashboard"]');
    if (!tillAppenDator) {
      problem.push('Desktop: ingen "Till appen" i toppraden.');
    } else {
      noteringar.push(
        `Till appen (desktop): ${tillAppenDator.bredd}x${tillAppenDator.hojd} px.`
      );
      if (tillAppenDator.hojd < TRAFFYTA_PX) {
        problem.push(`Desktop: "Till appen" är ${tillAppenDator.hojd} px hög.`);
      }
    }

    const clsDator = await dator.evaluate(() => (window as any).__cls as number);
    noteringar.push(`CLS desktop: ${clsDator.toFixed(4)}.`);
    if (clsDator > CLS_BRUS) problem.push(`Desktop: CLS ${clsDator.toFixed(4)}.`);

    // Skärmdump av hela den inre scrollytan, som i qa-admin.ts.
    const hojd = await dator.evaluate(() => {
      const m = document.querySelector('main.overflow-y-auto') as HTMLElement | null;
      return m ? Math.max(m.scrollHeight, m.clientHeight) : window.innerHeight;
    });
    await dator.setViewport({
      width: 1280,
      height: Math.min(Math.ceil(hojd) + 40, 12000),
      deviceScaleFactor: 2,
    });
    await new Promise((r) => setTimeout(r, 700));
    await dator.screenshot({
      path: path.join(UT, 'skal-desktop.png') as `${string}.png`,
    });

    // Vägen tillbaka fungerar även här.
    await dator.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    await dator.click('header a[href="/dashboard"]');
    await new Promise((r) => setTimeout(r, 3500));
    if (!dator.url().includes('/dashboard')) {
      problem.push(`Desktop: "Till appen" gick till ${dator.url()}.`);
    }

    if (datorfel.length) problem.push('Desktop konsolfel: ' + datorfel.join(' | '));
    await dator.close();

    // ============================================== Rapport
    console.log('\n--- Noteringar ---');
    for (const n of noteringar) console.log('  ' + n);

    console.log('\n--- Resultat ---');
    if (problem.length === 0) {
      console.log('  Inga problem. Skärmdumpar i ' + UT + '.');
    } else {
      for (const p of problem) console.log('  PROBLEM: ' + p);
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (userId) {
      await sb.from('admin_users').delete().eq('id', userId);
      await sb.from('profiles').delete().eq('id', userId);
      await sb.auth.admin.deleteUser(userId);
      console.log('\nQA-kontot raderat:', userId);
    }
  }

  if (problem.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
