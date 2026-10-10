/**
 * Strängarna för kontaktuppgifterna i CV och brev (2026-10-10): raden
 * "I CV:t" och "I brevet" vid knapparna, det utfällda formuläret och
 * förklaringen i profilen. Utkast från byggagenten, samlade här så att
 * copywritern kan putsa dem på ett ställe. Inga talstreck, inga engelska
 * gränssnittsord.
 */

import { DOKUMENT_EPOST } from './dokumentEpost-copy'

export const DOKUMENT_KONTAKT = {
  /** Raden nära knapparna, följd av namn · telefon · e-post · ort. */
  radCv: 'I CV:t:',
  radBrev: 'I brevet:',
  /** Visas i raden när namnet saknas helt. */
  namnSaknas: 'Namn saknas',
  /** Rubriken i det utfällda formuläret. */
  rubrik: 'Kontaktuppgifter i CV och brev',
  /** Raden under rubriken, beroende på var formuläret öppnades. */
  forklaringCv:
    'Gäller det här CV:t och sparas i din profil, så att nästa CV och personliga brev får samma uppgifter.',
  forklaringBrev:
    'Står i brevhuvudet och under din underskrift. Sparas i din profil, så att dina CV-mallar får samma uppgifter.',
  falt: {
    namn: 'Namn',
    telefon: 'Telefon',
    epost: 'E-post',
    ort: 'Ort',
  },
  plats: {
    namn: 'Förnamn och efternamn',
    telefon: '070 123 45 67',
    ort: 'Till exempel Örebro',
  },
  /** Under telefon och ort: att tomt betyder att raden försvinner. */
  tomRad: 'Lämna tomt om det inte ska stå med.',
  /** Under e-posten: kontoadressen är kvar för inloggning. */
  epostKonto: DOKUMENT_EPOST.konto,
  namnFel: 'Skriv ditt för- och efternamn.',
  epostFel: DOKUMENT_EPOST.fel,
  sparfel: 'Uppgifterna sparades inte. Försök igen.',
  andra: 'Ändra',
  spara: 'Spara',
  sparar: 'Sparar',
  avbryt: 'Avbryt',
  /** Profilsektionens förklaring (Överst i ditt CV). */
  profilText:
    'Namn, ort, telefon och e-post är uppgifterna som står överst i dina CV-mallar och personliga brev. Har du skrivit något annat i ett CV gäller det som står där. Vi sätter in uppgifterna själva efteråt, de skickas aldrig till någon AI.',
} as const
