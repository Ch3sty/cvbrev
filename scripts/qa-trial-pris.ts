/**
 * Klicktest av priset under provperioden (docs/rapporter/analys-effekt-2026-09-21.md).
 *
 * Skapar ett engangskonto med riktig reverse trial (premium_source
 * signup_trial, premium_until tre dygn fram) och kontrollerar tva saker:
 *
 *   1. Dashboardens statusrad sager bade dagar kvar och priset.
 *   2. Premiumhandlingar visar den tunna raden dar betalvaggen annars legat,
 *      utan att nagot sparras.
 *
 * Skarmdump per steg pa Pixel 7 och desktop. Kontot raderas alltid till sist.
 *
 *   npx tsx scripts/qa-trial-pris.ts --port 5200
 *
 * Kraver en produktionsserver pa porten (npx next build && npx next start).
 */

import { laddaEnv } from './_env';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
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

const UT = 'docs/qa/trial';

type Sb = SupabaseClient<any, any, any>;

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const CV_TEXT = `Anna Lindqvist
Projektledare
anna.lindqvist.qa@example.com | 070-123 45 67 | Goteborg

PROFIL
Projektledare med erfarenhet av digitala projekt.

ARBETSLIVSERFARENHET
Projektledare, Nordkom AB, 2021-2026
Ledde projekt inom webb och e-handel.

UTBILDNING
Kandidatexamen i medie- och kommunikationsvetenskap, 2016
`;

const PIXEL = {
  viewport: { width: 412, height: 915, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  userAgent:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
};

/** Samma rakning som src/lib/premium/trial.ts: hela dygn, sista dygnet ger 0. */
const DAGAR_KVAR = 3;

async function skapaTrialkonto(sb: Sb) {
  const epost = `qa-trial-${Date.now()}@jobbcoach-qa.example.com`;
  const { data, error } = await sb.auth.admin.createUser({
    email: epost,
    password: 'Qa!' + Math.random().toString(36).slice(2, 12),
    email_confirm: true,
  });
  if (error || !data?.user) throw new Error('Kunde inte skapa konto: ' + error?.message);
  const userId = data.user.id;

  // Exakt det post-signup skriver for reverse trial, med en halv dag pa
  // for att hamna mitt i dygn tre och inte pa grasen till tva.
  const until = new Date(Date.now() + (DAGAR_KVAR + 0.5) * 864e5).toISOString();
  await sb.from('profiles').upsert(
    {
      id: userId,
      email: epost,
      full_name: 'Anna Lindqvist',
      subscription_tier: 'premium',
      premium_source: 'signup_trial',
      premium_until: until,
      subscription_status: null,
    },
    { onConflict: 'id' }
  );

  await sb.from('cv_texts').insert({
    user_id: userId,
    file_name: 'QA CV Anna Lindqvist.pdf',
    original_file_path: `qa/${userId}/qa-cv.pdf`,
    cv_text: CV_TEXT,
  });

  // Ett sparat brev: det ar dar nedladdningen bor, och dar raden ska sta i
  // stallet for betalvaggen sa lange provperioden loper.
  const { data: brev, error: brevFel } = await sb
    .from('letters')
    .insert({
      user_id: userId,
      title: 'Ansokan projektledare',
      company: 'Nordvik Digital',
      job_title: 'Projektledare',
      content: 'Hej,\n\nJag soker tjansten som projektledare.\n\nMed vanlig halsning\nAnna Lindqvist',
      is_saved: true,
    })
    .select('id')
    .single();
  if (brevFel || !brev) throw new Error('Kunde inte skapa brev: ' + brevFel?.message);

  console.log(`Trialkonto: ${epost} (premium till ${until})`);
  return { epost, userId, brevId: brev.id as string };
}

async function cookiePayload(sb: Sb, epost: string) {
  const { data: link } = await sb.auth.admin.generateLink({ type: 'magiclink', email: epost });
  const { data: sess, error } = await sb.auth.verifyOtp({
    type: 'magiclink',
    token_hash: (link as any)!.properties.hashed_token,
  });
  if (error || !sess?.session) throw new Error('Kunde inte skapa session: ' + error?.message);
  return (
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
    ).toString('base64')
  );
}

async function main() {
  const port = arg('port', '5200')!;
  const bas = `http://localhost:${port}`;

  const chrome = CHROME_KANDIDATER.find((p) => fs.existsSync(p));
  if (!chrome) throw new Error('Hittade ingen Chrome eller Edge.');
  const res = await fetch(bas + '/login').catch(() => null);
  if (!res) throw new Error(`Ingen server pa ${bas}. Kor npx next start -p ${port}.`);

  fs.mkdirSync(UT, { recursive: true });

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as Sb;

  let browser: Browser | null = null;
  let userId: string | null = null;
  const problem: string[] = [];

  try {
    const konto = await skapaTrialkonto(sb);
    userId = konto.userId;

    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const projektRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0];
    const cookieNamn = `sb-${projektRef}-auth-token`;

    const oppna = async (form: 'mobil' | 'desktop'): Promise<Page> => {
      const page = await browser!.newPage();
      if (form === 'mobil') await page.emulate(PIXEL);
      else await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

      const payload = await cookiePayload(sb, konto.epost);
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

    const skarm = async (page: Page, namn: string, helSida = false) => {
      const fil = path.join(UT, `${namn}.png`);
      await page.screenshot({ path: fil as `${string}.png`, fullPage: helSida });
      console.log('  skarmdump: ' + fil);
    };

    /** Hela sidans text, for att leta efter raderna. */
    const text = (page: Page) => page.evaluate(() => document.body.innerText);

    const kolla = (villkor: boolean, beskrivning: string) => {
      console.log(`  ${villkor ? 'OK  ' : 'FEL '} ${beskrivning}`);
      if (!villkor) problem.push(beskrivning);
    };

    // ---------------------------------------------------------------- 1
    console.log('\n1. Dashboardens statusrad, Pixel 7');
    const mobil = await oppna('mobil');
    await mobil.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1500));
    await skarm(mobil, '1-dashboard-statusrad-pixel7', true);

    const dashText = await text(mobil);
    kolla(/\d+ dagar kvar/.test(dashText), 'statusraden sager dagar kvar');
    kolla(dashText.includes('Sedan fran 49 kr.') || dashText.includes('Sedan från 49 kr.'),
      'statusraden sager priset');
    kolla(dashText.includes('Se planer'), 'statusraden lankar till planerna');

    console.log('\n1b. Dashboardens statusrad, desktop');
    const dator = await oppna('desktop');
    await dator.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1500));
    await skarm(dator, '1b-dashboard-statusrad-desktop', true);
    await dator.close();

    // ---------------------------------------------------------------- 2
    // Premiumhandlingar: raden ska ligga dar betalvaggen annars legat, och
    // ingenting far vara sparrat.
    const ytor: Array<{ vag: string; namn: string; kravTrialrad?: boolean }> = [
      // Brevet: premiumhandlingen ar nedladdningen, och raden ska sta under
      // brevet dar betalvaggen annars legat.
      { vag: `/dashboard/mina-brev/${konto.brevId}`, namn: '2-brev', kravTrialrad: true },
      { vag: '/dashboard/cv-analys', namn: '3-cv-analys' },
      { vag: '/dashboard/profil/cv', namn: '4-mina-cv' },
      { vag: '/dashboard/tester', namn: '5-tester' },
      { vag: '/dashboard/jobbmatchning', namn: '6-jobbmatchning' },
    ];

    for (const yta of ytor) {
      console.log(`\n${yta.namn}: ${yta.vag}`);
      await mobil.goto(bas + yta.vag, { waitUntil: 'networkidle0', timeout: 60000 });
      await new Promise((r) => setTimeout(r, 1500));
      await skarm(mobil, `${yta.namn}-pixel7`, true);

      const t = await text(mobil);
      const harTrialrad = t.includes('Ingar i din provperiod') || t.includes('Ingår i din provperiod');
      const harBetalvagg =
        t.includes('Fortsatt skriva med Premium') ||
        t.includes('Fortsätt skriva med Premium') ||
        t.includes('Las upp') ||
        t.includes('Lås upp');

      kolla(!harBetalvagg, `${yta.vag}: ingen betalvagg for trialkonto`);

      if (yta.kravTrialrad) {
        kolla(harTrialrad, `${yta.vag}: trialraden syns`);
        kolla(
          t.includes('Behall det fran 49 kr') || t.includes('Behåll det från 49 kr'),
          `${yta.vag}: trialraden sager priset`
        );
        kolla(
          t.includes('dagar kvar') || t.includes('dag kvar') || t.includes('Sista dagen'),
          `${yta.vag}: trialraden sager dagar kvar`
        );
      } else if (harTrialrad) {
        kolla(
          t.includes('Behall det fran 49 kr') || t.includes('Behåll det från 49 kr'),
          `${yta.vag}: trialraden sager priset`
        );
      } else {
        console.log(`  (ingen trialrad pa ${yta.vag}, kortet monteras inte i det har lager)`);
      }
    }

    await mobil.close();
  } finally {
    if (browser) await browser.close();
    if (userId) {
      const { error } = await sb.auth.admin.deleteUser(userId);
      console.log(error ? '\nKunde inte radera QA-kontot: ' + error.message : '\nQA-kontot raderat.');
    }
  }

  if (problem.length) {
    console.log('\nProblem:');
    for (const p of problem) console.log('  - ' + p);
    process.exit(1);
  }
  console.log('\nAllt gront.');
}

main().catch((err) => {
  console.error(err?.message ?? err);
  process.exit(1);
});
