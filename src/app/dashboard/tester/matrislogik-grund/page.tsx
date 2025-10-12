'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Clock, Target, TrendingUp, Play, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MatrislogikGrundPage() {
  const router = useRouter();
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch previous sessions
    fetch('/api/logicTestV4/session')
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
    setIsLoading(true);

    try {
      const response = await fetch('/api/logicTestV4/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.session) {
        router.push(`/dashboard/tester/matrislogik-grund/test/${data.session.id}`);
      }
    } catch (error) {
      console.error('Failed to start test:', error);
      setIsLoading(false);
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
          <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Logiskt Matristest
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Grundnivå</p>
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
          className="lg:col-span-2 bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden"
        >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Om testet</h2>

          <p className="text-slate-600 mb-6 leading-relaxed">
            Detta test mäter din förmåga att identifiera logiska mönster och relationer i visuella matriser.
            Testet används ofta i rekryteringsprocesser för att bedöma analytisk förmåga.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <Target className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">15 frågor</p>
                <p className="text-sm text-blue-700">Tre svårighetsnivåer</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900">Ca 20-30 min</p>
                <p className="text-sm text-purple-700">Ingen tidsgräns</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Hoppa mellan frågor</p>
                <p className="text-sm text-green-700">Flexibel navigation</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <Brain className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900">Visuell logik</p>
                <p className="text-sm text-orange-700">Mönsterigenkänning</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleStartTest}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Startar test...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Starta Test
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
                          {session.score} / 15
                        </p>
                        <p className="text-xs text-slate-500">
                          ({Math.round((session.score / 15) * 100)}%)
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
    </div>
  );
}
