/**
 * Titeln på en text eller ett underlag som användaren ser.
 *
 * 48 frysta verbala titlar (verbalTestV1 och verbalTestV2) börjar med
 * "PASSAGE", ett nummer och ett långt tankstreck: "PASSAGE 1 — Digitalt
 * lärande". Bankfilerna rörs inte (gamla sessioner och genomgångar läser
 * dem), så prefixet tas bort här, överallt där en titel visas. Ett
 * tankstreck som står kvar inne i titeln blir ett kommatecken.
 *
 * Ren, får importeras av både server och klient.
 */
const PREFIX = /^\s*passage\s*\d+\s*[—–:\-]?\s*/i;
const TANKSTRECK = /\s*[—–]\s*/g;

export function visningstitel(title: string | null | undefined): string {
  if (!title) return '';
  return title.replace(PREFIX, '').replace(TANKSTRECK, ', ').replace(/^,\s*/, '').trim();
}
