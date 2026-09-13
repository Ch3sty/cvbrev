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
import { ChevronLeft, ChevronRight } from 'lucide-react';

import TestFlowShell from '@/components/tests/shared/TestFlowShell';
import TestMeterRow from '@/components/tests/shared/TestMeterRow';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { UnsavedAnswerBanner } from '@/components/tests/prov/UnsavedAnswerBanner';
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
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <LoadingSkeleton variant="card" label="Testet laddas" />
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
            className="inline-flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-lg border border-kant-stark bg-panel text-ink-1 transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>

          {isLastPassage ? (
            <button
              onClick={() => {
                setFinishError(null);
                setShowFinishConfirm(true);
              }}
              className="inline-flex h-11 flex-1 touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
            >
              Lämna in
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="inline-flex h-11 flex-1 touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
            >
              Nästa
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      }
    >
        <div className="space-y-5 sm:space-y-6">
          {/* Passagen tonar in på plats i CSS, den flyttar aldrig något. */}
          <div
            key={currentPassageIndex}
            className="space-y-5 [animation:fadeInPlace_0.25s_ease-out] motion-reduce:animate-none sm:space-y-6"
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
                <UnsavedAnswerBanner />
              )}

              <StatementList
                statements={currentPassage.statements}
                answers={currentAnswers}
                onAnswer={handleSelectAnswer}
                disabled={isSaving}
              />
          </div>

          <PassageNavigation
            totalPassages={questions.length}
            currentPassage={currentPassageIndex}
            answeredPerPassage={answeredPerPassage}
            statementsPerPassage={4}
            onNavigate={handleNavigate}
          />
        </div>

      {/* Bekräftelse innan testet rättas. */}
      <ConfirmDialog
        open={showFinishConfirm}
        onCancel={() => setShowFinishConfirm(false)}
        onConfirm={handleFinishTest}
        title="Avsluta testet?"
        description={
          finishError
            ? finishError
            : `Du har besvarat ${answeredCount} av ${totalStatements} påståenden. När du avslutar rättas testet och du får din återkoppling direkt. Svaren kan inte ändras efteråt.`
        }
        confirmLabel={isFinishing ? 'Avslutar…' : 'Avsluta och se resultat'}
        cancelLabel="Tillbaka"
      />
    </TestFlowShell>
  );
}
