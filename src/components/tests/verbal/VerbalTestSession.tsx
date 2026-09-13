'use client';

// =============================================================================
// VerbalTestSession, delad testvy för verbalt resonemang grund (v1) och
// avancerad (v2). Sidorna under /dashboard/tester/verbal-resonemang*/test/
// [sessionId] är tunna wrappers som bara skickar in rätt frågeurval,
// endpoints och resultat-path. (Expertnivån har ett annat frågeformat -
// argument + flervalsfrågor, och har därför en egen sida.)
//
// Utöver den gemensamma UI:n hanterar komponenten:
// - Rehydrering: vid mount hämtas sessionen så redan sparade svar förifylls
//   och avslutade sessioner skickas direkt till resultatsidan.
// - Robust svarssparning: misslyckade sparningar körs om upp till 3 gånger
//   med backoff, osparade svar flaggas i en diskret banner och försöks om
//   vid navigering samt innan testet slutförs.
// =============================================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, AlertCircle, AlertTriangle } from 'lucide-react';

import TestFlowShell from '@/components/tests/shared/TestFlowShell';
import TestMeterRow from '@/components/tests/shared/TestMeterRow';
import { formatClock } from '@/hooks/use-elapsed-clock';
import PassageDisplay from '@/components/tests/verbal-shared/PassageDisplay';
import StatementList from '@/components/tests/verbal-shared/StatementList';
import PassageNavigation from '@/components/tests/verbal-shared/PassageNavigation';

export type VerbalTestLevel = 'grund' | 'avancerad';

export type VerbalAnswerValue = 'true' | 'false' | 'cannot_say';
type UserAnswer = VerbalAnswerValue | null;

// Strukturell passage-typ som både v1:s och v2:s Question uppfyller.
export interface VerbalSessionPassage {
  id: string;
  title: string;
  topic: string;
  difficulty: 1 | 2 | 3;
  text: string;
  statements: {
    text: string;
    correctAnswer: VerbalAnswerValue;
    explanation?: string;
  }[];
}

interface VerbalTestSessionProps {
  sessionId: string;
  level: VerbalTestLevel;
  selectPassages: (sessionId: string) => VerbalSessionPassage[];
  answerEndpoint: string;
  completeEndpoint: string;
  sessionEndpoint: string;
  resultsPath: (sessionId: string) => string;
}

const TOTAL_TIME = 25 * 60;

// Svar som ännu inte bekräftats sparat på servern. `failed` sätts först när
// alla automatiska omförsök är förbrukade (det är då bannern visas).
interface PendingAnswer {
  passageId: string;
  statementIndex: number;
  answer: VerbalAnswerValue;
  timeSpent: number;
  failed: boolean;
}

// Backoff mellan omförsök: försök 1 direkt, sedan 500ms och 1500ms paus.
const RETRY_DELAYS = [500, 1500];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const pendingKey = (passageId: string, statementIndex: number) =>
  `${passageId}::${statementIndex}`;

/** Testets namn i provskalets topprad. Speglar title i testConfig. */
const TITLE_BY_LEVEL: Record<VerbalTestLevel, string> = {
  grund: 'Verbalt resonemang, grundnivå',
  avancerad: 'Verbalt resonemang, avancerad nivå',
};

export function VerbalTestSession({
  sessionId,
  level,
  selectPassages,
  answerEndpoint,
  completeEndpoint,
  sessionEndpoint,
  resultsPath,
}: VerbalTestSessionProps) {
  const router = useRouter();

  // Seedat urval ur banken: samma sessionId → samma passager (stabilt mellan
  // test- och resultatsida). Olika sessionId → nya frågor vid omspel.
  const questions = useMemo(
    () => selectPassages(sessionId),
    [selectPassages, sessionId]
  );

  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [statementStartTime, setStatementStartTime] = useState(Date.now());

  // Osparade svar per passage+påstående. Ref för logiken (stabila referenser
  // i asynkrona kedjor), state-räknaren driver bannern.
  const pendingRef = useRef<Map<string, PendingAnswer>>(new Map());
  const [failedCount, setFailedCount] = useState(0);

  const updateFailedCount = useCallback(() => {
    let n = 0;
    pendingRef.current.forEach((p) => {
      if (p.failed) n++;
    });
    setFailedCount(n);
  }, []);

  const currentPassage = questions[currentPassageIndex];
  const currentAnswers = answers[currentPassage?.id] || [];
  const totalStatements = questions.reduce((sum, q) => sum + q.statements.length, 0);
  const answeredCount = Object.values(answers).reduce(
    (sum, p) => sum + p.filter((a) => a !== null).length,
    0
  );
  const answeredPerPassage = questions.map(
    (q) => (answers[q.id] || []).filter((a) => a !== null).length
  );

  /* ------------------------- Rehydrering vid mount ------------------------- */

  useEffect(() => {
    if (questions.length === 0) return;
    let cancelled = false;

    const hydrate = async () => {
      // Basrecord med null-svar, sparade svar mergas in nedan.
      const initial: Record<string, UserAnswer[]> = {};
      questions.forEach((q) => {
        initial[q.id] = Array(q.statements.length).fill(null);
      });

      let redirected = false;
      try {
        const res = await fetch(`${sessionEndpoint}?id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          const session = data?.session;
          if (session && !cancelled) {
            if (session.completed_at) {
              // Redan avslutad session → direkt till resultatet.
              // Behåll laddvyn tills navigeringen sker.
              redirected = true;
              router.replace(resultsPath(sessionId));
              return;
            }
            const saved: Array<{
              passageId?: string;
              statementIndex?: number;
              answer?: UserAnswer;
            }> = Array.isArray(session.answers) ? session.answers : [];
            if (saved.length > 0) {
              saved.forEach((a) => {
                if (!a || typeof a.passageId !== 'string') return;
                const arr = initial[a.passageId];
                if (
                  arr &&
                  typeof a.statementIndex === 'number' &&
                  a.statementIndex >= 0 &&
                  a.statementIndex < arr.length &&
                  (a.answer === 'true' || a.answer === 'false' || a.answer === 'cannot_say')
                ) {
                  arr[a.statementIndex] = a.answer;
                }
              });
              // Hoppa till första passagen med obesvarade påståenden.
              const firstIncomplete = questions.findIndex((q) =>
                (initial[q.id] || []).some((v) => v === null)
              );
              setCurrentPassageIndex(
                firstIncomplete === -1 ? Math.max(questions.length - 1, 0) : firstIncomplete
              );
            }
          }
        }
        // Icke-ok svar (t.ex. 404): fortsätt med tomt state, blockera inte testet.
      } catch {
        // Nätverksfel: fortsätt med tomt state, blockera inte testet.
      } finally {
        if (!cancelled && !redirected) {
          setAnswers(initial);
          setIsHydrating(false);
          setStatementStartTime(Date.now());
        }
      }
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, sessionEndpoint, questions]);

  /* --------------------------- Svarssparning --------------------------- */

  const postAnswer = useCallback(
    async (token: PendingAnswer) => {
      const res = await fetch(answerEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          passageId: token.passageId,
          statementIndex: token.statementIndex,
          answer: token.answer,
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
  // om svaret hunnit ersättas av ett nyare val på samma påstående.
  const retryInBackground = useCallback(
    async (key: string, token: PendingAnswer) => {
      for (const delay of RETRY_DELAYS) {
        await sleep(delay);
        if (pendingRef.current.get(key) !== token) return;
        try {
          await postAnswer(token);
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

  const saveAnswer = useCallback(
    async (passageId: string, statementIndex: number, answer: VerbalAnswerValue) => {
      const timeSpent = Math.floor((Date.now() - statementStartTime) / 1000);
      const key = pendingKey(passageId, statementIndex);
      const token: PendingAnswer = { passageId, statementIndex, answer, timeSpent, failed: false };
      pendingRef.current.set(key, token);
      updateFailedCount();
      try {
        await postAnswer(token);
        if (pendingRef.current.get(key) === token) {
          pendingRef.current.delete(key);
          updateFailedCount();
        }
      } catch {
        // Omförsöken körs i bakgrunden så UI:t inte blockeras.
        void retryInBackground(key, token);
      }
    },
    [postAnswer, retryInBackground, statementStartTime, updateFailedCount]
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
            await postAnswer(token);
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

  /* ----------------------------- Slutförande ----------------------------- */

  const handleFinishTest = useCallback(async () => {
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
      if (response.ok && data && (data.success || data.message)) {
        router.push(resultsPath(sessionId));
      } else {
        setFinishError('Testet kunde inte avslutas. Försök igen om en stund.');
      }
    } catch {
      setFinishError('Testet kunde inte avslutas. Kontrollera din uppkoppling och försök igen.');
    } finally {
      setIsFinishing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinishing, flushPending, completeEndpoint, sessionId]);

  // Timer, startar när rehydreringen är klar. När tiden går ut öppnas
  // avsluta-modalen så eventuella fel vid slutförandet syns för användaren.
  useEffect(() => {
    if (isHydrating) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setFinishError(null);
          setShowFinishConfirm(true);
          void handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [handleFinishTest, isHydrating]);

  /* ----------------------------- Interaktion ----------------------------- */

  const handleSelectAnswer = (statementIndex: number, value: VerbalAnswerValue) => {
    if (!currentPassage) return;
    setIsSaving(true);
    const newAnswers = { ...answers };
    newAnswers[currentPassage.id] = [...currentAnswers];
    newAnswers[currentPassage.id][statementIndex] = value;
    setAnswers(newAnswers);
    // Spara i bakgrunden, UI:t ska inte blockeras av API-latens.
    saveAnswer(currentPassage.id, statementIndex, value).finally(() => setIsSaving(false));
    setStatementStartTime(Date.now());
  };

  const handleNavigate = (index: number) => {
    setCurrentPassageIndex(index);
    setStatementStartTime(Date.now());
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // Passa på att försöka om svar som fastnat som osparade.
    void flushPending(true);
  };

  const handlePrev = () => {
    if (currentPassageIndex > 0) handleNavigate(currentPassageIndex - 1);
  };
  const handleNext = () => {
    if (currentPassageIndex < questions.length - 1) handleNavigate(currentPassageIndex + 1);
  };

  // Laddindikator tills rehydreringen är klar, så användaren inte hinner
  // svara innan tidigare svar förifyllts.
  if (isHydrating || !currentPassage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  const isLastPassage = currentPassageIndex === questions.length - 1;

  return (
    <TestFlowShell
      title={TITLE_BY_LEVEL[level]}
      onExit={() => {
        setFinishError(null);
        setShowFinishConfirm(true);
      }}
      exitLabel="Avsluta testet"
      progressPercent={(answeredCount / totalStatements) * 100}
      meter={
        <TestMeterRow
          time={formatClock(timeRemaining)}
          low={timeRemaining < 5 * 60}
          critical={timeRemaining < 60}
          counterLabel="Passage"
          current={currentPassageIndex + 1}
          total={questions.length}
          answered={answeredCount}
        />
      }
      footer={
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrev}
            disabled={currentPassageIndex === 0}
            aria-label="Föregående passage"
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-orange-300 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40 touch-manipulation"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>

          {isLastPassage ? (
            <button
              onClick={() => {
                setFinishError(null);
                setShowFinishConfirm(true);
              }}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 touch-manipulation"
            >
              <Flag className="h-4 w-4" strokeWidth={2.5} />
              Lämna in
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 touch-manipulation"
            >
              Nästa
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      }
    >
        <div className="space-y-5 sm:space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPassageIndex}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5 sm:space-y-6"
            >
              <PassageDisplay
                title={currentPassage.title}
                topic={currentPassage.topic}
                text={currentPassage.text}
                difficulty={currentPassage.difficulty}
                passageNumber={currentPassageIndex + 1}
              />

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

              <StatementList
                statements={currentPassage.statements}
                answers={currentAnswers}
                onAnswer={handleSelectAnswer}
                disabled={isSaving}
              />
            </motion.div>
          </AnimatePresence>

          <PassageNavigation
            totalPassages={questions.length}
            currentPassage={currentPassageIndex}
            answeredPerPassage={answeredPerPassage}
            statementsPerPassage={4}
            onNavigate={handleNavigate}
          />
        </div>

      <AnimatePresence>
        {showFinishConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowFinishConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-xl border border-neutral-200 shadow-lg max-w-md w-full overflow-hidden"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" strokeWidth={2.25} />
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-neutral-900 leading-tight">
                      Avsluta testet?
                    </h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      Du har besvarat <span className="font-bold text-neutral-900">{answeredCount}</span> av{' '}
                      <span className="font-bold text-neutral-900">{totalStatements}</span> påståenden. När du avslutar rättas testet och du får din återkoppling direkt. Svaren kan inte ändras efteråt.
                      {answeredCount < totalStatements && (
                        <span className="block mt-1 text-amber-700">
                          {totalStatements - answeredCount} kvar att besvara.
                        </span>
                      )}
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
                    className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 bg-white text-neutral-700 font-semibold text-sm hover:border-orange-300 hover:text-orange-700 transition-colors min-h-[48px]"
                  >
                    Tillbaka
                  </button>
                  <button
                    onClick={handleFinishTest}
                    disabled={isFinishing}
                    className="flex-1 px-4 py-3 rounded-xl text-white bg-orange-600 hover:bg-orange-700 font-bold text-sm transition-colors min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isFinishing ? 'Avslutar…' : 'Avsluta och se resultat'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TestFlowShell>
  );
}
