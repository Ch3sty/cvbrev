'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BarChart3,
  PenTool,
  Search,
  Linkedin,
  Lightbulb,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface ActivityInsightsProps {
  weeklyLetterCount: number;
  weeklyAnalysisCount: number;
  weeklyLinkedInCount: number;
  totalLetters: number;
  cvCount: number;
}

interface ActivityItem {
  id: string;
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  href: string;
}

export default function ActivityInsights({
  weeklyLetterCount,
  weeklyAnalysisCount,
  weeklyLinkedInCount,
  totalLetters,
  cvCount
}: ActivityInsightsProps) {
  // Beräkna aktivitetsdata
  const activities: ActivityItem[] = useMemo(() => [
    {
      id: 'letters',
      label: 'Personliga brev',
      count: weeklyLetterCount,
      icon: <PenTool className="w-4 h-4" />,
      color: 'from-pink-500 to-rose-500',
      href: '/dashboard/skapa-brev'
    },
    {
      id: 'analysis',
      label: 'CV-analyser',
      count: weeklyAnalysisCount,
      icon: <Search className="w-4 h-4" />,
      color: 'from-blue-500 to-cyan-500',
      href: '/dashboard/cv-analys'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn-optimering',
      count: weeklyLinkedInCount,
      icon: <Linkedin className="w-4 h-4" />,
      color: 'from-indigo-500 to-purple-500',
      href: '/dashboard/linkedin-optimizer'
    }
  ], [weeklyLetterCount, weeklyAnalysisCount, weeklyLinkedInCount]);

  const totalWeeklyActivity = weeklyLetterCount + weeklyAnalysisCount + weeklyLinkedInCount;
  const maxCount = Math.max(...activities.map(a => a.count), 1);

  // Generera smart insikt baserat på användarens beteende
  const getInsight = (): { message: string; cta: string; href: string } => {
    // Om ingen aktivitet alls denna vecka
    if (totalWeeklyActivity === 0) {
      if (cvCount === 0) {
        return {
          message: 'Ladda upp ditt CV för att komma igång med dina jobbansökningar.',
          cta: 'Ladda upp CV',
          href: '/dashboard/profil/cv'
        };
      }
      return {
        message: 'Du har inte använt några verktyg denna vecka. Börja skapa personliga brev!',
        cta: 'Skapa brev',
        href: '/dashboard/skapa-brev'
      };
    }

    // Om mest brev - rekommendera CV-analys
    if (weeklyLetterCount > 0 && weeklyAnalysisCount === 0) {
      return {
        message: 'Du skapar bra med personliga brev! Prova CV-analys för att optimera ditt CV.',
        cta: 'Analysera CV',
        href: '/dashboard/cv-analys'
      };
    }

    // Om endast CV-analys - rekommendera brev
    if (weeklyAnalysisCount > 0 && weeklyLetterCount === 0) {
      return {
        message: 'Bra att du analyserat ditt CV! Nu kan du skapa personliga brev.',
        cta: 'Skapa brev',
        href: '/dashboard/skapa-brev'
      };
    }

    // Om aldrig testat LinkedIn
    if (weeklyLinkedInCount === 0 && (weeklyLetterCount > 0 || weeklyAnalysisCount > 0)) {
      return {
        message: 'Prova LinkedIn-optimering för att få fler rekryterare att hitta dig.',
        cta: 'Optimera LinkedIn',
        href: '/dashboard/linkedin-optimizer'
      };
    }

    // Generellt positivt
    return {
      message: `Bra jobbat denna vecka! Du har använt ${totalWeeklyActivity} verktyg.`,
      cta: 'Fortsätt',
      href: '/dashboard/skapa-brev'
    };
  };

  const insight = getInsight();

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Veckans Aktivitet</h2>
          <p className="text-sm text-slate-500">Senaste 7 dagarna</p>
        </div>
      </div>

      {/* Activity Bars */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-5">
        {activities.map((activity, index) => {
          const percentage = maxCount > 0 ? (activity.count / maxCount) * 100 : 0;

          return (
            <Link
              key={activity.id}
              href={activity.href}
              className="block group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg bg-gradient-to-br ${activity.color} text-white`}>
                    {activity.icon}
                  </span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    {activity.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">{activity.count}</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${activity.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(percentage, activity.count > 0 ? 8 : 0)}%` }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Smart Insight */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 sm:p-4 border border-amber-100">
        <div className="flex items-start gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700">{insight.message}</p>
        </div>
        <Link
          href={insight.href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
        >
          {insight.cta}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
