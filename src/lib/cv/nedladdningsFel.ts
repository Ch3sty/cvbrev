/**
 * Begripliga fel vid nedladdning av CV (plan-mallar-2026-11-15, beslut 0).
 *
 * Rutterna svarar med koder ("email_not_verified", engelska meddelanden från
 * mallmotorn). Användaren ska aldrig se dem: felet visas som en rad under
 * knappen med vad hon kan göra. Betalväggen (402) och namnfrågan (422)
 * hanteras av anroparen före den här funktionen.
 */

export const NEDLADDNING_FEL = {
  utloggad: 'Du har blivit utloggad. Logga in igen och försök på nytt.',
  ogiltigt: 'Vi kunde inte göra en fil av det här CV:t. Kontrollera att namn och minst en erfarenhet eller utbildning finns med och försök igen.',
  forManga: 'Du har laddat ner många filer på kort tid. Vänta en minut och försök igen.',
  natet: 'Vi fick ingen kontakt med servern. Kontrollera uppkopplingen och försök igen.',
  okant: 'Filen kunde inte skapas just nu. Försök igen om en stund.',
} as const

/** Texten för ett svar som inte var ok. */
export function nedladdningsFelForStatus(status: number): string {
  if (status === 401) return NEDLADDNING_FEL.utloggad
  if (status === 400 || status === 413) return NEDLADDNING_FEL.ogiltigt
  if (status === 429) return NEDLADDNING_FEL.forManga
  return NEDLADDNING_FEL.okant
}

/** Texten för ett kastat fel (fetch som inte nådde fram ger TypeError). */
export function nedladdningsFelForUndantag(error: unknown): string {
  if (error instanceof TypeError) return NEDLADDNING_FEL.natet
  const meddelande = error instanceof Error ? error.message : ''
  const kanda = Object.values(NEDLADDNING_FEL) as string[]
  return kanda.includes(meddelande) ? meddelande : NEDLADDNING_FEL.okant
}
