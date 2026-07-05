'use client';

// =============================================================================
// NumericalTestSession — delad testvy för numeriskt test grund/avancerad/expert.
// Sidorna under /dashboard/tester/numeriskt-test*/test/[sessionId] är tunna
// wrappers som bara skickar in rätt frågeurval, endpoints och resultat-path.
//
// Utöver den gemensamma UI:n hanterar komponenten (samma mönster som
// MatrixTestSession):
// - Rehydrering: vid mount hämtas sessionen så redan besvarade frågor hoppas
//   över och avslutade sessioner skickas direkt till resultatsidan.
// - Robust svarssparning: misslyckade sparningar körs om upp till 3 gånger
//   med backoff, osparade svar flaggas i en diskret banner och försöks om
//   vid navigering samt innan testet slutförs.
// - Avsluta-bekräftelse med felvisning och spärrad knapp under avslut.
// =============================================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Flag, AlertCircle, AlertTriangle } from 'lucide-react';

import type { Passage } from '@/lib/numericalTest/types';

import TestProgress from '@/components/tests/numerical-shared/TestProgress';
import PassageDisplay from '@/components/tests/numerical-shared/PassageDisplay';
import QuestionDisplay from '@/components/tests/numerical-shared/QuestionDisplay';

export type NumericalTestLevel = 'grund' | 'avancerad' | 'expert';

interface NumericalTestSessionProps {
  sessionId: string;
  level: NumericalTestLevel;
  selectPassages: (sessionId: string) => Passage[];
  answerEndpoint: string;
  completeEndpoint: string;
  sessionEndpoint: string;
  resultsPath: (sessionId: string) => string;
}

// Svar som ännu inte bekräftats sparat på servern. `failed` sätts först när
// alla automatiska omförsök är förbrukade (det är då bannern visas).
interface PendingAnswer {
  passageId: string;
  questionId: string;
  selectedAnswerId: string;
  timeSpent: number;
  failed: boolean;
}

// Sparade svar från GET-endpointen. Svars-API:t lagrar numeriska svar som
// { questionId, selectedAnswerId, ... } men rehydreringskontraktet beskriver
// { q_id, selected, ... } — vi accepterar båda formerna.
interface SavedAnswerLike {
  q_id?: unknown;
  questionId?: unknown;
  selected?: unknown;
  selectedAnswerId?: unknown;
}

// Backoff mellan omförsök: försök 1 direkt, sedan 500ms och 1500ms paus.
const RETRY_DELAYS = [500, 1500];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function savedQuestionId(a: SavedAnswerLike): string | null {
  if (typeof a?.q_id === 'string') return a.q_id;
  if (typeof a?.questionId === 'string') return a.questionId;
  return null;
}

function savedSelectedId(a: SavedAnswerLike): string | null {
  if (typeof a?.selectedAnswerId === 'string') return a.selectedAnswerId;
  if (typeof a?.selected === 'string') return a.selected;
  return null;
}

export function NumericalTestSession({
  sessionId,
  level,
  selectPassages,
  answerEndpoint,
  completeEndpoint,
  sessionEndpoint,
  resultsPath,
}: NumericalTestSessionProps) {
  const router = useRouter();

  // Seedat urval: stabilt under sessionen, nya frågor vid omspel.
  const passages = useMemo(
    () => selectPassages(sessionId),
    [selectPassages, sessionId]
  );

  // Platt frågelista i visningsordning — används för rehydreringens hopp till
  // första obesvarade fråga.
  const flatQuestions = useMemo(
    () =>
      passages.flatMap((passage, passageIndex) =>
        passage.questions.map((question, questionIndex) => ({
          passageIndex,
          questionIndex,
          question,
        }))
      ),
    [passages]
  );

  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answeredIds, setAnsweredIds] = useState<Set<string>>(() => new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [testStartTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Osparade svar per frågeid. Ref för logiken (stabila referenser i
  // asynkrona kedjor), state-räknaren driver bannern.
  const pendingRef = useRef<Map<string, PendingAnswer>>(new Map());
  const [failedCount, setFailedCount] = useState(0);

  const updateFailedCount = useCallback(() => {
    let n = 0;
    pendingRef.current.forEach((p) => {
      if (p.failed) n++;
    });
    setFailedCount(n);
  }, []);

  // Tids-räknare
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - testStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [testStartTime]);

  const currentPassage = passages[currentPassageIndex];
  const currentQuestion = currentPassage?.questions[currentQuestionIndex];
  const totalQuestions = passages.reduce((sum, p) => sum + p.questions.length, 0);
  const currentQuestionNumber =
    passages.slice(0, currentPassageIndex).reduce((sum, p) => sum + p.questions.length, 0) +
    currentQuestionIndex +
    1;

  const isLastQuestion =
    currentPassageIndex === passages.length - 1 &&
    currentQuestionIndex === currentPassage?.questions.length - 1;

  /* ------------------------- Rehydrering vid mount ------------------------- */

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      let redirected = false;
      try {
        const res = await fetch(`${sessionEndpoint}?id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          // Primärt kontrakt: { session }. Fallback: äldre svar med { sessions }.
          const session =
            data?.session ??
            (Array.isArray(data?.sessions)
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.sessions.find((s: any) => s?.id === sessionId)
              : null);
          if (session && !cancelled) {
            if (session.completed_at) {
              // Redan avslutad session → direkt till resultatet.
              // Behåll laddvyn tills navigeringen sker.
              redirected = true;
              router.replace(resultsPath(sessionId));
              return;
            }
            const saved: SavedAnswerLike[] = Array.isArray(session.answers)
              ? session.answers
              : [];
            if (saved.length > 0) {
              // Sista träffen vinner — svars-API:t appendar vid dubbletter.
              const savedFor = (questionId: string): SavedAnswerLike | null => {
                for (let i = saved.length - 1; i >= 0; i--) {
                  if (savedQuestionId(saved[i]) === questionId) return saved[i];
                }
                return null;
              };

              const restored = new Set<string>();
              flatQuestions.forEach(({ question }) => {
                if (savedFor(question.id)) restored.add(question.id);
              });

              if (restored.size > 0) {
                setAnsweredIds(restored);
                const firstUnanswered = flatQuestions.findIndex(
                  ({ question }) => !restored.has(question.id)
                );
                if (firstUnanswered === -1) {
                  // Allt besvarat men inte slutfört → sista frågan med svaret
                  // förifyllt, så "Slutför test" kan tryckas direkt.
                  const last = flatQuestions[flatQuestions.length - 1];
                  if (last) {
                    setCurrentPassageIndex(last.passageIndex);
                    setCurrentQuestionIndex(last.questionIndex);
                    const hit = savedFor(last.question.id);
                    setSelectedAnswer(hit ? savedSelectedId(hit) : null);
                  }
                } else {
                  const target = flatQuestions[firstUnanswered];
                  setCurrentPassageIndex(target.passageIndex);
                  setCurrentQuestionIndex(target.questionIndex);
                }
              }
            }
          }
        }
        // Icke-ok svar (t.ex. 404): fortsätt med tomt state, blockera inte testet.
      } catch {
        // Nätverksfel: fortsätt med tomt state, blockera inte testet.
      } finally {
        if (!cancelled && !redirected) {
          setIsHydrating(false);
          setQuestionStartTime(Date.now());
        }
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, sessionEndpoint]);

  /* --------------------------- Svarssparning --------------------------- */

  const postAnswer = useCallback(
    async (token: PendingAnswer) => {
      const res = await fetch(answerEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          passageId: token.passageId,
          questionId: token.questionId,
          selectedAnswerId: token.selectedAnswerId,
          timeSpent: token.timeSpent,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to save answer (${res.status})`);
      }
    },
    [answerEndpoint, sessionId]
  );

  // Bakgrundsomförsök efter att första sparningen misslyckats. Avbryts tyst
  // om svaret hunnit ersättas av ett nyare token på samma fråga.
  const retryInBackground = useCallback(
    async (token: PendingAnswer) => {
      for (const delay of RETRY_DELAYS) {
        await sleep(delay);
        if (pendingRef.current.get(token.questionId) !== token) return;
        try {
          await postAnswer(token);
          if (pendingRef.current.get(token.questionId) === token) {
            pendingRef.current.delete(token.questionId);
            updateFailedCount();
          }
          return;
        } catch {
          // Nästa försök efter backoff.
        }
      }
      if (pendingRef.current.get(token.questionId) === token) {
        token.failed = true;
        updateFailedCount();
      }
    },
    [postAnswer, updateFailedCount]
  );

  const saveAnswer = useCallback(
    async (passageId: string, questionId: string, selectedAnswerId: string) => {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const token: PendingAnswer = {
        passageId,
        questionId,
        selectedAnswerId,
        timeSpent,
        failed: false,
      };
      pendingRef.current.set(questionId, token);
      updateFailedCount();
      try {
        await postAnswer(token);
        if (pendingRef.current.get(questionId) === token) {
          pendingRef.current.delete(questionId);
          updateFailedCount();
        }
      } catch {
        // Omförsöken körs i bakgrunden så UI:t inte blockeras.
        void retryInBackground(token);
      }
    },
    [postAnswer, retryInBackground, questionStartTime, updateFailedCount]
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
        entries.map(async ([questionId, token]) => {
          try {
            await postAnswer(token);
            if (pendingRef.current.get(questionId) === token) {
              pendingRef.current.delete(questionId);
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

  /* ----------------------------- Interaktion ----------------------------- */

  const handleNextQuestion = () => {
    if (!selectedAnswer || !currentPassage || !currentQuestion || isNavigating) return;

    const questionId = currentQuestion.id;

    // Spara i bakgrunden — navigeringen ska inte vänta på API-latens.
    // Redan sparade svar (rehydrerade eller efter "Tillbaka" i avsluta-rutan)
    // postas inte om, eftersom svars-API:t appendar och svar inte kan ändras.
    if (!answeredIds.has(questionId)) {
      setAnsweredIds((prev) => {
        const next = new Set(prev);
        next.add(questionId);
        return next;
      });
      void saveAnswer(currentPassage.id, questionId, selectedAnswer);
    }

    if (isLastQuestion) {
      setFinishError(null);
      setShowFinishConfirm(true);
      // Passa på att försöka om svar som fastnat som osparade.
      void flushPending(true);
      return;
    }

    setIsSubmitting(true);
    setIsNavigating(true);

    // Kort paus för konsekvent känsla — blockeras inte av fetch:en ovan.
    setTimeout(() => {
      if (currentQuestionIndex < currentPassage.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentPassageIndex < passages.length - 1) {
        setCurrentPassageIndex(currentPassageIndex + 1);
        setCurrentQuestionIndex(0);
      }
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
      setIsSubmitting(false);
      setIsNavigating(false);
      // Passa på att försöka om svar som fastnat som osparade.
      void flushPending(true);
    }, 150);
  };

  const handleFinishTest = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    setFinishError(null);
    try {
      // Spara eventuella osparade svar innan testet rättas.
      if (pendingRef.current.size > 0) {
        const allSaved = await flushPending(false);
        if (!allSaved) {
          setFinishError(
            'Ett eller flera svar kunde inte sparas. Kontrollera din uppkoppling och försök igen.'
          );
          return;
        }
      }
      const response = await fetch(completeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && !data.error) {
        router.push(resultsPath(sessionId));
      } else {
        setFinishError('Testet kunde inte avslutas. Försök igen om en stund.');
      }
    } catch {
      setFinishError('Testet kunde inte avslutas. Kontrollera din uppkoppling och försök igen.');
    } finally {
      setIsFinishing(false);
    }
  };

  // Laddindikator tills rehydreringen är klar, så användaren inte hinner
  // svara innan tidigare svar hoppats förbi.
  if (isHydrating || !currentPassage || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Laddar test...</p>
        </div>
      </div>
    );
  }

  // Rehydrerade/redan sparade svar går inte att ändra — svars-API:t rättar
  // direkt vid sparning.
  const currentIsLocked = answeredIds.has(currentQuestion.id);

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-4 sm:space-y-5">
        <TestProgress
          currentQuestion={currentQuestionNumber}
          totalQuestions={totalQuestions}
          elapsedSeconds={elapsedSeconds}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={`passage-${currentPassage.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-5"
          >
            <PassageDisplay passage={currentPassage} />

            <QuestionDisplay
              key={currentQuestion.id}
              question={currentQuestion}
              questionNumber={currentQuestionNumber}
              totalQuestions={totalQuestions}
              selectedId={selectedAnswer ?? undefined}
              onSelect={setSelectedAnswer}
              disabled={isSubmitting || isNavigating || currentIsLocked}
            />
          </motion.div>
        </AnimatePresence>

        {/* Diskret varning när något svar inte gått att spara trots omförsök */}
        {failedCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50">
            <AlertTriangle
              className="w-4 h-4 text-amber-600 flex-shrink-0"
              strokeWidth={2.25}
            />
            <p className="text-sm text-amber-800">
              Ett svar kunde inte sparas. Vi försöker igen automatiskt.
            </p>
          </div>
        )}

        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer || isSubmitting || isNavigating}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                     font-bold text-base sm:text-lg text-white min-h-[60px]
                     transition-all hover:-translate-y-0.5 active:translate-y-0
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0
                     touch-manipulation"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 12px 36px -8px rgba(220, 38, 38, 0.5)',
          }}
        >
          {isSubmitting ? (
            level === 'expert' ? (
              'Sparar svar…'
            ) : (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sparar svar…
              </>
            )
          ) : isLastQuestion ? (
            <>
              Slutför test
              <Flag className="w-5 h-5" strokeWidth={2.5} />
            </>
          ) : (
            <>
              Nästa fråga
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>

      {/* Finish Confirmation Modal */}
      <AnimatePresence>
        {showFinishConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFinishConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden"
              style={{ boxShadow: '0 24px 60px -16px rgba(220, 38, 38, 0.4)' }}
            >
              <div
                className="absolute top-0 inset-x-0 h-1"
                style={{
                  background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)',
                }}
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                      boxShadow: '0 6px 14px -4px rgba(249, 115, 22, 0.4)',
                    }}
                  >
                    <AlertCircle className="w-5 h-5" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                      Avsluta testet?
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Du har besvarat <span className="font-bold text-slate-900">{answeredIds.size}</span> av{' '}
                      <span className="font-bold text-slate-900">{totalQuestions}</span> frågor. När du avslutar rättas testet och du får din återkoppling direkt. Svaren kan inte ändras efteråt.
                    </p>
                  </div>
                </div>

                {finishError && (
                  <div className="flex items-start gap-2 mb-4 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50">
                    <AlertTriangle
                      className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
                      strokeWidth={2.25}
                    />
                    <p className="text-sm text-amber-800">{finishError}</p>
                  </div>
                )}

                <div className="flex gap-2 sm:gap-3 mt-5">
                  <button
                    onClick={() => setShowFinishConfirm(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300 hover:text-orange-700 transition-colors min-h-[48px]"
                  >
                    Tillbaka
                  </button>
                  <button
                    onClick={handleFinishTest}
                    disabled={isFinishing}
                    className="flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #DC2626)',
                      boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.45)',
                    }}
                  >
                    {isFinishing ? 'Avslutar…' : 'Avsluta och se resultat'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
