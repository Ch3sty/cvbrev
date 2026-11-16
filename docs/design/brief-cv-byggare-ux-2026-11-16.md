# UX-brief: nya CV-byggaren (mobil först)

UX-designern 2026-11-16. Underlag till art-directorns skiss, tillsammans med saas-leads och art-directorns briefer. Viewportar: Pixel 7 (412 px) och dator (1440 px). Ägaren godkänner skissen före bygge. Inga texter om datalagring eller juridik berörs.

## 1. Nuläget, ärligt (src/app/dashboard/skapa-cv/)

- **Sju skärmar innan hon ser sitt CV i en mall.** Fem av sju steg är "Valfritt". Steg 1 är förifyllt ur profilen, så första skärmen är ett formulär hon redan fyllt i.
- **Förhandsvisningen är en attrapp.** `SkapaCvPreview` ritar kort med initialer, inte mallen. På mobil hopfälld bakom "Visa förhandsvisning". Byggaren och mallsidan ser ut som två produkter.
- **Fel ordning.** "Om dig" kommer som steg 2, innan ett enda jobb finns. Det svåraste fältet, utan hjälp.
- **Ingen AI-hjälp alls** i steg 1 till 6. Tipsen är statiska listor.
- **Tangentbord och fält.** Datum är fritext med olika ledtexter i placeholder och hint. Punktlistan i Erfarenhet filtrerar tomma rader vid varje tangenttryck: Enter ger ingen ny rad förrän hon skrivit ett tecken (bugg). Kompetenser kräver en kategori före första kompetensen; chipsens kryss är 20 px.
- **Spara.** Bara `localStorage`, sju dagar, aldrig på servern förrän steg 7. CV:t finns inte i Mina CV förrän allt är klart. Spärren för antal CV kommer efter allt arbete. Återkomsten är en helskärm "Fortsätt eller Börja om".
- **Spärrar.** Telefon är obligatorisk för att lämna steg 1. Kravet "minst en erfarenhet eller utbildning" sägs först på steg 7. Papperskorgen ligger intill expanderknappen utan bekräftelse.
- **Tillgänglighet.** Etiketter och `aria-describedby` finns. Men "Steg 1 av 7" står dubbelt, fokus flyttas inte vid stegbyte, förhandsvisningen saknar regionnamn, skelettet blinkar per steg.

Behålls: steget i URL:en (bakåtgesten), FlowShells fot med spärrorsak, steg 7:s Dokument med Remsa, RubrikArk, FormatVal, Final och Merförsäljning.

## 2. Beslut: arket är byggaren

**Flödesmodell: fritt redigerbart ark med guidade luckor, med en kort start.** Inte sju steg, inte färre steg. Byggaren blir samma `Mallyta` som /cv-mallar/prova och /dashboard/cv-mallar, med `AvsnittArk` för varje del och tomma avsnitt som "+ Lägg till"-rader på arket. Motivering: komponenterna finns och är godkända (plan-mallar 3.2); hon ser sitt CV i en riktig mall från första sekunden i stället för efter sex skärmar; 84 procent av nya konton får aldrig in ett CV, och den som laddar upp ett befintligt hoppar över allt skrivande. "Guidade luckor" ger stegkänslan utan steg: arket säger alltid vad som saknas och i vilken ordning.

### Starten (en skärm, bara när CV:t är tomt)

Rubrik: "Vilket jobb söker du?" Ett fält: **Titel** (yrkesroll, förifylld ur profilens senaste titel om den finns). Titeln styr rubrikuppsättningen, förslagen i remsan och Jobbcoachens förslag. Under fältet tre ingångar: **"Ladda upp ett CV du har"** (PDF eller Word, även LinkedIn-PDF, samma tolkning som provsidan via /api/cv/parse), **"Skriv från början"** (primärknapp). Namn, e-post, telefon och ort hämtas ur profilen och sätts på arket direkt; de redigeras i huvudet, inte i ett eget steg. Här, inte i slutet, visas spärren för antal CV (PaywallCard cv-antal) om kontot är fullt.

### Arbetsytan

Dokument stor i vald gratismall (Linne som förval, "Föreslagna för dig" räknas om när innehåll finns), huvudet ifyllt, och tomma avsnitt som rader på arket i denna ordning: **Erfarenhet, Utbildning, Kompetenser, Profil, Språk.** Profilen kommer efter jobben med flit: då kan Jobbcoachen skriva den ur det som redan står. Fler avsnitt (Intyg, Projekt, Intressen, Referenser) via raden "+ Fler avsnitt" längst ner på arket, aldrig i den guidade ordningen.

**Den guidade luckan** bor i den fasta raden medan CV:t är under miniminivån (huvud med namn och e-post, plus minst ett jobb eller en utbildning): till vänster "Nästa: utbildning", till höger primärknappen "Lägg till ett jobb" som öppnar rätt ark. När miniminivån nås byter raden till standard: format PDF | Word och "Spara och ladda ner PDF". Kvarvarande luckor står kvar som "+ Lägg till" på arket, och en enda förslagsrad ovanför den fasta raden ("Lägg till kompetenser, så hittar fler system dig", med "Hoppa över"). Aldrig fler än ett förslag i taget.

### Fält per ark (AvsnittArk, bottenblad på mobil, 520 px centrerat på dator)

- **Huvud:** Namn (krav), Titel, E-post (krav, förifylld), Telefon (rekommenderas, hint "Rekryteraren ringer oftast", ingen spärr), Ort, LinkedIn. Fältet hon tryckte på arket får fokus.
- **Erfarenhet (per post):** Titel, Arbetsgivare, Ort (valfri), Från (månad som väljare + år med numeriskt tangentbord), Till (samma) med kryssrutan "Pågående" som släcker Till, Punkter (en per rad, råtext i lokalt tillstånd, delas först vid Spara). Knapp under fältet: "Låt Jobbcoachen skriva punkter" (kräver titel och arbetsgivare).
- **Utbildning:** Utbildning, Skola, Från och Till (år), "Lägg till beskrivning" som hopfälld rad.
- **Kompetenser:** ett chipsfält utan kategori. Förslag som chips under fältet ur titeln och jobben ("Föreslagna: Excel, Kundbemötande"), tryck lägger till. "Dela upp i grupper" som länk för den som vill. Kryss på chip minst 32 px träffyta inom ett 44 px chip.
- **Profil:** textyta med "Låt Jobbcoachen skriva ett förslag" (kräver titel eller ett jobb), "Skriv om" för ett nytt, texten är alltid redigerbar, "Ångra" tar tillbaka hennes egen text.
- **Språk:** Språk + Nivå (inbyggd väljare). Svenska modersmål förifyllt.
- Ta bort en post: textknappen "Ta bort" längst ner i arket (som i dag i AvsnittArk), aldrig en papperskorg i listraden. Ångra-rad i 8 sekunder efter borttagning.

Arkets Spara sparar på servern och stänger. Ett öppet ark skriver `?ark=erfarenhet:0` i URL:en så att bakåtgesten stänger arket, inte byggaren.

### Förhandsvisningen under ifyllandet

- **Mobil (412 px):** arket tar hela bredden (380 px, A4-höjd 537 px) direkt under toppraden. Arket hon redigerar i glider upp som bottenblad över dokumentet; dokumentet bakom ritas om när arket sparas, inte per tangenttryck (en iframe-rendering per sparning, inga rundturer medan hon skriver). Efter Spara rullar dokumentet så att det ändrade avsnittet står mitt i vyn och får kopparramen i en sekund. Tryck utanför avsnitten öppnar helskärmen (läsläget) som i dag.
- **Dator (1440 px):** Mallytans datorlayout: arket 600 x 849 i zonen om 744 px, mallkolumnen 336 px till höger med tre miniatyrer per rad, verktygsrad och knapp i den fasta raden om 64 px. Redigeringsbladet ligger centrerat nederst över dokumentet så att ändringen syns bakom vid Spara. Inget eget tvåkolumnsformulär.

### AI-hjälp (Jobbcoachen)

Erbjuds bara inne i arket, under fältet den gäller, som sekundär knapp med pennikonen (aldrig Sparkles). Tre handlingar: punkter till ett jobb, profiltexten, kompetensförslag. Skriver aldrig utan ett tryck, resultatet landar i fältet och går att redigera, hennes tidigare text kan tas tillbaka. Fria kvoten räknas per dygn i quotaService; när den är slut visas PaywallCard i arket med knappen kvar som spärrad och orsaken utskriven. Väntläge: knappen byter text till "Skriver" med framsteg, fältet låses, högst 8 sekunder innan felrad "Det tog för lång tid, försök igen".

### Spara och återuppta

CV-raden skapas på servern vid första sparade arket (inte vid starten, så tomma försök skapar inget) och syns direkt i Mina CV märkt "Utkast". Varje arksparning är en serversparning med optimistisk uppdatering; toppraden visar "Sparat" i två sekunder, vid fel "Kunde inte spara" med "Försök igen" och datan kvar i arket. `localStorage` finns kvar bara som reserv när nätet saknas, och töms när servern tagit emot. Återkomst: Mina CV-raden "Fortsätt" öppnar byggaren på arket med `?cv=id`; ingen vägvalsskärm. Mall, typsnitt, rubriker och ordning sparas på CV:t (`val`), så återkomsten ser likadan ut.

### Sista steget

Det finns inget steg 7. När miniminivån nåtts bär den fasta raden format och "Spara och ladda ner PDF" (Word gratis i gratismall, med lås och "ingår i Premium" i premiummall, som FastRad i dag). Mallen byts i remsan, med svep eller i Alla-arket; premiummall vald ger köpet i knappen och gratisvägen som bild av hennes eget CV. Nedladdningen slutar i Final (Öppna, Dela, första jobbträffen), Merförsäljningen vid andra nedladdningen som på provsidan. Efter Final: byggaren märker CV:t klart (`klart` krymper historiken), "Analysera ditt CV" och "Skriv ett personligt brev" som nästa steg.

## 3. Tillgänglighet (WCAG 2.1 AA)

- Arket är en dialog: `role="dialog"`, `aria-labelledby`, fokus in på första fältet och tillbaka till träffytan vid stängning, Esc stänger, fokus stannar i bladet.
- Varje träffyta på dokumentet är en knapp med namn ("Redigera erfarenhet", "Lägg till utbildning"), minst 44 px hög, och nås med Tabb i dokumentordning.
- Den guidade luckan läses upp: den fasta radens text är `aria-live="polite"`, "Sparat" och felrader likaså; aldrig två live-regioner som talar samtidigt.
- Fel per fält: `aria-invalid` och felrad kopplad med `aria-describedby`, aldrig bara röd kant. Spärrad primärknapp har alltid orsak i text.
- Kontrast 4,5:1 på all text, också ledtexter (ink-3 på papper-2 ska mätas). Fokusring 2 px synlig på alla träffytor, även på arkets träffytor över iframen.
- Rörelse: bladets inglidning och kopparramen stängs av vid `prefers-reduced-motion`. Inga rörelser över 200 ms.
- Skärmläsare: iframen har titel ("Ditt CV i mallen Linne"), tomma avsnitt sägs som "Erfarenhet saknas, lägg till".

## 4. Mobila fallgropar

1. **Tangentbordet över bladet.** Bladet får sticky fot med Spara och eget rullområde, enligt FlowShells lagerlösning (ingen `position: fixed` i foten). Testas i iOS Safari med öppet tangentbord.
2. **Bakåtgesten.** Öppet blad, Alla-arket och helskärmen ligger i historiken; annars lämnar hon byggaren mitt i en post.
3. **Datumfält.** Månadsväljare + numeriskt år, ingen fritext och ingen tangentbordsväxling.
4. **Svep.** Svepet som byter mall är avstängt så länge ett blad är öppet.
5. **Rendering.** Dokumentet ritas om vid Spara, aldrig per tangenttryck.
6. **Första målningen.** Dokumentets initiala HTML serverrenderad (huvudet ur profilen): LCP under 2,0 s, CLS 0 (feedback_prestandabudget_inloggat). Blad, Alla-arket, Final och Merförsäljning laddas lata.
7. **Enhandsräckvidd.** Primärknappen alltid i den fasta raden nederst.
8. **Dubbelt tryck.** Spara och Ladda ner spärras under pågående anrop, med framsteg i knappen.

## 5. Till saas-lead och art-director

Mätpunkter jag vill se i skissen: `cv_start_val` (upp, skriv), `ark_sparat` per sektion, `jobbcoach_skrev` per handling, tid från start till miniminivå, och andelen som når nedladdning. Copywritern formulerar den guidade luckans rader och Jobbcoachens knapptexter; jag har satt innebörden, inte orden.
