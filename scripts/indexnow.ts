/**
 * Skickar URL:er till IndexNow (Bing, Yandex, Seznam, Naver m.fl. delar samma
 * inlämning). Google använder inte IndexNow; där gäller Search Console.
 *
 * Nyckeln ligger som statisk fil i public/ och måste vara deployad innan
 * skriptet körs på riktigt, annars avvisar api.indexnow.org inlämningen
 * (403/422). Kontrollera först att filen svarar:
 *
 *   curl https://www.jobbcoach.ai/694cf2196d567fa655d85d26754a6eea.txt
 *
 * Kör sedan, efter deploy:
 *
 *   npx tsx scripts/indexnow.ts                      # alla URL:er i sajtkartan
 *   npx tsx scripts/indexnow.ts --dry-run            # listar bara, skickar inget
 *   npx tsx scripts/indexnow.ts https://www.jobbcoach.ai/artiklar/logiska-tester https://www.jobbcoach.ai/verktyg/rekryteringstester
 *
 * Utan URL-argument läses https://jobbcoach.ai/sitemap.xml (följer
 * omdirigeringen till www). Bara URL:er på www.jobbcoach.ai skickas, eftersom
 * IndexNow kräver att alla URL:er hör till host. Protokollet tar högst
 * 10 000 URL:er per anrop, så större listor delas upp.
 *
 * Svarskoder: 200 = mottaget, 202 = mottaget men nyckeln valideras ännu,
 * 400 = felaktigt anrop, 403 = nyckeln hittades inte på keyLocation,
 * 422 = URL:er hör inte till host, 429 = för många anrop.
 */

const HOST = 'www.jobbcoach.ai';
const KEY = '694cf2196d567fa655d85d26754a6eea';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP = 'https://jobbcoach.ai/sitemap.xml';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_PER_ANROP = 10000;

async function lasSajtkartan(): Promise<string[]> {
  const res = await fetch(SITEMAP, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Sajtkartan svarade ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const argUrls = args.filter((a) => !a.startsWith('--'));

  const kallor = argUrls.length ? argUrls : await lasSajtkartan();
  const urls = [...new Set(kallor)].filter((u) => {
    try {
      return new URL(u).host === HOST;
    } catch {
      return false;
    }
  });
  const bortfiltrerade = kallor.length - urls.length;

  console.log(`${urls.length} URL:er${bortfiltrerade ? ` (${bortfiltrerade} dubbletter eller annan host bortfiltrerade)` : ''}`);

  if (dryRun) {
    for (const u of urls) console.log(u);
    console.log(`\nTorrkörning: inget skickat. host=${HOST} keyLocation=${KEY_LOCATION}`);
    return;
  }

  if (!urls.length) {
    console.log('Inget att skicka.');
    return;
  }

  for (let i = 0; i < urls.length; i += MAX_PER_ANROP) {
    const urlList = urls.slice(i, i + MAX_PER_ANROP);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
    });
    const text = await res.text();
    console.log(`Anrop ${i / MAX_PER_ANROP + 1}: ${urlList.length} URL:er, svar ${res.status}${text ? ` ${text}` : ''}`);
    if (res.status >= 400) process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
