# Copygranskning K2 till K6

Svensk UX-copywriter, 2026-11-14. Granskat: arbetskopian och `main..HEAD` på `feat/matning-kampanj` i `.claude/worktrees/publikt-v2`, mot `docs/qa/seo-tester-omgang2/seo-forslag-k4-k6.md`. Kontroll: inga talstreck, inga mittpunkter och inga kampanjord i någon ny title, description, H1, snabbsvar, FAQ eller schema. Alla ankartexter och huvudordens placering är orörda.

Summering: 7 underkända texter, alla med färdig ersättning. Resten godkänt. Sist fyra observationer utanför diffen som ändå syns på de ändrade sidorna.

## 1. Title, H1, description (K4 a)

| Sida | Text | Dom |
|---|---|---|
| /cv-mallar | title `CV-mall: 41 mallar att fylla i och ladda ner, 3 gratis`, H1 `CV-mallar att fylla i och ladda ner. 41 mallar, 3 gratis.`, description, ItemList | Godkänt |
| /cv-exempel | title, H1 `CV-exempel för 89 yrken. Börja med ditt.`, description | Godkänt |
| /personligt-brev-exempel | title `Personligt brev exempel: 89 färdiga brev för svenska yrken`, H1, description, ItemList, keywords | Godkänt. Särskrivningen i title är sökfrasen och SEO-låst; H1 har bindestrecket, bra. |
| /exempel | title `Exempel för jobbansökan: CV, personligt brev och mallar`, H1, description, WebPage-schema | Godkänt |
| skriva-personligt-brev-guide | seoTitle, H1 `Personligt brev: så skriver du ett som rekryteraren läser hela`, description | Godkänt |
| personligt-brev-mall-gratis | seoTitle, H1 `Personligt brev mall gratis: den som fungerar och de du ska undvika`, description | Godkänt |
| cv-mall-gratis-guide | seoTitle `Var hittar man en gratis CV-mall? 5 källor jämförda`, description | Godkänt |
| personligt-brev-exempel-generella | seoTitle `Så använder du exempel på personligt brev utan att kopiera`, description | Godkänt |

## 2. Snabbsvar och ingresser (K6)

**/cv-mallar, snabbsvar.** Godkänt som copy. En sanningsrisk i koden: `Alla tre är märkta ATS-säkra` har "tre" hårdkodat medan antalet läses ur `FREE_TEMPLATE_IDS`. Ersätt med `Alla ${talord(GRATIS_NAMN.length)} är märkta ATS-säkra, ...` (talord finns i `src/lib/traning/copy`) eller kort och gott `Alla är märkta ATS-säkra, ...`.

**/cv-mallar, stycket under "Alla våra CV-mallar"** (`30 av mallarna är märkta ATS-säkra ...`). Godkänt.

**/cv-exempel och /personligt-brev-exempel, snabbsvar.** Godkänt, båda.

**Flyttade ingresser under H2 "{n} yrken".** Godkänt enligt underlaget ("oförändrad i ord"). Notera att brevingressen fortfarande säger "Hitta rätt mall för ditt personliga brev ... använda som mall", alltså mallordet två gånger på en sida som nu ska äga exempelordet. Tas i nästa MDX-omgång, inte nu.

**/exempel, hjältens ingress** (`... fördelade över 10 kategorier. Behöver du en färdig design i stället finns 41 CV-mallar att välja mellan.`). Godkänt. Skriv gärna "tio kategorier" med `talord(KATEGORIER.length)`; små tal skrivs med bokstäver i löptext, 41 och 89 får stå som siffror.

## 3. Situationsraderna

`Börja från din situation` (/cv-mallar) och `Din situation` (galleriorna) med Student, Utan erfarenhet, Karriärbyte, Chef. Godkänt. Rubrikerna skiljer sig mellan sidorna men båda står i underlaget.

## 4. FAQ

**cv-mallar-faq.ts**
- Nya: "Vilken CV-mall passar en chef?", "Vilken CV-mall passar vid karriärbyte?", "Kan jag byta CV-mall efter att jag fyllt i mitt CV?" Godkänt, alla tre.
- Tvättade svar (bäst för svenska arbetsgivare, skillnaden mall/exempel, PDF eller Word, hur väljer jag, foto, samma mall, student). Godkänt. Studentsvaret är underlagets exakta text.

**galleri-faq.ts**
- F1 (`... registrerar du dig gratis, och då ingår en CV-analys.`) och F2 (`... ingår ett brev i veckan när du har registrerat dig.`). Godkänt.
- Sex nya frågor (utan erfarenhet, chef, karriärbyte, för CV och brev) med länkar. Godkänt, alla sex.

**rekryteringstester-faq-data.ts**, "Vilka tester använder myndigheterna?" med länken Tester hos myndigheter. Godkänt. Långt svar, men varje mening bär fakta och sista meningen landar rätt.

## 5. "Inför testet" på /verktyg/rekryteringstester (K5)

- Kick `Tre guider` (och fallen En/Två guider), H2 `Inför testet`. Godkänt.
- Ingress `Vet du vilket test som väntar, eller står det bara test i inbjudan? De här tre guiderna tar dig från inbjudan till resultatet.` Godkänt. Sätt gärna citattecken runt ordet: `står det bara ”test” i inbjudan`.
- Kort 2 (stanine) och kort 3 (myndigheter). Godkänt.

**Underkänt, kort 1:** `Vad forskningen säger om övning, en plan för veckan före och sju saker att tänka på på testdagen.` Dubbelprepositionen "på på" är korrekt men stakar sig vid läsning.
Ersättning: `Vad forskningen säger om övning, en plan för veckan före och sju saker att komma ihåg på testdagen.`

## 6. Guiden på /cv-mallar (tvätten)

Godkänt: ATS-stycket ("ett ATS, ett Applicant Tracking System"), rubriken "Olika yrken kräver olika upplägg", konsultstycket ("en mindre brödtext ... utan att verka trång"), "Mallar för högsta ledningen (Atlas) ... ledningsgrupp eller styrelseroller", rubriken "Använd båda, de kompletterar varandra", "En CV-mall är designen: typsnitt, sektionsordning, färger och layout", "så att du både kan se ett färdigt CV ...". Inga ord har försvunnit.

Småsak i en rörd rad: "vilket sällan funkar" i branschstycket. Skriv "vilket sällan fungerar".

**Underkänt, korsbandet:** `Vi har 89 färdiga CV-exempel skrivna för specifika yrken, att inspireras av när du skriver ditt eget innehåll.` Satsen efter kommat hänger löst.
Ersättning: `Vi har {CV_GALLERI.length} färdiga CV-exempel för specifika yrken. Använd dem som inspiration när du skriver ditt eget innehåll.`

## 7. Galleriguiden och hubben

**MallarGuideSection.tsx.** Kick `Guide till exemplen`, H2 `Så använder du ett CV-exempel som mall` / `Så använder du ett exempel på personligt brev som mall`, den nya meningen om CV-mallar respektive Personligt brev mall gratis, slutknapparna `Bläddra alla CV-exempel` / `Bläddra alla personligt brev-exempel`. Godkänt.

**MallarHubGuideSection.tsx.** "Är alla mallar verkligen gratis?" (`Ja, alla 178 exempel i biblioteket ... CV-mallarna är en annan sak: 3 av 41 är gratis, resten ingår i Premium. Vi tar aldrig betalt för att du läser.`). Godkänt. Ankartexten `var du hittar en gratis CV-mall` och knapparna `Bläddra CV-exempel` / `Bläddra personligt brev-exempel`. Godkänt.

**Underkänt:** `Alla våra designer finns bland CV-mallar.` "Bland CV-mallar" utan bestämning är inte svenska man säger. Ankartexten "CV-mallar" är SEO-låst och behålls, meningen runt den byts.
Ersättning: `Alla våra designer hittar du på sidan <Link href="/cv-mallar">CV-mallar</Link>.`

**ExempelHero.tsx.** Knappen `Personligt brev-exempel`. Godkänt.

**ExempelMall.tsx** (yrkessidorna): `Hitta inspiration från liknande yrken, eller se alla 89 CV-exempel. Alla följer samma ATS-optimerade upplägg.` och brevvarianten utan "ATS-optimerade". Godkänt. BreadcrumbList med Exempel, CV-exempel, Personligt brev-exempel. Godkänt.

**CVMallarGalleri.tsx** (/verktyg/cv-mallar): `Vill du se vilken mall som passar ditt yrke har vi CV-mallar per yrke med rekryterarens tips.` Godkänt.

## 8. Yrkesmallarna (F8), YrkesmallContent.tsx

- Brickan `Ingår i Premium` och knappen `Använd mallen` när första mallen inte är gratis; alt-texten utan "(gratis)". Godkänt som ord.

**Underkänt, stycket under "Se ditt {yrke}-CV i olika designer":** när första mallen inte är gratis blir det `Förhandsgranska ditt CV i mallen Tidlös eller i Tidlös Plus, som ingår i Premium.` Bisatsen hänger bara på den andra mallen, så läsaren tror att Tidlös är gratis. Det är precis det F8 ska bort från.
Ersättning (båda fallen):
```
Förhandsgranska ditt CV i {forstaGratis
  ? `vår gratismall ${data.freeMallNamn} eller i ${data.premiumMallNamn}, som ingår i Premium`
  : `${data.freeMallNamn} eller ${data.premiumMallNamn}. Båda ingår i Premium`}. Byt mall och typsnitt och se skillnaderna direkt.
```
(Med den andra grenen blir det "... Tidlös Plus. Båda ingår i Premium. Byt mall ..." vilket är avsikten.)

Två saker i samma kort som inte ligger i diffen men syns intill den nya brickan: raderna `ATS-säker · ren design` och `Foto + LinkedIn · visuellt rikare` har mittpunkter mellan fakta. Skriv `ATS-säker, ren design` och `Foto och LinkedIn, visuellt rikare`. Och kortet behåller grön gratisfärg (emerald) när det nu säger "Ingår i Premium"; det är en designfråga för Opus, inte copy, men värt att ta i samma commit.

## 9. Länkmeningarna i content/artiklar

Godkänt: cv-mall-gratis-guide (nya stycket, "tio kategorier, bland annat vård, IT ...", rad 232), cv-mall-word-gratis, cv-mall-pdf-gratis (nya meningen om CV-mallar), vad-ar-ett-personligt-brev, cv-och-personligt-brev, personligt-brev-jobbansokan (båda), tips-pa-personligt-brev (båda), bra-personligt-brev, skriva-personligt-brev-guide (båda), personligt-brev-mall-word, personligt-brev-exempel-generella (alla fem ställen inklusive H2 "Se kompletta exempel för 89 yrken"), cv-exempel-yrken rad 46, exempel-pa-cv-guide, skriva-cv-guide, hur-skriver-man-ett-personligt-brev (båda), personligt-brev-mall-gratis (alla 89-rättningar och rad 301).

**Underkänt, cv-mall-pdf-gratis.mdx, snabbsvaret:** `... och ladda ner den som PDF direkt, helt gratis med ett konto.` "Helt gratis" och ett villkor i samma andetag drar åt olika håll.
Ersättning: `... och ladda ner den som PDF direkt. Det kostar inget, men du behöver ett konto.`
Första stycket (`... på några minuter, gratis med ett konto.`) är utan "helt" och godkänns.

**Avvikelse från underlaget, inte copyfel:** cv-exempel-yrken rad 14 (FAQ) och 264 står kvar som `CV-galleri med 89 yrkesexempel`. Underlaget säger `CV-exempel för 89 yrken`. Talet är rättat, ankartexten är inte bytt. Lämnar till Opus och SEO.

## 10. Prisraderna under Black Week

`MedKampanjPris` byter bara "149 kr i månaden" mot "99 kr första månaden, sedan 149 kr i månaden". Resultat i löptext, till exempel: `Alla nivåer, övningsprov mot klockan och fördjupade personlighetstestet ingår i Premium, 99 kr första månaden, sedan 149 kr i månaden.` Godkänt. Likaså listans slutkort (`Allt i en prenumeration, 99 kr första månaden, sedan 149 kr i månaden. Ingen bindningstid, säg upp med ett klick.`), sidokortet (`99 kr`, överstruket `149 kr`, `första månaden, sedan 149 kr i månaden. Säg upp när du vill.`) och provsidan i inloggat. Inga kampanjord i title, H1, snabbsvar, FAQ eller schema, bekräftat i diffen.

En anmärkning, inte underkänt: på provsidan blir meningen `Hela övningsprovet i I-provets ordning, med tid per deltest, ingår i Premium, 99 kr första månaden, sedan 149 kr i månaden.` Fyra kommatecken i rad. Om `premium`-strängen i ProvTypSida.tsx får en punkt i stället för komma (`${paketKort()}. ${...}`) läser den bättre: "... ingår i Premium. 99 kr första månaden, sedan 149 kr i månaden." Ändra bara om Opus tycker det är värt en rad under frysen.

## 11. Utanför diffen, men synligt på de ändrade sidorna

1. /cv-mallar, raden direkt under det nya stycket: `Filtrera efter typ, stil eller tier.` "Tier" är ett engelskt gränssnittsord. Skriv `Filtrera efter typ, stil eller gratis och Premium.`
2. /cv-mallar, guideblockets eyebrow `Mall vs exempel`. Skriv `Mall eller exempel`.
3. MallarGuideSection, slutraden `Redo att börja? Plocka en CV-mall som passar ditt yrke.` följd av knappen "Bläddra alla CV-exempel". Mallordet hänger kvar och motsäger knappen. Skriv `Redo att börja? Välj ett exempel som passar ditt yrke.` (samma för brev).
4. ExempelHero, förtroenderaden `Helt gratis` står kvar i hjälten som nu även länkar till CV-mallar där 3 av 41 är gratis. Exemplen är gratis, så raden är sann, men den ligger nära mallänken. Låt SEO/saas-lead avgöra om den ska bli `Exemplen är gratis`.

Övriga äldre talstreck i de rörda MDX-filerna (cv-mall-word-gratis, cv-och-personligt-brev) ligger i orörda stycken och hör till artikeloptimeringskön, inte den här omgången.
