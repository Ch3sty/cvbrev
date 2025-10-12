'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calculator, Clock, BarChart3, TrendingUp, ArrowRight, CheckCircle2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NumericalTestLandingPage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch previous sessions
    fetch('/api/numericalTest/session')
      .then(res => res.json())
      .then(data => {
        if (data.sessions) {
          setPreviousSessions(data.sessions.filter((s: any) => s.completed_at));
        }
      })
      .catch(console.error);
  }, []);

  const handleStartTest = async () => {
    setIsStarting(true);

    try {
      const response = await fetch('/api/numericalTest/session', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/tester/numeriskt-test/test/${data.session.id}`);
      } else {
        console.error('Failed to create session');
        setIsStarting(false);
      }
    } catch (error) {
      console.error('Error starting test:', error);
      setIsStarting(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <Calculator className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Numeriskt Resonemang
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Testa din förmåga att analysera sifferdata, tolka tabeller och grafer,
            samt lösa matematiska problem under tidspress
          </p>
        </motion.div>

        {/* Test Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">20 Frågor</h3>
            <p className="text-slate-600 text-sm">
              5 passages med 4 frågor vardera. Tabeller, grafer, ordproblem och talserier.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">~20 Minuter</h3>
            <p className="text-slate-600 text-sm">
              Ingen hård tidsgräns, men försök hålla dig till ca 1 minut per fråga.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Mellannivå</h3>
            <p className="text-slate-600 text-sm">
              Passar akademiker och mellanchefer. Miniräknare rekommenderas.
            </p>
          </motion.div>
        </div>

        {/* What to Expect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-8 mb-8 shadow-lg border-2 border-slate-200"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Vad testet innehåller</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Frågetyper
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Tabellanalys och datautvinning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Graf- och diagramtolkning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Ordproblem från affärsvärlden</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Talserier och matematiska mönster</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                Kompetenser som testas
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>Procenträkning och nyckeltal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>Lönsamhetsanalys och budgetering</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>Tillväxtberäkningar och prognoser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <span>Logiskt tänkande under tidspress</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Example */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="font-semibold text-slate-900 mb-3">Exempel på fråga:</h3>
            <div className="bg-white rounded-lg p-4 mb-4 border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-3">
                Ett företag hade 85.5 MSEK i intäkter och 38.5 MSEK i rörliga kostnader.
                Vad är täckningsbidraget i procent av intäkterna?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-300">
                  A) 45%
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-300">
                  B) 52%
                </div>
                <div className="p-3 bg-blue-100 rounded-lg text-sm text-blue-900 font-medium border-2 border-blue-400">
                  C) 55% ✓
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 hover:bg-blue-50 transition-colors cursor-pointer border border-transparent hover:border-blue-300">
                  D) 60%
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 italic">
              Förklaring: Täckningsbidrag = Intäkter - Rörliga kostnader = 85.5 - 38.5 = 47 MSEK.
              I procent: 47 / 85.5 × 100% ≈ 55%
            </p>
          </div>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 mb-8 border-2 border-amber-200"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Tips inför testet</h2>
          <ul className="space-y-3 text-slate-700">
            <li className="flex items-start gap-3">
              <span className="text-xl">📱</span>
              <span>Ha en miniräknare redo – du kommer behöva den!</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">📝</span>
              <span>Anteckningspapper kan vara till hjälp för komplexa beräkningar</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">⏱️</span>
              <span>Ta dig tid att läsa frågan noga – fel svar räknas som fel</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-xl">🎯</span>
              <span>Svara på alla frågor – ingen minuspoäng för felaktiga svar</span>
            </li>
          </ul>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col items-center gap-4"
        >
          <Button
            onClick={handleStartTest}
            disabled={isStarting}
            className="px-12 py-8 text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Startar test...
              </>
            ) : (
              <>
                Starta numeriskt test
                <ArrowRight className="ml-3 w-6 h-6" />
              </>
            )}
          </Button>

          <p className="text-sm text-slate-500">
            Testet sparas automatiskt och du kan se dina resultat direkt efteråt
          </p>

          <Button
            onClick={() => router.push('/dashboard/tester')}
            variant="ghost"
            className="mt-4 text-slate-600 hover:text-slate-900"
          >
            ← Tillbaka till tester
          </Button>
        </motion.div>

        {/* Previous Sessions */}
        {previousSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
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
                            {session.score} / 20 ({Math.round((session.score / 20) * 100)}%)
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
