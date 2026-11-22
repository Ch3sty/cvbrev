/**
 * Lydelserna för raderingen av ett konto, R1 till R11
 * (docs/beslut-mejl-och-radering-2026-11-22.md, 2c, copywritern, granskade).
 * Ordagrant; ändras bara i beslutsdokumentet först. Webbens ark
 * (Inställningar) och appens ark (Testklar) läser härifrån.
 */
export const RADERA_TEXT = {
  R1: 'Kontot och allt i det tas bort och går inte att få tillbaka',
  R2: 'Det här tas bort',
  R3: [
    'Kontot, profilen och profilfotot',
    'CV, CV-filer och personliga brev',
    'Testresultat, sökta tjänster och samtal med Jobbcoachen',
    'Sparade intervju- och personlighetssvar, vår logg över mejl till dig och din användningsstatistik',
  ],
  R4: 'Din prenumeration på Premium avslutas i samma stund, så inget mer dras.',
  R4b: 'Din prenumeration i Google Play avslutas inte av raderingen. Säg upp den i Google Play.',
  R5: 'Har du betalat hos oss finns kvitton och betalningsunderlag kvar hos Stripe, eftersom bokföringslagen kräver det. Vi sparar också en rad statistik om avslutet, utan något som pekar ut dig.',
  R5lank: 'Så hanterar vi dina uppgifter',
  R6: 'Vill du säga varför du slutar?',
  R7: 'Frivilligt. Svaret sparas som statistik utan koppling till dig. Tryck igen för att ångra valet.',
  R9a: 'Ditt konto är raderat. Tack för att du använde Jobbcoach.ai, och lycka till framöver.',
  R9b: 'Ditt konto är raderat och din prenumeration är avslutad. Inget mer dras. Tack för att du använde Jobbcoach.ai.',
  R10: 'Hela kontot raderas: nivå, träning och resultat här i appen, och allt du har gjort på jobbcoach.ai med samma konto. Det går inte att få tillbaka. Har du Premium köpt på jobbcoach.ai avslutas prenumerationen direkt. En prenumeration köpt i Google Play avslutas inte av raderingen. Den säger du upp i Google Play.',
  R10b: 'Vi sparar en rad statistik om avslutet, utan något som pekar ut dig. Vad som blir kvar hos våra leverantörer står i integritetspolicyn.',
  R11: 'Kontot och allt i det tas bort',
} as const

/** Ordet i R10b som blir länken i appens ark. */
export const R10B_LANKORD = 'integritetspolicyn'

/** Länken under R5 och R10b. */
export const DATALAGRING_HREF = '/integritetspolicy#datalagring'
