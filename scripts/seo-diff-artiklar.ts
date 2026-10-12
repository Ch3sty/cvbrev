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
 *   npx tsx scripts/seo-diff-artiklar.ts ta --bas https://www.jobbcoach.ai --ut docs/qa/seo-diff/publikt-v2-fore.json
 *
 * Publikt v2 (spec del A avsnitt 8): --bas tar avtrycket mot en annan värd än
 * localhost, avtrycket bär FAQ-frågorna och ordantalet i main, och sidorna i
 * PUBLIKT_V2 har den hårda regeln (rubriker med text och nivå, FAQ, ord).
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
import matter from 'gray-matter';

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
  /** FAQ-frågorna: summary-texterna i innehållet och FAQPage.mainEntity[].name (publikt v2, del A 8.2). */
  faq?: string[];
  /** Antal ord i main utom ramen, efter att skript, stil och aria-hidden tagits bort (del B 4.2). */
  ord?: number;
}

/**
 * Publikt v2 (docs/design/spec-publikt-v2-del-a-2026-10-12.md, avsnitt 8):
 * på de här sidorna gäller den hårda regeln. Varje h2 och h3 ska finnas kvar
 * med samma text och nivå (ordning och id får ändras), varje FAQ-fråga ska
 * finnas kvar och ordantalet i main får inte sjunka mer än 2 procent.
 */
const PUBLIKT_V2 = new Set([
  '/',
  '/priser',
  '/funktioner',
  '/verktyg/rekryteringstester',
  '/verktyg/personligt-brev',
  '/verktyg/jobbmatchning',
  '/verktyg/cv-analys',
  '/verktyg/skapa-cv',
  '/verktyg/cv-mallar',
  '/verktyg/linkedin-optimering',
  '/verktyg/bli-upptackt',
  '/verktyg/jobbcoachen',
  '/verktyg/personlighetstest',
]);

/**
 * Publikt v2 del B (docs/design/spec-publikt-v2-del-b-2026-10-12.md, avsnitt 4):
 * innehållssidorna. Samma hårda regel som del A (rubriker med text och nivå,
 * FAQ, ord), och artiklarna dessutom med rubrikträdets ordning och id.
 */
function delB(sida: string): boolean {
  return (
    sida.startsWith('/artiklar') ||
    sida.startsWith('/cv-exempel') ||
    sida.startsWith('/personligt-brev-exempel') ||
    sida.startsWith('/rakna-ut') ||
    ['/om-oss', '/for-rekryterare', '/kontakt', '/hjalpcenter', '/integritetspolicy', '/anvandarvillkor'].includes(sida)
  );
}

function hard(sida: string): boolean {
  return PUBLIKT_V2.has(sida) || delB(sida);
}

/** Största tillåtna minskningen av ordantalet i main, i procent. */
const ORD_TOLERANS = 2;

/**
 * Tillåtna skillnader i JSON-LD per sida (del A 8.2 punkt 6), med datum och
 * skäl. nya: nya block får tillkomma. andrade: block av de här typerna får
 * ändra innehåll, men typerna ska vara desamma före och efter.
 */
const LD_UNDANTAG: Array<{ path: string; datum: string; skal: string; nya?: boolean; andrade?: string[] }> = [
  {
    path: '/',
    datum: '2026-10-12',
    skal: 'Publikt v2 våg 2: startsidan får Organization, WebSite och FAQPage (del A 5.1). Live saknar JSON-LD.',
    nya: true,
  },
  {
    path: '/verktyg/rekryteringstester',
    datum: '2026-10-12',
    skal:
      'Ägarbeslut 1 i del A avsnitt 10: FAQ-svaren om verbalt och numeriskt läser testConfigs tal för träningspassen och nämner övningsprovet separat. Frågetexterna är oförändrade.',
    andrade: ['FAQPage', 'HowTo', 'WebApplication'],
  },
  {
    path: '/priser',
    datum: '2026-10-12',
    skal: 'SEO-granskningen våg 1–3, punkt 3: Nivåkollen skrivs som produktnamn i FAQ-svaret om att börja gratis. Frågorna oförändrade.',
    andrade: ['FAQPage'],
  },
  {
    path: '/verktyg/jobbmatchning',
    datum: '2026-10-12',
    skal: 'Publikt v2 våg 4 (del A 5.5): FAQ-svaren läser FREE_TIER_JOB_LIMIT och JOB_MATCHES_PER_RUN, och "feed" blir "lista". Frågorna oförändrade.',
    andrade: ['FAQPage'],
  },
  {
    path: '/funktioner',
    datum: '2026-10-12',
    skal: 'Ägarbeslut 8 i del A avsnitt 10: /funktioner får FAQPage ur samma fem frågor som syns på sidan.',
    nya: true,
  },
];

/**
 * Rubriker som fått ny text efter ägarbeslut. Den gamla får försvinna bara
 * om den nya finns på samma nivå i efter-avtrycket.
 */
const RUBRIK_BYTT: Array<{ path: string; fore: string; efter: string; datum: string; skal: string }> = [
  {
    path: '/verktyg/personligt-brev',
    fore: 'h2 7 mallar, en för varje bransch',
    efter: 'h2 7 mallar för personliga brev',
    datum: '2026-10-12',
    skal: 'Ägarbeslut 2026-10-12, sakfel: mallarna är inte en per bransch. Ordet mallar står kvar och rubriken bär sökordet.',
  },
  {
    path: '/for-rekryterare',
    fore: 'h2 Från sökning till anställning',
    efter: 'h2 Så funkar det, steg för steg',
    datum: '2026-10-12',
    skal: 'Ägarbeslut 4 i del B: H2 "Från sökning till anställning" stod två gånger. Den första står kvar, den andra får en egen rubrik.',
  },
  {
    path: '/for-rekryterare',
    fore: 'h3 Dela med din hiring manager',
    efter: 'h3 Dela med din rekryterande chef',
    datum: '2026-10-12',
    skal: 'Ägarbeslut 9 i del B: svenska facktermer, "hiring manager" blir "rekryterande chef".',
  },
];

/**
 * Rubriker som får försvinna utan ersättare (en dubblett), med datum och skäl.
 * Matchas som "nivå text" och tar bort en förekomst.
 */
const RUBRIK_BORTA: Array<{ path: string; rubrik: string; datum: string; skal: string }> = [
  {
    path: '/kontakt',
    rubrik: 'h2 Skicka ett meddelande',
    datum: '2026-10-12',
    skal: 'Del B 4.4 och ägarbeslut 10: formulärets H2 stod två gånger. En står kvar.',
  },
];

/** H1 som fått ny text efter ägarbeslut. */
const H1_BYTT: Array<{ path: string; fore: string; efter: string; datum: string; skal: string }> = [
  {
    path: '/kontakt',
    fore: 'Vi svarar på dina frågorKontakta oss',
    efter: 'Vi svarar på dina frågor',
    datum: '2026-10-12',
    skal: 'Del B 3.8: kickern "Kontakta oss" låg inne i h1 utan mellanrum. Den första delen står kvar som h1, kickern flyttar ut.',
  },
];

/** Title och description som får bytas (sidan hade startsidans metadata). */
const META_BYTT: Array<{ path: string; falt: 'title' | 'description'; datum: string; skal: string }> = (
  ['/kontakt', '/hjalpcenter'] as const
).flatMap((p) =>
  (['title', 'description'] as const).map((falt) => ({
    path: p,
    falt,
    datum: '2026-10-12',
    skal: 'Ägarbeslut 10 i del B: sidan ärvde startsidans title och description och får egna.',
  }))
).concat([
  {
    path: '/funktioner',
    falt: 'description',
    datum: '2026-10-12',
    skal: 'Ägarkrav korrekta termer (SEO-granskningen av del A): "Åtta verktyg" stämde inte, nu "Alla verktyg för jobbsöket:" med rekryteringstester först.',
  },
]);

const TERMER = 'ägarkrav korrekta termer';

/** FAQ-frågor som fått ny text (synligt och i FAQPage), med datum och skäl. */
const FAQ_BYTT: Array<{ path: string; fore: string; efter: string; datum: string; skal: string }> = [
  ...[
    ['Hur fungerar Karriärguiden?', 'Hur fungerar Jobbcoachen?'],
    ['Vilka källor använder Karriärguiden?', 'Vilka källor använder Jobbcoachen?'],
    ['Är det gratis att använda Karriärguiden?', 'Är det gratis att använda Jobbcoachen?'],
    ['Kan jag dela mitt CV med Karriärguiden?', 'Kan jag dela mitt CV med Jobbcoachen?'],
  ].map(([fore, efter]) => ({ path: '/verktyg/jobbcoachen', fore, efter, datum: '2026-10-12', skal: TERMER })),
  {
    path: '/verktyg/cv-mallar',
    fore: 'Är mallarna mobile-friendly när jag bygger CV:t?',
    efter: 'Är mallarna mobilanpassade när jag bygger CV:t?',
    datum: '2026-10-12',
    skal: TERMER,
  },
];

/** Interna länkar som pekats om, med datum och skäl. */
const LANK_BYTT: Array<{ path: string; fore: string; efter: string; datum: string; skal: string }> = [
  {
    path: '/funktioner',
    fore: '/dashboard/cv-mallar',
    efter: '/verktyg/cv-mallar',
    datum: '2026-10-12',
    skal: 'SEO-granskningen av del A: "Välj en mall" pekade in i det inloggade läget.',
  },
];

/** Ändrade JSON-LD-typer efter ägarkravet om termer (2026-10-12). Slås ihop med LD_UNDANTAG per sida. */
const LD_TERMER: Array<{ path: string; andrade: string[]; skal: string }> = [
  { path: '/verktyg/jobbcoachen', andrade: ['WebApplication', 'HowTo', 'FAQPage'], skal: '"Karriärguiden" blir "Jobbcoachen" i namn, steg och FAQ, och "(Källa N) inline" blir "direkt i texten".' },
  { path: '/verktyg/personligt-brev', andrade: ['HowTo'], skal: 'Steget "Välj mall och ton": "Sju mallar och sex tonlägen, från professionellt till entusiastiskt."' },
  { path: '/verktyg/cv-analys', andrade: ['WebApplication', 'HowTo'], skal: '"before/after" blir "före och efter".' },
  { path: '/verktyg/skapa-cv', andrade: ['WebApplication', 'HowTo', 'FAQPage'], skal: '"live-preview" blir "förhandsvisning", "auto-save" och "mobile-friendly" blir svenska.' },
  { path: '/verktyg/jobbmatchning', andrade: ['WebApplication', 'HowTo', 'FAQPage'], skal: '"matchnings-procent" blir "matchning i procent".' },
  { path: '/verktyg/cv-mallar', andrade: ['HowTo', 'FAQPage'], skal: 'HowTo läses ur samma data som de synliga stegen; FAQ-frågan "mobile-friendly" blir "mobilanpassade".' },
];

function ldUndantag(sida: string): { datum: string; skal: string; nya?: boolean; andrade?: string[] } | undefined {
  const bas = LD_UNDANTAG.find((u) => u.path === sida);
  const termer = LD_TERMER.find((u) => u.path === sida);
  if (!termer) return bas;
  return {
    datum: '2026-10-12',
    skal: [bas?.skal, `${TERMER}: ${termer.skal}`].filter(Boolean).join(' '),
    nya: bas?.nya,
    andrade: [...new Set([...(bas?.andrade ?? []), ...termer.andrade])],
  };
}

/** Metadata som får tillkomma där den saknades (tom före, satt efter). */
const META_TILLAGD: Array<{ path: string; falt: 'canonical'; datum: string; skal: string }> = [
  {
    path: '/',
    falt: 'canonical',
    datum: '2026-10-12',
    skal: 'SEO-granskningen våg 1–3, punkt 6: startsidan saknade canonical, nu https://www.jobbcoach.ai/.',
  },
];

/**
 * Sidor vars baslinje tagits om, med skälet. Allt annat i fore.json är
 * avtrycket från orört läge 23 september.
 */
const BASLINJE_OMTAGEN: Array<{ path: string; datum: string; skal: string }> = [
  {
    path: '/verktyg/bli-upptackt',
    datum: '2026-09-23',
    skal:
      'Ägarbeslut: synligheten för rekryterare ingår i Allt, och texten ska säga det. Service-schemat (price 0, "Gratis att synas") och FAQPage-schemat fick en fråga om vad det kostar. h1, title, description och canonical oförändrade.',
  },
  {
    path: '/verktyg/linkedin-optimering',
    datum: '2026-09-23',
    skal:
      'Ägarbeslut: LinkedIn-optimeringen ingår i CV-veckan och Allt, gratisnivån har ingen optimering. WebApplication-schemats offer, HowTo-schemats estimatedCost och FAQPage-svaret om kostnaden sa "en gratis optimering i veckan". Omtagen igen 2026-09-23 (Räkna ut-omgången, del 1): WebApplication- och HowTo-schemat hade det gamla produktnamnet "Karriärguidens AI" och anglicismerna Split-view, branschkeywords, score-rapport och copy-paste, och FAQ-frågan hette "Vad är ATS-keywords på LinkedIn?". Bytt till Jobbcoach.ai och svenska facktermer (rekryteringssystem (ATS), nyckelord, delad vy). h1, title, description och canonical oförändrade.',
  },
]

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
  '/verktyg/personlighetstest',
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
  // Räkna ut-hubben och de nio kalkylatorerna, omritade i linjen 2026-09-23.
  '/rakna-ut',
  '/rakna-ut/felrekrytering',
  '/rakna-ut/lon-efter-skatt',
  '/rakna-ut/loneforhandling',
  '/rakna-ut/semesterersattning',
  '/rakna-ut/sourcing',
  '/rakna-ut/timlon-till-manadslon',
  '/rakna-ut/traffsakerhet',
  '/rakna-ut/uppsagningstid',
  '/rakna-ut/vad-kostar-en-anstalld',
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

/** Komponenttäckning för artikelmallen (del B 4.1): howto, tabell, bild mitt i texten, showcase, karriär utan produkt. */
const DEL_B_ARTIKLAR_EXTRA = [
  // howto:
  'arbetsintervju-guide',
  'bra-cv-guide',
  'byta-karriar-jobbsokande-guide',
  'cv-bild-guide',
  'cv-mall-pdf-gratis',
  'hur-skriver-man-ett-personligt-brev',
  'online-cv-byggare-gratis',
  'saga-upp-sig',
  'vad-ar-ett-cv',
  'cover-letter-sverige',
  // tabell
  'bakgrundskontroll-vid-anstallning',
  'deduktivt-induktivt-test',
  'loneforhandling',
  'verbalt-test-guide',
  'europass-cv',
  // CustomImage mitt i texten
  'beratta-om-dig-sjalv-intervju',
  'kroppssprak-intervju',
  'skriva-cv-guide',
  'hur-ska-ett-cv-se-ut',
  'vanliga-misstag-personligt-brev',
  // showcase och karriär utan produkt
  'cv-mall-gratis-guide',
  'vaga-byta-jobb',
].map((s) => `/artiklar/${s}`);

const DEL_B_OVRIGA = [
  '/artiklar',
  '/artiklar?tag=cv',
  '/artiklar?page=2',
  '/cv-exempel',
  '/personligt-brev-exempel',
  '/cv-exempel/kategori/vard',
  '/cv-exempel/kategori/ekonomi',
  '/personligt-brev-exempel/kategori/vard',
  '/personligt-brev-exempel/kategori/service',
  '/cv-exempel/projektledare',
  '/personligt-brev-exempel/projektledare',
  '/rakna-ut',
  '/rakna-ut/felrekrytering',
  '/rakna-ut/lon-efter-skatt',
  '/rakna-ut/loneforhandling',
  '/rakna-ut/semesterersattning',
  '/rakna-ut/sourcing',
  '/rakna-ut/timlon-till-manadslon',
  '/rakna-ut/traffsakerhet',
  '/rakna-ut/uppsagningstid',
  '/rakna-ut/vad-kostar-en-anstalld',
  '/om-oss',
  '/for-rekryterare',
  '/kontakt',
  '/hjalpcenter',
  '/integritetspolicy',
  '/anvandarvillkor',
];

/** Del B:s urval: GSC topp 20 per typ (scripts/.publikt-urval-b.json, 90 dagar) plus komponenttäckningen. */
function sidorDelB(): string[] {
  const fil = 'scripts/.publikt-urval-b.json';
  if (!fs.existsSync(fil)) throw new Error(`${fil} saknas. Kör npx tsx scripts/_gsc-publikt-b.ts först.`);
  const data = JSON.parse(fs.readFileSync(fil, 'utf8')) as Record<'artiklar' | 'cv' | 'brev', Array<{ path: string }>>;
  return [
    ...new Set([
      ...data.artiklar.map((r) => r.path),
      ...DEL_B_ARTIKLAR_EXTRA,
      ...data.cv.map((r) => r.path),
      ...data.brev.map((r) => r.path),
      ...DEL_B_OVRIGA,
    ]),
  ];
}

/** frontmatter.image för en artikel, för regeln om första bilden (del B 4.3 punkt 7). */
function artikelBild(sida: string): string | null {
  const slug = sida.replace(/^\/artiklar\//, '');
  const fil = path.join('content/artiklar', `${slug}.mdx`);
  if (!fs.existsSync(fil)) return null;
  const fm = matter(fs.readFileSync(fil, 'utf8')).data as { image?: string };
  return fm.image ?? null;
}

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
      // Exempelsidorna sätter datePublished till byggets tidpunkt (new Date() i
      // page.tsx). Ett datum med klockslag annat än midnatt är byggstämpeln,
      // inte ett innehållsdatum, och nollas som dateModified (2026-10-12).
      if (k === 'datePublished') {
        const d = (v as Record<string, unknown>)[k];
        if (typeof d === 'string' && /T\d{2}:\d{2}:\d{2}/.test(d) && !/T00:00:00(\.000)?Z$/.test(d)) continue;
      }
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

/**
 * Ordantalet: main utom ramen, utan skript, stil och det som är aria-hidden.
 * Bara yttersta main räknas: layouten och sidan hade var sin main, och en
 * nästlad main räknades förr två gånger (rättat 2026-10-12, baslinjen
 * omräknad med samma regel ur de sparade live-sidorna, se ord-fil).
 */
function raknaOrd(doc: Document): number {
  const mains = Array.from(doc.querySelectorAll('main')).filter((m) => !m.parentElement?.closest('main'));
  const rotter = mains.length ? mains : [doc.body];
  let ord = 0;
  for (const rot of rotter) {
    const kopia = rot.cloneNode(true) as Element;
    kopia
      .querySelectorAll('script, style, noscript, template, [aria-hidden="true"], [data-site-chrome]')
      .forEach((el) => el.remove());
    const t = (kopia.textContent ?? '').replace(/\s+/g, ' ').trim();
    ord += t ? t.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0;
  }
  return ord;
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

  const faq: string[] = [];
  doc.querySelectorAll('summary').forEach((sm) => {
    if (iRam(sm)) return;
    // Ikoner (+ och −) bredvid frågan räknas inte: bara frågans text.
    const kopia = sm.cloneNode(true) as Element;
    kopia.querySelectorAll('[aria-hidden="true"]').forEach((el) => el.remove());
    const t = text(kopia).replace(/[\s+−×]+$/u, '');
    if (t) faq.push(t);
  });
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      const data = JSON.parse(s.textContent ?? '');
      const block = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];
      for (const b of block) {
        if (b?.['@type'] === 'FAQPage' && Array.isArray(b.mainEntity)) {
          for (const q of b.mainEntity) if (q?.name) faq.push('ld: ' + String(q.name).replace(/\s+/g, ' ').trim());
        }
      }
    } catch {
      /* ogiltig JSON-LD syns redan i jsonLd */
    }
  });

  const ord = raknaOrd(doc);

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
    faq,
    ord,
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
    faq: a.faq?.map((q) => q.replace(/[\s+−×]+$/u, '')),
    jsonLd: a.jsonLd
      .map((s) => {
        try {
          return JSON.stringify(stabil(JSON.parse(s)));
        } catch {
          return s;
        }
      })
      .sort(),
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
        // OG-bildens frågesträng är byggets hash och byts vid varje bygge.
        const norm = (v: string) => (falt === 'ogImage' ? v.split('?')[0].replace(/^https?:\/\/[^/]+/, '') : v);
        const tillagd = META_TILLAGD.find((m) => m.path === f.path && m.falt === falt);
        if (tillagd && f[falt] === '' && e[falt]) {
          info(`${falt} tillagd (${tillagd.datum}): "${e[falt]}"`);
          continue;
        }
        const bytt = META_BYTT.find((m) => m.path === f.path && m.falt === falt);
        if (bytt && norm(f[falt]) !== norm(e[falt])) {
          info(`${falt} bytt (${bytt.datum}): "${f[falt]}" → "${e[falt]}". ${bytt.skal}`);
          continue;
        }
        if (norm(f[falt]) !== norm(e[falt])) brott(`${falt}: "${f[falt]}" → "${e[falt]}"`);
      }
      const h1f = f.h1.filter((h) => !TILLATNA_H1.includes(h));
      const h1e = e.h1.filter((h) => !TILLATNA_H1.includes(h));
      if (h1f.length !== f.h1.length) info(`showcasens h1 ut: ${JSON.stringify(f.h1.filter((h) => TILLATNA_H1.includes(h)))}`);
      const h1Byte = H1_BYTT.find(
        (b) => b.path === f.path && JSON.stringify(h1f) === JSON.stringify([b.fore]) && JSON.stringify(h1e) === JSON.stringify([b.efter])
      );
      if (h1Byte) info(`h1 bytt (${h1Byte.datum}): "${h1Byte.fore}" → "${h1Byte.efter}". ${h1Byte.skal}`);
      else if (JSON.stringify(h1f) !== JSON.stringify(h1e)) {
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
      } else if (hard(f.path)) {
        // Publikt v2: samma text och nivå, ordning och id får ändras.
        const utanId = (l: Rubrik[]) => l.filter((r) => !tillaten(r)).map((r) => `${r.tag} ${r.text}`);
        const d = multisetSkillnad(utanId(f.rubriker), utanId(e.rubriker));
        const efterRubriker = new Set(utanId(e.rubriker));
        d.borta = d.borta.filter((r) => {
          const byte = RUBRIK_BYTT.find((b) => b.path === f.path && b.fore === r && efterRubriker.has(b.efter));
          if (byte) {
            info(`rubrik bytt (${byte.datum}): "${byte.fore}" → "${byte.efter}". ${byte.skal}`);
            return false;
          }
          const borta = RUBRIK_BORTA.find((b) => b.path === f.path && r === b.rubrik);
          if (borta) info(`dubblettrubrik borta (${borta.datum}): "${borta.rubrik}". ${borta.skal}`);
          return !borta;
        });
        if (d.borta.length) brott(`rubriker borta (text och nivå): ${JSON.stringify(d.borta)}`);
        if (d.nya.length) info(`nya rubriker: ${JSON.stringify(d.nya)}`);
      } else {
        // Omritade publika ytor: sektionsrubriker får skrivas om, men redovisas.
        const d = multisetSkillnad(fr, er);
        if (d.borta.length || d.nya.length) {
          info(`sektionsrubriker ändrade (omritad yta, tillåtet): borta ${d.borta.length}, nya ${d.nya.length}`);
        }
      }
      if (f.faq && e.faq) {
        const d = unikSkillnad(f.faq, e.faq);
        const efterFaq = new Set(e.faq);
        d.borta = d.borta.filter((q) => {
          const byte = FAQ_BYTT.find(
            (b) => b.path === f.path && (q === b.fore || q === `ld: ${b.fore}`) && efterFaq.has(q.startsWith('ld: ') ? `ld: ${b.efter}` : b.efter)
          );
          if (byte) info(`FAQ-fråga bytt (${byte.datum}, ${byte.skal}): "${q}" → "${byte.efter}"`);
          return !byte;
        });
        if (d.borta.length) brott(`FAQ-frågor borta: ${JSON.stringify(d.borta)}`);
        if (d.nya.length) info(`nya FAQ-frågor: ${JSON.stringify(d.nya)}`);
      }
      if (typeof f.ord === 'number' && typeof e.ord === 'number' && f.ord > 0) {
        const andring = ((e.ord - f.ord) / f.ord) * 100;
        const rad = `ord i main ${f.ord} → ${e.ord} (${andring >= 0 ? '+' : ''}${andring.toFixed(1)} %)`;
        if (hard(f.path) && andring < -ORD_TOLERANS) brott(rad);
        else info(rad);
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
        // Rena ankarlänkar (#gratis) pekar inom sidan och är inga länkmål för
        // sökmotorer. De får försvinna när sektionerna byts, men redovisas.
        const helt = dl.borta.filter((l) => {
          if (allaEfter.has(l) || l.startsWith('#')) return false;
          const byte = LANK_BYTT.find((b) => b.path === f.path && b.fore === l && allaEfter.has(b.efter));
          if (byte) info(`länk bytt (${byte.datum}): ${byte.fore} → ${byte.efter}. ${byte.skal}`);
          return !byte;
        });
        const ankare = dl.borta.filter((l) => !allaEfter.has(l) && l.startsWith('#'));
        if (helt.length) brott(`interna länkar borta från sidan: ${JSON.stringify(helt)}`);
        if (ankare.length) info(`ankarlänkar inom sidan borta: ${JSON.stringify(ankare)}`);
        const flyttade = dl.borta.filter((l) => allaEfter.has(l));
        if (flyttade.length) info(`länkar flyttade till ramen: ${JSON.stringify(flyttade)}`);
      }
      if (dl.nya.length) info(`nya interna länkar i innehållet: ${JSON.stringify(dl.nya)}`);
      const dr = unikSkillnad(f.ramLankar, e.ramLankar);
      if (dr.borta.length || dr.nya.length) {
        info(`ramen (header och footer, omritad enligt analysen): borta ${JSON.stringify(dr.borta)}, nya ${JSON.stringify(dr.nya)}`);
      }
      const dj = multisetSkillnad(f.jsonLd, e.jsonLd);
      const und = ldUndantag(f.path);
      const typ = (block: string) => {
        try {
          const d = JSON.parse(block);
          return Array.isArray(d?.['@graph'])
            ? d['@graph'].map((b: { '@type'?: string }) => b['@type']).join('+')
            : String(d?.['@type']);
        } catch {
          return 'ogiltig';
        }
      };
      if (und && (dj.borta.length || dj.nya.length)) {
        const tillatTyp = (b: string) => (und.andrade ?? []).includes(typ(b));
        const bortaKvar = dj.borta.filter((b) => !tillatTyp(b));
        const nyaKvar = dj.nya.filter((b) => !tillatTyp(b));
        const typerFore = dj.borta.filter(tillatTyp).map(typ).sort();
        const typerEfter = dj.nya.filter(tillatTyp).map(typ).sort();
        if (JSON.stringify(typerFore) !== JSON.stringify(typerEfter)) {
          brott(`JSON-LD: tillåtna typer ändrade antal: ${JSON.stringify(typerFore)} → ${JSON.stringify(typerEfter)}`);
        } else if (typerFore.length) {
          info(`JSON-LD ändrad i tillåten typ (${und.datum}): ${typerFore.join(', ')}`);
        }
        if (bortaKvar.length) brott(`JSON-LD borta: ${bortaKvar.map((x) => x.slice(0, 300)).join(' | ')}`);
        if (nyaKvar.length) {
          if (und.nya) info(`nya JSON-LD-block (${und.datum}): ${nyaKvar.map(typ).join(', ')}`);
          else brott(`nya JSON-LD-block: ${nyaKvar.map((x) => x.slice(0, 300)).join(' | ')}`);
        }
      } else if (dj.borta.length || dj.nya.length) {
        brott(`JSON-LD ändrad: ${dj.borta.length} block borta, ${dj.nya.length} nya\n    före: ${dj.borta.map((s) => s.slice(0, 300)).join('\n    före: ')}\n    efter: ${dj.nya.map((s) => s.slice(0, 300)).join('\n    efter: ')}`);
      }
      if (f.path.startsWith('/artiklar/') && JSON.stringify(f.forstaBild) !== JSON.stringify(e.forstaBild)) {
        // Del B 4.3 punkt 7: där bilden stod först är src och alt desamma (bilden
        // flyttar till hjälten). Övriga får frontmatter.image som första bild.
        const fm = artikelBild(f.path);
        if (fm && e.forstaBild?.src === fm && f.forstaBild?.src !== fm) {
          info(`första bilden blir artikelbilden (2026-10-12, del B 4.4): ${JSON.stringify(f.forstaBild)} → ${JSON.stringify(e.forstaBild)}`);
        } else {
          brott(`första bilden: ${JSON.stringify(f.forstaBild)} → ${JSON.stringify(e.forstaBild)}`);
        }
      }
    }
    rader.push(`### ${f.path}`);
    const omtagen = BASLINJE_OMTAGEN.find((b) => b.path === f.path);
    if (omtagen) rader.push(`- baslinjen omtagen ${omtagen.datum}: ${omtagen.skal}`);
    const ldUnd = ldUndantag(f.path);
    if (ldUnd) rader.push(`- tillåten JSON-LD-skillnad ${ldUnd.datum}: ${ldUnd.skal}`);
    rader.push(sidrader.length ? sidrader.join('\n') : '- oförändrad');
    rader.push('');
  }
  return { rapport: rader.join('\n'), fel };
}

async function main() {
  const lage = process.argv[2];
  if (lage === 'ta') {
    const bas = arg('bas') ?? `http://localhost:${arg('port', '8300')}`;
    const ut = arg('ut', 'docs/qa/seo-diff/avtryck.json')!;
    const lista = arg('sidor')?.split(',') ?? (arg('urval') === 'b' ? sidorDelB() : sidor());
    const avtryck: Avtryck[] = [];
    for (const s of lista) {
      const a = await ta(bas, s);
      avtryck.push(a);
      console.log(
        `${String(a.status).padEnd(4)} ${s.padEnd(52)} h2/h3 ${String(a.rubriker.length).padStart(3)}  länkar ${String(a.lankar.length).padStart(3)}  ram ${String(a.ramLankar.length).padStart(3)}  ld ${a.jsonLd.length}  faq ${String(a.faq?.length ?? 0).padStart(2)}  ord ${a.ord}`
      );
    }
    fs.mkdirSync(path.dirname(ut), { recursive: true });
    fs.writeFileSync(ut, JSON.stringify(avtryck, null, 2));
    console.log(`\nSparat: ${ut} (${avtryck.length} sidor)`);
    return;
  }
  if (lage === 'ord-fil') {
    // Räknar om ordantalet i ett avtryck ur sparade HTML-filer, med samma
    // regel som ta. --par /sida=fil.html,/annan=fil2.html
    const foreFil = arg('fore')!;
    const fore = JSON.parse(fs.readFileSync(foreFil, 'utf8')) as Avtryck[];
    for (const par of (arg('par') ?? '').split(',').filter(Boolean)) {
      const [sida, fil] = par.split('=');
      const i = fore.findIndex((a) => a.path === sida);
      if (i < 0) throw new Error(`${sida} saknas i ${foreFil}`);
      const doc = new JSDOM(fs.readFileSync(fil, 'utf8')).window.document;
      const h1 = Array.from(doc.querySelectorAll('h1')).map(text);
      if (JSON.stringify(h1) !== JSON.stringify(fore[i].h1)) throw new Error(`${sida}: filens h1 stämmer inte med avtrycket`);
      const fran = fore[i].ord;
      fore[i].ord = raknaOrd(doc);
      console.log(`${sida.padEnd(40)} ord ${fran} → ${fore[i].ord}`);
    }
    fs.writeFileSync(foreFil, JSON.stringify(fore, null, 2));
    return;
  }
  if (lage === 'baslinje') {
    const bas = `http://localhost:${arg('port', '8300')}`;
    const foreFil = arg('fore', 'docs/qa/seo-diff/fore.json')!;
    const fore = JSON.parse(fs.readFileSync(foreFil, 'utf8')) as Avtryck[];
    const lista = arg('sidor')?.split(',') ?? [];
    for (const s of lista) {
      const post = BASLINJE_OMTAGEN.find((b) => b.path === s);
      if (!post) throw new Error(`${s} står inte i BASLINJE_OMTAGEN. Lägg till den med skälet först.`);
      const i = fore.findIndex((a) => a.path === s);
      if (i < 0) throw new Error(`${s} saknas i ${foreFil}`);
      const ny = await ta(bas, s);
      for (const falt of ['title', 'description', 'canonical'] as const) {
        if (fore[i][falt] !== ny[falt]) throw new Error(`${s}: ${falt} har ändrats, baslinjen tas inte om`);
      }
      if (JSON.stringify(fore[i].h1) !== JSON.stringify(ny.h1)) throw new Error(`${s}: h1 har ändrats, baslinjen tas inte om`);
      fore[i] = ny;
      console.log(`Baslinjen omtagen för ${s} (${post.datum}): ${post.skal}`);
    }
    fs.writeFileSync(foreFil, JSON.stringify(fore, null, 2));
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
  console.log('Användning: ta --port 8300 --ut fil.json | jamfor --fore a.json --efter b.json | baslinje --port 8300 --fore fore.json --sidor /a,/b');
  process.exit(2);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
