// scripts/ordforrad/kandidater.ts
// =============================================================================
// Kandidater till ordförrådsbanken (brief-tester-steg2-2026-11-09.md avsnitt 4).
// Gemini föreslår, ingenting går till banken utan att scripts/ordforrad/
// verifiera.mjs har hittat facit i Svensk ordbok (SO) och spärrarna OF1 till
// OF8 håller. Ägaren godkände Gemini som kandidatskrivare 2026-11-09.
//
// Kör (läser GOOGLE_AI_API_KEY ur .env.local):
//   node --env-file=.env.local node_modules/tsx/dist/cli.mjs scripts/ordforrad/kandidater.ts <niva> <typ> <antal> [ut.json]
// Modellen är projektets kvalitetsmodell (src/lib/gemini/models.ts).
// =============================================================================

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { generateJSON } from '../../src/lib/gemini/generate';
import { GEMINI_MODELS } from '../../src/lib/gemini/models';

type Niva = 'grund' | 'avancerad' | 'expert';
type Typ = 'synonym' | 'antonym';

const [niva, typ, antalS, utArg] = process.argv.slice(2) as [Niva, Typ, string, string | undefined];
const antal = Number(antalS ?? 30);
const ut = utArg ?? `src/lib/ordforradV1/kandidater/${niva}-${typ}.json`;

const NIVA: Record<Niva, string> = {
  grund:
    'Grund: vanliga ord ur vardagsspråk och nyhetsspråk som de flesta vuxna kan (exempel SNABB, TYDLIG, BÖRJA, MODIG). Distraktorerna har samma ordklass och tydligt annan betydelse, en av dem i samma semantiska fält (SNABB: stark). Ingen distraktor får vara motsatsen.',
  avancerad:
    'Avancerad: mindre vanliga, abstrakta eller formella ord (exempel NOGGRANN, AVSIKTLIG, FÖRSUMMA, GENERÖS). En distraktor är en nära-synonym som inte håller (NOGGRANN: långsam). I synonymuppgifter får en distraktor vara motsatsen till uppslagsordet (typ "antonym").',
  expert:
    'Expert: lågfrekventa ord, lånord och kanslispråk (exempel REDUNDANT, KONCILIANT, SUBTIL, PREKÄR). Distraktorer: motsatsen (i synonymuppgifter), en falsk vän (ett ord som låter likt men betyder något annat, KONCILIANT: koncis), och två nära ord i samma fält som inte betyder detsamma.',
};

const TYP: Record<Typ, string> = {
  synonym: 'Synonymuppgift: facit är ett ord som betyder ungefär detsamma som uppslagsordet.',
  antonym: 'Motsatsuppgift: facit är ett ord som betyder motsatsen till uppslagsordet. Ingen distraktor får vara en synonym till facit eller ett annat motsatsord.',
};

const tidigare = existsSync(ut) ? (JSON.parse(readFileSync(ut, 'utf8')) as { ord: string }[]) : [];
const alla = ['grund', 'avancerad', 'expert'].flatMap((n) =>
  ['synonym', 'antonym'].flatMap((t) => {
    const f = `src/lib/ordforradV1/kandidater/${n}-${t}.json`;
    return existsSync(f) ? (JSON.parse(readFileSync(f, 'utf8')) as { ord: string }[]).map((x) => x.ord) : [];
  })
);

const system = `Du är en svensk lexikograf som skriver uppgifter till ett ordförrådsprov i samma format som Försvarsmaktens och Polisens I-prov: ett uppslagsord i versaler och fem svarsalternativ. Allt ska vara korrekt svenska enligt Svensk ordbok och SAOL. Skriv aldrig tankstreck.`;

const prompt = `Skriv ${antal} nya uppgifter.

${NIVA[niva]}
${TYP[typ]}

Regler för varje uppgift:
1. Exakt ett alternativ är rätt (facit). ${typ === 'antonym' ? 'Facit är ett MOTSATSORD till uppslagsordet: ett ord som betyder det motsatta (som generös och snål, försumma och sköta). Facit får aldrig betyda detsamma som uppslagsordet.' : 'Facit ska stå som synonym i Svensk ordbok, inte bara vara besläktat.'}
2. Alla fem alternativ har samma ordklass som uppslagsordet och står i grundform (substantiv obestämd singular, verb infinitiv utan "att", adjektiv positiv).
3. Inga två alternativ får vara synonymer med varandra.
4. Alternativens längd ska ligga inom fyra bokstäver från facits längd.
5. Inga sammansättningar med uppslagsordet och inga böjningar av samma stam.
6. Inga slangord, dialektord, fackord för en enda yrkesgrupp och inga ålderdomliga ord${niva === 'expert' ? '' : ' (inte heller på den här nivån)'}.
7. Varje distraktor får en typ: "samma_falt" (samma område, annan betydelse), "nara" (nära-synonym som inte håller), "antonym" (motsatsen, bara i synonymuppgifter på avancerad och expert), "synonym" (bara i motsatsuppgifter: ett ord som betyder detsamma som uppslagsordet), "falsk_van" (låter likt, annan betydelse, bara expert) eller "annan".
8. Varje distraktor får en kort förklaring (högst 12 ord) på svenska om vad ordet betyder, som visas efter svaret.
9. En exempelmening med uppslagsordet, högst 14 ord, vardaglig eller ur arbetslivet.
10. Undvik dessa uppslagsord, de finns redan: ${[...new Set([...alla, ...tidigare.map((x) => x.ord)])].join(', ') || 'inga'}.

Skriv alla ord med gemener (versalerna sätts av vyn).`;

const schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      ord: { type: 'string' },
      ordklass: { type: 'string', enum: ['substantiv', 'verb', 'adjektiv', 'adverb'] },
      facit: { type: 'string' },
      distraktorer: {
        type: 'array',
        items: {
          type: 'object',
          properties: { ord: { type: 'string' }, typ: { type: 'string' }, forklaring: { type: 'string' } },
          required: ['ord', 'typ', 'forklaring'],
        },
      },
      exempel: { type: 'string' },
    },
    required: ['ord', 'ordklass', 'facit', 'distraktorer', 'exempel'],
  },
};

async function main() {
const res = await generateJSON<unknown[]>({
  model: GEMINI_MODELS.quality,
  systemInstruction: system,
  prompt,
  schema,
  temperature: 0.7,
  maxOutputTokens: 24000,
  thinkingBudget: 2048,
});
const nya = (res.data as { ord: string }[]).map((x) => ({ ...x, niva, typ, kalla_kandidat: `gemini:${GEMINI_MODELS.quality}` }));
writeFileSync(ut, JSON.stringify([...tidigare, ...nya], null, 1) + '\n');
console.log(`${niva} ${typ}: ${nya.length} nya kandidater, ${tidigare.length + nya.length} totalt i ${ut}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
