/**
 * Hjälprutornas texter på Alla tester, Din utveckling och resultatsidan
 * (copywriterns docs/design/tester-lyft-2026-10-11/hjalp.md). En källa för
 * hjälpraden, i-knappens popover och sidopanelen.
 *
 * Rutor med `verifiera: true` innehåller tal om leverantörernas egna prov
 * som inte är kontrollerade. De visas inte (hjalpRuta ger null) förrän
 * flaggan tagits bort efter kontroll mot leverantörens egen sida. Vad som
 * ska kontrolleras står i `verifieraNot`.
 *
 * Tal utan markering är hämtade ur koden (testConfig.ts, tempo.ts, niva.ts,
 * getResultsData.ts) och gäller tills koden ändras.
 *
 * Skrivregler: vi-form, svenska facktermer, inga tankstreck, "samma format
 * som" och aldrig "samma test", inga påståenden om träffsäkerhet.
 */

export type HjalpGrupp = 'A' | 'B' | 'C' | 'D' | 'E'

export type HjalpId =
  | 'A1' | 'A2' | 'A3' | 'A4' | 'A5'
  | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'B8' | 'B9'
  | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6'
  | 'D1' | 'D2' | 'D3'
  | 'E1' | 'E2' | 'E3'

export interface HjalpRutaText {
  id: HjalpId
  grupp: HjalpGrupp
  /** Rubriken i frågeform. */
  rubrik: string
  /** Två till fyra meningar, ett stycke. */
  text: string
  /** Sant när rutan har tal som måste kontrolleras före publicering. */
  verifiera?: true
  /** Vad som ska kontrolleras, ur hjalp.md. */
  verifieraNot?: string
}

export const HJALP_GRUPPER: Record<HjalpGrupp, string> = {
  A: 'Vad är ett rekryteringstest?',
  B: 'Per testtyp',
  C: 'Hur du läser dina resultat',
  D: 'Din utveckling',
  E: 'Personlighetstestet',
}

export const HJALP_RUTOR: Record<HjalpId, HjalpRutaText> = {
  A1: {
    id: 'A1',
    grupp: 'A',
    rubrik: 'Vad är ett rekryteringstest?',
    text: 'Ett rekryteringstest är ett prov som arbetsgivaren låter alla sökande göra på samma villkor. De vanligaste mäter logiskt tänkande, läsförståelse och sifferförståelse. Många lägger till ett personlighetstest. Du gör det nästan alltid på egen hand, på dator eller mobil, inom några dagar efter att du fått länken.',
  },
  A2: {
    id: 'A2',
    grupp: 'A',
    rubrik: 'Varför använder arbetsgivare tester?',
    text: 'Ett CV säger vad du gjort, inte hur du tänker. Testet ger rekryteraren ett mått som är lika för alla och som inte beror på hur bra du skriver ansökningar. Och när hundratals söker samma tjänst är det ett sätt att sortera.',
  },
  A3: {
    id: 'A3',
    grupp: 'A',
    rubrik: 'När i processen kommer testet?',
    text: 'Oftast tidigt. Antingen direkt när du skickat in ansökan, eller som första steg efter en snabb gallring på CV. Resultatet avgör sedan om du blir kallad till intervju. Större bolag, konsultföretag och traineeprogram testar nästan alltid, och allt fler kommuner och myndigheter gör det vid tjänster med många sökande.',
  },
  A4: {
    id: 'A4',
    grupp: 'A',
    rubrik: 'Hur lång tid tar det?',
    text: 'Mellan 5 och 40 minuter per test. Aons test är kortast, 5 till 12 minuter med fler uppgifter än någon hinner. Matrigma tar 12 minuter adaptivt och 40 klassiskt, Alva Logic oftast 15 till 20. Får du flera test i samma utskick kan du räkna med en timme sammanlagt. Personlighetstestet har ingen klocka, logik, verbalt och numeriskt har det alltid.',
  },
  A5: {
    id: 'A5',
    grupp: 'A',
    rubrik: 'Kan man träna inför ett rekryteringstest?',
    text: 'Ja. Formatet slutar överraska, du får grepp om de uppgiftstyper som återkommer och du vänjer dig vid att tänka klart med klockan igång. Själva förmågan är den du har. Så räkna med att träningen flyttar dig från ett ovant till ett vant resultat, inte till någon annans.',
  },

  B1: {
    id: 'B1',
    grupp: 'B',
    rubrik: 'Logiktest: vad är en matris?',
    text: 'Du ser ett rutnät med figurer, oftast tre gånger tre, där en ruta saknas. Figurerna följer en eller flera regler, som rotation, antal eller färg, och du ska välja den figur som fullbordar mönstret. Testet mäter hur du hittar regler i något du aldrig sett förut. Därför passar det oavsett yrke.',
  },
  B2: {
    id: 'B2',
    grupp: 'B',
    rubrik: 'Logiktest: vem använder det och hur övar jag?',
    text: 'Våra matriser följer samma format som Matrigma och Alva Logic. SHL Verify och Aon scales ix mäter samma sak med figurserier i stället för rutnät, och reglerna du lär dig här är desamma. Ett tips: läs raderna först, sedan kolumnerna. Sätt ord på regeln innan du tittar på svarsalternativen, för de är byggda för att locka den som bara hittat halva regeln.',
  },
  B3: {
    id: 'B3',
    grupp: 'B',
    rubrik: 'Verbalt test: vad mäter det?',
    text: 'Du läser en kort text och tar ställning till påståenden om den: sant, falskt eller går inte att avgöra. Det mäter om du håller dig till det som faktiskt står och drar slutsatser av det, inte av vad du råkar veta sedan tidigare. Samma svarsformat som SHL Verify verbal och Aons scales verbal. Alva och Assessio har inget verbalt test, så får du Matrigma eller Alva Logic behöver du inte öva det här.',
  },
  B4: {
    id: 'B4',
    grupp: 'B',
    rubrik: 'Verbalt test: vad är tipset?',
    text: 'Det är på skillnaden mellan "falskt" och "går inte att avgöra" som de flesta tappar poäng. Falskt betyder att texten säger emot påståendet. Går inte att avgöra betyder att texten är tyst om saken. Lita på texten, inte på din allmänbildning, även när du är säker på att du vet bättre.',
  },
  B5: {
    id: 'B5',
    grupp: 'B',
    rubrik: 'Numeriskt test: vad mäter det?',
    text: 'Du får en tabell eller ett diagram och ska räkna fram ett svar, till exempel en andel, en förändring eller en prognos. Det mäter om du hittar rätt siffra i underlaget och räknar rätt på den med klockan igång. Vanligt för tjänster med budget, analys eller försäljning. Samma format som det numeriska testet i SHL Verify. Aons scales numerical ser annorlunda ut, med fler uppgifter än du hinner och svaren sant, falskt eller går inte att avgöra, men räknandet i tabellerna är detsamma.',
  },
  B6: {
    id: 'B6',
    grupp: 'B',
    rubrik: 'Numeriskt test: vad är tipset?',
    text: 'Läs frågan innan du läser tabellen, då vet du vilken rad och kolumn du letar efter. Håll isär procent och procentenheter. Det är den vanligaste fällan. Räknaren är tillåten hos oss och hos de flesta leverantörer, men det som tar tid är att välja rätt tal, inte att slå in dem.',
  },
  B7: {
    id: 'B7',
    grupp: 'B',
    rubrik: 'Personlighetstest: vad mäter det?',
    text: 'Du tar ställning till påståenden om hur du brukar vara, till exempel hur du planerar, hur du tar beslut och hur du fungerar i grupp. Svaren blir en profil på fem dimensioner, efter den modell som forskare kallar femfaktormodellen eller Big Five. Rekryteraren jämför profilen med vad tjänsten kräver, inte med något facit.',
  },
  B8: {
    id: 'B8',
    grupp: 'B',
    rubrik: 'Provläget: vad är skillnaden mot träning?',
    text: 'I träningen får du förklaring efter varje fråga och kan ta den tid du behöver. I provläget går klockan, du får inga förklaringar under tiden och provet lämnas in automatiskt när tiden är ute, precis som hos en rekryterare. Logikprovet är 18 uppgifter på 25 minuter, det verbala 48 på 40 minuter och det numeriska 36 på 40 minuter.',
  },
  B9: {
    id: 'B9',
    grupp: 'B',
    rubrik: 'Provläget: varför ska jag ange leverantör?',
    text: 'Leverantörerna skiljer sig mest i tempot. Vet du vilket test du ska göra ställer vi om provet till samma antal uppgifter och samma tid som den leverantören använder. Då övar du på rätt klocka. Anger du ingen leverantör kör vi vårt eget format, 18 uppgifter på 25 minuter.',
  },

  C1: {
    id: 'C1',
    grupp: 'C',
    rubrik: 'Vad betyder procent rätt?',
    text: 'Precis vad det låter som: 12 rätt av 15 frågor ger 80 procent. Siffran gäller den nivå du gjorde testet på, så jämför den bara med dina egna tidigare försök på samma nivå. 80 procent på grundnivå och 80 procent på expertnivå är två helt olika prestationer.',
  },
  C2: {
    id: 'C2',
    grupp: 'C',
    rubrik: 'Vad är nivån 1 till 10?',
    text: 'Nivån är vårt mått på hur svåra uppgifter du klarar, oavsett vilket test du gjort. En fråga som de flesta klarar ligger lågt på skalan, en fråga som få klarar ligger högt, och din nivå är där du klarar ungefär hälften. Vi mäter den med tolv frågor som anpassar sig efter dina svar. Sedan flyttar varje pass den högst ett halvt steg åt gången, så att en dålig dag inte raderar en bra vecka.',
  },
  C3: {
    id: 'C3',
    grupp: 'C',
    rubrik: 'Vad är tempot?',
    text: 'Tempot visar hur många uppgifter nära din nivå som tog längre tid än provet ger dig per uppgift. Vilken klocka vi räknar mot beror på vilket prov du angett: vårt eget ger 83 sekunder, Matrigma klassisk cirka 68 sekunder och adaptiv en minut, Alva Logic 2 minuter, Aon scales ix 15 sekunder. SHL Verify finns i flera versioner, så där räknar vi med formatet som står på provraden. Rätt men långsamt är ett lika tydligt besked som fel.',
  },
  C4: {
    id: 'C4',
    grupp: 'C',
    rubrik: 'Vad är percentilen?',
    text: 'Percentilen visar hur stor andel av alla som gjort det här testet hos oss som du låg över. 70:e percentilen betyder att du låg över sju av tio. Vi visar den först när minst 25 personer gjort testet. Innan dess säger talet mer om vilka som råkat vara först än om dig.',
  },
  C5: {
    id: 'C5',
    grupp: 'C',
    rubrik: 'Vad skiljer grund, avancerad och expert?',
    text: 'Grundnivån bygger på en regel i taget, avancerad på två regler som gäller samtidigt, expert på tre lager, med svarsalternativ som ser rätt ut tills du kollat den tredje regeln. I det verbala går stegen från "svaret står i texten" över längre texter med fler nyanser till att analysera argument. I det numeriska från att läsa av ett värde till att räkna med flera variabler. Expertnivån motsvarar det som konsultbolag och traineeprogram använder för att skilja de sista kandidaterna åt.',
  },
  C6: {
    id: 'C6',
    grupp: 'C',
    rubrik: 'Varför sjönk mitt resultat?',
    text: 'Oftast för att du gjorde testet trött, stressad eller på mobilen i farten, och tempot åt upp de sista frågorna. Ibland för att du bytte strategi och ännu inte fått den att sitta. Ett enskilt försök säger lite, det är kurvan över flera försök som visar var du står.',
  },

  D1: {
    id: 'D1',
    grupp: 'D',
    rubrik: 'Vad visar kurvan?',
    text: 'Varje punkt är ett slutfört försök på det testet, med andelen rätt. Linjen visar om du rör dig uppåt, står stilla eller svajar. Titta på riktningen, inte på en enskild punkt. Nivån 1 till 10 har en egen kurva under Hela kurvan.',
  },
  D2: {
    id: 'D2',
    grupp: 'D',
    rubrik: 'Vad betyder "procentenheter mot tidigare snitt"?',
    text: 'Vi tar ditt senaste försök och jämför med snittet av alla dina försök före det. Plus 20 procentenheter betyder att du senast låg 20 enheter över din egen tidigare nivå, till exempel 80 procent mot ett snitt på 60. Ligger du inom en enhet från snittet skriver vi "Jämnt mot tidigare försök".',
  },
  D3: {
    id: 'D3',
    grupp: 'D',
    rubrik: 'Vad räknas som en bra utveckling?',
    text: 'En kurva som stiger de första försöken och sedan planar ut på en högre nivå. Att den planar ut är inget stopp. Det betyder att formatet sitter och att det är dags för en svårare nivå eller ett provläge med klocka. Svajar kurvan kraftigt är det oftast tempot eller dagsformen, inte förmågan, som varierar.',
  },

  E1: {
    id: 'E1',
    grupp: 'E',
    rubrik: 'Finns det rätt svar på personlighetstestet?',
    text: 'Nej. Det finns ingen poäng, ingen procent och ingen nivå, bara en profil som beskriver hur du brukar fungera. Därför kan det inte heller gå "bättre" andra gången, och vi visar ingen kurva för det.',
  },
  E2: {
    id: 'E2',
    grupp: 'E',
    rubrik: 'Hur tolkar rekryteraren profilen?',
    text: 'Rekryteraren ställer profilen mot kravprofilen för tjänsten: en säljroll och en revisorsroll vill ha olika saker, och samma drag kan vara en styrka i den ena och ett frågetecken i den andra. Oftast blir profilen underlag för intervjufrågor snarare än ett ja eller nej i sig.',
  },
  E3: {
    id: 'E3',
    grupp: 'E',
    rubrik: 'Vad ska jag tänka på när jag svarar?',
    text: 'Svara som du faktiskt är i arbetet, inte som du tror att tjänsten vill ha det. Många test ställer samma fråga på flera sätt, och den som försöker svara rätt får en ojämn profil som är svår att lita på. Grundtestet hos oss har 50 påståenden och tar runt 10 minuter, det avancerade 120 påståenden och runt 25 minuter.',
  },
}

export const HJALP_IDN = Object.keys(HJALP_RUTOR) as HjalpId[]

/** Rutan om den får visas, annars null (okänt id eller ej verifierad). */
export function hjalpRuta(id: HjalpId): HjalpRutaText | null {
  const r = HJALP_RUTOR[id]
  if (!r || r.verifiera) return null
  return r
}

/** De rutor i listan som får visas, i given ordning. */
export function synligaRutor(ids: readonly HjalpId[]): HjalpRutaText[] {
  return ids.map(hjalpRuta).filter((r): r is HjalpRutaText => r !== null)
}

/** Gränssnittets egna ord kring hjälpen. */
export const HJALP_UI = {
  dolj: 'Dölj hjälpen',
  stang: 'Stäng',
  panelEtikett: 'Hjälp',
  /** Profilraden: växeln är på när hjälpen är dold. */
  profilTitel: 'Dölj hjälpen',
  profilText: 'Tar bort förklaringarna i Rekryteringstester. Slå av när du vill ha dem tillbaka.',
  profilEtikett: 'Dölj hjälpen i Rekryteringstester',
  profilFel: 'Inställningen kunde inte sparas. Försök igen.',
} as const
