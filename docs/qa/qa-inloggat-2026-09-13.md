# QA inloggat läge, 2026-09-13

Genomgång av hela det inloggade läget i riktig Chrome, inte i kod och inte i
emulering på skrivbordet. Bakgrunden är två fel som ägaren hittade och som
ingen agent fångade, just för att allt tidigare verifierats genom att läsa
koden.

**Bygge:** `next build` på main efter e35b4de5, serverad med `next start` mot
riktiga `.env.local`.
**Emulering:** Pixel 7, 375 x 812, touch. Desktop 1280 px för header och
sidomeny.
**Profiler:**

| Profil | Konto | Läge |
|---|---|---|
| A | christiankarlssson@gmail.com (`ccb52d89-12dd-4cf4-b487-7b6d1731e201`) | fullt med data, Premium |
| B | qa-20260913-0836@jobbcoach.ai (`26f74ad2-8270-4e4a-a176-4b4224be6a36`) | helt nytt konto, gratis, inget CV |

Ett tidigare testkonto skapades i en första körning och kan raderas med:
`qa-20260913-0803@jobbcoach.ai` (`bbf4967b-104d-468a-a8df-b1a48b1b0b7c`).

Skärmdumpar ligger i scratchpad under `qa/`, namngivna
`<profil>-<sida>-<steg>.png`.

---

## De två rapporterade felen

### 1. Fortsätt-knappen i brevflödet: bekräftat, och bara delvis åtgärdat av e35b4de5

FlowShell blev ett fast helskärmslager i e35b4de5, och det var rätt men inte
tillräckligt. Knappen låg efter den fixen i viewporten, och ett test som bara
frågar "syns elementet" svarade ja. Den gick ändå inte att trycka på.

Två fasta element låg ovanpå den:

| Element | z-index | Yta (vh 812) |
|---|---|---|
| Cookie-bannern | 999 | 686–812 |
| Bottennavet | 40 | 755–812 |

Fortsätt-knappen ligger på 756–800. Den var alltså helt täckt. Mätt med
`document.elementFromPoint` på knappens mittpunkt: träffen gick till
cookie-bannern, inte till knappen.

Bottennavet var det mest förrädiska. FlowShell nollar `--bottom-nav-h` och
sätter `data-flow-active`, så all kod som *räknar* på navets höjd trodde att
navet var borta. Men själva `<nav>`-elementet renderades kvar, fixed på z-40.
Variabeln var nollad, elementet fanns.

Cookie-bannern slår till i varje ny session, alltså exakt i förstagångsläget.

**Åtgärdat.** Efter fixen är knappen nåbar på varje steg:

```
NÅBAR   /dashboard/skapa-brev          knapp "Fortsätt"     top=756 bottom=800
NÅBAR   /dashboard/skapa-brev?steg=2   knapp "Fortsätt"     top=756 bottom=800
NÅBAR   /dashboard/skapa-brev?steg=3   knapp "Fortsätt"     top=756 bottom=800
NÅBAR   /dashboard/skapa-cv            knapp "Nästa steg"   top=704 bottom=748
```

Hela flödet klickat igenom som användare, steg 1 till 5, med CV-val och
inklistrad annons. Stoppat före generering eftersom den kostar:

```
steg 1: 1/6  "Fortsätt"          spärrad=true   nåbar=true   (väljer CV)
steg 2: 2/6  "Fortsätt"          spärrad=true   nåbar=true   (klistrar in annons)
steg 3: 3/6  "Fortsätt"          spärrad=false  nåbar=true
steg 4: 4/6  "Fortsätt"          spärrad=false  nåbar=true
steg 5: 5/6  "Skapa mitt brev"   spärrad=false  nåbar=true
```

Inga konsolfel, inga 4xx eller 5xx under flödet.

### 2. Header saknades i inkognito: gick inte att återskapa

Headern renderades på **varje** sida, för båda profilerna, på mobil och på
desktop. Hamburgermeny, hälsning, notisklocka och profilmeny fanns i samtliga
21 uppmätta steg per profil, även på ett konto som var sekunder gammalt.

Det inloggade skalet är sedan tidigare en server component som verifierar
sessionen innan något renderas, och headern ligger utan villkor i
`DashboardShell`. Det finns ingen kodväg där den kan utebli för en inloggad
användare.

Under arbetet dök symptomet ändå upp en gång, och orsaken är värd att notera:
när HTML refererade JS-chunkar som inte fanns på disk svarade servern 500 på
dem, och då stannade sidan i skelettläge med skelett kvar efter tre sekunder.
Det hände för att jag byggde om medan servern körde. På ett rent bygge
försvann det helt, och alla chunkar svarade 200.

Det liknar det ägaren såg tillräckligt mycket för att vara värt en kontroll:
**om en deploy byter chunk-hashar medan en användare har sidan öppen, eller om
en CDN serverar gammal HTML mot nya chunkar, får användaren precis det här.**
Ett tomt skal utan header. Det är inte ett fel i header-koden utan i
utrullningen, och det är där det ska letas om ägaren ser det igen.

---

## Genomgång per sida

`h1` räknas i tillgänglighetsträdet, alltså som en skärmläsare ser det.

### Profil A, mobil

| Sida | Status | Noteringar |
|---|---|---|
| dashboard | OK | header, hälsning, klocka, profilmeny, bottennav |
| skapa-brev | OK | flödesskal, fot nåbar |
| skapa-cv | OK | dubbel h1 åtgärdad |
| cv-analys | OK | steg 0 är en hero med egen CTA, ingen fot enligt design |
| cv-mallar | OK | dubbel h1 åtgärdad |
| mina-brev | OK | |
| sokta-tjanster | OK | filterraden scrollar i sidled med flit |
| tester | OK | |
| tester/matrislogik-grund | OK | |
| bli-upptackt | OK | |
| profil | OK | autospara verifierad mot databasen |
| prenumeration | OK | jämförelsetabellen scrollar i sidled med flit |
| profil/cv | OK | |
| meddelanden | OK | h1 åtgärdad |
| jobbmatchning | OK | |
| jobbcoachen | OK | h1 åtgärdad |
| linkedin-optimizer | OK | steg 0 utan fot enligt design |
| arbetsstil | OK | |

### Profil A, desktop 1280

| Sida | Status |
|---|---|
| dashboard | OK, sidomeny och header syns |
| skapa-brev | OK, flödet ligger till höger om sidomenyn |
| sokta-tjanster | OK |

### Profil B, nytt konto

| Sida | Status | Noteringar |
|---|---|---|
| dashboard | OK | tillstånd A, CV-uppladdning syns, header komplett |
| skapa-brev steg 1 | OK | tomt läge: "Inga CV:n hittades" med "Ladda upp CV", foten förklarar varför Fortsätt är spärrad |
| tester | OK | testsession skapas, fråga 1 av 15 renderas |
| prenumeration | OK | |
| övriga | OK | samma som profil A |

Inga konsolfel och inga 4xx eller 5xx på ett rent bygge, för någon profil.

---

## Åtgärdat

Allt ligger på arbetsträdet, inget är committat.

| Fil | Vad |
|---|---|
| `src/app/globals.css` | Döljer bottennavet under flöden (`html[data-flow-active] nav[aria-label="Huvudnavigation"]`). Flyttar cookie-bannern ovanför flödesfoten i stället för att dölja den, så samtycket fortfarande går att lämna. |
| `src/components/shell/FlowShell.tsx` | Publicerar fotens verkliga höjd som `--flow-footer-h` via `ResizeObserver`, så bannern hamnar rätt även när foten får en blockeringsrad eller sekundär handling. |
| `src/app/dashboard/page.tsx` | `sr-only` h1 i tillstånd C. Dashboarden var rubriklös för skärmläsare, på den sida användaren möter oftast. |
| `src/app/dashboard/skapa-cv/components/SkapaCvHero.tsx` | Heron var h1 samtidigt som FlowShell satte sin. Nedgraderad till `p`, utseendet oförändrat. |
| `src/components/interests/MessageHub.tsx` | Tomma läget hade bara h2, alltså ingen h1 alls för alla som ännu inte fått ett meddelande. |
| `src/app/dashboard/jobbcoachen/components/WelcomeMessage.tsx` | Rubriken låg som anonym div. Nu h1, utseendet oförändrat. |
| `src/app/dashboard/cv-mallar/components/MallarLivePreview.tsx` | Mallens HTML är ett helt CV med egen h1 (personens namn). `role="img"` kapslar in förhandsvisningen så mallens rubriker inte hamnar i sidans disposition. |

`npx tsc --noEmit` rent. `next build` går igenom.

Rubrikträdet efter fixarna, läst ur tillgänglighetsträdet:

```
/dashboard/cv-mallar    1  ["Byt design på ditt CV"]
/dashboard/skapa-cv     1  ["Bygg ditt CV"]
/dashboard/meddelanden  1  ["Meddelanden"]
/dashboard/jobbcoachen  1  ["JOBBCOACHEN"]
/dashboard              1  ["Översikt över ditt jobbsök"]
```

---

## Kvar, inte blockerande

**Testflödet ligger kvar i dashboardskalet.** `/dashboard/tester/<slug>/test/<id>`
använder inte FlowShell, så headern, e-postbannern och cookie-bannern äter
höjd under ett tidsatt prov. På 375 px klipps svarsalternativen av i nederkant
medan klockan går. Ett prov är ett läge, precis som brevflödet, och hör hemma
i FlowShell. Fil: `src/app/dashboard/tester/[slug]/test/[sessionId]/`.

**Statuspillret på prenumerationssidan trunkeras.** "Premium aktivt.
Prenumerationen förny…" går inte att läsa klart på mobil och har ingen
utfällning. Fil: `src/app/dashboard/profil/prenumeration/`.

**E-postbannern tar mycket höjd på varje sida.** För ett obekräftat konto
ligger den på varje vy och trycker ner innehållet med drygt 270 px på 375-bredd,
alltså en tredjedel av skärmen, med en full orange knapp. Den är befogad men
kunde vara en rad. Fil: `src/components/dashboard/email-verification-banner.tsx`.

**Cookie-bannern ligger även på appytorna.** Sidfoten döljs på dashboard via
`isAppSurface`, men cookie-bannern renderas överallt. Den är nu flyttad så den
inte täcker flödesfoten, men för en inloggad användare mitt i ett flöde är den
ändå en stor yta. Värd att överväga att visa den före inloggning i stället.
Fil: `src/app/client-layout.tsx`.

---

## Om mätmetoden

Två av kontrollerna gav falska utslag som är värda att känna till för nästa
körning, så att ingen jagar dem:

- **Horisontellt spill** flaggar element inne i medvetna
  `overflow-x-auto`-behållare. Filterraden på sokta-tjanster och
  jämförelsetabellen på prenumeration ska scrolla i sidled.
- **Saknad flödesfot** flaggar steg 0 i cv-analys och linkedin-optimizer.
  De stegen är heroer med en egen CTA i innehållet och döljer foten med flit.

Den viktigaste lärdomen är den som gjorde att e35b4de5 såg klar ut men inte
var det: **att kontrollera att ett element syns räcker inte.** Det som ska
mätas är om det går att träffa. `document.elementFromPoint` på knappens
mittpunkt, och kontroll av att träffen faktiskt är knappen, hittade på en
sekund det som kodläsning och en synlighetskontroll missade helt.
