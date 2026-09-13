'use client';

// Verbalt resonemang, expertnivån. Frågeformatet (argument + flervalsfrågor,
// linjärt flöde utan backnavigering) skiljer sig från grund/avancerad, så den
// här sidan delar inte VerbalTestSession. Robusthetsförbättringarna är dock
// samma: rehydrering vid mount, svarssparning med omförsök + banner, flush
// innan testet slutförs och synliga fel i stället för tysta.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import { selectPassagesForSession } from '@/lib/verbalTestExpert/selectPassages';
import type { Passage } from '@/lib/numericalTest/types';

import TestFlowShell from '@/components/tests/shared/TestFlowShell';
import TestMeterRow from '@/components/tests/shared/TestMeterRow';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { UnsavedAnswerBanner } from '@/components/tests/prov/UnsavedAnswerBanner';
import { formatClock } from '@/hooks/use-elapsed-clock';
import QuestionDisplay from '@/components/tests/numerical-shared/QuestionDisplay';

interface Props {
  /** Sessionen som körs. Routen har redan packat upp params. */
  sessionId: string;
}

// Svar som ännu inte bekräftats sparat på servern. `failed` sätts först när
// alla automatiska omförsök är förbrukade (det är då bannern visas).
interface PendingAnswer {
  passageId: string;
  selectedAnswerId: string;
  timeSpent: number;
  failed: boolean;
}

// Backoff mellan omförsök: försök 1 direkt, sedan 500ms och 1500ms paus.
const RETRY_DELAYS = [500, 1500];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function VerbalExpertSession({ sessionId: sessionIdProp }: Props) {
  const router = useRouter();
  // Sessionen kommer färdig från routen, så den är aldrig null här.
  const sessionId = sessionIdProp;
  const [passages, setPassages] = useState<Passage[]>([]);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [testStartTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Osparade svar per questionId. Ref för logiken (stabila referenser i
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

  useEffect(() => {
    setPassages(selectPassagesForSession(sessionIdProp));
  }, [sessionIdProp]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - testStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [testStartTime]);

  /* ------------------------- Rehydrering vid mount ------------------------- */

  useEffect(() => {
    if (!sessionId || passages.length === 0) return;
    let cancelled = false;

    const hydrate = async () => {
      let redirected = false;
      try {
        const res = await fetch(`/api/verbalTestExpert/session?id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          const session = data?.session;
          if (session && !cancelled) {
            if (session.completed_at) {
              // Redan avslutad session → direkt till resultatet.
              // Behåll laddvyn tills navigeringen sker.
              redirected = true;
              router.replace(`/dashboard/tester/verbal-resonemang-expert/test/${sessionId}/results`);
              return;
            }
            const saved: Array<{ questionId?: string }> = Array.isArray(session.answers)
              ? session.answers
              : [];
            if (saved.length > 0) {
              const answeredIds = new Set(
                saved.map((a) => a?.questionId).filter((id): id is string => typeof id === 'string')
              );
              // Hoppa till första obesvarade frågan i flödesordning
              // (linjärt flöde, redan besvarade frågor visas inte igen).
              let pIdx = passages.length - 1;
              let qIdx = Math.max(passages[passages.length - 1].questions.length - 1, 0);
              outer: for (let p = 0; p < passages.length; p++) {
                for (let q = 0; q < passages[p].questions.length; q++) {
                  if (!answeredIds.has(passages[p].questions[q].id)) {
                    pIdx = p;
                    qIdx = q;
                    break outer;
                  }
                }
              }
              setCurrentPassageIndex(pIdx);
              setCurrentQuestionIndex(qIdx);
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
  }, [sessionId, passages]);

  /* --------------------------- Svarssparning --------------------------- */

  const postAnswer = useCallback(
    async (questionId: string, token: PendingAnswer) => {
      const res = await fetch('/api/verbalTestExpert/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          passageId: token.passageId,
          questionId,
          selectedAnswerId: token.selectedAnswerId,
          timeSpent: token.timeSpent,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to save answer (${res.status})`);
      }
    },
    [sessionId]
  );

  // Bakgrundsomförsök efter att första sparningen misslyckats.
  const retryInBackground = useCallback(
    async (questionId: string, token: PendingAnswer) => {
      for (const delay of RETRY_DELAYS) {
        await sleep(delay);
        if (pendingRef.current.get(questionId) !== token) return;
        try {
          await postAnswer(questionId, token);
          if (pendingRef.current.get(questionId) === token) {
            pendingRef.current.delete(questionId);
            updateFailedCount();
          }
          return;
        } catch {
          // Nästa försök efter backoff.
        }
      }
      if (pendingRef.current.get(questionId) === token) {
        token.failed = true;
        updateFailedCount();
      }
    },
    [postAnswer, updateFailedCount]
  );

  const saveAnswer = useCallback(
    async (questionId: string, token: PendingAnswer) => {
      pendingRef.current.set(questionId, token);
      updateFailedCount();
      try {
        await postAnswer(questionId, token);
        if (pendingRef.current.get(questionId) === token) {
          pendingRef.current.delete(questionId);
          updateFailedCount();
        }
      } catch {
        // Omförsöken körs i bakgrunden så UI:t inte blockeras.
        void retryInBackground(questionId, token);
      }
    },
    [postAnswer, retryInBackground, updateFailedCount]
  );

  // Försök spara om osparade svar. onlyFailed=true tar bara de vars
  // omförsökskedja redan gett upp. Returnerar true om inget osparat återstår.
  const flushPending = useCallback(
    async (onlyFailed: boolean): Promise<boolean> => {
      const entries = Array.from(pendingRef.current.entries()).filter(
        ([, p]) => !onlyFailed || p.failed
      );
      await Promise.all(
        entries.map(async ([questionId, token]) => {
          try {
            await postAnswer(questionId, token);
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

  /* ----------------------------- Interaktion ----------------------------- */

  const handleNextQuestion = async () => {
    // isSubmitting fungerar också som dubbelklicksspärr under slutförandet.
    if (!selectedAnswer || !sessionId || !currentPassage || !currentQuestion || isSubmitting) {
      return;
    }
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const token: PendingAnswer = {
      passageId: currentPassage.id,
      selectedAnswerId: selectedAnswer,
      timeSpent,
      failed: false,
    };

    if (!isLastQuestion) {
      // Spara i bakgrunden, nästa fråga ska inte vänta på API-latens.
      void saveAnswer(currentQuestion.id, token);
      if (currentQuestionIndex < currentPassage.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setCurrentPassageIndex(currentPassageIndex + 1);
        setCurrentQuestionIndex(0);
      }
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
      // Passa på att försöka om svar som fastnat som osparade.
      void flushPending(true);
      return;
    }

    // Sista frågan: spara allt osparat innan testet rättas, och visa fel i
    // stället för att slutföra tyst.
    setIsSubmitting(true);
    setFinishError(null);
    pendingRef.current.set(currentQuestion.id, token);
    updateFailedCount();
    try {
      const allSaved = await flushPending(false);
      if (!allSaved) {
        setFinishError(
          'Ett eller flera svar kunde inte sparas. Kontrollera din uppkoppling och försök igen.'
        );
        return;
      }
      const response = await fetch('/api/verbalTestExpert/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && data.score !== undefined) {
        router.push(`/dashboard/tester/verbal-resonemang-expert/test/${sessionId}/results`);
      } else {
        setFinishError('Testet kunde inte avslutas. Försök igen om en stund.');
      }
    } catch {
      setFinishError('Testet kunde inte avslutas. Kontrollera din uppkoppling och försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Laddindikator tills rehydreringen är klar, så användaren inte hinner
  // svara innan positionen i testet återställts.
  if (isHydrating || !currentPassage || !currentQuestion) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <LoadingSkeleton variant="card" label="Testet laddas" />
      </div>
    );
  }

  return (
    <TestFlowShell
      title="Verbalt resonemang, expertnivå"
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
          disabled={!selectedAnswer || isSubmitting}
          className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? (
            'Avslutar…'
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

        {/* Argumentet tonar in på plats i CSS, det flyttar aldrig något. */}
        <div
          key={`passage-${currentPassage.id}`}
          className="space-y-4 [animation:fadeInPlace_0.25s_ease-out] motion-reduce:animate-none sm:space-y-5"
        >
            {/* Argument */}
            <section className="space-y-3">
              <div>
                <p className="mb-0.5 text-steg uppercase text-ink-3">
                  Argument · {currentPassage.topic}
                </p>
                <h2 className="text-fraga text-ink-1">{currentPassage.title}</h2>
              </div>
              <div className="rounded-xl border border-kant bg-panel p-4 text-sm leading-[22px] text-ink-2 sm:p-5 sm:text-base">
                {currentPassage.contextText.split('\n\n').map((para, i) => (
                  <p key={i} className={i > 0 ? 'mt-3' : ''}>
                    {para.trim()}
                  </p>
                ))}
              </div>
            </section>

            <QuestionDisplay
              key={currentQuestion.id}
              question={currentQuestion}
              questionNumber={currentQuestionNumber}
              totalQuestions={totalQuestions}
              selectedId={selectedAnswer ?? undefined}
              onSelect={setSelectedAnswer}
              disabled={isSubmitting}
            />
        </div>

        {/* Diskret varning när något svar inte gått att spara trots omförsök */}
        {failedCount > 0 && (
          <UnsavedAnswerBanner />
        )}

        {/* Fel vid slutförande visas i stället för att testet avslutas tyst */}
        {finishError && (
          <UnsavedAnswerBanner message={finishError} />
        )}
      </div>
    </TestFlowShell>
  );
}
