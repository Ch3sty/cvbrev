'use client';

import { motion } from 'framer-motion';
import { Brain, Grid3x3, Clock, Target, ArrowRight, BookOpen, Calculator } from 'lucide-react';
import Link from 'next/link';

export default function TesterPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
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
            <p className="text-slate-600 mt-1">
              Träna inför rekryteringsprocesser
            </p>
          </div>
        </div>
      </motion.div>

      {/* Matrislogik Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Grid3x3 className="w-6 h-6 text-purple-600" />
          Matrislogik
        </h2>
        <p className="text-slate-600 mb-4">
          Identifiera logiska mönster och relationer i visuella matriser
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Matrislogik Grund */}
          <Link href="/dashboard/tester/matrislogik-grund">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-400 transition-all shadow-md hover:shadow-lg group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                    <Grid3x3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Grundnivå</h3>
                    <p className="text-xs text-slate-500">Nivå 1-3</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Träna din förmåga att identifiera grundläggande logiska mönster i visuella matriser.
              </p>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                  <Target className="w-3 h-3" />
                  15 frågor
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-medium">
                  <Clock className="w-3 h-3" />
                  ~25 min
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Matrislogik Avancerad */}
          <Link href="/dashboard/tester/matrislogik-avancerad">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-orange-400 transition-all shadow-md hover:shadow-lg group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                  Avancerad
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                    <Grid3x3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Avancerad nivå</h3>
                    <p className="text-xs text-slate-500">Nivå 2-3</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Utmana dig med komplexa logiska mönster, villkorliga transformationer och abstrakta relationer.
              </p>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md font-medium">
                  <Target className="w-3 h-3" />
                  15 frågor
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md font-medium">
                  <Clock className="w-3 h-3" />
                  ~35 min
                </span>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Verbal Resonemang Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-green-600" />
          Verbal Resonemang
        </h2>
        <p className="text-slate-600 mb-4">
          Förstå, analysera och dra slutsatser från textbaserad information
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Verbal Resonemang */}
          <Link href="/dashboard/tester/verbal-resonemang">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-400 transition-all shadow-md hover:shadow-lg group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Läsförståelse</h3>
                    <p className="text-xs text-slate-500">Nivå 1-3</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Bedöm påståenden som sanna, falska eller kan inte avgöras baserat på textpassager.
              </p>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md font-medium">
                  <BookOpen className="w-3 h-3" />
                  12 passager
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-medium">
                  <Clock className="w-3 h-3" />
                  ~25 min
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Verbal Resonemang v2 */}
          <Link href="/dashboard/tester/verbal-resonemang-v2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-teal-400 transition-all shadow-md hover:shadow-lg group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full">
                  Ny!
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Samhälle & Vetenskap</h3>
                    <p className="text-xs text-slate-500">Nivå 1-3</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform" />
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Analysera textpassager om utbildning, hälsa, klimat, samhälle, vetenskap och kultur.
              </p>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-md font-medium">
                  <BookOpen className="w-3 h-3" />
                  12 passager
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-cyan-50 text-cyan-700 rounded-md font-medium">
                  <Clock className="w-3 h-3" />
                  ~25 min
                </span>
              </div>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Numeriskt Resonemang Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          Numeriskt Resonemang
        </h2>
        <p className="text-slate-600 mb-4">
          Analysera sifferdata, tolka tabeller och lösa matematiska problem
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Numeriskt Test */}
          <Link href="/dashboard/tester/numeriskt-test">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-400 transition-all shadow-md hover:shadow-lg group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                  Ny!
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Affärsanalys</h3>
                    <p className="text-xs text-slate-500">Nivå 2</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Tabeller, grafer, ordproblem och talserier. Testa din förmåga att arbeta med sifferdata.
              </p>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
                  <Target className="w-3 h-3" />
                  20 frågor
                </span>
                <span className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md font-medium">
                  <Clock className="w-3 h-3" />
                  ~20 min
                </span>
              </div>
            </motion.div>
          </Link>

          {/* Placeholder for future numerical test */}
          <div className="bg-slate-100 rounded-xl p-6 border-2 border-dashed border-slate-300 flex items-center justify-center">
            <div className="text-center">
              <Calculator className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Fler numeriska test</p>
              <p className="text-xs text-slate-400">Kommer snart</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
