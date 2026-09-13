'use client';

// =============================================================================
// NumericalTestSession, delad testvy för numeriskt test grund/avancerad/expert.
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
import { ArrowRight } from 'lucide-react';

import type { Passage } from '@/lib/numericalTest/types';

import TestFlowShell from '@/components/tests/shared/TestFlowShell';
import TestMeterRow from '@/components/tests/shared/TestMeterRow';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { UnsavedAnswerBanner } from '@/components/tests/prov/UnsavedAnswerBanner';
import { formatClock } from '@/hooks/use-elapsed-clock';
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
// { q_id, selected, ... }, vi accepterar båda formerna.
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

/** Testets namn i provskalets topprad. Speglar title i testConfig. */
const TITLE_BY_LEVEL: Record<'grund' | 'avancerad' | 'expert', string> = {
  grund: 'Numeriskt test, grundnivå',
  avancerad: 'Numeriskt test, avancerad nivå',
  expert: 'Numeriskt test, expertnivå',
};

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

  // Platt frågelista i visningsordning, används för rehydreringens hopp till
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
              // Sista träffen vinner, svars-API:t appendar vid dubbletter.
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

    // Spara i bakgrunden, navigeringen ska inte vänta på API-latens.
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

    // Kort paus för konsekvent känsla, blockeras inte av fetch:en ovan.
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
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <LoadingSkeleton variant="card" label="Testet laddas" />
      </div>
    );
  }

  // Rehydrerade/redan sparade svar går inte att ändra, svars-API:t rättar
  // direkt vid sparning.
  const currentIsLocked = answeredIds.has(currentQuestion.id);

  return (
    <TestFlowShell
      title={TITLE_BY_LEVEL[level]}
      onExit={() => router.push('/dashboard/tester')}
      exitLabel="Lämna testet"
      progressPercent={((currentQuestionNumber - 1) / totalQuestions) * 100}
      meter={
        <TestMeterRow
          time={formatClock(elapsedSeconds)}
          current={currentQuestionNumber}
          total={totalQuestions}
        />
      }
      footer={
        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer || isSubmitting || isNavigating}
          className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? (
            'Sparar svar…'
          ) : isLastQuestion ? (
            'Lämna in'
          ) : (
            <>
              Nästa fråga
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </>
          )}
        </button>
      }
    >
      <div className="space-y-4 sm:space-y-5">

        {/* Passagen tonar in på plats i CSS, den flyttar aldrig något. */}
        <div
          key={`passage-${currentPassage.id}`}
          className="space-y-4 [animation:fadeInPlace_0.25s_ease-out] motion-reduce:animate-none sm:space-y-5"
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
        </div>

        {/* Diskret varning när något svar inte gått att spara trots omförsök */}
        {failedCount > 0 && (
          <UnsavedAnswerBanner />
        )}
      </div>

      {/* Finish Confirmation Modal */}
      {/* Bekräftelse innan testet rättas. */}
      <ConfirmDialog
        open={showFinishConfirm}
        onCancel={() => setShowFinishConfirm(false)}
        onConfirm={handleFinishTest}
        title="Avsluta testet?"
        description={
          finishError
            ? finishError
            : `Du har besvarat ${answeredIds.size} av ${totalQuestions} frågor. När du avslutar rättas testet och du får din återkoppling direkt. Svaren kan inte ändras efteråt.`
        }
        confirmLabel={isFinishing ? 'Avslutar…' : 'Avsluta och se resultat'}
        cancelLabel="Tillbaka"
      />
    </TestFlowShell>
  );
}
