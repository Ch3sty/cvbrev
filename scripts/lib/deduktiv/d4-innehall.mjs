// scripts/lib/deduktiv/d4-innehall.mjs
// =============================================================================
// Innehållet i D4 som skrivs för hand (omgång 3, bankversion 5):
//   OMSA     villkorskedjor: atomerna och skelettet per uppgift. Texten,
//            alternativen och lösningen byggs av gen-deduktiv-omg3.mjs.
//   KVANTOR  syllogismer med alla, några och ingen: allt för hand, statusen
//            räknas av mängdmodellen och ska stämma med rollerna.
//
// Skelett: 'p' fakta, '-p' negerad fakta, 'p>q' om p så q, '-p>-q' osv.
// Atomerna heter p, q, r, s, t i den ordningen. Varje uppgift har en egen
// lösningsgång (se docs/fragebank/deduktiv-2026-11-19-omg3.md).
// =============================================================================

const A = (s, v, r = '') => ({ s, v, r });

export const OMSA = [
  // ------------------------------- grund --------------------------------
  {
    niva: 'grund', gang: 'två steg framåt',
    atomer: [A('Anna', 'jobbar', 'på lördag'), A('Bo', 'får', 'ledigt på måndag'), A('Cilla', 'öppnar', 'butiken på måndag')],
    prem: ['p>q', 'q>-r', 'p'], fraga: 'maste', facit: '-r',
  },
  {
    niva: 'grund', gang: 'två steg bakåt',
    atomer: [A('lagret', 'får', 'leveransen i dag'), A('Dan', 'packar', 'om hyllorna'), A('inventeringen', 'flyttas', 'till fredag')],
    prem: ['p>-q', '-q>r', '-r'], fraga: 'maste', facit: '-p',
  },
  {
    niva: 'grund', gang: 'ett steg framåt, ett bakåt',
    atomer: [A('mötet', 'börjar', 'klockan nio'), A('Eva', 'tar', 'tåget klockan sju'), A('Eva', 'jobbar', 'hemifrån')],
    prem: ['p>q', 'r>-q', 'p'], fraga: 'maste', facit: '-r',
  },
  {
    niva: 'grund', gang: 'framåt med om inte, fälla i det andra villkoret',
    atomer: [A('det', 'regnar', 'på fredag'), A('grillfesten', 'flyttas', 'inomhus'), A('Gun', 'hyr', 'parasoller')],
    prem: ['p>q', '-p>r', '-p'], fraga: 'maste', facit: 'r',
  },
  {
    niva: 'grund', gang: 'ett steg bakåt, ett framåt',
    atomer: [A('kontoret', 'stänger', 'i juli'), A('växeln', 'är', 'öppen i juli'), A('Ida', 'tar', 'semester i augusti')],
    prem: ['p>-q', '-p>r', 'q'], fraga: 'maste', facit: 'r',
  },
  {
    niva: 'grund', gang: 'bakåt i en gaffel',
    atomer: [A('Jonas', 'får', 'tjänsten'), A('familjen', 'flyttar', 'till Umeå'), A('Jonas', 'säger', 'upp sig från lagret')],
    prem: ['p>q', 'p>r', '-r'], fraga: 'maste', facit: '-p',
  },
  {
    niva: 'grund', gang: 'bakåt genom om inte, fälla i förledet',
    atomer: [A('Karin', 'leder', 'mötet'), A('protokollet', 'skickas', 'ut i dag'), A('Leo', 'påminner', 'gruppen i morgon')],
    prem: ['p>q', '-q>r', '-r'], fraga: 'maste', facit: 'q',
  },
  // ----------------------------- avancerad ------------------------------
  {
    niva: 'avancerad', gang: 'framåt, sedan två steg bakåt',
    atomer: [A('Nora', 'vinner', 'upphandlingen'), A('teamet', 'anställer', 'två konsulter'), A('budgeten', 'räcker', 'till utbildningen'), A('styrelsen', 'godkänner', 'utbildningen')],
    prem: ['p>q', 'q>-r', 's>r', 's'], fraga: 'maste', facit: '-p',
  },
  {
    niva: 'avancerad', gang: 'kedja som vänds (kontraposition av slutsatsen)',
    atomer: [A('Olle', 'byter', 'avdelning'), A('Olle', 'får', 'ett nytt passerkort'), A('it-avdelningen', 'skickar', 'ett mejl till Olle')],
    prem: ['p>q', 'q>r'], fraga: 'maste', facit: '-r>-p',
  },
  {
    niva: 'avancerad', gang: 'ett villkor vänds, sedan kedja',
    atomer: [A('projektet', 'förlängs'), A('Pia', 'stannar', 'kvar i gruppen'), A('Pia', 'får', 'ett nytt avtal')],
    prem: ['p>q', '-r>-q'], fraga: 'maste', facit: 'p>r',
  },
  {
    niva: 'avancerad', gang: 'två kedjor som krockar',
    atomer: [A('Rut', 'åker', 'på mässan'), A('Rasmus', 'håller', 'i styrgruppen'), A('Rasmus', 'visar', 'kunden runt'), A('kunden', 'besöker', 'kontoret')],
    prem: ['p>q', 'r>-q', 's>r'], fraga: 'kan_inte', facit: 'p&s',
  },
  // ------------------------------- expert -------------------------------
  {
    niva: 'expert', gang: 'fallanalys: båda fallen ger samma sak',
    atomer: [A('Sven', 'hinner', 'med flyget'), A('mötet', 'hålls', 'digitalt'), A('presentationen', 'spelas', 'in')],
    prem: ['p>r', '-p>q', 'q>r'], fraga: 'maste', facit: 'r',
  },
  {
    niva: 'expert', gang: 'motsägelse: ett antagande ger två saker som inte går ihop',
    atomer: [A('Vera', 'blir', 'chef'), A('Vera', 'flyttar', 'till Malmö'), A('Vera', 'behåller', 'sin plats i Stockholmsgruppen')],
    prem: ['p>q', 'p>r', 'q>-r'], fraga: 'maste', facit: '-p',
  },
];

/* --------------------------------- kvantor ---------------------------------- */
// [typ, x, y] för alla, inga, nagra, nagra_inte; [typ, individ, x] för ar, ar_inte.
const S = (typ, a, b) => (typ === 'ar' || typ === 'ar_inte' ? { typ, i: a, x: b } : { typ, x: a, y: b });
const P = (text, ...satser) => ({ text, formell: satser.map((s) => S(...s)) });
const Alt = (text, sats, misstag = '') => ({ text, formell: S(...sats), misstag });
const G = (premisser, text) => ({ premisser, text });

export const KVANTOR_INTRO = 'Ordet några betyder här minst en, kanske alla.';

export const KVANTOR = [
  {
    niva: 'grund', fraga: 'kan_inte', gang: 'två alla i kedja, det omöjliga bryter kedjan',
    termer: ['salj', 'bil', 'halka'], individer: [],
    premisser: [
      P('Alla säljare har tjänstebil.', ['alla', 'salj', 'bil']),
      P('Alla som har tjänstebil har gått halkkursen.', ['alla', 'bil', 'halka']),
    ],
    alternativ: [
      Alt('Någon säljare har inte gått halkkursen.', ['nagra_inte', 'salj', 'halka']),
      Alt('Några som har gått halkkursen är inte säljare.', ['nagra_inte', 'halka', 'salj'], 'Det kan stämma. Villkoren säger att säljarna har gått kursen, inte att alla som har gått den är säljare.'),
      Alt('Alla som har gått halkkursen är säljare.', ['alla', 'halka', 'salj'], 'Det kan stämma. Villkoren utesluter inte att ingen annan än säljarna har gått kursen, men de kräver det inte heller.'),
      Alt('Några som har tjänstebil är inte säljare.', ['nagra_inte', 'bil', 'salj'], 'Det kan stämma. Villkor 1 säger att säljarna har tjänstebil, inte att andra saknar det.'),
      Alt('Alla som har tjänstebil är säljare.', ['alla', 'bil', 'salj'], 'Det kan stämma. Det vänder på villkor 1, och villkoren utesluter det inte.'),
    ],
    steg: [
      G([1, 2], 'Varje säljare har tjänstebil, och alla med tjänstebil har gått halkkursen. Alltså har alla säljare gått halkkursen.'),
      G([], 'Då kan det inte finnas en säljare som inte har gått kursen. De andra alternativen säger något om dem som inte är säljare, och det säger villkoren inget om.'),
    ],
  },
  {
    niva: 'grund', fraga: 'foljer_inte', gang: 'några och alla med en person, fällan gör personen till en av de några',
    termer: ['kassa', 'kurs', 'student'], individer: ['ida'],
    premisser: [
      P('Alla som jobbar i kassan har gått kassakursen.', ['alla', 'kassa', 'kurs']),
      P('Några studenter jobbar i kassan.', ['nagra', 'student', 'kassa']),
      P('Ida jobbar i kassan.', ['ar', 'ida', 'kassa']),
    ],
    alternativ: [
      Alt('Några studenter har gått kassakursen.', ['nagra', 'student', 'kurs'], 'Det följer. De studenter som jobbar i kassan har gått kursen.'),
      Alt('Några som jobbar i kassan är studenter.', ['nagra', 'kassa', 'student'], 'Det följer av villkor 2, sett från andra hållet.'),
      Alt('Ida har gått kassakursen.', ['ar', 'ida', 'kurs'], 'Det följer. Ida jobbar i kassan, och alla där har gått kursen.'),
      Alt('Några som har gått kassakursen jobbar i kassan.', ['nagra', 'kurs', 'kassa'], 'Det följer. Det finns folk i kassan, och alla de har gått kursen.'),
      Alt('Ida är student.', ['ar', 'ida', 'student']),
    ],
    steg: [
      G([1, 3], 'Ida jobbar i kassan och har alltså gått kassakursen.'),
      G([1, 2], 'Några studenter jobbar i kassan, och de har gått kassakursen.'),
      G([2, 3], 'Både Ida och några studenter jobbar i kassan, men det säger inte att Ida är en av studenterna. Den slutsatsen följer inte.'),
    ],
  },
  {
    niva: 'grund', fraga: 'foljer_inte', gang: 'alla och ingen bakåt från en person, fällan läser in mer än det står',
    termer: ['jour', 'larm', 'semester'], individer: ['ulf'],
    premisser: [
      P('Alla som har jour bär larmtelefon.', ['alla', 'jour', 'larm']),
      P('Ingen som bär larmtelefon är på semester.', ['inga', 'larm', 'semester']),
      P('Ulf är på semester.', ['ar', 'ulf', 'semester']),
    ],
    alternativ: [
      Alt('Ulf bär inte larmtelefon.', ['ar_inte', 'ulf', 'larm'], 'Det följer. Ulf är på semester, och ingen som bär larmtelefon är det.'),
      Alt('Ulf har inte jour.', ['ar_inte', 'ulf', 'jour'], 'Det följer. Den som har jour bär larmtelefon, och det gör inte Ulf.'),
      Alt('Ingen som har jour är på semester.', ['inga', 'jour', 'semester'], 'Det följer. Den som har jour bär larmtelefon, och ingen som gör det är på semester.'),
      Alt('Några som är på semester bär inte larmtelefon.', ['nagra_inte', 'semester', 'larm'], 'Det följer. Ulf är på semester och bär ingen larmtelefon.'),
      Alt('Några som bär larmtelefon har inte jour.', ['nagra_inte', 'larm', 'jour']),
    ],
    steg: [
      G([2, 3], 'Ulf är på semester, och ingen som bär larmtelefon är på semester. Alltså bär Ulf ingen larmtelefon.'),
      G([1], 'Den som har jour bär larmtelefon. Ulf bär ingen, alltså har Ulf inte jour. Av samma skäl är ingen med jour på semester.'),
      G([], 'Villkoren säger inget om vem mer än de med jour som bär larmtelefon. Att några som bär den saknar jour följer alltså inte.'),
    ],
  },
  {
    niva: 'grund', fraga: 'foljer_inte', gang: 'två ingen och en person, fällan drar slutsats ur två nej',
    termer: ['kundtj', 'helg', 'flex'], individer: ['pia'],
    premisser: [
      P('Ingen i kundtjänst arbetar på helger.', ['inga', 'kundtj', 'helg']),
      P('Ingen som arbetar på helger har flextid.', ['inga', 'helg', 'flex']),
      P('Pia arbetar på helger.', ['ar', 'pia', 'helg']),
    ],
    alternativ: [
      Alt('Pia arbetar inte i kundtjänst.', ['ar_inte', 'pia', 'kundtj'], 'Det följer. Pia arbetar på helger, och ingen i kundtjänst gör det.'),
      Alt('Pia har inte flextid.', ['ar_inte', 'pia', 'flex'], 'Det följer. Pia arbetar på helger, och ingen som gör det har flextid.'),
      Alt('Ingen med flextid arbetar på helger.', ['inga', 'flex', 'helg'], 'Det följer av villkor 2, sett från andra hållet.'),
      Alt('Några som arbetar på helger är inte i kundtjänst.', ['nagra_inte', 'helg', 'kundtj'], 'Det följer. Pia arbetar på helger och är inte i kundtjänst.'),
      Alt('Ingen i kundtjänst har flextid.', ['inga', 'kundtj', 'flex']),
    ],
    steg: [
      G([1, 3], 'Pia arbetar på helger, och ingen i kundtjänst gör det. Alltså är Pia inte i kundtjänst.'),
      G([2, 3], 'Ingen som arbetar på helger har flextid, så Pia har ingen.'),
      G([1, 2], 'Kundtjänst och flextid hör båda ihop med helger, men i båda fallen med ett ingen. Om kundtjänst och flextid säger villkoren alltså inget. Att ingen i kundtjänst har flextid följer inte.'),
    ],
  },
  {
    niva: 'grund', fraga: 'kan_inte', gang: 'två alla med samma början och en person',
    termer: ['kurs', 'bok', 'inlogg'], individer: ['hugo'],
    premisser: [
      P('Alla deltagare i ledarkursen har fått kursboken.', ['alla', 'kurs', 'bok']),
      P('Alla deltagare i ledarkursen har fått en inloggning.', ['alla', 'kurs', 'inlogg']),
      P('Hugo är deltagare i ledarkursen.', ['ar', 'hugo', 'kurs']),
    ],
    alternativ: [
      Alt('Ingen som har fått kursboken har fått en inloggning.', ['inga', 'bok', 'inlogg']),
      Alt('Alla som har fått kursboken har fått en inloggning.', ['alla', 'bok', 'inlogg'], 'Det kan stämma. Villkoren säger inget om dem som har fått boken utan att gå kursen.'),
      Alt('Några som har fått kursboken har inte fått en inloggning.', ['nagra_inte', 'bok', 'inlogg'], 'Det kan stämma. Någon utanför kursen kan ha fått boken men ingen inloggning.'),
      Alt('Alla som har fått kursboken är deltagare i ledarkursen.', ['alla', 'bok', 'kurs'], 'Det kan stämma. Det vänder på villkor 1, och villkoren utesluter det inte.'),
      Alt('Några som har fått en inloggning har fått kursboken.', ['nagra', 'inlogg', 'bok'], 'Det är sant. Hugo har fått båda.'),
    ],
    steg: [
      G([1, 2, 3], 'Hugo går ledarkursen och har alltså fått både kursboken och en inloggning.'),
      G([], 'Då finns det någon som har fått kursboken och en inloggning. Att ingen med kursboken har fått en inloggning kan alltså inte stämma.'),
    ],
  },
  // ----------------------------- avancerad ------------------------------
  {
    niva: 'avancerad', fraga: 'foljer_inte', gang: 'två några och ett alla, fällan kedjar två några',
    termer: ['salj', 'tyska', 'koln', 'test'], individer: [],
    premisser: [
      P('Några säljare talar tyska.', ['nagra', 'salj', 'tyska']),
      P('Några som talar tyska åker på mässan i Köln.', ['nagra', 'tyska', 'koln']),
      P('Alla som talar tyska har gjort språktestet.', ['alla', 'tyska', 'test']),
    ],
    alternativ: [
      Alt('Några säljare har gjort språktestet.', ['nagra', 'salj', 'test'], 'Det följer. De säljare som talar tyska har gjort testet.'),
      Alt('Några som åker på mässan i Köln har gjort språktestet.', ['nagra', 'koln', 'test'], 'Det följer. De som talar tyska och åker till Köln har gjort testet.'),
      Alt('Några som har gjort språktestet talar tyska.', ['nagra', 'test', 'tyska'], 'Det följer. Det finns de som talar tyska, och alla de har gjort testet.'),
      Alt('Några som talar tyska är säljare.', ['nagra', 'tyska', 'salj'], 'Det följer av villkor 1, sett från andra hållet.'),
      Alt('Några säljare åker på mässan i Köln.', ['nagra', 'salj', 'koln']),
    ],
    steg: [
      G([1, 3], 'Några säljare talar tyska, och alla som talar tyska har gjort språktestet. Alltså har några säljare gjort testet.'),
      G([2, 3], 'Några som talar tyska åker till Köln, och de har också gjort testet.'),
      G([1, 2], 'De säljare som talar tyska och de tysktalande som åker till Köln kan vara helt olika personer. Att några säljare åker till Köln följer alltså inte.'),
    ],
  },
  {
    niva: 'avancerad', fraga: 'kan_inte', gang: 'några inte och två alla i kedja',
    termer: ['tim', 'brand', 'ombud', 'kommitte'], individer: [],
    premisser: [
      P('Några timanställda har inte gått brandutbildningen.', ['nagra_inte', 'tim', 'brand']),
      P('Alla skyddsombud har gått brandutbildningen.', ['alla', 'ombud', 'brand']),
      P('Alla i skyddskommittén är skyddsombud.', ['alla', 'kommitte', 'ombud']),
    ],
    alternativ: [
      Alt('Alla timanställda sitter i skyddskommittén.', ['alla', 'tim', 'kommitte']),
      Alt('Ingen timanställd sitter i skyddskommittén.', ['inga', 'tim', 'kommitte'], 'Det kan stämma, men villkoren kräver det inte. De timanställda som har gått utbildningen kan sitta i kommittén.'),
      Alt('Några timanställda är skyddsombud.', ['nagra', 'tim', 'ombud'], 'Det kan stämma. De timanställda som har gått brandutbildningen kan vara skyddsombud.'),
      Alt('Alla som har gått brandutbildningen är skyddsombud.', ['alla', 'brand', 'ombud'], 'Det kan stämma. Det vänder på villkor 2, och villkoren utesluter det inte.'),
      Alt('Alla i skyddskommittén har gått brandutbildningen.', ['alla', 'kommitte', 'brand'], 'Det är sant. De i kommittén är skyddsombud, och alla skyddsombud har gått utbildningen.'),
    ],
    steg: [
      G([2, 3], 'Den som sitter i skyddskommittén är skyddsombud och har alltså gått brandutbildningen.'),
      G([1], 'Några timanställda har inte gått utbildningen. De kan inte sitta i kommittén, så alla timanställda kan inte göra det.'),
    ],
  },
  {
    niva: 'avancerad', fraga: 'foljer_inte', gang: 'några, ingen och alla från samma grupp',
    termer: ['vikarie', 'kassa', 'retur', 'intro'], individer: [],
    premisser: [
      P('Några sommarvikarier jobbar i kassan.', ['nagra', 'vikarie', 'kassa']),
      P('Ingen som jobbar i kassan hanterar returer.', ['inga', 'kassa', 'retur']),
      P('Alla sommarvikarier har gått introduktionen.', ['alla', 'vikarie', 'intro']),
    ],
    alternativ: [
      Alt('Några sommarvikarier hanterar inte returer.', ['nagra_inte', 'vikarie', 'retur'], 'Det följer. De sommarvikarier som jobbar i kassan hanterar inte returer.'),
      Alt('Några som har gått introduktionen jobbar i kassan.', ['nagra', 'intro', 'kassa'], 'Det följer. De sommarvikarier som jobbar i kassan har gått introduktionen.'),
      Alt('Några som har gått introduktionen hanterar inte returer.', ['nagra_inte', 'intro', 'retur'], 'Det följer. Sommarvikarierna i kassan har gått introduktionen och hanterar inte returer.'),
      Alt('Ingen som hanterar returer jobbar i kassan.', ['inga', 'retur', 'kassa'], 'Det följer av villkor 2, sett från andra hållet.'),
      Alt('Ingen sommarvikarie hanterar returer.', ['inga', 'vikarie', 'retur']),
    ],
    steg: [
      G([1, 2], 'Några sommarvikarier jobbar i kassan, och ingen i kassan hanterar returer. De sommarvikarierna hanterar alltså inte returer.'),
      G([3], 'Alla sommarvikarier har gått introduktionen, också de i kassan.'),
      G([], 'Om de sommarvikarier som inte jobbar i kassan säger villkoren inget. De kan hantera returer. Att ingen sommarvikarie gör det följer alltså inte.'),
    ],
  },
];
