'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Flag } from 'lucide-react';

import { selectProvPassagesForSession } from '@/lib/numericalTestProv/selectProv';
import type { Passage } from '@/lib/numericalTest/types';

import TestProgress from '@/components/tests/numerical-shared/TestProgress';
import PassageDisplay from '@/components/tests/numerical-shared/PassageDisplay';
import QuestionDisplay from '@/components/tests/numerical-shared/QuestionDisplay';
import { useRobustAnswerSaving } from '@/components/tests/prov/useRobustAnswerSaving';
import { UnsavedAnswerBanner } from '@/components/tests/prov/UnsavedAnswerBanner';
import { fetchProvSession } from '@/components/tests/prov/provSession';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function NumericalProvPage({ params }: PageProps) {
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

  useEffect(() => {
    params.then((p) => {
      setSessionId(p.sessionId);
      setPassages(selectProvPassagesForSession(p.sessionId));
    });
  }, [params]);

  /* ------------------------- Rehydrering vid mount ------------------------- */

  // Vid mount hämtas sessionen så att en omladdning återupptar provet där det
  // var: avslutade prov skickas till resultatsidan, annars hoppar vi till
  // första obesvarade frågan (flödet är enkelriktat — tidigare svar behöver
  // inte fyllas i lokalt). Obs: numeriska provet har ingen hård tidsgräns —
  // klockan är bara en uppåträknare och rättningstiden räknas server-side per
  // svar, så den ankras inte i started_at.
  useEffect(() => {
    if (!sessionId || passages.length === 0) return;
    let cancelled = false;

    const hydrate = async () => {
      const session = await fetchProvSession('/api/numericalTestProv/session', sessionId);
      if (cancelled) return;
      if (session?.completed_at) {
        // Redan avslutat prov → direkt till resultatet. Behåll laddvyn tills
        // navigeringen sker.
        router.replace(`/dashboard/tester/numeriskt-test-prov/test/${sessionId}/results`);
        return;
      }
      if (session && session.answers.length > 0) {
        const saved = session.answers as Array<{ questionId?: string; selectedAnswerId?: string }>;
        const answeredIds = new Set(
          saved.filter((a) => a && typeof a.questionId === 'string').map((a) => a.questionId)
        );
        // Första obesvarade frågan i passage-ordning.
        let passageIdx = -1;
        let questionIdx = -1;
        outer: for (let p = 0; p < passages.length; p++) {
          for (let q = 0; q < passages[p].questions.length; q++) {
            if (!answeredIds.has(passages[p].questions[q].id)) {
              passageIdx = p;
              questionIdx = q;
              break outer;
            }
          }
        }
        if (passageIdx === -1) {
          // Allt besvarat men provet inte rättat: stå på sista frågan med
          // svaret förifyllt så att "Slutför prov" kan tryckas direkt.
          passageIdx = passages.length - 1;
          questionIdx = passages[passageIdx].questions.length - 1;
          const lastId = passages[passageIdx].questions[questionIdx].id;
          const savedAnswer = saved.find((a) => a && a.questionId === lastId);
          if (savedAnswer && typeof savedAnswer.selectedAnswerId === 'string') {
            setSelectedAnswer(savedAnswer.selectedAnswerId);
          }
        }
        setCurrentPassageIndex(passageIdx);
        setCurrentQuestionIndex(questionIdx);
      }
      // Nätverksfel/404: fortsätt från början som tidigare — blockera aldrig provet.
      setIsHydrating(false);
      setQuestionStartTime(Date.now());
    };

    void hydrate();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, passages]);

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

  /* --------------------------- Svarssparning --------------------------- */

  const postAnswer = useCallback(
    async (payload: {
      passageId: string;
      questionId: string;
      selectedAnswerId: string;
      timeSpent: number;
    }) => {
      const res = await fetch('/api/numericalTestProv/answer', {
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

  const handleCompleteTest = async () => {
    if (!sessionId) return;
    try {
      const response = await fetch('/api/numericalTestProv/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (!response.ok) {
        setFinishError('Provet kunde inte avslutas. Försök igen om en stund.');
        return;
      }
      router.push(`/dashboard/tester/numeriskt-test-prov/test/${sessionId}/results`);
    } catch {
      setFinishError('Provet kunde inte avslutas. Kontrollera din uppkoppling och försök igen.');
    }
  };

  const handleNextQuestion = async () => {
    if (!selectedAnswer || !sessionId || !currentPassage || !currentQuestion || isSubmitting) {
      return;
    }
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const payload = {
      passageId: currentPassage.id,
      questionId: currentQuestion.id,
      selectedAnswerId: selectedAnswer,
      timeSpent,
    };

    if (isLastQuestion) {
      // Sista frågan: vänta in sparningen och flusha allt osparat innan
      // provet rättas — fel visas i stället för att svar tyst tappas.
      setIsSubmitting(true);
      setFinishError(null);
      try {
        await robustSave(currentQuestion.id, payload);
        if (hasPending()) {
          const allSaved = await flushPending(false);
          if (!allSaved) {
            setFinishError(
              'Ett eller flera svar kunde inte sparas. Kontrollera din uppkoppling och försök igen.'
            );
            return;
          }
        }
        await handleCompleteTest();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Spara i bakgrunden (med automatiska omförsök) och gå vidare direkt —
    // provet ska inte blockeras av API-latens.
    void robustSave(currentQuestion.id, payload);
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
  };

  if (!currentPassage || !currentQuestion || isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Laddar prov...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-3xl">
      <div className="space-y-4 sm:space-y-5">
        <div
          className="rounded-2xl px-4 py-2.5 text-center text-white text-xs sm:text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #F97316, #DC2626, #BE185D)' }}
        >
          Prov · frågor från alla nivåer · ingen hjälp tillgänglig
        </div>

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
            <PassageDisplay passage={currentPassage} />
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
        {failedCount > 0 && <UnsavedAnswerBanner />}

        {/* Fel vid slutförande visas i stället för att tyst sluka misslyckandet */}
        {finishError && <UnsavedAnswerBanner message={finishError} />}

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
            'Sparar svar…'
          ) : isLastQuestion ? (
            <>
              Slutför prov
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
