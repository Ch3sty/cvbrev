# Analys: Search Console och PostHog, 12 juni till 9 september 2026

Kort sammanfattning. Full rapport med tabeller och diagram: `analys-gsc-posthog-2026-09-12.pdf` (9 sidor), källa `analys-gsc-posthog-2026-09-12.html`.

## Läget i siffror

| Mätpunkt | Perioden | Kommentar |
|---|---:|---|
| Organiska klick | 719 | 2,9 per dag i juni, 17,6 i september |
| Visningar | 86 367 | 772 per dag i juni, 1 289 i september |
| Snitt-CTR | 0,83 % | 1,36 % i september |
| Snittposition | 25,9 | från 31,3 till 22,1 |
| Svenska sessioner | ~120 till 380 per vecka | PostHog, filtrerat på SE |
| Nya konton | 80 | 4 till 6 per vecka till 13 till 14 |
| Betalande av dessa | 0 | av 80 konton |
| Intäkt | 1 639 kr | 11 betalningar, alla 149 kr, MRR ca 596 kr |

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
4. **Trafiken blir konton men inga kunder.** 23 av 2 090 svenska innehållssessioner nådde registreringen (1,1 procent). Noll av kvartalets 80 konton betalar.
5. **Inloggat läge är långsamt där det kostar mest.** LCP p75 5,7 s på skapa-brev, 4,9 s på profil/cv, mot 1,5 till 1,9 s på artiklarna. Rage clicks samlas på /dashboard/skapa-cv.

## Åtgärder, fyra veckor

| Vecka | Åtgärd | Insats | Effekt |
|---|---|---|---|
| 38 | Skriv om cover-letter-sverige mot exempel och mall | S | 25 till 45 klick/mån |
| 38 | Interna länkar från starka sidor till sida-två-kandidater | S | 10 till 25 klick/mån |
| 38 | Verifiera att reverse trial faktiskt sätts (1 av 80 konton har premium_source) | S | avgör om prisstegen testas |
| 39 | LCP och CLS i skapa-brev och profil/cv | M | aktivering |
| 39 | Snippet-genomgång, nio sidor på position 4 till 15 | M | 30 till 50 klick/mån |
| 40 | Lyft styrkor-svagheter-intervju från 18,5 till sida ett | M | ca 55 klick/mån |
| 40 | Mät blur-gaten, två veckors data efter 11 september | S | första siffran på konverteringsplanen |
| 41 | Testklustret, lyft /verktyg/rekryteringstester från 43,6 | M | 30 till 50 klick/mån |
| 41 | Uppsägningsorsaker, cancel_intents är tom trots sju uppsägningar | S | mål: alla med känd orsak |

Sammantaget 95 till 170 extra klick i månaden, alltså 40 till 70 procent mer organisk trafik, och 10 till 19 extra konton i månaden vid oförändrad konverteringsgrad.

## Behöver ägarens beslut

- Om reverse trial inte sätts i dag: rätta i produktion den här veckan, eller vänta till blur-gaten mätts? Rekommendation är att rätta direkt.
- Innehållstakten. Visningarna planade ut i september. Sex till tio nya sidor i månaden krävs för att hålla tillväxten efter oktober.

## Datakvalitet

- Egna events (article_viewed, signup_gate_shown, pricing_viewed, trial_started, subscription_paid) började logga 11 september. 25 händelser totalt. Första användbara mätning omkring 2 oktober.
- `profiles.first_cv_uploaded_at`, `first_letter_created_at`, `first_cv_analyzed_at` är null för alla 80 konton i perioden. Aktivering här är räknad mot cv_texts, letters, job_applications, cv_analysis_jobs och logic_test_v4_sessions.
- `profiles.acquisition_source` fylls inte. Vi kan inte koppla kluster till betalande kunder.
- `cancel_intents` och `premium_grants` är tomma.
- 23 procent av PostHogs identifierade personer är bottar från Singapore och Kina. Alla beteendesiffror i rapporten är filtrerade på Sverige.

Insamlingsskript: `scripts/analys-gsc.ts` och `scripts/posthog-query.ts`.
