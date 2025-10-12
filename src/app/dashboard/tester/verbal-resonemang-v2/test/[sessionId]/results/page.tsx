'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, TrendingUp, Home, RotateCcw, CheckCircle2, XCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getScoreByDifficulty, getScoreByTopic, getAverageTimePerStatement } from '@/lib/verbalTestV2/validator.v2';
import type { TestAnswer } from '@/lib/verbalTestV2/types.v2';
import questionBank from '@/lib/verbalTestV2/questionBank.json';
import type { Question } from '@/lib/verbalTestV2/types.v2';

const questions = questionBank as Question[];

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function ResultsPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => setSessionId(p.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const response = await fetch('/api/verbalTestV2/session');
        if (response.ok) {
          const data = await response.json();
          const currentSession = data.sessions.find((s: any) => s.id === sessionId);
          setSession(currentSession);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Laddar resultat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Session kunde inte hittas</p>
          <Button onClick={() => router.push('/dashboard/tester')}>
            Tillbaka till tester
          </Button>
        </div>
      </div>
    );
  }

  const answers: TestAnswer[] = session.answers || [];
  const score = session.score || 0;
  const maxScore = 48;
  const percentage = Math.round((score / maxScore) * 100);

  const scoreByDifficulty = getScoreByDifficulty(answers);
  const scoreByTopic = getScoreByTopic(answers);
  const avgTime = getAverageTimePerStatement(answers);

  const topicTranslations: Record<string, string> = {
    'Utbildning': 'Utbildning',
    'Hälsa & Välbefinnande': 'Hälsa & Välbefinnande',
    'Miljö & Klimat': 'Miljö & Klimat',
    'Samhälle & Demografi': 'Samhälle & Demografi',
    'Vetenskap & Forskning': 'Vetenskap & Forskning',
    'Kultur & Medier': 'Kultur & Medier'
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 85) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (percentage >= 70) return { label: 'Bra', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (percentage >= 55) return { label: 'Godkänd', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Behöver förbättring', color: 'text-orange-600', bgColor: 'bg-orange-100' };
  };

  const performance = getPerformanceLevel(percentage);

  const [expandedPassages, setExpandedPassages] = useState<Set<string>>(new Set());

  const togglePassage = (passageId: string) => {
    setExpandedPassages(prev => {
      const next = new Set(prev);
      if (next.has(passageId)) {
        next.delete(passageId);
      } else {
        next.add(passageId);
      }
      return next;
    });
  };

  const answerTranslations = {
    'true': 'Sant',
    'false': 'Falskt',
    'cannot_say': 'Kan inte avgöra'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Test genomfört!
          </h1>
          <p className="text-slate-600">
            Här är dina resultat
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border-2 border-green-200 p-8 mb-6 shadow-xl"
        >
          <div className="text-center mb-6">
            <div className="text-7xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {score}/{maxScore}
            </div>
            <div className="text-3xl font-bold text-slate-700 mb-4">
              {percentage}%
            </div>
            <div className={`inline-block px-6 py-2 rounded-full ${performance.bgColor}`}>
              <span className={`text-lg font-bold ${performance.color}`}>
                {performance.label}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">{score}</p>
              <p className="text-xs text-green-600 font-medium">Korrekta svar</p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-900">{maxScore - score}</p>
              <p className="text-xs text-red-600 font-medium">Felaktiga svar</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200 col-span-2 md:col-span-1">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-900">{avgTime}s</p>
              <p className="text-xs text-blue-600 font-medium">Snitt per påstående</p>
            </div>
          </div>
        </motion.div>

        {/* Performance by Difficulty */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Resultat per svårighetsgrad
          </h2>

          <div className="space-y-4">
            {[
              { level: 1, label: 'Lätt', color: 'green' },
              { level: 2, label: 'Medel', color: 'yellow' },
              { level: 3, label: 'Svår', color: 'orange' }
            ].map(({ level, label, color }) => {
              const data = scoreByDifficulty[`difficulty${level}` as keyof typeof scoreByDifficulty];
              const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

              return (
                <div key={level}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                    <span className="text-sm font-bold text-slate-900">
                      {data.correct}/{data.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, delay: 0.3 + level * 0.1 }}
                      className={`h-full bg-${color}-500 rounded-full`}
                      style={{ backgroundColor: color === 'green' ? '#10b981' : color === 'yellow' ? '#f59e0b' : '#f97316' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Performance by Topic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Resultat per ämnesområde
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(scoreByTopic).map(([topic, data]) => {
              const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
              const translatedTopic = topicTranslations[topic] || topic;

              return (
                <div key={topic} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-2">{translatedTopic}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-900">{pct}%</span>
                    <span className="text-sm text-slate-600">
                      {data.correct}/{data.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Answer Key / Facit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border-2 border-slate-200 p-6 mb-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-600" />
            Facit & Förklaringar
          </h2>

          <div className="space-y-3">
            {questions.map((question, qIndex) => {
              const isExpanded = expandedPassages.has(question.id);
              const startIdx = qIndex * 4;
              const questionAnswers = answers.slice(startIdx, startIdx + 4);
              const correctCount = questionAnswers.filter((ans, idx) => ans.answer === question.statements[idx].correctAnswer).length;

              return (
                <div key={question.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => togglePassage(question.id)}
                    className="w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">
                        Passage {qIndex + 1}
                      </span>
                      <span className="text-sm text-slate-600">
                        {question.title}
                      </span>
                      <div className="flex items-center gap-1">
                        {correctCount === 4 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            4/4 Rätt
                          </span>
                        )}
                        {correctCount < 4 && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-full">
                            {correctCount}/4 Rätt
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-4 space-y-4">
                      {/* Passage Text */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {question.text}
                        </p>
                      </div>

                      {/* Statements */}
                      <div className="space-y-3">
                        {question.statements.map((statement, sIdx) => {
                          const userAnswer = questionAnswers[sIdx];
                          const isCorrect = userAnswer?.answer === statement.correctAnswer;

                          return (
                            <div
                              key={sIdx}
                              className={`p-4 rounded-lg border-2 ${
                                isCorrect
                                  ? 'bg-green-50 border-green-300'
                                  : 'bg-red-50 border-red-300'
                              }`}
                            >
                              <div className="flex items-start gap-3 mb-2">
                                {isCorrect ? (
                                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                )}
                                <p className="text-sm font-medium text-slate-900 flex-1">
                                  {statement.text}
                                </p>
                              </div>

                              <div className="ml-8 space-y-1">
                                <p className="text-sm">
                                  <span className="font-semibold text-slate-700">Ditt svar:</span>{' '}
                                  <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                                    {answerTranslations[userAnswer?.answer as keyof typeof answerTranslations]}
                                  </span>
                                </p>
                                {!isCorrect && (
                                  <p className="text-sm">
                                    <span className="font-semibold text-slate-700">Rätt svar:</span>{' '}
                                    <span className="text-green-700">
                                      {answerTranslations[statement.correctAnswer as keyof typeof answerTranslations]}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4"
        >
          <Button
            onClick={() => router.push('/dashboard/tester')}
            variant="outline"
            className="flex-1 py-6 border-2 border-green-300"
          >
            <Home className="w-5 h-5 mr-2" />
            Tillbaka till tester
          </Button>

          <Button
            onClick={() => router.push('/dashboard/tester/verbal-resonemang-v2')}
            className="flex-1 py-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Gör om testet
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
