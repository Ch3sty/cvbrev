/**
 * Klicktest av de tre besluten 2026-09-15 (docs/plan-copy-inloggat.md,
 * avsnittet "Beslut 2026-09-15"): "Lås upp" borta, rekryteringssystem i
 * stället för ATS, och af-rapportens löfte utan "för alltid".
 *
 * Tre vyer på Pixel 7 med ett engångskonto som raderas till sist:
 *   1. Mina brev, gratis med låst brev  -> "Öppna brevet med Premium"
 *   2. Rekryteringstester, hubben       -> "Gör testet med Premium"
 *   3. CV-analysens intro               -> "rekryteringssystem (ATS)"
 *
 *   npx tsx scripts/qa-copy-beslut.ts --port 5200
 *
 * Kräver en produktionsserver på porten (npx next build && npx next start).
 */

import { config } from 'dotenv';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

config({ path: '.env.local' });

type Sb = SupabaseClient<any, any, any>;

const CHROME_KANDIDATER = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

const UT = 'docs/qa/copy-beslut';

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const CV_TEXT = `Anna Lindqvist
Projektledare
anna.lindqvist.qa@example.com | 070-123 45 67 | Göteborg

PROFIL
Projektledare med erfarenhet av digitala projekt.

ARBETSLIVSERFARENHET
Projektledare, Nordkom AB, 2021-2026
Ledde projekt inom webb och e-handel.

UTBILDNING
Kandidatexamen, Göteborgs universitet, 2016
`;

const PIXEL = {
  viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
};

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
  ) as Sb;

  let userId: string | null = null;
  let browser: Browser | null = null;
  const problem: string[] = [];
  const epost = `qa-beslut-${Date.now()}@jobbcoach-qa.example.com`;

  try {
    const { data, error } = await sb.auth.admin.createUser({
      email: epost,
      password: 'Qa!' + Math.random().toString(36).slice(2, 12),
      email_confirm: true,
    });
    if (error || !data?.user) throw new Error('Kunde inte skapa konto: ' + error?.message);
    userId = data.user.id;
    console.log('Konto (gratis): ' + epost);

    await sb
      .from('profiles')
      .upsert({ id: userId, email: epost, full_name: 'Anna Lindqvist' }, { onConflict: 'id' });
    await sb.from('cv_texts').insert({
      user_id: userId,
      file_name: 'QA CV Anna Lindqvist.pdf',
      original_file_path: `qa/${userId}/qa-cv.pdf`,
      cv_text: CV_TEXT,
    });

    // Gratisnivån håller två sparade brev aktiva (FREE_ACTIVE_LETTER_LIMIT),
    // resten låses. Tre sparade brev ger alltså minst ett låst kort.
    const foretag = ['Nordvik Digital', 'Stadsbygg AB', 'Kustlinjen Media'];
    for (const [i, namn] of foretag.entries()) {
      const { error: brevFel } = await sb.from('letters').insert({
        user_id: userId,
        title: `Projektledare, ${namn}`,
        content: 'Hej,\n\nJag söker tjänsten som projektledare.\n\nMed vänlig hälsning\nAnna Lindqvist',
        job_title: 'Projektledare',
        company: namn,
        is_saved: true,
        updated_at: new Date(Date.now() - i * 864e5).toISOString(),
      });
      if (brevFel) throw new Error('Kunde inte lägga in brev: ' + brevFel.message);
    }

    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const projektRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0];
    const cookieNamn = `sb-${projektRef}-auth-token`;

    const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost });
    const { data: sess, error: sessFel } = await sb.auth.verifyOtp({
      type: 'magiclink',
      token_hash: (link as any)!.properties.hashed_token,
    });
    if (sessFel || !sess?.session) throw new Error('Ingen session: ' + sessFel?.message);
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

    const oppna = async (): Promise<Page> => {
      const page = await browser!.newPage();
      await page.emulate(PIXEL);
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
      return page;
    };

    /** Öppnar en vy, mäter CLS, kontrollerar texten och tar skärmdump. */
    const vy = async (
      namn: string,
      url: string,
      forvantat: string[],
      forbjudet: string[],
      fore?: (page: Page) => Promise<void>
    ) => {
      const page = await oppna();
      await page.goto(bas + url, { waitUntil: 'networkidle2', timeout: 60000 });
      await new Promise((r) => setTimeout(r, 2500));
      if (fore) await fore(page);

      const text = await page.evaluate(() => document.body.innerText);
      for (const f of forvantat) {
        if (!text.includes(f)) {
          problem.push(`${namn}: saknar "${f}"`);
          console.log(`  SAKNAS "${f}"`);
        } else console.log(`  ok "${f}"`);
      }
      for (const f of forbjudet) {
        if (text.toLowerCase().includes(f.toLowerCase())) {
          problem.push(`${namn}: innehåller "${f}"`);
          console.log(`  FÖRBJUDET "${f}" finns i vyn`);
        }
      }

      const cls = await page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            let summa = 0;
            const obs = new PerformanceObserver((lista) => {
              for (const e of lista.getEntries() as any[]) {
                if (!e.hadRecentInput) summa += e.value;
              }
            });
            obs.observe({ type: 'layout-shift', buffered: true });
            setTimeout(() => {
              obs.disconnect();
              resolve(Math.round(summa * 10000) / 10000);
            }, 1500);
          })
      );
      console.log(`  CLS: ${cls}`);

      const fil = path.join(UT, `${namn}.png`) as `${string}.png`;
      await page.screenshot({ path: fil, fullPage: true });
      console.log('  skärmdump: ' + fil);
      await page.close();
    };

    // Listan öppnar i kompakt läge (LetterCardCompact -> "Öppna med Premium").
    // Rutnätet (LetterCard -> "Öppna brevet med Premium") nås via lägesväxeln.
    console.log('\n1a. Mina brev, kompakt lista (gratis, låst brev)');
    await vy('mina-brev-kompakt-pixel7', '/dashboard/mina-brev', ['Öppna med Premium'], ['Lås upp']);

    console.log('\n1b. Mina brev, rutnät');
    await vy(
      'mina-brev-rutnat-pixel7',
      '/dashboard/mina-brev',
      ['Öppna brevet med Premium'],
      ['Lås upp'],
      async (page) => {
        // Växla till rutnätsläget, knappen har ingen text utan bara ikon.
        await page.evaluate(() => {
          const knappar = Array.from(document.querySelectorAll('button'));
          const rutnat = knappar.find((b) =>
            /rutnät|grid|kort/i.test(b.getAttribute('aria-label') || b.title || '')
          );
          rutnat?.click();
        });
        await new Promise((r) => setTimeout(r, 1200));
      }
    );

    console.log('\n2. Testhubben, avancerat personlighetstest (enda premiumlåsta testet)');
    await vy(
      'testhubb-pixel7',
      '/dashboard/tester/personlighet-avancerad',
      ['Gör testet med Premium'],
      ['Lås upp']
    );

    console.log('\n3. CV-analysens intro');
    await vy(
      'cv-analys-intro-pixel7',
      '/dashboard/cv-analys',
      ['rekryteringssystem (ATS)'],
      ['Lås upp', 'ATS-system', 'ATS-poäng']
    );

    console.log('\n--- Anmärkningar ---');
    if (problem.length === 0) console.log('Inga.');
    else problem.forEach((p) => console.log('  ' + p));
    fs.writeFileSync(path.join(UT, 'anmarkningar.txt'), (problem.join('\n') || 'Inga.') + '\n', 'utf8');
  } finally {
    if (browser) await browser.close();
    if (userId) {
      const { error } = await sb.auth.admin.deleteUser(userId);
      console.log(error ? `VARNING: kunde inte radera ${userId}: ${error.message}` : `Raderat ${epost}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
