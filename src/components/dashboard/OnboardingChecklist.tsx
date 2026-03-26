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
  Target,
  ArrowRight,
  Palette,
  Briefcase,
  Gift,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  icon: React.ElementType;
  order: number;
  timeEstimate: string;
  required: boolean;
}

interface OnboardingChecklistProps {
  isPremium: boolean;
}

const REQUIRED_STEP_IDS = ['upload_cv', 'create_letter', 'analyze_cv'];

export default function OnboardingChecklist({ isPremium }: OnboardingChecklistProps) {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showBonusSteps, setShowBonusSteps] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = getSupabaseClient();
  const { rewardClaimed, markRewardClaimed } = useOnboarding();

  useEffect(() => {
    fetchOnboardingProgress();
  }, []);

  async function fetchOnboardingProgress() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_steps_completed, onboarding_completed')
        .eq('id', user.id)
        .single();

      const [
        { count: cvCount },
        { count: letterCount },
        { count: analysisCount },
        { count: linkedinCount },
        { count: templateDownloadCount },
        { count: jobMatchCount }
      ] = await Promise.all([
        supabase.from('cv_texts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('letters').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('cv_analysis_jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('linkedin_optimizations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('formatted_cv_downloads').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('job_matchings_cache').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      const completedSteps = profile?.onboarding_steps_completed || [];

      const allSteps: OnboardingStep[] = [
        {
          id: 'upload_cv',
          title: 'Ladda upp ditt CV',
          description: 'Grunden för alla funktioner',
          completed: completedSteps.includes('upload_cv') || (cvCount || 0) > 0,
          link: '/dashboard/profil/cv',
          icon: Upload,
          order: 1,
          timeEstimate: '~1 min',
          required: true
        },
        {
          id: 'create_letter',
          title: 'Skapa ditt första brev',
          description: 'Klistra in en jobbannons och få ett skräddarsytt personligt brev',
          completed: completedSteps.includes('create_letter') || (letterCount || 0) > 0,
          link: '/dashboard/skapa-brev',
          icon: FileText,
          order: 2,
          timeEstimate: '~2 min',
          required: true
        },
        {
          id: 'analyze_cv',
          title: 'Analysera ditt CV',
          description: 'Få feedback på ditt CV eller ladda ner det i en professionell mall',
          completed: completedSteps.includes('analyze_cv') || (analysisCount || 0) > 0,
          link: '/dashboard/cv-analys',
          icon: Brain,
          order: 3,
          timeEstimate: '~1 min',
          required: true
        },
        {
          id: 'optimize_linkedin',
          title: 'Optimera din LinkedIn-profil',
          description: 'Förbättra din synlighet på LinkedIn',
          completed: completedSteps.includes('optimize_linkedin') || (linkedinCount || 0) > 0,
          link: '/dashboard/linkedin-optimizer',
          icon: Linkedin,
          order: 4,
          timeEstimate: '~3 min',
          required: false
        },
        {
          id: 'download_cv_template',
          title: 'Ladda ner CV i professionell mall',
          description: 'Välj bland våra CV-mallar',
          completed: completedSteps.includes('download_cv_template') || (templateDownloadCount || 0) > 0,
          link: '/dashboard/cv-mallar',
          icon: Palette,
          order: 5,
          timeEstimate: '~1 min',
          required: false
        },
        {
          id: 'match_jobs',
          title: 'Hitta matchande jobb',
          description: 'Upptäck jobb som passar din profil',
          completed: completedSteps.includes('match_jobs') || (jobMatchCount || 0) > 0,
          link: '/dashboard/jobbmatchning',
          icon: Briefcase,
          order: 6,
          timeEstimate: '~2 min',
          required: false
        }
      ];

      setSteps(allSteps);

      const requiredSteps = allSteps.filter(s => s.required);
      const requiredCompleted = requiredSteps.filter(s => s.completed).length;
      const prevRequiredCompleted = steps.filter(s => s.required && s.completed).length;

      if (requiredCompleted === 3 && prevRequiredCompleted < 3 && steps.length > 0) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
      }

      if (profile?.onboarding_completed && requiredCompleted === 3) {
        setIsExpanded(false);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
      setLoading(false);
    }
  }

  async function handleClaimReward() {
    setClaiming(true);
    setClaimError(null);

    try {
      const response = await fetch('/api/onboarding/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to claim reward');
      }

      markRewardClaimed();
      setShowCelebration(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error claiming reward:', error);
      setClaimError(error instanceof Error ? error.message : 'Ett fel uppstod vid hämtning av belöning');
    } finally {
      setClaiming(false);
    }
  }

  const requiredSteps = steps.filter(s => s.required);
  const bonusSteps = steps.filter(s => !s.required);
  const requiredCompleted = requiredSteps.filter(s => s.completed).length;
  const allRequiredDone = requiredCompleted === 3;
  const progressPercent = (requiredCompleted / 3) * 100;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-2 bg-slate-200 rounded w-full"></div>
      </div>
    );
  }

  // Collapsed state when all required steps are done
  if (allRequiredDone && !isExpanded) {
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
              <p className="font-semibold text-slate-900">Alla steg slutförda</p>
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
        allRequiredDone
          ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-200'
          : 'bg-white border-slate-200'
      }`}
    >
      {/* Celebration confetti */}
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
              {allRequiredDone ? (
                <Trophy className="w-6 h-6 text-emerald-500" />
              ) : (
                <Target className="w-6 h-6 text-blue-500" />
              )}
              <h3 className="text-lg font-bold text-slate-900">
                {allRequiredDone ? 'Alla steg slutförda' : 'Kom igång med Jobbcoach.ai'}
              </h3>
            </div>
            <p className="text-sm text-slate-600">
              {allRequiredDone
                ? 'Du har testat alla kärnfunktioner.'
                : `${requiredCompleted} av 3 steg klara`
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
                allRequiredDone
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Step progression indicator */}
        {!allRequiredDone && isExpanded && (
          <div className="flex items-center justify-center gap-0 mb-6">
            {requiredSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.completed
                    ? 'bg-emerald-500 text-white'
                    : index === requiredCompleted
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < requiredSteps.length - 1 && (
                  <div className={`w-12 sm:w-20 h-0.5 ${
                    requiredSteps[index + 1]?.completed || (step.completed && index + 1 === requiredCompleted)
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Required steps list */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {requiredSteps.map((step, index) => {
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
                        </div>
                        <span className="text-xs text-slate-400">{step.timeEstimate}</span>
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
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.timeEstimate}
                          </span>
                          <ArrowRight className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    )}
                  </motion.div>
                );
              })}

              {/* Reward text */}
              {!allRequiredDone && (
                <p className="text-sm text-slate-500 text-center pt-2">
                  Slutför alla 3 steg och få 1 dag Premium gratis
                </p>
              )}

              {/* Bonus steps section */}
              {bonusSteps.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setShowBonusSteps(!showBonusSteps)}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors w-full"
                  >
                    {showBonusSteps ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    <span>Utforska fler verktyg (valfritt)</span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {bonusSteps.filter(s => s.completed).length}/{bonusSteps.length}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showBonusSteps && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2 mt-3"
                      >
                        {bonusSteps.map((step) => {
                          const StepIcon = step.icon;
                          return (
                            <Link
                              key={step.id}
                              href={step.link}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                step.completed
                                  ? 'bg-slate-50'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              {step.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                              ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0" />
                              )}
                              <span className={`text-sm flex-1 ${
                                step.completed ? 'text-slate-500 line-through' : 'text-slate-700'
                              }`}>
                                {step.title}
                              </span>
                              {!step.completed && (
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                              )}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reward claim card */}
        {allRequiredDone && !rewardClaimed && isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-lg mb-1">
                  Hämta din belöning
                </h4>
                <p className="text-sm text-slate-700 mb-4">
                  Du har slutfört alla steg. Hämta 1 dag kostnadsfri Premium som tack.
                </p>
                {claimError && (
                  <p className="text-sm text-red-600 mb-3">{claimError}</p>
                )}
                <button
                  onClick={handleClaimReward}
                  disabled={claiming}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {claiming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Hämtar...
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Hämta 1 dag Premium
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Success message after reward claimed */}
        {allRequiredDone && rewardClaimed && isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-slate-100 border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <p className="text-sm text-slate-600">
                Belöning hämtad! Din Premium-tid har aktiverats.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
