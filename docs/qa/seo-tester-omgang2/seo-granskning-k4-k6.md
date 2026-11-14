# SEO-granskning av K4 till K6

SEO-strategen, 2026-11-14. Granskat mot `seo-forslag-k4-k6.md`: arbetskopians diff (37 filer, ej committat), SEO-diffen `docs/qa/seo-diff/huvudord-diff-2026-11-14.md` och undantagen i `scripts/seo-baslinje/huvudord-2026-11-undantag.json`.

**Utlåtande: godkänt med två villkor före push** (se sist).

## De fem avvikelserna

| # | Avvikelse | Beslut | Kommentar |
|---|---|---|---|
| 1 | H2 "Se kompletta exempel för 30+ yrken" i personligt-brev-exempel-generella står kvar | Godkänt | 30+ är sant. Diffrapporten är tagen före återställningen och visar fortfarande 2 fel (rubrik och ankaret `#se-kompletta-exempel-for-30-yrken`). Ta om efter-avtrycket. |
| 2 | Talen i FAQ-svaren rättade till 89, med LD_UNDANTAG | Godkänt | Frågorna är oförändrade. Synliga `<FAQItem>` och frontmatter har samma text. |
| 3 | F8: märkningen läser `isTemplateFree`, mappningen och yrkessidornas FAQ orörda | Godkänt | Rätt avgränsning. Skicka till saas-lead som ett ärende: (a) FAQ-svaren "gratis-versionen" och "Vilken är bäst, gratismallen eller mallen i Premium?" på de 51 yrkessidor där första mallen ingår i Premium. (b) Nytt fynd: metadata i `cv-mallar/[yrke]/page.tsx` har talstreck och lovar "gratis nedladdning" och "Gratis och premium-version" på alla 74 sidor. Title på 74 sidor ändras inte under frysen. Det tas efter 30 nov, med saas-lead. |
| 4 | H2 "Yrkesmallar — för ditt specifika yrke" blir "Yrkesmallar för ditt specifika yrke" | Godkänt | Diffen tar det som omritad yta på /cv-mallar ("borta 3, nya 3", tillåtet). Ta med det i bygget och lägg till ett RUBRIK_BYTT-undantag med datum och skäl "talstreck", så att skälet finns med. |
| 5 | K5 läser `getPostBySlug` ur lib/blog | Godkänt | Samma läsning som artikelsidan. Blocket och FAQ-frågan syns inte på grenen i dag, vilket är rätt. Bygg en gång med de tre MDX-filerna kopierade in (inte committade) och ta en skärmdump av blocket med tre kort och FAQ-frågan med länk. Ta sedan bort filerna. |

## Övrigt i diffen

- **Titlar, H1, description och ItemList** på de fem målsidorna och på /exempel följer förslaget ordagrant, med talen ur konstanterna. Godkänt.
- **Snabbsvaret på /cv-mallar** är kontrollerat mot `generate-formatted`. Ett gratiskonto får en nedladdning med en gratismall (`FREE_CV_EXPORTS`, efter featurekontrollen), så sista meningen står kvar. En småsak som inte stoppar push: "Alla tre är märkta" är hårdkodat medan namnen läses ur registret. Skriv `De är alla märkta ATS-säkra, ...` så att texten inte blir fel om antalet ändras.
- **Länkarna från stödsidorna (K4 b)** står där förslaget säger, med rätt ankartext. Inga hrefs har försvunnit. Godkänt.
- **Brödsmulan på yrkessidorna** har fyra nivåer och följer den synliga. Godkänt.
- **K6** (situationsraden, flyttad ingress, guidens H2, FAQ med `lank`) följer förslaget. Godkänt. På 412 px måste raden "Din situation" och branschfiltret bryta utan sidledsrullning. Kontrollera det i skärmdumparna innan du committar.

## Villkor före push

1. Ta om efter-avtrycket och kör SEO-diffen igen. Den ska ge **Fel: 0**.
2. RUBRIK_BYTT-undantaget för H2:n på /cv-mallar (punkt 4) ska ligga i undantagsfilen.

Ärendet till saas-lead (punkt 3) stoppar inte push.
