/**
 * Klicktest av steg 4 i CV-analysen: foten som går igenom kategorierna.
 *
 * Skapar ett engångskonto, lägger in ett CV, kör en RIKTIG analys genom
 * gränssnittet, och tar skärmdumpar av de tre lägen ändringen handlar om:
 *   1. flik 1 nedscrollad, med sekundärknappen "Nästa: ..." synlig
 *   2. sista fliken, där foten säger "Fortsätt"
 *   3. dialogen "Inga förbättringar valda" vid tomt val
 * Kontot raderas alltid till sist, även när något går fel.
 *
 *   npx tsx scripts/qa-cv-analys-kategorier.ts --port 5200
 *
 * Kräver en produktionsserver på porten (npx next build && npx next start).
 * Emulerar Pixel 7, samma som scripts/perf-inloggat.ts.
 */

import { laddaEnv } from './_env';
import { createClient } from '@supabase/supabase-js';
import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

laddaEnv();

const CHROME_KANDIDATER = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const UT = 'docs/qa/cv-analys';

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

/** Ett CV med flera roller och gott om färdigheter, så alla fyra flikar fylls. */
const CV_TEXT = `Anna Lindqvist
Projektledare
anna.lindqvist.qa@example.com | 070-123 45 67 | Göteborg

PROFIL
Projektledare med erfarenhet av digitala projekt. Jag jobbar med team och
levererar saker i tid. Van vid att prata med kunder och andra intressenter.

ARBETSLIVSERFARENHET

Projektledare, Nordkom AB, 2021-2026
Ledde projekt inom webb och e-handel. Ansvarade för budget och tidplan.
Jobbade med utvecklare och designers. Höll möten med kunder varje vecka.

Projektkoordinator, Vista Digital, 2018-2021
Hjälpte projektledarna med planering och uppföljning. Skrev rapporter och
dokumentation. Bokade möten och skötte kontakten med leverantörer.

Marknadsassistent, Sverker Media, 2016-2018
Arbetade med sociala medier och nyhetsbrev. Tog fram material till kampanjer
och följde upp resultat i Google Analytics.

UTBILDNING
Kandidatexamen i medie- och kommunikationsvetenskap, Göteborgs universitet, 2016

FÄRDIGHETER
Projektledning, Office, Google Analytics, Kommunikation
`;

async function main() {
  const port = arg('port', '5200')!;
  const bas = `http://localhost:${port}`;

  const chrome = CHROME_KANDIDATER.find((p) => fs.existsSync(p));
  if (!chrome) throw new Error('Hittade ingen Chrome eller Edge.');

  const res = await fetch(bas + '/login').catch(() => null);
  if (!res) throw new Error(`Ingen server på ${bas}. Kör npx next start -p ${port}.`);

  fs.mkdirSync(UT, { recursive: true });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const epost = `qa-kategorier-${Date.now()}@jobbcoach-qa.example.com`;
  const { data: skapad, error: skapaFel } = await sb.auth.admin.createUser({
    email: epost,
    password: 'Qa!' + Math.random().toString(36).slice(2, 12),
    email_confirm: true,
  });
  if (skapaFel || !skapad?.user) throw new Error('Kunde inte skapa QA-konto: ' + skapaFel?.message);
  const userId = skapad.user.id;
  console.log(`QA-konto: ${epost} (${userId})`);

  let browser: Browser | null = null;

  try {
    // Premium, så analyskvoten inte stoppar körningen.
    await sb
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: epost,
          full_name: 'Anna Lindqvist',
          subscription_tier: 'premium',
          premium_until: new Date(Date.now() + 7 * 864e5).toISOString(),
        },
        { onConflict: 'id' }
      );

    const { data: cvRad, error: cvFel } = await sb
      .from('cv_texts')
      .insert({
        user_id: userId,
        file_name: 'QA CV Anna Lindqvist.pdf',
        original_file_path: `qa/${userId}/qa-cv.pdf`,
        cv_text: CV_TEXT,
      })
      .select()
      .single();
    if (cvFel) throw new Error('Kunde inte lägga in CV: ' + cvFel.message);
    console.log(`CV: ${cvRad.id}`);

    // Session och cookie, samma mönster som perf-inloggat.ts.
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

    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const page: Page = await browser.newPage();
    await page.emulate({
      viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
      userAgent:
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
    });

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

    const skarm = async (namn: string) => {
      const fil = path.join(UT, `efter-kategorier-${namn}.png`);
      await page.screenshot({ path: fil as `${string}.png`, fullPage: false });
      console.log('  skärmdump: ' + fil);
    };

    /** Klickar en synlig knapp vars text matchar. */
    const klicka = async (text: string | RegExp) => {
      const traff = await page.evaluateHandle((m: string) => {
        const re = new RegExp(m);
        const kandidater = Array.from(
          document.querySelectorAll('button,[role="button"],[role="radio"],a[href]')
        ) as HTMLElement[];
        // Minsta matchande element vinner, så en yttre behållare inte råkar
        // fånga klicket i stället för knappen inuti.
        const traffar = kandidater.filter(
          (b) =>
            re.test((b.textContent || '').trim()) &&
            !(b as HTMLButtonElement).disabled &&
            b.offsetParent !== null
        );
        traffar.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
        return traffar[0] || null;
      }, typeof text === 'string' ? text : text.source);
      const el = traff.asElement();
      if (!el) throw new Error(`Hittade ingen knapp: ${text}`);
      await (el as any).click();
    };

    const vantaText = async (m: string, timeout = 180000) => {
      await page.waitForFunction(
        (s: string) => new RegExp(s).test(document.body.innerText),
        { timeout, polling: 1000 },
        m
      );
    };

    console.log('Öppnar CV-analysen');
    await page.goto(bas + '/dashboard/cv-analys', { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Cookie-bannern lägger sig över foten. Klicka bort den först.
    await page
      .evaluate(() => {
        const b = Array.from(document.querySelectorAll('button')).find((x) =>
          /^Acceptera$/.test((x.textContent || '').trim())
        );
        b?.click();
      })
      .catch(() => {});
    await new Promise((r) => setTimeout(r, 800));
    // Introt först, sedan wizarden.
    await klicka('Analysera mitt CV');
    await vantaText('Vilket CV vill du analysera', 30000);
    await new Promise((r) => setTimeout(r, 1200));

    // Steg 1: välj CV, gå vidare. Analysen startar och tar 30 till 60 sekunder.
    await klicka('QA CV');
    await new Promise((r) => setTimeout(r, 500));
    await klicka('^Nästa$');

    console.log('Väntar på analysen (upp till 3 minuter)');
    await vantaText('Här är ditt resultat');
    await new Promise((r) => setTimeout(r, 1500));

    // Steg 3 (index 2): resultatet. Vidare till kategorivalet.
    await klicka('^Nästa$');
    await vantaText('Välj vilka förbättringar');
    await new Promise((r) => setTimeout(r, 1500));

    // 1. Flik 1 nedscrollad, sekundärknappen "Nästa: ..." i vy.
    console.log('Flik 1, nedscrollad');
    await page.evaluate(() => {
      const scrollbar = Array.from(document.querySelectorAll('main,div')).find(
        (e) => e.scrollHeight > e.clientHeight + 40
      );
      if (scrollbar) scrollbar.scrollTop = scrollbar.scrollHeight;
      document.documentElement.scrollTop = document.documentElement.scrollHeight;
    });
    await new Promise((r) => setTimeout(r, 900));
    await skarm('flik1-nedscrollad');

    // Stega till sista fliken via fotens knapp.
    console.log('Stegar till sista fliken');
    for (let i = 0; i < 5; i++) {
      const kvar = await page.evaluate(() =>
        /Nästa:\s/.test(document.body.innerText)
      );
      if (!kvar) break;
      await klicka('Nästa:');
      await new Promise((r) => setTimeout(r, 1200));
    }

    // 2. Sista fliken, foten säger Fortsätt.
    await new Promise((r) => setTimeout(r, 800));
    await skarm('flik-sista-fortsatt');

    // 3. Tomt val: avmarkera allt och tryck Fortsätt, dialogen ska komma.
    console.log('Avmarkerar allt och trycker Fortsätt');
    // Gå tillbaka genom flikarna och avmarkera i varje.
    const flikar: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="radio"]')).map(
        (b) => (b.textContent || '').trim()
      )
    );
    for (let i = 0; i < flikar.length; i++) {
      await page.evaluate((idx: number) => {
        const b = document.querySelectorAll('[role="radio"]')[idx] as HTMLElement | undefined;
        b?.click();
      }, i);
      await new Promise((r) => setTimeout(r, 700));
      // "Avmarkera alla" när den finns, annars klicka bort enskilda val.
      const harAvmarkera = await page.evaluate(() =>
        /Avmarkera alla/.test(document.body.innerText)
      );
      if (harAvmarkera) {
        await klicka('Avmarkera alla');
        await new Promise((r) => setTimeout(r, 500));
      }
      // Enskilda kryssrutor som fortfarande är ikryssade (t.ex. profilkortet).
      await page.evaluate(() => {
        const rutor = Array.from(
          document.querySelectorAll('input[type="checkbox"]')
        ) as HTMLInputElement[];
        rutor.filter((r) => r.checked).forEach((r) => r.click());
      });
      await new Promise((r) => setTimeout(r, 500));
    }

    // Tillbaka till sista fliken och tryck Fortsätt.
    await page.evaluate(() => {
      const r = document.querySelectorAll('[role="radio"]');
      (r[r.length - 1] as HTMLElement | undefined)?.click();
    });
    await new Promise((r) => setTimeout(r, 900));
    await klicka('^Fortsätt$');
    await new Promise((r) => setTimeout(r, 1200));
    await skarm('dialog-inga-val');

    console.log('\nKlart.');
  } finally {
    if (browser) await browser.close();
    // Kontot raderas alltid. Cascade tar CV-raden och profilen.
    const { error } = await sb.auth.admin.deleteUser(userId);
    console.log(error ? `VARNING: kunde inte radera ${userId}: ${error.message}` : `QA-kontot raderat (${userId}).`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
