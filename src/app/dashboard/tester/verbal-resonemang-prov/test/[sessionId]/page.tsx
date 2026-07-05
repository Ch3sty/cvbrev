'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, AlertCircle, AlertTriangle } from 'lucide-react';

import VerbalTestHeader from '@/components/tests/verbal-shared/VerbalTestHeader';
import PassageDisplay from '@/components/tests/verbal-shared/PassageDisplay';
import StatementList from '@/components/tests/verbal-shared/StatementList';
import PassageNavigation from '@/components/tests/verbal-shared/PassageNavigation';
import { useRobustAnswerSaving } from '@/components/tests/prov/useRobustAnswerSaving';
import { UnsavedAnswerBanner } from '@/components/tests/prov/UnsavedAnswerBanner';
import { fetchProvSession } from '@/components/tests/prov/provSession';
import { selectProvPassagesForSession } from '@/lib/verbalTestProv/selectProv';
import type { UserAnswer } from '@/lib/verbalTestV1/types.v1';

const TOTAL_TIME = 40 * 60;

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function VerbalProvPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
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

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

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
      // Nätverksfel/404: fortsätt med tomt state och klocka från nu — blockera
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
  // men provet rättas oavsett — tidsslutet ska inte kunna blockeras av ett
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
          // Vid tidsslut är modalen inte öppen — öppna den så felet syns.
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
    // Väntar bara in första sparförsöket — omförsök körs i bakgrunden.
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
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  const isLastPassage = currentPassageIndex === questions.length - 1;

  return (
    <div className="min-h-screen">
      <VerbalTestHeader
        currentPassage={currentPassageIndex}
        totalPassages={questions.length}
        answeredCount={answeredCount}
        totalStatements={totalStatements}
        timeRemaining={timeRemaining}
      />

      <div className="container mx-auto py-5 sm:py-6 px-3 sm:px-4 max-w-3xl">
        <div className="space-y-5 sm:space-y-6">
          <div
            className="rounded-2xl px-4 py-2.5 text-center text-white text-xs sm:text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #F97316, #DC2626, #BE185D)' }}
          >
            Prov · passager från alla nivåer · ingen hjälp tillgänglig
          </div>

          {/* Diskret varning när något svar inte gått att spara trots omförsök */}
          {failedCount > 0 && <UnsavedAnswerBanner />}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentPassageIndex}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-5 sm:space-y-6"
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
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2">
            <button
              onClick={handlePrev}
              disabled={currentPassageIndex === 0}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:text-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              Föregående
            </button>
            <button
              onClick={() => {
                setFinishError(null);
                setShowFinishConfirm(true);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm border-2 border-orange-300 bg-white text-orange-700 hover:bg-orange-50 transition-colors min-h-[48px] touch-manipulation"
            >
              <Flag className="w-4 h-4" strokeWidth={2.5} />
              Avsluta prov
            </button>
            <button
              onClick={handleNext}
              disabled={isLastPassage}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 min-h-[48px] touch-manipulation"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
                boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)',
              }}
            >
              Nästa
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

          <PassageNavigation
            totalPassages={questions.length}
            currentPassage={currentPassageIndex}
            answeredPerPassage={answeredPerPassage}
            statementsPerPassage={4}
            onNavigate={handleNavigate}
          />
        </div>
      </div>

      <AnimatePresence>
        {showFinishConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFinishConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden"
              style={{ boxShadow: '0 24px 60px -16px rgba(220, 38, 38, 0.4)' }}
            >
              <div
                className="absolute top-0 inset-x-0 h-1"
                style={{ background: 'linear-gradient(90deg, #FB923C, #DC2626, #BE185D)' }}
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                      boxShadow: '0 6px 14px -4px rgba(249, 115, 22, 0.4)',
                    }}
                  >
                    <AlertCircle className="w-5 h-5" strokeWidth={2.25} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                      Avsluta provet?
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Du har besvarat <span className="font-bold text-slate-900">{answeredCount}</span> av{' '}
                      <span className="font-bold text-slate-900">{totalStatements}</span> påståenden.
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
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-orange-300 hover:text-orange-700 transition-colors min-h-[48px]"
                  >
                    Tillbaka
                  </button>
                  <button
                    onClick={() => void handleFinishTest()}
                    disabled={isFinishing}
                    className="flex-1 px-4 py-3 rounded-xl text-white font-bold text-sm transition-all hover:-translate-y-0.5 min-h-[48px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #DC2626)',
                      boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.45)',
                    }}
                  >
                    {isFinishing ? 'Avslutar…' : 'Avsluta och se resultat'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
