/**
 * All copy för betalväggarna, ordagrant från docs/plan-konvertering.md (E2).
 * Inga em-dash. Gratisnivån är ett brev om dagen.
 */

export type PaywallVariant =
  | 'nedladdning'
  | 'cv-export'
  | 'kvot'
  | 'analys'
  | 'test-tak'
  | 'nedgraderad'
  | 'cv-antal'

export interface PaywallCopy {
  title: string
  body: string
  primary: string
  secondary: string
}

/**
 * Kvotvarianten används av fler funktioner än brev. Rubrik och brödtext byts
 * per funktion så texten är sann, medan knappar och layout är gemensamma.
 * Nyckeln är samma sträng som kvotnyckeln i quota-propen.
 */
export const KVOT_COPY_BY_FEATURE: Record<string, Pick<PaywallCopy, 'title' | 'body' | 'primary'>> = {
  letter_generation: {
    title: 'Du har skrivit dagens brev',
    body: 'Gratisnivån ger ett brev per dag. Med Premium skriver du så många du orkar.',
    primary: 'Fortsätt skriva med Premium',
  },
  cv_analysis: {
    title: 'Din CV-analys är använd',
    body: 'Gratisnivån ger en analys var tredje dygn. Med Premium analyserar du så ofta du vill.',
    primary: 'Analysera direkt med Premium',
  },
  chat_message: {
    title: 'Dagens meddelanden är slut',
    body: 'Gratisnivån ger tio meddelanden per dag. Med Premium chattar du obegränsat.',
    primary: 'Fortsätt chatta med Premium',
  },
}

export function getPaywallCopy(
  variant: PaywallVariant,
  opts?: { findingsTotal?: number; quotaFeature?: string }
): PaywallCopy {
  switch (variant) {
    case 'nedladdning':
      return {
        title: 'Ditt brev är klart',
        body: 'Du kan läsa och kopiera texten som den är. För att ladda ner som PDF eller Word behöver du Premium.',
        primary: 'Lås upp nedladdning',
        secondary: 'Kopiera texten istället',
      }
    case 'cv-export':
      return {
        title: 'Din gratis nedladdning är använd',
        body: 'Du har laddat ner ett CV. Fler nedladdningar, alla 42 mallar och obegränsade analyser ingår i Premium.',
        primary: 'Lås upp nedladdning',
        secondary: 'Se vad Premium kostar',
      }
    case 'kvot': {
      const perFeature =
        (opts?.quotaFeature ? KVOT_COPY_BY_FEATURE[opts.quotaFeature] : undefined) ??
        KVOT_COPY_BY_FEATURE.letter_generation
      return { ...perFeature, secondary: 'Påminn mig imorgon' }
    }
    case 'analys': {
      const n = opts?.findingsTotal ?? 0
      return {
        title: n > 0 ? `Vi hittade ${n} saker att fixa i ditt CV` : 'Vi hittade fler saker att fixa i ditt CV',
        body: 'Du ser poängen och de tre viktigaste. Resten, inklusive ATS-genomgången och formuleringsförslagen, ingår i Premium.',
        primary: 'Se hela analysen',
        secondary: 'Vad ingår i Premium?',
      }
    }
    case 'test-tak':
      return {
        title: 'Tre omgångar idag, det räcker för att bli varm',
        body: 'Med Premium tränar du obegränsat och får alla svårighetsnivåer.',
        primary: 'Träna obegränsat',
        secondary: 'Kom tillbaka imorgon',
      }
    case 'cv-antal':
      return {
        title: 'Du har två sparade CV',
        body: 'Gratisnivån sparar två CV åt gången. Med Premium sparar du hur många du vill.',
        primary: 'Spara fler med Premium',
        secondary: 'Ta bort ett gammalt CV',
      }
    case 'nedgraderad':
      return {
        title: 'Din Premium-period är slut',
        body: 'Du hade obegränsat i fem dagar. Nu gäller gratisnivån: ett brev om dagen, och nedladdning kräver Premium.',
        primary: 'Se vad Premium kostar',
        secondary: 'Fortsätt gratis',
      }
  }
}
