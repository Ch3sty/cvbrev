# Granskning parti 03 och bank 3.1

Datum 2026-10-12. Granskare: testansvarig. Underlag: `docs/qa/omgang2/numeriskt-parti-03.html`, `verbalt-expert-parti-03.html`, `bank-3-1/index.html` med en PNG per fråga, kandidatfilerna i `src/lib/numericalTestV2/kandidater/parti-03-grund.json`, `parti-03.json`, `src/lib/verbalTestExpert/kandidater/parti-03.json` och `src/lib/logicTestV7/kandidater/bank-3-1.v7.json`. Beslut i `beslut-parti-03.json` och `beslut-bank-3-1.json`. Villkoren i beslutsfilen ska vara införda innan befordran.

## 1. Numeriskt grund, ng-17 till ng-32: 16 av 16 godkända

Alla 64 facit är kontrollräknade för hand mot tabell eller diagram och stämmer med stegen och avrundningen (ng-32 q03 40,625 blir 40,6, ng-28 q02 21,739 blir 21,7, inget facit ligger på halvan). Distraktorerna är räknade och skiljer sig med minst en visningsenhet. Svensk talform i tabeller, alternativ och förklaringar. Ett till två steg, enhetsbytet står i inledningen, p_prior 0,7. Rätt bokstav 16 gånger var. Inga talstreck.

De tre minsta avstånden (ng-23 q01 138 mot 140 kg, ng-27 q04 60 mot 62, ng-31 q02 16,7 mot 16,0) godtas: båda talen är exakta beräkningar med intilliggande kolumn eller bas, så den som räknat rätt ser skillnaden. Typetiketterna som är bedömningar (ng-21 q04 "8 kr" som fel_operation, ng-31 q03 platser som fel_bas) är rimliga.

## 2. Numeriskt avancerad, na-17 till na-24: 8 av 8 godkända, två villkor

Alla 32 facit kontrollräknade (na-21 q04 lönesumman 37 042 500 / 905 = 40 931, na-24 q04 45 302 250 kr, na-23 q02 78 190 tkr). Två till tre steg med enhetsbyte och en oanvänd kolumn eller stapel i varje underlag. Linjediagrammen (na-22) har `showValues: true`, så na-04-problemet finns inte här. Minsta avstånden (na-21 q01 4,0 mot 3,8 mot 3,5, na-22 q01 29,9 mot 29,5, na-18 q04 3 148 mot 3 076) godtas av samma skäl som ovan; på avancerad är täta alternativ en del av formatet.

Villkor:

- **na-19:** "Kostnad per plats" med 60 platser men 55 påbörjade kan läsas som att bara fyllda platser kostar. Tillägg i inledningen: "Kommunen betalar för alla platser, även de som inte fylls." Då är q02 och q04 entydiga.
- **na-23 q04:** "9,4 handläggare" är en konstig storhet. Frågan ställs om till heltidstjänster, enheten i alternativen likaså. Siffrorna rörs inte.

## 3. Verbalt expert, verbexp-p13 till p20: 8 av 8 godkända, två villkor

Åtta argument med var sitt klassiska fel: basfrekvens (p13), urval (p14), regression mot medel (p15), sänkta kostnader (p16), cirkelbevis (p17), ekvivokation (p18), sammansättning (p19), bekräftat konsekvens (p20). Facit är entydigt i alla 32 frågor; i de tre flaggade (p14 q4, p19 q3, p20 q2) är det näst bästa alternativet tydligt sämre: "besvarades främst av cyklister" står inte i texten, "två har lett egna uppdrag" rubbar inte underlaget, "är på väg in i kris" är just slutsatsen som inte följer. Svenska facktermer, inga talstreck, rätt bokstav åtta gånger var. p_prior 0,45 är en rimlig gissning tills kalibreringen säger annat.

Villkor:

- **p13 q03 byts.** q01, q03 och q04 faller alla på samma uppgift (andelen ekonomer bland övriga säljare). Den som ser luckan i q01 får q03 och q04 gratis, och texten mäter då en insikt tre gånger. Ny q03 om medarbetarsamtalens roll (struktur) står i beslutsfilen. p15 har samma fenomen från fyra håll men fyra olika färdigheter (hitta, stärka, antagande, upplägg), så den står.
- **p18 q04 c:** "flest överklagade beslut" ska vara "högst andel överklagade beslut", som texten säger.

Efter befordran: verbalt expert 20, numeriskt grund 36, avancerad 36 (na-04 inräknad).

## 4. Bank 3.1, de 15 ersättarna: 14 godkända, 1 flyttas

Kontrollkedjan är grön. Jag har läst varje rutnät mot regeltexten och varje distraktor mot misstagstexten.

- **byte-18 till 23 (M2-pil-tre):** vinkel, längd och spets stämmer i alla åtta synliga rutor i alla sex, facit följer. Alternativen är nu en nära miss per regel plus två som bryter alla tre med olika fel i vridningen, och facits värde är 3 mot 3 i vinkel, längd och spets. Röstningsgenvägen är borta. Godkända.
- **tva-07, tva-08 (M3-balans-sida):** kvadratens och cirkelns positioner och sidor stämmer rad för rad med omslag vid kanten. 3 mot 3 i position och sida för kvadraten och i sida för cirkeln, 3 mot 2 och 1 i cirkelns position. Godkända.
- **over-16:** facit {6} är inte längre den enda ensamma rutan, F är en annan ensam ruta. Godkänd.
- **over-17 (samma rutnät som over-02):** samma rutnät godtas. Det som fällde over-02 var alternativen (facit som centrum), och de är utbytta: union, symmetrisk differens, snitt, omvänd differens och kopia av mittrutan. Att facit är en enda ruta och att kolumn 1 har samma översta och nedersta ruta är magert men regelrätt, och kravet på minst två element gäller sektorhjul och strålar, inte rutmönstret. Min tidigare önskan om ny seed stryks; deterministisk kedja och jämförbarhet med den strukna väger tyngre.
- **plus-over-21, plus-over-22 (P4):** operation och vridning kontrollräknade på alla rader respektive kolumner (over-21: {1,3,6} vridet tre steg medurs ger {1,4,6}; over-22: {5,7} vridet tre steg moturs ger {2,4}). Facitlinjen delar element, facit har minst två sektorer. Att facits operation och vridning är vanligast bland alternativen är ingen genväg här: ingen av dem går att läsa av ett alternativ utan att först lösa frågan. Godkända.
- **vand-15, vand-16:** nya rutnät, regeln stämmer, facit är inte rutan uppe till vänster, alla sex alternativ är olika lägen med rätt misstagstext. Läsordningscykeln är tillåten på grund. Godkända.
- **antal-06: flyttas till avancerad.** Med riktningen på diagonalen är det två oberoende regler, exakt receptet bakom v7a-v3-antal-02 och -03 (svårighet 3, p_prior 0,5). Fällan B (rätt antal, fel riktning, kopia av ruta 2) är det som skiljer avancerad från grund. Frågan är bra och entydig, men med p_prior 0,65 på grund lovar den mer än den håller. Byggs om som v7a-v3-antal-04 med samma rutnät, svårighet 3, p_prior 0,5. Grund får ingen ersättare: mallen med konstant riktning är uttömd (åtta rutnät, alla delar rader med antal-03 och -04). Träningsversionen får då grund 109, avancerad 96, expert 95; vitest-talen för `TRANINGSBANK` justeras.

## 5. Beslut om B2, riktade textpass

**Beslut: `MINST_AV_TYP_VERBAL = 1`, det typade påståendet först, passformen oförändrad.** Motiv: alla typade texter (parti 01 till 03) har exakt ett påstående per typ, så kravet på två döljer familjen för alltid. Att blanda två texter dubblar lästiden för samma två riktade påståenden och bryter passets form (en text, fyra påståenden, tre minuter). Att beställa texter med två av samma typ löser det först i parti 04 och bara för de nya texterna.

Konsekvenser som ska in i B2 och B4:

1. Riktat textpass: en osedd text på nivån med minst ett påstående av typen. Det typade påståendet visas först, de tre övriga i bankens ordning. Rubriken visar familjen som i dag.
2. Familjen visas när minst tre sådana osedda texter finns, som förut. Frysta texter räknas `okand` och ger aldrig riktat pass; på grund finns i omgång 2 inga typade texter, så riktade textpass finns bara på avancerad. Det ska synas som dold familj, inte som fel.
3. "Var du tappade" räknar bara det typade påståendet mot typens stapel; de tre övriga räknas som vanligt pass i statistiken.
4. Beställning till parti 04 (verbalt grund och avancerad): varje text får två påståenden av en och samma typ, kvantor eller utanför, så att riktade pass blir riktade på riktigt. Typning av de 32 frysta avancerade texterna är en textuppgift utan ny text och beställs samtidigt.
