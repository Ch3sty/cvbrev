'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { RotateCw, Clock, Target, TrendingUp, Play, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RotationMonsterPage() {
  const router = useRouter();
  const [previousSessions, setPreviousSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch previous sessions for rotation test
    fetch('/api/logicTestV4/rotation/sessions')
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
      const response = await fetch('/api/logicTestV4/rotation/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.session) {
        router.push(`/dashboard/tester/rotation-monster/test/${data.session.id}`);
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <RotateCw className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Rotation & Mönster
            </h1>
            <p className="text-slate-600 mt-1 font-medium">Avancerad nivå</p>
          </div>
        </div>
      </motion.div>

      {/* Test Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden mb-6"
      >
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Om testet</h2>

          <p className="text-slate-600 mb-6 leading-relaxed">
            Detta avancerade test utmanar din förmåga att spåra rotationer och mönster. Du behöver
            identifiera hur både yttre former och inre mönster roterar oberoende av varandra.
            Testet kräver hög spatial förmåga och mönsterigenkänning.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <Target className="w-5 h-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="font-semibold text-indigo-900">15 frågor</p>
                <p className="text-sm text-indigo-700">Tre svårighetsnivåer</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900">Ca 25-35 min</p>
                <p className="text-sm text-purple-700">Ta den tid du behöver</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Progressiv svårighet</p>
                <p className="text-sm text-green-700">Nivå 1-3</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <RotateCw className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Rotation & Mönster</p>
                <p className="text-sm text-amber-700">Dubbla transformationer</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleStartTest}
              disabled={isLoading}
              size="lg"
              className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              {isLoading ? 'Startar...' : 'Starta Test'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Previous Sessions */}
      {previousSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-slate-600" />
              <h3 className="text-xl font-bold text-slate-900">Tidigare försök</h3>
            </div>

            <div className="space-y-3">
              {previousSessions.map((session: any, index: number) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {session.score} / 15 rätt
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(session.completed_at).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Tid</p>
                      <p className="font-semibold text-slate-900">
                        {formatTime(session.time_spent)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">Resultat</p>
                      <p className="font-semibold text-slate-900">
                        {Math.round((session.score / 15) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
