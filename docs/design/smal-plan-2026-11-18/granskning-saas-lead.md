# Granskning saas-lead: utkast.md och skiss.html (2026-11-18)

Gränsen gratis och Premium följer ägarens beslut i omgång 3. Fem invändningar, viktigast först.

1. **Priset är skrivet för hand i låst rad och knapp.** Det står "149 kr i månaden". Black Week (99 kr 23 till 29 nov, 49 kr 30 nov) ska synas på alla betalväggar, och priset kan ändras.
   **Ändring:** priset och namnet läses ur `paketMedPris`/`paketKort` och `src/lib/kampanj/`. Fulla namnet "Jobbcoach Premium" står där pengar byter ägare.

2. **Köpögonblicket skjuts upp i plan-läget.** Är förslaget efter det gratis passet i planens test nästa gratis förstapass i en annan typ, ser en Alva-användare aldrig betalväggen där brådskan finns.
   **Ändring:** med plan är förslaget efter det första passet alltid planens nästa pass, som är låst. Övriga testers gratis förstapass ligger under "Övriga tester", aldrig som dagens förslag. Utan plan får förslaget rotera som i skissen.

3. **Betalväggen är allmän där den kunde vara personlig.** Det starkaste köpögonblicket är resultatet av första passet, när mönsterrutorna visar var de tappar.
   **Ändring:** resultatskärmen visar deras svagaste mönster med raden "Riktade pass i spegling ingår i Premium" och knappen. `paywall_shown` ska ha `surface: forsta_pass_resultat`.

4. **Provdatum bara som valfritt chip.** Bara 6 av 36 planer har datum, och nedräkningen är den starkaste återkomstkroken.
   **Ändring:** fråga en gång på resultatskärmen efter nivåkollen: "När är provet?" med "Vet inte än". Ingen spärr.

5. **"Du har sett alla frågor på din nivå i dag" för betalande** krockar med "så ofta du vill" och riskerar uppsägning.
   **Ändring:** erbjud i första hand ett pass i ett annat mönster eller på närliggande nivå. Mät händelsen `bank_slut_visad`. Visas den i mer än 5 % av Premium-sessionerna flyttas bankarbetet före allt annat.

**Mätningen, tillägg:** följande händelser bär `plan_test`, `i_planens_test` och `plattform`:
- `plan_skapad` med `kalla` (artikel eller ingång)
- `provdatum_satt`, `dagsmal_satt`
- `forsta_pass_klart` per testtyp
- `paywall_shown` och `paywall_cta_clicked`

Personkopplingen för serverhändelserna rättas före driftsättning. "Vi påminner" får bara stå där påminnelsen finns: push i appen. Mejl kräver ägarens ja.

Allt annat är godkänt, inklusive "säg upp när provet är gjort", som sänker tröskeln ärligt.
