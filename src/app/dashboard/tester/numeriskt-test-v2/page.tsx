'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, Clock, TrendingUp, PieChart, ArrowRight, CheckCircle2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NumericalTestV2LandingPage() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);

  useEffect(() => {
    // Fetch previous sessions
    fetch('/api/numericalTestV2/session')
      .then(res => res.json())
      .then(data => {
        if (data.sessions) {
          const completed = data.sessions.filter((s: any) => s.completed_at);
          // Sort by completed_at descending (newest first)
          completed.sort((a: any, b: any) =>
            new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
          );
          setPreviousSessions(completed);
        }
      })
      .catch(console.error);
  }, []);

  const handleStartTest = async () => {
    setIsStarting(true);

    try {
      const response = await fetch('/api/numericalTestV2/session', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/tester/numeriskt-test-v2/test/${data.session.id}`);
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Numeriskt Resonemang v2
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Grafer & visualiseringar</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content - Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Test Info Card - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Om testet</h2>

            <p className="text-slate-700 leading-relaxed mb-6">
              Visualisera data genom grafer och diagram. Detta test utvärderar din förmåga att tolka
              stapeldiagram, linjediagram och cirkeldiagram. Fokus på grafanalys och datatolkning
              under tidspress.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <PieChart className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-600 font-medium">Frågor</p>
                  <p className="text-lg font-bold text-purple-900">20</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-lg border border-violet-200">
                <Clock className="w-4 h-4 text-violet-600" />
                <div>
                  <p className="text-xs text-violet-600 font-medium">Tid</p>
                  <p className="text-lg font-bold text-violet-900">~20 min</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-fuchsia-50 rounded-lg border border-fuchsia-200">
                <TrendingUp className="w-4 h-4 text-fuchsia-600" />
                <div>
                  <p className="text-xs text-fuchsia-600 font-medium">Nivå</p>
                  <p className="text-lg font-bold text-fuchsia-900">Mellan</p>
                </div>
              </div>
            </div>

            {/* Graftyper och Kompetenser */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                  Graftyper
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">📊</span>
                    <span>Stapeldiagram - omsättning och tillväxt</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">📈</span>
                    <span>Linjediagram - trender över tid</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">🥧</span>
                    <span>Cirkeldiagram - marknadsandelar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">💱</span>
                    <span>Valutakonverteringar</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-violet-600" />
                  Kompetenser
                </h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 mt-1">•</span>
                    <span>Visuell datatolkning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 mt-1">•</span>
                    <span>Trendanalys och prognoser</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 mt-1">•</span>
                    <span>Procentuella förändringar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 mt-1">•</span>
                    <span>Marknadsanalys och jämförelser</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-amber-900 mb-3">Tips inför testet</h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Ha en miniräknare redo för snabbare beräkningar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Studera graferna noga - alla detaljer är viktiga</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Kolla axelbenämningar och enheter (MSEK, procent, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Svara på alla frågor – ingen minuspoäng för felaktiga svar</span>
                </li>
              </ul>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartTest}
              disabled={isStarting}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isStarting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Startar test...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Starta Numeriskt Test v2
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Previous Sessions - Right Column */}
        {previousSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-fit"
          >
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Tidigare Resultat</h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {previousSessions.slice(0, 5).map((session) => {
                const isBest = session.score === bestScore;
                return (
                  <div
                    key={session.id}
                    className={`p-3 hover:bg-slate-50 transition-colors ${
                      isBest ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {session.score} / 20
                        </p>
                        <p className="text-xs text-slate-500">
                          ({Math.round((session.score / 20) * 100)}%)
                        </p>
                        {isBest && (
                          <span className="text-xs font-bold text-yellow-700">⭐</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(session.completed_at).toLocaleDateString('sv-SE', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                      <p className="text-xs text-slate-600">
                        {formatTime(session.time_spent)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Example Card - Full Width Below */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-lg mt-6"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Exempel på fråga
        </h2>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="bg-white rounded-lg p-4 mb-4 border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-3">
              Ett stapeldiagram visar månatlig omsättning: Jan (12.5 MSEK), Feb (14.2 MSEK),
              Mar (15.8 MSEK). Hur stor var den totala omsättningen för Q1?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                A) 40.0 MSEK
              </div>
              <div className="p-3 bg-purple-100 rounded-lg text-sm text-purple-900 font-medium border-2 border-purple-400">
                B) 42.5 MSEK ✓
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                C) 45.0 MSEK
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                D) 47.5 MSEK
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-600 italic">
            Förklaring: Q1 totalt = 12.5 + 14.2 + 15.8 = 42.5 MSEK
          </p>
        </div>
      </motion.div>
    </div>
  );
}
