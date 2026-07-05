/**
 * FAQ-data for galleri-sidorna.
 * Skiljer sig fran /exempel-hubens FAQ - dessa fragor handlar specifikt om
 * att VALJA ratt CV/brev-exempel for sitt yrke.
 */

export interface FaqItem {
  q: string
  a: string
}

export const CV_GALLERI_FAQ: FaqItem[] = [
  {
    q: 'Hur väljer jag rätt CV-exempel för mitt yrke?',
    a: 'Sök på din exakta yrkestitel eller välj din bransch i kategori-filtret. Hittar du inte just din titel, välj ett närliggande yrke i samma område. En kundrådgivare kan till exempel hämta inspiration från account manager, en distriktssköterska från sjuksköterska. Strukturen, nyckelorden och tonen är ofta överförbara inom samma fält.',
  },
  {
    q: 'Vad är ett ATS-optimerat CV?',
    a: 'ATS står för Applicant Tracking System och är de program som flesta större arbetsgivare använder för att sålla bland ansökningar. Ett ATS-optimerat CV har tydliga rubriker, vanlig text utan komplicerad formattering, och de nyckelord som rekryterare faktiskt söker efter. Alla våra CV-exempel är skrivna med detta i åtanke.',
  },
  {
    q: 'Kan jag kopiera ett CV-exempel rakt av?',
    a: 'Vi rekommenderar att du använder dem som inspiration, inte som färdiga mallar. Rekryterare läser hundratals CV och känner snabbt igen kopior. Bygg ditt eget innehåll utifrån strukturen, men byt ut detaljerna mot dina egna erfarenheter, dina egna siffror och dina egna styrkor.',
  },
  {
    q: 'Vad ska ett bra CV innehålla?',
    a: 'Ett bra CV innehåller: kontaktuppgifter, en kort sammanfattning (3-4 rader), arbetslivserfarenhet i omvänd kronologisk ordning med kvantifierade resultat, utbildning, kompetenser och eventuella språk eller certifieringar. Håll det till en eller två A4-sidor. Våra exempel visar exakt hur balansen mellan dessa delar bör se ut för olika yrken.',
  },
  {
    q: 'Hur lång ska CV:n vara?',
    a: 'För de flesta yrken: en A4-sida om du har under fem års erfarenhet, två sidor om du har mer. Akademiska CV:n eller specialistroller kan bli längre om publikationer eller certifieringar kräver det. Rekryterare läser sällan mer än två sidor på första genomgången, så det viktigaste ska finnas på den första.',
  },
  {
    q: 'Är CV-exemplen gratis att använda?',
    a: 'Ja. Alla våra CV-exempel är helt kostnadsfria att läsa och inspireras av. Du behöver inte skapa konto. Vill du sedan bygga ditt eget CV med våra verktyg så registrerar du dig gratis och får en CV-analys var tredje dag utan att betala något.',
  },
]

export const BREV_GALLERI_FAQ: FaqItem[] = [
  {
    q: 'Hur väljer jag rätt brev-exempel för mitt yrke?',
    a: 'Sök på din exakta yrkestitel eller välj din bransch i filtret. Hittar du inte just din titel kan du välja ett närliggande yrke i samma område. En förskollärare och grundskollärare kan ha mycket att lära av varandras brev. Strukturen och tonaliteten är ofta liknande inom samma fält.',
  },
  {
    q: 'Hur långt ska ett personligt brev vara?',
    a: '250 till 350 ord, eller ungefär tre fjärdedelar av en A4-sida. Kortare än så känns ointresserat, längre än så läses sällan i sin helhet. Strukturera brevet i tre eller fyra stycken: en öppning som visar att du läst annonsen, en mittparti om varför just du passar, och ett avslut med tydlig nästa steg.',
  },
  {
    q: 'Vad ska jag skriva i ett personligt brev?',
    a: 'Ett bra brev visar att du förstått tjänsten och kopplar din erfarenhet direkt till annonsens krav. Använd företagets egna ord och nyckelfraser från annonsen. Lyft fram konkreta resultat som siffror, projekt eller mätbara förbättringar, istället för generella adjektiv som "engagerad" eller "lösningsorienterad".',
  },
  {
    q: 'Hur skiljer sig brev mellan olika branscher?',
    a: 'Tonalitet och struktur varierar mycket mellan branscher. En konsultbyrå förväntar sig formellt språk och tydligt resultatfokus, medan en startup ofta uppskattar mer personlig ton. Vården kräver empati och lyhördhet, tech-branschen kräver tekniska detaljer och stack-kompetens. Våra exempel visar dessa skillnader yrke för yrke.',
  },
  {
    q: 'Kan jag använda samma personliga brev för flera jobb?',
    a: 'Vi rekommenderar att du anpassar varje brev. Generiska brev syns direkt och får sällan svar. Spara strukturen och de delar som handlar om dig själv, men byt ut de sektioner som handlar om företaget och rollen för varje ny ansökan. Det tar bara några minuter extra och dubblar dina chanser.',
  },
  {
    q: 'Är brev-exemplen gratis att använda?',
    a: 'Ja. Alla brev-exempel är helt kostnadsfria att läsa och inspireras av, och du behöver inte skapa konto för det. Vill du sedan bygga ditt eget brev med våra verktyg får du två brev per dag helt gratis när du registrerat dig.',
  },
]
