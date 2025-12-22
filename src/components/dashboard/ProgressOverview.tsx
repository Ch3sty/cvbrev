'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Target,
  CheckCircle2,
  Circle,
  ArrowRight,
  FileText,
  PenTool,
  Briefcase,
  Brain,
  Sparkles
} from 'lucide-react';

interface ProgressOverviewProps {
  totalLetters: number;
  cvCount: number;
  onboardingCompleted: boolean;
}

interface ProgressStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  href: string;
}

export default function ProgressOverview({
  totalLetters,
  cvCount,
  onboardingCompleted
}: ProgressOverviewProps) {
  // Definiera stegen i ansökningsresan
  const steps: ProgressStep[] = [
    {
      id: 'cv',
      label: 'CV',
      icon: <FileText className="w-4 h-4" />,
      completed: cvCount > 0,
      href: '/dashboard/profil/cv'
    },
    {
      id: 'letter',
      label: 'Brev',
      icon: <PenTool className="w-4 h-4" />,
      completed: totalLetters > 0,
      href: '/dashboard/skapa-brev'
    },
    {
      id: 'match',
      label: 'Match',
      icon: <Briefcase className="w-4 h-4" />,
      completed: false, // TODO: Implementera matchning-tracking
      href: '/dashboard/jobbmatchning'
    },
    {
      id: 'test',
      label: 'Test',
      icon: <Brain className="w-4 h-4" />,
      completed: false, // TODO: Implementera test-tracking
      href: '/dashboard/tester'
    },
    {
      id: 'ready',
      label: 'Redo!',
      icon: <Sparkles className="w-4 h-4" />,
      completed: cvCount > 0 && totalLetters >= 3,
      href: '/dashboard'
    }
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  // Hitta nästa steg att rekommendera
  const getNextStep = (): { message: string; cta: string; href: string } => {
    if (cvCount === 0) {
      return {
        message: 'Ladda upp ditt CV för att komma igång med din jobbsökning.',
        cta: 'Ladda upp CV',
        href: '/dashboard/profil/cv'
      };
    }
    if (totalLetters === 0) {
      return {
        message: 'Skapa ditt första personliga brev för att börja ansöka om jobb.',
        cta: 'Skapa brev',
        href: '/dashboard/skapa-brev'
      };
    }
    if (totalLetters < 3) {
      return {
        message: `Du har skapat ${totalLetters} brev. Fortsätt skapa fler för att öka dina chanser!`,
        cta: 'Skapa fler brev',
        href: '/dashboard/skapa-brev'
      };
    }
    return {
      message: `Bra jobbat! Du har skapat ${totalLetters} brev och ${cvCount} CV. Prova jobbmatchning för att hitta perfekta jobb.`,
      cta: 'Hitta jobb',
      href: '/dashboard/jobbmatchning'
    };
  };

  const nextStep = getNextStep();

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Din Ansökningsresa</h2>
          <p className="text-sm text-slate-500">{completedSteps} av {steps.length} steg avklarade</p>
        </div>
      </div>

      {/* Progress Timeline - Desktop */}
      <div className="hidden sm:block mb-6">
        <div className="relative">
          {/* Progress bar bakgrund */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full" />
          {/* Progress bar fylld */}
          <motion.div
            className="absolute top-5 left-0 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Steg */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => (
              <Link
                key={step.id}
                href={step.href}
                className="flex flex-col items-center group"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${step.completed
                      ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                    }
                  `}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </motion.div>
                <span className={`
                  mt-2 text-xs font-medium transition-colors
                  ${step.completed ? 'text-pink-600' : 'text-slate-500 group-hover:text-slate-700'}
                `}>
                  {step.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Timeline - Mobile */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center gap-1 mb-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              <div className={`
                w-full h-2 rounded-full transition-colors
                ${step.completed
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                  : 'bg-slate-200'
                }
              `} />
              {index < steps.length - 1 && <div className="w-1" />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs">
          {steps.map((step) => (
            <span
              key={step.id}
              className={step.completed ? 'text-pink-600 font-medium' : 'text-slate-400'}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>

      {/* Motiverande text och CTA */}
      <div className="bg-gradient-to-r from-slate-50 to-pink-50/30 rounded-xl p-4 border border-slate-100">
        <p className="text-slate-700 text-sm sm:text-base mb-3">
          {nextStep.message}
        </p>
        <Link
          href={nextStep.href}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all touch-manipulation"
        >
          {nextStep.cta}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
