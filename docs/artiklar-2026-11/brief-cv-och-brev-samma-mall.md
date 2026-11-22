# Brief: ny artikel om CV och personligt brev i samma mall

Skriven 2026-11-22 av SEO. Steg 1 i kedjan SEO, copywriter, saas-lead. Arbetstitel från ägaren: "CV och personligt brev i samma mall: så får ansökan en röd tråd".

---

## 1. Målord och sökavsikt

Search Console, 90 dagar = 2026-08-23 till 2026-11-20, 28 dagar = 2026-10-24 till 2026-11-20, hämtat 2026-11-22. Visningar summerade över alla sidor som fick frågan; positionen är viktad med visningarna.

| Sökfråga | 90 d: visn, pos | 28 d: visn, pos | Roll |
|---|---|---|---|
| cv och personligt brev mall | 19, 37,3 | 16, 30,3 | **Huvudord** |
| cv mall personligt brev | 26, 40,6 | 24, 39,9 | Huvudord (variant) |
| cv personligt brev mall | 14, 28,9 | 13, 28,9 | variant |
| mall cv personligt brev | 10, 37,1 | 10, 37,1 | variant |
| cv personligt brev mall exempel | 9, 26,9 | 7, 28,0 | variant |
| cv och personligt brev i samma dokument | 8, 65,4 | | Stödord, egen FAQ |
| mall cv och personligt brev | 7, 42,3 | 4, 21,5 | variant |
| mall för cv och personligt brev | 4, 54,7 | | variant |
| cv och personligt brev mall gratis | 3, 56,3 | | variant |
| gratis mall cv och personligt brev | 1, 66,0 | | variant |

**Alla frågor med "cv", "brev" och "mall": 93 visningar på 90 dagar och 74 på 28 dagar**, alltså ökande. Noll klick. Ingen sida rankar bättre än position 15 på någon av dem. "matchande cv och personligt brev" och "samma mall" ger noll visningar (bedömning att de används).

**Ord vi inte tar** (de ägs av andra sidor, se avsnitt 5):

| Sökfråga | 90 d | Ägs av |
|---|---|---|
| personligt brev mall | 393 v, p 33,5 | `personligt-brev-mall-gratis` (113 v, p 15,2), delas i dag med `skriva-personligt-brev-guide` och `rubrik-for-personligt-brev` |
| personligt brev mall gratis | 379 v, p 36,2 | `personligt-brev-mall-gratis`, `personligt-brev-mall-word`, `/personligt-brev-exempel` |
| personligt brev mall word | 39 v, p 15,6 | `personligt-brev-mall-word` |
| hjälp med cv och personligt brev | 113 v, p 50,9 | `cv-och-personligt-brev` (57 v, p 69,1) |
| skillnad på cv och personligt brev | 17 v, p 17,2 | `skillnad-cv-personligt-brev` (p 13) |

Huvudordet "personligt brev mall" (268 v i underlaget, 393 v över alla sidor) är redan uppdelat på tre artiklar. En fjärde sida på samma ord gör det värre. Den nya artikeln får **inte** ha "personligt brev mall" först i title, seoTitle eller H1; den tar sammansättningen med CV.

**Sökavsikten:** blandad, mest kommersiell. Den som skriver "cv och personligt brev mall" vill ha två dokument som ser likadana ut, gärna gratis, och hur man får dem att matcha. **Vad som rankar i dag (sökning 2026-11-22 från USA, så det svenska resultatet kan skilja sig):** Arbetsförmedlingens sidor om CV och personligt brev, som har Word-mallar i matchande färger och skriver "Välj den mall som bäst passar ihop med hur ditt cv ser ut"; mallgallerier (Canva, Jobseeker, Tutkit, WPS, Enhancv) där CV och brev väljs i samma verktyg. Gallerierna har nästan ingen förklarande text. Vår vinkel: förklaringen av vad som ska vara lika och vad som ska skilja, plus ett ställe där läsaren gör det direkt. Längd: **1 600 till 2 000 ord** (bedömning; gallerierna är korta, Arbetsförmedlingens sidor medellånga, och vi ska slå dem på förklaring, inte på längd).

## 2. Slug, metadata och frontmatter

- **Slug:** `cv-och-personligt-brev-samma-mall`.
- **title (H1):** "CV och personligt brev i samma mall: så får ansökan en röd tråd" (63 tecken).
- **seoTitle:** "CV och personligt brev mall: så matchar du designen" (**51 tecken**).
- **description:** "CV och personligt brev i samma mall: samma huvud, typsnitt och färg gör att ansökan känns igen. Så matchar du dem, i Word eller hos oss." (**136 tecken**).
- **date / updated:** publiceringsdagen. **author:** "Teamet på jobbcoach.ai".
- **image:** `/images/artiklar/cv-och-personligt-brev-samma-mall-v2.webp`, **imageAlt** i avsnitt 7.
- **tags (8):** "cv och personligt brev mall", "cv mall personligt brev", "matchande cv och personligt brev", "cv och personligt brev", "cv-mall", "personligt brev layout", "ansökningshandlingar", "mall för personligt brev". Lägg **inte** "personligt brev mall gratis" som tagg (taggen är en länk till en taggsida och ordet ägs av en annan artikel).
- **Siffror i metadata:** inget mallantal i seoTitle, description eller FAQ-frågor. Mallantalet kan ändras (det finns undantag för en mallomgång i december i `scripts/seo-baslinje/mallar-2026-12-undantag.json`), och MDX kan inte läsa konstanterna. I brödtexten får "40 mallar" och "26 med Word" stå, högst en gång var, så att en ändring är lätt att hitta.
- **howto:** ja, för den del där läsaren gör det själv i Word eller Google Docs (en äkta stegföljd mot ett resultat: två dokument med samma huvud och typografi). Förslag:

```yaml
howto:
  name: "Så får CV och personligt brev samma design i Word"
  steps:
    - name: "Börja i CV:t"
      text: "Gör färdigt CV:ts huvud med namn och kontaktuppgifter, typsnitt och accentfärg."
    - name: "Kopiera huvudet till brevet"
      text: "Kopiera hela huvudet från CV:t och klistra in det överst i brevet, med samma typsnitt och storlek."
    - name: "Använd samma format"
      text: "Ge brevets brödtext och eventuella rubriker samma typsnitt, storlek och färg som i CV:t."
    - name: "Jämför sida vid sida"
      text: "Lägg dokumenten bredvid varandra och kontrollera marginaler, avstånd och kontaktuppgifter."
    - name: "Spara som PDF med ditt namn"
      text: "Spara båda som PDF med ditt namn i filnamnet, om annonsen inte ber om något annat."
```

Stegen ska stå synligt med exakt samma namn och text i avsnitt 3.6.

- **faq (6), frågorna ordagrant:**
  1. "Ska CV och personligt brev ha samma mall?"
  2. "Kan CV och personligt brev vara i samma dokument?"
  3. "Ska det personliga brevet ha bild om CV:t har det?"
  4. "Vilket typsnitt ska CV och personligt brev ha?"
  5. "Finns det gratis mallar för både CV och personligt brev?"
  6. "Kan jag ladda ner det personliga brevet som Word-fil?"

## 3. Dispositionen

### 3.1 Snabbsvar (JSX-rutan, h2 "Snabbsvar: ska CV och personligt brev ha samma mall?"), 60 till 80 ord

Ja. Samma huvud med namn och kontaktuppgifter, samma typsnitt och samma accentfärg gör att rekryteraren ser att dokumenten hör ihop. Innehållet ska däremot skilja sig: CV:t listar, brevet argumenterar. Arbetsförmedlingen råder själv att välja den brevmall som passar ihop med CV:t. Brevet har inget foto.

**Direkt efter rutan:** visaren `<CvOchBrevPar />` (saas-lead 10.1, SEO 11.1 och 11.4). Den bär artikelns första handling.

### 3.2 Ingress, 100 till 140 ord

Konkret bild: rekryteraren har två PDF:er öppna bredvid varandra, ett CV i blått med sidospalt och ett brev i Times utan huvud. Sedan vad artikeln ger: vad som ska vara lika, vad som ska skilja, hur du gör i Word och hur det går hos oss. Ingen premiss som "en ansökan består av CV och brev".

### 3.3 H2 "Varför ska CV och personligt brev se likadana ut?", 200 till 260 ord

- Arbetsförmedlingens råd, med citat och länk ("Välj den mall som bäst passar ihop med hur ditt cv ser ut").
- Varför det spelar roll: dokumenten läses ofta tillsammans och ibland skrivs de ut eller sparas i samma mapp. Att två olika utseenden ger ett slarvigare intryck är **vår bedömning som rekryteringsexperter**, inte forskning; skriv det som vår erfarenhet, aldrig som en undersökning eller en siffra.
- Det som inte är skälet: ett snyggt brev ersätter inte innehållet. Länk till `/artiklar/cv-och-personligt-brev` för hur innehållet delas mellan dem.
- **Första länken till produktsidan** står här, i löptext (SEO 11.1): ankare "skriva det personliga brevet i samma mall som CV:t" till `/verktyg/personligt-brev`. Den andra står i 3.7.

### 3.4 H2 "Vad ska vara likadant i CV:t och brevet?", 400 till 480 ord

- **H3 "Huvudet med namn och kontaktuppgifter"**: samma namn, samma uppställning, samma telefon och e-post. Den vanligaste missen: gammal e-post i det ena.
- **H3 "Typsnitt och textstorlek"**: samma typsnitt för brödtext, och för rubriker om brevet har några. Länk till `/artiklar/personligt-brev-layout` för typsnitt och storlek i brevet. Inga påståenden om vilka typsnitt "rekryterare föredrar" utan källa.
- **H3 "Färg och accenter"**: samma accentfärg, använd sparsamt.
- **H3 "Marginaler och avstånd"**: brevet följer CV:ts marginaler så att sidorna ser likadana ut utskrivna.
- **H3 "Filnamn och format"**: samma mönster i filnamnen (Förnamn-Efternamn-CV.pdf, Förnamn-Efternamn-Personligt-brev.pdf, som i `/artiklar/soka-jobb-via-mail`). Arbetsförmedlingen: spara i Word eller som PDF så att texten kan läsas korrekt.

En JSX-tabell (aldrig pipe-tabell) passar här: "Lika i båda" mot "Bara i CV:t" mot "Bara i brevet", fem till sju rader.

### 3.5 H2 "Vad ska skilja dem åt?", 200 till 260 ord

- Foto: bara i CV:t, om alls. Våra brevmallar har ingen fotoplats, också när CV-mallen har det. Länk till `/artiklar/bild-i-personligt-brev`.
- Sidospalt och kompetensstaplar hör till CV:t; brevet är löptext med samma huvud. **Rättat i slutgranskningen:** i sidospaltmallarna Kalksten, Granit, Sand och Ek följer spalten med till brevet, men där står bara kontaktuppgifterna; bara Stål blir en ren spalt. Foto, kompetenser och språk stannar i CV:t. Artikeln och visarens texter säger det som brevbilderna i `public/mallar/brev/` visar.
- Innehållet upprepas inte. Länk till `/artiklar/skillnad-cv-personligt-brev` (ankare "skillnaden mellan CV och personligt brev").

### 3.6 H2 "Så får du samma design i Word eller Google Docs", 250 till 320 ord

De synliga stegen, numrerade, med exakt samma namn och text som `howto`. Sedan två korta råd: spara huvudet som en egen stil eller ett eget block så att nästa brev börjar rätt; i Google Docs fungerar samma sätt med "Kopiera format". Länk till `/artiklar/personligt-brev-mall-word` för den som vill börja från en Word-mall. Arbetsförmedlingen har matchande Word-mallar för CV och brev; nämn att de finns och länka till deras sida om personligt brev.

### 3.7 H2 "Så får du CV och brev i samma mall hos oss", 220 till 300 ord

Produktavsnittet. Bara det som står i 4.2. Inga steg som HowTo här (HowTo ligger redan i 3.6). **Ingen knapp och inget kort i avsnittet** (SEO 11.2): visaren efter snabbsvaret och kortet efter texten bär handlingen.

Två vägar i löptext, som saas-lead beskriver i 10.5:

- **Har du byggt CV:t hos oss** börjar brevet i samma mall, om det är en mall du får använda (Linne och Björk gratis, övriga med Premium); annars börjar det i Linne. Du byter i "Byt mall" eller under Mallar utan att brevet skrivs om.
- **Har du inget CV hos oss** väljer du mall, skriver brevet och bygger sedan CV:t i samma mall. En uppladdad CV-fil styr inte brevets mall, och artikeln påstår inte det.

Länkar i löptexten: `/verktyg/personligt-brev` med ankaret "skriva personligt brev hos oss" (produktsidans andra kontextlänk i artikeln) och `/verktyg/skapa-cv` med ankaret "bygga CV:t i samma mall".

### 3.8 H2 "Vilka mallar fungerar för både CV och brev?", 200 till 260 ord

Mallarna i fyra familjer, med vad som händer i brevet: en spalt (enklast att matcha), sidospalt (spalten följer med till brevet i Kalksten, Granit, Sand och Ek, med bara kontaktuppgifterna i den; Stål blir en ren spalt; kontrollerat mot brevbilderna i slutgranskningen), rubrikerna eller årtalen i marginalen, och de konstnärliga. För rekryteringssystem: en spalt med standardrubriker läses säkrast; länk till `/artiklar/ats-vanligt-cv`. Länk till `/cv-mallar` för att bläddra och `/cv-mallar/word` för Word-mallarna. Avsnittet får hänvisa upp till visaren ("byt till en sidospaltsmall i visaren ovan och se hur brevet blir"), eftersom visaren har två mallar ur varje familj.

### 3.9 H2 "Vanliga misstag när CV och brev ska matcha", 150 till 200 ord

Fyra till fem konkreta: olika typsnitt för att brevet skrevs i e-postprogrammet, foto i brevet, olika kontaktuppgifter, CV:t i färg och brevet i svartvitt, filnamn "CV_slutgiltig2.pdf" och "brev.docx". Varje misstag med en mening om hur det ser ut och en om hur det rättas.

### 3.10 FAQ (`<FAQContainer>` med sex `<FAQItem>`), frågorna i avsnitt 2

Svar 40 till 80 ord. Särskilt:

- **Fråga 2 (samma dokument):** varken Arbetsförmedlingen eller någon källa vi läst kräver det ena eller det andra. Vårt råd: två filer, eftersom `soka-jobb-via-mail` rekommenderar två namngivna PDF:er och rekryteringssystem ofta har ett fält för CV och ett för brev. Följ annonsens instruktion om den säger annat. Skriv "vårt råd". Påståendet om rekryteringssystemens fält är **bedömning**; skriv "ofta", aldrig "alltid".
- **Fråga 5 (gratis):** Arbetsförmedlingen har matchande Word-mallar; hos oss är Linne och Björk gratis för både CV och brev, med villkoren i 4.2 (ingen gratis nedladdning av brev).
- **Fråga 6 (Word):** Word finns för 26 av mallarna, för CV och brev; att ladda ner brevet, som PDF eller Word, ingår i Premium.

## 4. Fakta som måste med, med källa

### 4.1 Externa källor (lästa 2026-11-22)

| Påstående | Källa | Ord |
|---|---|---|
| Välj brevmallen som passar CV:t | Arbetsförmedlingen, Skriva personligt brev, https://arbetsformedlingen.se/for-arbetssokande/cv-ansokan-och-intervju/skriva-personligt-brev | "Välj den mall som bäst passar ihop med hur ditt cv ser ut." |
| Arbetsförmedlingen har tre brevmallar i Word (grön med foto, blå utan foto, enkel) och länkar till matchande CV-mallar | samma | "Arbetsförmedlingen har tre mallar för personligt brev i word" |
| Spara i Word eller som PDF så att texten kan läsas korrekt | samma | "sparar din text i Word eller som en pdf så att den kan läsas korrekt" |
| Max en A4-sida | samma | "Max en A4-sida är en bra längd på ett personligt brev." |
| CV och brev ska komplettera varandra, inte upprepa | samma | "Se till så att cv och personligt brev kompletterar varandra, och att du inte upprepar dig." |

Hämtverktyget återger sidan; copywritern läser själv och kontrollerar varje citat ordagrant. Sidan har inget uppdateringsdatum. Obs: Arbetsförmedlingens egen grön mall har foto i brevet. Vi skriver att **våra** brevmallar saknar foto och att vi avråder, inte att foto i brev är fel enligt någon myndighet.

### 4.2 Produkten (kontrollerat i koden 2026-11-22)

Källor: `src/lib/letters/brevRegler.ts`, `src/lib/letters/brevmall/katalog.ts`, `src/lib/cv/mallar/katalog.ts`, `src/lib/cv/template-antal.ts`, `src/app/api/letters/download/route.ts`, `src/app/api/cv/generate-formatted/route.ts`, produktfacit för brev i `project_faktagranskning_2026_11.md`.

**Får sägas:**

- Personliga brev skrivs i **samma 40 mallar som CV:t**, med samma namn.
- **Linne och Björk är gratis**; de övriga 38 ingår i Premium. Alla mallar går att förhandsvisa med ditt eget brev.
- **Brevet börjar i CV:ts mall** när CV:t är byggt i CV-byggaren och mallen är en du får använda; annars börjar det i Linne. Gränssnittet säger då till exempel "Linne, samma mall som ditt CV." Mallen byts i "Byt mall" eller efteråt under Mallar, utan att brevet skrivs om.
- **Brevmallarna har ingen fotoplats**; mallar som har foto i CV:t visas utan foto för brevet.
- **PDF finns för alla 40 mallar och Word för 26**, både för CV och brev.
- **Nedladdning av brevet, som PDF eller Word, ingår i Premium.** Brevet kan läsas och kopieras gratis.
- Första brevet är gratis, sedan ett per rullande sju dygn utan Premium. Alla brev sparas av sig själva; gratis kan ändra de två senaste.
- Fem toner (Professionell, Entusiastisk, Kreativ, Självsäker, Balanserad), svenska eller engelska. Brevet skrivs mot annonsen som klistras in.
- Typsnittet går att välja bland elva; Helvetica ingår i Premium.
- CV: en gratis nedladdning per konto i Linne eller Björk, som PDF eller Word. Word i de övriga Word-mallarna ingår i Premium.

**Får inte sägas:**

- "Gratis att ladda ner brevet" eller "PDF gratis" om brevet. "PDF för alla" i ägarens underlag betyder att PDF finns för alla 40 mallar, inte att nedladdningen är gratis.
- "41 mallar" eller "3 gratis" (gamla siffror i ett äldre produktfacit) eller "7 brevmallar", "sex mallar" (gamla register som lever kvar på några publika ytor).
- Att brevet "automatiskt anpassas" till en CV-fil som laddats upp: mallen följer bara med från ett CV byggt i CV-byggaren.
- "AI skriver", "AI-brev" eller liknande. Skriv "vi skriver ett utkast utifrån annonsen och ditt CV".
- Priser.

## 5. Interna länkar och kannibalisering

**Kannibalisering, sida för sida:**

| Sida | Vad den äger | Hur den nya artikeln skiljer sig |
|---|---|---|
| `cv-och-personligt-brev` (995 v, p 52,9; får "cv och personligt brev mall" 7 v p 29,1) | innehållet: vad som står var, i vilken ordning man skriver, AI | Den nya tar utseendet och mallen. Hänvisar dit för innehållet. |
| `skillnad-cv-personligt-brev` (311 v, p 25,9) | skillnaden mellan dokumenten | Den nya nämner skillnaden i ett stycke och länkar. |
| `personligt-brev-mall-gratis` (336 v, p 38) | "personligt brev mall gratis", brevets struktur | Den nya handlar om paret, inte om brevmallen ensam. |
| `personligt-brev-mall-word` (343 v, p 19,3) | Word-mallar för brev | Den nya länkar dit i 3.6. |
| `personligt-brev-layout` | brevets typsnitt, marginaler, längd | Den nya länkar dit i 3.4 och upprepar inte reglerna. |
| `/cv-mallar`, `/cv-mallar/word` | galleriet och Word-mallarna | Länkmål för att bläddra. |
| `/verktyg/personligt-brev` | produktsidan för brev | Länkmål för att agera. |

Risken är störst mot `cv-och-personligt-brev`, som har H2 "Testa våra mallar för CV och personligt brev" och redan får några visningar på huvudordet. Rubriken där får stå kvar (grinden), men stycket under den länkar till den nya artikeln. Om Google ändå visar båda för samma fråga i januari tar vi beslutet då.

**In till artikeln:**

| Från | Plats | Ankartext |
|---|---|---|
| `/artiklar/cv-och-personligt-brev` | stycket under H2 "Testa våra mallar för CV och personligt brev" | "CV och personligt brev i samma mall" |
| `/artiklar/skillnad-cv-personligt-brev` | under H2 "Testa våra mallar för CV och personligt brev" | "hur du får CV och brev att matcha" |
| `/artiklar/personligt-brev-layout` | avsnittet om typsnitt eller layoutmallar | "samma typsnitt i CV och brev" |
| `/artiklar/personligt-brev-mall-gratis` | avsnittet "Word, PDF eller online?" | "en mall för både CV och personligt brev" |
| `/artiklar/soka-jobb-via-mail` | avsnittet "Bilagorna: PDF, filnamn och ordning" | "CV och brev i samma mall" |

Bara löptext, inga rubriker. Varje rörd artikel: `LD_UNDANTAG` med `andrade: ["BlogPosting"]`, med i avtrycket före och efter, i en fil `scripts/seo-baslinje/cv-brev-samma-mall-2026-11-22-undantag.json`. `soka-jobb-via-mail` har trafik (2 343 v, p 8,2): en mening, inget annat.

**Ut från artikeln:** `/verktyg/personligt-brev` (agera), `/verktyg/skapa-cv` (bygg CV:t i mallen först), `/cv-mallar`, `/cv-mallar/word`, `/artiklar/cv-och-personligt-brev`, `/artiklar/skillnad-cv-personligt-brev`, `/artiklar/personligt-brev-layout`, `/artiklar/personligt-brev-mall-word`, `/artiklar/bild-i-personligt-brev`, `/artiklar/soka-jobb-via-mail`, `/artiklar/ats-vanligt-cv`. Länka aldrig `/verktyg/cv-mallar` mekaniskt; välj efter avsikt (`reference_internal_link_targets.md`).

## 6. Produkten i artikeln (avgjort, se 10 och 11)

1. **Efter snabbsvaret:** visaren `<CvOchBrevPar />` (saas-lead 10.1). Knappen "Skriv brevet i {mallen}" går till `/skapa-brev/start?mall={id}`, textlänken "Bygg CV:t i {mallen}" till `/cv-mallar/prova?mall={id}`, och länken "Se alla mallar" till `/cv-mallar`. Märkningen för grinden står i 11.4. (Rättelse av min premiss: `InteractiveLetterShowcase` är sedan 21 november ett alias för den nya brevvisaren, men den visar bara brevet och används inte här.)
2. **Produktsidan `/verktyg/personligt-brev`** får två kontextlänkar i löptexten, i 3.3 och 3.7 (11.1).
3. **H2 3.7:** två vägar i löptext, ingen knapp och inget kort (11.2).
4. **Skalet:** hjälteknappen ("Skriv mitt personliga brev" till `/skapa-brev/start`) och kortet efter texten står kvar som i andra brevartiklar. Klustrets inline-kort injiceras inte i den här artikeln (11.2).
5. **FAQ 5 och 6** säger gratis och Premium rakt, så att ingen känner sig lurad i nedladdningssteget.
6. **Exempelpersonens kontaktuppgifter** är desamma i CV- och brevbilderna innan visaren och artikelbilden publiceras (saas-lead 10.2).

## 7. Bilden

Enligt artikelbild-standarden ("På bordet", `scripts/artikelbild/`):

- **Motiv:** ett CV-ark och ett brevark i samma mall bredvid varandra, med samma huvud (påhittat namn, samma accentfärg), brevet utan foto. Gärna Linne, som är gratis. Ämnets färg för brev ur koden.
- **Etikett (2 till 4 ord):** "Samma mall, två ark" eller "CV och brev ihop". Ingen rubrik, inga priser, inga myndighets- eller leverantörsnamn.
- **Text i bilden:** varje läsrad står ordagrant i artikeln (till exempel namnet och en rad ur exempelhuvudet om artikeln visar ett sådant). Copywritern lägger därför in ett exempelhuvud i 3.4 som bilden kan återge.
- **Fil:** `cv-och-personligt-brev-samma-mall-v2.webp`, 1536×1024, högst 120 kB, underlag `docs/qa/artikelbilder/underlag/cv-och-personligt-brev-samma-mall.json`.
- **imageAlt:** "CV och personligt brev i samma mall bredvid varandra, med samma huvud, typsnitt och accentfärg".

## 8. SEO-grinden

Ny artikel: inget att jämföra. Rörda befintliga artiklar enligt avsnitt 5, med `LD_UNDANTAG` per artikel och `LANK_BORTA` bara om grinden visar att Läs vidare-korten tränger undan något. Före push: seoTitle högst 60, description 110 till 158, `faq.length` lika med antalet `<FAQItem>`, noll tankstreck, inga pipe-tabeller, `<table>` balanserade.

## 9. Det jag är osäker på

1. **Volymen är liten**: 93 visningar på 90 dagar över tio varianter. Den växer (74 på 28 dagar) och är köpnära, men artikeln motiveras lika mycket av att produkten nu har funktionen och att `cv-och-personligt-brev` inte tar ordet.
2. **Hur sidospaltmallarna ser ut som brev** har jag inte sett renderat. Copywritern eller art-director kontrollerar en riktig förhandsvisning innan 3.8 beskriver det.
3. **Att rekryteringssystem ofta har separata fält** för CV och brev är bedömning, inte belagt.
4. **Det svenska sökresultatet** har vi inte sett direkt.
5. **Mallantalet** kan ändras i december; skriv det högst en gång i brödtexten.

---

## 10. Saas-leads besked (2026-11-22)

Underlag: koden på main (2ca18b61, samma som live), bilderna i `public/mallar/`.

**1. Beställning, M: en visare som visar CV och brev bredvid varandra i samma mall, `<CvOchBrevPar />`.** Artikelbilden räcker inte. Läsaren har köpavsikt och vill se paret, och en visare där hon byter mall och ser båda arken byta samtidigt är det artikeln lovar, visat i stället för beskrivet.
- Vad den visar: CV-arket och brevarket i samma mall sida vid sida, också på 360 px bredd (arken får vara små, poängen är att huvud, typsnitt och färg syns lika). Under arken: mallens namn, om den är gratis eller Premium, om Word finns, och för mallar med foto raden att brevet inte har någon fotoplats.
- Mallväljare: åtta mallar som miniatyrer. Linne och Björk först, sedan två ur var och en av familjerna i 3.8 (en spalt, sidospalt, marginal, konstnärlig) ur `familj` i `src/lib/cv/mallar/katalog.ts`. Sist en länk "Se alla mallar" till `/cv-mallar`. Då kan 3.8 hänvisa till visaren när den beskriver hur en sidospaltsmall blir som brev.
- Handlingar: knappen "Skriv brevet i {mallen}" till `/skapa-brev/start?mall={id}` och textlänken "Bygg CV:t i {mallen}" till `/cv-mallar/prova?mall={id}`. Båda adresserna tar `mall` i dag: startflödet prövar id:t mot alla 40, och när utkastet hämtas till kontot skrivs brevet i mallen (en Premiummall öppnas som provad i Mallar). Provsidan förväljer mallen.
- Fotrad med sanningen: Linne och Björk är gratis för både CV och brev, och att ladda ner brevet ingår i Premium. Copywritern skriver slutlig text.
- Bygger på: bilderna `public/mallar/v2/{id}-stor.webp` (CV) och `public/mallar/brev/{id}.webp` (brev), som finns för alla 40, och mönstret i `MallVisningCv` (`src/components/artiklar/MallVisningar.tsx`) och `BrevVisare` (`src/components/publikt/brevvisare/`): miniatyrerna, svepet, första vyn i HTML utan JavaScript och händelserna `mallvisning_visad` och `mallvisning_mall_bytt` (med `typ: 'par'`). Bilder och inte iframes: brevrutten `/api/public/exempel/brev` ritar bara fem mallar, och två iframes per mall är för tungt på mobil.
- Ramar: inga h2 eller h3 i komponenten (grinden), reserverad höjd så att CLS är 0, bilderna lazy, 44 px på allt som trycks, minst 12 px text, inga priser. Formen tar art-director ur de två befintliga visarna; bygget görs av Opus.
- Om SEO:s premiss: `InteractiveLetterShowcase` visar inte längre de gamla brevmallarna. Sedan 21 november är den ett alias för `BrevMallVisning` (`src/app/(public)/artiklar/[slug]/page.tsx`, rad 526), den nya brevvisaren med fem mallar. Den visar ändå bara brevet, så slutsatsen står: den används inte här.

**2. Beställning, S, krav före visaren och artikelbilden: exempelpersonen har olika kontaktuppgifter i CV och brev.** CV-bilderna (ur `SHOWCASE_CV` i `src/lib/cv/showcase-exempel.ts`) har 073-456 78 90 och erik.lindberg@email.se. Brevbilderna (ur `EXEMPEL_AVSANDARE` i `src/lib/letters/brevmall/exempel.ts`) har 070-123 45 67 och erik.lindberg@exempel.se. I en artikel vars vanligaste miss är "gammal e-post i det ena" hade vårt eget par visat just den missen.
- Rättning: `EXEMPEL_AVSANDARE` får telefon och e-post ur `SHOWCASE_CV`, de 40 brevbilderna ritas om med `scripts/brevmallar-miniatyrer.ts`, och brevruttens tester körs. CV-bilderna rörs inte, de används på många sidor.
- CV-huvudet har också en LinkedIn-rad som brevhuvudet saknar. Artikeln påstår därför inte att huvudena är identiska rad för rad, bara samma namn, uppställning, telefon och e-post. Artikelbilden i avsnitt 7 använder samma huvud.

**3. Placering: enig med SEO.** Visaren står direkt efter snabbsvaret. Svaret säger "samma huvud, typsnitt och färg", visaren visar det.
- Krav: inget inline-kort injiceras i den här artikeln. Taggarna ger klustret `letter`, och då läggs kortet "Skriv det personliga brevet på annonsen, inte på mallen" in efter andra stycket. Det säger emot artikelns ämne och vore ett andra säljblock två stycken efter visaren. Injektionen i `injectClusterCta` hoppar över artikeln när visaren finns, på samma sätt som `ersatterProvkort` gör för proven.
- Hjälteknappen ("Skriv mitt personliga brev" till `/skapa-brev/start`) och kortet efter texten står kvar som för andra brevartiklar.

**4. Första handlingen: här går jag delvis emot SEO.** Enig om riktningen: brevet, inte `/cv-mallar`. Men knappen i visaren leder direkt till `/skapa-brev/start?mall={id}`, inte till `/verktyg/personligt-brev`.
- Skäl: produktsidans egen huvudknapp leder till `/skapa-brev/start` utan mall. Att gå via den kostar ett klick och tappar mallen läsaren just valt. Direktlänken börjar brevet i rätt mall.
- Förslag SEO kan godta: `/verktyg/personligt-brev` är länken i löptexten i 3.7, med SEO:s ankare, så att produktsidan får sin interna länk. `/skapa-brev/start` är noindex men följs, precis som i reklamkorten i dag.

**5. Avsnitt 3.7: ingen knapp med texten "Skriv brevet i samma mall som ditt CV".** Den är inte sann för de flesta läsare. Brevet börjar i CV:ts mall bara när CV:t är byggt i CV-byggaren och mallen är en man får använda (`startmallForBrev` i `src/lib/letters/brevRegler.ts`: gratis får Linne och Björk, annars blir det Linne). En läsare utan konto har inget CV hos oss.
- Avsnittet beskriver därför två vägar i löptext: har du byggt CV:t hos oss börjar brevet i samma mall; har du inget CV hos oss väljer du mall, skriver brevet och bygger sedan CV:t i samma mall. Länkarna är `/verktyg/personligt-brev` och `/verktyg/skapa-cv`, som SEO föreslår. Ingen egen knapp: visaren och kortet efter texten bär handlingen.
- En uppladdad CV-fil styr inte brevets mall. Det står inte i artikeln att den gör det.

**6. Gratis och Premium i texten, kontrollerat i koden.**
- Gratis: Linne och Björk för både CV och brev, första brevet och sedan ett per rullande sju dygn, att läsa och kopiera brevet, en CV-nedladdning per konto i Linne eller Björk som PDF eller Word.
- Premium: de övriga 38 mallarna, nedladdning av brevet som PDF eller Word (`letter_download`, 402 utan Premium i `src/app/api/letters/download/route.ts`), Helvetica.
- FAQ 5 och 6 säger detta rakt, som SEO föreslår, och visarens fotrad säger samma sak. Inga priser.

**7. Bilden: enig**, med kravet i punkt 2 om samma kontaktuppgifter.

**8. Senare, inte nu:** när visaren har mätts kan den ersätta brevvisaren under H2 "Testa våra mallar för CV och personligt brev" i `cv-och-personligt-brev`. Det beslutet tas efter avläsningen.

**9. Ordning.** Punkt 2 före punkt 1, och artikeln publiceras tillsammans med visaren. Copywritern kan skriva parallellt.

**10. Mätning.** Från push: `mallvisning_visad` och `mallvisning_mall_bytt` med `typ: 'par'`, klick på visarens två handlingar, `draft_claimed` med `template` för brev som börjat från artikeln, och `paywall_shown` vid nedladdning av brevet för de kontona. Avläsning fyra veckor efter push: andel visningar som byter mall, andel som klickar "Skriv brevet", och hur många av dem som når betalväggen för nedladdning.

## 11. SEO:s slutbesked (2026-11-22)

Det här beskedet gäller före allt annat i briefen. Där det ändrar något högre upp är det redan ändrat där (3.1, 3.3, 3.7, 3.8 och 6), så copywritern skriver efter briefen som den står.

### 11.1 Första handlingen: saas-leads lösning gäller, med två villkor

Visarens knapp går direkt till `/skapa-brev/start?mall={id}`. Saas-lead har rätt i att en omväg via produktsidan kostar ett klick och tappar mallen läsaren just valt.

Jag tittade på vad det gör med länkkraften till produktsidan. `/skapa-brev/start` har `noindex` men länkarna följs. Den ligger redan länkad från alla 152 artiklar genom reklamen och tar inga sökord. Länkkraften till `/verktyg/personligt-brev` (320 visningar, position 24,5 på 90 dagar) kommer från länkar i löptext med ankartext, inte från en knapp i en visare. Därför gäller:

1. **`/verktyg/personligt-brev` får två länkar i löptexten**, båda med beskrivande ankare:
   - I 3.3: "skriva det personliga brevet i samma mall som CV:t". Den kommer tidigt i texten och väger mest.
   - I 3.7: "skriva personligt brev hos oss".

   En länk i fotnoten eller i skalet räcker inte.
2. **Bara den första vyn av visaren står i HTML:en**, alltså en enda `?mall=`-adress, och den ska vara Linne. Adresserna för de andra mallarna byggs i klienten när läsaren byter mall. Då får sökmotorn inte åtta varianter av en sida med `noindex` att följa. Grinden räknar `/skapa-brev/start?mall=linne` som ett eget länkmål, men det är en ny artikel och därför ett nytt mål, och det fäller ingenting.

`/cv-mallar/prova?mall={id}` har `noindex` och `follow` (`src/app/(public)/cv-mallar/prova/page.tsx`). Samma regel gäller där: i HTML:en står bara adressen för den första vyn.

### 11.2 Ingen knapp i 3.7 och inget injicerat brevkort: godkänt

Knappen "Skriv brevet i samma mall som ditt CV" hade inte varit sann för en läsare utan CV hos oss. Två säljblock inom ett par stycken är ett avbrott. Inline-kortet säger dessutom "skriv på annonsen, inte på mallen" i en artikel om mallen. Hjälteknappen och kortet efter texten finns kvar.

Grinden påverkas bara på ett sätt: skippa-regeln i `injectClusterCta` får gälla enbart artiklar som har `<CvOchBrevPar />`. Inga befintliga artiklar ändras. `scripts/audit-cta-clusters.ts` körs och ska visa ändring bara för den här sluggen.

### 11.3 H2 i 3.7 byter text

Den nya rubriken är "Så får du CV och brev i samma mall hos oss". Den gamla, "Så skriver du brevet i samma mall som CV:t hos oss", lovade det som 11.2 stryker. Artikeln är ny, så ingen undantagsrad behövs.

### 11.4 Hur `<CvOchBrevPar />` märks för grinden

- **Inga h1 till h6 inuti.** Mallens namn, raden om gratis eller Premium, raden om Word och fotraden skrivs som `p`, `span` eller `strong`.
- **Inte `aria-hidden`.** Visaren är innehåll som läsaren använder. Texterna i den räknas och ska vara sanna (4.2).
- **Ytterst en `figure`** med en `figcaption` som innehåller mallens namn, eller en `div role="group"` med `aria-label="CV och personligt brev i samma mall"`.
- **Ingen bild i visaren får ligga före artikelbilden** i HTML:en. Visaren står efter snabbsvaret, och artikelbilden är det första i innehållet (`CustomImage` med `priority`). Visarens bilder har aldrig `priority` och laddas lazy, så att de inte tävlar om LCP.
- **Alt-texter:** arken heter "CV i mallen {namn}" och "Personligt brev i mallen {namn}". Miniatyrerna i mallväljaren har `alt=""`, och deras knappar har `aria-label="Visa {namn}"`.
- **Bara Linne står i HTML:en från början.** Övriga mallar i väljaren visas som miniatyrer med namn. Ingen text som rankar göms bakom ett klick.
- **Ingen iframe.** Reserverad höjd ger CLS 0.

### 11.5 Exempelpersonens kontaktuppgifter

Jag håller med saas-lead om att 10.2 är ett krav före publicering. Artikeln och bilden påstår bara att namn, uppställning, telefon och e-post är samma i CV:t och brevet. De påstår inte att huvudena är lika rad för rad, eftersom CV:t har en LinkedIn-rad som brevet saknar.

### 11.6 Övrigt

Jag är enig i saas-leads punkter 6 till 10. Det som står i 10.8 om att ersätta brevvisaren i `cv-och-personligt-brev` tar vi efter avläsningen. Den artikeln ligger utanför grindens undantag i den här omgången.
