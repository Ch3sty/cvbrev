// scripts/ordforrad/handskrivna.mjs
// =============================================================================
// Handskrivna kandidater till ordförrådsbanken (ägarens beslut 2026-11-09:
// inte Gemini, skrivna av motoragenten). Samma verifiering som förut i
// bygg-bank.mjs: facit mot SO eller SAOL, annars både Wiktionary och
// synonymer.se. Varje rad: [ord, ordklass, facit, [fyra distraktorer], exempel].
// En distraktor med "=" först är en synonym till ordet (typ synonym, bara i
// motsatsuppgifter), med "!" först motsatsen (typ antonym, bara i
// synonymuppgifter från avancerad). Övriga är ord ur samma fält.
//
// Kör: node scripts/ordforrad/handskrivna.mjs   (skriver kandidater/hand-*.json)
// =============================================================================

import { writeFileSync } from 'node:fs';

const A = 'adjektiv';
const S = 'substantiv';
const V = 'verb';
const ADV = 'adverb';

const RADER = {
  'grund-antonym': [
    ['billig', A, 'dyr', ['ny', 'stor', 'ful', 'sen'], 'Vi hittade en billig lägenhet nära stationen.'],
    ['stor', A, 'liten', ['bred', 'tung', 'ny', 'låg'], 'Det var en stor skillnad mellan förslagen.'],
    ['svag', A, 'stark', ['trött', 'sjuk', 'blek', 'tyst'], 'Signalen var för svag för att samtalet skulle gå fram.'],
    ['öppen', A, 'stängd', ['tom', 'ljus', 'fri', 'bred'], 'Butiken är öppen till klockan åtta på kvällen.'],
    ['fattig', A, 'rik', ['sjuk', 'ensam', 'snål', 'trött'], 'Han växte upp i en fattig familj på landet.'],
    ['ärlig', A, 'falsk', ['snäll', 'tyst', 'blyg', 'sträng'], 'Hon gav ett ärligt svar på en svår fråga.'],
    ['tidig', A, 'sen', ['snabb', 'kort', 'ny', 'kall'], 'Vi tog ett tidigt tåg för att hinna till mötet.'],
    ['framgång', S, 'motgång', ['tävling', 'vinst', 'chans', 'lycka'], 'Projektet blev en stor framgång för hela laget.'],
    ['början', S, 'slut', ['mitt', 'del', 'paus', 'start'], 'I början av veckan var det lugnt på kontoret.'],
    ['rak', A, 'krokig', ['bred', 'lång', 'jämn', 'platt'], 'Vägen var rak hela vägen fram till sjön.'],
    ['hungrig', A, 'mätt', ['trött', 'törstig', 'sjuk', 'glad'], 'Efter passet var alla hungriga.'],
    ['tunn', A, 'tjock', ['smal', 'mjuk', 'lätt', 'kort'], 'Isen var för tunn för att gå på.'],
    ['dag', S, 'natt', ['vecka', 'morgon', 'timme', 'kväll'], 'Hon arbetade hela dagen utan paus.'],
    ['vinter', S, 'sommar', ['höst', 'vår', 'snö', 'år'], 'Vintern var lång och kall det året.'],
    ['stiga', V, 'sjunka', ['växa', 'flyga', 'klättra', 'falla'], 'Priserna fortsatte att stiga under hösten.'],
    ['vild', A, 'tam', ['farlig', 'stark', 'arg', 'fri'], 'Det finns många vilda djur i skogen.'],
    ['lat', A, 'flitig', ['trött', 'snäll', 'tyst', 'glad'], 'Katten låg lat i solen hela eftermiddagen.'],
    ['ung', A, 'gammal', ['liten', 'frisk', 'ny', 'glad'], 'Hon var ung när hon flyttade till Stockholm.'],
    ['privat', A, 'offentlig', ['hemlig', 'personlig', 'dyr', 'enkel'], 'Det här är ett privat samtal.'],
    ['bra', A, 'dålig', ['stor', 'ny', 'snabb', 'rolig'], 'Det var en bra idé att boka i förväg.'],
  ],
  'grund-synonym': [
    ['arg', A, 'ilsken', ['ledsen', 'trött', 'rädd', 'stolt'], 'Han blev arg när bussen inte kom.'],
    ['klok', A, 'förståndig', ['snäll', 'ärlig', 'modern', 'flitig'], 'Det var ett klokt beslut att vänta.'],
    ['konstig', A, 'underlig', ['rolig', 'farlig', 'ovanlig', 'tråkig'], 'Det hördes ett konstigt ljud från motorn.'],
    ['försöka', V, 'pröva', ['lyckas', 'vänta', 'öva', 'välja'], 'Hon ville försöka igen nästa år.'],
    ['förstå', V, 'begripa', ['lyssna', 'minnas', 'förklara', 'tro'], 'Jag förstår inte vad du menar.'],
    ['välja', V, 'utse', ['köpa', 'byta', 'pröva', 'dela'], 'Laget fick välja en ny kapten.'],
    ['laga', V, 'reparera', ['bygga', 'tvätta', 'måla', 'ändra'], 'Han lagade cykeln på en kvart.'],
    ['jobb', S, 'arbete', ['lön', 'chef', 'kontor', 'semester'], 'Hon fick ett nytt jobb i våras.'],
    ['fel', S, 'misstag', ['olycka', 'fråga', 'skada', 'brist'], 'Det blev ett fel i räkningen.'],
    ['trött', A, 'utmattad', ['sjuk', 'hungrig', 'lat', 'ledsen'], 'Efter resan var alla trötta.'],
    ['duktig', A, 'skicklig', ['snäll', 'flitig', 'stark', 'glad'], 'Hon är duktig på att förklara.'],
    ['ilska', S, 'vrede', ['sorg', 'rädsla', 'glädje', 'skam'], 'Han kunde inte dölja sin ilska.'],
    ['rolig', A, 'lustig', ['glad', 'snäll', 'konstig', 'ovanlig'], 'Det var en rolig film.'],
    ['bestämma', V, 'besluta', ['föreslå', 'fråga', 'tänka', 'planera'], 'Vi måste bestämma oss före fredag.'],
    ['kanske', ADV, 'möjligen', ['aldrig', 'säkert', 'sällan', 'gärna'], 'Vi ses kanske på fredag.'],
    ['rädd', A, 'skrämd', ['arg', 'trött', 'ledsen', 'blyg'], 'Hunden var rädd för åskan.'],
    ['hel', A, 'oskadd', ['ren', 'ny', 'stor', 'tom'], 'Vasen var hel trots fallet.'],
    ['vänta', V, 'avvakta', ['stanna', 'hoppas', 'lyssna', 'sova'], 'Vi får vänta på besked från banken.'],
    ['smutsig', A, 'oren', ['blöt', 'gammal', 'mörk', 'trasig'], 'Golvet var smutsigt efter festen.'],
  ],
  'avancerad-antonym': [
    ['frivillig', A, 'obligatorisk', ['=självvald', 'kostsam', 'offentlig', 'tillfällig'], 'Kursen är frivillig men rekommenderas.'],
    ['implicit', A, 'explicit', ['=underförstådd', 'formell', 'abstrakt', 'teoretisk'], 'Det fanns ett implicit krav på övertid.'],
    ['subjektiv', A, 'objektiv', ['=personlig', 'teoretisk', 'abstrakt', 'kritisk'], 'Bedömningen blev alltför subjektiv.'],
    ['generell', A, 'specifik', ['=allmän', 'teoretisk', 'formell', 'abstrakt'], 'Regeln är generell och gäller alla avdelningar.'],
    ['kvalitativ', A, 'kvantitativ', ['teoretisk', 'empirisk', 'statistisk', 'praktisk'], 'Studien bygger på kvalitativa intervjuer.'],
    ['primär', A, 'sekundär', ['=främst', 'teoretisk', 'tillfällig', 'formell'], 'Säkerheten är vår primära uppgift.'],
    ['positiv', A, 'negativ', ['neutral', 'kritisk', 'tydlig', 'saklig'], 'Svaret från kunden var positivt.'],
    ['extrovert', A, 'introvert', ['=utåtriktad', 'självsäker', 'nervös', 'impulsiv'], 'Hon är extrovert och trivs i stora grupper.'],
    ['tillväxt', S, 'nedgång', ['=ökning', 'förändring', 'utveckling', 'stabilitet'], 'Företaget hade en stark tillväxt i fjol.'],
    ['försumma', V, 'sköta', ['=åsidosätta', 'kontrollera', 'avsluta', 'planera'], 'Han försummade sina plikter under hösten.'],
    ['acceptera', V, 'förkasta', ['=godta', 'diskutera', 'pröva', 'granska'], 'Styrelsen valde att acceptera förslaget.'],
    ['godkänna', V, 'underkänna', ['=bifalla', 'granska', 'pröva', 'bedöma'], 'Läraren godkände uppsatsen.'],
    ['befordra', V, 'degradera', ['anställa', 'utbilda', 'belöna', 'omplacera'], 'Hon befordrades till avdelningschef.'],
    ['anställa', V, 'avskeda', ['=rekrytera', 'utbilda', 'befordra', 'omplacera'], 'Företaget ska anställa tio nya säljare.'],
    ['uppmuntra', V, 'avskräcka', ['=stötta', 'påminna', 'informera', 'utmana'], 'Chefen uppmuntrade oss att komma med idéer.'],
    ['underskatta', V, 'överskatta', ['bedöma', 'beräkna', 'ifrågasätta', 'jämföra'], 'Man ska inte underskatta hur lång tid flytten tar.'],
    ['ödmjuk', A, 'högfärdig', ['=anspråkslös', 'blyg', 'tyst', 'försiktig'], 'Trots framgången var han ödmjuk.'],
    ['sparsam', A, 'slösaktig', ['=ekonomisk', 'försiktig', 'noggrann', 'flitig'], 'Hon är sparsam med pengar.'],
    ['frånvaro', S, 'närvaro', ['sjukdom', 'ledighet', 'försening', 'uppehåll'], 'Hans frånvaro märktes på mötet.'],
    ['import', S, 'export', ['handel', 'tull', 'leverans', 'transport'], 'Importen av kaffe ökade under året.'],
    ['ankomst', S, 'avgång', ['resa', 'försening', 'hållplats', 'landning'], 'Tågets ankomst var försenad.'],
    ['inkomst', S, 'utgift', ['=intäkt', 'skatt', 'lön', 'budget'], 'Familjens inkomst räckte inte till allt.'],
    ['fiktiv', A, 'verklig', ['=påhittad', 'historisk', 'tänkbar', 'trolig'], 'Personerna i boken är fiktiva.'],
    ['monoton', A, 'omväxlande', ['=enformig', 'långsam', 'krävande', 'stressig'], 'Arbetet vid bandet var monotont.'],
    ['framsteg', S, 'bakslag', ['förändring', 'utveckling', 'försök', 'uppehåll'], 'Forskarna gjorde stora framsteg.'],
    ['ömtålig', A, 'robust', ['=bräcklig', 'dyr', 'gammal', 'tunn'], 'Paketet innehåller ömtåliga glas.'],
    ['vag', A, 'tydlig', ['=oklar', 'kortfattad', 'formell', 'allmän'], 'Svaret var vagt och lämnade frågor kvar.'],
    ['snål', A, 'generös', ['=gnidig', 'fattig', 'försiktig', 'sträng'], 'Han var för snål för att bjuda på kaffe.'],
    ['kortsiktig', A, 'långsiktig', ['tillfällig', 'snabb', 'hastig', 'begränsad'], 'Det var en kortsiktig lösning på problemet.'],
    ['beundra', V, 'förakta', ['=uppskatta', 'avundas', 'respektera', 'minnas'], 'Många beundrade hennes mod.'],
    ['tillit', S, 'misstro', ['=förtroende', 'respekt', 'lojalitet', 'hopp'], 'Det tar tid att bygga upp tillit i en grupp.'],
    ['detaljerad', A, 'översiktlig', ['=ingående', 'omfattande', 'teknisk', 'formell'], 'Hon lämnade en detaljerad rapport.'],
  ],
  'avancerad-synonym': [
    ['konsekvens', S, 'följd', ['!orsak', 'risk', 'åtgärd', 'beslut'], 'Beslutet fick oväntade konsekvenser.'],
    ['tvetydig', A, 'dubbeltydig', ['!entydig', 'oärlig', 'invecklad', 'avsiktlig'], 'Formuleringen i avtalet var tvetydig.'],
    ['avsevärd', A, 'betydande', ['!obetydlig', 'tillfällig', 'oväntad', 'onödig'], 'Det krävdes en avsevärd insats för att bli klar.'],
    ['befogad', A, 'berättigad', ['!obefogad', 'oväntad', 'officiell', 'avsiktlig'], 'Kritiken mot förslaget var befogad.'],
    ['angelägen', A, 'brådskande', ['frivillig', 'tillfällig', 'intressant', 'formell'], 'Det är angeläget att vi hittar en lösning.'],
    ['framstående', A, 'berömd', ['!okänd', 'erfaren', 'ambitiös', 'förmögen'], 'Hon är en framstående forskare inom fältet.'],
    ['väsentlig', A, 'betydelsefull', ['!oväsentlig', 'tillfällig', 'omfattande', 'avsiktlig'], 'Det finns en väsentlig skillnad mellan förslagen.'],
    ['reducera', V, 'minska', ['!öka', 'avsluta', 'förändra', 'fördela'], 'Vi måste reducera kostnaderna med tio procent.'],
    ['utvärdera', V, 'bedöma', ['genomföra', 'planera', 'förbättra', 'avsluta'], 'Projektet ska utvärderas i december.'],
    ['negligera', V, 'ignorera', ['!uppmärksamma', 'avvisa', 'kritisera', 'glömma'], 'Man får inte negligera riskerna.'],
    ['precisera', V, 'specificera', ['förenkla', 'förkorta', 'motivera', 'bekräfta'], 'Kan du precisera vad du menar?'],
    ['etablera', V, 'grunda', ['!avveckla', 'utveckla', 'finansiera', 'flytta'], 'De etablerade företaget i Göteborg 1998.'],
    ['återhållsam', A, 'måttfull', ['!omåttlig', 'blyg', 'tystlåten', 'försiktig'], 'Hon var återhållsam med sina kommentarer.'],
    ['metodisk', A, 'systematisk', ['!slarvig', 'teoretisk', 'praktisk', 'snabb'], 'Han arbetar metodiskt och noggrant.'],
    ['motivera', V, 'sporra', ['!avskräcka', 'informera', 'belöna', 'övertala'], 'Ledaren lyckades motivera hela laget.'],
  ],
  'expert-synonym': [
    ['obsolet', A, 'föråldrad', ['!aktuell', 'oanvändbar', 'överflödig', 'ovanlig'], 'Systemet blev obsolet när den nya versionen kom.'],
    ['eklatant', A, 'påfallande', ['!obetydlig', 'elegant', 'tillfällig', 'ovanlig'], 'Det var ett eklatant exempel på slöseri.'],
    ['latent', A, 'dold', ['!uppenbar', 'tillfällig', 'farlig', 'kronisk'], 'Konflikten hade varit latent i flera år.'],
    ['ambivalent', A, 'kluven', ['!övertygad', 'likgiltig', 'osäker', 'nervös'], 'Hon var ambivalent till erbjudandet.'],
    ['notorisk', A, 'ökänd', ['!okänd', 'ovanlig', 'kriminell', 'farlig'], 'Han var en notorisk lögnare.'],
    ['kryptisk', A, 'gåtfull', ['!begriplig', 'kritisk', 'teknisk', 'kortfattad'], 'Meddelandet var kryptiskt och svårt att tolka.'],
    ['arbiträr', A, 'godtycklig', ['!motiverad', 'tillfällig', 'orättvis', 'formell'], 'Gränsen verkade helt arbiträr.'],
    ['konsensus', S, 'enighet', ['!oenighet', 'kompromiss', 'majoritet', 'debatt'], 'Gruppen nådde konsensus efter en lång diskussion.'],
    ['diskrepans', S, 'avvikelse', ['!överensstämmelse', 'fel', 'förändring', 'brist'], 'Det fanns en diskrepans mellan budget och utfall.'],
    ['adekvat', A, 'lämplig', ['!olämplig', 'exakt', 'aktuell', 'tillräcklig'], 'Patienten fick adekvat vård.'],
    ['marginell', A, 'obetydlig', ['!avgörande', 'tillfällig', 'gradvis', 'sällsynt'], 'Förändringen var marginell.'],
    ['eminent', A, 'framstående', ['!medelmåttig', 'erfaren', 'betydande', 'framgångsrik'], 'Hon är en eminent pianist.'],
    ['lukrativ', A, 'lönsam', ['!olönsam', 'riskfylld', 'kostsam', 'populär'], 'Affären visade sig vara lukrativ.'],
    ['volatil', A, 'flyktig', ['!stabil', 'farlig', 'snabb', 'osäker'], 'Marknaden har varit volatil hela året.'],
    ['reciprok', A, 'ömsesidig', ['!ensidig', 'gemensam', 'samtidig', 'jämlik'], 'Avtalet bygger på reciproka åtaganden.'],
    ['rudimentär', A, 'grundläggande', ['!avancerad', 'ofullständig', 'primitiv', 'tillfällig'], 'Han hade bara rudimentära kunskaper i tyska.'],
    ['konfidentiell', A, 'förtrolig', ['!offentlig', 'personlig', 'officiell', 'formell'], 'Uppgifterna i rapporten är konfidentiella.'],
    ['ackurat', A, 'noggrann', ['!slarvig', 'snabb', 'aktuell', 'korrekt'], 'Mätningen var mycket ackurat.'],
    ['kvintessens', S, 'kärna', ['!bisak', 'sammanfattning', 'slutsats', 'början'], 'Det är kvintessensen av hela resonemanget.'],
    ['postulera', V, 'påstå', ['!bestrida', 'bevisa', 'förklara', 'undersöka'], 'Teorin postulerar att tiden är relativ.'],
    ['emfas', S, 'eftertryck', ['!likgiltighet', 'betoning', 'känsla', 'ironi'], 'Hon sade det med stor emfas.'],
    ['tentativ', A, 'preliminär', ['!definitiv', 'försiktig', 'tvivelaktig', 'frivillig'], 'Vi har en tentativ tidplan för projektet.'],
    ['unison', A, 'enhällig', ['!splittrad', 'samtidig', 'gemensam', 'harmonisk'], 'Beslutet fattades med unison röst.'],
    ['substantiell', A, 'väsentlig', ['!obetydlig', 'omfattande', 'konkret', 'materiell'], 'Det krävs en substantiell förbättring.'],
    ['kursorisk', A, 'översiktlig', ['!grundlig', 'snabb', 'tillfällig', 'ytlig'], 'Han gjorde en kursorisk genomgång av materialet.'],
    ['distinkt', A, 'tydlig', ['!oklar', 'särskild', 'exakt', 'skarp'], 'Det fanns en distinkt doft av kanel.'],
    ['trivial', A, 'banal', ['!originell', 'enkel', 'obetydlig', 'vardaglig'], 'Frågan kan verka trivial men är viktig.'],
    ['inert', A, 'trög', ['!reaktiv', 'passiv', 'stel', 'långsam'], 'Ädelgaser är kemiskt inerta.'],
  ],
  'expert-antonym': [
    ['homogen', A, 'heterogen', ['=enhetlig', 'komplex', 'kompakt', 'stabil'], 'Gruppen var mycket homogen.'],
    ['progressiv', A, 'reaktionär', ['=framstegsvänlig', 'radikal', 'liberal', 'moderat'], 'Partiet drev en progressiv politik.'],
    ['empirisk', A, 'teoretisk', ['=erfarenhetsbaserad', 'statistisk', 'praktisk', 'kritisk'], 'Slutsatserna bygger på empiriska data.'],
    ['ortodox', A, 'kättersk', ['=renlärig', 'konservativ', 'religiös', 'sträng'], 'Han hade en ortodox syn på reglerna.'],
    ['explicit', A, 'underförstådd', ['=uttalad', 'formell', 'konkret', 'tydlig'], 'Avtalet innehöll ett explicit förbud.'],
  ],
};

const typFor = (d) => (d.startsWith('=') ? 'synonym' : d.startsWith('!') ? 'antonym' : 'samma_falt');
for (const [nyckel, rader] of Object.entries(RADER)) {
  const ut = rader.map(([ord, ordklass, facit, dist, exempel]) => ({
    ord,
    ordklass,
    facit,
    distraktorer: dist.map((d) => ({ ord: d.replace(/^[=!]/, ''), typ: typFor(d), forklaring: '' })),
    exempel,
    kalla_kandidat: 'handskrivet 2026-11-09',
  }));
  writeFileSync(`src/lib/ordforradV1/kandidater/hand-${nyckel}.json`, JSON.stringify(ut, null, 1) + '\n');
  console.log(nyckel, ut.length);
}
