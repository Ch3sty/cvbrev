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
  | 'jobbtraffar'
  | 'af-rapport'

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
  opts?: { findingsTotal?: number; quotaFeature?: string; hiddenCount?: number }
): PaywallCopy {
  switch (variant) {
    case 'nedladdning':
      return {
        title: 'Ditt brev är klart',
        body: 'Läs och kopiera det fritt. Vill du bifoga det som PDF eller Word, formaterat och klart att skicka, ingår det i Premium.',
        primary: 'Ladda ner med Premium',
        secondary: 'Kopiera texten i stället',
      }
    case 'cv-export':
      return {
        title: 'Din gratis nedladdning är använd',
        body: 'Du har laddat ner ett CV. Fler nedladdningar, alla mallar och obegränsade analyser ingår i Premium.',
        primary: 'Ladda ner med Premium',
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
        body: 'Du ser poängen och de tre viktigaste fynden. Resten, med genomgången avsnitt för avsnitt och färdiga formuleringar, ingår i Premium.',
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
    case 'jobbtraffar': {
      // Siffran är sann: den kommer från serverns egen räkning av vad som
      // suddats, inte från en påhittad "matchningar väntar".
      // Argumentet är förklaringen, inte antalet. Gratisnivån ser de tre
      // bästa med skälen utskrivna, och det är just skälen som saknas i
      // resten av listan (docs/plan-jobbmatchning.md, avsnitt 2 punkt 5).
      const n = opts?.hiddenCount ?? 0
      const totalt = n + 3
      return {
        title:
          n === 1
            ? 'Se varför du passar för alla 4'
            : `Se varför du passar för alla ${totalt}`,
        body: 'Du ser de tre bästa träffarna med skälen utskrivna. Med Premium öppnas resten, med titel, arbetsgivare, ort och varför just du passar.',
        primary: 'Se alla träffar',
        secondary: 'Se vad Premium kostar',
      }
    }
    case 'af-rapport':
      // Loggningen är och förblir gratis: den bygger användarens historik.
      // Det är uttaget av den färdigställda sammanställningen som kostar,
      // enligt principen gratis att skapa, betalt att ta ut.
      return {
        title: 'Din rapport är sammanställd',
        body: 'Vi har räknat ihop månaden i Arbetsförmedlingens format. Att logga dina ansökningar är gratis för alltid. Att hämta ut den färdiga rapporten som text, utskrift eller fil ingår i Premium.',
        primary: 'Hämta rapporten',
        secondary: 'Se vad Premium kostar',
      }
    case 'nedgraderad':
      return {
        title: 'Fem dagar med Premium är över',
        body: 'Allt du skrev och analyserade finns kvar att läsa och kopiera. Nu gäller gratisnivån: ett brev om dagen, och nedladdning ingår i Premium.',
        primary: 'Se vad Premium kostar',
        secondary: 'Fortsätt gratis',
      }
  }
}
