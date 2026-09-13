'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { QuestionGridV7 } from '@/components/tests/logicV7/QuestionGridV7';
import { AnswerOptionsV7 } from '@/components/tests/logicV7/AnswerOptionsV7';
import { QuestionNavigation } from '@/components/tests/logicV4/QuestionNavigation';
import TestFlowShell from '@/components/tests/shared/TestFlowShell';
import TestMeterRow from '@/components/tests/shared/TestMeterRow';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { useElapsedClock } from '@/hooks/use-elapsed-clock';
import { useRobustAnswerSaving } from '@/components/tests/prov/useRobustAnswerSaving';
import { UnsavedAnswerBanner } from '@/components/tests/prov/UnsavedAnswerBanner';
import { fetchProvSession } from '@/components/tests/prov/provSession';
import {
  selectProvQuestionsForSession,
  PROV_TOTAL_QUESTIONS,
} from '@/lib/logicTestV7/selectProv.v7';

interface Props {
  /** Sessionen som körs. Routen har redan packat upp params. */
  sessionId: string;
}

export default function MatrisProvSession({ sessionId: sessionIdProp }: Props) {
  const router = useRouter();
  // Sessionen kommer färdig från routen, så den är aldrig null här.
  const sessionId = sessionIdProp;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(PROV_TOTAL_QUESTIONS).fill(null)
  );
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStartedAt] = useState(new Date());
  const elapsed = useElapsedClock(sessionStartedAt);
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  // Prov-urval: blandade frågor från alla nivåer, seedat på sessionId.
  const questions = useMemo(
    () => (sessionId ? selectProvQuestionsForSession(sessionId) : []),
    [sessionId]
  );

  const question = questions[currentQuestion];
  const answeredQuestions = new Set(
    answers.map((ans, i) => (ans !== null ? i : null)).filter((i): i is number => i !== null)
  );

  /* ------------------------- Rehydrering vid mount ------------------------- */

  // Vid mount hämtas sessionen så redan sparade svar förifylls efter en
  // omladdning, och avslutade sessioner skickas direkt till resultatsidan.
  // Obs: matrislogik-provet har ingen hård tidsgräns, klockan i headern är
  // bara en uppåträknare och rättningstiden räknas server-side per svar.
  useEffect(() => {
    if (!sessionId || questions.length === 0) return;
    let cancelled = false;

    const hydrate = async () => {
      const session = await fetchProvSession('/api/logicTestProv/session', sessionId);
      if (cancelled) return;
      if (session?.completed_at) {
        // Redan avslutat prov → direkt till resultatet. Behåll laddvyn tills
        // navigeringen sker.
        router.replace(`/dashboard/tester/matrislogik-prov/test/${sessionId}/results`);
        return;
      }
      if (session && session.answers.length > 0) {
        const saved = session.answers as Array<{ q_id?: string; selected?: number }>;
        const restored = questions.map((q) => {
          const hit = saved.find((a) => a && a.q_id === q.id);
          return hit && typeof hit.selected === 'number' ? hit.selected : null;
        });
        setAnswers(restored);
        const firstUnanswered = restored.findIndex((a) => a === null);
        setCurrentQuestion(
          firstUnanswered === -1 ? Math.max(questions.length - 1, 0) : firstUnanswered
        );
      }
      setIsHydrating(false);
      setQuestionStartTime(Date.now());
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  /* --------------------------- Svarssparning --------------------------- */

  const postAnswer = useCallback(
    async (payload: { questionId: string; selectedIndex: number; timeSpent: number }) => {
      const res = await fetch('/api/logicTestProv/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...payload }),
      });
      if (!res.ok) {
        throw new Error(`Failed to save answer (${res.status})`);
      }
    },
    [sessionId]
  );

  const {
    saveAnswer: robustSave,
    flushPending,
    hasPending,
    failedCount,
  } = useRobustAnswerSaving(postAnswer);

  const saveAnswer = useCallback(
    async (questionIndex: number, selectedIndex: number) => {
      if (!sessionId) return;
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const questionId = questions[questionIndex].id;
      await robustSave(questionId, { questionId, selectedIndex, timeSpent });
    },
    [sessionId, questionStartTime, questions, robustSave]
  );

  const handleFinishTest = useCallback(async () => {
    if (!sessionId || isFinishing) return;
    setIsFinishing(true);
    setFinishError(null);
    try {
      // Spara eventuella osparade svar innan provet rättas.
      if (hasPending()) {
        const allSaved = await flushPending(false);
        if (!allSaved) {
          setFinishError(
            'Ett eller flera svar kunde inte sparas. Kontrollera din uppkoppling och försök igen.'
          );
          return;
        }
      }
      const response = await fetch('/api/logicTestProv/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && (data.success || data.message)) {
        router.push(`/dashboard/tester/matrislogik-prov/test/${sessionId}/results`);
      } else {
        setFinishError('Provet kunde inte avslutas. Försök igen om en stund.');
      }
    } catch {
      setFinishError('Provet kunde inte avslutas. Kontrollera din uppkoppling och försök igen.');
    } finally {
      setIsFinishing(false);
    }
  }, [sessionId, router, isFinishing, hasPending, flushPending]);

  const handleSelectAnswer = useCallback(
    (index: number) => {
      if (isNavigating) return;
      setIsSaving(true);
      setIsNavigating(true);

      const newAnswers = [...answers];
      newAnswers[currentQuestion] = index;
      setAnswers(newAnswers);

      saveAnswer(currentQuestion, index).finally(() => setIsSaving(false));

      setTimeout(() => {
        const nextUnanswered = newAnswers.findIndex(
          (ans, i) => i > currentQuestion && ans === null
        );
        if (nextUnanswered !== -1) {
          setCurrentQuestion(nextUnanswered);
          setQuestionStartTime(Date.now());
        } else if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setQuestionStartTime(Date.now());
        }
        setIsNavigating(false);
        // Passa på att försöka om svar som fastnat som osparade.
        void flushPending(true);
      }, 150);
    },
    [answers, currentQuestion, saveAnswer, isNavigating, questions.length, flushPending]
  );

  const handleNavigate = (index: number) => {
    setCurrentQuestion(index);
    setQuestionStartTime(Date.now());
    void flushPending(true);
  };
  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setQuestionStartTime(Date.now());
      void flushPending(true);
    }
  };
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setQuestionStartTime(Date.now());
      void flushPending(true);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      const letterKeys = ['a', 'b', 'c', 'd', 'e', 'f'];
      const index = letterKeys.indexOf(e.key.toLowerCase());
      if (question && index >= 0 && index < question.options.length) {
        handleSelectAnswer(index);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, question, handleSelectAnswer]);

  // Laddindikator tills rehydreringen är klar, så användaren inte hinner
  // svara innan tidigare svar förifyllts.
  if (!sessionId || isHydrating) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <LoadingSkeleton variant="card" label="Provet laddas" />
      </div>
    );
  }

  return (
    <TestFlowShell
      title="Logikprov"
      onExit={() => {
        setFinishError(null);
        setShowFinishConfirm(true);
      }}
      exitLabel="Avsluta provet"
      progressPercent={(answeredQuestions.size / questions.length) * 100}
      meter={
        <TestMeterRow
          time={elapsed}
          current={currentQuestion + 1}
          total={questions.length}
          answered={answeredQuestions.size}
        />
      }
      footer={
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0 || isNavigating}
            aria-label="Föregående fråga"
            className="inline-flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-lg border border-kant-stark bg-panel text-ink-1 transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>

          {currentQuestion === questions.length - 1 ? (
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
              disabled={isNavigating}
              className="inline-flex h-11 flex-1 touch-manipulation items-center justify-center gap-1.5 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Nästa
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      }
    >
        <div className="space-y-5 sm:space-y-6">
          {/* Prov-banner */}
          <div className="rounded-lg border border-kant bg-insunken px-4 py-2.5 text-center text-meta text-ink-2 shadow-insunken">
            Prov · frågor från alla nivåer · ingen hjälp tillgänglig
          </div>

          {/* Frågan tonar in på plats i CSS, den flyttar aldrig något. */}
          <div
            key={currentQuestion}
            className="space-y-5 [animation:fadeInPlace_0.25s_ease-out] motion-reduce:animate-none"
          >
              {/* Skarpt prov-läge: bara "Fråga N" + svårighet, ingen titel/regel. */}
              <div className="text-center">
                <p className="mb-1.5 text-steg uppercase text-ink-3">
                  Fråga {currentQuestion + 1}
                </p>
                <div className="inline-flex items-center gap-2">
                  <span className="text-steg uppercase text-ink-3">Svårighet</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 w-1.5 rounded-full ${level <= question.difficulty ? 'bg-ink-1' : 'bg-kant-stark'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Inaktiv förklarings-toggle: visar att hjälp finns men inte i prov. */}
              <DisabledHintToggle />

              <QuestionGridV7 grid={question.grid} />

              <div>
                {/* Diskret varning när något svar inte gått att spara trots omförsök */}
                {failedCount > 0 && (
                  <UnsavedAnswerBanner className="max-w-md sm:max-w-lg mx-auto mb-3" />
                )}
                <p className="mb-3 text-center text-steg uppercase text-ink-3">
                  Välj rätt svar
                </p>
                <AnswerOptionsV7
                  options={question.options}
                  selectedIndex={answers[currentQuestion]}
                  onSelect={handleSelectAnswer}
                  disabled={isSaving || isNavigating}
                />
              </div>
          </div>

          <QuestionNavigation
            totalQuestions={questions.length}
            currentQuestion={currentQuestion}
            answeredQuestions={answeredQuestions}
            onNavigate={handleNavigate}
          />
        </div>

      {/* Bekräftelse innan provet lämnas in. */}
      <ConfirmDialog
        open={showFinishConfirm}
        onCancel={() => setShowFinishConfirm(false)}
        onConfirm={handleFinishTest}
        title="Avsluta provet?"
        description={
          finishError
            ? finishError
            : `Du har besvarat ${answeredQuestions.size} av ${questions.length} frågor. Du kan inte gå tillbaka efter avslut.`
        }
        confirmLabel={isFinishing ? 'Avslutar…' : 'Avsluta och se resultat'}
        cancelLabel="Tillbaka"
      />
    </TestFlowShell>
  );
}

/** Förklarings-toggle, inaktiverad i prov-läge. Visar att hjälpen finns men inte under prov. */
function DisabledHintToggle() {
  return (
    <p className="text-center text-meta text-ink-3">
      Förklarande text är inte tillgänglig under prov.
    </p>
  );
}
