'use client';

// =============================================================================
// useRobustAnswerSaving — delad, robust svarssparning för PROV-flödena.
// Samma mönster som matrislogik-träningsflödet (MatrixTestSession):
// - Misslyckade sparningar körs om upp till 3 gånger med backoff.
// - Svar som ändå inte gått att spara flaggas (failedCount driver amber-bannern)
//   och försöks om vid navigering samt innan provet slutförs (flushPending).
// Hooken är generisk över payload-typ; nyckeln är fråge-id så ett nyare svar
// på samma fråga ersätter ett äldre osparat.
// =============================================================================

import { useCallback, useRef, useState } from 'react';

// Svar som ännu inte bekräftats sparat på servern. `failed` sätts först när
// alla automatiska omförsök är förbrukade (det är då bannern visas).
interface PendingAnswer<T> {
  payload: T;
  failed: boolean;
}

// Backoff mellan omförsök: försök 1 direkt, sedan 500ms och 1500ms paus.
const RETRY_DELAYS = [500, 1500];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useRobustAnswerSaving<T>(postAnswer: (payload: T) => Promise<void>) {
  // Osparade svar per nyckel. Ref för logiken (stabila referenser i asynkrona
  // kedjor), state-räknaren driver bannern.
  const pendingRef = useRef<Map<string, PendingAnswer<T>>>(new Map());
  const [failedCount, setFailedCount] = useState(0);

  const updateFailedCount = useCallback(() => {
    let n = 0;
    pendingRef.current.forEach((p) => {
      if (p.failed) n++;
    });
    setFailedCount(n);
  }, []);

  // Bakgrundsomförsök efter att första sparningen misslyckats. Avbryts tyst
  // om svaret hunnit ersättas av ett nyare val på samma fråga.
  const retryInBackground = useCallback(
    async (key: string, token: PendingAnswer<T>) => {
      for (const delay of RETRY_DELAYS) {
        await sleep(delay);
        if (pendingRef.current.get(key) !== token) return;
        try {
          await postAnswer(token.payload);
          if (pendingRef.current.get(key) === token) {
            pendingRef.current.delete(key);
            updateFailedCount();
          }
          return;
        } catch {
          // Nästa försök efter backoff.
        }
      }
      if (pendingRef.current.get(key) === token) {
        token.failed = true;
        updateFailedCount();
      }
    },
    [postAnswer, updateFailedCount]
  );

  // Sparar ett svar. Väntar bara in första försöket — omförsöken körs i
  // bakgrunden så UI:t inte blockeras.
  const saveAnswer = useCallback(
    async (key: string, payload: T) => {
      const token: PendingAnswer<T> = { payload, failed: false };
      pendingRef.current.set(key, token);
      updateFailedCount();
      try {
        await postAnswer(payload);
        if (pendingRef.current.get(key) === token) {
          pendingRef.current.delete(key);
          updateFailedCount();
        }
      } catch {
        void retryInBackground(key, token);
      }
    },
    [postAnswer, retryInBackground, updateFailedCount]
  );

  // Försök spara om osparade svar. onlyFailed=true tar bara de vars
  // omförsökskedja redan gett upp (aktiva kedjor sköter sig själva).
  // Returnerar true om inget osparat återstår.
  const flushPending = useCallback(
    async (onlyFailed: boolean): Promise<boolean> => {
      const entries = Array.from(pendingRef.current.entries()).filter(
        ([, p]) => !onlyFailed || p.failed
      );
      await Promise.all(
        entries.map(async ([key, token]) => {
          try {
            await postAnswer(token.payload);
            if (pendingRef.current.get(key) === token) {
              pendingRef.current.delete(key);
            }
          } catch {
            // Kvar som osparat.
          }
        })
      );
      updateFailedCount();
      return pendingRef.current.size === 0;
    },
    [postAnswer, updateFailedCount]
  );

  const hasPending = useCallback(() => pendingRef.current.size > 0, []);

  return { saveAnswer, flushPending, hasPending, failedCount };
}
