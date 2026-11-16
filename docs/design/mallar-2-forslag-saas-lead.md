# Merförsäljningen och Föreslagna för dig med 40 mallar: beslut

saas-lead, 2026-11-16, kväll. Svar på utbud 2 avsnitt 4 punkt 9 (`docs/design/mallar-utbud-2-2026-11-16.md`). Underlag: `src/lib/cv/mallval/forslag.ts`, `src/components/cv/Dokument/Merforsaljning.tsx`, `src/components/cv/Dokument/texter.ts`, katalogen `src/lib/cv/mallar/katalog.ts` (40 rader), utbud 1 avsnitt 6, och en körning av dagens funktioner mot hela katalogen (resultatet i avsnitt 0). Inga priser och ingen gratisnivå ändras. Koden rörs inte av det här dokumentet; Opus implementerar enligt avsnitt 5.

## 0. Vad dagens regler ger med 40 mallar (uppmätt, inte gissat)

Körning av `merforsaljningsUrval` och `foreslagna` mot `MALL_KATALOG` 2026-11-16:

| Fall | Dagens utfall | Problem |
|---|---|---|
| Merförsäljning, utan foto, 1 sida (Linne, Björk, vem som helst) | Kalksten, Granit, Stål | Tre sidospalter som ser lika ut i 112 px. Ingen av de 20 nya syns. Samma tre för alla. |
| Merförsäljning, utan foto, 2 sidor | Kalksten, Granit, Not | Not visas med raden "Kompakt, rymmer mer" över "Not": "not" är ett svenskt ord (fotnot) och läses som en anmärkning, inte som ett mallnamn. |
| Merförsäljning, med foto, 1 sida | Kalksten, Stål, Koppar | Stål saknar fotoplats och visas för en användare med foto. Alm, Sand, Loft, Betong, Ek (nya fotomallar i Word) visas aldrig. |
| Föreslagna, skäl ingen | Linne, Björk, Koppar | Plats 2 går till andra gratismallen, som redan står i gruppen Gratis bredvid. En Premiumplats bortkastad. |
| Föreslagna, skäl intyg | Linne, Kalksten, Sand | Sand träffas av regexen `panel` men har inget intygsfält (intygen ligger som rad i huvudspalten). Granit, som har intygsfält, faller bort. |
| Föreslagna, skäl kort | Linne, Loft, Björk | Loft träffas av regexen `luft` ("Luftig"). Råkar passa, men är en slump. Plats 3 är gratismallen igen. |
| Föreslagna, skäl system | Linne, Raster, Not | Rimligt. |
| Föreslagna, skäl lang | Linne, Not, Björk | Plats 3 gratismallen igen. Årsring och Kolumn (utbud 1:s val för lång karriär) borta. |
| Föreslagna, ingen erfarenhet alls | skäl ingen | En student utan jobb får inte "Utbildning först", bara den med ett kort jobb. |

Slutsats: textregler (`/panel|luft|kompakt/` mot `kort` och `stil`) höll för 20 mallar skrivna av en hand; med 40 ger de slumpträffar. Urvalet är dessutom en försäljningsfråga som vi vill kunna ändra för hand efter första avläsningen 14 december, utan att formulera om mallbeskrivningar.

## 1. Beslut: handplockat, en tabell, regeln kvar som reserv

**Urvalet i både merförsäljningen och Föreslagna för dig blir handplockade, ordnade id-listor** i `src/lib/cv/mallval/forslag.ts` (klientsäker, ren data). Dagens poängregler behålls som reserv och används bara för att fylla platser när ett id i tabellen saknas i katalogen eller stryks (nuvarande mall, fel nivå). Ett test fäller om ett id i tabellerna inte finns i katalogen, så tabellen kan inte glida isär från mallsystemet.

Skäl: (a) utfallet ovan, (b) händelserna `forslag_vald` och `merforsaljning_klick` bär redan `template` och `position`, så vi kan läsa av per plats och byta ut den svagaste för hand, (c) 40 mallar är nu basen och namnen ligger fast; principen "aldrig på id" från plan-mallar 3.3 skyddade mot att mallarna gjordes om, vilket redan är gjort.

Fasta regler som gäller oavsett tabell (behålls i kod, inte bara i tabellen):

1. Nuvarande mall visas aldrig i merförsäljningen.
2. Merförsäljningen visar bara Premium, bara mallar med Word, aldrig konstnärliga (utbud 1 avsnitt 6: Word-köparen blir besviken).
3. Föreslagna för dig: första platsen alltid en gratismall, platserna 2 och 3 alltid Premium med Word, aldrig två gratis. Konstnärliga aldrig i Föreslagna (de har egen grupp "Mer form och färg" i Alla).
4. Samma CV ger alltid samma förslag (deterministiskt, inga slumpval).
5. Tre kort i merförsäljningen, tre i Föreslagna. Remsan rymmer inte fler på mobil (MAX 12 med gratisgruppen), och fler val sänker klickfrekvensen per kort.

## 2. Merförsäljningen: vilka mallar per fall

Merförsäljningen når bara en användare vars nuvarande mall är gratis (Linne eller Björk): en Premiummall stoppas av `setSparr('mall')` innan `saljEllerVagg` i alla tre ytorna (`CvMallarClient.tsx`, `ByggareClient.tsx`, `ProvaArbetsyta.tsx`). Tabellen behöver därför bara skilja på foto och på om nuvarande är Björk. Samma tabell på alla tre ytorna (provsidan, /dashboard/cv-mallar efter mallval, byggaren): ytan skiljer sig i `surface` i händelsen, inte i urvalet.

| Fall | Plats 1 | Plats 2 | Plats 3 | Varför |
|---|---|---|---|---|
| Utan foto (Linne eller Björk) | Kalksten "Ljus sidospalt" | Koppar "Färgat huvud" | Skylt "Färgremsa och fyllda rubriker" | Tre olika former som skiljer sig i 112 px: två spalter, färgat band, remsa med fyllda rubriker. Sidospalten först (utbud 1: säljer bäst). Skylt är ny, Word, utan foto, och den mest särskiljande av de nya i miniatyr. |
| Med foto, nuvarande Linne | Kalksten "Sidospalt och foto" | Koppar "Färgat huvud, foto" | Alm "Delat huvud, foto" | Linne saknar fotoplats, så fotot är hela argumentet: tre mallar där hennes foto syns, i tre former (spalt, band, delat huvud). Alm är ny och Word. |
| Med foto, nuvarande Björk | Sand "Ljus högerpanel, foto" | Koppar "Färgat huvud, foto" | Alm "Delat huvud, foto" | Björk har runt foto; Sand (rund i panel) och Koppar (rund) behåller formen, så bilden känns igen. Alm har rundad kvadrat, nära nog. Kalksten (kvadrat) byts mot Sand här, inte för att Sand är bättre utan för att den nya fotomallen ska mätas mot Kalksten på den enda yta där båda passar. |
| Längre än en sida (alla fall ovan) | plats 1 och 2 som ovan | | Not "Kompakt, rymmer mer" | Som i dag: tredje kortet byts mot den kompakta. Texten är "Kompakt, rymmer mer", inte "Allt på en sida": Not lovar tätare sättning, inte en sida (sanningskravet). Strängen `MERFORSALJNING.allaPaEnSida` är oanvänd i dag och tas bort. |

Reservlista när en plats måste fyllas (id saknas eller är nuvarande), i ordning: utan foto Spår, Index, Stål; med foto Loft, Betong, Ek. Räcker inte den heller tar dagens poängregel över.

Ordningen är handplockad och fast. Rotationsregel efter avläsningen 14 december: den plats 3-mall som får lägst `merforsaljning_klick` per `merforsaljning_visad` byts mot första mallen i reservlistan; plats 1 och 2 rörs inte förrän vi har minst 200 visningar per fall.

## 3. Föreslagna för dig: rangordning per skäl

`foreslagna` får en femte parameter `harFoto` (standard `false`). Anroparna skickar `Boolean(fotoUrl)` (cv-mallar, byggaren) och `Boolean(p.cv?.personalInfo.profilePhotoUrl)` (provsidan). Med foto blir gratisplatsen Björk (den gratismall som visar fotot) och Premiumplatserna fotomallar i Word; utan foto är foto varken plus eller minus.

| Skäl (`ForslagSkal`) | Utan foto | Med foto | Varför |
|---|---|---|---|
| `intyg` (3 eller fler intyg; ordning Intyg först) | Linne, Kalksten, Granit | Björk, Kalksten, Granit | Kalksten och Granit har intygsfältet i panelen, synligt på sida 1 (utbud 1 avsnitt 6). Sand har inget intygsfält och ska inte föreslås här. |
| `kort` (erfarenhet under två år, eller ingen erfarenhet men utbildning; ordning Utbildning först) | Björk, Loft, Kalksten | Björk, Loft, Kalksten | Ett tunt CV behöver form som fyller sidan: Björks centrerade huvud, Lofts breda marginaler och stora namn, Kalkstens panel. Gratisplatsen är Björk även utan foto ("Centrerad"). |
| `system` (10 eller fler kompetensord; ordning Kompetenser först) | Linne, Raster, Stål | Björk, Raster, Granit | Raster har kompetenser i två spalter, Stål två spalter med mer plats, Granit kompetenslistan i panelen med fotoplats. |
| `lang` (mer än en sida; Få plats på en sida) | Linne, Not, Årsring | Björk, Not, Alm | Not är kompakt, Årsring bär en lång karriär som tidslinje utan att äta bredd på sida 2 (ingen sidospalt, utbud 1). Alm har ett lågt delat huvud med foto, så fotot kostar inte höjd. |
| `ingen` | Linne, Kalksten, Årsring | Björk, Kalksten, Loft | Tre formfamiljer (en spalt, sidospalt, marginal) så remsan visar bredden. Koppar sparas till merförsäljningen, så den som gått förbi Föreslagna möter minst två mallar hon inte redan valt bort. |

Komplementregeln mellan ytorna: Föreslagna och merförsäljningen får dela högst en mall per fall (Kalksten eller Sand, den starkaste), så att merförsäljningens övriga två kort alltid är nya för henne. Tabellerna ovan uppfyller det; ett test låser det.

`SKAL`-texterna i `texter.ts` står kvar oförändrade, de stämmer med urvalen.

## 4. Fel i dagens regler som rättas samtidigt

1. **Namnraden i merförsäljningskortet.** Flera av de nya namnen är vanliga ord (Not, Ek, Alm, Sand, Lind, Spår, Kant, Index, Skylt, Loft, Betong, Kakel). Med beskrivningen i fet stil och namnet ensamt under läses "Kompakt, rymmer mer" / "Not" som text med en fotnot. Så ska kortet se ut, alla tre korten lika:

   ```
   [ bild av hennes CV i mallen ]
   Kompakt, rymmer mer          (13 px fet, ink-1, som i dag)
   Mallen Not                   (text-meta, ink-3, som i dag men med ordet "Mallen")
   ```

   Knappen behåller "Ladda ner i Not, Premium 149 kr" och "Nej tack, behåll Linne" (där står mallnamnet i en mening och läses rätt). Radiokortets tillgängliga namn blir `"Kompakt, rymmer mer. Mallen Not"` via `aria-label`, så skärmläsaren inte läser ihop raderna. Ny sträng `MERFORSALJNING.mallnamn: (namn) => \`Mallen ${namn}\`` i `texter.ts`. Copywritern får byta ordet om hon vill, men strukturen (beskrivning fet, mallnamn märkt som mallnamn under) ligger fast.

2. **`allaPaEnSida` bort.** Oanvänd sträng som lovar något koden inte garanterar.

3. **Student utan jobb.** `skalFor` ger `kort` också när `experience` är tom och `education` har minst en post. I dag krävs ett jobb kortare än två år för att få Utbildning först, vilket missar den som behöver det mest.

4. **Två gratis i Föreslagna.** Löses av tabellen (regel 3 i avsnitt 1) och låses med test: exakt en gratis, på plats 1.

5. **Fotomall utan fotoplats i fotofallet.** Stål visades med foto. Löses av tabellen; test: med `harFoto` har alla Premiumkort i merförsäljningen `foto: true`.

Inget i detta ändrar `kortText` (R2: inget foto lovas när CV:t saknar foto) eller `KORT_UTAN_FOTO`.

## 5. Till Opus, implementationsordning

Allt i en commit på `feat/mallar-2`. Berörda filer: `src/lib/cv/mallval/forslag.ts`, `src/components/cv/Dokument/Merforsaljning.tsx`, `src/components/cv/Dokument/texter.ts`, de tre anroparna av `foreslagna`, `src/lib/cv/mallval/__tests__/mallval.test.ts`.

1. `forslag.ts`: exportera `FORESLAGNA: Record<ForslagSkal, { utanFoto: readonly string[]; medFoto: readonly string[] }>` och `MERFORSALJNING_URVAL: { utanFoto: readonly string[]; medFotoLinne: readonly string[]; medFotoBjork: readonly string[]; enSida: string; reserv: { utanFoto: readonly string[]; medFoto: readonly string[] } }` med id:na i avsnitt 2 och 3 (små bokstäver: `kalksten`, `koppar`, `skylt`, `alm`, `sand`, `not`, `granit`, `loft`, `raster`, `stal`, `arsring`, `linne`, `bjork`, `spar`, `index`, `betong`, `ek`). `medFotoBjork` används när nuvarande är `bjork`, annars `medFotoLinne`.
2. `foreslagna(katalog, cv, sidor = 1, antal = 3, harFoto = false)`: välj listan för skälet och fotot, filtrera mot katalogen, fyll upp till `antal` med dagens poängregel (`poang`) om något saknas. `skalFor` får fallet i avsnitt 4 punkt 3. Returtyp oförändrad.
3. `merforsaljningsUrval(katalog, nuvarande, sidor, harFoto)`: samma signatur. Läs tabellen, stryk nuvarande och id som inte finns, byt plats 3 mot `enSida` när `sidor > 1`, fyll från reservlistan, sist dagens poängregel. Fasta reglerna 1 och 2 i avsnitt 1 som filter sist, så inget i tabellen kan bryta dem.
4. `Merforsaljning.tsx`: namnraden `MERFORSALJNING.mallnamn(m.namn)`, `aria-label` på radiokortet enligt avsnitt 4 punkt 1. `texter.ts`: lägg till `mallnamn`, ta bort `allaPaEnSida`.
5. Anroparna: `raknaForslag(p.katalog, cvData, matning?.sidor ?? 1, 3, Boolean(fotoUrl))` i `CvMallarClient.tsx` och `ByggareClient.tsx` (med `fotoUrl` i useMemo-beroendena), `Boolean(p.cv?.personalInfo.profilePhotoUrl)` i `ProvaArbetsyta.tsx`.
6. Tester i `mallval.test.ts`: byt "utan foto: tre sidospalter" mot tabellens utfall för Linne utan foto (`kalksten, koppar, skylt`) och Björk med foto (`sand, koppar, alm`); behåll "aldrig nuvarande, aldrig konstnärlig, bara Premium" och lägg till "alla har Word"; med foto har alla `foto: true`; varje id i båda tabellerna finns i `MALL_KATALOG`; Föreslagna har exakt en gratis på plats 1 och Premium med Word på 2 och 3 för alla fem skäl, med och utan foto; komplementregeln (högst en gemensam mall mellan Föreslagna och merförsäljningen för samma skäl och fotofall); `sidor > 1` ger `not` på plats 3; tom erfarenhet med utbildning ger `kort`. `helskarm-dator.test.ts` använder egna id-listor och påverkas inte.
7. Grind före push, enligt feedback_test_en_gang_fore_push: `tsc`, `vitest` på mallval och Dokument, skärmdump av merförsäljningen på Pixel 7 med Not som plats 3 (två sidors CV) så att "Mallen Not" ryms på två rader i 112 px-kortet. Full build och klickmatris en gång på hela grenen.

## 6. Mätning och nästa beslut

Inga nya händelser. `forslag_visad`/`forslag_vald` (grupp, position, template, surface) och `merforsaljning_visad`/`merforsaljning_klick` (template, position, val, surface) räcker. Avläsning 14 december tillsammans med gratisvägen: klick per plats och per fall, köp via `paywall_cta_clicked` med `template` inom 24 timmar. Då tillämpas rotationsregeln i avsnitt 2 och tabellerna ändras för hand i `forslag.ts`, utan ny design.
