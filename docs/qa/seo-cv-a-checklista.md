# Checklista spår A: artiklarna i SEO-svepet för CV-klustret, 2026-11-17

Gren `feat/seo-cv-a`. Underlag i prioritetsordning: `docs/plan-seo-cv-kluster-2026-11-17-saas-lead.md` (produkt), `docs/plan-seo-cv-kluster-2026-11-17-salj.md` (sälj), `docs/plan-seo-cv-kluster-2026-11-17.md` (SEO-spec, avsnitt 1 och grindkraven i 4). Spår B (kod, sidor, 308:or) byggs på `feat/seo-cv-b`; länkmålen /cv-mallar/word, /foto och /enkla finns först när grenarna slås ihop.

Bockas av när punkten är gjord och kontrollerad.

## Facit (kontrollerat i koden 2026-11-17)

- [x] 40 mallar, 2 gratis (Linne, Björk), 26 med Word (24 utöver gratismallarna), 15 med fotoplats, 17 i en spalt
- [x] Jobbcoachen: 3 förslag per konto gratis (`FREE_CV_BYGG_AI_PER_ACCOUNT`), 30 per dygn i Premium (`PAID_CV_BYGG_AI_PER_DAY`)
- [x] Gratisfil: en nedladdning per konto, PDF eller Word, i Linne eller Björk
- [x] Byggaren: "Vilket jobb söker du?", två vägar (ladda upp PDF eller Word, även LinkedIn-PDF / skriv från början), arket är byggaren, grå exempeltext följer inte med, "Skriv punkter åt mig", "Fler avsnitt: intyg, projekt, intressen" (`src/app/dashboard/skapa-cv/texter.ts`)
- [x] Ordningsvalen "Intyg först" och "Utbildning först" finns i alla mallar och i byggaren (Mallyta, Verktygsrad, `VAL_ARK`)
- [x] Sidantalet visas vid uppladdning (`sidantal_visat` i Mallyta.tsx)
- [x] "Skriv egen rubrik" finns (RubrikArk.tsx), tolv svenska rubrikuppsättningar, ingen engelsk (P2)
- [x] PDF:en är A4 (`pdf-kedja.ts`)

## A1 online-cv-byggare-gratis

- [ ] Snabbsvaret: sista meningen ordagrant enligt specen
- [ ] "Så fungerar vår CV-byggare": stycket "Här är vår egen modell" omskrivet i specens ordning, högst 170 ord, ingen ny mening om var utkastet sparas
- [ ] Nästa stycke: meningarna om "sista steget" och "granskningssteget" (gamla flödet) borta, inget nytt om lagring
- [ ] Sakfel: "de 18 övriga mallarna" blir 38 (40 minus 2)
- [ ] FAQ "Vad ingår gratis ...": första satsen bytt, resten ordagrant, frontmatter och FAQItem lika
- [ ] Länkar: CV-mallar i Word → /cv-mallar/word, våra CV-mallar → /cv-mallar, gratis CV-mallar → /cv-mallar, meningen om uppladdning till /cv-mallar#ladda-upp
- [ ] `grep "sju steg\|7 steg"` ger 0

## A2 skapa-cv-med-ai

- [ ] "Snabbaste vägen": stycket omskrivet (högst 130 ord), Jobbcoachens punkter, 3 per konto, 30 per dygn, uppladdning, de två länkarna ordagrant sist
- [ ] FAQ "Är det gratis att skapa CV med AI?": tillägget, frontmatter och FAQItem lika
- [ ] Länken till /cv-mallar#ladda-upp sist i "Så skapar du ett CV med AI, steg för steg"
- [ ] Metadata oförändrad

## A3 textlänkar (en mening per rad, exakt ankartext)

- [ ] ljuga-i-cv
- [ ] skriva-cv-guide
- [ ] ats-vanligt-cv (Formatet)
- [ ] ats-vanligt-cv (Testa innan du skickar)
- [ ] datorkunskaper-cv
- [ ] cv-exempel-student-nyexaminerad
- [ ] sprak-i-cv
- [ ] fardigheter-kompetenser-cv
- [ ] ladda-upp-cv-linkedin
- [ ] nyckelord-i-cv
- [ ] exempel-pa-kompetenser-lista
- [ ] utbildning-i-cv
- [ ] hur-langt-ska-ett-cv-vara
- [ ] handlingsord-cv
- [ ] cv-innehall-struktur
- [ ] europass-cv
- [ ] prestationer-utmarkelser-cv
- [ ] hobbyer-intressen-cv, korrekturlasa-cv, ledarskapsformagor-cv (utan byggarlänk, länkar redan dit), arbetslivserfarenhet-cv, tidshantering-cv
- [ ] cv-pa-engelska-resume, cv-format-kronologiskt-funktionellt

## A4 de tre sammanslagna artiklarna

- [ ] `git rm` cv-mall-word-gratis, cv-mall-gratis-guide, cv-mall-pdf-gratis (bilderna ligger kvar)
- [ ] cv-och-personligt-brev, hur-skriver-man-cv, online-cv-byggare-gratis, skillnad-cv-personligt-brev → /cv-mallar
- [ ] online-cv-byggare-gratis, skriva-cv-guide → /cv-mallar/word ("CV-mallar i Word")
- [ ] online-cv-byggare-gratis, skriva-cv-guide, soka-jobb-via-mail → /cv-mallar ("CV-mallar att ladda ner som PDF")
- [ ] `grep -rn` i content och src träffar bara MallarHubGuideSection.tsx (spår B) och next.config.ts

## A5 titlar och beskrivningar

- [ ] ljuga-i-cv, meritforteckning-eller-cv, datorkunskaper-cv, nyckelord-i-cv, ladda-upp-cv-linkedin: seoTitle och description enligt tabellen, längder mätta, varje påstående finns i artikeln
- [ ] Bara raderna seoTitle och description ändrade i de fem (git diff-kontroll; artiklar som också fick A3-mening räknas för sig)

## A6 engelska CV

- [ ] cv-pa-engelska-resume: description enligt specen, seoTitle oförändrad, "Mallar och verktyg": svenska rubrikuppsättningar, egen rubrik per avsnitt, länken "CV-mallarna", inget löfte om engelska uppsättningar, A4-sakfelet rättat
- [ ] personligt-brev-pa-engelska: meningen efter första stycket, taggar utan "cv" (kontrollerat: inga)

## A7 mindre fynd

- [ ] cv-mall-word-gratis tas bort i samma push, så "ytterligare tio" bortfaller
- [ ] `grep "sju steg\|7 steg\|41 mallar\|tjugo mallar\|20 mallar\|bara som PDF\|endast PDF"` ger 0 om CV-produkten

## A8 länkar till stilsidorna

- [ ] ats-vanligt-cv FAQ PDF eller Word (frontmatter utan länk, FAQItem med länk)
- [ ] skriva-cv-guide (CV-mallar i Word, ersätter Word-artikeln)
- [ ] cv-bild-guide (avsnittet om layout eller mall)
- [ ] bild-i-cv-ja-eller-nej (sista H2 före FAQ)
- [ ] hur-ska-ett-cv-se-ut (avsnittet om layout)
- [ ] cv-utan-erfarenhet (sista H2 före FAQ)
- [ ] cv-exempel-student-nyexaminerad (efter A3-meningen)

## Gemensamt

- [ ] `updated: "2026-11-17"` i varje artikel med ändrad brödtext
- [ ] FAQ i frontmatter och FAQItem lika många och ordagrant samma frågor i alla rörda artiklar
- [ ] 0 tankstreck (U+2014, U+2013) i ändrade rader, 0 Sparkles
- [ ] Inga pipe-tabeller
- [ ] Bildunderlag (`docs/qa/artikelbilder/underlag/<slug>.json`) citerar ingen ändrad rad, annars ny bild
- [ ] Slop-check på ny text: vi-form, varierad meningslängd, inga AI-fraser
- [ ] Inga texter om datalagring, GDPR, policy eller villkor ändrade

## Grind

- [ ] `npx tsc --noEmit`
- [ ] Berörda vitest
- [ ] Metadatakontroll (seoTitle högst 60, description 110 till 158), FAQ-paritet, döda interna länkar, inga länkar till de borttagna artiklarna
- [ ] SEO-diff fel 0 med undantagen i `scripts/seo-baslinje/seo-cv-kluster-2026-11-17-artiklar-undantag.json`
- [ ] `next build`
