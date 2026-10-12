// scripts/lib/deduktiv/d1.mjs
// =============================================================================
// D1, premisskedjor (beställningen omgång 3, B1): 24 uppgifter skrivna för
// hand av Opus F. Varje premiss och varje alternativ har sin text och sin
// formella form (mangdmodell.mjs); validatorn räknar fram statusen och fäller
// uppgiften om den inte stämmer med rollen här. Rollerna: ett nödvändigt
// (facit), två obestämda (rimliga men inte nödvändiga), ett omöjligt.
//
// Stegen i lösningen (deduktiv-spec.md 3): premissernas nummer i märket och
// en mening per steg. Misstaget per distraktor (spec 2.3) är skrivet för
// hand: varför alternativet inte måste gälla.
//
// Formen: [typ, x, y] för alla, inga, nagra, nagra_inte; [typ, individ, x]
// för ar, ar_inte. En premiss kan ha flera formella satser.
// =============================================================================

const S = (typ, a, b) => (typ === 'ar' || typ === 'ar_inte' ? { typ, i: a, x: b } : { typ, x: a, y: b });
const P = (text, ...satser) => ({ text, formell: satser.map((s) => S(...s)) });
const A = (roll, text, sats, misstag = '') => ({ roll, text, formell: S(...sats), misstag });
const G = (premisser, text) => ({ premisser, text });

export const D1 = [
  {
    termer: ['natt', 'tillagg', 'tvadelar', 'recep'],
    individer: [],
    premisser: [
      P('Alla som arbetar natt får tillägg.', ['alla', 'natt', 'tillagg']),
      P('Alla som får tillägg får lönebeskedet i två delar.', ['alla', 'tillagg', 'tvadelar']),
      P('Ingen i receptionen får lönebeskedet i två delar.', ['inga', 'recep', 'tvadelar']),
    ],
    alternativ: [
      A('nodvandig', 'Ingen i receptionen arbetar natt.', ['inga', 'recep', 'natt']),
      A('obestamd', 'Alla som får lönebeskedet i två delar arbetar natt.', ['alla', 'tvadelar', 'natt'], 'Premisserna säger att nattarbete leder till två delar, inte att bara nattarbete gör det. Det kan stämma, men det måste inte.'),
      A('obestamd', 'Några som får tillägg arbetar inte natt.', ['nagra_inte', 'tillagg', 'natt'], 'Premisserna säger inget om vem mer som får tillägg. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Någon i receptionen får tillägg.', ['nagra', 'recep', 'tillagg'], 'Den som får tillägg får lönebeskedet i två delar, och det gör ingen i receptionen. Det strider mot premiss 3.'),
    ],
    steg: [
      G([1, 2], 'Den som arbetar natt får tillägg, och den som får tillägg får lönebeskedet i två delar.'),
      G([3], 'Ingen i receptionen får lönebeskedet i två delar. Alltså arbetar ingen där natt.'),
    ],
  },
  {
    termer: ['ledning', 'budget', 'konsult'],
    individer: ['olle'],
    premisser: [
      P('Alla som sitter i ledningsgruppen har sett budgeten.', ['alla', 'ledning', 'budget']),
      P('Ingen konsult har sett budgeten.', ['inga', 'konsult', 'budget']),
      P('Olle har sett budgeten.', ['ar', 'olle', 'budget']),
    ],
    alternativ: [
      A('nodvandig', 'Olle är inte konsult.', ['ar_inte', 'olle', 'konsult']),
      A('obestamd', 'Olle sitter i ledningsgruppen.', ['ar', 'olle', 'ledning'], 'Ledningsgruppen har sett budgeten, men premisserna säger inte att bara de har gjort det. Olle kan ha sett den av ett annat skäl.'),
      A('obestamd', 'Alla som har sett budgeten sitter i ledningsgruppen.', ['alla', 'budget', 'ledning'], 'Det vänder på premiss 1. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Någon konsult sitter i ledningsgruppen.', ['nagra', 'konsult', 'ledning'], 'Den i ledningsgruppen har sett budgeten, och ingen konsult har det. Det strider mot premiss 1 och 2.'),
    ],
    steg: [
      G([2, 3], 'Ingen konsult har sett budgeten, men Olle har det. Alltså är Olle inte konsult.'),
      G([1], 'Att Olle har sett budgeten säger inte att han sitter i ledningsgruppen.'),
    ],
  },
  {
    termer: ['ny', 'nyckel', 'ekon', 'konsult'],
    individer: [],
    premisser: [
      P('Alla i ekonomigruppen har nyckel till arkivet.', ['alla', 'ekon', 'nyckel']),
      P('Ingen nyanställd har nyckel till arkivet.', ['inga', 'ny', 'nyckel']),
      P('Några konsulter är nyanställda.', ['nagra', 'konsult', 'ny']),
    ],
    alternativ: [
      A('nodvandig', 'Några konsulter är inte med i ekonomigruppen.', ['nagra_inte', 'konsult', 'ekon']),
      A('obestamd', 'Alla konsulter är nyanställda.', ['alla', 'konsult', 'ny'], 'Premiss 3 säger några, inte alla. Det kan stämma, men det måste inte.'),
      A('obestamd', 'Några konsulter har nyckel till arkivet.', ['nagra', 'konsult', 'nyckel'], 'De konsulter som inte är nyanställda kan ha nyckel, men premisserna säger inget om dem.'),
      A('omojlig', 'Någon nyanställd är med i ekonomigruppen.', ['nagra', 'ny', 'ekon'], 'Alla i ekonomigruppen har nyckel, och ingen nyanställd har det. Det strider mot premiss 1 och 2.'),
    ],
    steg: [
      G([1, 2], 'Alla i ekonomigruppen har nyckel, och ingen nyanställd har det. Alltså är ingen nyanställd med i ekonomigruppen.'),
      G([3], 'Några konsulter är nyanställda, och de konsulterna är då inte med i ekonomigruppen.'),
    ],
  },
  {
    termer: ['leder', 'kurs', 'deltid', 'chef'],
    individer: ['pia'],
    premisser: [
      P('Alla som leder ett projekt går kursen i budget.', ['alla', 'leder', 'kurs']),
      P('Ingen som arbetar deltid går kursen i budget.', ['inga', 'deltid', 'kurs']),
      P('Pia är chef och arbetar deltid.', ['ar', 'pia', 'chef'], ['ar', 'pia', 'deltid']),
    ],
    alternativ: [
      A('nodvandig', 'Pia leder inget projekt.', ['ar_inte', 'pia', 'leder']),
      A('obestamd', 'Ingen chef leder ett projekt.', ['inga', 'chef', 'leder'], 'Det gäller Pia, men premisserna säger inget om andra chefer.'),
      A('obestamd', 'Alla chefer arbetar deltid.', ['alla', 'chef', 'deltid'], 'Premisserna säger bara att Pia gör det. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Pia går kursen i budget.', ['ar', 'pia', 'kurs'], 'Pia arbetar deltid, och ingen som arbetar deltid går kursen. Det strider mot premiss 2 och 3.'),
    ],
    steg: [
      G([2, 3], 'Pia arbetar deltid, och ingen som arbetar deltid går kursen i budget. Alltså går Pia inte kursen.'),
      G([1], 'Den som leder ett projekt går kursen. Pia går den inte, alltså leder hon inget projekt.'),
    ],
  },
  {
    termer: ['lager', 'truck', 'sakerhet'],
    individer: [],
    premisser: [
      P('Några på lagret har truckkort.', ['nagra', 'lager', 'truck']),
      P('Alla med truckkort har gått säkerhetsutbildningen.', ['alla', 'truck', 'sakerhet']),
    ],
    alternativ: [
      A('nodvandig', 'Några på lagret har gått säkerhetsutbildningen.', ['nagra', 'lager', 'sakerhet']),
      A('obestamd', 'Alla på lagret har truckkort.', ['alla', 'lager', 'truck'], 'Premiss 1 säger några, inte alla. Det kan stämma, men det måste inte.'),
      A('obestamd', 'Några som har gått säkerhetsutbildningen arbetar inte på lagret.', ['nagra_inte', 'sakerhet', 'lager'], 'Premisserna säger inget om vilka mer som har gått utbildningen.'),
      A('omojlig', 'Ingen på lagret har gått säkerhetsutbildningen.', ['inga', 'lager', 'sakerhet'], 'De på lagret som har truckkort har gått utbildningen. Det strider mot premiss 1 och 2.'),
    ],
    steg: [
      G([1, 2], 'Några på lagret har truckkort, och alla med truckkort har gått säkerhetsutbildningen. Alltså har några på lagret gått den.'),
    ],
  },
  {
    termer: ['fredag', 'lang', 'styrelse', 'kund'],
    individer: [],
    premisser: [
      P('Inga möten på fredagar är längre än en timme.', ['inga', 'fredag', 'lang']),
      P('Alla styrelsemöten är längre än en timme.', ['alla', 'styrelse', 'lang']),
      P('Några kundmöten hålls på fredagar.', ['nagra', 'kund', 'fredag']),
    ],
    alternativ: [
      A('nodvandig', 'Några kundmöten är inte styrelsemöten.', ['nagra_inte', 'kund', 'styrelse']),
      A('obestamd', 'Inga kundmöten är längre än en timme.', ['inga', 'kund', 'lang'], 'Det gäller kundmötena på fredagar. Om de andra kundmötena säger premisserna inget.'),
      A('obestamd', 'Alla möten som är längre än en timme är styrelsemöten.', ['alla', 'lang', 'styrelse'], 'Det vänder på premiss 2. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Något styrelsemöte hålls på en fredag.', ['nagra', 'styrelse', 'fredag'], 'Styrelsemöten är längre än en timme, och inga fredagsmöten är det. Det strider mot premiss 1 och 2.'),
    ],
    steg: [
      G([1, 2], 'Styrelsemöten är längre än en timme, och inga möten på fredagar är det. Alltså hålls inga styrelsemöten på fredagar.'),
      G([3], 'Några kundmöten hålls på fredagar. De kundmötena är då inte styrelsemöten.'),
    ],
  },
  {
    termer: ['skydd', 'miljo', 'verkstad'],
    individer: ['erik'],
    premisser: [
      P('Alla som sitter i skyddskommittén har gått arbetsmiljökursen.', ['alla', 'skydd', 'miljo']),
      P('Erik arbetar i verkstaden och har inte gått arbetsmiljökursen.', ['ar', 'erik', 'verkstad'], ['ar_inte', 'erik', 'miljo']),
    ],
    alternativ: [
      A('nodvandig', 'Erik sitter inte i skyddskommittén.', ['ar_inte', 'erik', 'skydd']),
      A('obestamd', 'Ingen i verkstaden sitter i skyddskommittén.', ['inga', 'verkstad', 'skydd'], 'Det gäller Erik, men premisserna säger inget om de andra i verkstaden.'),
      A('obestamd', 'Några i verkstaden har gått arbetsmiljökursen.', ['nagra', 'verkstad', 'miljo'], 'Premisserna säger bara att Erik inte har gått den. Om de andra vet vi inget.'),
      A('omojlig', 'Alla i verkstaden har gått arbetsmiljökursen.', ['alla', 'verkstad', 'miljo'], 'Erik arbetar i verkstaden och har inte gått kursen. Det strider mot premiss 2.'),
    ],
    steg: [
      G([1, 2], 'Alla i skyddskommittén har gått arbetsmiljökursen. Erik har inte gått den. Alltså sitter Erik inte i skyddskommittén.'),
    ],
  },
  {
    termer: ['tillf', 'server', 'reg'],
    individer: [],
    premisser: [
      P('Inga tillfälliga passerkort öppnar serverrummet.', ['inga', 'tillf', 'server']),
      P('Alla kort som öppnar serverrummet är registrerade hos it-avdelningen.', ['alla', 'server', 'reg']),
      P('Några registrerade kort är tillfälliga.', ['nagra', 'reg', 'tillf']),
    ],
    alternativ: [
      A('nodvandig', 'Några registrerade kort öppnar inte serverrummet.', ['nagra_inte', 'reg', 'server']),
      A('obestamd', 'Alla tillfälliga kort är registrerade.', ['alla', 'tillf', 'reg'], 'Premiss 3 säger att några registrerade kort är tillfälliga, inte att alla tillfälliga är registrerade.'),
      A('obestamd', 'Några tillfälliga kort är inte registrerade.', ['nagra_inte', 'tillf', 'reg'], 'Premisserna säger inget om tillfälliga kort utanför registret. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Alla registrerade kort öppnar serverrummet.', ['alla', 'reg', 'server'], 'Några registrerade kort är tillfälliga, och de öppnar inte serverrummet. Det strider mot premiss 1 och 3.'),
    ],
    steg: [
      G([3, 1], 'Några registrerade kort är tillfälliga, och inga tillfälliga kort öppnar serverrummet. Alltså finns registrerade kort som inte öppnar det.'),
    ],
  },
  {
    termer: ['kund', 'finska', 'finland', 'kvall'],
    individer: [],
    premisser: [
      P('Några på kundtjänst talar finska.', ['nagra', 'kund', 'finska']),
      P('Alla som talar finska tar samtalen från Finland.', ['alla', 'finska', 'finland']),
      P('Ingen som tar samtalen från Finland arbetar kvällar.', ['inga', 'finland', 'kvall']),
    ],
    alternativ: [
      A('nodvandig', 'Några på kundtjänst arbetar inte kvällar.', ['nagra_inte', 'kund', 'kvall']),
      A('obestamd', 'Ingen på kundtjänst arbetar kvällar.', ['inga', 'kund', 'kvall'], 'Det gäller dem som talar finska. Om resten av kundtjänst säger premisserna inget.'),
      A('obestamd', 'Alla som tar samtalen från Finland talar finska.', ['alla', 'finland', 'finska'], 'Det vänder på premiss 2. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Någon som talar finska arbetar kvällar.', ['nagra', 'finska', 'kvall'], 'Den som talar finska tar samtalen från Finland och arbetar då inte kvällar. Det strider mot premiss 2 och 3.'),
    ],
    steg: [
      G([2, 3], 'Den som talar finska tar samtalen från Finland, och ingen av dem arbetar kvällar.'),
      G([1], 'Några på kundtjänst talar finska. De arbetar alltså inte kvällar.'),
    ],
  },
  {
    termer: ['prakt', 'attest', 'pl', 'ekon'],
    individer: ['hugo'],
    premisser: [
      P('Ingen praktikant får attestera fakturor.', ['inga', 'prakt', 'attest']),
      P('Alla projektledare får attestera fakturor.', ['alla', 'pl', 'attest']),
      P('Hugo är praktikant på ekonomiavdelningen.', ['ar', 'hugo', 'prakt'], ['ar', 'hugo', 'ekon']),
    ],
    alternativ: [
      A('nodvandig', 'Hugo är inte projektledare.', ['ar_inte', 'hugo', 'pl']),
      A('obestamd', 'Ingen på ekonomiavdelningen är projektledare.', ['inga', 'ekon', 'pl'], 'Det gäller Hugo, men premisserna säger inget om de andra på ekonomiavdelningen.'),
      A('obestamd', 'Alla som får attestera fakturor är projektledare.', ['alla', 'attest', 'pl'], 'Det vänder på premiss 2. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Alla på ekonomiavdelningen får attestera fakturor.', ['alla', 'ekon', 'attest'], 'Hugo är praktikant på ekonomiavdelningen och får inte attestera. Det strider mot premiss 1 och 3.'),
    ],
    steg: [
      G([1, 3], 'Hugo är praktikant och får alltså inte attestera fakturor.'),
      G([2], 'Alla projektledare får attestera. Alltså är Hugo inte projektledare.'),
    ],
  },
  {
    termer: ['plan3', 'tavla', 'stor', 'skarm'],
    individer: [],
    premisser: [
      P('Alla rum på plan tre har whiteboardtavla.', ['alla', 'plan3', 'tavla']),
      P('Inga rum med whiteboardtavla har plats för fler än tolv.', ['inga', 'tavla', 'stor']),
      P('Några rum på plan tre har skärm.', ['nagra', 'plan3', 'skarm']),
    ],
    alternativ: [
      A('nodvandig', 'Några rum med skärm har inte plats för fler än tolv.', ['nagra_inte', 'skarm', 'stor']),
      A('obestamd', 'Alla rum med skärm ligger på plan tre.', ['alla', 'skarm', 'plan3'], 'Premisserna säger bara att några rum på plan tre har skärm. Rum med skärm kan finnas på andra plan.'),
      A('obestamd', 'Några rum med plats för fler än tolv har skärm.', ['nagra', 'stor', 'skarm'], 'Ett sådant rum ligger inte på plan tre, och om de andra planen säger premisserna inget.'),
      A('omojlig', 'Något rum på plan tre har plats för fler än tolv.', ['nagra', 'plan3', 'stor'], 'Rummen på plan tre har whiteboardtavla, och inga sådana rum har plats för fler än tolv. Det strider mot premiss 1 och 2.'),
    ],
    steg: [
      G([1, 2], 'Rummen på plan tre har whiteboardtavla, och inga rum med tavla har plats för fler än tolv.'),
      G([3], 'Några rum på plan tre har skärm. De rummen har alltså inte plats för fler än tolv.'),
    ],
  },
  {
    termer: ['el', 'bevis', 'malmo'],
    individer: ['ida'],
    premisser: [
      P('Alla elektriker har behörighetsbevis.', ['alla', 'el', 'bevis']),
      P('Några med behörighetsbevis arbetar i Malmö.', ['nagra', 'bevis', 'malmo']),
      P('Ida är elektriker.', ['ar', 'ida', 'el']),
    ],
    alternativ: [
      A('nodvandig', 'Ida har behörighetsbevis.', ['ar', 'ida', 'bevis']),
      A('obestamd', 'Ida arbetar i Malmö.', ['ar', 'ida', 'malmo'], 'Att några med behörighetsbevis arbetar i Malmö säger inget om just Ida.'),
      A('obestamd', 'Några elektriker arbetar i Malmö.', ['nagra', 'el', 'malmo'], 'De med behörighetsbevis i Malmö behöver inte vara elektriker. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Ingen med behörighetsbevis är elektriker.', ['inga', 'bevis', 'el'], 'Ida är elektriker och har behörighetsbevis. Det strider mot premiss 1 och 3.'),
    ],
    steg: [
      G([1, 3], 'Alla elektriker har behörighetsbevis. Ida är elektriker. Alltså har Ida behörighetsbevis.'),
      G([2], 'Att några med behörighetsbevis arbetar i Malmö säger inget om just Ida.'),
    ],
  },
  {
    termer: ['dyr', 'utan', 'dator', 'mobel'],
    individer: [],
    premisser: [
      P('Inga beställningar över 50 000 kronor går igenom utan chefens underskrift.', ['inga', 'dyr', 'utan']),
      P('Alla datorbeställningar är på över 50 000 kronor.', ['alla', 'dator', 'dyr']),
      P('Några möbelbeställningar går igenom utan chefens underskrift.', ['nagra', 'mobel', 'utan']),
    ],
    alternativ: [
      A('nodvandig', 'Några möbelbeställningar är inte på över 50 000 kronor.', ['nagra_inte', 'mobel', 'dyr']),
      A('obestamd', 'Inga möbelbeställningar är på över 50 000 kronor.', ['inga', 'mobel', 'dyr'], 'Det gäller de möbelbeställningar som går igenom utan underskrift. Om de andra säger premisserna inget.'),
      A('obestamd', 'Alla beställningar över 50 000 kronor gäller datorer.', ['alla', 'dyr', 'dator'], 'Det vänder på premiss 2. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Någon datorbeställning går igenom utan chefens underskrift.', ['nagra', 'dator', 'utan'], 'Datorbeställningar är på över 50 000 kronor, och sådana går inte igenom utan underskrift. Det strider mot premiss 1 och 2.'),
    ],
    steg: [
      G([3], 'Några möbelbeställningar går igenom utan chefens underskrift.'),
      G([1], 'Ingen beställning över 50 000 kronor gör det. Alltså är de möbelbeställningarna inte på över 50 000 kronor.'),
    ],
  },
  {
    termer: ['bonus', 'mal', 'overtid'],
    individer: [],
    premisser: [
      P('Några som har nått sitt mål får bonus.', ['nagra', 'mal', 'bonus']),
      P('Några som har nått sitt mål har arbetat övertid.', ['nagra', 'mal', 'overtid']),
      P('Ingen som har arbetat övertid får bonus.', ['inga', 'overtid', 'bonus']),
    ],
    alternativ: [
      A('nodvandig', 'Några som har nått sitt mål har inte arbetat övertid.', ['nagra_inte', 'mal', 'overtid']),
      A('obestamd', 'Alla som får bonus har nått sitt mål.', ['alla', 'bonus', 'mal'], 'Premisserna säger att några med nått mål får bonus, inte att bonus kräver det. Det kan stämma, men det måste inte.'),
      A('obestamd', 'Några som får bonus har inte nått sitt mål.', ['nagra_inte', 'bonus', 'mal'], 'Premisserna säger inget om bonus utan nått mål. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Alla som har nått sitt mål har arbetat övertid.', ['alla', 'mal', 'overtid'], 'Några som har nått sitt mål får bonus, och de har inte arbetat övertid. Det strider mot premiss 1 och 3.'),
    ],
    steg: [
      G([1, 3], 'Några som har nått sitt mål får bonus, och ingen som har arbetat övertid får bonus.'),
      G([], 'De som har nått sitt mål och får bonus har alltså inte arbetat övertid.'),
    ],
  },
  {
    termer: ['norr', 'mandag', 'kyl', 'tung'],
    individer: [],
    premisser: [
      P('Inga leveranser till Norrland sker på måndagar.', ['inga', 'norr', 'mandag']),
      P('Alla kylda leveranser sker på måndagar.', ['alla', 'kyl', 'mandag']),
      P('Några leveranser till Norrland är tunga.', ['nagra', 'norr', 'tung']),
    ],
    alternativ: [
      A('nodvandig', 'Några tunga leveranser är inte kylda.', ['nagra_inte', 'tung', 'kyl']),
      A('obestamd', 'Inga tunga leveranser sker på måndagar.', ['inga', 'tung', 'mandag'], 'Det gäller de tunga leveranserna till Norrland. Om andra tunga leveranser säger premisserna inget.'),
      A('obestamd', 'Alla leveranser på måndagar är kylda.', ['alla', 'mandag', 'kyl'], 'Det vänder på premiss 2. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Någon leverans till Norrland är kyld.', ['nagra', 'norr', 'kyl'], 'Kylda leveranser sker på måndagar, och inga leveranser till Norrland gör det. Det strider mot premiss 1 och 2.'),
    ],
    steg: [
      G([1, 2], 'Kylda leveranser sker på måndagar, och inga leveranser till Norrland gör det. Alltså är ingen leverans till Norrland kyld.'),
      G([3], 'Några leveranser till Norrland är tunga. De är alltså inte kylda.'),
    ],
  },
  {
    termer: ['ny', 'mentor', 'traff'],
    individer: ['nora'],
    premisser: [
      P('Alla nyanställda får en mentor.', ['alla', 'ny', 'mentor']),
      P('Alla som får en mentor träffar personalavdelningen första veckan.', ['alla', 'mentor', 'traff']),
      P('Nora är nyanställd.', ['ar', 'nora', 'ny']),
    ],
    alternativ: [
      A('nodvandig', 'Nora träffar personalavdelningen första veckan.', ['ar', 'nora', 'traff']),
      A('obestamd', 'Alla som träffar personalavdelningen första veckan är nyanställda.', ['alla', 'traff', 'ny'], 'Det vänder på kedjan. Andra än nyanställda kan också träffa personalavdelningen.'),
      A('obestamd', 'Några som får en mentor är inte nyanställda.', ['nagra_inte', 'mentor', 'ny'], 'Premisserna säger inget om vem mer som får en mentor. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Nora får ingen mentor.', ['ar_inte', 'nora', 'mentor'], 'Nora är nyanställd, och alla nyanställda får en mentor. Det strider mot premiss 1 och 3.'),
    ],
    steg: [
      G([1, 3], 'Nora är nyanställd och får alltså en mentor.'),
      G([2], 'Den som får en mentor träffar personalavdelningen första veckan. Alltså gör Nora det.'),
    ],
  },
  {
    termer: ['hemma', 'park', 'salj', 'ledning'],
    individer: [],
    premisser: [
      P('Ingen som arbetar hemma har parkeringstillstånd.', ['inga', 'hemma', 'park']),
      P('Några i säljteamet arbetar hemma.', ['nagra', 'salj', 'hemma']),
      P('Alla i ledningen har parkeringstillstånd.', ['alla', 'ledning', 'park']),
    ],
    alternativ: [
      A('nodvandig', 'Några i säljteamet har inte parkeringstillstånd.', ['nagra_inte', 'salj', 'park']),
      A('obestamd', 'Ingen i säljteamet har parkeringstillstånd.', ['inga', 'salj', 'park'], 'Det gäller dem i säljteamet som arbetar hemma. Om resten säger premisserna inget.'),
      A('obestamd', 'Några i säljteamet sitter i ledningen.', ['nagra', 'salj', 'ledning'], 'De i säljteamet som inte arbetar hemma kan sitta i ledningen, men premisserna säger inget om dem.'),
      A('omojlig', 'Någon i ledningen arbetar hemma.', ['nagra', 'ledning', 'hemma'], 'Alla i ledningen har parkeringstillstånd, och ingen som arbetar hemma har det. Det strider mot premiss 1 och 3.'),
    ],
    steg: [
      G([2, 1], 'Några i säljteamet arbetar hemma, och ingen som arbetar hemma har parkeringstillstånd.'),
      G([], 'Alltså finns det några i säljteamet som saknar tillstånd. Om resten av teamet säger premisserna inget.'),
    ],
  },
  {
    termer: ['avtal', 'sekretess', 'epost'],
    individer: ['offerten'],
    premisser: [
      P('Alla dokument i mappen Avtal är sekretessmärkta.', ['alla', 'avtal', 'sekretess']),
      P('Inga sekretessmärkta dokument får skickas med vanlig e-post.', ['inga', 'sekretess', 'epost']),
      P('Offerten ligger i mappen Avtal.', ['ar', 'offerten', 'avtal']),
    ],
    alternativ: [
      A('nodvandig', 'Offerten får inte skickas med vanlig e-post.', ['ar_inte', 'offerten', 'epost']),
      A('obestamd', 'Alla sekretessmärkta dokument ligger i mappen Avtal.', ['alla', 'sekretess', 'avtal'], 'Det vänder på premiss 1. Sekretessmärkta dokument kan ligga i andra mappar.'),
      A('obestamd', 'Några sekretessmärkta dokument ligger inte i mappen Avtal.', ['nagra_inte', 'sekretess', 'avtal'], 'Premisserna säger inget om dokument utanför mappen. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Offerten är inte sekretessmärkt.', ['ar_inte', 'offerten', 'sekretess'], 'Offerten ligger i mappen Avtal, och allt där är sekretessmärkt. Det strider mot premiss 1 och 3.'),
    ],
    steg: [
      G([1, 3], 'Offerten ligger i mappen Avtal och är alltså sekretessmärkt.'),
      G([2], 'Inga sekretessmärkta dokument får skickas med vanlig e-post. Alltså får offerten inte det.'),
    ],
  },
  {
    termer: ['var', 'distans', 'stor', 'oblig'],
    individer: [],
    premisser: [
      P('Några av vårens kurser hålls på distans.', ['nagra', 'var', 'distans']),
      P('Ingen kurs på distans har fler än tjugo deltagare.', ['inga', 'distans', 'stor']),
      P('Alla obligatoriska kurser har fler än tjugo deltagare.', ['alla', 'oblig', 'stor']),
    ],
    alternativ: [
      A('nodvandig', 'Några av vårens kurser är inte obligatoriska.', ['nagra_inte', 'var', 'oblig']),
      A('obestamd', 'Ingen av vårens kurser har fler än tjugo deltagare.', ['inga', 'var', 'stor'], 'Det gäller vårens kurser på distans. Om de andra säger premisserna inget.'),
      A('obestamd', 'Alla kurser med fler än tjugo deltagare är obligatoriska.', ['alla', 'stor', 'oblig'], 'Det vänder på premiss 3. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Någon obligatorisk kurs hålls på distans.', ['nagra', 'oblig', 'distans'], 'Obligatoriska kurser har fler än tjugo deltagare, och ingen kurs på distans har det. Det strider mot premiss 2 och 3.'),
    ],
    steg: [
      G([2, 3], 'Obligatoriska kurser har fler än tjugo deltagare, och ingen kurs på distans har det. Alltså hålls ingen obligatorisk kurs på distans.'),
      G([1], 'Några av vårens kurser hålls på distans. De är alltså inte obligatoriska.'),
    ],
  },
  {
    termer: ['styr', 'chef', 'ledar'],
    individer: [],
    premisser: [
      P('Några i styrgruppen är inte chefer.', ['nagra_inte', 'styr', 'chef']),
      P('Alla i styrgruppen har gått ledarprogrammet.', ['alla', 'styr', 'ledar']),
    ],
    alternativ: [
      A('nodvandig', 'Några som har gått ledarprogrammet är inte chefer.', ['nagra_inte', 'ledar', 'chef']),
      A('obestamd', 'Alla chefer har gått ledarprogrammet.', ['alla', 'chef', 'ledar'], 'Premisserna säger bara att styrgruppen har gått programmet. Om chefer utanför den vet vi inget.'),
      A('obestamd', 'Några chefer sitter i styrgruppen.', ['nagra', 'chef', 'styr'], 'Premiss 1 säger att några i styrgruppen inte är chefer, inte att några andra är det.'),
      A('omojlig', 'Alla som har gått ledarprogrammet är chefer.', ['alla', 'ledar', 'chef'], 'De i styrgruppen som inte är chefer har också gått programmet. Det strider mot premiss 1 och 2.'),
    ],
    steg: [
      G([1, 2], 'Några i styrgruppen är inte chefer, och alla i styrgruppen har gått ledarprogrammet. De som inte är chefer har alltså också gått det.'),
    ],
  },
  {
    termer: ['lon', 'tyst', 'ekon'],
    individer: ['gun'],
    premisser: [
      P('Alla som arbetar med lön har tystnadsplikt.', ['alla', 'lon', 'tyst']),
      P('Gun har inte tystnadsplikt.', ['ar_inte', 'gun', 'tyst']),
      P('Några på ekonomiavdelningen arbetar med lön.', ['nagra', 'ekon', 'lon']),
    ],
    alternativ: [
      A('nodvandig', 'Gun arbetar inte med lön.', ['ar_inte', 'gun', 'lon']),
      A('obestamd', 'Gun arbetar inte på ekonomiavdelningen.', ['ar_inte', 'gun', 'ekon'], 'Var Gun arbetar säger premisserna inget om. Hon kan arbeta där med något annat än lön.'),
      A('obestamd', 'Alla på ekonomiavdelningen har tystnadsplikt.', ['alla', 'ekon', 'tyst'], 'Det gäller dem som arbetar med lön. Om resten av avdelningen säger premisserna inget.'),
      A('omojlig', 'Ingen på ekonomiavdelningen har tystnadsplikt.', ['inga', 'ekon', 'tyst'], 'Några på ekonomiavdelningen arbetar med lön och har då tystnadsplikt. Det strider mot premiss 1 och 3.'),
    ],
    steg: [
      G([1, 2], 'Alla som arbetar med lön har tystnadsplikt. Gun har den inte. Alltså arbetar Gun inte med lön.'),
      G([], 'Var Gun arbetar säger premisserna inget om.'),
    ],
  },
  {
    termer: ['pool', 'el', 'gammal', 'salj'],
    individer: ['roda'],
    premisser: [
      P('Alla bilar i bilpoolen är elbilar.', ['alla', 'pool', 'el']),
      P('Ingen elbil är äldre än fem år.', ['inga', 'el', 'gammal']),
      P('Den röda bilen är äldre än fem år.', ['ar', 'roda', 'gammal']),
    ],
    alternativ: [
      A('nodvandig', 'Den röda bilen är inte med i bilpoolen.', ['ar_inte', 'roda', 'pool']),
      A('obestamd', 'Alla elbilar är med i bilpoolen.', ['alla', 'el', 'pool'], 'Det vänder på premiss 1. Det kan finnas elbilar utanför poolen.'),
      A('obestamd', 'Den röda bilen ska säljas.', ['ar', 'roda', 'salj'], 'Premisserna säger inget om försäljning. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Den röda bilen är en elbil.', ['ar', 'roda', 'el'], 'Den röda bilen är äldre än fem år, och ingen elbil är det. Det strider mot premiss 2 och 3.'),
    ],
    steg: [
      G([2, 3], 'Den röda bilen är äldre än fem år, och ingen elbil är det. Alltså är den röda bilen ingen elbil.'),
      G([1], 'Alla bilar i bilpoolen är elbilar. Alltså är den röda bilen inte med i bilpoolen.'),
    ],
  },
  {
    termer: ['intro', 'tvaar', 'ombud'],
    individer: [],
    premisser: [
      P('Alla som håller i introduktionen har arbetat här i minst två år.', ['alla', 'intro', 'tvaar']),
      P('Några som har arbetat här i minst två år är skyddsombud.', ['nagra', 'tvaar', 'ombud']),
      P('Inget skyddsombud håller i introduktionen.', ['inga', 'ombud', 'intro']),
    ],
    alternativ: [
      A('nodvandig', 'Några som har arbetat här i minst två år håller inte i introduktionen.', ['nagra_inte', 'tvaar', 'intro']),
      A('obestamd', 'Alla skyddsombud har arbetat här i minst två år.', ['alla', 'ombud', 'tvaar'], 'Premiss 2 säger att några med minst två år är skyddsombud, inte att alla skyddsombud har det.'),
      A('obestamd', 'Några skyddsombud har inte arbetat här i minst två år.', ['nagra_inte', 'ombud', 'tvaar'], 'Premisserna säger inget om skyddsombud med kortare tid. Det kan stämma, men det måste inte.'),
      A('omojlig', 'Alla som har arbetat här i minst två år håller i introduktionen.', ['alla', 'tvaar', 'intro'], 'Några med minst två år är skyddsombud, och inget skyddsombud håller i introduktionen. Det strider mot premiss 2 och 3.'),
    ],
    steg: [
      G([2, 3], 'Några som har arbetat här i minst två år är skyddsombud, och inget skyddsombud håller i introduktionen.'),
      G([], 'Alltså finns det några med minst två år som inte håller i den.'),
    ],
  },
  {
    termer: ['fredag', 'vikarie', 'lunch'],
    individer: ['anna'],
    premisser: [
      P('Ingen som har pass på fredag är vikarie.', ['inga', 'fredag', 'vikarie']),
      P('Alla som har pass på fredag får lunchen betald.', ['alla', 'fredag', 'lunch']),
      P('Anna har pass på fredag.', ['ar', 'anna', 'fredag']),
    ],
    alternativ: [
      A('nodvandig', 'Anna är inte vikarie.', ['ar_inte', 'anna', 'vikarie']),
      A('obestamd', 'Alla som får lunchen betald har pass på fredag.', ['alla', 'lunch', 'fredag'], 'Det vänder på premiss 2. Andra kan också få lunchen betald.'),
      A('obestamd', 'Ingen vikarie får lunchen betald.', ['inga', 'vikarie', 'lunch'], 'Vikarier har inte pass på fredag, men de kan få lunchen betald av ett annat skäl.'),
      A('omojlig', 'Anna får inte lunchen betald.', ['ar_inte', 'anna', 'lunch'], 'Anna har pass på fredag, och alla med pass på fredag får lunchen betald. Det strider mot premiss 2 och 3.'),
    ],
    steg: [
      G([1, 3], 'Anna har pass på fredag, och ingen som har pass på fredag är vikarie. Alltså är Anna inte vikarie.'),
    ],
  },
];
