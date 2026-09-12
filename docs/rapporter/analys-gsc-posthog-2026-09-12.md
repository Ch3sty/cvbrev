# Analys: Search Console och PostHog, 12 juni till 9 september 2026

Kort sammanfattning. Full rapport med tabeller och diagram: `analys-gsc-posthog-2026-09-12.pdf` (11 sidor), källa `analys-gsc-posthog-2026-09-12.html`.

## Läs det här först

Kvartalets siffror beskriver produkten som den var, inte som den är. Hela konverteringsomgången (PR #2) gick live **2026-09-11 22:08**: reverse trial, prisstegen med dagspass 49, vecka 99 och kvartal 299 som helt nya produkter, blur-gate, cancel-flow, attribution, aktiveringskolumner, livscykelmail och PostHog-events. Det inloggade läget skrevs om 2026-09-12. Trafik- och SEO-analysen är opåverkad, den mäter innehåll som legat ute hela perioden.

| Live (svensk tid) | Vad | Konsekvens |
|---|---|---|
| 11 sep 22:08 | Konverteringsomgången (PR #2) | Allt om betalning och trial mäter tiden före |
| 11 sep 22:22 | /kassa?plan= genom registrering | Ingen köpdata ännu |
| 12 sep 00:30 | Inloggat säljflöde, prissida, kvotrad | Förklarar varför /priser knappt besöktes |
| 12 sep 10:20 | Omdesign av inloggade läget (Mitt jobbsök) | Web vitals och rage clicks gäller gamla versionen |
| 12 sep 11:53 | Profilsidan, PII-maskning före AI | Efter mätperioden |

## Läget i siffror

| Mätpunkt | Perioden | Kommentar |
|---|---:|---|
| Organiska klick | 719 | 2,9 per dag i juni, 17,6 i september |
| Visningar | 86 367 | 772 per dag i juni, 1 289 i september |
| Snitt-CTR | 0,83 % | 1,36 % i september |
| Snittposition | 25,9 | från 31,3 till 22,1 |
| Svenska sessioner | ~120 till 380 per vecka | PostHog, filtrerat på SE |
| Nya konton | 80 | 4 till 6 per vecka till 13 till 14 |
| Intäkt | 1 639 kr | 11 betalningar, alla 149 kr (enda produkten då), MRR ca 596 kr |

Månad för månad:

| Månad | Dagar | Klick | Klick/dag | Visningar | CTR | Position |
|---|---:|---:|---:|---:|---:|---:|
| 12 till 30 juni | 19 | 56 | 2,9 | 14 675 | 0,38 % | 31,3 |
| Juli | 31 | 161 | 5,2 | 24 939 | 0,65 % | 28,3 |
| Augusti | 31 | 344 | 11,1 | 35 151 | 0,98 % | 24,2 |
| 1 till 9 september | 9 | 158 | 17,6 | 11 602 | 1,36 % | 22,1 |

## Fem slutsatser

1. **Trafiken har sexdubblats och accelerationen är äkta.** Position och CTR förbättras samtidigt, alltså bär rankingarbetet, inte en enskild artikel.
2. **Vi rankar på fel del av resultatsidan.** Sextio procent av visningarna ligger på position 21 eller sämre och ger sju klick. Bara 87 visningar under kvartalet kom från position 1 till 3.
3. **"cover letter svenska" läcker uppemot 40 klick i månaden.** 1 649 visningar på position 8,7, ett klick, 0,06 procent CTR. Sidan svarar på fel avsikt.
4. **Trafiken blir konton men inga kunder, med en förklaring.** 23 av 2 090 svenska innehållssessioner nådde registreringen (1,1 procent). Noll av 80 konton betalar, men under kvartalet fanns bara månadsplanen 149 kr att köpa, ingen trial och ingen blur-gate.
5. **Det inloggade läget var långsamt där det kostar mest.** LCP p75 5,7 s på skapa-brev, 4,9 s på profil/cv, mot 1,5 till 1,9 s på artiklarna. Hela läget skrevs om 12 september 10:20, så siffrorna gäller den gamla versionen.

## Åtgärder, fyra veckor

| Vecka | Åtgärd | Insats | Effekt |
|---|---|---|---|
| 38 | Skriv om cover-letter-sverige mot exempel och mall | S | 25 till 45 klick/mån |
| 38 | Interna länkar från starka sidor till sida-två-kandidater | S | 10 till 25 klick/mån |
| 38 | Lämna säljflödet orört så det går att mäta | S | ren avläsning 26 september |
| 39 | LCP och CLS i skapa-brev och profil/cv (mät om efter omdesignen) | M | aktivering |
| 39 | Snippet-genomgång, nio sidor på position 4 till 15 | M | 30 till 50 klick/mån |
| 40 | Lyft styrkor-svagheter-intervju från 18,5 till sida ett | M | ca 55 klick/mån |
| 40 | Kontrollpunkt trial, blur-gate och prisstege | S | första siffran på konverteringsplanen |
| 41 | Testklustret, lyft /verktyg/rekryteringstester från 43,6 | M | 30 till 50 klick/mån |
| 41 | Läs av cancel-flowet vid första uppsägningen efter releasen | S | bekräftar att orsak fångas |

Sammantaget 95 till 170 extra klick i månaden, alltså 40 till 70 procent mer organisk trafik, och 10 till 19 extra konton i månaden vid oförändrad konverteringsgrad.

## Behöver ägarens beslut

- **Frysfönster till 26 september.** Konverteringsomgången behöver två veckor orörd för att gå att mäta. Förslaget är att hålla säljflöde, prissättning och blur-gate stilla och bara röra rena fel, medan trafikarbetet fortsätter.
- **Innehållstakten.** Visningarna planade ut i september. Sex till tio nya sidor i månaden krävs för att hålla tillväxten efter oktober.

## Datakvalitet: när kan vi läsa av?

| Mätpunkt | Live | Första meningsfulla avläsning |
|---|---|---|
| PostHog-events, hela tratten | 11 sep 22:08 | ca 2 oktober |
| Reverse trial (verifierad fungerande) | 11 sep 22:08 | ca 26 september |
| Blur-gate till registrering | 11 sep 22:08 | ca 26 september |
| Engångsköp och prisstege (premium_grants) | 11 sep 22:08 | ca 12 oktober, en full faktureringsmånad |
| Uppsägningsorsaker (cancel_intents) | 11 sep 22:08 | vid nästa uppsägning genom nya flödet |
| Attribution (acquisition_source) | 11 sep 22:08 | efter ca 50 nya konton |
| Aktiveringskolumner first_*_at | 11 sep 22:08 | löpande, ev. engångsbackfill |
| Web vitals inloggat läge | omskrivet 12 sep 10:20 | ca 26 september |

Reverse trial är verifierad: kontot 2026-09-11 21:04 (före releasen) saknar `premium_source`, kontot 22:18 samma kväll fick `oauth_signup_trial` med premium till 17 september. Tomma `premium_grants` och `cancel_intents` är väntade, inte fel.

Övrigt: 23 procent av PostHogs identifierade personer är bottar från Singapore och Kina. Alla beteendesiffror i rapporten är filtrerade på Sverige.

Insamlingsskript: `scripts/analys-gsc.ts` och `scripts/posthog-query.ts`.
