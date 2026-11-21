/**
 * Vad som visas och aldrig visas för rekryterare. Samtyckets egna listor,
 * ordagrant (flyttade hit från ConsentModal så att sidan före samtycket kan
 * visa samma text utan att ladda dialogen). Ändras aldrig utan ägaren.
 */

export const SHOWN_ITEMS = [
  'Yrkesroll och erfarenhetsnivå',
  'Kompetenser från ditt CV',
  'Verifierade testresultat med percentiler',
  'Personlighetsstyrkor och arbetsstil (valfritt)',
  'Region och tillgänglighet',
];

export const HIDDEN_ITEMS = [
  'Ditt rå-CV eller personnummer',
  'Nuvarande arbetsgivare',
  'Kontaktuppgifter',
  'Personlighetstestets råpoäng eller fullständiga profil',
  'Brev, analyser och chatthistorik',
];
