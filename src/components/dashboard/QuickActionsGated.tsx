'use client';

/**
 * QuickActionsGated
 * -----------------
 * Drop-in ersättare för QuickActions.tsx som disablar brev/analys/jobb-CTA
 * när användaren saknar CV. Bevarar prioriteringslogiken från originalet.
 *
 * Skillnad mot originalet:
 *   - När cvCount === 0 ⇒ alla CV-beroende kort blir "Kräver CV" med låsikon
 *   - "Ladda upp CV" lyfts till första prioritet om CV saknas (samma som original)
 *   - Lås-kort renderas grå istället för att gömmas så användaren förstår
 *     vad som finns att låsa upp.
 */

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
  Zap,
  Lock,
} from 'lucide-react';

interface QuickActionsGatedProps {
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
  /** True om kortet kräver att cvCount > 0 */
  requiresCv?: boolean;
}

export default function QuickActionsGated({
  onboardingCompleted,
  totalLetters,
  cvCount,
  isPremium,
}: QuickActionsGatedProps) {
  const hasCv = cvCount > 0;

  const actions: QuickAction[] = useMemo(() => {
    const all: QuickAction[] = [];

    if (!onboardingCompleted) {
      all.push({
        id: 'onboarding',
        title: 'Slutför guiden',
        description: 'Få 1 dag gratis premium',
        icon: <Sparkles className="w-5 h-5" />,
        href: '/dashboard/kom-igang',
        gradient: 'from-blue-500 to-purple-600',
        priority: 1,
      });
    }

    // CV saknas — högsta prio
    if (!hasCv) {
      all.push({
        id: 'cv',
        title: 'Ladda upp CV',
        description: 'Krävs för brev & analys',
        icon: <FileText className="w-5 h-5" />,
        href: '/dashboard/profil/cv',
        gradient: 'from-amber-500 to-orange-600',
        priority: 2,
      });
    }

    // Brev (kräver CV)
    all.push({
      id: 'letter',
      title: hasCv && totalLetters === 0 ? 'Skapa ditt första brev' : 'Skapa nytt brev',
      description: 'Personligt och anpassat',
      icon: <PenTool className="w-5 h-5" />,
      href: '/dashboard/skapa-brev',
      gradient: 'from-pink-500 to-rose-600',
      priority: 3,
      requiresCv: true,
    });

    // Jobbmatchning (kräver CV)
    all.push({
      id: 'matching',
      title: 'Hitta matchande jobb',
      description: 'Baserat på din profil',
      icon: <Briefcase className="w-5 h-5" />,
      href: '/dashboard/jobbmatchning',
      gradient: 'from-orange-500 to-amber-600',
      priority: 4,
      requiresCv: true,
    });

    // Tester (öppna även utan CV)
    all.push({
      id: 'tests',
      title: 'Träna på tester',
      description: 'Förbered dig inför intervjun',
      icon: <Brain className="w-5 h-5" />,
      href: '/dashboard/tester',
      gradient: 'from-indigo-500 to-violet-600',
      priority: 5,
    });

    // LinkedIn (öppna även utan CV)
    all.push({
      id: 'linkedin',
      title: 'Optimera LinkedIn',
      description: 'Bli hittad av rekryterare',
      icon: <Linkedin className="w-5 h-5" />,
      href: '/dashboard/linkedin-optimizer',
      gradient: 'from-cyan-500 to-blue-600',
      priority: 6,
    });

    return all.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }, [onboardingCompleted, totalLetters, cvCount, isPremium, hasCv]);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Snabbåtgärder</h2>
          <p className="text-sm text-slate-500">Ditt nästa steg</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const locked = !!action.requiresCv && !hasCv;
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              {locked ? (
                <LockedCard title={action.title} />
              ) : (
                <Link href={action.href} className="group block">
                  <div
                    className={`relative overflow-hidden rounded-xl p-4 h-full bg-gradient-to-br ${action.gradient} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 touch-manipulation min-h-[100px]`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">{action.icon}</div>
                        <ArrowRight className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-white font-bold text-sm sm:text-base mb-0.5">{action.title}</h3>
                      <p className="text-white/80 text-xs sm:text-sm">{action.description}</p>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function LockedCard({ title }: { title: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-4 h-full bg-slate-100 border border-slate-200 min-h-[100px] cursor-not-allowed opacity-80"
      aria-disabled
    >
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-slate-200 text-slate-400">
          <Lock className="w-5 h-5" />
        </div>
      </div>
      <h3 className="text-slate-500 font-bold text-sm sm:text-base mb-0.5">{title}</h3>
      <p className="text-slate-400 text-xs sm:text-sm">Kräver CV</p>
    </div>
  );
}
