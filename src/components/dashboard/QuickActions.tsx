'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles,
  FileText,
  PenTool,
  Briefcase,
  Brain,
  Linkedin,
  ArrowRight,
  Zap
} from 'lucide-react';

interface QuickActionsProps {
  onboardingCompleted: boolean;
  totalLetters: number;
  cvCount: number;
  isPremium: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  priority: number;
}

export default function QuickActions({
  onboardingCompleted,
  totalLetters,
  cvCount,
  isPremium
}: QuickActionsProps) {
  // Generera dynamiska actions baserat på användarens status
  const actions: QuickAction[] = useMemo(() => {
    const allActions: QuickAction[] = [];

    // Prioritet 1: Introduktion (om inte slutförd)
    if (!onboardingCompleted) {
      allActions.push({
        id: 'onboarding',
        title: 'Slutför guiden',
        description: 'Få 1 dag gratis premium',
        icon: <Sparkles className="w-5 h-5" />,
        href: '/dashboard/kom-igang',
        gradient: 'from-blue-500 to-purple-600',
        priority: 1
      });
    }

    // Prioritet 2: Ladda upp CV (om inget CV finns)
    if (cvCount === 0) {
      allActions.push({
        id: 'cv',
        title: 'Ladda upp CV',
        description: 'Börja din jobbsökning',
        icon: <FileText className="w-5 h-5" />,
        href: '/dashboard/profil/cv',
        gradient: 'from-emerald-500 to-teal-600',
        priority: 2
      });
    }

    // Prioritet 3: Skapa brev (om har CV men inga brev)
    if (cvCount > 0 && totalLetters === 0) {
      allActions.push({
        id: 'letter',
        title: 'Skapa ditt första brev',
        description: 'Personligt och anpassat',
        icon: <PenTool className="w-5 h-5" />,
        href: '/dashboard/skapa-brev',
        gradient: 'from-pink-500 to-rose-600',
        priority: 3
      });
    }

    // Prioritet 4: Jobbmatchning (om har brev)
    if (totalLetters > 0) {
      allActions.push({
        id: 'matching',
        title: 'Hitta matchande jobb',
        description: 'Baserat på din profil',
        icon: <Briefcase className="w-5 h-5" />,
        href: '/dashboard/jobbmatchning',
        gradient: 'from-orange-500 to-amber-600',
        priority: 4
      });
    }

    // Prioritet 5: Rekryteringstester
    allActions.push({
      id: 'tests',
      title: 'Träna på tester',
      description: 'Förbered dig inför intervjun',
      icon: <Brain className="w-5 h-5" />,
      href: '/dashboard/tester',
      gradient: 'from-indigo-500 to-violet-600',
      priority: 5
    });

    // Prioritet 6: LinkedIn-optimering
    allActions.push({
      id: 'linkedin',
      title: 'Optimera LinkedIn',
      description: 'Bli hittad av rekryterare',
      icon: <Linkedin className="w-5 h-5" />,
      href: '/dashboard/linkedin-optimizer',
      gradient: 'from-cyan-500 to-blue-600',
      priority: 6
    });

    // Prioritet 7: Skapa fler brev (om redan har brev)
    if (totalLetters > 0) {
      allActions.push({
        id: 'more-letters',
        title: 'Skapa fler brev',
        description: `Du har ${totalLetters} brev`,
        icon: <PenTool className="w-5 h-5" />,
        href: '/dashboard/skapa-brev',
        gradient: 'from-pink-500 to-rose-600',
        priority: 7
      });
    }

    // Sortera efter prioritet och ta max 3
    return allActions.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }, [onboardingCompleted, totalLetters, cvCount, isPremium]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Snabbåtgärder</h2>
          <p className="text-sm text-slate-500">Ditt nästa steg</p>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <Link
              href={action.href}
              className="group block"
            >
              <div className={`
                relative overflow-hidden rounded-xl p-4 h-full
                bg-gradient-to-br ${action.gradient}
                hover:shadow-lg transition-all duration-300
                hover:-translate-y-1
                touch-manipulation min-h-[100px]
              `}>
                {/* Bakgrundsdekor */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      {action.icon}
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-white font-bold text-sm sm:text-base mb-0.5">
                    {action.title}
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
