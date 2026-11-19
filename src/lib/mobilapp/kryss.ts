/**
 * Krysset uppe i hörnet i webbens helskärmsvyer (PassShell, ResultatSkal,
 * Kvitto, TestFlowShell, IprovFlode, övningsproven). Skalen märker knappen
 * med data-kryss="", som inte syns på webben. Appen letar efter attributet
 * först; etiketterna är en reserv för vyer som ännu inte har det.
 */

/** Etiketter som räknas som kryss när attributet saknas. */
export const KRYSS_ETIKETTER = [
  'Avsluta träningen',
  'Avsluta Nivåkollen',
  'Avsluta testet',
  'Avsluta provet',
  'Avsluta passet',
  'Stäng',
  'Avbryt',
  'Avbryt provet',
  'Tillbaka till resultatet',
] as const;

/** Etiketterna för att avbryta en pågående mätning (Nivåkollen i onboardingen). */
export const AVSLUTA_ETIKETTER = [
  'Avsluta träningen',
  'Avsluta Nivåkollen',
  'Avsluta testet',
  'Avsluta passet',
] as const;

function selektor(etiketter: readonly string[]): string {
  return [
    'button[data-kryss]',
    'a[data-kryss]',
    ...etiketter.flatMap((e) => [`button[aria-label="${e}"]`, `a[aria-label="${e}"]`]),
  ].join(', ');
}

/** Alla kryss: attributet först, etiketterna som reserv. */
export const KRYSS_SELEKTOR = selektor(KRYSS_ETIKETTER);

/** Kryss som avbryter en mätning; "Stäng" i ett ark räknas inte. */
export const AVSLUTA_SELEKTOR = selektor(AVSLUTA_ETIKETTER);
