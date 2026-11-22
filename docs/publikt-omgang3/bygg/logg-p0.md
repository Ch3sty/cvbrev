# Logg P0, grunden (2026-11-22)

## Byggt

- Färgerna: `globals.css`, blocket PUBLIKT OMGÅNG 3. Egna attribut (`data-p3-sida`, `data-p3-farg`, `data-p3-sokvag`), aldrig `data-rum`. Trådens namn pekas om på publika sidor så att gamla sidor står hela. Mörkt läge för publika sidor (`.pub-sida`, `.pub-rum-*`) borttaget.
- Komponenterna i `src/components/publikt/v3/` (se `grunden.md`), CSS i `v3.css` och `ram.css`.
- Menyn (`LandingNavbar.tsx`, `LandingNavbarMega.tsx`, `nav-data.ts`), foten (`Footer.tsx`), layouten (`src/app/(public)/layout.tsx`), kampanjraden (klassen `p3-kampanj` i `Kampanj.tsx`, logiken orörd).
- Förhandsvisningen `src/app/forhandsvisning-publikt/v3/page.tsx` (noindex, 404 i produktion utan `PUBLIKT_FORHANDSVISNING=1`). Den gamla förhandsvisningen av v2 står kvar.
- `publikt.css`: bara `scroll-margin-top` 72 till 88 px (menyn är 76 px på dator).

## Beslut där underlaget var öppet

1. **Färgvalet.** Sidan väljer med `<Sida farg>` (lyfts till roten med `:root:has([data-p3-sida="..."])`). Sidor utan `Sida` får färg ur adressen via menyns `data-p3-sokvag` (`fargForSokvag`), som bara gäller när ingen `data-p3-sida` finns. Lokala ytor (`data-p3-farg`) lyfts aldrig, så flera öar i olika färger på samma sida krockar inte (det som gör att inloggat inte kan använda `data-rum` publikt). Sidor med `data-rum` (provet utan konto) hålls utanför helt.
2. **Bara ljust läge publikt.** Skisserna är ljusa och briefen förbjuder svart sidbotten. Mörkt läge för `.pub-sida` togs bort.
3. **Bläckytor** (`bg-ink-1`) blir sidans mörkaste ton (`--vagg-3`) på publika sidor, inte koppar: valda chip och pratbubblor ska inte bli kopparknappar. `.pub-sida` behåller sin gamla regel (koppar) för knapparna.
4. **Befintliga v2-komponenter** (Hjalte, PremiumBlock, Rum, Steg, Faq med flera) behöll sitt gränssnitt och sin markup. De får de nya färgerna via tokens (premium blir `--vagg-3`, mark blir golvet), men inte den nya formen. Att ge dem kitets form utan att ändra anroparna hade krävt nya klasser i samma filer som fyra sidagenter just ska lämna; nya komponenter i `v3/` var säkrare. Den nya `Faq` delar `FaqFraga` och `faqSchema` med den gamla.
5. **Menyns underrader** följer NAV-1 ordagrant, också "Svar med källor" (Jobbcoachen) och "Syns i rekryterarnas sök" (LinkedIn), som skissnoten för menyn hade bytt. Uppdraget säger NAV-1 ordagrant. SEO och copy kan byta dem i slutgranskningen.
6. **Sökta tjänster** pekar på `/verktyg/sokta-tjanster` enligt uppdraget (textbeslut B-12 sa `/funktioner#sokta-tjanster` tills sidan finns; P4 bygger sidan i samma omgång). Märket Nyhet sitter kvar tills någon beslutar annat.
7. **Menyns innehåll ritas på servern** och skickas till klientmenyn som props, så att talen (`ANTAL_TESTTYPER`, `TEMPLATE_COUNT`, `FREE_TEMPLATE_COUNT`, `BREV_GALLERI.length`) och Premiumraden (`paketMedPris`, `beskrivning`) inte drar in data i klientens JavaScript, och alla länkar står i HTML:en även stängd.
8. **Loggan** ritas som i kitet (orange J-ruta med klack och text), inte med `Logo.tsx`, eftersom `.logo-ord` färgas mörkt på `.pub-sida`.
9. **Foten** har fyra kolumner i menyns ordning. "CV-mallar per yrke" pekar fortfarande på `/cv-mallar` (SEO-kravets ankare finns inte på sidan ännu; P2 kan lägga `id="yrken"` och byta i `nav-data.ts` via önskemål). Rubrikerna i foten är `<p>`, inte rubriker, som i dag (rubrikantalet ändras inte).
10. **Exemplen.** Påhittade arbetsgivare (Nordhaga Bygg, Västlänken Konsult, Kustbyggarna) i stället för skissernas riktiga företag (Sweco, Trafikverket). Brevets belopp ("42 miljoner") struket. Matrisuppgiften i `Testram` är skissens, kontrollräknad (raderna triangel, cirkel, kvadrat; rad två prick, rad tre kors; svaret cirkel med kors, C).
11. **Data-cta.** Både menyns Skapa konto och telefonmenyns Skapa konto gratis bär `data-cta="navbar-signup"` (det var samma länk förut), ingången skiljs som förut av `markeraIngang('header' | 'meny')`.

## Ny text utan godkännande

- Menyn, testkolumnen: "Grundnivån är gratis i alla åtta." (talet ur `ANTAL_TESTTYPER`), brevkolumnen: "Första brevet är gratis." Båda ur skissen `meny`, sanna mot produktfacit, `aria-hidden`.
- Telefonmenyns knappar "Skapa konto gratis", "Logga in", "Stäng" (skissen `meny`).

## Inte klart

- Ingen rendering och ingen klicktest (byggbriefen: ingen server och ingen webbläsare under bygget). Integrationen behöver titta på `/forhandsvisning-publikt/v3` i 375, 412 och 1440, och på menyn öppen i båda lägena.
- Sidor med egna hårdkodade mörka eller beige Tailwind-färger (till exempel `src/app/(public)/exempel/components/*`, `cv-mallar/[yrke]`, `authors/[slug]`, `for-rekryterare/insikter`) blir inte gröna av tokens. De hör till P2, P3 och P4 när sidorna byggs om.
- `NavIkon.tsx` används inte längre av menyn. Filen står kvar (P5 städar).
- Typkontroll: `npx tsc --noEmit` kördes en gång (2,6 GB ledigt). Två fel i mina filer (saknad import av `CSSProperties` i `Traff.tsx` och `VagSteg.tsx`) rättades efteråt utan ny körning.
