# Brief: CV-byggaren, visuell riktning (art-director, 2026-11-16)

Underlag till skissen av `/dashboard/skapa-cv`. Ägarens ram: byggaren håller inte den nya standarden, skissen godkänns före bygge, ett riktigt omtag och inte omfärgning (lärdomen från mallskissens v1). saas-lead och mobile-ux-designer skriver sina briefer parallellt; flödesfrågor (antal steg, ordning, vad som är obligatoriskt) avgörs där. Det här är hur det ska se ut och kännas, oavsett hur stegen landar. Ingen kod i src. Texter om datalagring, GDPR och villkor rörs inte.

## Konceptet: Direkt på arket

**En mening:** byggaren är inte ett formulär med en förhandsvisning bredvid, den är hennes CV i vald mall som fylls i avsnitt för avsnitt, med fälten på ett ark som glider upp över dokumentet.

Det är samma idé som mallflödet ("dokumentet är sidan") dragen hela vägen in i ifyllandet. I dag är dokumentet en attrapp med initialer och chips, gömd bakom "Visa förhandsvisning" på mobil, medan sju formulärkort i kort bär hela upplevelsen. I det nya är det riktiga arket (Dokument, samma HTML som PDF:en) det hon ser från första sekunden, och formuläret är ett lager ovanpå som kommer och går. Det hon skriver landar på arket i mallens egen typografi medan hon skriver. Det är skillnaden mot i dag, inte en ny färg på korten.

## Ytor och lager

| Lager | Vad | Yta |
|---|---|---|
| 0 Golv | FlowShell som i dag: topprad 56 px papper, framstegslinjen 3 px koppar, foten | CV-rummets golv (`--golv`), ingen vägg i ett flöde |
| 1 Arket (dokumentet) | Dokument i A4-proportion, alltid vitt, skuggan ur Dokument, lyft 8 px när filen skapas | Fast höjd från första målningen, CLS 0 |
| 2 Arket (fälten) | Ark med avsnittets fält. Mobil: nederst, full bredd, radie 24, handtag. Dator: dockat som högerkolumn 420 px utan dimma, så dokumentet syns helt | Papper, kant, ingen skugga på dator |
| 3 Fast rad | Den enda kopparknappen | FlowShells fot, eller arkets fot när arket är öppet |

Inga kort runt fälten, inga kort i kort, ingen tvåkolumn med attrapp till höger. Toning finns bara där den redan bor (`.vagg`, `.knapp-primar`). På dator behöver FlowShell en bredare variant (1120 px) för dokument 600 px plus dockat ark; det är ett tillägg till skalet, inte en ny layout.

```
Mobil 375                          Dator 1280
+----------------------------+     +------------------------------------------------+
| <  Bygg ditt CV      3/7   |     | <  Bygg ditt CV                          3/7 X  |
|  ========------------      |     |  ============----------------------------      |
|  +----------------------+  |     |                                                |
|  | ANNA BERG            |  |     |   +------------------------+  +--------------+ |
|  | Undersköterska       |  |     |   | ANNA BERG              |  | Erfarenhet   | |
|  | ......               |  |     |   | ......                 |  | Avsnitt 3/7  | |
|  |[ Erfarenhet        ] |<-koppar|   |[ Erfarenhet          ]|  |              | |
|  |  Vårdbiträde, Capio  |  |     |   |  Vårdbiträde, Capio    |  | Roll  [    ] | |
|  +--- ark glider upp ---+  |     |   |  + Lägg till utbildning|  | Arbetsg [  ] | |
|  | Erfarenhet  Avsnitt 3|  |     |   |  + Lägg till kompetens |  | ...          | |
|  | Roll        [      ] |  |     |   +------------------------+  | [Spara,     ]| |
|  | Arbetsgivare[      ] |  |     |                               |  fortsätt    | |
|  | [ Spara och fortsätt]|  |     +------------------------------------------------+
+----------------------------+
```

## Dokumentet är huvudpersonen

- Från första skärmen står arket i vald mall (`?mall=` eller gratisförvalet), med "Ditt namn" i mallens rubriksnitt och de tomma avsnitten som streckade "+ Lägg till"-rader på arket (finns i Dokument, `tommaAvsnitt`). Arket är aldrig tomt och aldrig en attrapp.
- Avsnittet som fylls i får kopparram och namnchip (`valtAvsnitt`), och dokumentet rullas så att avsnittet står i bandet ovanför arket. Arket täcker aldrig det hon skriver i.
- Varje tangenttryck når arket med 300 ms fördröjning; iframen tonar 0,4 till 1 som i dag. Hon ser sitt namn, sin roll och sina punkter sättas i mallen, inte i ett generiskt kort.
- Tryck på ett ifyllt avsnitt öppnar dess ark igen. Tryck utanför avsnitten öppnar helskärmen (Helskarm) som på mallsidan.
- Under ifyllandet är rubrikernas prickade kopparlinjer avstängda (`onRubrik` saknas); rubriker byts i granskningen som i dag. Kopparbudget per skärm: framstegslinjen, ramen runt aktivt avsnitt, knappen. Inget mer.

## Stegindikator

Arket är indikatorn: ifyllda avsnitt är riktig text, tomma är streckade rader. Därutöver bara det skalet redan har: framstegslinjen under toppraden och räknaren i toppraden. SkapaCvStepHeader ("STEG 2 AV 7" i versaler plus fråga) försvinner. Arket (fälten) har i stället avsnittets namn som rubrik i display 20/700 och raden under i meta ("Avsnitt 3 av 7. Valfritt."). Ingen rad med prickar, inga brickor i rad.

## Fält och knappar

- Fälten på arket följer AvsnittArk: 44 px, radie 10, papper med kant-stark, fokus med kant ink-1 och fokusringen koppar-ink. Etikett 13/500 ink-2 ovanför, hjälprad meta ink-3 under, fel som rad i `--fel` utan ikon. Inte insunkna (papper-2) som i Tråden: på ett ark ser insunkna fält ut som hål.
- Par (roll och arbetsgivare, från och till) står i två kolumner från 480 px, annars en.
- Listor (roller, utbildningar, språk) är Rader på arket: titel 15/600, underrad meta, pennan till höger. "Lägg till roll" är en streckad 44 px-rad, samma form som "+ Lägg till" på dokumentet, så språket är ett. Ta bort är LANK_FEL inne i postens eget ark, inte en papperskorg på varje rad.
- Exakt en kopparknapp (KNAPP_PRIMAR) synlig: i arkets fot när arket är öppet ("Spara och fortsätt"), i skalets fot när inget ark är öppet. Sekundärt är LANK. Spärrad knapp bär alltid sitt skäl (`primaryBlockedReason`), som i dag.

## AI-hjälpens visuella språk

Hjälpen är ett förslag, aldrig en funktion med egen symbol. Aldrig gnistikonen, aldrig ordet AI i gränssnittet, aldrig en färgad ruta med ikon i hörnet.

- Form: ett tonpanel under fältet (bg-ton, ton-ink, radie 12), eyebrow "FÖRSLAG" i `text-ey`, texten i 15/23, två textlänkar: "Använd" och "Nej tack". Ett förslag i taget. Ikonen, om någon, är IkonPenna ur MallIkoner (pennan betyder redan "skriv om" i mallflödet).
- Rösten är Jobbcoachen ("Jobbcoachen föreslår"), inte "AI-genererat".
- Väntan: tre rader i `.writing-lines` (1 800 ms) i samma panel med reserverad höjd, aldrig en snurra, aldrig text som skrivs fram tecken för tecken.
- På arket (dokumentet) ser föreslagen text ut som all annan text. Dokumentet är hennes CV; där markeras ingenting som maskinskrivet.

## Tomma tillstånd och bekräftelse

- Tomt är aldrig en illustration i byggaren: arket är bilden. Tom lista på arket: en rad i ink-3 och den streckade lägg till-raden, ingen ruta.
- Klart: Final (bocken ritas 450 ms, filnamnet med PDF- eller Word-ikon, Öppna och Dela lika stora, första jobbträffen) är bekräftelsen. Dagens ConfirmationView med brevscenen och "Analysera ditt CV" utgår. När finalen stängs står hennes färdiga CV kvar som ark med chip "Sparat under Mina CV" (Chip ton) ovanför, och en enda nästa handling i foten.
- Återkomstvalet (Fortsätt eller Börja om) visas ovanpå hennes ark från utkastet, dimmat, inte på tom skärm.

## Rörelse

| Vad | Tid |
|---|---|
| Ark upp och ner | 240 ms ease-out (`sheetUp`), dator: tonar in 160 ms |
| Arkets innehåll vid byte av avsnitt | `threadEnter` 200 ms |
| Dokumentet uppdateras | iframe 0,4 till 1 på 200 ms |
| Avsnitt sparat | avsnittets ram tonar koppar-mjuk till transparent 300 ms, framstegslinjen växer 200 ms |
| Filen skapas | lyft 8 px 300 ms, knappen fylls (FastRad) |
| Final | bock 450 ms från 150 |

Inget sidledsglid, ingen skalning, ingen konfetti, ingen maskot. `prefers-reduced-motion` visar slutläget.

## Mörkt och ljust läge

Arket (dokumentet) är alltid vitt: det är papperet som blir PDF:en. Allt runt om följer CV-rummet: golv `#E6EFEF` / `#0B1516`, papper `#FFFFFF` / `#13201F`, kant `#E3E1DC` / `#223634`, ton `#D7ECEA` / `#163A3A` med ton-ink. Skuggan under arket är starkare i mörkt (ur `--lyft`), kopparns text är koppar-ink (`#F2A368` i mörkt), aldrig ren koppar som text. Båda formerna i globals.css (media och `data-theme`), inga `dark:`-klasser. Streckade rader på det vita arket behåller sina ljusa värden i båda lägena.

## Återanvänds

- Ur `Dokument/`: Dokument (storlek stor på dator, full bredd på mobil), Ark, AvsnittArk (byggs ut med byggarens fält, inte tvärtom), RubrikArk, Remsa och FastRad/FormatVal i granskningen, Final, Helskarm, Miniatyr, texter.ts (AVSNITT, HUVUD, DOK) och hooks (useForhandsvisning).
- Ur `illustrations/`: MallIkoner (IkonPenna, IkonBock, IkonPdf, IkonWord, IkonFoto, IkonStang). Inga RumIkoner-chevrons i byggaren.
- Ur `rum/`: Chip (ton), Rader. Vagg, RumHuvud och LyftKort hör inte hemma i ett flöde.
- Ur `shell/`: FlowShell med ny bred variant, knappar.ts, FlowResumeBanner.
- Utgår: SkapaCvPreview, SkapaCvLayout, SkapaCvStepHeader, SkapaCvCardList, korten runt fälten, "Visa förhandsvisning", Confirmation i byggaren. "Fyll i testdata" står kvar som adminlänk i foten.

## Beslut i korthet

1. Dokumentet i vald mall är sidan från steg 1; fälten är ett ark ovanpå. Ingen attrapp, inga formulärkort.
2. Arket dockas till höger på dator, glider upp på mobil, täcker aldrig det aktiva avsnittet.
3. Indikatorn är arket självt plus skalets linje. Steghuvudet i versaler utgår.
4. Fält som AvsnittArk, listor som Rader, en kopparknapp, lägg till som streckad rad i båda lagren.
5. AI-hjälp är ett tonpanel med "FÖRSLAG" och pennan. Aldrig gnistikon, aldrig "AI".
6. Final är bekräftelsen; brevscenen utgår ur byggaren.
7. Arket alltid vitt, resten CV-rummets ljusa och mörka värden.
