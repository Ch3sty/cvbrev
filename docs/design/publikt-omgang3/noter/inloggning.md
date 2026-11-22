# Skissnot: Logga in

Skiss: `sidor/inloggning.html`, byggd till `ut/skiss-inloggning.html`. Bilder: `bilder/inloggning-375-*`, `-412-*`, `-1440-*`. Sidans färg: grafit.

Skissen visar inloggningen, inloggningens två besked (bekräftad e-post, fel lösenord) och sidan "Glömt lösenordet?" i två lägen. Sidan finns i koden: `src/app/auth/forgot-password/page.tsx`.

## Vad som ändras mot i dag

- **Inloggningen.** Ett smalt formulär på en tom beige yta har blivit samma vita kort med klack som på Skapa konto, på mörk grafit. Toppraden är mörk. Google-knappen, fälten och knappen har samma form som i registreringen.
- **Bredvid kortet** (i telefonen under det) står de fyra delarna som färgade block under raden "Allt ligger kvar där du lämnade det". I dag är ytan tom.
- **Beskeden** är rader högst upp i kortet: grön rad för "Din e-post är bekräftad. Logga in nedan.", röd rad för "Inloggningen gick inte igenom. Fel e-postadress eller lösenord." Rött används här för ett fel, inte som färg på en del.
- **Glömt lösenordet?** Dagens sida har den äldsta designen på sajten: ett CV-liknande papper, en illustration, tre citat (med tankstreck) och fyra tal som "100% krypterat" och "24 h länken giltig". Skissen gör den till samma kort med ett fält och en knapp. När mejlet är skickat visar kortet en grön ruta med adressen, instruktionen, tipset om skräpposten och knappen tillbaka.

## Ordagrant kvar

- "Logga in", "Välkommen tillbaka, fortsätt där du slutade.", "Fortsätt med Google", "eller med e-post", E-post, Lösenord, "Glömt lösenordet?", knappen "Logga in", "Har du inget konto? Skapa konto".
- Beskeden ur `registrering-copy.ts` (`LOGIN`).
- Glömt lösenordet: "Återställ lösenord", "Vi skickar en länk till din e-post", "E-postadress", "Skicka återställningslänk", "Kom du ihåg ditt lösenord? Logga in", "Klart, kolla din inkorg", "Mejl skickat", "Till:", instruktionen, tipset och "Tillbaka till inloggning".

## Påståenden som bytts eller strukits

| I dag | I skissen |
|---|---|
| Glömt lösenordet: citaten "Vi har alla glömt något — det här är inte ditt jobb." med flera | Strukna |
| Glömt lösenordet: talen "< 1 min tills du är inne", "24 h länken giltig", "100% krypterat", "Säkert via e-post" | Strukna. Jag har inte belagt dem, och de behövs inte. |
| Stämpeln "Mottaget" och etiketterna "Kontoåtkomst" och "Bekräftelse" | Strukna |
| Platshållaren "din.email@example.com" | "namn@exempel.se", samma som i inloggningen |

Nytt: raden "Allt ligger kvar där du lämnade det" med de fyra delarna och en rad var ("Dina resultat och din utveckling", "Dina CV och poängen i analysen", "Alla brev du har skrivit", "Dina sökta tjänster och matchade jobb").

## Kräver beslut

1. **Panelen bredvid inloggningen** är ny. Vill ägaren ha en renare inloggning kan den strykas; kortet står för sig självt.
2. **Sidan "Välj nytt lösenord"** (`src/app/auth/reset-password`) har samma gamla design, med citat och talet "AES-256". Den är inte ritad men ska få samma kort: rubrik, två fält, en knapp. Samma gäller "Bekräfta din e-post" (`src/app/auth/verify-email`) och felsidan (`src/app/auth/error`).
3. **Glömt lösenordets texter** är mejlnära men ligger i gränssnittet, inte i mejlmallen. Mallen rörs inte.

## Filer som bygget rör

- `src/components/registrering/LoginFlode.tsx`, `PubliktFlodesskal.tsx`
- `src/app/auth/forgot-password/page.tsx`, `src/components/auth/forgot-password-form.tsx`
- `src/components/auth/AuthShell.tsx`, `AuthCvPaper`, `AuthInput`, `AuthSubmitButton`, `SuccessStamp` (kan tas bort när reset-password och verify-email också är flyttade)
- `src/components/auth/GoogleSignInButton.tsx`, `src/components/shell/StatusRow.tsx`

## Förslag till grunden

- Samma som för Skapa konto: kontokortet och toppraden utan meny bör ligga i kit.css.
- **Beskedsraderna** (`.rad.bra`, `.rad.fel`): grunden har ingen färg för fel. Jag har använt en dämpad tegelröd (`#B23A2A` på `#FBE9E5`) bara här.
