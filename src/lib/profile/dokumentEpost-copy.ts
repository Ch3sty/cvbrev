/**
 * Strängarna för "E-post i CV och brev" (2026-10-10). Utkast från
 * byggagenten, samlade här så att copywritern kan putsa dem på ett ställe.
 * Inga talstreck, inga engelska gränssnittsord.
 */

export const DOKUMENT_EPOST = {
  /** Fältets etikett, i profilen och i det utfällda fältet. */
  etikett: 'E-post i CV och brev',
  /** Förklaringen under etiketten i profilen. */
  text: 'Adressen rekryteraren ser i dina CV-mallar och personliga brev.',
  /** Raden under fältet. */
  konto: (konto: string) =>
    konto
      ? `Inloggning och kvitton går fortfarande till ${konto}. Tom ruta betyder samma adress i dokumenten.`
      : 'Tom ruta betyder att kontoadressen används i dokumenten.',
  fel: 'Det ser inte ut som en e-postadress.',
  sparfel: 'Adressen sparades inte. Försök igen.',
  /** Raderna nära knapparna. */
  radCv: 'E-post i CV:t:',
  radBrev: 'E-post i brevet:',
  andra: 'Ändra',
  spara: 'Spara',
  sparar: 'Sparar',
  avbryt: 'Avbryt',
} as const
