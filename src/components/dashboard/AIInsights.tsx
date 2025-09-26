'use client';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, Target, Sparkles, ArrowRight, Brain } from 'lucide-react';
import Link from 'next/link';
import PremiumCard from './PremiumCard';

interface AIInsightsProps {
  totalLetters: number;
  subscriptionTier: string;
  currentLevel?: number;
  isPremium?: boolean;
}

interface Insight {
  id: string;
  icon: React.ReactElement;
  title: string;
  description: string;
  action: string;
  href: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

export default function AIInsights({
  totalLetters,
  subscriptionTier,
  currentLevel = 1,
  isPremium = false
}: AIInsightsProps) {
  const getPersonalizedInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // Beginner insights
    if (totalLetters === 0) {
      insights.push({
        id: 'first-letter',
        icon: <Target className="w-5 h-5" />,
        title: 'Börja din karriärresa',
        description: 'Skapa ditt första personliga brev och få AI-optimerade förslag som ökar dina chanser att få intervju.',
        action: 'Skapa brev',
        href: '/dashboard/skapa-brev',
        color: 'from-pink-500 to-rose-500',
        priority: 'high'
      });
    }

    // CV Analysis suggestion
    if (totalLetters > 0 && totalLetters < 3) {
      insights.push({
        id: 'cv-analysis',
        icon: <Brain className="w-5 h-5" />,
        title: 'Optimera ditt CV',
        description: 'Låt vår AI analysera ditt CV och få konkreta förbättringsförslag som matchar moderna rekryterares förväntningar.',
        action: 'Analysera CV',
        href: '/dashboard/cv-analys',
        color: 'from-blue-500 to-cyan-500',
        priority: 'medium'
      });
    }

    // Level progression
    if (currentLevel < 3) {
      insights.push({
        id: 'level-up',
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Nå nästa level',
        description: `Du är på Level ${currentLevel}. Skapa ${5 - totalLetters} fler brev för att låsa upp nya funktioner och belöningar.`,
        action: 'Se belöningar',
        href: '/dashboard/rewards',
        color: 'from-purple-500 to-indigo-500',
        priority: 'low'
      });
    }

    // Premium upgrade suggestion
    if (!isPremium && totalLetters >= 2) {
      insights.push({
        id: 'premium-upgrade',
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Uppgradera till Premium',
        description: 'Få obegränsade CV-analyser, avancerade AI-funktioner och prioriterad support för bara 149 SEK/månad.',
        action: 'Uppgradera',
        href: '/pricing',
        color: 'from-orange-500 to-red-500',
        priority: 'medium'
      });
    }

    // Advanced tips for experienced users
    if (totalLetters >= 5) {
      insights.push({
        id: 'advanced-tips',
        icon: <Lightbulb className="w-5 h-5" />,
        title: 'Avancerade karriärtips',
        description: 'Du har skapat flera brev! Utforska våra avancerade AI-verktyg för att ytterligare förbättra din ansökningsprocess.',
        action: 'Utforska verktyg',
        href: '/dashboard/tools',
        color: 'from-green-500 to-emerald-500',
        priority: 'low'
      });
    }

    // Sort by priority
    const priorityOrder: Record<'high' | 'medium' | 'low', number> = { high: 3, medium: 2, low: 1 };
    return insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]).slice(0, 2);
  };

  const insights = getPersonalizedInsights();

  const todaysTip = {
    title: 'Dagens AI-tips',
    content: 'Använd nyckelord från jobbannonnsen i ditt personliga brev för att öka chanserna att passera ATS-system med upp till 40%.',
    category: 'Optimering'
  };

  return (
    <PremiumCard className="p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-3">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">AI Insights & Tips</h3>
          <p className="text-slate-600 text-sm">Personaliserade råd för din karriär</p>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Today's Tip */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200/60">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 rounded-lg p-2 flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-slate-900 text-sm">{todaysTip.title}</h4>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {todaysTip.category}
                  </span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {todaysTip.content}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Personalized Insights */}
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            >
              <Link href={insight.href} className="block group">
                <div className="bg-white/60 rounded-xl p-4 border border-slate-200/60 hover:border-slate-300/80 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`bg-gradient-to-r ${insight.color} rounded-lg p-2 text-white flex-shrink-0`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-900 text-sm group-hover:text-pink-600 transition-colors">
                          {insight.title}
                        </h4>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed mb-3">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
                          {insight.action}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA for more insights */}
        {insights.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center py-8"
          >
            <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-6 h-6 text-slate-400" />
            </div>
            <h4 className="font-medium text-slate-900 mb-2">Fler insikter kommer</h4>
            <p className="text-slate-600 text-sm mb-4">
              Skapa fler brev för att få personaliserade AI-råd
            </p>
            <Link
              href="/dashboard/skapa-brev"
              className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
            >
              Skapa brev
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </PremiumCard>
  );
}