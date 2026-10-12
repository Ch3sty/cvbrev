# Deduktiv slutledning: villkoren står kvar, svaret står i remsan

Datum 2026-10-12. Författare: art-director, med ägarens mandat ("snygga, snabbladdade frågor, proffsigt och påkostat, inget utrymme för feltolkningar"). Mottagare: Opus F (bygger `src/components/tests/deduktiv/` och kortet), testansvarig (granskar mot beställningen B1 och mot hur deduktiva test faktiskt ser ut), svensk-ux-copywriter (titel, metod, brödtext, villkors- och stegmallar i `copy-omgang3.md`). Underlag: `bestallning-omgang3.md` B1 och C, `riktlinjer.md` 5.1 och 5.2, `VnUppgift.tsx` (textpassets klistrade text), `PassShell.tsx`, `Regelpanel.tsx`, `TestKategori.tsx`, `Provbladet.tsx`, `grafik-v3-spec.md` (färgroller, koppar).

Sidan `deduktiv.html` i samma katalog visar frågevyn för alla tre uppgiftstyperna före och efter svar, dator, kortet och resultatet, ljust och mörkt, 360 och 1280. Lösningsgången och remsan är utdata ur en prototyp av lösaren (`deduktiv-losare.ts` i art-directors scratchpad `omgang3/`): uttömmande lösare, spridning med parvis stöd och alla-olika, DD1 och DD2 räknade på sidans uppgifter. Ingenting i genomgången är ritat för hand.

Ordregler: inga tankstreck i något kandidaten ser, aldrig "lätt", aldrig "samma test", svenska facktermer (villkor, premiss, slutsats, schema, plats).

---

## 0. Beslutet i tre meningar

**Villkoren står kvar, svaret står i remsan.** Deduktiv är det första testet som läses i stället för tittas på, så vyn är textpassets: underlaget klistrat överst, frågan och alternativen som rader under, ingen figur, inget hjälprutnät. Det enda som ritas är lösningen efter svaret: villkoren i den ordning de låser en plats, ett steg per rad, och schemat som en remsa med platser och namn, där kopparn sitter på den plats svaret fyller. Allt kommer ur lösaren, så förklaringen kan aldrig säga något annat än vad facit säger.

---

## 1. Frågevyn

Skalet är `PassShell` (topprad 56 px med X, titel "Deduktiv slutledning", undertitel med nivån och vad den gör, räknaren "4 / 12"; tidsraden 4 px som fylls mot provets tid per uppgift, 75 s för 12 uppgifter på 15 minuter, aldrig nedräkning, aldrig färgbyte). Under det:

| Del | 360 (Pixel 7) | 1280 | Regel |
|---|---|---|---|
| Villkorskortet | klistrat under tidsraden (`sticky`, `top: 0`), 16 px marginal, högst 42 vh, egen rullning, golvets bakgrund och hårlinje under | vänsterspalt 400 px, `sticky`, ingen höjdgräns | Exakt textpassets mekanism (`Underlag` i `VnUppgift.tsx`), så att en lång villkorslista aldrig tar frågan med sig |
| Kortet inuti | radie 12, ram 1 px `--kant`, papper, luft 14 px 16 px 16 px | samma | Eyebrow "Villkor" (eller "Premisser"), inledningen 14/21 i `--ink-2`, raderna 15/22 i `--ink-1` |
| Villkorsraden | `grid-template-columns: 16px 1fr`, 10 px luft, numret 12/22 600 i `--ink-3` högerställt, tabulära siffror | samma | Numret är det stegen i lösningen pekar på; aldrig punktlista, aldrig bokstäver (bokstäver är alternativ) |
| Frågan | eyebrow "Uppgift 4 av 12" i `--ink-3`, frågan 19/26 display 700 | samma, i högerspalten 480 px | Som textpassets påstående |
| Alternativen | rader, 8 px luft, minst 52 px höga, radie 12, ram 1 px `--kant`, bokstav 12/16 600 i `--ink-3` i en 16 px kolumn, texten 15/20 | samma | Sifferpassets rader (`VnUppgift`, numerisk), inte textpassets tre knappar: svaren är meningar eller namn |
| Foten | "Svara" som kopparknapp (dämpad 50 procent tills något är valt) i testet; "Nästa" och länken "Föregående" i genomgången | knappen 480 px centrerad | `PassShell`-foten |

Dator: deduktiv är den enda testtypen som får två spalter (villkor 400, luft 40, fråga 480; topprad, tidsrad och fot spänner 1000). Matrisens 400 px kolumn skulle tvinga villkoren och alternativen att trängas under varandra, och deduktiv läses som en text med fotnoter: villkoren till vänster, frågan till höger, blicken går fram och tillbaka utan att rulla.

Ingen tidsgräns i textpassets mening: testet har 15 minuter totalt och tidsraden per uppgift är lugn. Inget diagram, ingen tabell och inget hjälprutnät under frågan i omgång 3 (beställningen C1). Kandidaten får rita i huvudet, precis som i SHL:s och Aons deduktiva delar.

### 1.1 Lägen för alternativen

Samma som sifferpassets rader (`VnUppgift`), så att gratisanvändaren som gjort ett sifferpass känner igen allt:

| Läge | Ram | Bokstav | Mer | Aria |
|---|---|---|---|---|
| Vilande | 1 px `--kant` | `--ink-3` | | "B. Bo" |
| Tryckt | | | bakgrund `--papper-2` | |
| Valt, inte skickat | 1 px `--ink-1` + inset 1 px | `--ink-1` | | `aria-checked="true"`, ", ditt svar" |
| Efter svar: rätt | 1 px `--koppar` + inset 1 px | `--koppar-ink` | kopparpunkt 8 px uppe till höger | ", rätt svar" |
| Efter svar: valt och rätt | som rätt, plus yttre ring 3 px `--koppar-mjuk` | | punkt | ", ditt svar, rätt svar" |
| Efter svar: valt och fel | som valt | `--ink-1` | | ", ditt svar" |
| Efter svar: övriga | 1 px `--kant` | | `opacity: .38` | |

Aldrig rött, aldrig omsorterade, bokstaven står alltid kvar.

---

## 2. Efter svaret: lösningspanelen

Panelen är regelpanelens (`Regelpanel.tsx`): rummets ton, radie 14, luft 14 px 16 px 16 px, `role="status"`, `aria-live="polite"`, rullas fram så att nederkanten står 12 px över foten (art-director 20.3 punkt 3). Raden överst: eyebrow "Lösningen" i `--ton-ink` till vänster, utfallet "Rätt · 48 s" eller "Inte den här · 52 s" i `--ink-3` till höger, exakt som passets.

I testet (12 uppgifter mot klockan) visas panelen inte förrän i genomgången efter resultatet. I passet (omgång 4) visas den direkt efter svaret, som i textpasset. Vyn är densamma.

### 2.1 Lösningsgången (DD5)

Numrerade steg, ett per rad, i den ordning lösaren låser en plats:

| Del | Mått |
|---|---|
| Raden | `grid-template-columns: 22px 1fr`, 10 px luft, 8 px mellan raderna |
| Märket | 22 × 22, radie 7, papper med villkorets nummer i `--ton-ink` 12/16 600; antagandet i frågan får ordet "Om" på bläck med papperstext; slutsteget när flera ordningar är kvar får ordet "Kvar" |
| Texten | 14/21 i `--ink-1` (`.regelpanel-regel`, `--ton-ink` i mörkt läge): villkoret ordagrant i 600, sedan följden i 400: "Det låser Bo på plats 3." |

Numret i märket är villkorets nummer i kortet överst, inte stegets ordningstal. Det är poängen: kandidaten läser "4" i gången, tittar upp på villkor 4 och ser varför det låser. Stegen kommer därför inte i nummerordning (1, 4, 2, 3 på sidan), och det är rätt.

Mallen för följden är lösarens, inte copyns: `${villkor} Det låser ${namn} på plats ${p}` och med flera namn "... på plats 2 och Erik på plats 1". Copywritern får putsa orden i mallen (`copy-omgang3.md`), inte skriva egna steg per uppgift. D1 (premisskedja) har ingen lösare; stegen skrivs för hand av Opus F per uppgift enligt beställningen och renderas i samma lista utan remsa.

### 2.2 Remsan

Schemat som lösaren ger, plats för plats:

| Del | Mått |
|---|---|
| Remsan | `grid-template-columns: repeat(n, 1fr)`, radie 10, ram 1 px `--kant`, papper, 12 px under stegen |
| Rutan | minst 56 px hög, luft 7 px 3 px 8 px, hårlinje 1 px `--kant` till vänster utom första, centrerad text |
| Platsnumret | 12/16 600 i `--ink-3`, tabulärt |
| Namnet | 14/18 600 i `--ink-1`, `letter-spacing: -.005em` |
| Rätt svar (D2) | inset 2 px `--koppar`, namnet i `--koppar-ink`, kopparpunkt 6 px uppe till höger |
| Antagandet (D3) | inset 2 px `--ink-1`, aldrig koppar |
| Öppen plats (D3) | båda namnen under varandra i 12/15 600 `--ink-2`; raden under remsan "Två namn i en ruta betyder att båda är möjliga." i 12/16 `--ink-3` |

Bredder på 360 (kolumn 296 px i panelen): fem platser ger 59 px per ruta, sex ger 49 px. Med 14 px 600 ryms sex bokstäver i 49 px ("Cilla", "David", "Frida"); därför får DD4:s namnlista högst fem bokstäver för sexelementsuppgifter och högst sex för fem (regel DV2). Namnen i beställningen (Alma, Bo, Cilla, David, Erik, Frida) klarar det.

Koppar betyder rätt svar och bara det: när frågan är "vilket är omöjligt" finns ingen plats att färga, så remsan har ingen koppar och svaret står bara i alternativraden och i slutsteget. Antagandet ritas i bläck för att det är kandidatens givna, inte facit.

### 2.3 Misstaget

Under remsan, som i regelpanelen: eyebrow "Ditt svar, C" och misstagstexten 14/21 ur bankens `misstag` för det valda alternativet. Vid rätt svar visas inget misstag. D2:s misstag skrivs av generatorn ur lösaren (vilket villkor alternativets namn bryter på den platsen); D1:s och D3:s skrivs för hand av Opus F.

---

## 3. Premisskedjan (D1)

Samma vy: kortet heter "Premisser", raderna numreras likadant, fyra alternativ som rader. Efter svaret: stegen i samma lista (premissens nummer i märket där ett steg lutar sig på en premiss), ingen remsa, misstaget sist. Ingen mängdbild, ingen Venn-figur: beställningen säger ren text, och en ritad mängd skulle påstå mer om "alla" och "några" än premisserna gör.

---

## 4. Kortet i Alla tester

`TestKategori` oförändrad: eyebrow "Deduktiv slutledning" med i-knapp, frågan som rubrik, brödtext, faktaraden (12 uppgifter, 15 minuter, 3 nivåer), tre nivåsegment, provraden. `NIVA_GOR.deduktiv` = "tre villkor", "fem villkor", "villkor i rörelse"; `ENHET.deduktiv` = "uppgifter". Provraden dämpad (`ProvTyst`): "Övningsprov mot klockan" / "Inte än för deduktiv. Logikens övningsprov övar tempot."

Titel "Vad måste vara sant?" och brödtexten på sidan är förslag; copywritern avgör. Ingen leverantör i bilden; brödtexten får nämna format om copywritern vill, som figurseriernas gör.

### 4.1 Bilden `IlluDeduktiv` (160 × 120)

Provbladets språk (`Provbladet.tsx`: `currentColor` kontur 3, `--illu-dim` referens, `--illu-fill` yta, exakt en kopparyta). Säger: ur några rader följer vad som står på en plats.

| Del | Koordinater |
|---|---|
| Bladet | rect 8 8 144 104, rx 8, fill `--illu-fill`, kontur 3 `currentColor` |
| Premisserna | tre linjer 3 i `--illu-dim`: (22, 28) till (80, 28); (22, 42) till (66, 42); (22, 56) till (88, 56) |
| Remsan | rect 22 72 116 26, rx 6, fill `--illu-fill`, kontur 3 `currentColor`; fyra avdelare 2,5 i `--illu-dim` vid x 45,2, 68,4, 91,6, 114,8 |
| Platserna | fem rutor 10 × 10, rx 2, centrerade i cellerna på y 80: x 28,5, 51,7, 74,9, 98,1, 121,3 i `currentColor` |
| Kopparn | rutan på plats 3 (x 74,9) i `--illu-accent` |

Mobil 96 px hög centrerad över texten, dator 160 × 120 till höger, som de andra. Samma svg på vägg och papper.

---

## 5. Resultatet

Passets resultat (`PassResultatVy`, `ResultatSkal`) utan kurva och utan nivåskala: deduktiv har ingen nivå på skalan 1 till 10 och ingen kurva, precis som figurserier (omgång 2). Väggen: ringen 64 fylld till andelen rätt, eyebrow "Grund klar" i koppar-ljus, rubriken "9 av 12 rätt" i `text-h1-liten`, tre tal (tid av 15 min, sekunder per uppgift, provets tid), meningen i vagg-mjuk. Golvet:

1. **Genomgång** (lyft kort): "Tre uppgifter att titta på", listan med en miniatyr per missad uppgift, uppgiftens nummer och villkorstypen, chevron; kopparknappen "Gå igenom de tre", länken "Visa alla tolv".
2. **Var du tappade**: en rad per villkorstyp med stapel i koppar och "1 av 3" som meta; aldrig procent i text. Villkorstypernas namn: Fast plats, Inte på platsen, Står bredvid, Inte bredvid, Till vänster om, Direkt till vänster om, Premisskedja.
3. Statusraden "Nästa: Avancerad, fem villkor" med kopparpunkt och chevron.

### 5.1 Miniatyren

Remsan i 120 × 28 px: n rutor med hårlinjer, en prick 7 px i `--ink-2` per ruta, svarets ruta med inset 1,5 px `--koppar` och kopparprick. Inga namn: 12 px text ryms inte i 24 px rutor, och miniatyren ska bara säga "det här var ett schema med fem platser". Premisskedjan: fyra liggande streck 3 px (tre i `--ink-3`, det fjärde kortare i koppar) i samma ram.

---

## 6. Tillgänglighet

- Kontrast som matrisens (grafik v3 avsnitt 8): `--ink-1`, `--ink-3` och `--koppar-ink` mot papper och ton minst 4,5:1 i båda lägena; koppar som ram och punkt minst 3:1.
- Inget skiljs bara med färg: rätt svar har punkt och text i aria, antagandet har bläckram och ordet "Om" i gången, öppna platser har två namn och raden under remsan.
- Villkorskortet är `<section aria-label="Villkor">` med `<ol>`; alternativen `role="radiogroup"` med `role="radio"`, `aria-checked`, bokstaven i aria-texten; remsan `<ol aria-label="Schemat, plats för plats">` där varje ruta säger "Plats 3: Bo, rätt svar".
- Träffytor: raderna minst 52 px, knappen 48, länken 44 (`min-height` på länken i foten). Fokus: `outline: 2px solid var(--koppar-ink); outline-offset: 2px`.
- Rörelse: panelen tonar in 150 ms och rullas fram 300 ms som regelpanelen; `prefers-reduced-motion` hoppar.

---

## 7. Prestanda

| Krav | Mått | Hur det mäts |
|---|---|---|
| Ingen svg i frågan | 0 `<svg>` i villkor, fråga, alternativ, steg och remsa (bara ikoner i skalet) | enhetstest på vyns utdata |
| Html per uppgift efter svar | högst 4 kB; uppmätt 1,5 kB för D2 på sidan | `render`-test skriver max per bank |
| Klistring utan skript | `position: sticky`, ingen `scroll`-lyssnare | kodgranskning |
| Layoutskift | CLS 0: raderna har `min-height`, remsans rutor `min-height: 56px`, panelen rullas fram i stället för att trycka ned | `scripts/perf-inloggat.ts` på frågesidan |
| Första uppgiften | serverrenderad med villkoren i html | |
| Frågesidan på 360 | LCP under 2,0 s (beställningen A5:s gräns gäller även här) | samma skript |

---

## 8. Mätbara regler till `validate-deduktiv.mjs` och vyernas tester

| Nr | Regel | Kontroll |
|---|---|---|
| DV1 | Remsan och stegen ritas ur `losning.steg` och `losning.schema` i banken, aldrig ur handskriven text; D1 saknar remsa | enhetstest: D2/D3-fråga utan `losning` felar i renderingen |
| DV2 | Namnlängd: högst 6 bokstäver vid fem element, högst 5 vid sex | validatorn på DD4:s namnlista per uppgift |
| DV3 | Varje steg pekar på ett villkorsnummer som finns, eller på antagandet; slutsteget bara när lösningarna är fler än en | validatorn |
| DV4 | Villkorskortet högst 42 vh på mobil med egen rullning; aldrig `max-height` på dator | enhetstest på klassnamn |
| DV5 | Koppar i remsan bara på en plats, och bara när frågan är "vem står på plats p" eller "vilket måste vara sant" med ett platssvar; "omöjligt"-frågor har ingen koppar i remsan | enhetstest på renderingen per frågetyp |
| DV6 | Aria: alternativ med bokstav, remsans rutor med "Plats p: namn", antagandet med "antagandet i frågan" | enhetstest |
| DV7 | Inga tankstreck, inget "lätt", inget "samma test" i villkor, steg, misstag eller kortcopy | grep i valideringen |

---

## 9. Till Opus F, i ordning

1. `src/components/tests/deduktiv/DeduktivFraga.tsx`: villkorskortet (textpassets `Underlag`-mekanism), frågan, alternativen (sifferpassets rader), foten i `PassShell`; två spalter från 1024 px med 400 + 480.
2. `DeduktivLosning.tsx`: panelen med stegen och remsan ur bankens `losning`; märket "Om" och "Kvar"; misstaget sist. Återanvänds av genomgången och av admin Frågor (B3).
3. `IlluDeduktiv.tsx` enligt 4.1 i `src/components/traning/illu/`, kopplad i `BILD` i `TestKategori.tsx`; `FRAGA.deduktiv`, `NIVA_GOR.deduktiv`, `ENHET.deduktiv`, `provTyst` enligt copywriterns `copy-omgang3.md`.
4. Resultatet: `PassResultatVy` utan skala och kurva, "Var du tappade" per villkorstyp (namnen i 5), miniatyren enligt 5.1.
5. Validatorn: DV1 till DV7 utöver DD1 till DD5.
6. Riktig webbläsartest enligt `feedback_riktig_webblasartest`: gratis gör grund och ser lösningsgången, Premium gör expert med antagande och öppna platser, Pixel 7 och 1280, ljust och mörkt, jämfört mot `deduktiv.html`.

---

## 10. Vad som är verifierat och vad som är bedömning

Verifierat: lösaren på sidans uppgifter (D2 exakt en lösning, inget överflödigt villkor, fyra steg; D3 två lösningar under antagandet, facit omöjligt i båda, tre steg plus slutsteget); html-storleken per uppgift; att sex namn på fem bokstäver ryms i 49 px rutor på 360 med 14 px 600 (renderat i Chrome); utseendet i ljust och mörkt på 360 och 1280.

Bedömning: att villkoren ska numreras i kortet och stegen peka på numren (alternativet, att skriva om villkoret i varje steg, blir längre och lämnar kandidaten utan koppling uppåt); att två spalter på dator är rätt för just deduktiv; att "omöjligt"-frågor inte ska ha koppar i remsan; att miniatyren ska vara prickar och inte namn. Alla fyra kan ändras med en regel var utan att något annat rör sig.
