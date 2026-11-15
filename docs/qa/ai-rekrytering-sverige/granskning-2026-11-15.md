# Granskning: /artiklar/ai-rekrytering-sverige (2026-11-15)

Omskrivning till dagens artikelstandard plus rättning av hydreringsfel #418. Slugen behållen.

## Hydreringsfelet (#418)
Orsak: MDX-blocket "Lyssna på Sveriges Radios reportage" hade text på egen rad inne i `<p>` och `<a>`. MDX gjorde texten till ett eget stycke, så servern skrev `<p class="text-sm ..."><p>…</p></p>`. Webbläsaren stänger den yttre p-taggen vid den inre, DOM:en skiljer sig från React-trädet och hydreringen fäller (#418, args HTML). Blocket är borttaget i omskrivningen. Skanning av alla 155 artiklar (live och lokalt bygge) efter block i `<p>` och `<a>` i `<a>`: bara den här artikeln hade felet.

## SEO-strateg (roll: .claude/agents/seo-content-strategist-se.md)
Omgång 1: UNDERKÄND. Två H2 var inte frågor, FAQ och rubriker krockade med ats-vanligt-cv, saknade länkar till AI-skrivartiklarna, förslag om fördelar/risker-avsnitt (SERP-lucka), "automatiserad rekrytering" saknades, ankartexten i jobbcoach-online var gammal.
Omgång 2: GODKÄND. Alla H2 frågor, FAQ 6/6 identiska, seoTitle 50, description 140, 17 interna länkmål finns, ingen krock med ats-vanligt-cv.

## Copywriter (svensk-ux-copywriter)
Omgång 1: UNDERKÄND. Siffergröt i statistikavsnittet (data som bild), mejlexemplet lät som en myndighetsmall, CV-exemplet var översatt engelska.
Omgång 2: GODKÄND villkorat (motsägelse om storstadslänen).
Omgång 3: GODKÄND.

## Faktagranskning (general-purpose)
Omgång 1: UNDERKÄND på formuleringar som sa mer än källan (Teamtailors ettårsgräns, Sats/Ramirent, AF:s "kompetenser", FAQ om informationsplikt enligt art. 13/14, Varbi/Visma utan källa, "var fjärde" mot 28 %, Jobbland-urvalet). Alla siffror, datum och citat i övrigt verifierade mot källan.
Omgång 2: UNDERKÄND på ett sakfel ("storstadslänen ligger högst", Västra Götaland och Skåne ligger lägst).
Omgång 3: GODKÄND.

## Struket ur den gamla texten (gick inte att belägga eller var fel)
- Citatet från "Jesper Olsson, TRR" i Sveriges Radio: finns inte i SR:s text. SR-artikeln är från 9 oktober 2025, inte 9 januari.
- "Över 70 % sorteras bort automatiskt (SR)": finns inte hos SR. 75 %-siffran är en känd myt (The Conversation 2026, Preptel 2012) och tas nu upp som myt.
- Fallstudien "Sara ökade sina chanser med 340 %" och de tre "exemplen från verkligheten": utan källa, struket. Exemplen i texten är nu tydligt konstruerade CV-exempel.
- Teamtailor "uppemot 10 000 svenska kundbolag" (rätt: 13 000+ företag globalt).
- Workday hos Ericsson och H&M, Greenhouse hos Klarna och Spotify: fel (Eightfold, SmartRecruiters, Deel, Lever). Bara ABB/Workday stämde.
- Böter 35 milj/7 % för högriskbrott (rätt: 15 milj/3 %; 35/7 gäller förbjudna metoder).
- Experis-siffrorna daterade till 2023; Remote 27 % och 82 % hålls isär.
- "Exakta träffar, inte synonymer" som generell regel.

## Grind
tsc och `npm run build` gröna. SEO-diff mot live: 0 fel med undantag i scripts/seo-baslinje/ai-rekrytering-sverige-2026-11-15-undantag.json. perf:publikt 3 körningar: LCP 680–700 ms, CLS 0, inom budget. Klicktest i Chrome (Pixel 7 och 1280, ljust och mörkt): inga konsolfel, inget #418, ingen sidledsrullning, bilden laddar, 49 interna länkar svarar, CTA till /verktyg/cv-analys fungerar.

Fynd i klicktestet, rättat i src/components/publikt/innehall/innehall.css: CVExample (95 artiklar) hade mörk text på mörk botten i mörkt läge, och rutor med bg-orange-50 (3 artiklar) blev ljus text på ljus botten. Båda följer nu tokens.
