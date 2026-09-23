/**
 * SEO-spärren för den visuella linjen (docs/design/analys-artiklar-2026-09-23.html,
 * avsnitt 3, punkt 9).
 *
 * Tar ett avtryck av allt Google läser på de 20 mest klickade artiklarna i
 * Search Console plus de publika ytor som ritas om (startsidan, listan,
 * verktygssidorna, Funktioner, Om oss, Priser), och jämför två avtryck.
 *
 *   npx tsx scripts/seo-diff-artiklar.ts ta --port 8300 --ut docs/qa/seo-diff/fore.json
 *   npx tsx scripts/seo-diff-artiklar.ts jamfor --fore docs/qa/seo-diff/fore.json --efter docs/qa/seo-diff/efter.json
 *
 * Per sida: h1, title, meta description, canonical, h2 och h3 med id, alla
 * interna länkar, alla JSON-LD-block (dateModified sätts vid bygge och
 * nollas), och första bilden i innehållet (src och alt).
 *
 * Länkarna delas i innehåll och ram. Ramen är den publika headern och
 * footern, som ritas om enligt analysen 22 september och därför får ändras;
 * deras skillnader skrivs ut men fäller inte grinden. I innehållet får inga
 * länkar försvinna. Nya länkar (ett paket i tillägg) redovisas men är
 * tillåtna.
 *
 * Rubriker i reklamkorten får försvinna ur rubrikträdet (spärrlistan punkt 3:
 * reklamkortens rubriker ska inte vara h2/h3). De listas i TILLATNA_RUBRIKER.
 *
 * Grinden: exit 1 om något utanför de tillåtna skillnaderna ändrats.
 */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

type Rubrik = { tag: string; id: string; text: string };

interface Avtryck {
  path: string;
  status: number;
  h1: string[];
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  robots: string;
  rubriker: Rubrik[];
  lankar: string[];
  ramLankar: string[];
  jsonLd: string[];
  forstaBild: { src: string; alt: string } | null;
}

function arg(namn: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf('--' + namn);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

/** Fast lista om GSC-urvalet saknas: topp 20 artiklar 23 september. */
const FAST_TOPP20 = [
  'logiska-tester',
  'styrkor-svagheter-intervju',
  'kompetensbaserad-intervju-star-metoden',
  'motivationsbrev-exempel',
  'kompetensbaserade-intervjufragor',
  'angest-infor-nytt-jobb',
  'hur-ofta-byta-jobb',
  'ljuga-i-cv',
  'personligt-brev-butik',
  'rotation-test-guide',
  'arbetsgivarintyg-tjanstgoringsbetyg',
  'numeriskt-test-guide',
  'personlighetstest-jobb-guide',
  'personligt-brev-kompetenser-egenskaper',
  'soka-jobb-via-mail',
  'ats-vanligt-cv',
  'personligt-brev-avslutning-exempel',
  'personligt-brev-folkhogskola',
  'cover-letter-sverige',
  'cv-exempel-student-nyexaminerad',
].map((s) => `/artiklar/${s}`);

/** Publika ytor som ritas om i samma omgång. h1, title och description får inte ändras. */
const OVRIGA = [
  '/',
  '/artiklar',
  '/artiklar?tag=cv',
  '/funktioner',
  '/om-oss',
  '/priser',
  '/verktyg/cv-analys',
  '/verktyg/cv-mallar',
  '/verktyg/skapa-cv',
  '/verktyg/personligt-brev',
  '/verktyg/jobbmatchning',
  '/verktyg/jobbcoachen',
  '/verktyg/rekryteringstester',
  '/verktyg/linkedin-optimering',
  '/verktyg/bli-upptackt',
  // Artiklar med showcase (CV-kluster), så att showcasens byte också prövas.
  '/artiklar/cv-mall-gratis-guide',
  '/artiklar/bra-cv-guide',
];

/**
 * Rubriker som satt i reklamkort och ramkomponenter och som enligt
 * spärrlistan punkt 3 ska ut ur rubrikträdet. Matchas som början av texten.
 */
const TILLATNA_RUBRIKER = [
  'Välj spåret du söker på',
  'Profil',
  'Hittade du inte vad du sökte?',
  'Relaterade artiklar',
  'Innehållsförteckning',
  'Mallar som ökar dina chanser',
  'Sidfot',
  // ArticleClusterCTA och ClusterFinalCTA före linjen (inline h3, slutkort h2).
  'Gör testet innan arbetsgivaren gör det',
  'Träna svaret innan du sitter i rummet',
  'Skriv ditt brev på fem minuter',
  'Bygg CV:t på en av våra mallar',
];

/**
 * h1 som satt i showcasens statiska reserv (exempelpersonens namn i ett
 * h1 inuti brödtexten). De är inte artikelns rubrik och får försvinna.
 */
const TILLATNA_H1 = ['Erik Lindberg', 'Maria Johansson'];

function sidor(): string[] {
  const urvalFil = 'scripts/.publikt-urval.json';
  let artiklar = FAST_TOPP20;
  if (fs.existsSync(urvalFil)) {
    const data = JSON.parse(fs.readFileSync(urvalFil, 'utf8')) as {
      urval: Array<{ path: string }>;
    };
    const unika = [...new Set(data.urval.map((r) => r.path.split('#')[0]))].filter((p) =>
      p.startsWith('/artiklar/')
    );
    if (unika.length >= 20) artiklar = unika.slice(0, 20);
  }
  return [...new Set([...artiklar, ...OVRIGA])];
}

function normHref(href: string): string | null {
  if (!href) return null;
  let h = href.trim();
  if (h.startsWith('https://www.jobbcoach.ai')) h = h.slice('https://www.jobbcoach.ai'.length) || '/';
  if (h.startsWith('http') || h.startsWith('mailto:') || h.startsWith('tel:')) return null;
  if (!h.startsWith('/') && !h.startsWith('#') && !h.startsWith('?')) return null;
  // Inloggning och registrering är handlingar, inte länkmål för sökmotorer.
  if (/^\/(login|register|registrera)(\?|$)/.test(h)) return null;
  return h;
}

function normBild(src: string): string {
  if (src.startsWith('/_next/image')) {
    const u = new URL('http://x' + src);
    return decodeURIComponent(u.searchParams.get('url') ?? src);
  }
  return src;
}

/** Stabil JSON: sorterade nycklar, dateModified nollad. */
function stabil(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(stabil);
  if (v && typeof v === 'object') {
    const ut: Record<string, unknown> = {};
    for (const k of Object.keys(v as object).sort()) {
      if (k === 'dateModified') continue;
      ut[k] = stabil((v as Record<string, unknown>)[k]);
    }
    return ut;
  }
  return v;
}

function iRam(el: Element): boolean {
  if (el.closest('[data-site-chrome]')) return true;
  // Före ombyggnaden: headern var LandingNavbar (sticky top-0 z-50) och
  // footern det sista footer-elementet med "Sidfot".
  const header = el.closest('header');
  if (header && /\bsticky\b/.test(header.className) && /\btop-0\b/.test(header.className) && /\bz-50\b/.test(header.className)) {
    return true;
  }
  const footer = el.closest('footer');
  if (footer && footer.querySelector('#footer-heading')) return true;
  return false;
}

function text(el: Element): string {
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
}

async function ta(bas: string, sida: string): Promise<Avtryck> {
  const svar = await fetch(bas + sida, { redirect: 'manual' });
  const html = await svar.text();
  const doc = new JSDOM(html).window.document;
  const meta = (sel: string) => doc.querySelector(sel)?.getAttribute('content') ?? '';

  const rubriker: Rubrik[] = [];
  doc.querySelectorAll('h2, h3').forEach((h) => {
    if (iRam(h)) return;
    rubriker.push({ tag: h.tagName.toLowerCase(), id: h.id, text: text(h) });
  });

  const lankar: string[] = [];
  const ramLankar: string[] = [];
  doc.querySelectorAll('a[href]').forEach((a) => {
    const h = normHref(a.getAttribute('href') ?? '');
    if (!h) return;
    (iRam(a) ? ramLankar : lankar).push(h);
  });

  const jsonLd: string[] = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      jsonLd.push(JSON.stringify(stabil(JSON.parse(s.textContent ?? ''))));
    } catch {
      jsonLd.push('OGILTIG: ' + (s.textContent ?? '').slice(0, 80));
    }
  });

  let forstaBild: Avtryck['forstaBild'] = null;
  for (const img of Array.from(doc.querySelectorAll('img'))) {
    if (iRam(img)) continue;
    const src = img.getAttribute('src') ?? '';
    if (!src || src.startsWith('data:')) continue;
    forstaBild = { src: normBild(src), alt: img.getAttribute('alt') ?? '' };
    break;
  }

  return {
    path: sida,
    status: svar.status,
    h1: Array.from(doc.querySelectorAll('h1')).map(text),
    title: text(doc.querySelector('title') ?? doc.createElement('title')),
    description: meta('meta[name="description"]'),
    canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
    ogImage: meta('meta[property="og:image"]'),
    robots: meta('meta[name="robots"]'),
    rubriker,
    lankar: lankar.sort(),
    ramLankar: [...new Set(ramLankar)].sort(),
    jsonLd: jsonLd.sort(),
    forstaBild,
  };
}

function multisetSkillnad(a: string[], b: string[]): { borta: string[]; nya: string[] } {
  const rakna = (l: string[]) => l.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<string, number>());
  const ma = rakna(a);
  const mb = rakna(b);
  const borta: string[] = [];
  const nya: string[] = [];
  for (const [k, n] of ma) {
    const d = n - (mb.get(k) ?? 0);
    if (d > 0) borta.push(d > 1 ? `${k} (×${d})` : k);
  }
  for (const [k, n] of mb) {
    const d = n - (ma.get(k) ?? 0);
    if (d > 0) nya.push(d > 1 ? `${k} (×${d})` : k);
  }
  return { borta, nya };
}

function unikSkillnad(a: string[], b: string[]): { borta: string[]; nya: string[] } {
  const sa = new Set(a);
  const sb = new Set(b);
  return { borta: [...sa].filter((x) => !sb.has(x)), nya: [...sb].filter((x) => !sa.has(x)) };
}

function jamfor(foreRa: Avtryck[], efterRa: Avtryck[]): { rapport: string; fel: number } {
  // Samma filter som vid avtrycket, så att äldre avtryck jämförs på samma villkor.
  const rensa = (a: Avtryck): Avtryck => ({
    ...a,
    lankar: a.lankar.filter((l) => normHref(l) !== null),
    ramLankar: a.ramLankar.filter((l) => normHref(l) !== null),
  });
  const fore = foreRa.map(rensa);
  const efter = efterRa.map(rensa);
  const rader: string[] = [];
  let fel = 0;
  const efterMap = new Map(efter.map((e) => [e.path, e]));
  for (const f of fore) {
    const e = efterMap.get(f.path);
    const sidrader: string[] = [];
    const brott = (s: string) => {
      fel++;
      sidrader.push(`- FEL: ${s}`);
    };
    const info = (s: string) => sidrader.push(`- ok: ${s}`);
    if (!e) {
      brott('sidan saknas i efter-avtrycket');
    } else {
      if (f.status !== e.status) brott(`status ${f.status} → ${e.status}`);
      for (const falt of ['title', 'description', 'canonical', 'ogImage', 'robots'] as const) {
        if (f[falt] !== e[falt]) brott(`${falt}: "${f[falt]}" → "${e[falt]}"`);
      }
      const h1f = f.h1.filter((h) => !TILLATNA_H1.includes(h));
      const h1e = e.h1.filter((h) => !TILLATNA_H1.includes(h));
      if (h1f.length !== f.h1.length) info(`showcasens h1 ut: ${JSON.stringify(f.h1.filter((h) => TILLATNA_H1.includes(h)))}`);
      if (JSON.stringify(h1f) !== JSON.stringify(h1e)) {
        brott(`h1: ${JSON.stringify(f.h1)} → ${JSON.stringify(e.h1)}`);
      }
      // Rubriker: samma ordning och id, utom tillåtna reklamkortsrubriker.
      const tillaten = (r: Rubrik) =>
        TILLATNA_RUBRIKER.some((t) => (t.length <= 8 ? r.text === t : r.text.startsWith(t)));
      const fr = f.rubriker.filter((r) => !tillaten(r)).map((r) => `${r.tag}#${r.id} ${r.text}`);
      const er = e.rubriker.filter((r) => !tillaten(r)).map((r) => `${r.tag}#${r.id} ${r.text}`);
      if (f.path.startsWith('/artiklar/')) {
        if (JSON.stringify(fr) !== JSON.stringify(er)) {
          const d = multisetSkillnad(fr, er);
          brott(
            `rubrikträdet ändrat. Borta: ${JSON.stringify(d.borta)} Nya: ${JSON.stringify(d.nya)}` +
              (d.borta.length === 0 && d.nya.length === 0 ? ' (ordningen)' : '')
          );
        }
      } else {
        // Omritade publika ytor: sektionsrubriker får skrivas om, men redovisas.
        const d = multisetSkillnad(fr, er);
        if (d.borta.length || d.nya.length) {
          info(`sektionsrubriker ändrade (omritad yta, tillåtet): borta ${d.borta.length}, nya ${d.nya.length}`);
        }
      }
      const borttagnaRubriker = f.rubriker.filter(tillaten).map((r) => r.text);
      if (borttagnaRubriker.length) {
        const kvar = e.rubriker.filter(tillaten).map((r) => r.text);
        const d = multisetSkillnad(borttagnaRubriker, kvar);
        if (d.borta.length) info(`reklamkortsrubriker ut ur rubrikträdet: ${JSON.stringify(d.borta)}`);
      }
      // Länkar i innehållet: ingen unik länk får försvinna.
      const dl = unikSkillnad(f.lankar, e.lankar);
      if (f.path.startsWith('/artiklar/') || f.path.startsWith('/artiklar')) {
        if (dl.borta.length) brott(`interna länkar borta ur innehållet: ${JSON.stringify(dl.borta)}`);
      } else if (dl.borta.length) {
        // Omritade publika ytor: länkar i innehållet ska finnas kvar någonstans på sidan.
        const allaEfter = new Set([...e.lankar, ...e.ramLankar]);
        const helt = dl.borta.filter((l) => !allaEfter.has(l));
        if (helt.length) brott(`interna länkar borta från sidan: ${JSON.stringify(helt)}`);
        const flyttade = dl.borta.filter((l) => allaEfter.has(l));
        if (flyttade.length) info(`länkar flyttade till ramen: ${JSON.stringify(flyttade)}`);
      }
      if (dl.nya.length) info(`nya interna länkar i innehållet: ${JSON.stringify(dl.nya)}`);
      const dr = unikSkillnad(f.ramLankar, e.ramLankar);
      if (dr.borta.length || dr.nya.length) {
        info(`ramen (header och footer, omritad enligt analysen): borta ${JSON.stringify(dr.borta)}, nya ${JSON.stringify(dr.nya)}`);
      }
      const dj = multisetSkillnad(f.jsonLd, e.jsonLd);
      if (dj.borta.length || dj.nya.length) {
        brott(`JSON-LD ändrad: ${dj.borta.length} block borta, ${dj.nya.length} nya\n    före: ${dj.borta.map((s) => s.slice(0, 300)).join('\n    före: ')}\n    efter: ${dj.nya.map((s) => s.slice(0, 300)).join('\n    efter: ')}`);
      }
      if (f.path.startsWith('/artiklar/') && JSON.stringify(f.forstaBild) !== JSON.stringify(e.forstaBild)) {
        brott(`första bilden: ${JSON.stringify(f.forstaBild)} → ${JSON.stringify(e.forstaBild)}`);
      }
    }
    rader.push(`### ${f.path}`);
    rader.push(sidrader.length ? sidrader.join('\n') : '- oförändrad');
    rader.push('');
  }
  return { rapport: rader.join('\n'), fel };
}

async function main() {
  const lage = process.argv[2];
  if (lage === 'ta') {
    const bas = `http://localhost:${arg('port', '8300')}`;
    const ut = arg('ut', 'docs/qa/seo-diff/avtryck.json')!;
    const lista = arg('sidor')?.split(',') ?? sidor();
    const avtryck: Avtryck[] = [];
    for (const s of lista) {
      const a = await ta(bas, s);
      avtryck.push(a);
      console.log(
        `${String(a.status).padEnd(4)} ${s.padEnd(52)} h2/h3 ${String(a.rubriker.length).padStart(3)}  länkar ${String(a.lankar.length).padStart(3)}  ram ${String(a.ramLankar.length).padStart(3)}  ld ${a.jsonLd.length}`
      );
    }
    fs.mkdirSync(path.dirname(ut), { recursive: true });
    fs.writeFileSync(ut, JSON.stringify(avtryck, null, 2));
    console.log(`\nSparat: ${ut} (${avtryck.length} sidor)`);
    return;
  }
  if (lage === 'jamfor') {
    const fore = JSON.parse(fs.readFileSync(arg('fore')!, 'utf8')) as Avtryck[];
    const efter = JSON.parse(fs.readFileSync(arg('efter')!, 'utf8')) as Avtryck[];
    const { rapport, fel } = jamfor(fore, efter);
    const ut = arg('rapport', 'docs/qa/seo-diff/diff.md')!;
    const huvud = `# SEO-diff\n\nFöre: ${arg('fore')}  \nEfter: ${arg('efter')}  \nSidor: ${fore.length}  \nFel: ${fel}\n\n`;
    fs.mkdirSync(path.dirname(ut), { recursive: true });
    fs.writeFileSync(ut, huvud + rapport);
    console.log(huvud + rapport);
    process.exit(fel ? 1 : 0);
  }
  console.log('Användning: ta --port 8300 --ut fil.json | jamfor --fore a.json --efter b.json');
  process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
