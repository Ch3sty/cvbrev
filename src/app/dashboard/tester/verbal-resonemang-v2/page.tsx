'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Target, Brain, ArrowRight, AlertCircle, History } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function VerbalResonemangPage() {
  const router = useRouter();
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch previous sessions
    fetch('/api/verbalTestV2/session')
      .then(res => res.json())
      .then(data => {
        if (data.sessions) {
          setPreviousSessions(data.sessions.filter((s: any) => s.completed_at));
        }
      })
      .catch(console.error);
  }, []);

  const handleStartTest = async () => {
    setIsCreatingSession(true);
    setError(null);

    try {
      const response = await fetch('/api/verbalTestV2/session', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to create test session');
      }

      const data = await response.json();
      router.push(`/dashboard/tester/verbal-resonemang-v2/test/${data.session.id}`);
    } catch (err) {
      console.error('Error creating session:', err);
      setError('Det gick inte att starta testet. Försök igen.');
      setIsCreatingSession(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Find best score
  const bestScore = previousSessions.length > 0
    ? Math.max(...previousSessions.map(s => s.score || 0))
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Verbal Resonemang v2
            </h1>
            <p className="text-slate-600 mt-1">
              Samhälle, Vetenskap & Kultur
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 border-2 border-green-200 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Om testet
          </h2>
          <p className="text-slate-700 leading-relaxed mb-6">
            Detta test fokuserar på ämnen inom samhälle, vetenskap och kultur. Du kommer att läsa
            textpassager om utbildning, hälsa, klimat, urbanisering, AI och medier. Bedöm om påståenden
            är <strong>sanna</strong>, <strong>falska</strong> eller <strong>kan inte avgöras</strong>{' '}
            baserat endast på informationen i texten.
          </p>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Viktigt att veta
            </h3>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Basera dina svar endast på informationen i textpassagen</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>Använd inte extern kunskap eller antaganden</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 mt-1">•</span>
                <span>\"Kan inte avgöra\" betyder att informationen inte finns i texten</span>
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <BookOpen className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-green-600 font-medium">Passager</p>
                <p className="text-lg font-bold text-green-900">12</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <Target className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-600 font-medium">Påståenden</p>
                <p className="text-lg font-bold text-emerald-900">48</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <Clock className="w-4 h-4 text-teal-600" />
              <div>
                <p className="text-xs text-teal-600 font-medium">Tid</p>
                <p className="text-lg font-bold text-teal-900">25 min</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <Brain className="w-4 h-4 text-cyan-600" />
              <div>
                <p className="text-xs text-cyan-600 font-medium">Nivå</p>
                <p className="text-lg font-bold text-cyan-900">1-3</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Example Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Exempel
          </h2>

          <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed italic">
              Digitalt lärande har revolutionerat utbildningssektorn. Studier visar att elever som använder
              digitala verktyg i genomsnitt presterar 15 procent bättre på standardiserade test. Inte alla
              elever har dock tillgång till datorer eller stabil internetuppkoppling hemma.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <div className="flex-1">
                <p className="text-sm text-slate-700 mb-2">
                  Elever med digitala verktyg presterar bättre på test.
                </p>
                <p className="text-xs font-semibold text-green-700">
                  Svar: <span className="text-green-600">Sant</span> (15% bättre enligt studier)
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <div className="flex-1">
                <p className="text-sm text-slate-700 mb-2">
                  Alla elever har tillgång till datorer hemma.
                </p>
                <p className="text-xs font-semibold text-slate-700">
                  Svar: <span className="text-red-600">Falskt</span> (Texten säger att inte alla har tillgång)
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <Button
            onClick={handleStartTest}
            disabled={isCreatingSession}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {isCreatingSession ? (
              <span>Startar test...</span>
            ) : (
              <>
                <span>Starta test</span>
                <ArrowRight className="w-6 h-6 ml-2" />
              </>
            )}
          </Button>
        </motion.div>

        {/* Previous Sessions */}
        {previousSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-bold text-slate-900">Tidigare Resultat</h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {previousSessions.slice(0, 5).map((session) => {
                const isBest = session.score === bestScore;
                return (
                  <div
                    key={session.id}
                    className={`p-4 hover:bg-slate-50 transition-colors ${
                      isBest ? 'bg-yellow-50 border-2 border-yellow-300' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            {session.score} / 48 ({Math.round((session.score / 48) * 100)}%)
                          </p>
                          {isBest && (
                            <span className="text-xs font-bold text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded-full">
                              ⭐ Bäst hittills
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">
                          {new Date(session.completed_at).toLocaleDateString('sv-SE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">
                          {formatTime(session.time_spent)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
