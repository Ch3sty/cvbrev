# Byggnoter: brevrummet, omgång 1

## Kitet (etapp 1, gren feat/brev-rummet-c)

**Byggt.** Gränssnittets grund enligt BYGGSPEC avsnitt 6: `src/app/brev3.css` (klasser `b3-*`, tokens under `[data-rum="brev"]` i ljust och mörkt) och komponenterna i `src/components/brev3/kit/`. Vyerna importerar från `@/components/brev3/kit` och skriver ingen egen CSS (layout mellan delarna får göras med Tailwind).

**Nya filer.**
- `src/app/brev3.css`, importerad i `src/app/dashboard/layout.tsx` (en rad) och i förhandsvisningen.
- `src/components/brev3/kit/`: `BrevVagg.tsx` (BrevVagg, BrevFlikar, VaggArk), `BrevBana.tsx`, `ArkBunt.tsx`, `delar.tsx` (StorKnapp, VitKnapp, Bricka, LitenKnapp, Chip, Tagg, MatarBricka, Formatmarken, Pips, KravBitar), `LyftPanel.tsx` (Golv, LyftPanel, PanelHuvud, SektionsHuvud), `Matare.tsx` (MattRutnat, Matare, KravMitt, LangdMitt, MallMitt), `Kort.tsx` (Radkort, JobbKort, JobbRutnat, BrevKort, BrevRemsa, NyttBrevKort), `Arbete.tsx` (ArbetsYta, ArbetsHuvud, MallKapsel, Avsnittsrad, Blad), `BrevSparr.tsx` + `BrevSparrLaddare.tsx`, `veckoremsa.ts` (+ test), `ikoner.tsx`, `index.ts`.
- `src/app/brev3-kit/page.tsx` + `ForhandsKlient.tsx`: förhandsvisning på `/brev3-kit`, 404 i produktion, utanför det inloggade skalet med `data-rum="brev"`. `?tema=mork|ljus`, `?sparr=nedladdning|vecka`.

**Beslut.**
- Brytpunkten är 1280 px (xl), samma som testernas omgång 3. Spärren byter till dialog vid 1060 px (den är 1020 px bred).
- Brevets väg tar `BrevSteg` ur kontraktet (`steg` = aktuell, `klara`). Datorns platser är Mains koordinater i alla lägen; Hem-ny ritar samma väg 20 px längre åt höger, det följer inte med.
- Klara "läs igenom" heter "läst igenom" (som Skickat-1440). Skickat som aktuell plats ritas som den stora punkten under flaggan (inte ritat i skissen).
- Bladets innehåll som Skriv och Brevet delar fick klasser utan komponent: `b3-kr`, `b3-saknas`, `b3-annons`, `b3-kravchips`, `b3-ton`, `b3-seg`, `b3-skrivbricka`, `b3-lop`, `b3-sokt-ik`, `b3-premium-rad`. Valda knappar markeras med `aria-pressed="true"`.
- `BrevSparr` ärver PaywallCard:s logik (copy, kampanjpris, mätning, spårkund, påminnelse). Skissens tre punkter, PDF/Word/Utan tak och veckoremsan står i komponenten. "Kopiera texten i stället" anropar `onKopiera` och stänger.

**Återstår / för nästa etapp.**
- `NyttBrevKort` står sist i remsan på dator men under remsan på telefonen: rendera den två gånger med `hidden xl:contents` / `xl:hidden` (se förhandsvisningen).
- Bladets fot på telefonen (Ladda ner PDF överst, två knappar under) byggs av vyn; Blad ger bara ramen.
- `returTill` skickas oförändrad till `kopstegHref`; kassan godtar i dag bara vissa returadresser, mallar-byggaren behöver stämma av det.

**Backa.** Ta bort importen i `src/app/dashboard/layout.tsx`, `src/app/brev3.css`, `src/components/brev3/kit/` och `src/app/brev3-kit/`. Inget annat rörs.
