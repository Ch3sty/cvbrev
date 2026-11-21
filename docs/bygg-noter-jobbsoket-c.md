# Byggnoter: Jobbsöket omgång 1, etapp 2C (byggare C)

Gren `feat/jobbsoket-c`, arbetskopia `jobb-c`, 2026-11-21. Inför intervjun (alla underrutter), Arbetsstil, Jobbcoachen, Bli upptäckt, Meddelanden och borttagen introduktionssida, i rummets form (kitet i `src/components/jobb3/kit`).

## Vad som byggdes

| Rutt | Vy | Not |
|---|---|---|
| `/dashboard/intervju` | `src/components/jobb3/intervju/IntervjuHubb.tsx` | Skissen Intervju och Mobil-intervju. Väggen: närmaste bokade intervju ur `hamtaIntervjuerPaGang` (annars "Inför intervjun"), de sju frågorna som `FrageBana` med senaste betyget per fråga, primärknappen är dagens Nästa handling (`valjHubbHandling`). Panelen: nästa fråga med vit knapp och förra svaret del för del (STAR-brickor för STAR-frågor, annars en mening om vad som saknades). Golvet: Intervjuer på gång (bara när det finns några), Dina intervjuprov (tomt läge utan prov), personlighetsprofilen i tre lägen, och gratisnivåns kvotrad (dagens KVOT-texter, bara utan `interview_unlimited`). Mätningen (`InforIntervjunClient`) är oförändrad. |
| `/dashboard/intervju/ny` | `src/components/jobb3/intervju/SvarFlode.tsx` | Skissen Intervju-svar. Två steg som förut. Med `?fraga=` öppnas svaret direkt, utan (eller med `?steg=fraga`) frågevalet. Samma API (`/api/public/intervjuprov`), samma felvägar och texter (för kort, för långt, irrelevant, serverfel, nätfel, kvot 429/503 med `useBetalvaggVisad`), samma mätning (`interview_practice_started`/`_completed`, surface dashboard) och samma historikhantering (`useFlodeshistorik`, `avslutaFlodet`). |
| `/dashboard/intervju/[token]` | `src/components/jobb3/intervju/BedomtVy.tsx` | Skissen Intervju-bedomt. Betyget som prickar, "upp från N av 5" bara när ett äldre prov på samma fråga finns, det rekryteraren hörde (STAR-delarna, eller återkopplingens rubriker för andra frågor), fungerar och saknas, omskrivet svar med hakparenteser, hela återkopplingen och svaret som det skrevs hopfällda, nästa fråga och den bokade intervjun. Claim-logiken är dagens. |
| `/dashboard/intervju/profil/[token]` | sidan själv | Väggen med tillbakalänk i stället för RumHuvud; innehållet oförändrat. `data-cta` på knappen behålls. |
| `/dashboard/intervju/saknas`, `not-found` | `IntervjuSaknas.tsx` | Dagens SAKNAS-texter i väggen och panelen. |
| `/dashboard/jobbcoachen` | `src/components/jobb3/coach/CoachVy.tsx`, `CoachSvar.tsx` | Skissen Jobbcoachen. Samtalet, strömningen, källorna (fotnoter och källrad), "Kopiera svaret", dokumentdelningen (dagens `DocumentSelector`) och 402-spärren (dagens `PaywallCard variant="chatt"` i `SparrRam`) är dagens. Frågor utifrån läget ur `hamtaCoachForslag`; ett tryck lägger frågan i fältet, inget skickas förrän Skicka. Kvoten som prickar från servern (`checkChatQuota`). "Nytt samtal" tömmer samtalet och glömmer samtalets id. |
| `/dashboard/bli-upptackt` | `BliUpptacktClient.tsx` (kvar i rutten) | Skissen Upptackt och Upptackt-fore. Logik, sparning, samtyckesdialogen och alla kort är dagens; korten ritas som steg i panelen "Bygg din profil" genom `StegKontext` i `SectionCard`. Strömbrytaren i väggen ersätter MasterHeader. Väggen visar antal rekryterare som sett profilen (bara när synlig och fler än noll) och en väntande förfrågan med "Öppna förfrågan". |
| `/dashboard/meddelanden` | `src/components/jobb3/meddelanden/MeddelandenVy.tsx` | Skissen Meddelanden. Dagens MessageHub-logik (val, ?interest=, optimistiskt svar med återställning). Accepterade samtal i dagens `ConversationThread`. |
| `/dashboard/arbetsstil` | `ArbetsstilClient.tsx` | Väggen med tillbakalänk och panelen; innehåll och funktion oförändrade. |
| `/dashboard/introduktion` | sidan | `permanentRedirect('/dashboard')`. Inga länkar till den fanns kvar i koden. |

CSS: `src/app/jobb3-c.css` (prefix `j3c-`, rummets tokens), importerad i `src/app/dashboard/layout.tsx` direkt efter `jobb3.css`.

Borttaget (ersatt): `intervju/ny/NyttProvFlow.tsx`, `intervju/components/{ProvRad,ProfilPanel,SaknasVy}.tsx`, `jobbcoachen/JobbcoachenClient.tsx` och `jobbcoachen/components/*`, `components/jobbcoachen/{ChatInput,MessageBubble,TypingIndicator}.tsx`, `components/interests/{MessageHub,ConversationList,ConversationListItem,PendingRequestPanel}.tsx`, `bli-upptackt/components/{MasterHeader,PendingInterestAlert,MessagesShortcut}.tsx`. `Intervjuprov.tsx` (artiklarna) står kvar; dess flödesläge används inte längre av inloggat.

## Ändringar utanför mitt område

- `src/app/dashboard/DashboardShell.tsx`: `/dashboard/intervju/ny` borttagen ur `FLOW_ROUTES` (svaret står nu i rummet med väggen och dörrnavet, som skissen). En rad.
- `src/app/dashboard/layout.tsx`: importen av `jobb3-c.css`.
- Inget i kitet eller motorn är ändrat.

## Egna beslut

1. **Långa frågor kortas i väggen** på svarssidan: över 40 tecken blir rubriken "Berätta om {bestämd form}" ("Berätta om ett problem du löste", som skissen); hela frågan står då först i ingressen.
2. **Frågor utan STAR** (beratta, styrkor, varfor_vi, varfor_jobbet, misstag): väggen visar tre delar rekryteraren lyssnar efter (tagna ur frågans tipsrad, `DELAR` i `intervju/text.ts`) på svarssidan, och återkopplingens rubriker på det bedömda svaret. "Så blir svaret starkt" visar frågans tipsrad.
3. **STAR-del som saknades** markeras bara när det som saknades är en STAR-del: `resultatet` ger R, `jag-formen` ger A. Andra saknade delar (exemplet, planen) markerar ingen bricka.
4. **Förra svaret** på svarssidan läser "Det som saknas" ur förra provets rad (egen fråga med kontroll av claimed_by/user_id i sidan).
5. **"Upp från"** visas bara när betyget faktiskt gått upp; annars "förra gången N av 5" utan pil.
6. **Inför intervjun utan bokad intervju**: rubriken är "Inför intervjun" och ingressen dagens SIDA-text; ögonbrynet "Sju frågor som nästan alltid kommer" utan övade, annars "Tre av sju frågor övade".
7. **Jobbcoachens förslag**: skissens text "Tryck på en, så står den i fältet" följs; frågan skickas först när användaren trycker Skicka (F9). Utan sökta tjänster visas dagens fasta förslag under rubriken "Förslag".
8. **Jobbcoachens kvot** syns från början (serverns räkning med samma admin-klient som chattrutten). Spärren visas som förut först efter ett 402, så att PaywallCards mätning är oförändrad.
9. **Bli upptäckt före samtycket**: listorna "Det här visas" och "Det här visas aldrig" är samtyckesdialogens egna listor, ordagrant (flyttade till `bli-upptackt/components/delas.ts`). Skissens listor användes inte: de säger "Poängen från dina tester" visas aldrig, medan dagens samtycke säger "Verifierade testresultat med percentiler" visas. Texter om samtycke ändras inte utan ägaren.
10. **Bli upptäckt, stegen**: CV valt, synlighet på, villkor (samma regel som ProfileStrengthCard: tillträde, region och arbetsplats), pitch, Söker mig till (bara när det finns förslag), verifierade resultat (något test eller personlighetstestet gjort). Rubriken "N av M steg klara".
11. **Meddelanden**: tillbakalänken går till Bli upptäckt som skissen. Avböjda förfrågningar kan fortfarande accepteras (som i dag). Texten om vad som delas när man accepterar är dagens, ordagrant, i en notis. Knappen heter "Acceptera" som förut, eftersom notisens text säger "Accepterar du ...".
12. **Telefonens tillbakaknapp i meddelandena** ("Alla meddelanden") gäller under 1280 px; dagens tråd hade sin under 1024, vilket lämnade 1024 till 1279 utan väg tillbaka.

## Avvikelser från skissen, med skäl

- Taggen "Nytt i flödet" är inte byggd (beslut efter etapp 1).
- Skissens påhittade innehåll (personlighetsfaktorernas nivåer, rekryterarens meddelande, "8 år i yrket", tolv avatarer) visas bara som det som finns lagrat. Rutnätet med tolv personer på Bli upptäckts vägg är inte byggt; talet står ensamt.
- "Det här har rekryteraren sett av dig" i Meddelanden är inte byggt: det finns ingen lagrad uppgift om vad en enskild rekryterare såg.
- Personlighetsprofilen visar alla fem faktorer i dagens ordning (störst avvikelse först) med bandorden ur `faktorUtfall`, och arketypen (eller smakprovets rubrik) i stället för skissens mening "På intervjun: räkna med frågor om ...".
- Raden under banan på telefon ("Nästa: ... Resultatet saknades förra gången.") visas bara på dator (kitets `Knapprad`).

## Testdata

På Premium-QA-kontot, genom appens API och UI (id i `scratchpad/jobbsok/bygg/c/testdata.json`):
- Två intervjuprov: `star` (token f7d26f6e-…, 3 av 5, resultatet saknades) och `beratta` (token 43417d95-…, 3 av 5). Två AI-anrop.
- Samtycket i Bli upptäckt givet genom dialogen, synligheten sedan avslagen igen. Kontot ligger alltså inte i kandidatpoolen.

## Det som inte är prövat

- Meddelanden med riktiga förfrågningar och samtal: QA-kontona har inga (kräver ett rekryterarkonto). Bara det tomma läget är sett.
- "Upp från" på det bedömda svaret: kräver ett andra prov på samma fråga (ett AI-anrop till), inte gjort.
- Kvotspärren i svarsflödet (429) och Jobbcoachens 402-spärr är inte framkallade.
- Ett skickat meddelande i Jobbcoachen (AI-anrop) är inte gjort; strömningen och källraden är dagens kod omskriven, inte prövad skarpt.
- Frågevalet och svaret är inte klicktestade hela vägen (bedömningen gjordes via API:et).
- En varning om hydrering (attribut som inte matchar) syntes två gånger i dev på Bli upptäckt och en gång på Inför intervjun (gratis), men gick inte att framkalla igen. Inte utrett.
- Inget fullt bygge, ingen perf.

## Hur man backar

`git revert` på grenens commit. Det återställer de borttagna komponenterna, FlowShell för `/dashboard/intervju/ny` och introduktionssidan. Testdatan: proven kan stå kvar; samtycket nollställs per rad om förläget behövs.
