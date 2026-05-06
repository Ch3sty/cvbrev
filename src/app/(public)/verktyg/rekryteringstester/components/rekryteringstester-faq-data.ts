/**
 * FAQ-data for /verktyg/rekryteringstester landningssidan.
 * 8 fragor optimerade for long-tail-keywords kring "rekryteringstester",
 * "matrislogik", "verbalt resonemang" och "numeriskt resonemang".
 */

export interface FaqItem {
  q: string
  a: string
}

export const REKRYTERINGSTESTER_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Vad är rekryteringstester och varför används de?',
    a: 'Rekryteringstester är standardiserade prov som mäter logiskt tänkande, språkförståelse och sifferanalys. Arbetsgivare använder dem för att jämföra kandidater på samma villkor och för att förutsäga hur du kommer prestera i rollen. Vanliga leverantörer i Sverige är SHL, Cut-e och Assessio och tester förekommer både hos myndigheter, konsultbolag och i tjänstemannaroller.',
  },
  {
    q: 'Hur fungerar ett matrislogik-test?',
    a: 'Du får en 3×3-matris där åtta av nio rutor innehåller en form. Formerna följer ett mönster, till exempel att antalet prickar ökar för varje rad eller att en figur roterar steg för steg. Din uppgift är att räkna ut vilken form som ska stå i den tomma rutan. Hos oss tränar du på 15 frågor per pass i samma format som SHL och Cut-e använder.',
  },
  {
    q: 'Vad är verbalt resonemang och hur tränar man på det?',
    a: 'Verbalt resonemang testar din förmåga att läsa en kort text och avgöra om ett påstående är sant, falskt eller om informationen inte räcker för att avgöra. Det handlar inte om allmänbildning utan om vad texten faktiskt säger. Vårt verbala test innehåller 12 textpassager med fyra påståenden per passage, totalt 48 bedömningar.',
  },
  {
    q: 'Vad är numeriskt resonemang?',
    a: 'I numeriskt resonemang får du en tabell eller ett diagram med ekonomiska siffror och ska räkna ut svaret på en fråga, oftast en procent eller skillnad. Det testar inte avancerad matematik utan din förmåga att läsa en tabell snabbt och göra rätt beräkning under tidspress. Du tränar på 24 frågor per pass.',
  },
  {
    q: 'Hur tränar jag bäst inför ett rekryteringstest?',
    a: 'Träna i samma tidspress som det skarpa testet och gör flera pass per testtyp. Det viktigaste är att lära sig formatet, så att du inte slösar tid på att tolka frågan utan kan fokusera på själva lösningen. Efter varje pass går vi igenom dina rätt och fel så du ser exakt vilka mönster du missade och kan jobba på dem.',
  },
  {
    q: 'Är det fusk att träna inför ett rekryteringstest?',
    a: 'Nej. Det är fusk att se de exakta frågorna i det skarpa testet i förväg, men att träna på samma typ av frågor är helt accepterat och även förväntat. Tester som SHL och Cut-e mäter en stabil förmåga som påverkas av träning, ungefär som körkortsteorin. Den som tränat på formatet hinner bättre.',
  },
  {
    q: 'Hur lång tid tar varje test?',
    a: 'Våra grundtester tar runt 20 minuter och de avancerade versionerna runt 25 minuter. Du kan när som helst pausa eller göra om testet, och du ser tiden räkna upp medan du svarar så du tränar på att hålla tempot.',
  },
  {
    q: 'Är testerna gratis?',
    a: 'Ja. Du får göra de tre grundtesterna helt gratis och utan att lämna kortuppgifter. Vill du tävla mot dig själv på de avancerade versionerna med svårare frågor och längre tid uppgraderar du till Premium för 149 kr per månad. Du kan testa Premium gratis i sju dagar.',
  },
]
