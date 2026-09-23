// Klicktest av Räkna ut i riktig webbläsare (feedback_riktig_webblasartest):
// hubben och de nio kalkylatorerna på Pixel 7 och desktop, med ett
// räkneexempel ifyllt, Dela-knappen tryckt, den delade länken öppnad i en ny
// flik och jämförd med originalet, och OG-bilden hämtad och sparad.
//
//   node scripts/qa-rakna-ut.mjs http://localhost:5216 docs/qa/qa-rakna-ut
//
// På Pixel 7 ersätts navigator.share med en stubbe som sparar vad som
// delades (en riktig delningsmeny går inte att klicka i en headless
// webbläsare); på desktop finns ingen share och länken kopieras.
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const BAS = process.argv[2] ?? 'http://localhost:5216';
const UT = process.argv[3] ?? 'docs/qa/qa-rakna-ut';
fs.mkdirSync(UT, { recursive: true });

const ENHETER = {
  pixel7: {
    viewport: { width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
    ua: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0 Mobile Safari/537.36',
  },
  desktop: { viewport: { width: 1280, height: 800 }, ua: undefined },
};

/** Sätter ett värde som React ser (native setter plus input-händelse). */
async function satt(page, sel, varde) {
  await page.waitForSelector(sel);
  await page.evaluate(
    (s, v) => {
      const el = document.querySelector(s);
      const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    },
    sel,
    varde
  );
}

async function klickaText(page, text, tagg = 'button') {
  const ok = await page.evaluate(
    (t, g) => {
      const el = [...document.querySelectorAll(g)].find((e) => {
        const titel = e.querySelector('span span') ?? e;
        return (titel.textContent ?? '').trim() === t || (e.textContent ?? '').trim() === t;
      });
      if (!el) return false;
      el.click();
      return true;
    },
    text,
    tagg
  );
  if (!ok) throw new Error(`Hittade inte "${text}"`);
}

const EXEMPEL = {
  'lon-efter-skatt': async (p) => {
    await satt(p, '#lon', '42000');
    await satt(p, '#kommun', 'Uppsala');
  },
  uppsagningstid: async (p) => {
    await klickaText(p, 'Arbetsgivaren');
    await satt(p, '#startdatum', '2018-05-01');
    await satt(p, '#uppsagningsdatum', '2026-10-01');
  },
  semesterersattning: async (p) => {
    await satt(p, '#semManadslon', '38000');
    await satt(p, '#semDagar', '14');
  },
  'timlon-till-manadslon': async (p) => {
    await satt(p, '#belopp', '195');
  },
  loneforhandling: async (p) => {
    await satt(p, '#lfLon', '40000');
    await satt(p, '#lfHojning', '2500');
  },
  'vad-kostar-en-anstalld': async (p) => {
    await satt(p, '#akLon', '45000');
  },
  felrekrytering: async (p) => {
    await satt(p, '#kalkyl-lon', '55000');
    await satt(p, '#kalkyl-manader', '8');
  },
  sourcing: async (p) => {
    await klickaText(p, 'Kandidatpool med samtycke');
    await satt(p, '#tratt-anst', '3');
  },
  traffsakerhet: async (p) => {
    await klickaText(p, 'Strukturerad intervju');
    await satt(p, '#sim-kvot', '30');
  },
};

async function resultat(page) {
  return page.evaluate(() => {
    const yta = document.querySelector('section[aria-label="Resultat"]');
    if (!yta) return null;
    const tal = yta.querySelector('.text-tal-display')?.textContent?.trim() ?? '';
    const premiss = yta.querySelector('p.font-display')?.textContent?.trim() ?? '';
    return { tal, premiss };
  });
}

function vakta(page, logg) {
  page.on('console', (m) => {
    if (m.type() === 'error') logg.push(`konsolfel: ${m.text().slice(0, 200)}`);
  });
  page.on('pageerror', (e) => logg.push(`sidfel: ${String(e).slice(0, 200)}`));
  page.on('response', (r) => {
    const u = r.url();
    if (r.status() >= 400 && u.startsWith(BAS)) logg.push(`${r.status()} ${u.replace(BAS, '')}`);
  });
}

const rapport = [];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const ctx = browser.defaultBrowserContext();
await ctx.overridePermissions(BAS, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);

for (const [enhet, e] of Object.entries(ENHETER)) {
  // Hubben
  {
    const logg = [];
    const p = await browser.newPage();
    vakta(p, logg);
    await p.setViewport(e.viewport);
    if (e.ua) await p.setUserAgent(e.ua);
    await p.goto(`${BAS}/rakna-ut`, { waitUntil: 'load' });
    await new Promise((r) => setTimeout(r, 800));
    await p.screenshot({ path: `${UT}/${enhet}-hubb-1-forsta-vy.png` });
    await p.screenshot({ path: `${UT}/${enhet}-hubb-2-hela.png`, fullPage: true });
    const info = await p.evaluate(() => ({
      h1: document.querySelector('h1')?.textContent?.trim(),
      kort: document.querySelectorAll('a[href^="/rakna-ut/"]').length,
      black: document.querySelectorAll('section.bg-ink-1, .bg-ink-1.rounded-xl').length,
      scrollX: document.documentElement.scrollWidth > window.innerWidth,
    }));
    rapport.push({ enhet, sida: '/rakna-ut', ...info, fel: logg });
    await p.close();
  }

  for (const slug of Object.keys(EXEMPEL)) {
    const logg = [];
    const p = await browser.newPage();
    vakta(p, logg);
    await p.setViewport(e.viewport);
    if (e.ua) await p.setUserAgent(e.ua);
    await p.evaluateOnNewDocument((mobil) => {
      if (mobil) {
        window.__delat = null;
        navigator.share = async (d) => {
          window.__delat = d;
        };
      } else {
        try {
          delete Navigator.prototype.share;
        } catch {}
        navigator.share = undefined;
      }
    }, enhet === 'pixel7');
    await p.goto(`${BAS}/rakna-ut/${slug}`, { waitUntil: 'load' });
    await new Promise((r) => setTimeout(r, 800));
    const forstaFalt = await p.evaluate(() => {
      const f = document.querySelector('section[aria-label="Dina uppgifter"]');
      const r = f?.getBoundingClientRect();
      return r ? Math.round(r.top) : null;
    });
    await p.screenshot({ path: `${UT}/${enhet}-${slug}-1-forsta-vy.png` });
    await EXEMPEL[slug](p);
    await new Promise((r) => setTimeout(r, 500));
    const fore = await resultat(p);
    const scrollX = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (scrollX) logg.push('vågrät rullning');
    await p.evaluate(() => document.querySelector('section[aria-label="Resultat"]')?.scrollIntoView({ block: 'center' }));
    await new Promise((r) => setTimeout(r, 300));
    await p.screenshot({ path: `${UT}/${enhet}-${slug}-2-ifylld.png` });
    await p.screenshot({ path: `${UT}/${enhet}-${slug}-3-hela.png`, fullPage: true });

    // Dela
    await p.click('[data-cta="rakna-dela"]');
    await new Promise((r) => setTimeout(r, 500));
    let lank;
    if (enhet === 'pixel7') {
      const delat = await p.evaluate(() => window.__delat);
      lank = delat?.url;
      if (!delat?.text) logg.push('delningen saknar text');
    } else {
      lank = await p.evaluate(() => navigator.clipboard.readText());
      const knapp = await p.$eval('[data-cta="rakna-dela"]', (b) => b.textContent);
      if (!/kopierad/i.test(knapp)) logg.push(`knappen säger inte kopierad: ${knapp}`);
    }
    if (!lank) {
      logg.push('ingen delningslänk');
      rapport.push({ enhet, sida: slug, fore, fel: logg });
      await p.close();
      continue;
    }
    await p.screenshot({ path: `${UT}/${enhet}-${slug}-4-delad.png` });

    // Den delade länken i en ny flik
    const lokal = lank.replace('https://www.jobbcoach.ai', BAS);
    const p2 = await browser.newPage();
    vakta(p2, logg);
    await p2.setViewport(e.viewport);
    if (e.ua) await p2.setUserAgent(e.ua);
    await p2.goto(lokal, { waitUntil: 'load' });
    await new Promise((r) => setTimeout(r, 800));
    const efter = await resultat(p2);
    // Serverns HTML, före hydrering: talet ska redan stå där.
    const html = await (await fetch(lokal)).text();
    const ogBild = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
    const serverTal = fore && html.includes(fore.tal.replace(/\u00a0|\u202f/g, (m) => m));
    await p2.evaluate(() => document.querySelector('section[aria-label="Resultat"]')?.scrollIntoView({ block: 'center' }));
    await p2.screenshot({ path: `${UT}/${enhet}-${slug}-5-ny-flik.png` });
    await p2.close();
    let og = null;
    if (ogBild) {
      const svar = await fetch(ogBild.replace('https://www.jobbcoach.ai', BAS));
      og = { status: svar.status, typ: svar.headers.get('content-type') };
      if (enhet === 'pixel7') fs.writeFileSync(`${UT}/og-${slug}.png`, Buffer.from(await svar.arrayBuffer()));
    } else logg.push('og:image saknas på den delade vyn');

    rapport.push({
      enhet,
      sida: slug,
      forstaFaltTop: forstaFalt,
      fore,
      efter,
      samma: JSON.stringify(fore) === JSON.stringify(efter),
      serverTal,
      lank,
      og,
      fel: logg,
    });
    await p.close();
  }
}
await browser.close();
fs.writeFileSync(`${UT}/qa-rapport.json`, JSON.stringify(rapport, null, 2));
for (const r of rapport) {
  const status = r.sida === '/rakna-ut' ? (r.fel.length || r.scrollX ? 'FEL' : 'OK') : r.samma && r.og?.status === 200 && !r.fel.length ? 'OK' : 'FEL';
  console.log(`${status.padEnd(4)} ${r.enhet.padEnd(8)} ${String(r.sida).padEnd(24)} ${r.fore ? `${r.fore.tal} | ${r.fore.premiss}` : r.h1 ?? ''} ${r.fel.length ? JSON.stringify(r.fel) : ''}`);
}
