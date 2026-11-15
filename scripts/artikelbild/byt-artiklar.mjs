// scripts/artikelbild/byt-artiklar.mjs
// =============================================================================
// Byter artikelbilden i artiklarna till <slug>-v2.webp (koncept-artikelbilder
// avsnitt 6): frontmatter image och imageAlt, och den första <CustomImage> i
// texten (src och alt) när den pekar på den gamla bilden. Inget annat i filen
// rörs (byte för byte, radslut bevaras). Gamla bildfiler ligger kvar.
//
// Skriver också SEO-diffens undantag för bytet:
// scripts/seo-baslinje/artikelbilder-v2-<datum>-undantag.json (BILD_BYTT).
//
// Kör: node scripts/artikelbild/byt-artiklar.mjs <slug> [...]   eller   --alla
//      (bara slugs med underlag och en färdig webp i public/images/artiklar/)
// =============================================================================

import fs from 'node:fs';

const DATUM = process.env.BILD_DATUM || new Date().toISOString().slice(0, 10);
const UNDANTAG = `scripts/seo-baslinje/artikelbilder-v2-${DATUM}-undantag.json`;
const args = process.argv.slice(2);
const UNDERLAG = 'docs/qa/artikelbilder/underlag/';
const slugs = args.includes('--alla')
  ? fs.readdirSync(UNDERLAG).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''))
  : args.filter((a) => !a.startsWith('--'));

const undantag = fs.existsSync(UNDANTAG)
  ? JSON.parse(fs.readFileSync(UNDANTAG, 'utf8'))
  : { _om: 'Artikelbilderna "På bordet" (docs/design/koncept-artikelbilder-2026-11-14.md, avsnitt 6). Bara og:image, bildens adress i JSON-LD, första bildens src och alt, och robots med max-image-preview:large får ändras. Skrivs av scripts/artikelbild/byt-artiklar.mjs.', BILD_BYTT: [] };

const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
let andrade = 0;
const hoppade = [];
for (const slug of slugs) {
  const ny = `/images/artiklar/${slug}-v2.webp`;
  if (!fs.existsSync(`public${ny}`)) { hoppade.push(`${slug}: ingen ${ny}`); continue; }
  const u = JSON.parse(fs.readFileSync(`${UNDERLAG}${slug}.json`, 'utf8'));
  const alt = u.alt;
  if (!alt || /"/.test(alt)) { hoppade.push(`${slug}: alt saknas eller har citattecken`); continue; }
  const fil = `content/artiklar/${slug}.mdx`;
  const raw = fs.readFileSync(fil, 'utf8');
  const nl = raw.includes('\r\n') ? '\r\n' : '\n';
  const slut = raw.indexOf(`${nl}---`, 3);
  let fm = raw.slice(0, slut);
  let text = raw.slice(slut);
  // Raden kan ha en kommentar efter värdet ("# Antaget bildnamn"); den följer inte med.
  const m = fm.match(/^image:\s*"([^"]*)"[^\r\n]*$/m) || fm.match(/^image:\s*'([^']*)'\s*$/m) || fm.match(/^image:\s*(\S+)\s*$/m);
  if (!m) { hoppade.push(`${slug}: ingen image i frontmatter`); continue; }
  const gammal = m[1];
  fm = fm.replace(m[0], `image: "${ny}"`);
  if (/^imageAlt:.*$/m.test(fm)) fm = fm.replace(/^imageAlt:.*$/m, `imageAlt: "${alt}"`);
  else fm = fm.replace(`image: "${ny}"`, `image: "${ny}"${nl}imageAlt: "${alt}"`);
  // Första CustomImage som pekar på den gamla bilden: ny src och alt, resten av taggen orörd.
  const tagg = text.match(/<CustomImage\b[^>]*?\/>/);
  let forsta = false;
  if (tagg && tagg[0].includes(`src="${gammal}"`)) {
    let t = tagg[0].replace(`src="${gammal}"`, `src="${ny}"`);
    t = /\balt="[^"]*"/.test(t) ? t.replace(/\balt="[^"]*"/, `alt="${attr(alt)}"`) : t.replace('<CustomImage', `<CustomImage alt="${attr(alt)}"`);
    text = text.replace(tagg[0], t);
    forsta = true;
  }
  const ut = fm + text;
  if (ut !== raw) { fs.writeFileSync(fil, ut); andrade++; }
  const post = { path: `/artiklar/${slug}`, gammal, ny, datum: DATUM, skal: `Artikelbilden "På bordet" (ägarbeslut 2026-11-15, alla bilder i ett svep). ${forsta ? 'Första CustomImage pekar på den nya bilden med ny alt.' : 'Bilden står bara i frontmatter.'}` };
  const i = undantag.BILD_BYTT.findIndex((b) => b.path === post.path);
  // Körs skriptet igen efter bytet står gammal redan som ny: behåll den ursprungliga.
  if (i >= 0) undantag.BILD_BYTT[i] = { ...post, gammal: undantag.BILD_BYTT[i].gammal };
  else if (gammal !== ny) undantag.BILD_BYTT.push(post);
}
undantag.BILD_BYTT.sort((a, b) => a.path.localeCompare(b.path));
fs.writeFileSync(UNDANTAG, JSON.stringify(undantag, null, 1) + '\n');
console.log(`${andrade} artiklar ändrade, ${undantag.BILD_BYTT.length} i ${UNDANTAG}`);
for (const h of hoppade) console.log(`  hoppade över ${h}`);
