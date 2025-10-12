'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain, Clock, Target, TrendingUp, Play, History, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MatrislogikAvanceradPage() {
  const router = useRouter();
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch previous sessions
    fetch('/api/logicTestV6/session')
      .then(res => res.json())
      .then(data => {
        if (data.sessions) {
          setPreviousSessions(data.sessions.filter((s: any) => s.completed_at));
        }
      })
      .catch(console.error);
  }, []);

  const handleStartTest = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/logicTestV6/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.session) {
        router.push(`/dashboard/tester/matrislogik-avancerad/test/${data.session.id}`);
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
          <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Logiskt Matristest
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-600 font-medium">Avancerad Nivå</p>
              <Zap className="w-4 h-4 text-orange-500" />
            </div>
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
          className="lg:col-span-2 bg-white rounded-2xl shadow-xl border-2 border-orange-200 overflow-hidden"
        >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Om testet</h2>

          <p className="text-slate-600 mb-6 leading-relaxed">
            Detta avancerade test mäter din förmåga att identifiera komplexa logiska mönster med flera variabler,
            villkorliga transformationer och abstrakta relationer. Testet kräver högre analytisk förmåga än grundnivån.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <Target className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900">15 frågor</p>
                <p className="text-sm text-orange-700">Komplexa logiska regler</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
              <Clock className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Ca 30-40 min</p>
                <p className="text-sm text-red-700">Ingen tidsgräns</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Flexibel navigation</p>
                <p className="text-sm text-amber-700">Hoppa mellan frågor</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-xl border border-rose-200">
              <Zap className="w-5 h-5 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">Avancerad logik</p>
                <p className="text-sm text-rose-700">Flera variabler samtidigt</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border border-orange-200">
            <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Vad gör detta test avancerat?
            </h3>
            <ul className="text-sm text-orange-800 space-y-1 ml-6 list-disc">
              <li>Komplexa regler med flera variabler som förändras samtidigt</li>
              <li>Logiska operationer (union, subtraktion, XOR, analogier)</li>
              <li>Villkorliga transformationer och abstrakta egenskaper</li>
            </ul>
          </div>

          <Button
            onClick={handleStartTest}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Startar test...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Starta Avancerat Test
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
