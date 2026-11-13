# Rekryteringstesterna som app (2026-11-13)

Fullständig rapport: `utredning-app-tester-2026-11-13.pdf` (källa `.html`).

1. Det går. Testerna är en tunn klient mot `/api/traning/*`, facit stannar på servern, så ett appskal kan visa samma sidor. Ingen omskrivning av banker eller motorer.
2. Det svåra är betalningen. Apple kräver köp i appen för digitalt innehåll; Google kräver Play Billing eller EEA-programmet. Köp i appen kostar 15 % (Small Business Program / Googles första miljon). Webben behåller Stripe.
3. iPhone väger tyngst: 16 mot 7 bland inloggade testanvändare (30 dagar). Mobil är 48 % av testsidans besökare. PWA:n gav 1 installation på 60 dagar.
4. Apple 4.2 kräver mer än en inslagen webbplats: push för dagens pass, Inloggning med Apple (krävs enligt 4.8 eftersom vi har Google), inbyggda köp, start i testerna. Kontoradering finns redan.
5. Rekommendation: Capacitor-skal (väg C), 23 till 31 arbetsdagar, start 1 december efter Black Week, i butikerna början av januari. Fast kostnad cirka 1 400 kr första året.

**Ägarens beslut:** gå vidare eller inte; D-U-N-S och företagskonton hos Apple och Google; samma pris i appen (rekommenderas); bara testerna i appen (rekommenderas); push på eller av som standard (rekommendation: fråga efter första passet).
