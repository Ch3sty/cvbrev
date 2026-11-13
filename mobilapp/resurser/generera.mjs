// Genererar appikoner, startskärm och butiksbilder ur källfilerna här och
// designkonceptet (docs/design/app-koncept-2026-11-13.html).
//
//   node mobilapp/resurser/generera.mjs            (från repots rot)
//
// Kräver puppeteer i rotens node_modules och Chrome. Skriver till
// mobilapp/android/app/src/main/res och mobilapp/butik.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer';

const har = dirname(fileURLToPath(import.meta.url));
const rot = resolve(har, '..', '..');
const res = join(rot, 'mobilapp', 'android', 'app', 'src', 'main', 'res');
const butik = join(rot, 'mobilapp', 'butik');
const koncept = join(rot, 'docs', 'design', 'app-koncept-2026-11-13.html');

const svg = (namn) => readFileSync(join(har, namn), 'utf8');
const DPI = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const TYPSNITT =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400;500;600;700&display=swap">';

const webblasare = await puppeteer.launch({ headless: true });
const sida = await webblasare.newPage();
sida.setDefaultNavigationTimeout(90_000);

async function rendera(html, bredd, hojd, fil, { transparent = false } = {}) {
  await sida.setViewport({ width: bredd, height: hojd, deviceScaleFactor: 1 });
  await sida.setContent(
    `<!doctype html><html><head><meta charset="utf-8">${TYPSNITT}<style>html,body{margin:0;padding:0;background:${transparent ? 'transparent' : '#121325'};overflow:hidden}svg{display:block}</style></head><body>${html}</body></html>`,
    { waitUntil: 'load' },
  );
  await sida.evaluate(() => document.fonts.ready);
  mkdirSync(dirname(fil), { recursive: true });
  await sida.screenshot({ path: fil, omitBackground: transparent, clip: { x: 0, y: 0, width: bredd, height: hojd } });
}

const iStorlek = (s, px) => s.replace('<svg ', `<svg width="${px}" height="${px}" `);

// 1. Startikoner: vanlig (48 dp), rund, adaptiv förgrund och monokrom (108 dp).
for (const [dpi, f] of Object.entries(DPI)) {
  const mapp = join(res, `mipmap-${dpi}`);
  const p48 = Math.round(48 * f);
  const p108 = Math.round(108 * f);
  await rendera(iStorlek(svg('ikon.svg'), p48), p48, p48, join(mapp, 'ic_launcher.png'), { transparent: true });
  await rendera(
    `<div style="width:${p48}px;height:${p48}px;border-radius:50%;overflow:hidden">${iStorlek(svg('ikon-fyrkant.svg').replace('<g fill="#F4F3FA">', '<g transform="translate(48 48) scale(.8) translate(-48 -48)"><g fill="#F4F3FA">').replace('</svg>', '</g></svg>'), p48)}</div>`,
    p48, p48, join(mapp, 'ic_launcher_round.png'), { transparent: true },
  );
  await rendera(iStorlek(svg('ikon-forgrund.svg'), p108), p108, p108, join(mapp, 'ic_launcher_foreground.png'), { transparent: true });
  await rendera(iStorlek(svg('ikon-monokrom.svg'), p108), p108, p108, join(mapp, 'ic_launcher_monochrome.png'), { transparent: true });
  // Notisikonen, 24 dp vit siluett.
  const p24 = Math.round(24 * f);
  await rendera(iStorlek(svg('notis.svg'), p24), p24, p24, join(res, `drawable-${dpi}`, 'ic_stat_testklar.png'), { transparent: true });
  // Android 12+ startskärm, 288 dp.
  const p288 = Math.round(288 * f);
  await rendera(iStorlek(svg('startskarm-ikon.svg'), p288), p288, p288, join(res, `drawable-${dpi}`, 'splash_ikon.png'), { transparent: true });
}

// 2. Startskärmen före Android 12 (Capacitors splash.png): märket på nattens gradient.
const NATT_GRADIENT = 'radial-gradient(120% 70% at 50% -10%,#1B1D38 0%,#121325 55%,#0B0C19 100%)';
const LEGACY = {
  'drawable': [480, 320],
  'drawable-port-mdpi': [320, 480], 'drawable-port-hdpi': [480, 800], 'drawable-port-xhdpi': [720, 1280],
  'drawable-port-xxhdpi': [960, 1600], 'drawable-port-xxxhdpi': [1280, 1920],
  'drawable-land-mdpi': [480, 320], 'drawable-land-hdpi': [800, 480], 'drawable-land-xhdpi': [1280, 720],
  'drawable-land-xxhdpi': [1600, 960], 'drawable-land-xxxhdpi': [1920, 1280],
};
for (const [mapp, [b, h]] of Object.entries(LEGACY)) {
  const ikon = Math.round(Math.min(b, h) * 0.26);
  await rendera(
    `<div style="width:${b}px;height:${h}px;background:${NATT_GRADIENT};display:grid;place-items:center">${iStorlek(svg('ikon.svg'), ikon)}</div>`,
    b, h, join(res, mapp, 'splash.png'),
  );
}

// 3. Butiken: Play-ikonen 512 (fyrkantig, Play rundar själv) och featuregrafiken 1024 x 500.
mkdirSync(butik, { recursive: true });
await rendera(iStorlek(svg('ikon-fyrkant.svg'), 512), 512, 512, join(butik, 'ikon-512.png'));
const ORDMARKE = (px, farg = '#F4F3FA', punkt = '#E8732A') =>
  `<span style="font-family:'Bricolage Grotesque';font-variation-settings:'opsz' 48;font-weight:800;letter-spacing:-.035em;font-size:${px}px;line-height:1;color:${farg};display:inline-flex;align-items:baseline">Testklar<i style="display:inline-block;width:.3em;height:.3em;border-radius:.08em;background:${punkt};margin-left:.1em"></i></span>`;
await rendera(
  `<div style="width:1024px;height:500px;background:${NATT_GRADIENT};display:flex;align-items:center;gap:56px;padding:0 88px;box-sizing:border-box;font-family:Figtree">
     ${iStorlek(svg('ikon.svg'), 216)}
     <div style="display:grid;gap:18px">
       ${ORDMARKE(104)}
       <div style="font-family:'Bricolage Grotesque';font-weight:700;font-size:34px;line-height:40px;letter-spacing:-.02em;color:#F4F3FA">Öva rekryteringstest,<br>ett pass om dagen.</div>
       <div style="font-size:20px;font-weight:500;color:#A9ACC9">från jobbcoach.ai</div>
     </div>
   </div>`,
  1024, 500, join(butik, 'featuregrafik-1024x500.png'),
);

// 4. Fyra telefonbilder 1080 x 1920 ur konceptets butiksbilder.
await sida.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 3 });
await sida.goto(pathToFileURL(koncept).href, { waitUntil: 'load' });
await sida.evaluate(() => document.fonts.ready);
await sida.addStyleTag({
  content: `.butik{display:block!important}
    .skarmbild{width:360px!important;height:640px!important;max-width:none!important;border-radius:0!important;aspect-ratio:auto!important;margin:0 0 40px 0}`,
});
await new Promise((r) => setTimeout(r, 800));
// Inga testutgivares varumärken i butiksbilderna (samma regel som för
// butikstexten, se butik/butikstexter.md): konceptets exempel byts mot
// neutrala ord innan bilderna tas.
await sida.evaluate(() => {
  const byten = [
    [/Samma format som Matrigma/g, 'Samma format som provet'],
    [/Mitt test: Matrigma/g, 'Mitt test: Figurmatriser'],
    [/Nivån, Matrigma/gi, 'Nivån, figurer'],
    [/Matrigma/g, 'figurprovet'],
  ];
  const vandrare = document.createTreeWalker(document.querySelector('.butik'), NodeFilter.SHOW_TEXT);
  for (let n = vandrare.nextNode(); n; n = vandrare.nextNode()) {
    for (const [monster, ersattning] of byten) n.nodeValue = n.nodeValue.replace(monster, ersattning);
  }
});
const bilder = await sida.$$('.butik .skarmbild');
for (const [i, el] of bilder.entries()) {
  await el.scrollIntoView();
  await new Promise((r) => setTimeout(r, 300));
  await el.screenshot({ path: join(butik, `telefon-${i + 1}-1080x1920.png`) });
}

await webblasare.close();
console.log('Klart:', existsSync(join(butik, 'telefon-4-1080x1920.png')) ? '4 telefonbilder' : 'telefonbilder saknas');
