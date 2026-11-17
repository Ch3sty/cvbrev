# CV-klustret i sök, 17 november 2026

Fullständig rapport: `seo-cv-kluster-2026-11-17.pdf` (HTML-källa bredvid). SEO-strategen.

**När funktionerna gick live:** Word-export för CV 15 nov (37d3095b), spärren borttagen och ATS-ordningen rättad 16 nov (ab14ede4), nya mallsystemet med 20 mallar 16 nov (ce8c2bc9), /verktyg/cv-mallar till /cv-mallar 16 nov (09bf5c72), CV-byggaren "Direkt på arket" 16 nov (f039f965). 40 mallar ligger på feat/mallar-2, inte pushat. Search Console har data till 14 nov, så inget av det nya är mätt. Rapporten mäter hur sidorna runt produkten låg i sök när den släpptes.

## Fynd

1. CV-klustret har 43 827 visningar på 90 dagar (24 % av sajten) men bara 304 klick (CTR 0,69 %, sajten 1,32 %).
2. "cv mall" och varianterna: 155 frågor, 3 557 visningar, 1 klick. /cv-mallar ligger på plats 23 till 38; Google visar oftast cv-mall-gratis-guide på plats 60 till 80 (2 534 visningar, 0 klick).
3. Alla 74 yrkessidor /cv-mallar/[yrke] har en tvilling i /cv-exempel/[yrke]. Båda syns på 168 frågor med 6 020 visningar.
4. /verktyg/skapa-cv (1 393 visningar, plats 39, 3 konton av 15 sessioner) och online-cv-byggare-gratis beskriver fortfarande den gamla byggaren i "sju steg".
5. online-cv-byggare-gratis och cv-profil-sammanfattning är "URL is unknown to Google" trots sitemap och interna länkar.
6. 410 sessioner landade på CV-artiklar på 90 dagar och en gick vidare till /cv-mallar. 24 av 44 CV-artiklar saknar textlänk till /cv-mallar, 16 saknar länk till byggaren. Mallkomponenten finns i alla 44.
7. CV-klustret ger 13 av 86 nya konton från de landningar PostHog ser (1,7 per 100 sessioner, övriga artiklar 1,4).
8. Sedan 16 nov: 8 nya riktiga konton och 2 riktiga nedladdningar (Linne PDF, Björk Word). Mellan 25 sep och 2 nov laddades inga CV ner alls.
9. Katalogen på grenen: 40 mallar, 2 gratis, 26 med Word, 15 med foto (inte 13).
10. Ord där vi saknar sida: Word-mallar (cirka 330 visningar, plats 20 till 79), enkla mallar (203, plats 69 till 78), mallar med bild, engelska CV-mallar (252, plats 17 till 23; kräver en engelsk rubrikuppsättning först).

## Topp tio i ordning

1. /verktyg/skapa-cv: nya byggaren, uppladdning och Jobbcoachens tre gratisförslag i title, ingress, löften, FAQ och HowTo (M, före 22 nov).
2. online-cv-byggare-gratis utan "sju steg" + indexering i Search Console (S).
3. Textlänkar till /cv-mallar och byggaren i 12 + 16 artiklar (S, MDX).
4. skapa-cv-med-ai säljer Jobbcoachens punkter (S, MDX).
5. cv-mall-gratis-guide in i /cv-mallar med 301 (M, ägarens ja).
6. /cv-mallar/word med 26 Word-mallar, 301 från cv-mall-word-gratis (M, 1 dec).
7. Yrkessidornas titlar rättade (inget tankstreck, inget "Professionell Mall" på exemplen) och pilot där fem par slås ihop (S).
8. /cv-mallar/enkla och /cv-mallar/foto (M, december).
9. Hubbens länkar till guiderna, /exempel släpper mallorden (S).
10. Titlar och beskrivningar på plats 5 till 9 och "cv engelska mall" till rätt artikel (S, MDX).

**Takten** 6 till 10 sidor i månaden står kvar. December: tre av sidorna till CV-klustret (Word, enkla, foto). Uppdateringarna går före nya sidor. Inga fler yrkessidor förrän paren slutat krocka.

## Behöver ägarens beslut

- 301 av cv-mall-gratis-guide till /cv-mallar och av cv-mall-word-gratis (och cv-mall-pdf-gratis) till /cv-mallar/word.
- Indexeringsbegäran i Search Console för online-cv-byggare-gratis och cv-profil-sammanfattning, sedan /cv-mallar och /verktyg/skapa-cv efter push.
- Lagringstexten på /verktyg/skapa-cv ("utkastet ligger i webbläsaren") stämmer inte med nya byggaren som sparar per blad. Text om datalagring, ändras inte utan ditt besked.
- Push av feat/mallar-2 före A1.

**Avläsning:** 8 december (byggarsidan, artikel till mall, indexering, CTR), 12 januari (huvudord, stilsidor, yrkespiloten), 14 december (/verktyg/cv-mallar ur index).
