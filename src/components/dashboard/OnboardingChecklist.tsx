'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Upload,
  FileText,
  Brain,
  Linkedin,
  ChevronDown,
  ChevronUp,
  Trophy,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  icon: React.ElementType;
  order: number;
}

interface OnboardingChecklistProps {
  isPremium: boolean;
}

export default function OnboardingChecklist({ isPremium }: OnboardingChecklistProps) {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchOnboardingProgress();
  }, []);

  async function fetchOnboardingProgress() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Hämta profil med onboarding data och CV count
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_steps_completed, onboarding_completed')
        .eq('id', user.id)
        .single();

      // Hämta CV count
      const { count: cvCount } = await supabase
        .from('cv_texts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Hämta letter count
      const { count: letterCount } = await supabase
        .from('letters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Hämta CV analysis count
      const { count: analysisCount } = await supabase
        .from('cv_analysis_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // Hämta LinkedIn optimization count
      const { count: linkedinCount } = await supabase
        .from('linkedin_optimizations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const completedSteps = profile?.onboarding_steps_completed || [];

      const allSteps: OnboardingStep[] = [
        {
          id: 'upload_cv',
          title: 'Ladda upp ditt CV',
          description: 'Första steget - ladda upp ditt CV så att vi kan hjälpa dig',
          completed: completedSteps.includes('upload_cv') || (cvCount || 0) > 0,
          link: '/dashboard/profil/cv',
          icon: Upload,
          order: 1
        },
        {
          id: 'create_letter',
          title: 'Skapa ditt första personliga brev',
          description: 'Låt AI:n skapa ett skräddarsytt personligt brev på sekunder',
          completed: completedSteps.includes('create_letter') || (letterCount || 0) > 0,
          link: '/dashboard/skapa-brev',
          icon: FileText,
          order: 2
        },
        {
          id: 'analyze_cv',
          title: 'Analysera ditt CV',
          description: 'Få professionell feedback på ditt CV med AI-driven analys',
          completed: completedSteps.includes('analyze_cv') || (analysisCount || 0) > 0,
          link: '/dashboard/cv-analys',
          icon: Brain,
          order: 3
        },
        {
          id: 'optimize_linkedin',
          title: 'Optimera din LinkedIn-profil',
          description: 'Förbättra din synlighet på LinkedIn med AI-optimering',
          completed: completedSteps.includes('optimize_linkedin') || (linkedinCount || 0) > 0,
          link: '/dashboard/linkedin-optimizer',
          icon: Linkedin,
          order: 4
        }
      ];

      setSteps(allSteps);

      const completedCount = allSteps.filter(s => s.completed).length;
      const previousCompletedCount = steps.filter(s => s.completed).length;

      // Visa celebration om användaren precis slutförde alla steg
      if (completedCount === 4 && previousCompletedCount < 4 && steps.length > 0) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
      }

      // Auto-collapse efter att alla steg är klara
      if (profile?.onboarding_completed && completedCount === 4) {
        setIsExpanded(false);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
      setLoading(false);
    }
  }

  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progressPercent = (completedCount / totalSteps) * 100;
  const allCompleted = completedCount === totalSteps;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-2 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  // Dölj helt om alla är klara och användaren har collapse:at
  if (allCompleted && !isExpanded) {
    return (
      <motion.button
        onClick={() => setIsExpanded(true)}
        className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl shadow-sm border border-emerald-200 p-4 hover:shadow-md transition-shadow group"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900">Onboarding slutförd! 🎉</p>
              <p className="text-sm text-slate-600">Klicka för att se vad du åstadkommit</p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl shadow-sm border ${
        allCompleted
          ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-200'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Celebration confetti effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-10"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899'][i % 4],
                  left: `${Math.random() * 100}%`,
                  top: '-10%'
                }}
                animate={{
                  y: ['0vh', '100vh'],
                  rotate: [0, 360],
                  opacity: [1, 0]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: 'easeOut',
                  delay: Math.random() * 0.5
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {allCompleted ? (
                <Trophy className="w-6 h-6 text-emerald-500" />
              ) : (
                <Sparkles className="w-6 h-6 text-blue-500" />
              )}
              <h3 className="text-lg font-bold text-slate-900">
                {allCompleted ? 'Grattis! Du är igång! 🎉' : 'Kom igång med Jobbcoach.ai'}
              </h3>
            </div>
            <p className="text-sm text-slate-600">
              {allCompleted
                ? 'Fantastiskt! Du har upptäckt alla våra huvudfunktioner.'
                : `${completedCount} av ${totalSteps} steg klara • ${Math.round(5 - (completedCount * 1.25))} min kvar`
              }
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                allCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Steps list */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {step.completed ? (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-700 line-through">{step.title}</p>
                          <p className="text-sm text-slate-500">Slutförd!</p>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={step.link}
                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 hover:border-blue-300 hover:shadow-md transition-all group"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                          <StepIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {step.title}
                          </p>
                          <p className="text-sm text-slate-600">{step.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium upsell for free users who completed onboarding */}
        {allCompleted && !isPremium && isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 mb-1">
                  Redo för nästa steg?
                </p>
                <p className="text-sm text-slate-600 mb-3">
                  Uppgradera till Premium för obegränsade brev, analyser och LinkedIn-optimeringar.
                </p>
                <Link
                  href="/dashboard/profil/prenumeration"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  Utforska Premium
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
