'use client';

import { motion } from 'framer-motion';
import { Brain, Grid3x3, Clock, Target, ArrowRight, BookOpen, Calculator, BarChart3, Info, Crown, Lock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/use-profile';
import { useRouter } from 'next/navigation';

export default function TesterPage() {
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const { subscriptionTier, loading } = useProfile();
  const router = useRouter();
  const isPremium = subscriptionTier === 'premium';

  const handlePremiumClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/priser');
  };

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
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Grid3x3 className="w-6 h-6 text-purple-600" />
          Matrislogik
        </h2>
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-600">
            Identifiera logiska mönster och relationer i visuella matriser
          </p>
          <div className="relative">
            <button
              onMouseEnter={() => setHoveredTooltip('matrislogik')}
              onMouseLeave={() => setHoveredTooltip(null)}
              onClick={() => setHoveredTooltip(hoveredTooltip === 'matrislogik' ? null : 'matrislogik')}
              className="p-2 hover:bg-purple-100 rounded-full transition-colors"
            >
              <Info className="w-5 h-5 text-purple-600" />
            </button>
            {hoveredTooltip === 'matrislogik' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-80 bg-purple-50 border-2 border-purple-500 p-4 rounded-lg shadow-lg z-10"
              >
                <div className="text-sm text-slate-700">
                  <p className="font-semibold text-purple-900 mb-1">Varför detta test?</p>
                  <p>Matrislogik mäter abstrakt tänkande och problemlösningsförmåga – viktigt för roller som kräver analytiskt arbete. <span className="font-medium">Tips:</span> Sök efter mönster systematiskt (färg, form, rotation, antal) och eliminera omöjliga alternativ.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

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
          <div className="relative">
            <Link href={isPremium ? "/dashboard/tester/matrislogik-avancerad" : "#"} onClick={!isPremium ? handlePremiumClick : undefined}>
              <motion.div
                whileHover={{ scale: isPremium ? 1.02 : 1 }}
                className={`bg-white rounded-xl p-6 border-2 transition-all shadow-md group cursor-pointer relative overflow-hidden ${
                  isPremium ? 'border-slate-200 hover:border-orange-400 hover:shadow-lg' : 'border-gray-200 opacity-75'
                }`}
              >
                {/* Premium Lock Overlay */}
                {!isPremium && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <div className="text-center p-4">
                      <Lock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-medium mb-2">Premium Test</p>
                      <button
                        onClick={handlePremiumClick}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs rounded-lg font-medium transition-all"
                      >
                        <Crown className="h-3 w-3" />
                        Uppgradera
                      </button>
                    </div>
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center gap-1">
                    {!isPremium && <Crown className="h-3 w-3" />}
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
        </div>
      </motion.div>

      {/* Verbalt Resonemang Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-green-600" />
          Verbalt Resonemang
        </h2>
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-600">
            Förstå, analysera och dra slutsatser från textbaserad information
          </p>
          <div className="relative">
            <button
              onMouseEnter={() => setHoveredTooltip('verbal')}
              onMouseLeave={() => setHoveredTooltip(null)}
              onClick={() => setHoveredTooltip(hoveredTooltip === 'verbal' ? null : 'verbal')}
              className="p-2 hover:bg-green-100 rounded-full transition-colors"
            >
              <Info className="w-5 h-5 text-green-600" />
            </button>
            {hoveredTooltip === 'verbal' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-80 bg-green-50 border-2 border-green-500 p-4 rounded-lg shadow-lg z-10"
              >
                <div className="text-sm text-slate-700">
                  <p className="font-semibold text-green-900 mb-1">Varför detta test?</p>
                  <p>Verbalt resonemang mäter din förmåga att tolka text och dra logiska slutsatser – centralt för roller med mycket dokumentation eller kommunikation. <span className="font-medium">Tips:</span> Basera dina svar endast på given information, gissa inte eller använd extern kunskap.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

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

          {/* Verbalt Resonemang v2 */}
          <div className="relative">
            <Link href={isPremium ? "/dashboard/tester/verbal-resonemang-v2" : "#"} onClick={!isPremium ? handlePremiumClick : undefined}>
              <motion.div
                whileHover={{ scale: isPremium ? 1.02 : 1 }}
                className={`bg-white rounded-xl p-6 border-2 transition-all shadow-md group cursor-pointer relative overflow-hidden ${
                  isPremium ? 'border-slate-200 hover:border-teal-400 hover:shadow-lg' : 'border-gray-200 opacity-75'
                }`}
              >
                {/* Premium Lock Overlay */}
                {!isPremium && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <div className="text-center p-4">
                      <Lock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-medium mb-2">Premium Test</p>
                      <button
                        onClick={handlePremiumClick}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs rounded-lg font-medium transition-all"
                      >
                        <Crown className="h-3 w-3" />
                        Uppgradera
                      </button>
                    </div>
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full flex items-center gap-1">
                    {!isPremium && <Crown className="h-3 w-3" />}
                    Ny!
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Kritisk Läsning</h3>
                      <p className="text-xs text-slate-500">Nivå 1-3</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform" />
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  Analysera textpassager om samhälle och vetenskap. Bedöm påståenden kritiskt och dra väl underbyggda slutsatser.
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
        </div>
      </motion.div>

      {/* Numeriskt Resonemang Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          Numeriskt Resonemang
        </h2>
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-600">
            Analysera sifferdata, tolka tabeller och lösa matematiska problem
          </p>
          <div className="relative">
            <button
              onMouseEnter={() => setHoveredTooltip('numerical')}
              onMouseLeave={() => setHoveredTooltip(null)}
              onClick={() => setHoveredTooltip(hoveredTooltip === 'numerical' ? null : 'numerical')}
              className="p-2 hover:bg-blue-100 rounded-full transition-colors"
            >
              <Info className="w-5 h-5 text-blue-600" />
            </button>
            {hoveredTooltip === 'numerical' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-80 bg-blue-50 border-2 border-blue-500 p-4 rounded-lg shadow-lg z-10"
              >
                <div className="text-sm text-slate-700">
                  <p className="font-semibold text-blue-900 mb-1">Varför detta test?</p>
                  <p>Numeriskt resonemang bedömer din förmåga att arbeta med siffror, data och matematiska koncept – viktigt för analytiska roller, ekonomi och affärsanalys. <span className="font-medium">Tips:</span> Läs tabeller och grafer noggrant, dubbelkolla enheter och använd elimineringsmetoden för att spara tid.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>

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

          {/* Numeriskt Test v2 */}
          <div className="relative">
            <Link href={isPremium ? "/dashboard/tester/numeriskt-test-v2" : "#"} onClick={!isPremium ? handlePremiumClick : undefined}>
              <motion.div
                whileHover={{ scale: isPremium ? 1.02 : 1 }}
                className={`bg-white rounded-xl p-6 border-2 transition-all shadow-md group cursor-pointer relative overflow-hidden ${
                  isPremium ? 'border-slate-200 hover:border-purple-400 hover:shadow-lg' : 'border-gray-200 opacity-75'
                }`}
              >
                {/* Premium Lock Overlay */}
                {!isPremium && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <div className="text-center p-4">
                      <Lock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-medium mb-2">Premium Test</p>
                      <button
                        onClick={handlePremiumClick}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs rounded-lg font-medium transition-all"
                      >
                        <Crown className="h-3 w-3" />
                        Uppgradera
                      </button>
                    </div>
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center gap-1">
                    {!isPremium && <Crown className="h-3 w-3" />}
                    Ny!
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Grafanalys</h3>
                      <p className="text-xs text-slate-500">Nivå 2</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </div>

                <p className="text-sm text-slate-600 mb-4">
                  Stapel-, linje- och cirkeldiagram. Träna visuell datatolkning och trendanalys.
                </p>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md font-medium">
                    <Target className="w-3 h-3" />
                    20 frågor
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 rounded-md font-medium">
                    <Clock className="w-3 h-3" />
                    ~20 min
                  </span>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
