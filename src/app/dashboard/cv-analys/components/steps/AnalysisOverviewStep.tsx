'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  TrendingUp,
  Target,
  Briefcase,
  Award,
  User,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
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
  totalImpactBreakdown,
}: AnalysisOverviewStepProps) {
  const improvement = potentialScore - atsScore;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const getATSGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getScoreTone = (score: number) => {
    if (score >= 85) return { ring: 'ring-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700' };
    if (score >= 70) return { ring: 'ring-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' };
    return { ring: 'ring-red-300', bg: 'bg-red-50', text: 'text-red-700' };
  };

  const currentTone = getScoreTone(atsScore);
  const potentialTone = getScoreTone(potentialScore);

  const categories = [
    {
      id: 'profile',
      icon: User,
      title: 'Personbeskrivning',
      count: profileImproved ? 1 : 0,
      description: 'Vi optimerar din inledning så att rekryteraren stannar.',
      detail: 'En vass personbeskrivning fångar uppmärksamhet på första raden.',
      priority: profileImproved ? 'high' : 'low',
    },
    {
      id: 'roles',
      icon: Briefcase,
      title: 'Rollbaserade förbättringar',
      count: roleBasedCount,
      description: 'Vi förstärker varje arbetsbeskrivning med resultat och relevans.',
      detail: `Vi går igenom ${roleBasedCount} roll${roleBasedCount === 1 ? '' : 'er'} och föreslår skarpare formuleringar med kvantifierad impact.`,
      priority: roleBasedCount > 5 ? 'high' : 'medium',
    },
    {
      id: 'skills',
      icon: Award,
      title: 'Kompetenser & färdigheter',
      count: skillsCount,
      description: 'Vi hittar nyckelord som rekryterare och ATS letar efter.',
      detail: `Vi lägger till ${skillsCount} efterfrågade kompetenser som matchar din målroll.`,
      priority: skillsCount > 7 ? 'high' : 'medium',
    },
    {
      id: 'general',
      icon: Target,
      title: 'Automatiska förbättringar',
      count: generalCount,
      description: 'Strukturella justeringar som lyfter helhetsintrycket.',
      detail: `${generalCount} förbättringar för läsbarhet, formatering och flow.`,
      priority: 'medium',
    },
  ];

  const quickWins = categories.filter((c) => c.priority === 'high' && c.count > 0);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Resultat-kort: ATS Score */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-white rounded-xl border border-orange-200/50 p-5 sm:p-7"
        >
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
                  ATS-optimering
                </h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      ATS (Applicant Tracking System) är programvara som många företag använder för att filtrera CV:n automatiskt. Ett högre poäng ökar chansen att ditt CV når en rekryterare.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-sm text-neutral-600 mt-0.5">Hur väl ditt CV passerar urvalssystem.</p>
            </div>
            <TrendingUp className="w-5 h-5 text-neutral-700 flex-shrink-0" strokeWidth={2.25} />
          </div>

          <div className="grid grid-cols-[1fr,auto,1fr] gap-3 sm:gap-5 items-center">
            <ScoreBadge
              label="Nuvarande"
              score={atsScore}
              grade={getATSGrade(atsScore)}
              tone={currentTone}
            />

            <div className="flex flex-col items-center gap-2">
              <ArrowRight className="w-5 h-5 text-orange-600" strokeWidth={3} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 hidden sm:inline">
                Med vår hjälp
              </span>
            </div>

            <ScoreBadge
              label="Potential"
              score={potentialScore}
              grade={getATSGrade(potentialScore)}
              tone={potentialTone}
              highlight
            />
          </div>

          <div className="mt-5 flex items-start gap-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-emerald-600 text-white font-bold text-sm tabular-nums">
              +{improvement}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-emerald-900">
                {improvement >= 30 ? 'Stor potential för förbättring' : improvement >= 20 ? 'God förbättringspotential' : 'Förbättring inom räckhåll'}
              </p>
              <p className="text-sm text-emerald-800 mt-0.5 leading-relaxed">
                Tillämpa våra förslag för att öka chansen att passera automatiska urvalssystem med
                <span className="font-semibold"> ~{Math.round(improvement * 1.5)}%</span>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Resultat-summary */}
        <div className="rounded-xl p-5 text-center bg-white border border-neutral-200">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600 mb-1">
            Resultat
          </div>
          <p className="text-base sm:text-lg font-semibold text-neutral-900">
            Vi hittade{' '}
            <span className="font-bold">
              {totalImprovements} förbättringar
            </span>{' '}
            för ditt CV
          </p>
        </div>

        {/* Quick wins */}
        {quickWins.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-5 sm:p-6 bg-white border border-orange-200"
          >
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-orange-600 flex-shrink-0" strokeWidth={2.25} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 mb-1">
                  Snabba vinster
                </div>
                <h4 className="text-base sm:text-lg font-bold text-neutral-900 mb-2">
                  Här ger förbättringarna störst effekt
                </h4>
                <ul className="space-y-1.5">
                  {quickWins.map((win) => (
                    <li key={win.id} className="flex items-center gap-2 text-sm text-neutral-700">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-orange-600" />
                      <span className="font-semibold">{win.title}</span>
                      <span className="text-neutral-500">·</span>
                      <span className="text-neutral-600">
                        {win.count} {win.count === 1 ? 'punkt' : 'punkter'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Kategori-grid */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {categories.map((category, index) => {
            if (category.count === 0) return null;
            const isExpanded = expandedCategory === category.id;
            const isPriority = category.priority === 'high';

            return (
              <motion.button
                key={category.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className={`text-left bg-white rounded-xl border transition-all overflow-hidden p-5 ${
                  isPriority ? 'border-orange-300' : 'border-neutral-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <category.icon className="w-5 h-5 text-neutral-700 flex-shrink-0" strokeWidth={2.25} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-neutral-900 text-sm">{category.title}</h5>
                      {isPriority && (
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          Prioritet
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-2xl font-bold tabular-nums text-orange-600">
                        {category.count}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-orange-700 font-semibold">
                        Detaljer
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-orange-100"
                  >
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {category.detail}
                    </p>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Poängfördelning */}
        {totalImpactBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-orange-600" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-bold text-neutral-900">Så beräknar vi din potential</h4>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Vi viktar dina fem starkaste roller för rättvis poängsättning.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              <PointRow label="Personbeskrivning" value={Math.round(totalImpactBreakdown.profile)} />
              <PointRow label="Rollförbättringar (topp 5)" value={Math.round(totalImpactBreakdown.roles)} />
              <PointRow label="Kompetenser" value={Math.round(totalImpactBreakdown.skills)} />
              <PointRow label="Allmänna förbättringar" value={Math.round(totalImpactBreakdown.general)} />
            </div>

            <div className="border-t border-neutral-200 mt-4 pt-4 flex items-center justify-between">
              <span className="font-bold text-neutral-900">Total möjlig ökning</span>
              <span className="text-xl font-bold tabular-nums text-emerald-700">
                +{totalImpactBreakdown.total} poäng
              </span>
            </div>

            <div className="mt-3 px-3 py-2 rounded-xl bg-amber-50/80 border border-amber-100 text-xs text-amber-900">
              <span className="font-semibold">Tips: </span>
              Ditt faktiska resultat beror på vilka förbättringar du väljer i nästa steg.
            </div>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}

function ScoreBadge({
  label,
  score,
  grade,
  tone,
  highlight = false,
}: {
  label: string;
  score: number;
  grade: string;
  tone: { ring: string; bg: string; text: string };
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ring-2 ${tone.ring} ${tone.bg} mb-2`}
      >
        <span className={`text-2xl sm:text-3xl font-bold ${tone.text}`}>{grade}</span>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-neutral-900 tabular-nums">{score}</div>
      <div className="text-xs text-neutral-600 mt-0.5 font-medium">{label}</div>
    </div>
  );
}

function PointRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-neutral-600">{label}</span>
      <span className="font-semibold text-neutral-900 tabular-nums">+{value} poäng</span>
    </div>
  );
}
