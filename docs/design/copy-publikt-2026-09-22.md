# Publik copy, slutomgång 2026-09-22

Skriven av copywriter-rollen på gren `copy/publikt`, efter ägarens direktiv: "Publik
copy fick bara sanningsrättelser. Copywritern bör gå igenom den i lugn och ro."

Underlag: `docs/plan-paket-och-onboarding.md` (ägarens beslut 2026-09-22, avsnitt 3
och 4, Fas 2B och 2E), `docs/bygg-noter-paket.md` ("saas-lead: avgjort", B7) och
`docs/design/copy-inloggat-strangar.md` (de sex tonprinciperna).

Regler som gällt varje sträng: inga talstreck, aldrig "Lås upp", aldrig "gratis för
alltid", svenska facktermer, rekryteringssystem (ATS) en gång per vy, vi och du som
subjekt, auktoritär och lugn ton, varierad meningslängd, siffror bara när koden
backar dem. Mallantal går alltid via `TEMPLATE_COUNT` / `FREE_TEMPLATE_COUNT`.

**56 filer ändrade. `npx tsc --noEmit` rent. `npx vitest run`: 473 av 473 gröna i 38
filer.**

---

## Vad omgången faktiskt hittade

Sanningsrättelserna i B7 tog de tio ytor som listades där. Den här omgången gick
igenom hela den publika texten och hittade elva ytterligare ytor som fortfarande
sålde en trial som inte finns, ett paket som inte finns, eller kvoter som ändrades
med gratisnivån. De viktigaste låg inte i FAQ-filerna utan på startsidan och i
mejlen, alltså de två ytor flest människor faktiskt möter.

Tre mönster gick igen och är värda att känna igen nästa gång:

1. **Rättelserna nådde FAQ-texten men inte hjältetexten.** Flera verktygssidor hade
   en korrekt FAQ längst ned och en felaktig siffra i hero, CTA-band och statistik-
   korten på samma sida. Sidan motsade alltså sig själv tre gånger innan besökaren
   kom till FAQ:n.
2. **Mejlen granskades inte alls.** Fyra livscykelmejl, alla registrerade och
   levande, sålde "Jobbsökarveckan", ett paket som inte längre finns i `PLANS`.
3. **Ord som inte är priser bar ändå prislöften.** "Premium" som kolumnrubrik,
   badge och nivånamn stod kvar överallt och betydde numera ingenting bestämt, när
   produkten säljs som sex namngivna paket.

---

## De fem viktigaste omskrivningarna

### 1. Startsidans båda huvudknappar sålde en avvecklad trial

Den mest sedda knappen på sajten, och den i sista CTA-bandet, lovade fem dagars
premium. Reverse trial är borttagen med ägarens beslut 3, så knappen lovade något
kontot aldrig levererar.

- **Före:** `Skapa konto och få 5 dagar Premium`
- **Efter:** `Skapa konto gratis`

Filer: `src/components/landing/LandingHero.tsx`, `src/components/landing/RichFinalCTA.tsx`.
Samma löfte låg i artikelflödets kluster-CTA och i `skapa-brev/start`, båda rättade.

### 2. Fyra livscykelmejl sålde ett paket som inte finns

`quota_wall`, `onetime_expired`, kampanjmejlet om gratisnivån och uppsägnings-
kvittot sålde alla "Jobbsökarveckan för 99 kr, sju dagar, förnyas inte". Det
paketet togs bort i den här releasen. Mejlen är registrerade i `registry.ts` och
går alltså ut skarpt.

- **Före:** `Jobbsökarveckan: 99 kr, sju dagar utan tak, förnyas inte`
- **Efter:** tre rader som speglar spårvalet:
  `CV-veckan, 79 kr: alla mallar, full CV-analys, brev du kan ladda ner`
  `Testveckan, 79 kr: alla nivåer, provläget, hela din historik`
  `Allt-veckan, 99 kr: båda spåren, jobbmatchningen och jobbcoachen`

Kvotmejlet lovade dessutom `Premium ger dig obegränsad tillgång, med 7 dagar gratis`
och listade dagskvoter som inte längre finns (två brev om dagen, tio meddelanden om
dagen). Bara testernas grundnivå återkommer per dygn; brev räknas per vecka och
jobbcoachen per konto. Rättat rad för rad.

Filer: `conversion.ts`, `campaign-gratisniva.ts`, `transactional.ts`, `quota-back.ts`.

### 3. Jämförelsetabellen på /funktioner sålde 149 kr i månaden och en sjudagarstrial

Raderna i tabellen hade uppdaterats mot den nya gratisnivån, men prisrubrikerna
ovanför dem hade inte det. Filens egen kommentar sa att trialen är avvecklad medan
pillret bredvid sålde den.

- **Före:** eyebrow `Gratis vs Premium`, pris `149 kr / månad`, pill `7 dagar gratis trial`
- **Efter:** eyebrow `Gratis vs Allt-veckan`, pris `{PLAN_BY_KEY.all_week.amount} kr / vecka`, pill `Säg upp i ditt konto`

Priset läses nu ur `PLANS` i stället för att stå hårdkodat på tre ställen (desktop-
tabell, mobilkort och statistikraden). Ändras priset följer sidan med av sig själv.

Fil: `src/components/funktioner/ComparisonSection.tsx`.

### 4. Personligt brev sa tre olika saker om samma kvot, på samma sida

Hero sa två brev om dagen, CTA-bandet sa ett brev om dagen, statistikkortet sa ett
brev och sedan ett i veckan. Det sista var det sanna. Schema och metadata sa det
felaktiga, alltså det Google visar.

- **Före (hero):** `2 brev gratis varje dag` · **Efter:** `Ditt första brev gratis`
- **Före (FAQ):** `Ett brev om dagen på gratisnivån, räkningen nollställs varje natt.`
- **Efter:** `Det första brevet är gratis, sedan skriver du ett nytt i veckan. Allt du skrivit ligger kvar att läsa och kopiera, även på gratisnivån. Vill du skriva utan tak och ladda ner breven som PDF och Word ingår det i CV-veckan för 79 kr i veckan.`

Samma mönster fanns i jobbmatchningen (tio jobb i gränssnittet mot tre fulla
träffar i schemat) och i jobbcoachen (per dag i gränssnittet mot per konto i
schemat). Båda satta till vad `quotaService` faktiskt gör.

### 5. Två påståenden vi inte kan belägga

Tonprincip 4 säger att siffror bara står där koden backar dem. Två marknadssiffror
stod kvar utan källa.

- **Före:** `3×` / `fler intervjuer` / `jämfört med generiska brev` (statistikkort på brevsidan)
- **Efter:** `79 kr` / `för hela veckan` / `CV-veckan, säg upp i ditt konto`

Rubriken ovanför kortet sa `ringer rekryteraren oftare`, alltså samma obelagda
löfte i ord. Den säger nu `har rekryteraren en anledning att ringa`, vilket är ett
påstående om brevet och inte om utfallet.

- **Före:** `Erfarenhetspunkter med siffror får 3x högre genomslag hos rekryterare.`
- **Efter:** `Rekryteraren letar efter vad du uppnådde. Skriv ut resultatet i siffror.`

---

## Filer, en rad var

### Startsida och landningskomponenter

| Fil | Ändring |
|---|---|
| `landing/LandingHero.tsx` | Huvudknappen sålde fem dagars premium. Nu `Skapa konto gratis`. |
| `landing/RichFinalCTA.tsx` | Samma trial-löfte i sista CTA-bandet, samma rättelse. |
| `landing/LandingFAQ.tsx` | Frågan om "de 7 gratisdagarna med Premium" ersatt av vad gratisnivån och paketen faktiskt ger. |
| `landing/TestsShowcase.tsx` | `Avancerad · Premium` till `Avancerad · Testveckan`. Kvotraden säger grundnivå per dygn och testtyp, inte "tre grund-tester". |
| `landing/MediaImpactSection.tsx` | Talstreck i DN-citatet bytt mot kolon. |
| `landing/DynamicCounters.tsx` | Talstreck som platshållare för tomt värde bytt mot kort tankstreck. |

### /funktioner

| Fil | Ändring |
|---|---|
| `funktioner/page.tsx` | Titel 73 till 53 tecken, beskrivning 203 till 154. |
| `funktioner/ComparisonSection.tsx` | Se punkt 3 ovan. Priset läses ur `PLANS`. |
| `funktioner/TesterSection.tsx` | Nivåchippet namnger Testveckan i stället för Premium. |
| `funktioner/CvAnalysSection.tsx` | Obelagd "3x högre genomslag" ersatt med vad rekryteraren läser efter. |

### Verktygssidorna

| Fil | Ändring |
|---|---|
| `verktyg/personligt-brev/*` (6 filer) | Tre motstridiga brevkvoter samlade till en: första brevet gratis, sedan ett i veckan. Schema, metadata, hero, CTA, FAQ och statistikkort. |
| `verktyg/cv-analys/*` (7 filer) | "Var tredje dag" till "per konto" överallt. `CVAnalysMini` lovade dessutom fem dagars premium och alla förbättringsförslag gratis, nu poängen, antalet fynd och det tyngsta fyndet. |
| `verktyg/jobbcoachen/*` (5 filer) | Tio meddelanden per dag till per konto. Frågan "Vad händer efter mina 5 gratis frågor?" sålde en sjudagarstrial och dubblerade frågan ovanför; nu en fråga om vad som händer vid taket. |
| `verktyg/jobbmatchning/*` (4 filer) | Tio jobb till tre fulla träffar med skälen, i hero, CTA, statistikkort och metadata. |
| `verktyg/rekryteringstester/*` (4 filer) | "Gör om ett test så ofta du vill" motsade "en gång per dag" på samma sida. Nu grundnivån en gång per dygn och testtyp, och Testveckan i stället för Premium. |
| `verktyg/cv-mallar/*` (4 filer) | "2 mallar gratis" läses nu ur `FREE_TEMPLATE_COUNT`. FAQ sålde ett månadsabonnemang som inte finns. |
| `verktyg/skapa-cv/*` (2 filer) | "Två CV-mallar är helt gratis" rättat till tre, och CV-veckan i stället för Premium. |
| `verktyg/linkedin-optimering/layout.tsx` | Beskrivning 252 till 155 tecken. |
| `verktyg/bli-upptackt/layout.tsx` | Beskrivning 189 till 137 tecken. |

### Övriga publika ytor

| Fil | Ändring |
|---|---|
| `om-oss/components/OmOssPrinciper.tsx` | Kortet räknade upp tre priser i en mening. Nu ett löfte om att vi säljer veckor och inte år; priserna står på prissidan. |
| `om-oss/components/OmOssKontakt.tsx` | Sidan lovade svar samma dag på ett ställe och inom 24 timmar på ett annat. Båda säger nu inom ett dygn. |
| `om-oss/layout.tsx` | Titel 83 till 59 tecken, beskrivning 183 till 155. |
| `skapa-brev/start/StartFlow.tsx` | "Låser vi upp hela brevet" bryter mot regeln om "lås upp", och "du kan ladda ner det" var osant eftersom nedladdning är betald. Båda rättade, och fem dagars premium struket. |

### Artikel-CTA:er

| Fil | Ändring |
|---|---|
| `artiklar/ArticleSidebar.tsx` | Kortet sålde "Testa alla verktyg gratis i 7 dagar" på varje artikelsida. Nu spårvalet med rätt priser, och knappen går till `/priser` i stället för `/register`. |
| `artiklar/ArticleClusterCTA.tsx` | "Tolv mallar gratis" läses ur konstanterna. Brevklustret sålde fem dagars premium, testklustret "ett test per dag". |
| `artiklar/ArticlesFinalCTA.tsx` | "Gratisnivån har ingen tidsgräns" ligger för nära "gratis för alltid" och ersätts av "Paket från 79 kr i veckan". Talstreck i löptext bort. |
| `artiklar/InlineFeedCTA.tsx` | Talstreck i löptext bort, och "AI-driven analys" till "CV-analys". |

### Mejl

| Fil | Ändring |
|---|---|
| `email/lifecycle/templates/conversion.ts` | Kvotväggen och utgånget engångsköp säljer spåren i stället för Jobbsökarveckan. |
| `email/lifecycle/templates/campaign-gratisniva.ts` | Hela punktlistan beskrev den gamla gratisnivån. Nu de fem gränser som gäller. |
| `email/lifecycle/templates/transactional.ts` | Uppsägningskvittot lovade "ett brev om dagen och en CV-analys var tredje dag" och sålde Jobbsökarveckan. |
| `email/quota-back.ts` | "Premium ger dig obegränsad tillgång, med 7 dagar gratis" bort. Dagskvoterna rättade: bara testernas grundnivå återkommer per dygn. |

---

## Kontroller

| Kontroll | Utfall |
|---|---|
| `npx tsc --noEmit` | Rent |
| `npx vitest run` | 473 av 473 gröna, 38 filer. `paket-copy` och `template-count` vaktar hårdkodade tal och gick igenom |
| `grep "—"` i publik löptext | Noll. Kvarvarande träffar är kodkommentarer och SVG-rubriker |
| `grep "Lås upp"` | Noll i copy. Kvar: testerna som vaktar regeln, och "slås upp" / "låses upp" om kandidatkontakt i rekryterarvyn, vilket är en annan sak än en betalvägg |
| `grep "gratis för alltid"` | Noll. Bara testerna som vaktar regeln |
| `grep "Jobbsökarveckan"` | Noll |
| `grep "trial" / "provperiod"` | Ingen användarsynlig träff. Kvar: Stripes egna `trialing`-statusar i `helpers.ts` och `transactional.ts`, `isTrialSource` i `premium/trial.ts` för avvecklingsläsningen, och `TrialCardIllustration` som filnamn |
| `grep "inbjud" / "gäst"` | Ingen träff i publik copy. Kvarvarande "gäst" är hotell- och restaurangyrkenas CV-exempel, alltså korrekt svenska |
| Metadata mot on-page-standarden | 16 sidor låg utanför spec före omgången, 5 efter. Se nedan |

---

## Sådant jag inte ändrat, men som ägaren bör se

**1. Marcus-referensen på brevsidan.** `BrevResultatBevis.tsx` bär ett namngivet
kundcitat: "Marcus, 34, Göteborg", med avslutet "Backend-utvecklare, nu på Klarna"
och rubriken "Från 14 avslag till intervju". Jag har tagit bort den obelagda
siffran bredvid, men citatet självt står kvar. Om det inte är en riktig person som
har gett sitt medgivande är det ett större problem än någon kvotsiffra: det namnger
en arbetsgivare och läses som ett verkligt kundfall. Samma fråga gäller
`TestimonialsRow.tsx` på startsidan (Emma, Marcus, Sofia med "4.9 av 5 från våra
användare" och "Tusentals jobbsökare i Sverige har fått intervjuer och jobb") och
kundcitaten på cv-mallar-, jobbcoachen- och linkedin-sidorna. Det här är ett
ägarbeslut om vad som är belagt, inte ett copybeslut, och därför har jag låtit dem
stå. Men de bör kontrolleras innan nästa release, eftersom de är den enda text på
sajten som påstår något om andra människors utfall.

**2. Fem sidor ligger fortfarande utanför metadata-spec.** `/exempel`,
`/for-rekryterare`, `/for-rekryterare/insikter`, `/rakna-ut/lon-efter-skatt` och
`verktyg/cv-mallar/page.tsx`. De ligger utanför den här omgångens scope (rekryterar-
sidorna har egen B2B-ton och räkna-ut har egen ägare), och ingen av dem bär ett
felaktigt paketlöfte, så de stoppar ingenting. De behöver en egen kort omgång.

**3. `/hjalpcenter` har ingen metadata alls.** Sidan är en klientkomponent och
exporterar varken title eller description, så den ärver rotens. Den är dessutom
rosa och lila medan resten av sajten är orange, och innehållet är i praktiken en
platshållare ("Utbyggd hjälpsektion kommer snart"). Samma rosa gradient finns i
`ArticleCategories.tsx` och `ModernCategorySidebar.tsx`. Jag har inte rört färgerna,
men sidan är indexerbar och ser inte ut att höra till samma produkt.

**4. "Sex verktyg" mot "åtta verktyg".** Startsidan säger sex, `/funktioner` säger
åtta. Båda stämmer mot sin egen lista, så ingendera är osann, men en besökare som
går från den ena sidan till den andra ser två olika tal om samma produkt. Värt ett
beslut om vilket tal som är det officiella.

**5. `cv-mallar/page.tsx` publicerar 149 kr per mall i strukturerad data.**
Product-schemat sätter `price: '149'` på varje premium-mall, med kommentaren att
merchant-listings kräver ett pris över noll. Sökmotorer kan alltså visa 149 kr som
priset för en enskild CV-mall, vilket inte är vad något paket kostar. Det är en
teknisk SEO-fråga snarare än copy, men det är ett prispåstående på en indexerad yta
och bör ses över av den som äger schemat.
