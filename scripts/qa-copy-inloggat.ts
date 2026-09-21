/**
 * Klicktest av den nya copyn i inloggat läge (docs/design/copy-inloggat-strangar.md).
 *
 * Skapar två engångskonton, ett gratis och ett premium via premium_grants,
 * och går igenom de vyer där texten ändrats. Skärmdump per steg på både
 * Pixel 7 och desktop. Kontona raderas alltid till sist, även vid fel.
 *
 *   npx tsx scripts/qa-copy-inloggat.ts --port 5200
 *
 * Kräver en produktionsserver på porten (npx next build && npx next start).
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

const UT = 'docs/qa/copy';

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const CV_TEXT = `Anna Lindqvist
Projektledare
anna.lindqvist.qa@example.com | 070-123 45 67 | Göteborg

PROFIL
Projektledare med erfarenhet av digitala projekt. Jag jobbar med team och
levererar i tid. Van vid att prata med kunder och andra intressenter.

ARBETSLIVSERFARENHET

Projektledare, Nordkom AB, 2021-2026
Ledde projekt inom webb och e-handel. Ansvarade för budget och tidplan.

Projektkoordinator, Vista Digital, 2018-2021
Hjälpte projektledarna med planering och uppföljning. Skrev rapporter.

UTBILDNING
Kandidatexamen i medie- och kommunikationsvetenskap, Göteborgs universitet, 2016

FÄRDIGHETER
Projektledning, Office, Google Analytics, Kommunikation
`;

const ANNONS = `Projektledare till Nordvik Digital, Göteborg

Vi söker en projektledare som vill driva digitala projekt från idé till
lansering. Du arbetar nära utvecklare, designers och kund.

Skall-krav:
- Minst tre års erfarenhet av projektledning
- Van vid agila arbetssätt
- Flytande svenska i tal och skrift

Meriterande:
- Erfarenhet av e-handel
- Kunskap i Google Analytics

Sista ansökningsdag: 30 oktober.
`;

interface Konto {
  epost: string;
  userId: string;
  premium: boolean;
}

type Sb = ReturnType<typeof createClient>;

async function skapaKonto(
  sb: Sb,
  prefix: string,
  premium: boolean,
  medCv = true
): Promise<Konto> {
  const epost = `qa-copy-${prefix}-${Date.now()}@jobbcoach-qa.example.com`;
  const { data, error } = await sb.auth.admin.createUser({
    email: epost,
    password: 'Qa!' + Math.random().toString(36).slice(2, 12),
    email_confirm: true,
  });
  if (error || !data?.user) throw new Error(`Kunde inte skapa ${prefix}: ${error?.message}`);
  const userId = data.user.id;

  await sb.from('profiles').upsert(
    { id: userId, email: epost, full_name: 'Anna Lindqvist' },
    { onConflict: 'id' }
  );

  if (premium) {
    // Premium via den riktiga vägen: en rad i premium_grants plus
    // premium_until på profilen, samma som grantPremiumDays gör.
    const until = new Date(Date.now() + 7 * 864e5).toISOString();
    const { error: grantFel } = await sb.from('premium_grants').insert({
      user_id: userId,
      stripe_event_id: `qa_copy_${userId}`,
      days: 7,
      source: 'qa_copy',
    });
    if (grantFel) throw new Error('Kunde inte skriva premium_grants: ' + grantFel.message);
    await sb
      .from('profiles')
      .update({ subscription_tier: 'premium', premium_until: until })
      .eq('id', userId);
  }

  if (medCv) {
    const { error: cvFel } = await sb.from('cv_texts').insert({
      user_id: userId,
      file_name: 'QA CV Anna Lindqvist.pdf',
      original_file_path: `qa/${userId}/qa-cv.pdf`,
      cv_text: CV_TEXT,
    });
    if (cvFel) throw new Error('Kunde inte lägga in CV: ' + cvFel.message);
  }

  console.log(`Konto ${prefix}${premium ? ' (premium)' : ' (gratis)'}: ${epost}`);
  return { epost, userId, premium };
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

  const konton: Konto[] = [];
  let browser: Browser | null = null;
  const problem: string[] = [];

  try {
    const gratis = await skapaKonto(sb, 'gratis', false);
    konton.push(gratis);
    const premium = await skapaKonto(sb, 'premium', true);
    konton.push(premium);

    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const projektRef = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0];
    const cookieNamn = `sb-${projektRef}-auth-token`;

    /** Ny sida inloggad som kontot, i given form. */
    const oppna = async (konto: Konto, form: 'mobil' | 'desktop'): Promise<Page> => {
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
      console.log('  skärmdump: ' + fil);
    };

    /** Letar efter avklippt eller överflödande text i vyn. */
    const layoutkoll = async (page: Page, vy: string) => {
      const fynd = await page.evaluate(() => {
        const ut: string[] = [];
        // Vågrätt överflöd på sidnivå.
        if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
          ut.push(`sidan scrollar i sidled (${document.documentElement.scrollWidth} px)`);
        }
        // Text som klipps av utan att vara avsiktligt trunkerad.
        const alla = Array.from(document.querySelectorAll('p,span,h1,h2,h3,li,button,a,label'));
        for (const el of alla) {
          const e = el as HTMLElement;
          if (!e.offsetParent && e.tagName !== 'BODY') continue;
          const st = getComputedStyle(e);
          const trunkerad = st.textOverflow === 'ellipsis' || st.overflow === 'hidden';
          if (!trunkerad) continue;
          const txt = (e.textContent || '').trim();
          if (!txt) continue;
          // Kända ytor utanför den här omgången: e-postbandet trunkerar med
          // flit, "Träff N" är en skärmläsaretikett utan egen bredd, och
          // "Bli upptäckt"-raden klipptes redan före omgången.
          if (
            /^Bekräfta din e-post/.test(txt) ||
            /^Träff \d+/.test(txt) ||
            /^Gör dig tillgänglig för rekryterare$/.test(txt) ||
            /^Premium aktivt\./.test(txt) ||
            /qa-copy-/.test(txt)
          ) {
            continue;
          }
          if (e.scrollWidth > e.clientWidth + 2) {
            ut.push(`klippt: "${txt.slice(0, 48)}"`);
          }
        }
        return ut.slice(0, 12);
      });
      for (const f of fynd) {
        const rad = `${vy}: ${f}`;
        problem.push(rad);
        console.log('  ANM ' + rad);
      }
    };

    /** Mäter CLS över sidans livstid. */
    const clsKoll = async (page: Page, vy: string) => {
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
            }, 2500);
          })
      );
      console.log(`  CLS ${vy}: ${cls}`);
      if (cls > 0) problem.push(`${vy}: CLS ${cls}, inte noll`);
      return cls;
    };

    const klicka = async (page: Page, text: string) => {
      const traff = await page.evaluateHandle((m: string) => {
        const re = new RegExp(m);
        const kandidater = Array.from(
          document.querySelectorAll('button,[role="button"],[role="radio"],a[href]')
        ) as HTMLElement[];
        const traffar = kandidater.filter(
          (b) =>
            re.test((b.textContent || '').trim()) &&
            !(b as HTMLButtonElement).disabled &&
            b.offsetParent !== null
        );
        traffar.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
        return traffar[0] || null;
      }, text);
      const el = traff.asElement();
      if (!el) throw new Error(`Hittade ingen knapp: ${text}`);
      await (el as any).click();
    };

    const kaka = async (page: Page) => {
      await page
        .evaluate(() => {
          const b = Array.from(document.querySelectorAll('button')).find((x) =>
            /^Acceptera$/.test((x.textContent || '').trim())
          );
          b?.click();
        })
        .catch(() => {});
      await new Promise((r) => setTimeout(r, 600));
    };

    const vanta = (ms: number) => new Promise((r) => setTimeout(r, ms));

    /* ---------------------------------------------------- 1. Sidomenyn */
    // Sidomenyn syns på desktop; mobilen har bottennavet.
    console.log('\n1. Sidomeny, desktop (gratis)');
    {
      const page = await oppna(gratis, 'desktop');
      await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 });
      await kaka(page);
      await vanta(1200);
      await skarm(page, 'sidomeny-desktop-gratis');
      await layoutkoll(page, 'sidomeny desktop');
      // Etiketter och sublabels som ska stå där.
      const texter = await page.evaluate(() => document.body.innerText);
      for (const v of [
        'Mina CV',
        'Personliga brev',
        'Skriv nytt brev',
        'Klistra in annonsen, vi skriver',
        'Så läser en rekryterare ditt CV',
        'Lediga jobb som passar ditt CV',
        'Träna på testerna innan urvalet',
        'Från 49 kr',
      ]) {
        if (!texter.includes(v)) problem.push(`sidomeny: saknar "${v}"`);
      }
      await page.close();
    }

    console.log('2. Mobilnav (gratis)');
    {
      const page = await oppna(gratis, 'mobil');
      await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 });
      await kaka(page);
      await vanta(1200);
      await skarm(page, 'mobilnav-pixel7-gratis');
      // Etiketterna i bottennavet ska rymmas i 12 px utan radbrytning.
      const nav = await page.evaluate(() => {
        const rader = Array.from(document.querySelectorAll('nav span')).filter(
          (s) => getComputedStyle(s).fontSize === '12px'
        ) as HTMLElement[];
        return rader.map((s) => ({
          text: (s.textContent || '').trim(),
          klippt: s.scrollWidth > s.clientWidth + 1,
          hojd: s.getBoundingClientRect().height,
        }));
      });
      console.log('  navetiketter: ' + JSON.stringify(nav));
      for (const n of nav) {
        if (n.klippt) problem.push(`mobilnav: "${n.text}" klipps i 12 px`);
      }
      await page.close();
    }

    /* ------------------------------------------ 3. Hemskärm A och C */
    console.log('3. Hemskärm tillstånd A (nytt konto utan CV)');
    {
      // Tillstånd A kräver ett konto utan CV.
      const tomt = await skapaKonto(sb, 'tomt', false, false);
      konton.push(tomt);

      for (const form of ['mobil', 'desktop'] as const) {
        const page = await oppna(tomt, form);
        await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 });
        await kaka(page);
        await vanta(1500);
        await skarm(page, `hemskarm-a-${form}`, true);
        await layoutkoll(page, `hemskärm A ${form}`);
        if (form === 'mobil') await clsKoll(page, 'hemskärm A mobil');
        const t = await page.evaluate(() => document.body.innerText);
        for (const v of [
          'Rekryterare letar först efter senaste rollen',
          'Namn, telefon och adress maskas',
        ]) {
          if (!t.includes(v)) problem.push(`hemskärm A ${form}: saknar "${v}"`);
        }
        await page.close();
      }
    }

    console.log('4. Hemskärm tillstånd C (konto med CV)');
    {
      for (const form of ['mobil', 'desktop'] as const) {
        const page = await oppna(premium, form);
        await page.goto(bas + '/dashboard', { waitUntil: 'networkidle0', timeout: 60000 });
        await kaka(page);
        await vanta(1500);
        await skarm(page, `hemskarm-c-${form}`, true);
        await layoutkoll(page, `hemskärm C ${form}`);
        if (form === 'mobil') await clsKoll(page, 'hemskärm C mobil');
        const t = await page.evaluate(() => document.body.innerText);
        for (const v of [
          'Vi läser kravprofilen och skriver brevet.',
          'Ditt CV mot Arbetsförmedlingens annonser.',
        ]) {
          if (!t.includes(v)) problem.push(`hemskärm C ${form}: saknar "${v}"`);
        }
        await page.close();
      }
    }

    console.log('5. Profil, CLS');
    {
      const page = await oppna(premium, 'mobil');
      await page.goto(bas + '/dashboard/profil', { waitUntil: 'networkidle0', timeout: 60000 });
      await kaka(page);
      await vanta(1500);
      await clsKoll(page, 'profil mobil');
      await layoutkoll(page, 'profil mobil');
      await page.close();
    }

    /* --------------------------------------------- 6. Brevflödets tonsteg */
    console.log('6. Brevflödet, ingress och tonsteg');
    for (const [namn, konto] of [
      ['gratis', gratis],
      ['premium', premium],
    ] as const) {
      const page = await oppna(konto, 'mobil');
      await page.goto(bas + '/dashboard/skapa-brev', { waitUntil: 'networkidle0', timeout: 60000 });
      await kaka(page);
      await vanta(1800);
      // Ett sparat utkast tar över steget och doljer ingressen med flit.
      // Borja om, sa vi ser steg 1 som en ny anvandare gor.
      const utkast = await page.evaluate(() =>
        document.body.innerText.includes('Du har ett påbörjat utkast')
      );
      if (utkast) {
        await klicka(page, '^Börja om$');
        await vanta(1200);
        // "Börja om" kräver en bekräftelse innan utkastet tas bort.
        const bekraftelse = await page.evaluate(() =>
          /tas bort och går inte att/.test(document.body.innerText)
        );
        if (bekraftelse) {
          await klicka(page, '^Börja om$|^Ta bort$|^Ja, börja om$');
          await vanta(1800);
        }
        await vanta(1200);
      }
      await skarm(page, `brev-steg1-ingress-${namn}`, true);
      const t1 = await page.evaluate(() => document.body.innerText);
      if (!t1.includes('I ett svenskt urval läses brevet mot annonsens kravprofil')) {
        problem.push(`brevflöde ${namn}: saknar ingressen i steg 1`);
      }
      await layoutkoll(page, `brev steg 1 ${namn}`);

      // Steg 1 -> 2: välj CV och gå vidare, klistra in annons, sedan tonsteget.
      try {
        await klicka(page, 'QA CV');
        await vanta(600);
        await klicka(page, '^Fortsätt$');
        await vanta(1500);
        await page.evaluate((text: string) => {
          const ta = document.querySelector('#job-description') as HTMLTextAreaElement | null;
          if (!ta) return;
          const setter = Object.getOwnPropertyDescriptor(
            HTMLTextAreaElement.prototype,
            'value'
          )!.set!;
          setter.call(ta, text);
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }, ANNONS);
        await vanta(1200);
        await skarm(page, `brev-annonsfalt-${namn}`, true);
        const t2 = await page.evaluate(() => document.body.innerText);
        if (!t2.includes('Krav vi läst ut ur annonsen')) {
          console.log('  (rubriken "Krav vi läst ut ur annonsen" syns inte i detta läge)');
        }
        // Steg 3 ar brevmallen, tonsteget ligger i steg 4.
        await klicka(page, '^Fortsätt$');
        await vanta(1800);
        await skarm(page, `brev-mallsteg-${namn}`, true);
        await klicka(page, '^Fortsätt$');
        await vanta(1800);
        await skarm(page, `brev-tonsteg-${namn}`, true);
        const t3 = await page.evaluate(() => document.body.innerText);
        if (!t3.includes('Vi väljer ton åt dig')) {
          problem.push(`brevflöde ${namn}: saknar "Vi väljer ton åt dig"`);
        }
        if (t3.includes('Smart-anpassad')) {
          problem.push(`brevflöde ${namn}: "Smart-anpassad" står kvar`);
        }
        if (namn === 'gratis' && !t3.includes('Automatiskt tonval ingår i Premium')) {
          problem.push('brevflöde gratis: saknar raden om automatiskt tonval');
        }
        await layoutkoll(page, `brev tonsteg ${namn}`);
      } catch (e) {
        console.log(`  kunde inte nå tonsteget för ${namn}: ${(e as Error).message}`);
        problem.push(`brevflöde ${namn}: kom inte till tonsteget (${(e as Error).message})`);
      }
      await page.close();
    }

    /* ------------------------------------------------ 7. CV-analysens intro */
    console.log('7. CV-analysens intro');
    {
      const page = await oppna(premium, 'mobil');
      await page.goto(bas + '/dashboard/cv-analys', { waitUntil: 'networkidle0', timeout: 60000 });
      await kaka(page);
      await vanta(1500);
      await skarm(page, 'cv-analys-intro-mobil', true);
      await layoutkoll(page, 'cv-analys intro');
      const t = await page.evaluate(() => document.body.innerText);
      for (const v of [
        'Läsbar i rekryteringssystem',
        'rekryteringssystem (ATS)',
        'Genomgång per avsnitt',
        'Rekryterare letar först efter senaste rollen',
      ]) {
        if (!t.includes(v)) problem.push(`cv-analys intro: saknar "${v}"`);
      }
      await page.close();
    }

    /* ---------------------------------------------- 8. Jobbmatchningen */
    console.log('8. Jobbmatchning, lista och detaljark');
    {
      const page = await oppna(premium, 'mobil');
      await page.goto(bas + '/dashboard/jobbmatchning', {
        waitUntil: 'networkidle0',
        timeout: 60000,
      });
      await kaka(page);
      await vanta(2000);
      try {
        await klicka(page, 'Hitta jobb|Sök igen|Matcha');
        await vanta(3000);
      } catch {
        console.log('  (ingen sökknapp, listan kan redan vara laddad)');
      }
      await page.waitForFunction(() => /matchgrad|passade den här gången/.test(document.body.innerText), {
          timeout: 120000,
          polling: 1000,
        })
        .catch(() => console.log('  (hittade varken träffar eller tomt tillstånd i tid)'));
      await vanta(1500);
      // Scrolla till förklaringsraden så den syns i dumpen.
      await page.evaluate(() => {
        const p = Array.from(document.querySelectorAll('p')).find((x) =>
          /Matchgraden väger kravprofilens/.test(x.textContent || '')
        );
        p?.scrollIntoView({ block: 'center' });
      });
      await vanta(900);
      await skarm(page, 'matchning-lista-mobil');
      await skarm(page, 'matchning-lista-mobil-hel', true);
      await layoutkoll(page, 'matchning lista');
      const t = await page.evaluate(() => document.body.innerText);
      if (t.includes('% match') && !t.includes('% matchgrad')) {
        problem.push('matchning: "% match" står kvar');
      }
      if (t.includes('matchgrad') && !t.includes('Matchgraden väger kravprofilens kompetenser')) {
        problem.push('matchning: saknar förklaringsraden överst i listan');
      }

      // Detaljarket: öppna första träffen.
      try {
        // Hela traffraden ar en knapp som oppnar detaljarket.
        const oppnad = await page.evaluate(() => {
          const knappar = Array.from(document.querySelectorAll('button')) as HTMLElement[];
          const rad = knappar.find((b) => /matchgrad/.test(b.textContent || ''));
          if (!rad) return false;
          rad.click();
          return true;
        });
        if (!oppnad) throw new Error('hittade ingen träffrad');
        await vanta(2000);
        await skarm(page, 'matchning-detaljark-mobil', true);
        const d = await page.evaluate(() => document.body.innerText);
        if (!d.includes('Matchgraden bygger på fyra saker')) {
          problem.push('matchning detaljark: saknar förklaringen');
        }
        await layoutkoll(page, 'matchning detaljark');
      } catch {
        console.log('  (kunde inte öppna detaljarket)');
      }
      await page.close();
    }

    /* ------------------------------------- 9. Betalväggar och prenumeration */
    console.log('9. Prenumerationssidan');
    for (const [namn, konto] of [
      ['gratis', gratis],
      ['premium', premium],
    ] as const) {
      const page = await oppna(konto, 'mobil');
      await page.goto(bas + '/dashboard/profil/prenumeration', {
        waitUntil: 'networkidle0',
        timeout: 60000,
      });
      await kaka(page);
      await vanta(1800);
      await skarm(page, `prenumeration-${namn}-mobil`, true);
      await layoutkoll(page, `prenumeration ${namn}`);
      if (namn === 'gratis') {
        const t = await page.evaluate(() => document.body.innerText);
        if (!t.includes('Premium tar bort dagsgränserna')) {
          problem.push('prenumeration gratis: saknar den nya ingressen');
        }
      }
      await page.close();
    }

    console.log('10. Betalvägg, nedladdning och kvot (gratis)');
    {
      // Gratisnivån ger en nedladdning. Är den förbrukad möter
      // cv-export-väggen direkt i mallflödet, utan att vi behöver ladda
      // ner på riktigt.
      await sb.from('profiles').update({ free_cv_exports_used: 1 }).eq('id', gratis.userId);

      const page = await oppna(gratis, 'mobil');
      await page.goto(bas + '/dashboard/cv-mallar', {
        waitUntil: 'networkidle0',
        timeout: 60000,
      });
      await kaka(page);
      await vanta(1800);
      await skarm(page, 'betalvagg-utgangslage-gratis', true);
      try {
        // Mallsidan är ett enda scroll: steg 3 med cv-export-väggen står
        // längst ner. Scrolla dit i stället för att klicka vidare.
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await vanta(2500);
        await page.evaluate(() => {
          const p = Array.from(document.querySelectorAll('h2,h3,p')).find((x) =>
            /Din gratis nedladdning är använd/.test(x.textContent || '')
          );
          p?.scrollIntoView({ block: 'center' });
        });
        await vanta(1200);
        await skarm(page, 'betalvagg-nedladdning-gratis', true);
        const t = await page.evaluate(() => document.body.innerText);
        if (t.includes('Lås upp')) problem.push('betalvägg: "Lås upp" står kvar');
        await layoutkoll(page, 'betalvägg nedladdning');
        // Prisstegen inne i UpgradeSheet, som betalväggens knapp öppnar.
        await klicka(page, '^Ladda ner med Premium$|^Se vad Premium kostar$');
        await vanta(1500);
        await skarm(page, 'prisstege-upgradesheet-gratis', true);
        const p = await page.evaluate(() => document.body.innerText);
        for (const v of [
          'En ansökan som ska in ikväll',
          'Flera ansökningar samma vecka',
          'Aktivt sökande, avsluta när du vill',
          'Ett längre sök eller byte av bransch',
        ]) {
          if (!p.includes(v)) problem.push(`prisstege: saknar "${v}"`);
        }
        await layoutkoll(page, 'prisstege');
      } catch (e) {
        console.log('  (nådde inte betalväggen: ' + (e as Error).message + ')');
        problem.push('betalvägg nedladdning: nåddes inte (' + (e as Error).message + ')');
      }
      await page.close();
    }

    console.log('11. Betalvägg, kvot (gratis)');
    {
      // En förbrukad analys inom 72-timmarsfönstret ger kvotväggen direkt
      // när CV-analysen öppnas.
      const { data: gratisCv } = await sb
        .from('cv_texts')
        .select('id')
        .eq('user_id', gratis.userId)
        .limit(1)
        .single();
      const { error: kvotFel } = await sb.from('cv_analysis_jobs').insert({
        user_id: gratis.userId,
        cv_id: (gratisCv as { id: string } | null)?.id,
        usage_counted: true,
        status: 'completed',
      });
      if (kvotFel) console.log('  (kunde inte lägga in analysjobb: ' + kvotFel.message + ')');

      const page = await oppna(gratis, 'mobil');
      await page.goto(bas + '/dashboard/cv-analys', { waitUntil: 'networkidle0', timeout: 60000 });
      await kaka(page);
      await vanta(1800);
      await skarm(page, 'betalvagg-kvot-gratis', true);
      const t = await page.evaluate(() => document.body.innerText);
      if (t.includes('Din CV-analys är använd')) {
        console.log('  kvotväggen visas');
        await layoutkoll(page, 'betalvägg kvot');
      } else {
        console.log('  (kvotväggen visades inte, kvoten kan skilja sig)');
      }
      await page.close();
    }

    console.log('\n--- Anmärkningar ---');
    if (problem.length === 0) console.log('Inga.');
    else problem.forEach((p) => console.log('  ' + p));
    fs.writeFileSync(path.join(UT, 'anmarkningar.txt'), problem.join('\n') + '\n', 'utf8');
  } finally {
    if (browser) await browser.close();
    for (const k of konton) {
      const { error } = await sb.auth.admin.deleteUser(k.userId);
      console.log(
        error ? `VARNING: kunde inte radera ${k.userId}: ${error.message}` : `Raderat ${k.epost}`
      );
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
