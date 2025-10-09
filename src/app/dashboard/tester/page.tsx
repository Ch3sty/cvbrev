'use client';

import { motion } from 'framer-motion';
import { Brain, Clock, Target } from 'lucide-react';
import Link from 'next/link';

export default function TesterPage() {
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

      {/* Test Cards */}
      <div className="grid gap-6">
        {/* Matrislogik Test - Avancerad nivå */}
        <Link href="/dashboard/tester/matrislogik-avancerad">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Logiskt Matristest
                  </h2>
                  <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                    Avancerad Nivå
                  </span>
                </div>
                <p className="text-gray-700 mb-4">
                  Utmana dig själv med avancerade mönster och komplexa transformationer.
                  Innehåller nya frågetyper med högre svårighetsgrad och mer sofistikerade regler.
                </p>

                <div className="flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    ~25-30 min
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    15 frågor
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold">
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
