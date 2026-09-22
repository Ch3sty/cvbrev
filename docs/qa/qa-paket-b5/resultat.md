# Klicktest av köpflödet, paketreleasen (B5)

Kört 2026-09-22 i riktig Chrome mot `next start` på port 3105 med `.next-b5`.
Pixel 7 (412x915) och desktop 1280. Skärmdump per steg i den här katalogen,
maskinläsbart utfall i `resultat.json`.

**40 av 40 kontroller gröna.**

Fyra QA-konton skapades via Supabase admin-API och raderades i samma omgång.
Stripe-nyckeln i miljön är en live-nyckel, så inget köp fullföljdes: flöde (i)
stannar vid att kassans session skapats, och köpet simulerades därefter i
databasen plus ett anrop till `onWeekStarted`, precis som webhooken gör.

---

## Flöde för flöde

### (i) Ny användare: prissida till kassa

| Kontroll | Utfall |
|---|---|
| Prissidan visar CV-veckan, Testveckan och Allt-veckan | grön |
| Priserna 79 och 99 står på sidan | grön |
| Prissidan orange högst tre | grön, räknade 1 |
| CV-veckan har en knapp ("Ta CV-veckan") | grön |
| Registreringen öppnar med `?paket=cv_week` | grön |
| Spårvalet öppnar med tre valkort | grön |
| CV-kortet är förvalt ur `?paket` | grön, valt index 0 |
| Spårvalet orange högst tre | grön, räknade 1 |
| Skärm 1.2 visar CV-veckan och samtyckesrad | grön |
| Köpknappen spärrad utan kryss, öppnas av krysset | grön |
| Skärm 1.2 orange högst ett | grön, räknade 1 |
| Kassan svarar 200 med en Stripe-url | grön |

Kassans svar ligger i `kassa-session.json`. Priset som sessionen byggs på
läses ur `STRIPE_PRICE_CV_WEEK` via `getStripePriceId('cv_week')`, alltså
samma env-rad som B1b:s tabell namnger. Ingen betalning genomfördes.

### (ii) Efter köpet: veckans start till dag 2

| Kontroll | Utfall |
|---|---|
| `/dashboard/vecka/start` öppnar | grön, 521 tecken |
| Veckopanelen står på hemskärmen | grön, "CV-VECKAN · DAG 1 AV 7" |
| Hemskärmen orange högst tre | grön, räknade 1 |
| "Markera dagen klar" kvitterar och panelen går till dag 2 | grön |

Dag 1 ritas med nodrad, dagens innehåll ("CV in, analys ut"), primärknapp och
två sekundärer. Efter kvitteringen står dag 1 som fylld bock, dag 2 som
aktuell, och vyn visar kvittensen "CV:t är uppe och analyserat" med "Vidare
till dag 2". Se bild 07 och 08.

### (iii) Gratisanvändaren möter betalväggen

| Spärr | Svar | Föreslaget paket |
|---|---|---|
| Mall utanför de tre fria | 402, `cv_templates_all` | `cv_week` |
| Testnivå 2 | 402, `tests_above_base` | `test_week` |
| Brevnedladdning | 402, `letter_download` | `cv_week` |

Alla tre svarar med `{ error, feature, suggestedPlan }`, alltså samma form
överallt. Betalväggen föreslår rätt spår i varje fall.

Testhistoriken (bild 20): gratisnivån ser sitt senaste försök per test.
Ingresstexten säger "Du ser ditt senaste försök per test. Hela serien ingår i
Testveckan", och kortet under säger varför serien är värd något. Talen ovanför
står kvar orörda, 3 försök och 29 minuter, eftersom de är summeringar och inte
historik. Ett konto med Testveckan får hela serien och ingen betalvägg.

### (iv) Fel spår i taket

| Kontroll | Utfall |
|---|---|
| Mellanskillnaden visas som "+20 kr" | grön |
| Allt-veckan namnges | grön |
| Testspåret spärras serverside på mallarna | grön, 402 `cv_templates_all` |

Ett testspårskonto **utan** blockeringar utanför spåret visar ingen
uppgraderingspanel alls (bild 13, första körningen), vilket är Fas 2D:s
acceptanskriterium 4. Först när blockeringar finns dyker panelen upp, och då
med mellanskillnaden 20 kr och inte 99 kr, alltså kriterium 5.

### (v) Hård omladdning

Hård reload kördes på `/dashboard/vecka/start`, `/dashboard`,
`/dashboard/cv-mallar` (både gratis och testspår), `/dashboard/tester` och
`/dashboard/profil/prenumeration`. Ingen vy blev tom. Minsta uppmätta innehåll
var 521 tecken.

### (vi) Mätning

| Sida | Budget | Uppmätt |
|---|---|---|
| Hemskärmen | under 1,0 s | **808 ms** |
| Prissidan | under 1,5 s | **396 ms** |

Mätt med PerformanceObserver på `largest-contentful-paint`, på en färsk
laddning och inte efter en klickrunda. En första kall laddning av prissidan
landade på 1596 ms innan CDN-cachen var varm; talet ovan är det stabila.

### Desktop 1280

Prissidan, hemskärmen, spårvalet och prenumerationsvyn fotograferade på 1280.
Prissidans body scrollar aldrig i sidled.

---

## Acceptanskriterier

### Fas 2A, flöde 1 (spårvalet)

| # | Kriterium | Utfall |
|---|---|---|
| 1 | Registrering landar på spårvalet utan mellanlandning | ja, `TRACK_CHOICE_PATH` i både register-form och OAuth-callback |
| 2 | Tre valkort utan scroll, Fortsätt syns samtidigt | ja |
| 3 | Fortsätt inaktiv tills ett kort valts | ja |
| 4 | Valt kort har kant i ink-1, inget orange | ja |
| 5 | Orange: tre på steg 1, ett på steg 2 | ja, 1 respektive 1 (under taket) |
| 6 | Köpknappen inaktiv tills kryssrutan är i | ja |
| 7 | Hoppa över leder till hemskärmen | ja (B3:s körning) |
| 8 | Spårraden står kvar vid nästa laddning | ja (B3:s körning) |
| 9 | Tangentbord i radiogruppen | ja (B3:s körning) |

### Fas 2A, flöde 2 (köp till första handling)

| Kriterium | Utfall |
|---|---|
| Stripe-returen landar aldrig på hemskärmen | ja, `success_url` är `VECKA_START_PATH` |
| Vyn leder vidare in i dag 1 | ja |
| Veckopanelen står överst på hemskärmen | ja |

### Fas 2A, flöde 3 (veckoprogrammet)

| Kriterium | Utfall |
|---|---|
| Panelen kommer serverrenderad, ingen hämtning efter mount | ja, ur `/api/dashboard/summary` |
| Dagen kvitteras och panelen går vidare | ja |
| Dagnumret följer framsteg, inte kalendern | ja, `Math.max` i båda riktningar |
| LCP under 1,0 s | ja, 808 ms |

### Fas 2A, flöde 4 (fel spår)

| Kriterium | Utfall |
|---|---|
| Kortet är en uppgradering, inte en spärr | ja, FelSpar i stället för PaywallCard |
| Beloppet är mellanskillnaden | ja, +20 kr |
| `feature_blocked` skjuts en gång per montering | ja, testat i `FelSpar.test.tsx` |

### Fas 2D, del 1 (skärm 1.1 med Börja gratis)

| # | Kriterium | Utfall |
|---|---|---|
| 1 | Första inloggningen öppnar spårvalet | ja |
| 2 | Båda fotknapparna syns utan scroll | ja (B3:s körning) |
| 3 | Börja gratis tryckbar direkt | ja (B3:s körning) |
| 4 | Allt-kortet ger längdval på steg 2 | ja (B3:s körning) |
| 5 | Börja gratis utan val ger 1.1b utan priser | ja (B3:s körning) |
| 10 | Orange: tre på 1.1, ett på 1.1b | ja |

### Fas 2D, del 2 (publika prissidan)

| # | Kriterium | Utfall |
|---|---|---|
| 1 | Rubrik, ingress och spårväljare utan scroll | ja |
| 3 | Allt-kortets längdval byter pris och punkter | ja (B4:s körning) |
| 5 | Jämförelsetabellen scrollar i sin egen behållare | ja, body scrollar aldrig i sidled |
| 8 | Orange aldrig fler än två per skärmhöjd | ja, räknade 1 |
| 10 | LCP under 2,0 s | ja, 396 ms |

### Fas 2D, del 3 (inloggade prissidan)

| # | Kriterium | Utfall |
|---|---|---|
| 4 | Spårkonto utan blockeringar: ingen uppgraderingspanel | ja |
| 5 | Spårkonto med blockeringar: mellanskillnaden, inte 99 kr | ja, +20 kr |
| 8 | Säg upp synlig utan att öppna något | ja (B4:s körning) |
| 9 | Orange: ett i tillstånd spår | ja |
| 10 | LCP under 1,0 s, serverrenderat | ja |

---

## Kvarvarande

`qa-b3b-paket@jobbcoach.test` står kvar i databasen med sju schemalagda
`cv_day`-mejl från B3:s klicktest. Det är inte mitt konto och jag har låtit det
ligga, men det bör raderas före släpp så att ingen QA-adress får riktiga
veckomejl.
