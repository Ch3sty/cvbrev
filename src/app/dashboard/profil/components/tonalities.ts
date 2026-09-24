/**
 * Tonalternativ för den förvalda tonen (profil-spec, sektion 2 med avsteg).
 *
 * Låg tidigare i TonalitySection.tsx tillsammans med ett 283 rader stort
 * kortgalleri med gradienter, hover-lyft och exempeltexter. Profilsidan
 * behöver bara namn och en rad om vad tonen gör; själva valet syns bäst i
 * brevet där man ser resultatet.
 *
 * preferred_tonality läses numera av brevflödet som startvärde. Den som
 * ändrar här ändrar alltså vad nästa brev börjar med, inte bara en etikett.
 */

export type TonalityValue =
  | 'professional'
  | 'creative'
  | 'enthusiastic'
  | 'confident'
  | 'balanced'
  | 'auto'

export interface TonalityOption {
  value: TonalityValue
  label: string
  shortDescription: string
  /** Bara premium får välja. Gaten ligger kvar från den gamla sektionen. */
  premium?: boolean
}

export const TONALITIES: TonalityOption[] = [
  {
    value: 'professional',
    label: 'Professionell',
    shortDescription: 'Formell och saklig, passar etablerade branscher.',
  },
  {
    value: 'creative',
    label: 'Kreativ',
    shortDescription: 'Personlig och nytänkande, passar reklam, design och media.',
  },
  {
    value: 'confident',
    label: 'Självsäker',
    shortDescription: 'Bestämd och rakt på sak, passar ledarroller och sälj.',
  },
  {
    value: 'balanced',
    label: 'Balanserad',
    shortDescription: 'Lagom formell och personlig, passar de flesta jobb.',
  },
  {
    value: 'auto',
    label: 'Smart val',
    shortDescription: 'Vi väljer ton utifrån varje annons.',
    premium: true,
  },
]
