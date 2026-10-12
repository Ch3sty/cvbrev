'use client';

// =============================================================================
// DeduktivTestSession: testvyn för deduktiv slutledning grund/avancerad/expert
// (beställningen omgång 3, B1; deduktiv-spec.md 1).
//
// Samma flöde som FigurserieTestSession (rehydrering ur getRunData,
// svarssparning med omförsök och banner, Lämna in med bekräftelse), men
// uppgiften är text: villkoren klistrade överst (vänsterspalt från 1024 px),
// frågan och alternativen som rader. Ett val markeras först och skickas med
// "Svara" (spec 1, foten). Lösningsgången visas inte under testet, bara i
// genomgången. Uppgifterna levereras av servern utan facit
// (src/lib/deduktivV1/fragor.server.ts).
// =============================================================================

import { KNAPP_PRIMAR_SMAL } from '@/components/shell/knappar';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { QuestionNavigation } from '@/components/tests/logicV4/QuestionNavigation';
import { UnsavedAnswerBanner } from '@/components/tests/prov/UnsavedAnswerBanner';
import TestFlowShell from '@/components/tests/shared/TestFlowShell';
import TestMeterRow from '@/components/tests/shared/TestMeterRow';
import { talord } from '@/lib/traning/copy';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
import { useElapsedClock } from '@/hooks/use-elapsed-clock';
import { visatForSvar } from '@/lib/logicTestV7/blanda';
import type { VisadDeduktiv } from '@/lib/deduktivV1/types';
import type { RunData, SavedAnswer } from '@/app/dashboard/tester/[slug]/getRunData';
import { DeduktivAlternativ, DeduktivLayout, Fragerad, Villkorskort, BOKSTAV } from './DeduktivFraga';

export type DeduktivNivaVy = 'grund' | 'avancerad' | 'expert';

/** Testets namn i provskalets topprad. Speglar title i testConfig. */
const TITLE_BY_LEVEL: Record<DeduktivNivaVy, string> = {
  grund: 'Deduktiv slutledning, grundnivå',
  avancerad: 'Deduktiv slutledning, avancerad nivå',
  expert: 'Deduktiv slutledning, expertnivå',
};

interface Props {
  sessionId: string;
  level: DeduktivNivaVy;
  answerEndpoint: string;
  completeEndpoint: string;
  sessionEndpoint: string;
  resultsPath: (sessionId: string) => string;
  initialRun?: RunData;
}

function restoreAnswers(questions: VisadDeduktiv[], saved: SavedAnswer[]) {
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

export function DeduktivTestSession({ sessionId, level, answerEndpoint, completeEndpoint, sessionEndpoint, resultsPath, initialRun }: Props) {
  const router = useRouter();
  const serverSession = initialRun?.resolved ? initialRun.session : null;
  const [questions, setQuestions] = useState<VisadDeduktiv[]>(() => (serverSession?.deduktiv as VisadDeduktiv[] | undefined) ?? []);
  const [loadFailed, setLoadFailed] = useState(false);
  const serverCompleted = serverSession?.completedAt != null;
  const serverRestored = useMemo(
    () => (serverSession && !serverCompleted ? restoreAnswers(questions, serverSession.answers) : null),
    [serverSession, serverCompleted, questions]
  );
  const [currentQuestion, setCurrentQuestion] = useState(() => serverRestored?.firstUnanswered ?? 0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => serverRestored?.answers ?? Array(questions.length).fill(null));
  /** Markerat men inte skickat (spec 1.1, "Valt, inte skickat"). */
  const [markerat, setMarkerat] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStartedAt] = useState(new Date());
  const elapsed = useElapsedClock(sessionStartedAt);
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
  const valt = markerat ?? answers[currentQuestion] ?? null;

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
        const fragor: VisadDeduktiv[] = Array.isArray(data?.fragor) ? data.fragor : [];
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

  const goTo = useCallback(
    (i: number) => {
      setCurrentQuestion(i);
      setMarkerat(null);
      setQuestionStartTime(Date.now());
      // Ny uppgift börjar överst, med villkoren synliga.
      const main = typeof document !== 'undefined' ? document.querySelector('main') : null;
      if (main && typeof main.scrollTo === 'function') main.scrollTo({ top: 0 });
      void flushPending(true);
    },
    [flushPending]
  );

  /** "Svara": sparar det markerade och går till nästa obesvarade, annars nästa. */
  const handleSvara = useCallback(() => {
    if (isNavigating || valt === null) return;
    const andrat = markerat !== null && markerat !== answers[currentQuestion];
    const next = [...answers];
    if (andrat) {
      next[currentQuestion] = markerat;
      setAnswers(next);
      void saveAnswer(currentQuestion, markerat as number);
    }
    setIsNavigating(true);
    setTimeout(() => {
      const nextUnanswered = next.findIndex((a, i) => i > currentQuestion && a === null);
      if (nextUnanswered !== -1) goTo(nextUnanswered);
      else if (currentQuestion < questions.length - 1) goTo(currentQuestion + 1);
      else setMarkerat(null);
      setIsNavigating(false);
    }, 120);
  }, [answers, currentQuestion, goTo, isNavigating, markerat, questions.length, saveAnswer, valt]);

  const handlePrev = () => {
    if (currentQuestion > 0) goTo(currentQuestion - 1);
  };

  const handleFinishTest = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    setFinishError(null);
    try {
      // Ett markerat men inte skickat svar på sista uppgiften sparas först.
      if (markerat !== null && markerat !== answers[currentQuestion]) {
        const next = [...answers];
        next[currentQuestion] = markerat;
        setAnswers(next);
        await saveAnswer(currentQuestion, markerat);
      }
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

  // Tangentbord: A till E markerar, Enter svarar, vänsterpil bakåt.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Enter' && valt !== null && currentQuestion < questions.length - 1) handleSvara();
      const index = BOKSTAV.toLowerCase().indexOf(e.key.toLowerCase());
      if (question && index >= 0 && index < question.options.length && e.key.length === 1) setMarkerat(index);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, question, handleSvara, valt]);

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
  const sista = currentQuestion === questions.length - 1;

  return (
    <TestFlowShell
      bred
      title={TITLE_BY_LEVEL[level]}
      onExit={oppnaAvsluta}
      progressPercent={(answeredQuestions.size / questions.length) * 100}
      meter={<TestMeterRow time={elapsed} counterLabel="Uppgift" current={currentQuestion + 1} total={questions.length} answered={answeredQuestions.size} />}
      footer={
        <div className="mx-auto flex w-full items-center gap-2 sm:gap-3 lg:max-w-[480px]">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0 || isNavigating}
            aria-label="Föregående uppgift"
            className="inline-flex h-12 w-12 flex-shrink-0 touch-manipulation items-center justify-center rounded-lg border border-kant-stark bg-panel text-ink-1 transition-colors hover:bg-insunken disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          {sista ? (
            <button onClick={oppnaAvsluta} className={`${KNAPP_PRIMAR_SMAL} h-12 flex-1 touch-manipulation`}>
              Lämna in
            </button>
          ) : (
            <button
              onClick={handleSvara}
              disabled={valt === null || isNavigating}
              aria-disabled={valt === null}
              className={`${KNAPP_PRIMAR_SMAL} h-12 flex-1 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Svara
            </button>
          )}
        </div>
      }
    >
      <div key={currentQuestion} className="[animation:fadeInPlace_0.25s_ease-out] motion-reduce:animate-none">
        <DeduktivLayout
          villkor={<Villkorskort intro={question.intro} villkor={question.villkor} premisser={question.intro == null} />}
          hoger={
            <>
              <Fragerad nr={currentQuestion + 1} antal={questions.length} fraga={question.fraga} forsta={currentQuestion === 0} nummer="ingen" />
              <DeduktivAlternativ options={question.options} valt={valt} onValj={setMarkerat} disabled={isNavigating} />
              <div aria-live="polite" className="min-h-[44px]">
                {failedCount > 0 && <UnsavedAnswerBanner className="mx-auto max-w-md sm:max-w-lg" />}
              </div>
              <QuestionNavigation totalQuestions={questions.length} currentQuestion={currentQuestion} answeredQuestions={answeredQuestions} onNavigate={goTo} />
            </>
          }
        />
      </div>

      <ConfirmDialog
        open={showFinishConfirm}
        onCancel={() => setShowFinishConfirm(false)}
        onConfirm={handleFinishTest}
        title="Lämna in testet?"
        description={
          finishError
            ? finishError
            : `Du har svarat på ${talord(answeredQuestions.size + (markerat !== null && answers[currentQuestion] === null ? 1 : 0))} av ${talord(questions.length)} uppgifter. När du lämnar in rättas testet och du får lösningsgången direkt. Svaren går inte att ändra efteråt.`
        }
        confirmLabel={isFinishing ? 'Avslutar…' : 'Lämna in och se resultatet'}
        cancelLabel="Tillbaka"
      />
    </TestFlowShell>
  );
}
