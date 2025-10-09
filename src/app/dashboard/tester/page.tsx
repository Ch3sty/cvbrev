'use client';

import { motion } from 'framer-motion';
import { Brain, Grid3x3, Clock, Target, ArrowRight } from 'lucide-react';
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
        {/* Matrislogik Test Card */}
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

        {/* Future tests placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200 opacity-60"
        >
          <h3 className="text-xl font-bold text-gray-500 mb-2">
            Fler tester kommer snart
          </h3>
          <p className="text-gray-500">
            Vi jobbar på att lägga till verbala och numeriska tester.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
