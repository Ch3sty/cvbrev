# Not: /verktyg/linkedin-optimering (skiss `linkedin`)

Källa: `sidor/linkedin.html`, byggd till `ut/skiss-linkedin.html`. Bilder: `bilder/linkedin-375-*.png`, `-412-*`, `-1440-*`. Inga egna delfiler.
Kod: `src/app/(public)/verktyg/linkedin-optimering/page.tsx`, `components/LinkedinOptimeringLiveDemo.tsx`, `components/linkedin-optimering-faq-data.ts`. Verktyget inloggat: `src/app/dashboard/linkedin-optimizer/` (ligger i CV-delens meny), rutten `src/app/api/linkedin/optimize/route.ts`.

## Vad som ändras mot i dag

1. **Hjälten.** Telefonen med den gamla skärmen är borta. I stället: rekryterarens sökruta ("projektledare LOU Göteborg"), Saras profil med den nya rubriken där sökorden är utmärkta, och profilpoängen 87 (32 före). Under knappen står vad det kostar: "Ingår i Jobbcoach Premium, 149 kr i månaden. Exemplet här nedanför ser du utan konto." De tre talen (0, 5, 5 min) står kvar.
2. **Före och efter i stor skala** (kortet som går in över hjälten, i dag den lilla demon som byter sektion var fjortonde sekund). Två profiler bredvid varandra: I dag och Efter, med rubriken och Om mig som de ser ut på en profil. Under varje: rubrikens längd som stapel (34 respektive 144 av 220 tecken) och orden en rekryterare kan söka på. Poängen 32 till 87 står som stort tal. Underst vad som blev bättre och knappen "Kopiera alla sektioner" (verktygets egen knapptext).
3. **Så fungerar det.** Fem steg som kort i två rader (tre plus två), vart och ett med en liten bild: texten som markeras, de fem fälten, fem staplar som går samtidigt, 32 mot 87, "Alla sektioner kopierade".
4. **Fem sektioner i ett pass** är en bild: Saras profil med de fem sektionerna, fem nålar och en koppartråd som binder ihop dem (den röda tråden). Till höger de fem sektionerna med sina rubriker och texter, var och en med poängen före och efter som stapel. Brickan "Ett pass, 30 till 60 sekunder" under ingressen.
5. **Varför du inte syns i dag** är ett mörkt petrolblock med tre kort. Varje skäl har sin bild: sökrutan med träffar och Saras gamla rubrik utanför, 14 mot 144 av 220 tecken, två av fem sektioner ifyllda.
6. **Bred eller skarp inriktning** är två stora valkort med valring, som i verktygets första steg. Bred visar rubriken och fyra sökningar den syns i. Skarp visar fältet för målrollen, rubriken och en sökning.
7. **Premium** är grundens Premiumblock med priset, tre rader och meningen om vad man ser utan Premium. Under: tre länkbrickor till CV-analys, Skapa CV och CV-mallar (nya interna länkar, ingen rubrik).
8. **Frågorna** står i grundens form, första frågan utfälld.

## Oförändrat för SEO

- H1 "Hamna i rekryterarnas sökresultat på LinkedIn", med etiketten som del av rubriken som på referenssidan.
- Alla H2 i samma ordning: Så fungerar det, Fem sektioner i ett pass, Varför du inte syns i dag, Bred eller skarp inriktning, Sluta vara osynlig. Börja synas i dag., Vanliga frågor om LinkedIn-optimering. Rubrikträdet har sex H2 och en H1, inte sju H2.
- Alla femton H3 ordagrant (fem steg, fem sektioner, tre skäl, två lägen).
- Alla åtta frågor ordagrant. Sju svar ordagrant, se bytena nedan.
- Stegens, sektionernas, skälens och lägenas texter står kvar ordagrant utom en mening i steg 2.
- Schematyperna (WebApplication, HowTo, FAQPage) behålls. HowTo-stegen går att läsa på sidan.
- "Rubriken och Om mig, före och efter" är ett stycke, inte en H2: exemplet har ingen rubrik i dag. Bilderna i stegen, skälen och valkorten är `aria-hidden` och har inga rubriker.
- Ordantalet går upp (exemplets texter och raderna om pris är nya). Inget stryks.

## Rubriker och påståenden som bytts

| Var | I dag | I skissen | Belägg |
|---|---|---|---|
| Steg 2 | "Inget fält är obligatoriskt." | "Om mig och Erfarenhet behövs, resten är valfritt." | `route.ts:868-880` svarar 400 utan Om mig eller Erfarenhet; `Step2Profile.tsx:42, :53` |
| Slutblocket och FAQ "Vad kostar LinkedIn-optimeringen?" | "hela CV-analysen" | "CV-analysens alla förslag" | GEM-5 i `docs/publikt-omgang3/textforslag.md` |
| FAQ "Hur lång tid tar optimeringen?" | "eftersom alla fält då är ifyllda från början" | "eftersom fälten då är ifyllda från början" | Rubriken lämnas tom när CV:t är källa, `lib/cvToLinkedIn.ts:40` |
| Hjältens ingress | "vi optimerar fem sektioner samtidigt" | "vi skriver om fem sektioner samtidigt" | Samma sak på svenska, ingen sakändring |
| Exemplet | Anna Lindberg, Klarna och Voi, "12 000 leads", "38 procent" | Sara Lindström, Nordanvind Energi och Halda Logistik | Briefens exempelperson; riktiga bolagsnamn med påhittade tal ska inte stå i ett exempel |

Schemat: HowTo-steg 2 har texten "Inga obligatoriska fält." i `page.tsx` och måste följa med (undantag för HowTo). FAQ-svaren kräver undantag för FAQPage.

**Gratis och Premium, belagt:** verktyget är bara Premium. `FEATURES.linkedin` är `['cv', 'allt']` (`src/lib/access/features.ts:62`), sidan visar betalväggen utan den (`dashboard/linkedin-optimizer/page.tsx`) och rutten svarar 402 (`route.ts:904-918`). Gratisgränsen "en i veckan" i samma fil nås aldrig av ett gratiskonto. Därför säger skissen: exemplet utan konto, optimeringen i Premium.

## Det som kräver beslut

1. **Obelagda påståenden som står kvar ordagrant** och som textspåret bör ta: "De flesta använder färre än 30" (tecken i rubriken), "LinkedIns algoritm prioriterar profiler som är kompletta", "Klart på fem minuter" och talet "5 min" i hjälten. Jag har inte hittat någon källa i koden.
2. **Poängen i exemplet** (32 till 87 och övriga) är exempeltal. Verktyget räknar en profilpoäng per sektion, men talen på sidan kommer inte ur en riktig körning. Raden "Poängen är Saras, som exempel" står under bilden. Vill ägaren ha tal ur en riktig körning får någon köra Saras text genom verktyget.
3. **"Ord en rekryterare kan söka på"** under profilerna är sidans förklaring, inte en vy i verktyget. Verktyget visar poäng, texten och vad som blev bättre.
4. **Exemplet rör sig inte längre.** Dagens demo byter mellan Rubrik, Om mig och Erfarenhet. Skissen visar rubrik och Om mig stilla. Erfarenheten syns i bilden "Fem sektioner i ett pass".
5. **Engelska.** Verktyget kan skriva profilen på svenska eller engelska (`Step1Mode.tsx:184-189`). Sidan säger det inte i dag och skissen lägger inte till det.
6. **Länkbrickorna under Premium** är nya interna länkar. SEO tar ställning.

## Filer bygget rör

- `src/app/(public)/verktyg/linkedin-optimering/page.tsx` (formen, steg 2, slutblocket, HowTo-steg 2)
- `components/LinkedinOptimeringLiveDemo.tsx` (ersätts av det stilla exemplet med Sara)
- `components/linkedin-optimering-faq-data.ts` (två svar)
- `src/components/publikt/VerktygsMall.tsx` och `telefon/skarmar/SkarmLinkedin.tsx` (telefonen utgår på sidan)
- `opengraph-image.tsx` om bilden visar den gamla skärmen

## Förslag till grunden

- En profilyta (`.prof`: banderoll, initialer, namn, rubrik, ort, Om) om fler sidor ska visa LinkedIn-profilen, till exempel /funktioner under "Bli hittad på LinkedIn".
- `.vagsteg` klarar fyra steg. Sidor med fem steg behöver en variant (här `.steg5`, tre plus två).
- Sökrutan (`.sokfalt`) och staplarna "före och efter" i samma rad (`.matt`) kan också flyttas dit.
