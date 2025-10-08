'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Clock, Target } from 'lucide-react';
import Link from 'next/link';

export default function TesterPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/tester/history');
        const data = await res.json();
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Kognitiva Tester
            </h1>
            <p className="text-gray-600 mt-1">
              Träna inför rekryteringsprocesser
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {!loading && stats && stats.matrislogikAttempts > 0 && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-sm text-gray-600">Bästa Resultat</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.matrislogikBestScore}/10
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <Target className="w-8 h-8 text-indigo-600 mb-2" />
            <p className="text-sm text-gray-600">Genomsnitt</p>
            <p className="text-3xl font-bold text-indigo-600">
              {stats.matrislogikAvgScore.toFixed(1)}/10
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <Clock className="w-8 h-8 text-pink-600 mb-2" />
            <p className="text-sm text-gray-600">Antal Försök</p>
            <p className="text-3xl font-bold text-pink-600">
              {stats.matrislogikAttempts}
            </p>
          </div>
        </div>
      )}

      {/* Test Cards */}
      <div className="grid gap-6">
        {/* Matrislogik Test */}
        <Link href="/dashboard/tester/matrislogik">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Matrislogik (Raven-stil)
                </h2>
                <p className="text-gray-700 mb-4">
                  Träna på abstrakt problemlösning med 3x3 matriser.
                  Förbered dig för tester som Matrigma, Alva Labs och liknande.
                </p>

                <div className="flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    20 min
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    15 frågor
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold">
                Börja träna →
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Icon Logic Test */}
        <Link href="/dashboard/tester/icon-logic">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🧩 Icon Logic Test
                </h2>
                <p className="text-gray-700 mb-4">
                  Testa din logiska förmåga och mönsterigenkänning med minimalistiska ikonmönster.
                  10 frågor med varierande svårighetsgrad.
                </p>

                <div className="flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    ~12 min
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    10 frågor
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold">
                Börja träna →
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Future tests placeholder */}
        <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200 opacity-60">
          <h3 className="text-xl font-bold text-gray-500 mb-2">
            Fler tester kommer snart
          </h3>
          <p className="text-gray-500">
            Vi jobbar på att lägga till verbala och numeriska tester.
          </p>
        </div>
      </div>
    </div>
  );
}
