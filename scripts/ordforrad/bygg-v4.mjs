// scripts/ordforrad/bygg-v4.mjs
// =============================================================================
// Bankversion 4 av ordförrådet (omgång 3, 2026-11-19): handskrivna kandidater i
// src/lib/ordforradV1/kandidater/hand-2026-11-19-omg3.json prövas med samma
// regler som bygg-v3.mjs mot Svensk ordbok, SAOL, Wiktionary och synonymer.se
// (scripts/ordforrad/so.mjs) och läggs SIST i bankfilerna med fran_version 4.
// Version 1 till 3 rörs aldrig; en omkörning ersätter bara tidigare version
// 4-rader. Reglerna från version 3 gäller, plus en formkontroll efter
// granskningen av omgång 2:
//  * motsatsord på expert: delar facit för- eller efterled med ordet (minst tre
//    bokstäver) ska minst två distraktorer dela samma led, annars löses
//    uppgiften på formen
//
// Kör: node scripts/ordforrad/bygg-v4.mjs --karna  (bara ord och facit, med frekvens)
//      node scripts/ordforrad/bygg-v4.mjs --torr   (bara rapport)
//      node scripts/ordforrad/bygg-v4.mjs          (skriver bankerna)
//      --fil=<sökväg> prövar en annan kandidatfil (bara med --karna eller --torr)
// =============================================================================

import { readFileSync, writeFileSync } from 'node:fs';
import { slaUpp, relation, wiktionary, synonymerSe } from './so.mjs';
import { mulberry32, hashString } from '../lib/serie/slump.mjs';

const VERSION = 4;
const filArg = process.argv.find((a) => a.startsWith('--fil='))?.slice(6);
const KANDIDATER = filArg ?? 'src/lib/ordforradV1/kandidater/hand-2026-11-19-omg3.json';
const AVVISADE = 'src/lib/ordforradV1/kandidater/avvisade-2026-11-19-omg3.json';
const NIVAER = ['grund', 'avancerad', 'expert'];
const KORT = { grund: 'g', avancerad: 'a', expert: 'e', synonym: 's', antonym: 'm' };
const BAND = { grund: [30000, Infinity], avancerad: [500, Infinity], expert: [50, 300000] };
const GRANSKNING = JSON.parse(readFileSync('src/lib/ordforradV1/kandidater/granskning-2026-11-09.json', 'utf8'));
const baraKarna = process.argv.includes('--karna');
const torr = process.argv.includes('--torr') || baraKarna || Boolean(filArg);
const suffix = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[a.length - 1 - i] === b[b.length - 1 - i]) i++;
  return i;
};
const form = (a, b) => Math.max(prefix(a, b), suffix(a, b));

const stor = (t) => t[0].toUpperCase() + t.slice(1);
const fil = (n) => `src/lib/ordforradV1/bank${stor(n)}.json`;
const prefix = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};
const rent = (w) => /^[a-zåäöé]+$/.test(w);
const tankstreck = /[–—]/;

const cache = new Map();
async function info(w) {
  if (!cache.has(w)) cache.set(w, { so: await slaUpp(w), wikt: await wiktionary(w), synse: await synonymerSe(w) });
  return cache.get(w);
}
const iKlass = (I, klass) => I.so.filter((e) => e.ordklass === klass);
const finns = (I, klass) => iKlass(I, klass).length > 0;
const stil = (I, klass) => [...new Set(iKlass(I, klass).flatMap((e) => e.stil))];
const wSyn = (A, B, a, b) => A.wikt.syn.has(b) || B.wikt.syn.has(a);
const wAnt = (A, B, a, b) => A.wikt.ant.has(b) || B.wikt.ant.has(a);
const sSyn = (A, B, a, b) => A.synse.syn.has(b) || B.synse.syn.has(a);
const sAnt = (A, B, a, b) => A.synse.ant.has(b) || B.synse.ant.has(a);
function relaterade(A, B, a, b, typ, klass, { breda = true } = {}) {
  const r = relation(iKlass(A, klass), iKlass(B, klass), a, b, typ, klass);
  if (r.length) return r[0].text;
  if (typ === 'synonym' ? wSyn(A, B, a, b) : wAnt(A, B, a, b)) return `Wiktionary ${typ === 'synonym' ? 'synonym' : 'motsats'}`;
  if (breda && (typ === 'synonym' ? sSyn(A, B, a, b) : sAnt(A, B, a, b))) return `synonymer.se ${typ === 'synonym' ? 'synonym' : 'motsats'}`;
  return null;
}

// ------------------------------------------------------------ befintligt
const banker = Object.fromEntries(NIVAER.map((n) => [n, JSON.parse(readFileSync(fil(n), 'utf8')).filter((q) => q.fran_version < VERSION)]));
const uppslag = new Set(NIVAER.flatMap((n) => banker[n].map((q) => q.ord)));
/** Uppslagsord och facit i banken (alla tidigare versioner) och i artikelfigurerna. */
const upptagna = new Set(NIVAER.flatMap((n) => banker[n].flatMap((q) => [q.ord, q.options[q.correctAnswer]])));
const parSet = new Set(NIVAER.flatMap((n) => banker[n].map((q) => [q.ord, q.options[q.correctAnswer]].sort().join('|'))));
const somAlt = Object.fromEntries(NIVAER.map((n) => [n, new Map()]));
for (const n of NIVAER) for (const q of banker[n]) q.options.forEach((o) => somAlt[n].set(o, (somAlt[n].get(o) ?? 0) + 1));
/** Artikelfigurernas ord får inte bli uppslagsord (scripts/artikel-steg2-check.mjs). */
const artikelOrd = new Set(JSON.parse(readFileSync('src/lib/artikelfigurer/ordforrad.json', 'utf8')).map((q) => q.ord.toLowerCase()));
for (const q of JSON.parse(readFileSync('src/lib/artikelfigurer/ordforrad.json', 'utf8'))) [q.ord, q.options[q.correctAnswer]].forEach((w) => upptagna.add(w.toLowerCase()));
const artikelPar = new Set(JSON.parse(readFileSync('src/lib/artikelfigurer/ordforrad.json', 'utf8')).map((q) => [q.ord.toLowerCase(), q.options[q.correctAnswer].toLowerCase()].sort().join('|')));

// ------------------------------------------------------------ prövning
async function provaKarna(k) {
  const ord = k.ord;
  const facit = k.facit;
  const klass = k.ordklass;
  if (!rent(ord) || !rent(facit)) return { skal: ['tecken i ord eller facit'] };
  if (facit.length > 16) return { skal: ['facit har fler än 16 bokstäver'] };
  if (ord === facit || prefix(ord, facit) >= 5 || ord.includes(facit) || facit.includes(ord)) return { skal: ['OF5 facit har samma stam som ordet'] };
  if (GRANSKNING.struk[ord]) return { skal: [`granskning 2026-11-09 strök ${ord}`] };
  if (uppslag.has(ord)) return { skal: [`OF7 ${ord} är redan uppslagsord`] };
  if (upptagna.has(ord)) return { skal: [`${ord} finns redan i banken som uppslagsord eller facit`] };
  if (upptagna.has(facit)) return { skal: [`facit ${facit} finns redan i banken som uppslagsord eller facit`] };
  if (artikelOrd.has(ord)) return { skal: [`${ord} är ord i artikelfigurerna`] };
  const par = [ord, facit].sort().join('|');
  if (parSet.has(par) || artikelPar.has(par)) return { skal: ['paret finns redan (även spegelvänt eller i artikelfigurerna)'] };
  const O = await info(ord);
  const F = await info(facit);
  const pop = Math.max(0, ...iKlass(O, klass).map((e) => e.pop));
  const [lo, hi] = BAND[k.niva];
  const skal = [];
  if (pop < lo || pop > hi) skal.push(`frekvens ${pop} utanför nivåns band ${lo}..${hi}`);
  for (const [w, I] of [[ord, O], [facit, F]]) {
    if (!finns(I, klass)) skal.push(`OF2 ${w} finns inte som ${klass} i SO eller SAOL`);
    else if (stil(I, klass).length) skal.push(`OF6 ${w} är markerat ${stil(I, klass).join(', ')}`);
  }
  if (skal.length) return { skal };
  const alla = relation(iKlass(O, klass), iKlass(F, klass), ord, facit, k.typ, klass);
  const belagg = alla.filter((b) => b.styrka === 'stark');
  let tvaKallor = false;
  if (!belagg.length && k.typ === 'synonym' && alla.length && wSyn(O, F, ord, facit)) belagg.push(...alla, { text: `Wiktionary: ${ord} och ${facit} listas som synonymer` });
  if (!belagg.length && k.typ === 'antonym') {
    const synOf = (I) => new Set(iKlass(I, klass).flatMap((e) => [...e.syn, ...e.def]));
    for (const [A, a, B, b] of [[O, ord, F, facit], [F, facit, O, ord]]) {
      for (const s of synOf(A)) {
        if (!rent(s) || s === b) continue;
        const S = await info(s);
        const m = relation(iKlass(S, klass), iKlass(B, klass), s, b, 'antonym', klass);
        if (m.length) {
          belagg.push({ text: `${iKlass(A, klass)[0].kalla} ${a}: synonym eller förklaring ${s}` }, { text: m[0].text });
          break;
        }
      }
      if (belagg.length) break;
    }
  }
  if (!belagg.length && (k.typ === 'synonym' ? wSyn(O, F, ord, facit) && sSyn(O, F, ord, facit) : wAnt(O, F, ord, facit) && sAnt(O, F, ord, facit))) {
    tvaKallor = true;
    const namn = k.typ === 'synonym' ? 'synonymer' : 'motsatsord';
    belagg.push({ text: `Wiktionary: ${ord} och ${facit} listas som ${namn}` }, { text: `synonymer.se: ${ord} och ${facit} listas som ${namn}` });
  }
  if (!belagg.length) {
    const svagt = [relaterade(O, F, ord, facit, k.typ, klass)].filter(Boolean);
    return { skal: [`OF1 ${facit} är inte belagt som ${k.typ === 'synonym' ? 'synonym' : 'motsats'} till ${ord}${svagt.length ? ` (bara ${svagt[0]})` : ''}`] };
  }
  return { ord, facit, klass, O, F, belagg, tvaKallor, pop };
}

async function provaDistraktor(k, karna, d, typ) {
  const { ord, facit, klass, O, F } = karna;
  if (!rent(d)) return `${d}: tecken`;
  if (d === ord || d === facit) return `${d}: dubblett`;
  if (GRANSKNING.forbjudna_overallt.includes(d) || (GRANSKNING.forbjudna_alternativ[ord] ?? []).includes(d)) return `${d}: förbjuden i granskningen`;
  const D = await info(d);
  if (!finns(D, klass)) return `OF2 ${d} finns inte som ${klass}`;
  if (stil(D, klass).length) return `OF6 ${d} är stilmarkerat`;
  if (!iKlass(D, klass).some((e) => e.definitioner.length)) return `${d} saknar definition (ingen misstagstext)`;
  if (k.niva === 'grund' && k.typ === 'synonym' && relaterade(O, D, ord, d, 'antonym', klass)) return `OF8 ${d} är motsatsen till ${ord} (grund)`;
  const r1 = relaterade(O, D, ord, d, k.typ, klass);
  if (r1) return `OF1 ${d} kan försvaras som rätt (${r1})`;
  if (k.typ === 'antonym' && typ !== 'synonym' && !GRANSKAD_INTE_SYNONYM.has(`${ord}:${d}`)) {
    const r = relaterade(O, D, ord, d, 'synonym', klass, { breda: false });
    if (r) return `OF1 ${d} är synonym till ordet men inte märkt så (${r})`;
  }
  if (k.typ === 'synonym' && typ !== 'antonym') {
    // en omärkt motsats får inte stå utan raden "det är motsatsen"
    const r = relaterade(O, D, ord, d, 'antonym', klass, { breda: false });
    if (r) return `OF8 ${d} är motsatsen men inte märkt så (${r})`;
  }
  // skärpt i version 3: inte ens SO "jämför" mellan ordet och en distraktor, och ingen motsats eller synonym åt något håll
  const svag = relation(iKlass(O, klass), iKlass(D, klass), ord, d, 'synonym', klass).find((r) => r.styrka === 'svag');
  if (svag && !GRANSKAD_INTE_SYNONYM.has(`${ord}:${d}`)) return `OF1 ${d} är nära ordet (${svag.text})`;
  const andra = relaterade(O, D, ord, d, k.typ === 'synonym' ? 'antonym' : 'synonym', klass);
  if (andra) return `OF1 ${d} är ${k.typ === 'synonym' ? 'motsats' : 'synonym'} till ${ord} (${andra})`;
  const r2 = relaterade(F, D, facit, d, 'synonym', klass);
  if (r2) return `OF3 ${d} och facit är synonymer (${r2})`;
  {
    // version 3: en distraktor som är motsats till facit är nära ordet (antonymuppgift)
    // eller motsats till ordet (synonymuppgift), i alla fyra källorna
    const r3 = relaterade(F, D, facit, d, 'antonym', klass);
    if (r3) return `OF3 ${d} är motsats till facit (${r3})`;
  }
  if (Math.abs(d.length - facit.length) > 4) return `OF4 ${d} skiljer mer än fyra bokstäver från facit`;
  if (d.includes(ord) || ord.includes(d) || prefix(d, ord) >= 5 || prefix(d, facit) >= 5) return `OF5 ${d} har samma stam`;
  if (d.length > 16) return `${d}: för långt för en rad`;
  if (prefix(d, facit) >= 3 && Math.abs(d.length - facit.length) <= 2 && [...d].filter((c, i) => c !== facit[i]).length <= 2) return `${d} liknar facit i stavningen`;
  return null;
}

/**
 * Betydelsen som passar uppgiften när SO:s första betydelse är en annan
 * (index i SO:s huvudbetydelser). Granskat för hand 2026-11-19.
 */
const BETYDELSE = {};
/**
 * Handskrivna definitioner där SO:s text inte passar exemplet (facit_betyder),
 * med uppslagsordet som nyckel. Allt annat är SO:s eller SAOL:s egen text.
 */
const HANDSKRIVET = {
  // grund
  också: 'likaså, på samma sätt',
  ämne: 'det som något handlar om',
  tanke: 'infall eller förslag om hur något kan göras',
  problem: 'något som är svårt att lösa eller klara av',
  förvåna: 'göra någon häpen genom något oväntat',
  ledig: 'som någon redan använder eller har bokat',
  fel: 'på ett riktigt sätt',
  // avancerad
  fokusera: 'samla all uppmärksamhet på något',
  faktura: 'skriftligt krav på betalning för vara eller tjänst',
  konkurrent: 'den som tävlar med någon om samma sak',
  dagordning: 'lista över det som ska tas upp på ett möte',
  attityd: 'inställning eller förhållningssätt till något',
  gedigen: 'pålitlig och av god kvalitet',
  förbud: 'lov att göra något',
  högtidlig: 'enkel och vanlig, utan festliga inslag',
  // expert
  ambiguitet: 'det att något kan förstås på mer än ett sätt',
  kurant: 'som lätt går att sälja',
  kongruens: 'fullständig likhet mellan två saker',
  dominant: 'som bara märks om anlaget ärvs från båda föräldrarna',
  fertil: 'som inte kan få avkomma',
  // testansvarigs granskning 2026-11-19 (docs/fragebank/ordforrad-2026-11-19-omg3-granskning.md)
  inhibera: 'ställa in eller förklara ogiltig',
  signifikant: 'som har stor vikt eller verkan',
  kontradiktion: 'det att två påståenden inte kan vara sanna samtidigt',
  ihålig: 'helt igenom av samma material, utan hålrum',
  adekvat: 'precis rätt för det som efterfrågas',
  beakta: 'lägga märke till och ta hänsyn till',
  rationell: 'klok och genomtänkt',
  animositet: 'stark ovilja och motsättning mellan två parter',
  perception: 'det att uppfatta något med sinnena',
  tvist: 'livlig diskussion där parterna envist hävdar sina argument',
  spänd: 'som hänger löst och inte är sträckt',
};
/** Distraktorer som SO bara har som "jämför" och som granskats som inte synonyma. */
const GRANSKAD_INTE_SYNONYM = new Set();
const GRANSKAD_MOTSATS = new Set();
/** Misstagstexter skrivna för hand där SO:s definition inte passar uppgiften (nyckel ord:distraktor). */
const MISSTAG = {
  // grund
  'tycka:lova': 'Lova betyder säga att man säkert ska göra något.',
  'betydelse:böjning': 'Böjning betyder ett ords olika former, till exempel plural.',
  'problem:kalender': 'Kalender betyder bok eller lista med årets dagar där man skriver upp möten.',
  'verktyg:ritning': 'Ritning betyder bild som visar hur något ska byggas eller tillverkas.',
  'sjukdom:behandling': 'Behandling betyder vård som ska bota eller lindra besvär.',
  'sjukdom:medicin': 'Medicin betyder läkemedel.',
  'vass:böjd': 'Böjd betyder som har en böj eller kurva.',
  'jämn:negativ': 'Negativ betyder mindre än noll.',
  'färsk:svensk': 'Svensk betyder som kommer från Sverige.',
  'färsk:ekologisk': 'Ekologisk betyder framställd utan kemiska bekämpningsmedel och konstgödsel.',
  'fel:ihop': 'Ihop betyder så att något förenas eller läggs samman.',
  'ensamhet:noggrannhet': 'Noggrannhet betyder omsorg om att allt blir rätt i detalj.',
  'ensamhet:nyfikenhet': 'Nyfikenhet betyder lust att få veta mer.',
  'ensamhet:ärlighet': 'Ärlighet betyder egenskapen att säga sanningen.',
  // avancerad
  'förverkliga:presentera': 'Presentera betyder visa upp eller lägga fram något för andra.',
  'tvist:lottning': 'Lottning betyder att slumpen får avgöra, till exempel genom att man drar lott.',
  'attityd:bakgrund': 'Bakgrund betyder det som har hänt tidigare och som förklarar något.',
  'nedsättande:långrandig': 'Långrandig betyder alltför lång och tråkig.',
  'triumf:domare': 'Domare betyder person som leder en match och ser till att reglerna följs.',
  'fokusera:kopiera': 'Kopiera betyder framställa en likadan version av något.',
  'beakta:kommentera': 'Kommentera betyder säga eller skriva vad man tycker om något.',
  'beakta:rapportera': 'Rapportera betyder lämna en redogörelse för vad som har hänt eller gjorts.',
  'dagordning:omröstning': 'Omröstning betyder beslut som fattas genom att de närvarande röstar.',
  'attityd:uppväxt': 'Uppväxt betyder barndom och ungdom.',
  'absolut:filosofisk': 'Filosofisk betyder som rör grundläggande frågor om tillvaron och kunskapen.',
  'inhemsk:ekologisk': 'Ekologisk betyder framställd utan kemiska bekämpningsmedel och konstgödsel.',
  // expert
  'adekvat:kronologisk': 'Kronologisk betyder ordnad efter tid.',
  'adekvat:litterär': 'Litterär betyder som rör böcker och skönlitteratur.',
  'alternera:kopiera': 'Kopiera betyder framställa en likadan version av något.',
  'eterisk:ekologisk': 'Ekologisk betyder framställd utan kemiska bekämpningsmedel och konstgödsel.',
  'pittoresk:kommunal': 'Kommunal betyder som sköts eller ägs av en kommun.',
  'ambiguitet:överdrift': 'Överdrift betyder beskrivning som gör något större eller värre än det är.',
  'ambiguitet:förenkling': 'Förenkling betyder framställning som gör något enklare än det är.',
  'ambiguitet:upprepning': 'Upprepning betyder det att säga eller göra samma sak en gång till.',
  'prognos:redovisning': 'Redovisning betyder sammanställning av hur pengar har använts.',
  'prognos:jämförelse': 'Jämförelse betyder bedömning av likheter och skillnader.',
  'animositet:nyfikenhet': 'Nyfikenhet betyder lust att få veta mer.',
  'animositet:blyghet': 'Blyghet betyder osäkerhet och tillbakadragenhet i kontakt med andra.',
  'animositet:nervositet': 'Nervositet betyder oro och spänning inför något.',
  'aversion:lojalitet': 'Lojalitet betyder trofasthet mot någon eller något.',
  'melankoli:stolthet': 'Stolthet betyder glädje och självkänsla över något man gjort.',
  'kontext:översättning': 'Översättning betyder överföring av en text till ett annat språk.',
  'alternera:protestera': 'Protestera betyder säga ifrån att man är emot något.',
  'allokera:revidera': 'Revidera betyder granska och vid behov ändra.',
  'inhibera:isolera': 'Isolera betyder skilja ut och hålla avskilt från annat.',
  'attrahera:isolera': 'Isolera betyder skydda mot att värme, ljud eller elektricitet leds vidare.',
  'mild:tålig': 'Tålig betyder som tål slitage och påfrestningar.',
  'fertil:välbyggd': 'Välbyggd betyder som har en stark och välformad kropp.',
  // testansvarigs granskning 2026-11-19 (omgång 3)
  'förvåna:irritera': 'Irritera betyder reta upp eller göra otålig.',
  'hemsk:tålmodig': 'Tålmodig betyder som kan vänta länge utan att bli otålig.',
  'ledig:vinglig': 'Vinglig betyder som står ostadigt och svajar.',
  'konkurrent:grossist': 'Grossist betyder företag som köper varor i stora partier och säljer dem vidare till butiker.',
  'förbruka:leverera': 'Leverera betyder lämna över en vara till den som har köpt den.',
  'stelna:mogna': 'Mogna betyder bli färdig att äta eller skörda.',
  'kortvarig:lyckad': 'Lyckad betyder som blev så bra som man hade tänkt sig.',
  'högtidlig:lyckad': 'Lyckad betyder som blev så bra som man hade tänkt sig.',
  'avhängig:ansvarig': 'Ansvarig betyder som ska se till att något blir gjort och står för följderna.',
  'avhängig:missnöjd': 'Missnöjd betyder som tycker att något inte är tillräckligt bra.',
  'egocentrisk:entusiastisk': 'Entusiastisk betyder som visar stor iver och glädje inför något.',
  'fackman:finansiär': 'Finansiär betyder person eller institution som står för pengarna till något.',
  'fackman:beställare': 'Beställare betyder person eller organisation som ger någon i uppdrag att leverera eller utföra något.',
  'inhibera:analysera': 'Analysera betyder undersöka något noga genom att dela upp det i delar.',
  'inhibera:kartlägga': 'Kartlägga betyder undersöka och beskriva hur något ser ut.',
  'inhibera:inventera': 'Inventera betyder gå igenom och förteckna det som finns.',
  'lovord:påminnelse': 'Påminnelse betyder meddelande som får någon att komma ihåg något.',
  'attrahera:oxidera': 'Oxidera betyder få ett ämne att reagera med syre, som när järn rostar.',
  'dominant:avvikande': 'Avvikande betyder som tydligt skiljer sig från det vanliga.',
  'försynt:kunnig': 'Kunnig betyder som vet och kan mycket inom något område.',
};
/**
 * Självförklaring: ett ord i texten som delar stam med w (minst fem gemensamma
 * första bokstäver, eller samma första bokstav och samma tre första konsonanter,
 * som tålmodig och tålamod, mogna och mogen) och som inte är ett klart kortare
 * grundord. Fångar "Irritera betyder orsaka irritation", "Analysera betyder göra
 * analys av" och "Kunnig betyder som har kunnande". Returnerar ordet eller null.
 */
const konsonanter = (w) => w.replace(/[aeiouyåäöé]/g, '').slice(0, 3);
function sjalvforklarad(w, text) {
  for (const t of (text ?? '').toLowerCase().match(/[a-zåäöé]+/g) ?? []) {
    if (t.length < 4 || w.length < 4) continue;
    // ett kort grundord i en sammansättning eller avledning (rost i rostig, smärta i smärtsam) räknas inte
    if (t.length < w.length - 2 && prefix(t, w) < 6) continue;
    if (prefix(t, w) >= Math.min(5, w.length - 1)) return t;
    if (prefix(t, w) >= 4 && t.length > w.length) return t; // oxidera och oxidation
    if (t[0] === w[0] && konsonanter(t).length === 3 && konsonanter(t) === konsonanter(w)) return t;
  }
  return null;
}
/**
 * Självförklaringar som granskats och får stå: förklaringsordet är ett grundord
 * som alla kan, eller träffen är ett annat ord (bland, prestation). Alla är
 * godkända i testansvarigs granskning av omgång 3. Nyckel ord:träff. Nya
 * träffar ska läggas till här bara efter granskning.
 */
const GODKAND_SJALV = new Set([
  'blank:bland', 'blommig:blommor', 'fräsch:friska', 'fuktig:fukt', 'färgglad:färger', 'giftig:gift',
  'gäst:gäster', 'gästfri:gäster', 'kassör:kassan', 'kommunal:kommun', 'krokig:krökt', 'kryddig:krydda',
  'känslosam:känslor', 'ljudnivå:ljudstyrka', 'markera:märka', 'mossig:mossa', 'musikal:musikteater', 'norr:norra',
  'omgivning:omgivande', 'omtänksam:omtanke', 'prickig:prickar', 'pris:prestation', 'prisvärd:priset', 'procentsats:procent',
  'randig:ränder', 'registrera:register', 'regnig:regnande', 'rosta:rost', 'rostig:rost', 'smärtfri:smärta',
  'smärtsam:smärta', 'stavfel:stavning', 'tacksam:tacka', 'tidsplan:tidsåtgång', 'trivsam:trevnad', 'tullfri:tullavgift',
  'utländsk:utlandet',
]);
const definition = async (w, klass) => {
  const I = await info(w);
  const e = iKlass(I, klass).find((x) => x.kalla === 'SO' && x.definitioner.length) ?? iKlass(I, klass).find((x) => x.definitioner.length);
  return e ? { text: e.definitioner[Math.min(BETYDELSE[w] ?? 0, e.definitioner.length - 1)], flera: e.definitioner.length > 1 } : null;
};
/** facit_betyder: SO:s definition av facit; är den tom eller bara ordet själv används uppslagsordets definition. */
async function facitBetyder(ord, facit, klass) {
  if (HANDSKRIVET[ord]) return HANDSKRIVET[ord];
  const f = (await definition(facit, klass))?.text ?? '';
  const ord1 = f.toLowerCase().match(/[a-zåäöé]+/g) ?? [];
  if (!f || ord1.includes(ord) || ord1.length <= 1) return (await definition(ord, klass))?.text ?? f;
  return f;
}

// ------------------------------------------------------------ körning
const kand = JSON.parse(readFileSync(KANDIDATER, 'utf8'));
const godkanda = [];
const avvisade = [];
const nyaUppslag = new Set();
for (const k of kand) {
  const karna = await provaKarna(k);
  if (karna.skal) {
    avvisade.push({ ...k, skal: karna.skal });
    continue;
  }
  if (nyaUppslag.has(karna.ord) || nyaUppslag.has(karna.facit)) {
    avvisade.push({ ...k, skal: ['ord eller facit finns redan bland kandidaterna'] });
    continue;
  }
  if (baraKarna) {
    console.log(`OK ${k.niva}-${k.typ} ${karna.ord}=${karna.facit} pop ${karna.pop} facitpop ${Math.max(0, ...iKlass(karna.F, karna.klass).map((e) => e.pop))}: ${karna.belagg[0].text}`);
    nyaUppslag.add(karna.ord);
    nyaUppslag.add(karna.facit);
    continue;
  }
  const skal = [];
  for (const d of k.distraktorer) {
    if (d.typ === 'antonym' || d.typ === 'synonym') skal.push(`${d.ord}: motsats- och synonymdistraktorer används inte i version 4`);
    if (d.typ === 'synonym' && k.typ !== 'antonym') skal.push(`${d.ord} märkt synonym i en synonymuppgift`);
    const fel = await provaDistraktor(k, karna, d.ord, d.typ);
    if (fel) skal.push(fel);
    const D = await info(d.ord);
    if (GRANSKAD_MOTSATS.has(`${karna.ord}:${d.ord}`) && k.typ === 'synonym' && k.niva !== 'grund') d.typ = 'antonym';
    else if (d.typ === 'antonym' && !relaterade(karna.O, D, karna.ord, d.ord, 'antonym', karna.klass)) d.typ = 'annan';
    if (d.typ === 'synonym' && !relaterade(karna.O, D, karna.ord, d.ord, 'synonym', karna.klass, { breda: false })) skal.push(`${d.ord} är märkt synonym men saknar belägg i SO, SAOL eller Wiktionary`);
  }
  // OF3 mellan distraktorerna
  for (let a = 0; a < 4; a++)
    for (let b = a + 1; b < 4; b++) {
      const x = k.distraktorer[a].ord;
      const y = k.distraktorer[b].ord;
      if (prefix(x, y) >= 5) skal.push(`OF5 ${x} och ${y} har samma stam`);
      else if (relaterade(await info(x), await info(y), x, y, 'synonym', karna.klass, { breda: false })) skal.push(`OF3 ${x} och ${y} är synonymer`);
    }
  // version 4: motsatsord på expert får inte gå att lösa på formen
  if (k.niva === 'expert' && k.typ === 'antonym') {
    const f = form(karna.ord, karna.facit);
    if (f >= 3 && k.distraktorer.filter((d) => form(karna.ord, d.ord) >= f).length < 2) skal.push(`formen avslöjar facit (${karna.facit} delar ${f} bokstäver med ${karna.ord}, färre än två distraktorer gör det)`);  }
  // OF7: högst två gånger per nivå
  const anv = somAlt[k.niva];
  for (const w of [karna.facit, ...k.distraktorer.map((d) => d.ord)]) if ((anv.get(w) ?? 0) >= 2) skal.push(`OF7 ${w} är redan alternativ två gånger på ${k.niva}`);
  // texterna
  if (tankstreck.test(k.exempel) || !k.exempel.toLowerCase().includes(karna.ord.slice(0, Math.max(4, karna.ord.length - 2)))) skal.push('exempelmeningen saknar ordet eller har tankstreck');
  if (skal.length) {
    avvisade.push({ ...k, skal });
    continue;
  }
  const misstag = [];
  for (const d of k.distraktorer) {
    const def = await definition(d.ord, karna.klass);
    const bet = def.flera ? 'betyder bland annat' : 'betyder';
    if (MISSTAG[`${karna.ord}:${d.ord}`]) misstag.push(MISSTAG[`${karna.ord}:${d.ord}`]);
    else if (d.typ === 'antonym') misstag.push(`Det är motsatsen. ${stor(d.ord)} ${bet} ${def.text}.`);
    else if (d.typ === 'synonym') misstag.push(`${stor(d.ord)} betyder ungefär detsamma som ${karna.ord}, inte motsatsen.`);
    else misstag.push(`${stor(d.ord)} ${bet} ${def.text}.`);
  }
  if (misstag.some((m) => tankstreck.test(m))) {
    avvisade.push({ ...k, skal: ['tankstreck i SO:s definition'] });
    continue;
  }
  const fb = await facitBetyder(karna.ord, karna.facit, karna.klass);
  // version 4: ingen text får förklara ordet med sig självt ("Irritera betyder orsaka irritation")
  const sjalv = [
    ...k.distraktorer.map((d, i) => [d.ord, misstag[i].split(' betyder ').slice(1).join(' betyder '), `misstagstexten för ${d.ord}`]),
    [karna.facit, fb, 'facittexten'],
    [karna.ord, fb, 'facittexten (uppslagsordet)'],
  ]
    .map(([w, text, var_]) => [w, sjalvforklarad(w, text), var_])
    .filter(([w, traff]) => traff && !GODKAND_SJALV.has(`${w}:${traff}`))
    .map(([w, traff, var_]) => `${var_} förklarar ${w} med ${traff}`);
  if (sjalv.length) {
    avvisade.push({ ...k, skal: sjalv });
    continue;
  }
  nyaUppslag.add(karna.ord);
  nyaUppslag.add(karna.facit);
  [karna.facit, ...k.distraktorer.map((d) => d.ord)].forEach((w) => anv.set(w, (anv.get(w) ?? 0) + 1));
  godkanda.push({
    k,
    karna,
    misstag,
    facit_betyder: fb,
    kalla: {
      verifierad_mot: karna.tvaKallor ? 'Wiktionary och synonymer.se (SO och SAOL saknar uppgiften)' : [...new Set(karna.belagg.map((b) => b.text.split(/[ :]/)[0]))].join(' och '),
      belagg: karna.belagg.map((b) => b.text),
      so_id: iKlass(karna.O, karna.klass).find((e) => e.kalla === 'SO')?.id ?? null,
      hamtad: new Date().toISOString().slice(0, 10),
    },
  });
}

// id, blandning och utskrift
const nya = {};
for (const n of NIVAER) {
  const nr = {};
  for (const q of banker[n]) {
    const t = q.typ;
    nr[t] = Math.max(nr[t] ?? 0, Number(q.id.split('-')[3]));
  }
  nya[n] = [];
  for (const g of godkanda.filter((x) => x.k.niva === n)) {
    const { k, karna } = g;
    const alt = [{ ord: karna.facit, typ: '', misstag: '' }, ...k.distraktorer.map((d, i) => ({ ord: d.ord, typ: d.typ, misstag: g.misstag[i] }))];
    const rng = mulberry32(hashString(`ordforrad-v4:${n}:${karna.ord}`));
    for (let i = alt.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [alt[i], alt[j]] = [alt[j], alt[i]];
    }
    nr[k.typ] = (nr[k.typ] ?? 0) + 1;
    nya[n].push({
      id: `of-${KORT[n]}-${KORT[k.typ]}-${String(nr[k.typ]).padStart(2, '0')}`,
      niva: n,
      typ: k.typ,
      ord: karna.ord,
      ordklass: karna.klass,
      options: alt.map((a) => a.ord),
      correctAnswer: alt.findIndex((a) => a.typ === ''),
      typer: alt.map((a) => a.typ),
      misstag: alt.map((a) => a.misstag),
      facit_betyder: g.facit_betyder,
      exempel: k.exempel,
      kalla: g.kalla,
      popularitet: karna.pop,
      granskning: {
        of2_ordklass: karna.klass,
        of3_parvis: 'ingen distraktor är synonym, motsats eller jämför-ord till ordet eller synonym till facit i SO, SAOL, Wiktionary eller synonymer.se, inga synonympar mellan distraktorerna i SO, SAOL eller Wiktionary',
        of6_stil: 'ingen stilmarkering i SO eller SAOL',
        kandidat_fran: k.kalla_kandidat,
        ifyllda_distraktorer: 0,
      },
      fran_version: VERSION,
    });
  }
}

for (const a of avvisade) console.log(`AVVISAD ${a.niva}-${a.typ} ${a.ord}=${a.facit}: ${a.skal.join('; ')}`);
for (const n of NIVAER) console.log(`${n}: ${nya[n].filter((q) => q.typ === 'synonym').length} synonymer, ${nya[n].filter((q) => q.typ === 'antonym').length} motsatsord godkända`);
console.log(`${kand.length} kandidater, ${godkanda.length} godkända, ${avvisade.length} avvisade`);
if (!torr) {
  for (const n of NIVAER) writeFileSync(fil(n), JSON.stringify([...banker[n], ...nya[n]], null, 1) + '\n');
  writeFileSync(AVVISADE, JSON.stringify(avvisade.map(({ niva, typ, ord, facit, skal }) => ({ niva, typ, ord, facit, skal })), null, 1) + '\n');
}
