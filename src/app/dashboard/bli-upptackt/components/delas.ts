/**
 * Vad som visas för rekryterare, vad som visas först efter kandidatens ja och
 * vad som aldrig visas. Samtyckets egna listor, ordagrant (flyttade hit från
 * ConsentModal så att sidan före samtycket kan visa samma text utan att ladda
 * dialogen). Lydelserna godkända av ägaren 2026-11-22. Ändras aldrig utan ägaren.
 */

export const SHOWN_ITEMS = [
  'Yrkesroll och erfarenhetsnivå',
  'Kompetenser från ditt CV',
  'Verifierade testresultat, med placering bara när du ligger över mitten',
  'Personlighetsstyrkor och arbetsstil (valfritt)',
  'Region och tillgänglighet',
];

export const AFTER_YES_ITEMS = [
  'Ditt namn och din e-post',
  'Dina arbetsgivare, även den nuvarande',
  'En kort beskrivning av varje anställning, ur ditt CV',
  'Lärosäte, examensår och anställningarnas datum',
];

export const HIDDEN_ITEMS = [
  'Ditt CV som fil, ditt foto och dina referenser',
  'Telefonnummer, hemadress och personnummer',
  'Testernas råpoäng och personlighetstestets siffror',
  'Brev, analyser och chatthistorik',
];
