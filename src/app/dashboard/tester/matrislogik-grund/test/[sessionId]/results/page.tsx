'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, TrendingUp, RotateCcw, Home, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface PageProps {
  params: { sessionId: string };
}

export default function ResultsPage({ params }: PageProps) {
  const router = useRouter();
  const { sessionId } = params;
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    if (percentage >= 90) return { text: 'Exceptionellt!', emoji: '🌟', color: 'from-yellow-500 to-orange-500' };
    if (percentage >= 80) return { text: 'Mycket bra!', emoji: '🎉', color: 'from-green-500 to-emerald-500' };
    if (percentage >= 70) return { text: 'Bra jobbat!', emoji: '👏', color: 'from-blue-500 to-cyan-500' };
    if (percentage >= 60) return { text: 'Godkänt!', emoji: '✓', color: 'from-purple-500 to-pink-500' };
    return { text: 'Fortsätt öva!', emoji: '💪', color: 'from-slate-500 to-slate-600' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 py-12 px-6">
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
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block p-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-2xl"
          >
            <Trophy className="w-16 h-16 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-2"
          >
            Test Slutfört!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-2xl font-bold bg-gradient-to-r ${performance.color} bg-clip-text text-transparent`}
          >
            {performance.emoji} {performance.text}
          </motion.p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8 mb-6"
        >
          {/* Main Score */}
          <div className="text-center mb-8">
            <p className="text-slate-600 mb-2 font-medium">Din Poäng</p>
            <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {score}/{totalQuestions}
            </div>
            <p className="text-2xl text-slate-500 mt-2 font-semibold">
              {percentage}%
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: 0.7, duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${performance.color} rounded-full`}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Tid</p>
                <p className="font-bold text-blue-900">{formatTime(timeSpent)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Korrekta</p>
                <p className="font-bold text-green-900">{score} frågor</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Träffsäkerhet</p>
                <p className="font-bold text-purple-900">{percentage}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Genomsnitt/fråga</p>
                <p className="font-bold text-orange-900">
                  {Math.round(timeSpent / totalQuestions)}s
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={() => router.push('/dashboard/tester/matrislogik-grund')}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 rounded-xl"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Gör Om Test
          </Button>

          <Button
            onClick={() => router.push('/dashboard/tester')}
            variant="outline"
            className="flex-1 py-6 rounded-xl"
          >
            <Home className="w-5 h-5 mr-2" />
            Tillbaka till Tester
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
