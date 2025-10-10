'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, TrendingUp, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default function RotationResultsPage({ params }: PageProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Unwrap params Promise
  useEffect(() => {
    params.then(p => setSessionId(p.sessionId));
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;

    const fetchSession = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('logic_test_v4_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (error) throw error;
        setSession(data);
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-slate-600">Session not found</p>
        <Button onClick={() => router.push('/dashboard/tester')} className="mt-4">
          Tillbaka
        </Button>
      </div>
    );
  }

  const score = session.score || 0;
  const totalQuestions = 15;
  const percentage = Math.round((score / totalQuestions) * 100);
  const timeSpent = session.time_spent || 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sek`;
  };

  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: 'Fantastiskt!', emoji: '🌟', color: 'from-yellow-500 to-orange-500' };
    if (percentage >= 80) return { text: 'Mycket bra!', emoji: '🎉', color: 'from-green-500 to-emerald-500' };
    if (percentage >= 70) return { text: 'Bra jobbat!', emoji: '👏', color: 'from-blue-500 to-cyan-500' };
    if (percentage >= 60) return { text: 'Godkänt!', emoji: '✓', color: 'from-purple-500 to-pink-500' };
    return { text: 'Fortsätt öva!', emoji: '💪', color: 'from-slate-500 to-slate-600' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className={`inline-block p-6 bg-gradient-to-br ${performance.color} rounded-full mb-4 shadow-2xl`}
          >
            <Trophy className="w-16 h-16 text-white" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-2">
            {performance.text} {performance.emoji}
          </h1>
          <p className="text-slate-600 text-lg">
            Du har slutfört Rotation & Mönster testet
          </p>
        </motion.div>

        {/* Results Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden mb-6"
        >
          {/* Score Display */}
          <div className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <div className="text-center">
              <p className="text-sm uppercase tracking-wide opacity-90 mb-2">Ditt resultat</p>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
                className="text-7xl sm:text-8xl font-bold mb-2"
              >
                {percentage}%
              </motion.div>
              <p className="text-xl opacity-90">
                {score} av {totalQuestions} rätt
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-8 grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-5 bg-blue-50 rounded-xl border border-blue-200">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Tidsåtgång</p>
                <p className="text-2xl font-bold text-blue-900">{formatTime(timeSpent)}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-green-50 rounded-xl border border-green-200">
              <div className="p-3 bg-green-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-semibold uppercase tracking-wide">Träffsäkerhet</p>
                <p className="text-2xl font-bold text-green-900">{percentage}%</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-purple-50 rounded-xl border border-purple-200">
              <div className="p-3 bg-purple-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">Svårighetsnivå</p>
                <p className="text-2xl font-bold text-purple-900">Avancerad</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-xl border border-amber-200">
              <div className="p-3 bg-amber-500 rounded-lg">
                <RotateCcw className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-semibold uppercase tracking-wide">Testtyp</p>
                <p className="text-2xl font-bold text-amber-900">Rotation</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 mb-6"
        >
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Tips för förbättring</h3>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Öva på att visualisera rotationer mentalt innan du väljer svar</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Fokusera på både yttre form och inre mönster - de kan rotera oberoende</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Använd papper och penna för att rita mönster om det behövs</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Träna regelbundet - spatial förmåga förbättras med övning</span>
            </li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={() => router.push('/dashboard/tester/rotation-monster')}
            size="lg"
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Gör om testet
          </Button>

          <Button
            onClick={() => router.push('/dashboard/tester')}
            size="lg"
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            <Home className="w-5 h-5 mr-2" />
            Tillbaka till tester
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
