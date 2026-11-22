# Skissnot: Skapa konto

Skiss: `sidor/registrering.html`, byggd till `ut/skiss-registrering.html`. Bilder: `bilder/registrering-375-*`, `-412-*`, `-1440-*`. Sidans färg: grafit.

Skissen visar hela vägen för den som kommer till bar `/register`: kontosidan, sedan de två skärmarna som följer inloggat (köpsteget med vägen till gratis, och frågan "Vad vill du börja med?"). Ordningen är dagens, läst ur `RegisterFlode.tsx`, `dashboard/valkommen` och `dashboard/valj-spar`.

## Vad som ändras mot i dag

- **Toppraden.** Mörk grafit i stället för vit. Samma innehåll: loggan, "Har du redan ett konto?" och Logga in. Ingen meny, som i dag.
- **Kontokortet.** Ett vitt kort med tjock klack på den mörka ytan, i stället för ett formulär på beige. Rubriken är större. Google-knappen är en vit knapp med klack, fälten är höga (54 px) och Skapa konto är kopparknappen. I telefonen ligger kortet först, före allt annat.
- **"Det här ingår gratis".** Tre grå rader med små ikoner har blivit fyra färgade kort, ett per del, med en liten bild av det man får: en matrisuppgift, poängen 93 av 100, ett brev och vägen i Jobbsöket. Jobbsöket är nytt här. Premium-raden under är en egen mörk rad.
- **Köpsteget (skärm 2).** Samma innehåll som i dag, i ny form: priset som huvudtal på mörk botten, listan med kopparbockar, villkorsraderna, första steget och samtycket. Till betalning är kopparknappen, "Börja gratis i stället" ligger under.
- **Vad vill du börja med? (skärm 3).** Tre grå val har blivit fem: de fyra delarna i sina färger, testerna först, och "Jag vet inte än". Valet markeras med mörk kant och bock, inte med koppar.

## Ordagrant kvar

- Rubriken "Skapa ditt konto", raden "Gratis konto, inget kreditkort. Klart på en minut.", "Fortsätt med Google", "eller med e-post", fälten E-post (namn@exempel.se) och Lösenord (Minst 8 tecken), knappen "Skapa konto".
- Kryssrutan: "Mejla mig erbjudanden och tips om tester och jobbsök. Avsluta när du vill." Oikryssad.
- Den juridiska raden: "Genom att skapa konto godkänner du våra användarvillkor och vår integritetspolicy."
- Köpsteget: samtycket om ångerrätten, villkorsraderna (Förnyas, Uppsägning, Ångerrätt), "Till betalning, 149 kr", "Börja gratis i stället", "Kortbetalning via Stripe. Kvitto på mejl."
- Skärm 3: "Sista steget", "Vad vill du börja med?", "Vi lägger det du väljer överst på hemskärmen. Inget kostar något.", "Till hemskärmen", "Jag vet inte än".

## Påståenden som bytts för att de var osanna

| I dag | I skissen |
|---|---|
| "CV-analysen: Poängen och det tyngsta fyndet i ditt CV." | "Läsbarhetspoängen och genomgången i sju delar, för varje CV." |
| "med genomgång av varje fråga" | "med förklaring efter varje uppgift" |
| Valet "Urvalstester" | "Rekryteringstester" (namnet som används överallt annars) |
| Valet "CV och personliga brev" | Två val: "CV" och "Personliga brev" |
| Köpstegets lista utan uppföljning och rapport | Samma sex rader som på /priser |

## Kräver beslut

1. **Fem val i stället för tre på skärm 3.** I dag sparas valet som ett av två spår (cv eller tester). Fem val kräver att valet styr landningen på samma sätt som `?borja=` gör i dag (CV, brev, tester, jobb). Texterna under Personliga brev och Jobbsöket är hämtade från det borttagna steg 1 i `registrering-copy.ts`.
2. **Ordningen efter kontot.** Skissen behåller dagens: köpsteget först, gratisfrågan efter "Börja gratis i stället". Att visa frågan först och Premium sedan vore en ändring i tratten och är inte ritat.
3. **Jobbsöket i "Det här ingår gratis"** är nytt. Rubriken "Börja med det som avgör urvalet" står kvar.
4. **Inte ritat:** varianterna efter ett prov utan konto (resultatpanelen bredvid formuläret), varianten med `?borja=` (valraden med Ändra och förslagsskärmen efteråt), felraderna ("Det finns redan ett konto med den adressen" med flera), kontrollen mot robotar och sidan "Bekräfta din e-post". De ska få samma kort och samma rader som här och i skissen för Logga in.
5. **Kampanjpriset** (Black Week) i köpsteget är inte ritat.

## Filer som bygget rör

- `src/components/registrering/RegisterKontoSteg.tsx`, `PubliktFlodesskal.tsx`, `registrering-copy.ts` (`KONTO_GRATIS`), `IntentIkon.tsx`
- `src/components/auth/GoogleSignInButton.tsx`
- `src/app/dashboard/valj-spar/ValjSparClient.tsx`, `src/lib/onboarding/program.ts` (`SPARVAL_GRATIS`), `src/app/api/onboarding/track`
- `src/components/shell/FlowShell.tsx`, `ChoiceCard.tsx` (delas med andra flöden inloggat)
- `src/lib/plans/plans.ts` (`HELA_PAKETET_RADER`, samma lista som på /priser)

## Förslag till grunden

- **Kontokortet** (`.kontokort`, `.google`, `.falt`, `.kryss`, `.eller`) används av både Skapa konto och Logga in och bör ligga i kit.css.
- **Toppraden utan meny** (`.topp`): en variant av `.nav` för flöden.
- **Valkortet** (`.val`): ett val i en dels färg med ring och bock.
