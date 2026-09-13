'use client';

// =============================================================================
// MatrixTestSession, delad testvy för matrislogik grund/avancerad/expert.
// Sidorna under /dashboard/tester/matrislogik-*/test/[sessionId] är tunna
// wrappers som bara skickar in rätt frågeurval, endpoints och resultat-path.
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
import { QuestionGridV7 } from '@/components/tests/logicV7/QuestionGridV7';
import { AnswerOptionsV7 } from '@/components/tests/logicV7/AnswerOptionsV7';
import { QuestionNavigation } from '@/components/tests/logicV4/QuestionNavigation';
import TestFlowShell from '@/components/tests/shared/TestFlowShell';
import TestMeterRow from '@/components/tests/shared/TestMeterRow';
import { useElapsedClock } from '@/hooks/use-elapsed-clock';
import { useTestHintMode } from '@/hooks/use-test-hint-mode';
import type { LayeredQuestion } from '@/lib/logicTestV7/layered.v7';
import type { RunData, SavedAnswer } from '@/app/dashboard/tester/[slug]/getRunData';

export type MatrixTestLevel = 'grund' | 'avancerad' | 'expert';

/** Testets namn i provskalets topprad. Speglar title i testConfig. */
const TITLE_BY_LEVEL: Record<MatrixTestLevel, string> = {
  grund: 'Logiktest, grundnivå',
  avancerad: 'Logiktest, avancerad nivå',
  expert: 'Logiktest, expertnivå',
};

interface MatrixTestSessionProps {
  sessionId: string;
  level: MatrixTestLevel;
  selectQuestions: (sessionId: string) => LayeredQuestion[];
  answerEndpoint: string;
  completeEndpoint: string;
  sessionEndpoint: string;
  resultsPath: (sessionId: string) => string;
  /**
   * Sessionsraden, redan läst på servern av getRunData. Är den `resolved`
   * behöver vi inte hämta den igen, och testet kan målas direkt i stället
   * för att stå bakom en spinner tills ett fetch svarat.
   *
   * Saknas den, eller är den inte `resolved`, körs rehydreringen via fetch
   * precis som förut. Beteendet är detsamma i båda fallen: samma sparade
   * svar förifylls, samma avslutade session skickas till resultatet.
   */
  initialRun?: RunData;
}

/**
 * Bygger upp svarslistan ur sessionens sparade svar.
 *
 * Exakt samma mappning som rehydreringen gjorde tidigare: varje fråga letar
 * upp sitt eget sparade svar på q_id, allt annat blir null. Ordningen på
 * `questions` kommer från selectQuestions och rörs inte.
 */
function restoreAnswers(
  questions: LayeredQuestion[],
  saved: SavedAnswer[]
): { answers: (number | null)[]; firstUnanswered: number } | null {
  if (saved.length === 0) return null;

  const answers = questions.map((q) => {
    const hit = saved.find((a) => a && a.q_id === q.id);
    return hit && typeof hit.selected === 'number' ? hit.selected : null;
  });

  const idx = answers.findIndex((a) => a === null);
  return {
    answers,
    firstUnanswered: idx === -1 ? Math.max(questions.length - 1, 0) : idx,
  };
}

// Svar som ännu inte bekräftats sparat på servern. `failed` sätts först när
// alla automatiska omförsök är förbrukade (det är då bannern visas).
interface PendingAnswer {
  selectedIndex: number;
  timeSpent: number;
  failed: boolean;
}

// Backoff mellan omförsök: försök 1 direkt, sedan 500ms och 1500ms paus.
const RETRY_DELAYS = [500, 1500];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function MatrixTestSession({
  sessionId,
  level,
  selectQuestions,
  answerEndpoint,
  completeEndpoint,
  sessionEndpoint,
  resultsPath,
  initialRun,
}: MatrixTestSessionProps) {
  const router = useRouter();

  // Deterministiskt urval av frågor ur poolen, seedat på sessionId.
  // Samma sessionId → samma frågor (stabilt under sessionen och = resultat-sidan).
  const questions = useMemo(
    () => selectQuestions(sessionId),
    [selectQuestions, sessionId]
  );

  // Servern har redan läst raden: då är rehydreringen klar innan vi monterat.
  // En redan avslutad session behåller laddvyn tills navigeringen skett, precis
  // som fetch-vägen gjorde.
  const serverSession = initialRun?.resolved ? initialRun.session : null;
  const serverCompleted = serverSession?.completedAt != null;
  const serverRestored = useMemo(
    () =>
      serverSession && !serverCompleted
        ? restoreAnswers(questions, serverSession.answers)
        : null,
    [serverSession, serverCompleted, questions]
  );

  const [currentQuestion, setCurrentQuestion] = useState(
    () => serverRestored?.firstUnanswered ?? 0
  );
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => serverRestored?.answers ?? Array(questions.length).fill(null)
  );
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStartedAt] = useState(new Date());
  const elapsed = useElapsedClock(sessionStartedAt);
  const [isSaving, setIsSaving] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  // Serverläst och inte avslutad: ingen väntan, testet målas direkt.
  const [isHydrating, setIsHydrating] = useState(
    () => !(serverSession != null && !serverCompleted)
  );
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  // `hintReady` är false tills det sparade valet lästs ur localStorage.
  // Ledtrådsläget lägger till titel, svårighetsrad och en regelruta ovanför
  // rutnätet, så om vi målar skarpt läge först och sedan slår om växer
  // huvudet och skjuter ner hela matrisen. Det var den andra halvan av
  // CLS 0,111. Nu reserveras höjden tills vi vet vilket läge som gäller.
  const { showHint, toggle: toggleHint, hydrated: hintReady } = useTestHintMode();

  // Osparade svar per frågeindex. Ref för logiken (stabila referenser i
  // asynkrona kedjor), state-räknaren driver bannern.
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
  const answeredQuestions = new Set(
    answers.map((ans, i) => (ans !== null ? i : null)).filter((i): i is number => i !== null)
  );

  // Grund/expert visar 3 svårighetsprickar, avancerad 4 (som tidigare).
  const maxDifficulty = level === 'avancerad' ? 4 : 3;

  /* ------------------------- Rehydrering vid mount ------------------------- */

  useEffect(() => {
    let cancelled = false;

    // Servern läste raden redan. Ingen fetch, ingen andra rundtur.
    if (serverSession) {
      if (serverCompleted) {
        // Redan avslutad session → direkt till resultatet, som förut.
        router.replace(resultsPath(sessionId));
      }
      return;
    }

    const hydrate = async () => {
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
            const saved: Array<{ q_id: string; selected: number }> = Array.isArray(
              session.answers
            )
              ? session.answers
              : [];
            const restored = restoreAnswers(questions, saved);
            if (restored) {
              setAnswers(restored.answers);
              setCurrentQuestion(restored.firstUnanswered);
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
  }, [sessionId, sessionEndpoint, serverSession, serverCompleted]);

  /* --------------------------- Svarssparning --------------------------- */

  const postAnswer = useCallback(
    async (questionIndex: number, selectedIndex: number, timeSpent: number) => {
      const res = await fetch(answerEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: questions[questionIndex].id,
          selectedIndex,
          timeSpent,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to save answer (${res.status})`);
      }
    },
    [answerEndpoint, sessionId, questions]
  );

  // Bakgrundsomförsök efter att första sparningen misslyckats. Avbryts tyst
  // om svaret hunnit ersättas av ett nyare val på samma fråga.
  const retryInBackground = useCallback(
    async (questionIndex: number, token: PendingAnswer) => {
      for (const delay of RETRY_DELAYS) {
        await sleep(delay);
        if (pendingRef.current.get(questionIndex) !== token) return;
        try {
          await postAnswer(questionIndex, token.selectedIndex, token.timeSpent);
          if (pendingRef.current.get(questionIndex) === token) {
            pendingRef.current.delete(questionIndex);
            updateFailedCount();
          }
          return;
        } catch {
          // Nästa försök efter backoff.
        }
      }
      if (pendingRef.current.get(questionIndex) === token) {
        token.failed = true;
        updateFailedCount();
      }
    },
    [postAnswer, updateFailedCount]
  );

  const saveAnswer = useCallback(
    async (questionIndex: number, selectedIndex: number) => {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const token: PendingAnswer = { selectedIndex, timeSpent, failed: false };
      pendingRef.current.set(questionIndex, token);
      updateFailedCount();
      try {
        await postAnswer(questionIndex, selectedIndex, timeSpent);
        if (pendingRef.current.get(questionIndex) === token) {
          pendingRef.current.delete(questionIndex);
          updateFailedCount();
        }
      } catch {
        // Omförsöken körs i bakgrunden så UI:t inte blockeras.
        void retryInBackground(questionIndex, token);
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
        entries.map(async ([qIndex, token]) => {
          try {
            await postAnswer(qIndex, token.selectedIndex, token.timeSpent);
            if (pendingRef.current.get(qIndex) === token) {
              pendingRef.current.delete(qIndex);
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

  const handleSelectAnswer = useCallback(
    (index: number) => {
      // Lås navigering direkt så man inte kan dubbel-hoppa (auto-advance + Nästa).
      if (isNavigating) return;
      setIsSaving(true);
      setIsNavigating(true);

      const newAnswers = [...answers];
      newAnswers[currentQuestion] = index;
      setAnswers(newAnswers);

      // Spara i bakgrunden, auto-hoppet ska inte vänta på API-latens.
      saveAnswer(currentQuestion, index).finally(() => setIsSaving(false));

      // Snabbt auto-hopp till nästa obesvarade. Konsekvent timing eftersom det
      // inte längre blockeras av fetch:en ovan.
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
  };

  // Tangentbordsgenvägar
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
  if (isHydrating) {
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

  return (
    <TestFlowShell
      title={TITLE_BY_LEVEL[level]}
      onExit={() => {
        setFinishError(null);
        setShowFinishConfirm(true);
      }}
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
            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-orange-300 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40 touch-manipulation"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>

          {currentQuestion === questions.length - 1 ? (
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
              disabled={isNavigating}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-4 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40 touch-manipulation"
            >
              Nästa
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      }
    >
        <div className="space-y-5 sm:space-y-6">
          {/*
            Frågan tonar in på plats. Förut sköts den in med x: 12 → 0, och
            eftersom rutnätet och svarsalternativen är sidans största element
            räknades varje sådan inskjutning som ett layoutskifte. Det var en
            av två källor till CLS 0,111 här. Ren opacity flyttar ingenting.
          */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Frågetitel + regel (visas bara i ledtråds-läge) */}
              <QuestionHeader
                index={currentQuestion}
                title={question.title}
                rule={question.rule}
                difficulty={question.difficulty}
                maxDifficulty={maxDifficulty}
                showHint={showHint}
                ready={hintReady}
              />

              {/* Förklarande text på/av */}
              <HintToggle showHint={showHint} onToggle={toggleHint} />

              {/* 3×3 Matris */}
              <QuestionGridV7 grid={question.grid} />

              {/* Svarsalternativ */}
              <div>
                {/*
                  Diskret varning när något svar inte gått att spara trots
                  omförsök. Bannern dyker upp mitt i provet, ovanför
                  svarsalternativen, och sköt förut ner dem med sin fulla höjd.
                  Nu ligger den i en ruta vars höjd är reserverad från början,
                  så ingenting under den rör sig när den kommer eller går.
                */}
                <div
                  aria-live="polite"
                  className="mb-3 min-h-[44px]"
                >
                  {failedCount > 0 && (
                    <div className="flex items-center gap-2 max-w-md sm:max-w-lg mx-auto h-[44px] px-3.5 rounded-xl border border-amber-200 bg-amber-50 [animation:fadeInPlace_0.2s_ease-out]">
                      <AlertTriangle
                        className="w-4 h-4 text-amber-600 flex-shrink-0"
                        strokeWidth={2.25}
                      />
                      <p className="text-sm text-amber-800">
                        Ett svar kunde inte sparas. Vi försöker igen automatiskt.
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-center text-xs sm:text-sm font-semibold text-neutral-500 uppercase tracking-[0.18em] mb-3">
                  Välj rätt svar
                </p>
                <AnswerOptionsV7
                  options={question.options}
                  selectedIndex={answers[currentQuestion]}
                  onSelect={handleSelectAnswer}
                  disabled={isSaving || isNavigating}
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Question Navigation (alltid synlig) */}
          <QuestionNavigation
            totalQuestions={questions.length}
            currentQuestion={currentQuestion}
            answeredQuestions={answeredQuestions}
            onNavigate={handleNavigate}
          />
        </div>

      {/* Finish Confirmation Modal */}
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
                      Du har besvarat <span className="font-bold text-neutral-900">{answeredQuestions.size}</span> av{' '}
                      <span className="font-bold text-neutral-900">{questions.length}</span> frågor. När du avslutar rättas testet och du får din återkoppling direkt. Svaren kan inte ändras efteråt.
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

/* --------- Question header (frågetitel + regel + svårighet) --------- */

function QuestionHeader({
  index,
  title,
  rule,
  difficulty,
  maxDifficulty,
  showHint,
  ready,
}: {
  index: number;
  title: string;
  rule: string;
  difficulty: number;
  maxDifficulty: number;
  showHint: boolean;
  /** false tills det sparade ledtrådsvalet lästs. Då målas ingen av lägena. */
  ready: boolean;
}) {
  // Strippa "FRÅGA X, " från title om det finns
  const cleanTitle = title.replace(/^FRÅGA\s+\d+\s*[--]\s*/i, '');
  const levels = Array.from({ length: maxDifficulty }, (_, i) => i + 1);

  return (
    <div className="text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1.5">
        Fråga {index + 1}
      </div>

      {/* Titel + svårighet + regel visas bara i ledtråds-läge. I skarpt läge ser
          testtagaren bara "Fråga N" + rutnätet, som ett riktigt rekryteringstest. */}
      {!ready ? (
        // Höjden på skarpt läge, reserverad. Vet vi ännu inte vilket läge som
        // gäller målar vi ingetdera, i stället för att måla fel och byta.
        <div className="h-[18px] mb-1" aria-hidden="true" />
      ) : showHint ? (
        <>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight leading-tight mb-3">
            {cleanTitle}
          </h2>

          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
              Svårighet
            </span>
            <div className="flex items-center gap-1">
              {levels.map((level) => (
                <div
                  key={level}
                  className={`w-2 h-2 rounded-full ${level <= difficulty ? 'bg-orange-600' : 'bg-neutral-200'}`}
                />
              ))}
            </div>
          </div>

          <div className="bg-orange-50/60 border border-orange-100 rounded-xl p-4 sm:p-5 max-w-xl mx-auto">
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed text-left">
              {rule}
            </p>
          </div>
        </>
      ) : (
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
            Svårighet
          </span>
          <div className="flex items-center gap-1">
            {levels.map((level) => (
              <div
                key={level}
                className={`w-1.5 h-1.5 rounded-full ${level <= difficulty ? 'bg-orange-600' : 'bg-neutral-200'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function HintToggle({ showHint, onToggle }: { showHint: boolean; onToggle: () => void }) {
  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={showHint}
        className="inline-flex items-center gap-2 px-3 py-1.5 min-h-[44px] rounded-full text-xs font-semibold border border-neutral-200 bg-white text-neutral-600 hover:border-orange-300 hover:text-orange-700 transition-colors touch-manipulation"
      >
        <span
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
            showHint ? 'bg-orange-500' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              showHint ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </span>
        {showHint ? 'Förklarande text på' : 'Förklarande text av'}
      </button>
    </div>
  );
}
