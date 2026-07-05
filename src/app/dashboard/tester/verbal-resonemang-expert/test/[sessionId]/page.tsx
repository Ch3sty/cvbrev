'use client';

// Verbalt resonemang — expertnivån. Frågeformatet (argument + flervalsfrågor,
// linjärt flöde utan backnavigering) skiljer sig från grund/avancerad, så den
// här sidan delar inte VerbalTestSession. Robusthetsförbättringarna är dock
// samma: rehydrering vid mount, svarssparning med omförsök + banner, flush
// innan testet slutförs och synliga fel i stället för tysta.

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRight, Flag, Scale } from 'lucide-react';

import { selectPassagesForSession } from '@/lib/verbalTestExpert/selectPassages';
import type { Passage } from '@/lib/numericalTest/types';

import TestProgress from '@/components/tests/numerical-shared/TestProgress';
import QuestionDisplay from '@/components/tests/numerical-shared/QuestionDisplay';

interface PageProps {
  params: Promise<{ sessionId: string }>;
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

export default function VerbalExpertTestPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
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
    params.then((p) => {
      setSessionId(p.sessionId);
      setPassages(selectPassagesForSession(p.sessionId));
    });
  }, [params]);

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
              // (linjärt flöde — redan besvarade frågor visas inte igen).
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
      // Spara i bakgrunden — nästa fråga ska inte vänta på API-latens.
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Laddar test...</p>
        </div>
      </div>
    );
  }

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
            {/* Argument */}
            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #F97316 0%, #DC2626 100%)',
                    boxShadow: '0 6px 14px -4px rgba(220, 38, 38, 0.35)',
                  }}
                >
                  <Scale className="w-5 h-5" strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700 mb-0.5">
                    Argument · {currentPassage.topic}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                    {currentPassage.title}
                  </h2>
                </div>
              </div>
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed bg-orange-50/40 border border-orange-100 rounded-2xl p-4 sm:p-5">
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
          </motion.div>
        </AnimatePresence>

        {/* Diskret varning när något svar inte gått att spara trots omförsök */}
        {failedCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" strokeWidth={2.25} />
            <p className="text-sm text-amber-800">
              Ett svar kunde inte sparas. Vi försöker igen automatiskt.
            </p>
          </div>
        )}

        {/* Fel vid slutförande visas i stället för att testet avslutas tyst */}
        {finishError && (
          <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-amber-50">
            <AlertTriangle
              className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"
              strokeWidth={2.25}
            />
            <p className="text-sm text-amber-800">{finishError}</p>
          </div>
        )}

        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer || isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base sm:text-lg text-white min-h-[60px] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 touch-manipulation"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
            boxShadow: '0 12px 36px -8px rgba(220, 38, 38, 0.5)',
          }}
        >
          {isSubmitting ? (
            'Avslutar…'
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
    </div>
  );
}
