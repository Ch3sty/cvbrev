// src/components/cv/analysis/steps/AnalysisOverviewStep.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Target,
  Briefcase,
  Award,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AnalysisOverviewStepProps {
  totalImprovements: number;
  roleBasedCount: number;
  skillsCount: number;
  generalCount: number;
  profileImproved: boolean;
  atsScore: number;
  potentialScore: number;
  totalImpactBreakdown?: {
    profile: number;
    roles: number;
    skills: number;
    general: number;
    total: number;
  };
}

export default function AnalysisOverviewStep({
  totalImprovements,
  roleBasedCount,
  skillsCount,
  generalCount,
  profileImproved,
  atsScore,
  potentialScore,
  totalImpactBreakdown
}: AnalysisOverviewStepProps) {
  const improvement = potentialScore - atsScore;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Hjälpfunktion för att få ATS-färg baserat på poäng
  const getATSColor = (score: number) => {
    if (score >= 85) return { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', gradient: 'from-green-500 to-emerald-600' };
    if (score >= 70) return { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', gradient: 'from-yellow-500 to-orange-500' };
    return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700', gradient: 'from-red-500 to-rose-600' };
  };

  // Hjälpfunktion för att få ATS-betyg
  const getATSGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const currentColor = getATSColor(atsScore);
  const potentialColor = getATSColor(potentialScore);

  const categories = [
    {
      icon: Briefcase,
      title: 'Rollbaserade förbättringar',
      count: roleBasedCount,
      color: 'from-blue-600 to-cyan-600',
      description: 'Optimering av arbetserfarenheter',
      tooltip: 'Vi förbättrar beskrivningar av dina arbetsuppgifter för att bättre matcha din målroll',
      value: `Optimerar ${roleBasedCount} arbetsupplevelser för att bättre framhäva relevanta resultat och kompetenser`,
      priority: roleBasedCount > 5 ? 'high' : 'medium'
    },
    {
      icon: Award,
      title: 'Kompetenser & färdigheter',
      count: skillsCount,
      color: 'from-purple-600 to-pink-600',
      description: 'Saknade kompetenser identifierade',
      tooltip: 'Kompetenser som ofta efterfrågas i din bransch och som du bör lägga till',
      value: `Lägger till ${skillsCount} efterfrågade kompetenser som ökar dina chanser att matcha jobb-annonser`,
      priority: skillsCount > 7 ? 'high' : 'medium'
    },
    {
      icon: Sparkles,
      title: 'Personbeskrivning',
      count: profileImproved ? 1 : 0,
      color: 'from-pink-600 to-rose-600',
      description: 'Din inledning har optimerats',
      tooltip: 'En stark personbeskrivning fångar rekryterarens uppmärksamhet direkt',
      value: 'Skapar en engagerande inledning som framhäver din unika profil och dina styrkor',
      priority: profileImproved ? 'high' : 'low'
    },
    {
      icon: Target,
      title: 'Allmänna förbättringar',
      count: generalCount,
      color: 'from-green-600 to-emerald-600',
      description: 'Övriga rekommendationer',
      tooltip: 'Strukturella och formateringsmässiga förbättringar för ett mer professionellt CV',
      value: `${generalCount} förbättringar som gör ditt CV mer läsbart och professionellt`,
      priority: 'medium'
    }
  ];

  // Identifiera quick wins (förbättringar med hög prioritet)
  const quickWins = categories.filter(cat => cat.priority === 'high' && cat.count > 0);

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            Din analys är klar!
          </h3>
          <p className="text-lg text-gray-600">
            Vi har identifierat <span className="font-semibold text-pink-600">{totalImprovements} förbättringar</span> för ditt CV
          </p>
        </motion.div>

        {/* ATS Score Card - FÖRBÄTTRAD */}
        <Card className="bg-gradient-to-br from-white via-purple-50/30 to-white border border-slate-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold text-gray-900">ATS-Optimering</h4>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      ATS (Applicant Tracking System) är programvara som stora företag använder för att automatiskt
                      filtrera CV:n. Ett högre ATS-poäng ökar chansen att ditt CV når en mänsklig rekryterare.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-gray-600">Applicant Tracking System</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Current Score */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${currentColor.bg} ${currentColor.border} border-2 mb-2`}>
                <span className={`text-3xl font-bold ${currentColor.text}`}>
                  {getATSGrade(atsScore)}
                </span>
              </div>
              <motion.div
                className="text-3xl font-bold text-gray-900 mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {atsScore}
              </motion.div>
              <div className="text-sm text-gray-600">Nuvarande</div>
            </div>

            {/* Arrow & Progress */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-full">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${currentColor.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(atsScore / 100) * 100}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${potentialColor.gradient}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(potentialScore / 100) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
              <span className="text-2xl text-gray-400 mt-2">→</span>
            </div>

            {/* Potential Score */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${potentialColor.bg} ${potentialColor.border} border-2 mb-2`}>
                <span className={`text-3xl font-bold ${potentialColor.text}`}>
                  {getATSGrade(potentialScore)}
                </span>
              </div>
              <motion.div
                className={`text-3xl font-bold ${potentialColor.text} mb-1`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {potentialScore}
              </motion.div>
              <div className="text-sm text-gray-600">Potential</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">+{improvement}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1">
                  {improvement >= 30 ? 'Betydande förbättring möjlig!' : improvement >= 20 ? 'God förbättringspotential' : 'Förbättring möjlig'}
                </p>
                <p className="text-sm text-green-800">
                  Implementera våra rekommendationer för att öka chansen att ditt CV kommer förbi automatiska
                  urvalsystem med <span className="font-semibold">~{Math.round(improvement * 1.5)}%</span>.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* ATS Impact Breakdown - NYTT! */}
        {totalImpactBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-white border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-600" />
                <h5 className="text-base font-semibold text-gray-900">
                  Poängfördelning från förbättringar
                </h5>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Personbeskrivning:</span>
                  <span className="font-semibold text-gray-900">+{Math.round(totalImpactBreakdown.profile)} poäng</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rollförbättringar:</span>
                  <span className="font-semibold text-gray-900">+{Math.round(totalImpactBreakdown.roles)} poäng</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Kompetenser:</span>
                  <span className="font-semibold text-gray-900">+{Math.round(totalImpactBreakdown.skills)} poäng</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Allmänna förbättringar:</span>
                  <span className="font-semibold text-gray-900">+{Math.round(totalImpactBreakdown.general)} poäng</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total möjlig ökning:</span>
                  <span className="font-bold text-green-600 text-lg">+{totalImpactBreakdown.total} poäng</span>
                </div>
                {totalImpactBreakdown.total > 45 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">Obs!</span> Vi visar en realistisk maxökning på +{Math.min(totalImpactBreakdown.total, 45)} poäng i översikten ovan.
                      Faktiskt resultat beror på vilka förbättringar du väljer att implementera i nästa steg.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quick Wins Section */}
        {quickWins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    Quick Wins - Snabba förbättringar
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">Fokusera på dessa för störst effekt med minst arbete</p>
                      </TooltipContent>
                    </Tooltip>
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Dessa förbättringar ger störst genomslag och är enkla att implementera:
                  </p>
                  <div className="space-y-2">
                    {quickWins.map((win) => (
                      <div key={win.title} className="flex items-center gap-2 text-sm text-gray-800">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium">{win.title}:</span>
                        <span className="text-gray-600">{win.count} förbättringar</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Category Grid - FÖRBÄTTRAD MED EXPANDERBAR FUNKTIONALITET */}
        <div className="grid md:grid-cols-2 gap-4">
          {categories.map((category, index) => {
            const isExpanded = expandedCategory === category.title;
            const isPriority = category.priority === 'high';

            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`bg-white border-slate-200 hover:shadow-md transition-all ${
                  isPriority ? 'ring-2 ring-amber-300' : ''
                }`}>
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.title)}
                    className="w-full p-6 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-gray-900">
                            {category.title}
                          </h5>
                          <Tooltip>
                            <TooltipTrigger onClick={(e) => e.stopPropagation()}>
                              <Info className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">{category.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                          {isPriority && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full">
                              Prioritet
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                            {category.count}
                          </div>
                          {category.count > 0 && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <span>Detaljer</span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanderad sektion */}
                  {isExpanded && category.count > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6 pt-2 border-t border-gray-100"
                    >
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 font-medium mb-2">
                          Vad du får:
                        </p>
                        <p className="text-sm text-gray-600">
                          {category.value}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Vad händer härnäst? - NY SEKTION */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Vad händer härnäst?
              </h4>
              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Välj förbättringar</p>
                    <p className="text-sm text-gray-600">
                      Granska och välj vilka förbättringar du vill implementera. Du har full kontroll!
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Förhandsgranska resultat</p>
                    <p className="text-sm text-gray-600">
                      Se en jämförelse mellan ditt nuvarande CV och det förbättrade CV:t
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Välj mall och spara</p>
                    <p className="text-sm text-gray-600">
                      Välj en professionell mall och ladda ner ditt förbättrade CV som PDF
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-100 rounded-lg p-3">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">
                  Uppskattat tid kvar: ~3-5 minuter
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Call to Action */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            Klicka på <span className="font-semibold text-pink-600">Nästa</span> för att börja välja förbättringar
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}
