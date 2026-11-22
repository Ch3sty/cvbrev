# SEO-baslinjen för publikt omgång 3

Tagen 2026-11-22 av SEO mot `https://www.jobbcoach.ai`, före bygget. Live är `origin/main`. Textändringarna i push 1 och push 2 (commits `78c14a79` och `408efd94` på `design/publikt-omgang3`) var inte live när avtrycket togs, så baslinjen visar sidorna som de såg ut före både texträttningarna och formen. Allt som ska få ändras står i undantagsfilen.

## Filerna

| Fil | Vad |
|---|---|
| `docs/qa/seo-diff/publikt-omgang3-fore-live.json` | Avtrycket före: 498 sidor, alla med status 200. Per sida: title, description, canonical, robots, og:image, h1, h2 och h3 med id, FAQ-frågor (synliga och i FAQPage), alla JSON-LD-block, interna länkar i innehållet och i ramen, första bilden och ordantalet i `main`. |
| `scripts/seo-baslinje/publikt-omgang3-sidor.txt` | Sidlistan, en adress per rad. Grindens egna listor (`sidor()`, `--urval b`) täcker bara ett urval, så listan ligger i en egen fil. Den är live-sajtkartan 2026-11-22 (487 adresser) plus elva sidor utanför sajtkartan som också får det nya skalet. |
| `scripts/seo-baslinje/publikt-omgang3-undantag.json` | Alla avsiktliga skillnader i omgången, med datum och skäl. Grinden läser den av sig själv. |
| `docs/publikt-omgang3/seo-besked-skisser.md` | SEO:s besked på varje skiss, och därmed vad undantagen bygger på. |

## Vad listan täcker

- Startsidan, `/priser`, `/funktioner`, `/om-oss`, `/kontakt`, `/hjalpcenter`, `/press`, `/karriar`, `/integrationer`, `/integritetspolicy`, `/anvandarvillkor`, `/login`, `/register`.
- Alla nio sidor under `/verktyg` som står i sajtkartan, plus `/verktyg/rekryteringstester/prova`.
- `/cv-mallar`, de tre stilsidorna och alla 69 mallsidor per yrke.
- `/cv-exempel`, tio kategorisidor och alla yrkessidor.
- `/personligt-brev-exempel`, tio kategorisidor och alla yrkessidor.
- `/exempel`, `/jobbkartan`, `/rakna-ut` med nio kalkylatorer, `/for-rekryterare` med insikterna, de tre författarsidorna.
- `/artiklar`, `/artiklar?tag=cv`, `/artiklar?page=2` och alla 152 artiklar.
- `/skapa-brev/start` och `/skapa-brev/start?yrke=projektledare` (båda `noindex`, med för att fånga trasiga länkar).

Inget gick att hämta fel: 498 av 498 svarade 200. Varje sida hämtades en gång, i fem omgångar om hundra med paus emellan, mot CDN:et.

Sidor med `noindex` i dag: `/verktyg/rekryteringstester/prova`, `/skapa-brev/start` (båda varianterna), `/artiklar?tag=cv`, `/artiklar?page=2`. De ska ha kvar det.

## Ändringen i grinden

`scripts/seo-diff-artiklar.ts` läser en ny nyckel, `HARD_SIDOR`, ur undantagsfilerna. Sidorna där får den hårda regeln (varje h2 och h3 kvar med samma text och nivå, varje FAQ-fråga kvar, högst 2 procent färre ord). Före ändringen låg `/cv-mallar` med alla mallsidor, `/exempel`, `/jobbkartan` och insikterna under `/for-rekryterare` utanför den, trots att mallsidorna har 66 klick och 6 905 visningar på 90 dagar. Ingen annan regel i skriptet är ändrad. Självtest: baslinjen mot sig själv ger `Fel: 0`.

## Så kör slutgranskningen jämförelsen (P5)

En process i taget, på ett produktionsbygge av hela grenen, aldrig mot produktionen.

```bash
cd C:/Users/chris/cvbrev-publikt3
# 1. Bygg och starta (enligt reglerna för arbetskopian, se BYGGBRIEF.md avsnittet Datorn)
npm run build && npx next start -p 8300

# 2. Avtrycket efter, med exakt samma sidlista. MSYS_NO_PATHCONV krävs i Git Bash,
#    annars görs /artiklar/... om till en Windows-sökväg.
S=$(grep -v '^#' scripts/seo-baslinje/publikt-omgang3-sidor.txt | paste -sd,)
MSYS_NO_PATHCONV=1 npx tsx scripts/seo-diff-artiklar.ts ta --port 8300 --sidor "$S" \
  --ut docs/qa/seo-diff/publikt-omgang3-efter.json

# 3. Jämförelsen
npx tsx scripts/seo-diff-artiklar.ts jamfor \
  --fore docs/qa/seo-diff/publikt-omgang3-fore-live.json \
  --efter docs/qa/seo-diff/publikt-omgang3-efter.json \
  --rapport docs/qa/seo-diff/publikt-omgang3-diff.md
```

Godkänt: rapporten slutar på `Fel: 0`. Skriptet avslutar då med kod 0.

Fäller grinden: läs raden. Är skillnaden avsiktlig och sagd ja till i `seo-besked-skisser.md` saknas en rad i undantagsfilen: lägg till den (lägg till, ta inte bort) med datum och skäl. Står skillnaden inte i beskedet är det ett fel i bygget och rättas i koden, inte i undantagsfilen. Undantag för något jag inte har sagt ja till skrivs inte.

Efter push: sidorna ligger i CDN:et ett dygn. Revalidera de rörda adresserna och ta ett nytt avtryck mot live dagen efter med `--bas https://www.jobbcoach.ai` och samma lista, i samma lugna takt (en hämtning per sida). Den filen blir nästa omgångs baslinje.

## Den nya sidan /verktyg/sokta-tjanster

Den finns inte i baslinjen och jämförs därför inte av grinden. Kontrollera den för sig mot beskedet (avsnittet om sidan i `seo-besked-skisser.md`):

```bash
MSYS_NO_PATHCONV=1 npx tsx scripts/seo-diff-artiklar.ts ta --port 8300 \
  --sidor /verktyg/sokta-tjanster --ut docs/qa/seo-diff/sokta-tjanster-efter.json
```

Läs filen: status 200, robots utan `noindex`, canonical `https://www.jobbcoach.ai/verktyg/sokta-tjanster`, title och description ordagrant som i beskedet, en h1, H2 i beskedets ordning, åtta FAQ-frågor både synliga och i FAQPage, typerna WebApplication, HowTo, FAQPage och BreadcrumbList, HowTo-stegens namn lika med H3-rubrikerna under "Så fungerar det", och sidan med i `/sitemap.xml`. Ta sedan sidans första baslinje mot live dagen efter push; `HARD_SIDOR` har redan en rad för den.

Kontrollera också att de inkommande länkarna finns i efter-avtrycket: menyn och foten (ramen), `/`, `/funktioner`, `/priser`, `/verktyg/jobbmatchning`, `/verktyg/jobbcoachen`, `/artiklar/soka-jobb-via-mail`, `/artiklar/uppfoljning-efter-intervju`. Grinden visar dem som "nya interna länkar".

## Fällorna som bygget måste känna till

1. **Ramen måste vara märkt.** Grinden skiljer innehåll från ram med attributet `data-site-chrome`. Den nya menyn (också megamenyn och telefonmenyn) och den nya foten ska ha det, som i dag. Saknas det räknas menyns länkar och rubriker som innehåll, och då fäller varje artikel på rubrikträdet.
2. **Artiklarna är strängast.** Rubrikträdet jämförs med id och ordning. Artikelskalet får inte lägga till, ta bort, byta nivå eller byta id på någon h2 eller h3, och författarens h3 står kvar som i dag. Reklamkortens rubriker är stycken.
3. **Inga länkmål får försvinna ur en artikel.** Alla 152 artiklar länkar i dag till `/skapa-brev/start` via reklamen. Varje länkmål som reklamkorten, sidokortet, slutkortet, brödsmulan och cookieraden har i dag ska finnas kvar i samma artikel. Ett nytt kort får ersätta ett gammalt bara om det gamlas länkmål står kvar någonstans i artikeln.
4. **Första bilden i en artikel** ska vara artikelbilden med samma `src` och samma alt som i dag. Inget instrument, ingen mallminiatyr och ingen bild i reklamen får ligga före den i HTML:en.
5. **JSON-LD följer bara de undantag som står.** BlogPosting ändras bara i artiklar med egen rad. Ändrar skalet något i alla artiklars schema (utgivare, logga, författare) fäller alla 152. Gör det inte.
6. **Instrumenten** (testramen, CV-arket, träffen, brevet, spåret) har inga h2 eller h3. Är de `aria-hidden` räknas deras ord inte; är de inte det räknas de. Båda är tillåtna, men en sida som byter en synlig text mot ett `aria-hidden` instrument tappar ord.
7. **Dolt bakom "Visa alla"** ska stå i HTML:en från början, dolt med CSS eller `details`, aldrig `aria-hidden`, aldrig hämtat eller ritat först vid klick. Se beskedet för /cv-mallar.
8. **Länkar som byter adress** fäller på sidor utanför artiklarna om den gamla adressen försvinner helt. Brevexemplens knapp får få `&mall=` bara om hjältens och kommentarskortets länk `/skapa-brev/start?yrke=<yrke>` står kvar ordagrant. Startsidans länk till `/funktioner#sokta-tjanster` har ett eget `LANK_BYTT`.
