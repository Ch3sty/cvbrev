'use client';

import { motion } from 'framer-motion';
import { Brain, Grid3x3, Clock, Target, ArrowRight, BookOpen } from 'lucide-react';
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Matrislogik Grund Test Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/dashboard/tester/matrislogik-grund">
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-indigo-400 transition-all shadow-lg hover:shadow-xl group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <Grid3x3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Logiskt Matristest
                    </h3>
                    <p className="text-slate-500 font-medium">Grundnivå</p>
                  </div>
                </div>

                <ArrowRight className="w-6 h-6 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </div>

              <p className="text-slate-600 mb-6 leading-relaxed">
                Träna din förmåga att identifiera logiska mönster och relationer i visuella matriser.
                Perfekt för att förbereda dig inför rekryteringstester.
              </p>

              {/* Preview Symbols */}
              <div className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl border border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Exempel på mönster:</p>
                <div className="flex items-center justify-around gap-4">
                  {/* Symbol 1: Pil från sudoku */}
                  <svg viewBox="0 0 100 100" className="w-14 h-14">
                    <path d="M 25 50 L 50 30 L 50 40 L 70 40 L 70 60 L 50 60 L 50 70 Z" fill="currentColor" className="text-slate-700" />
                  </svg>

                  {/* Symbol 2: Y från endpoints */}
                  <svg viewBox="0 0 100 100" className="w-14 h-14">
                    <path d="M 50 50 V 75 M 50 50 L 25 25 M 50 50 L 75 25" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-700" />
                  </svg>

                  {/* Symbol 3: XOR-överlappning */}
                  <svg viewBox="0 0 100 100" className="w-14 h-14">
                    <rect x="20" y="25" width="60" height="50" fill="currentColor" opacity="0.3" className="text-indigo-500" />
                    <circle cx="45" cy="50" r="30" fill="currentColor" opacity="0.3" className="text-purple-500" />
                  </svg>

                  {/* Symbol 4: Halvcirkel/måne från sudoku */}
                  <svg viewBox="0 0 100 100" className="w-14 h-14">
                    <path d="M 40,25 A 25,25 0 0,1 40,75 Z" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-700" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">15 frågor</span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">~25 min</span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Brain className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-900">Nivå 1-3</span>
                </div>
              </div>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </Link>
        </motion.div>

        {/* Matrislogik Avancerad Test Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/dashboard/tester/matrislogik-avancerad">
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-orange-400 transition-all shadow-lg hover:shadow-xl group cursor-pointer relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <Grid3x3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Logiskt Matristest
                    </h3>
                    <p className="text-orange-600 font-bold">Avancerad Nivå ⚡</p>
                  </div>
                </div>

                <ArrowRight className="w-6 h-6 text-orange-600 group-hover:translate-x-1 transition-transform" />
              </div>

              <p className="text-slate-600 mb-6 leading-relaxed">
                Utmana dig själv med komplexa logiska mönster, villkorliga transformationer och abstrakta relationer.
                För dig som vill ta din analytiska förmåga till nästa nivå.
              </p>

              {/* Preview Symbols */}
              <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-3">Avancerade mönster:</p>
                <div className="flex items-center justify-around gap-4">
                  {/* Symbol 1: Arrow from v6 */}
                  <svg viewBox="0 0 100 100" className="w-14 h-14">
                    <path d="M 50 20 L 65 50 L 50 80 L 50 60 L 35 60 L 35 40 L 50 40 Z" fill="currentColor" className="text-orange-700" />
                  </svg>

                  {/* Symbol 2: L-shape */}
                  <svg viewBox="0 0 100 100" className="w-14 h-14">
                    <path d="M 25 25 V 75 H 75" fill="none" stroke="currentColor" strokeWidth="3" className="text-orange-700" />
                  </svg>

                  {/* Symbol 3: Composition */}
                  <svg viewBox="0 0 100 100" className="w-14 h-14">
                    <circle cx="35" cy="35" r="12" fill="currentColor" className="text-red-600" />
                    <rect x="55" y="55" width="20" height="20" fill="currentColor" className="text-red-600" />
                  </svg>

                  {/* Symbol 4: Pointer */}
                  <svg viewBox="0 0 100 100" className="w-14 h-14">
                    <path d="M 30 70 L 30 30 L 70 50 Z" fill="currentColor" className="text-orange-700" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-900">15 frågor</span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-900">~35 min</span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <Brain className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-900">Nivå 2-3</span>
                </div>
              </div>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </Link>
        </motion.div>

        {/* Verbal Resonemang Test Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/dashboard/tester/verbal-resonemang">
            <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-green-400 transition-all shadow-lg hover:shadow-xl group cursor-pointer relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Verbal Resonemang
                    </h3>
                    <p className="text-green-600 font-bold">Läsförståelse ✓</p>
                  </div>
                </div>

                <ArrowRight className="w-6 h-6 text-green-600 group-hover:translate-x-1 transition-transform" />
              </div>

              <p className="text-slate-600 mb-6 leading-relaxed">
                Träna din förmåga att förstå, analysera och dra slutsatser från text.
                Bedöm påståenden som sanna, falska eller kan inte avgöras baserat på given information.
              </p>

              {/* Preview Text */}
              <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">Exempel på textpassage:</p>
                <div className="bg-white p-3 rounded-lg border border-green-200 mb-3">
                  <p className="text-xs text-slate-600 italic leading-relaxed">
                    "Företaget Tech Solutions grundades 2018 och har idag 45 anställda..."
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">Sant</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-semibold">Falskt</span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-semibold">Kan ej avgöra</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-900">12 passager</span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-900">~25 min</span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                  <Brain className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-semibold text-teal-900">Nivå 1-3</span>
                </div>
              </div>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
