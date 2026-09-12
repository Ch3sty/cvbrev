// src/lib/privacy/guard.ts
// Serversidans spärr före varje AI-anrop med CV-innehåll.
//
// Tidigare loggade letters/generate en varning när valideringen hittade PII
// och fortsatte sedan med samma text (throw-raden låg bortkommenterad). En
// kontroll som aldrig får en konsekvens är en loggrad, inte en kontroll.
//
// Nu: maska, kontrollera, maska hårdare vid träff, kontrollera igen. Kvarstår
// något loggas en mätpunkt i user_activities och genereringen fortsätter med
// den HÅRT maskade texten. Originalet lämnar aldrig servern, och vi stoppar
// inte användarens brev för att en regex är osäker på ett telefonnummer.

import { maskForModel, type MaskOptions } from './pii';
import { logUserActivity } from '@/lib/activity-logger';

export interface GuardResult {
  /** Texten som får skickas till modellen. Alltid maskerad. */
  text: string;
  /** Namnet vi identifierade, för att kunna sätta tillbaka det efteråt. */
  detectedName: string | null;
  /** Kvarvarande träffar efter andra passet. Tom lista är det normala. */
  warnings: string[];
}

/**
 * Maskerar CV-text inför ett AI-anrop och loggar om något gick igenom.
 *
 * @param feature Vilket flöde som anropar, hamnar i mätpunkten.
 * @param userId  Null för publika, ej inloggade flöden.
 */
export async function guardCvTextForModel(
  cvText: string,
  feature: string,
  userId: string | null,
  options: MaskOptions = {}
): Promise<GuardResult> {
  const { text, detectedName, warnings, usedSecondPass } = maskForModel(cvText, options);

  if (warnings.length > 0) {
    console.error(
      `[privacy] ${feature}: personuppgifter kvar efter andra passet:`,
      warnings.join(', ')
    );

    // Mätpunkt, inte ett stopp. Vi vill veta hur ofta det händer och i vilket
    // flöde, så mönstren kan förbättras mot verkliga CV:n.
    if (userId) {
      void logUserActivity(userId, 'anonymization_failed', 'Maskering lämnade kvar personuppgifter', {
        feature,
        kinds: warnings,
      });
    }
  } else if (usedSecondPass) {
    console.warn(`[privacy] ${feature}: andra passet behövdes men texten är nu ren.`);
  }

  return { text, detectedName, warnings };
}

/**
 * Sätter tillbaka riktiga värden i modellens svar.
 *
 * Modellen citerar ibland platshållarna i sina förslag ("lägg till [E-POST] i
 * brevhuvudet"). För användaren ska det stå hennes faktiska uppgifter, annars
 * ser förslaget trasigt ut. Bara fält vi känner ersätts, resten står kvar som
 * platshållare och läses då som en generisk beskrivning.
 */
export function restorePlaceholders(
  text: string,
  values: { name?: string | null; email?: string | null; phone?: string | null }
): string {
  let out = text;
  if (values.name) out = out.split('[NAMN]').join(values.name);
  if (values.email) out = out.split('[E-POST]').join(values.email);
  if (values.phone) out = out.split('[TELEFON]').join(values.phone);
  return out;
}
