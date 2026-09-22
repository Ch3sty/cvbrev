'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import TestFlowShell from '@/components/tests/shared/TestFlowShell';
import TestMeterRow from '@/components/tests/shared/TestMeterRow';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { formatClock } from '@/hooks/use-elapsed-clock';
import PassageDisplay from '@/components/tests/verbal-shared/PassageDisplay';
import StatementList from '@/components/tests/verbal-shared/StatementList';
import PassageNavigation from '@/components/tests/verbal-shared/PassageNavigation';
import { useRobustAnswerSaving } from '@/components/tests/prov/useRobustAnswerSaving';
import { UnsavedAnswerBanner } from '@/components/tests/prov/UnsavedAnswerBanner';
import { fetchProvSession } from '@/components/tests/prov/provSession';
import { getTestConfig } from '@/app/dashboard/tester/testConfig';
import { selectProvPassagesForSession } from '@/lib/verbalTestProv/selectProv';
import type { UserAnswer } from '@/lib/verbalTestV1/types.v1';

// Tidsgränsen bor i testConfig, så copyn och koden aldrig glider isär
// (docs/plan-paket-och-onboarding.md, Fas 2B noten till T47).
const TOTAL_TIME = ((getTestConfig('verbal-resonemang-prov')?.examMinutes ?? 40) * 60);

interface Props {
  /** Sessionen som körs. Routen har redan packat upp params. */
  sessionId: string;
}

export default function VerbalProvSession({ sessionId: sessionIdProp }: Props) {
  const router = useRouter();
  // Sessionen kommer färdig från routen, så den är aldrig null här.
  const sessionId = sessionIdProp;
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer[]>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  // Nedräkningen ankras i sessionens started_at (servertid) så att en
  // omladdning inte ger mer provtid. Sätts när rehydreringen är klar.
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [statementStartTime, setStatementStartTime] = useState(Date.now());
  const finishedRef = useRef(false);

  const questions = useMemo(
    () => (sessionId ? selectProvPassagesForSession(sessionId) : []),
    [sessionId]
  );

  useEffect(() => {
    if (questions.length === 0) return;
    const initial: Record<string, UserAnswer[]> = {};
    questions.forEach((q) => {
      initial[q.id] = Array(q.statements.length).fill(null);
    });
    setAnswers(initial);
  }, [questions]);

  /* ------------------------- Rehydrering vid mount ------------------------- */

  // Hämtar sessionen så att redan sparade svar förifylls efter en omladdning,
  // avslutade prov skickas till resultatsidan och nedräkningen fortsätter
  // från sessionens started_at i stället för att börja om på 40 minuter.
  useEffect(() => {
    if (!sessionId || questions.length === 0) return;
    let cancelled = false;

    const hydrate = async () => {
      const session = await fetchProvSession('/api/verbalTestProv/session', sessionId);
      if (cancelled) return;
      if (session?.completed_at) {
        // Redan avslutat prov → direkt till resultatet. Behåll laddvyn tills
        // navigeringen sker.
        router.replace(`/dashboard/tester/verbal-resonemang-prov/test/${sessionId}/results`);
        return;
      }
      let started = Date.now();
      if (session) {
        if (session.started_at) {
          const t = new Date(session.started_at).getTime();
          if (Number.isFinite(t)) started = t;
        }
        if (session.answers.length > 0) {
          const saved = session.answers as Array<{
            passageId?: string;
            statementIndex?: number;
            answer?: UserAnswer;
          }>;
          const restored: Record<string, UserAnswer[]> = {};
          questions.forEach((q) => {
            restored[q.id] = Array(q.statements.length).fill(null);
          });
          saved.forEach((a) => {
            if (!a || typeof a.passageId !== 'string' || typeof a.statementIndex !== 'number') {
              return;
            }
            const arr = restored[a.passageId];
            if (arr && a.answer && a.statementIndex >= 0 && a.statementIndex < arr.length) {
              arr[a.statementIndex] = a.answer;
            }
          });
          setAnswers(restored);
          // Hoppa till första passagen med obesvarade påståenden.
          const firstIncomplete = questions.findIndex((q) =>
            restored[q.id].some((ans) => ans === null)
          );
          setCurrentPassageIndex(
            firstIncomplete === -1 ? Math.max(questions.length - 1, 0) : firstIncomplete
          );
        }
      }
      // Nätverksfel/404: fortsätt med tomt state och klocka från nu, blockera
      // aldrig provet.
      setStartedAtMs(started);
      setTimeRemaining(Math.max(0, TOTAL_TIME - Math.floor((Date.now() - started) / 1000)));
      setIsHydrating(false);
      setStatementStartTime(Date.now());
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

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

  /* --------------------------- Svarssparning --------------------------- */

  const postAnswer = useCallback(
    async (payload: {
      passageId: string;
      statementIndex: number;
      answer: 'true' | 'false' | 'cannot_say';
      timeSpent: number;
    }) => {
      const res = await fetch('/api/verbalTestProv/answer', {
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

  // force=true används när tiden gått ut: osparade svar flushas då best effort
  // men provet rättas oavsett, tidsslutet ska inte kunna blockeras av ett
  // svar som inte gick att spara.
  const handleFinishTest = useCallback(
    async (force = false) => {
      if (!sessionId || finishedRef.current) return;
      finishedRef.current = true;
      setIsFinishing(true);
      setFinishError(null);
      try {
        // Spara eventuella osparade svar innan provet rättas.
        if (hasPending()) {
          const allSaved = await flushPending(false);
          if (!allSaved && !force) {
            setFinishError(
              'Ett eller flera svar kunde inte sparas. Kontrollera din uppkoppling och försök igen.'
            );
            finishedRef.current = false;
            return;
          }
        }
        const response = await fetch('/api/verbalTestProv/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        if (response.ok) {
          router.push(`/dashboard/tester/verbal-resonemang-prov/test/${sessionId}/results`);
        } else {
          setFinishError('Provet kunde inte avslutas. Försök igen om en stund.');
          finishedRef.current = false;
          // Vid tidsslut är modalen inte öppen, öppna den så felet syns.
          if (force) setShowFinishConfirm(true);
        }
      } catch {
        setFinishError('Provet kunde inte avslutas. Kontrollera din uppkoppling och försök igen.');
        finishedRef.current = false;
        if (force) setShowFinishConfirm(true);
      } finally {
        setIsFinishing(false);
      }
    },
    [sessionId, router, hasPending, flushPending]
  );

  // Nedräkning från sessionens started_at (inte från omladdningstillfället).
  // Räknas om från klockan varje tick, så pauser i bakgrundsflikar och
  // omladdningar aldrig ger mer provtid. Är tiden redan ute vid rehydrering
  // auto-slutförs provet direkt (samma mönster som när klockan når noll).
  useEffect(() => {
    if (isHydrating || startedAtMs === null) return;
    const compute = () =>
      Math.max(0, TOTAL_TIME - Math.floor((Date.now() - startedAtMs) / 1000));
    const initial = compute();
    setTimeRemaining(initial);
    if (initial <= 0) {
      void handleFinishTest(true);
      return;
    }
    const timer = setInterval(() => {
      const remaining = compute();
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        void handleFinishTest(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isHydrating, startedAtMs, handleFinishTest]);

  const handleSelectAnswer = async (
    statementIndex: number,
    value: 'true' | 'false' | 'cannot_say'
  ) => {
    if (!sessionId) return;
    setIsSaving(true);
    const newAnswers = { ...answers };
    newAnswers[currentPassage.id] = [...currentAnswers];
    newAnswers[currentPassage.id][statementIndex] = value;
    setAnswers(newAnswers);
    const timeSpent = Math.floor((Date.now() - statementStartTime) / 1000);
    // Väntar bara in första sparförsöket, omförsök körs i bakgrunden.
    await robustSave(`${currentPassage.id}:${statementIndex}`, {
      passageId: currentPassage.id,
      statementIndex,
      answer: value,
      timeSpent,
    });
    setStatementStartTime(Date.now());
    setIsSaving(false);
  };

  const handleNavigate = (index: number) => {
    setCurrentPassageIndex(index);
    setStatementStartTime(Date.now());
    // Passa på att försöka om svar som fastnat som osparade.
    void flushPending(true);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handlePrev = () => {
    if (currentPassageIndex > 0) handleNavigate(currentPassageIndex - 1);
  };
  const handleNext = () => {
    if (currentPassageIndex < questions.length - 1) handleNavigate(currentPassageIndex + 1);
  };

  // Laddindikator tills rehydreringen är klar, så användaren inte hinner
  // svara innan tidigare svar förifyllts och klockan ankrats i started_at.
  if (!currentPassage || !sessionId || isHydrating) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <LoadingSkeleton variant="card" label="Provet laddas" />
      </div>
    );
  }

  const isLastPassage = currentPassageIndex === questions.length - 1;

  return (
    <TestFlowShell
      title="Verbalt prov"
      onExit={() => {
        setFinishError(null);
        setShowFinishConfirm(true);
      }}
      exitLabel="Avsluta provet"
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
          <div className="rounded-lg border border-kant bg-insunken px-4 py-2.5 text-center text-meta text-ink-2 shadow-insunken">
            Prov · passager från alla nivåer · ingen hjälp tillgänglig
          </div>

          {/* Diskret varning när något svar inte gått att spara trots omförsök */}
          {failedCount > 0 && <UnsavedAnswerBanner />}

          {/* Frågan tonar in på plats i CSS, den flyttar aldrig något. */}
          <div
            key={currentPassageIndex}
            className="space-y-5 sm:space-y-6 [animation:fadeInPlace_0.25s_ease-out] motion-reduce:animate-none"
          >
              <PassageDisplay
                title={currentPassage.title}
                topic={currentPassage.topic}
                text={currentPassage.text}
                difficulty={currentPassage.difficulty}
                passageNumber={currentPassageIndex + 1}
              />
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

      {/* Bekräftelse innan provet lämnas in. */}
      <ConfirmDialog
        open={showFinishConfirm}
        onCancel={() => setShowFinishConfirm(false)}
        onConfirm={handleFinishTest}
        title="Avsluta provet?"
        description={
          finishError
            ? finishError
            : `Du har besvarat ${answeredCount} av ${totalStatements} påståenden. Du kan inte gå tillbaka efter avslut.`
        }
        confirmLabel={isFinishing ? 'Avslutar…' : 'Avsluta och se resultat'}
        cancelLabel="Tillbaka"
      />
    </TestFlowShell>
  );
}
