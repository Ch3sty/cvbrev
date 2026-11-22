'use client';

import { IkonOga, LitenKnapp, Notis } from '@/components/jobb3/kit';
import type { StyrkorSvar } from './samtycke';

/**
 * Frågan till dem som redan visade styrkor när samtycket bara sa "visa"
 * (ägarbeslut 2026-11-22). Visas en gång; svaret sparas med tidpunkt i
 * user_ui_preferences (se samtycke.ts). Lugn och liten, i sidans egen form,
 * ingen varningsfärg. Texterna är ägarens, ordagrant.
 */
export default function StyrkorFraga({
  avancerad,
  sparar,
  onSvar,
}: {
  /** Har gjort det fördjupade testet: visar styrkor och arbetsstil. */
  avancerad: boolean;
  sparar: boolean;
  onSvar: (svar: StyrkorSvar) => void;
}) {
  return (
    <Notis
      ikon={<IkonOga size={20} />}
      rubrik="Rekryterare kan söka på dina styrkor"
      text={
        avancerad
          ? 'Du visar dina styrkor och din arbetsstil på profilen. Rekryterare kan också söka på dem, så att den som letar efter ditt sätt att arbeta hittar dig.'
          : 'Du visar dina två främsta styrkor på profilen. Rekryterare kan också söka på dem, så att den som letar efter ditt sätt att arbeta hittar dig.'
      }
      handling={
        <>
          <LitenKnapp disabled={sparar} onClick={() => onSvar('fortsatt')}>
            Fortsätt visa
          </LitenKnapp>
          <LitenKnapp disabled={sparar} onClick={() => onSvar('sluta')}>
            Sluta visa
          </LitenKnapp>
          <span className="j3-fin basis-full">Du kan ändra dig när du vill.</span>
        </>
      }
    />
  );
}
