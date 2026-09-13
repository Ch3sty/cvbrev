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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { QuestionGridV7 } from '@/components/tests/logicV7/QuestionGridV7';
import { AnswerOptionsV7 } from '@/components/tests/logicV7/AnswerOptionsV7';
import { QuestionNavigation } from '@/components/tests/logicV4/QuestionNavigation';
import { UnsavedAnswerBanner } from '@/components/tests/prov/UnsavedAnswerBanner';
import TestFlowShell from '@/components/tests/shared/TestFlowShell';
import TestMeterRow from '@/components/tests/shared/TestMeterRow';
import ConfirmDialog from '@/components/shell/ConfirmDialog';
import LoadingSkeleton from '@/components/shell/LoadingSkeleton';
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
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <LoadingSkeleton variant="card" label="Testet laddas" />
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
              className="inline-flex h-11 flex-1 touch-manipulation items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
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
          {/*
            Frågan tonar in på plats, med ren opacity i CSS. Förut sköts den in
            med ett rörelsebibliotek och x: 12 → 0, och eftersom rutnätet och
            svarsalternativen är sidans största element räknades varje sådan
            inskjutning som ett layoutskifte. Det var en av två källor till
            CLS 0,111 här. Ren opacity flyttar ingenting.
          */}
          <div key={currentQuestion} className="space-y-5 [animation:fadeInPlace_0.25s_ease-out] motion-reduce:animate-none">
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
                    <UnsavedAnswerBanner className="mx-auto max-w-md sm:max-w-lg" />
                  )}
                </div>
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

          {/* Question Navigation (alltid synlig) */}
          <QuestionNavigation
            totalQuestions={questions.length}
            currentQuestion={currentQuestion}
            answeredQuestions={answeredQuestions}
            onNavigate={handleNavigate}
          />
        </div>

      {/* Bekräftelse innan provet rättas. */}
      <ConfirmDialog
        open={showFinishConfirm}
        onCancel={() => setShowFinishConfirm(false)}
        onConfirm={handleFinishTest}
        title="Avsluta testet?"
        description={
          finishError
            ? finishError
            : `Du har besvarat ${answeredQuestions.size} av ${questions.length} frågor. När du avslutar rättas testet och du får din återkoppling direkt. Svaren kan inte ändras efteråt.`
        }
        confirmLabel={isFinishing ? 'Avslutar…' : 'Avsluta och se resultat'}
        cancelLabel="Tillbaka"
      />
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
      <p className="mb-1.5 text-steg uppercase text-ink-3">Fråga {index + 1}</p>

      {/* Titel + svårighet + regel visas bara i ledtråds-läge. I skarpt läge ser
          testtagaren bara "Fråga N" + rutnätet, som ett riktigt rekryteringstest. */}
      {!ready ? (
        // Höjden på skarpt läge, reserverad. Vet vi ännu inte vilket läge som
        // gäller målar vi ingetdera, i stället för att måla fel och byta.
        <div className="h-[18px] mb-1" aria-hidden="true" />
      ) : showHint ? (
        <>
          <h2 className="mb-3 text-fraga text-ink-1">{cleanTitle}</h2>

          <div className="mb-3 inline-flex items-center gap-2">
            <span className="text-steg uppercase text-ink-3">Svårighet</span>
            <div className="flex items-center gap-1">
              {levels.map((level) => (
                <div
                  key={level}
                  className={`h-2 w-2 rounded-full ${level <= difficulty ? 'bg-ink-1' : 'bg-kant-stark'}`}
                />
              ))}
            </div>
          </div>

          <div className="mx-auto max-w-xl rounded-xl border border-kant bg-panel p-4 sm:p-5">
            <p className="text-left text-sm leading-relaxed text-ink-2 sm:text-base">{rule}</p>
          </div>
        </>
      ) : (
        <div className="mb-1 inline-flex items-center gap-2">
          <span className="text-steg uppercase text-ink-3">Svårighet</span>
          <div className="flex items-center gap-1">
            {levels.map((level) => (
              <div
                key={level}
                className={`h-1.5 w-1.5 rounded-full ${level <= difficulty ? 'bg-ink-1' : 'bg-kant-stark'}`}
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
        className="inline-flex min-h-11 touch-manipulation items-center gap-2 rounded-md border border-kant bg-panel px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:border-kant-stark hover:text-ink-1"
      >
        <span
          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
            showHint ? 'bg-ink-1' : 'bg-kant-stark'
          }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-panel transition-transform ${
              showHint ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </span>
        {showHint ? 'Förklarande text på' : 'Förklarande text av'}
      </button>
    </div>
  );
}
