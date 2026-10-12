'use client';

// =============================================================================
// FigurserieTestSession: testvyn för figurserier grund/avancerad/expert
// (beställningen omgång 2, A6 punkt 4; figurserier-spec.md 1 och 6).
//
// Samma flöde som MatrixTestSession (rehydrering ur getRunData, svarssparning
// med omförsök och banner, Lämna in med bekräftelse), men raden ritas som en
// remsa med luckan sist och alternativen står sex i bredd i en 640-kolumn på
// dator. Frågorna kommer från servern utan facit
// (src/lib/figurserierV1/fragor.server.ts). Ingen ledtråd och ingen regel
// under testet: genomgången efter testet bär regeln och misstaget.
// =============================================================================

import { KNAPP_PRIMAR_SMAL } from '@/components/shell/knappar';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FigurserieAlternativ, FigurserieRad } from './FigurserieRad';
import { QuestionNavigation } from '@/components/tests/logicV4/QuestionNavigation';
import { UnsavedAnswerBanner } from '@/components/tests/prov/UnsavedAnswerBanner';
import TestFlowShell from '@/components/tests/shared/TestFlowShell';
import TestMeterRow from '@/components/tests/shared/TestMeterRow';
import { talord } from '@/lib/traning/copy';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { useElapsedClock } from '@/hooks/use-elapsed-clock';
import { visatForSvar } from '@/lib/logicTestV7/blanda';
import type { VisadSerie } from '@/lib/figurserierV1/types';
import type { RunData, SavedAnswer } from '@/app/dashboard/tester/[slug]/getRunData';

export type FigurserieNiva = 'grund' | 'avancerad' | 'expert';

/** Testets namn i provskalets topprad. Speglar title i testConfig. */
const TITLE_BY_LEVEL: Record<FigurserieNiva, string> = {
  grund: 'Figurserier, grundnivå',
  avancerad: 'Figurserier, avancerad nivå',
  expert: 'Figurserier, expertnivå',
};

/** Frågeraden ovanför kortet (spec 1): gränssnittstext, hör inte till figuren. */
export const SERIE_FRAGA = 'Vilken figur kommer härnäst?';

interface Props {
  sessionId: string;
  level: FigurserieNiva;
  answerEndpoint: string;
  completeEndpoint: string;
  sessionEndpoint: string;
  resultsPath: (sessionId: string) => string;
  /** Sessionsraden, redan läst på servern (getRunData). Annars hämtar vyn själv. */
  initialRun?: RunData;
}

function restoreAnswers(questions: VisadSerie[], saved: SavedAnswer[]) {
  if (saved.length === 0) return null;
  const answers = questions.map((q) => visatForSvar(saved.find((a) => a && a.q_id === q.id)));
  const idx = answers.findIndex((a) => a === null);
  return { answers, firstUnanswered: idx === -1 ? Math.max(questions.length - 1, 0) : idx };
}

interface PendingAnswer {
  selectedIndex: number;
  timeSpent: number;
  failed: boolean;
}
const RETRY_DELAYS = [500, 1500];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function FigurserieTestSession({ sessionId, level, answerEndpoint, completeEndpoint, sessionEndpoint, resultsPath, initialRun }: Props) {
  const router = useRouter();
  const serverSession = initialRun?.resolved ? initialRun.session : null;
  const [questions, setQuestions] = useState<VisadSerie[]>(() => (serverSession?.serie as VisadSerie[] | undefined) ?? []);
  const [loadFailed, setLoadFailed] = useState(false);
  const serverCompleted = serverSession?.completedAt != null;
  const serverRestored = useMemo(
    () => (serverSession && !serverCompleted ? restoreAnswers(questions, serverSession.answers) : null),
    [serverSession, serverCompleted, questions]
  );
  const [currentQuestion, setCurrentQuestion] = useState(() => serverRestored?.firstUnanswered ?? 0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => serverRestored?.answers ?? Array(questions.length).fill(null));
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStartedAt] = useState(new Date());
  const elapsed = useElapsedClock(sessionStartedAt);
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isHydrating, setIsHydrating] = useState(() => !(serverSession != null && !serverCompleted && questions.length > 0));
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const pendingRef = useRef<Map<number, PendingAnswer>>(new Map());
  const [failedCount, setFailedCount] = useState(0);

  const updateFailedCount = useCallback(() => {
    let n = 0;
    pendingRef.current.forEach((p) => {
      if (p.failed) n++;
    });
    setFailedCount(n);
  }, []);

  const question = questions[currentQuestion];
  const answeredQuestions = new Set(answers.map((a, i) => (a !== null ? i : null)).filter((i): i is number => i !== null));

  /* Rehydrering vid mount, bara när servern inte läste raden. */
  useEffect(() => {
    let cancelled = false;
    if (serverSession && (serverCompleted || questions.length > 0)) {
      if (serverCompleted) router.replace(resultsPath(sessionId));
      return;
    }
    const hydrate = async () => {
      let redirected = false;
      try {
        const res = await fetch(`${sessionEndpoint}?id=${sessionId}`);
        if (!res.ok) {
          if (!cancelled) setLoadFailed(true);
          return;
        }
        const data = await res.json();
        const session = data?.session;
        if (!session || cancelled) return;
        if (session.completed_at) {
          redirected = true;
          router.replace(resultsPath(sessionId));
          return;
        }
        const fragor: VisadSerie[] = Array.isArray(data?.fragor) ? data.fragor : [];
        if (fragor.length === 0) {
          setLoadFailed(true);
          return;
        }
        setQuestions(fragor);
        const restored = restoreAnswers(fragor, Array.isArray(session.answers) ? session.answers : []);
        setAnswers(restored?.answers ?? Array(fragor.length).fill(null));
        setCurrentQuestion(restored?.firstUnanswered ?? 0);
      } catch {
        setLoadFailed(true);
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
  }, [sessionId, sessionEndpoint, serverSession, serverCompleted]);

  /* Svarssparning */
  const postAnswer = useCallback(
    async (qi: number, selectedIndex: number, timeSpent: number) => {
      const res = await fetch(answerEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, questionId: questions[qi].id, selectedIndex, timeSpent }),
      });
      if (!res.ok) throw new Error(`Failed to save answer (${res.status})`);
    },
    [answerEndpoint, sessionId, questions]
  );

  const retryInBackground = useCallback(
    async (qi: number, token: PendingAnswer) => {
      for (const delay of RETRY_DELAYS) {
        await sleep(delay);
        if (pendingRef.current.get(qi) !== token) return;
        try {
          await postAnswer(qi, token.selectedIndex, token.timeSpent);
          if (pendingRef.current.get(qi) === token) {
            pendingRef.current.delete(qi);
            updateFailedCount();
          }
          return;
        } catch {
          // nästa försök
        }
      }
      if (pendingRef.current.get(qi) === token) {
        token.failed = true;
        updateFailedCount();
      }
    },
    [postAnswer, updateFailedCount]
  );

  const saveAnswer = useCallback(
    async (qi: number, selectedIndex: number) => {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const token: PendingAnswer = { selectedIndex, timeSpent, failed: false };
      pendingRef.current.set(qi, token);
      updateFailedCount();
      try {
        await postAnswer(qi, selectedIndex, timeSpent);
        if (pendingRef.current.get(qi) === token) {
          pendingRef.current.delete(qi);
          updateFailedCount();
        }
      } catch {
        void retryInBackground(qi, token);
      }
    },
    [postAnswer, retryInBackground, questionStartTime, updateFailedCount]
  );

  const flushPending = useCallback(
    async (onlyFailed: boolean): Promise<boolean> => {
      const entries = Array.from(pendingRef.current.entries()).filter(([, p]) => !onlyFailed || p.failed);
      await Promise.all(
        entries.map(async ([qi, token]) => {
          try {
            await postAnswer(qi, token.selectedIndex, token.timeSpent);
            if (pendingRef.current.get(qi) === token) pendingRef.current.delete(qi);
          } catch {
            // kvar som osparat
          }
        })
      );
      updateFailedCount();
      return pendingRef.current.size === 0;
    },
    [postAnswer, updateFailedCount]
  );

  /* Interaktion */
  const handleSelectAnswer = useCallback(
    (index: number) => {
      if (isNavigating) return;
      setIsSaving(true);
      setIsNavigating(true);
      const next = [...answers];
      next[currentQuestion] = index;
      setAnswers(next);
      saveAnswer(currentQuestion, index).finally(() => setIsSaving(false));
      setTimeout(() => {
        const nextUnanswered = next.findIndex((a, i) => i > currentQuestion && a === null);
        if (nextUnanswered !== -1) {
          setCurrentQuestion(nextUnanswered);
          setQuestionStartTime(Date.now());
        } else if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setQuestionStartTime(Date.now());
        }
        setIsNavigating(false);
        void flushPending(true);
      }, 150);
    },
    [answers, currentQuestion, saveAnswer, isNavigating, questions.length, flushPending]
  );

  const goTo = (i: number) => {
    setCurrentQuestion(i);
    setQuestionStartTime(Date.now());
    void flushPending(true);
  };
  const handlePrev = () => {
    if (currentQuestion > 0) goTo(currentQuestion - 1);
  };
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) goTo(currentQuestion + 1);
  };

  const handleFinishTest = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    setFinishError(null);
    try {
      if (pendingRef.current.size > 0 && !(await flushPending(false))) {
        setFinishError('Ett eller flera svar kunde inte sparas. Kontrollera din uppkoppling och försök igen.');
        return;
      }
      const response = await fetch(completeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await response.json().catch(() => null);
      if (response.ok && data && (data.success || data.message)) router.push(resultsPath(sessionId));
      else setFinishError('Testet kunde inte avslutas. Försök igen om en stund.');
    } catch {
      setFinishError('Testet kunde inte avslutas. Kontrollera din uppkoppling och försök igen.');
    } finally {
      setIsFinishing(false);
    }
  };

  // Tangentbord: pilar mellan frågorna, A till F väljer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      const index = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(e.key.toLowerCase());
      if (question && index >= 0 && index < question.options.length) handleSelectAnswer(index);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, question, handleSelectAnswer]);

  if (loadFailed) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">
          <h2 className="text-kort text-ink-1">Testet gick inte att ladda</h2>
          <p className="mt-2 text-sm leading-[22px] text-ink-2">Dina sparade svar finns kvar. Kontrollera uppkopplingen och ladda om sidan.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto"
          >
            Ladda om
          </button>
        </div>
      </div>
    );
  }

  if (isHydrating || !question) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <LoadingSkeleton variant="card" label="Testet laddas" />
      </div>
    );
  }

  const oppnaAvsluta = () => {
    setFinishError(null);
    setShowFinishConfirm(true);
  };

  return (
    <TestFlowShell
      title={TITLE_BY_LEVEL[level]}
      onExit={oppnaAvsluta}
      progressPercent={(answeredQuestions.size / questions.length) * 100}
      meter={<TestMeterRow time={elapsed} counterLabel="Uppgift" current={currentQuestion + 1} total={questions.length} answered={answeredQuestions.size} />}
      footer={
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0 || isNavigating}
            aria-label="Föregående uppgift"
            className="inline-flex h-11 w-11 flex-shrink-0 touch-manipulation items-center justify-center rounded-lg border border-kant-stark bg-panel text-ink-1 transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          {currentQuestion === questions.length - 1 ? (
            <button onClick={oppnaAvsluta} className={`${KNAPP_PRIMAR_SMAL} flex-1 touch-manipulation`}>
              Lämna in
            </button>
          ) : (
            <button onClick={handleNext} disabled={isNavigating} className={`${KNAPP_PRIMAR_SMAL} flex-1 touch-manipulation disabled:cursor-not-allowed`}>
              Nästa
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      }
    >
      <div className="serie-kolumn mx-auto w-full max-w-[640px] space-y-5 sm:space-y-6" data-figurserie>
        {/* Frågan tonar in på plats med ren opacity: ingenting flyttar sig (CLS 0). */}
        <div key={currentQuestion} className="space-y-3.5 [animation:fadeInPlace_0.25s_ease-out] motion-reduce:animate-none">
          {/* Numret står i mätraden (copy-avrundning 5); frågan står ensam. */}
          <p className="text-sm font-semibold leading-[18px] text-ink-1">{SERIE_FRAGA}</p>
          <FigurserieRad rad={question.rad} />
          <FigurserieAlternativ options={question.options} valt={answers[currentQuestion]} onValj={handleSelectAnswer} disabled={isSaving || isNavigating} />
          {/* Varningen om osparade svar står under alternativen i en ruta med
              reserverad höjd, så att varken raden eller alternativen flyttar sig. */}
          <div aria-live="polite" className="min-h-[44px]">
            {failedCount > 0 && <UnsavedAnswerBanner className="mx-auto max-w-md sm:max-w-lg" />}
          </div>
        </div>
        <QuestionNavigation totalQuestions={questions.length} currentQuestion={currentQuestion} answeredQuestions={answeredQuestions} onNavigate={goTo} />
      </div>

      <ConfirmDialog
        open={showFinishConfirm}
        onCancel={() => setShowFinishConfirm(false)}
        onConfirm={handleFinishTest}
        title="Lämna in testet?"
        description={
          finishError
            ? finishError
            : `Du har svarat på ${talord(answeredQuestions.size)} av ${talord(questions.length)} uppgifter. När du lämnar in rättas testet och du får genomgången direkt. Svaren går inte att ändra efteråt.`
        }
        confirmLabel={isFinishing ? 'Avslutar…' : 'Lämna in och se resultatet'}
        cancelLabel="Tillbaka"
      />
    </TestFlowShell>
  );
}
