'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Rocket,
  Trophy,
  Target,
  ArrowRight,
  Upload,
  FileText,
  Brain,
  Linkedin,
  CheckCircle,
  Palette,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { useNotification } from '@/context/notificationcontext';

// Components
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';

interface QuickStartCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
  completed?: boolean;
}

export default function KomIgangPage() {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { successWithMascot } = useNotification();

  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchUserStatus();
  }, []);

  async function fetchUserStatus() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, premium_until, premium_source, onboarding_steps_completed, onboarding_completed')
        .eq('id', user.id)
        .single();

      const isPremiumUser = !!(
        profile?.subscription_tier === 'premium' ||
        (profile?.premium_until && new Date(profile.premium_until) > new Date()) ||
        profile?.premium_source
      );

      setIsPremium(isPremiumUser);

      // Fetch actual counts from database to validate completed steps
      const completedStepsArray = profile?.onboarding_steps_completed || [];

      const { count: cvCount } = await supabase
        .from('cv_texts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: letterCount } = await supabase
        .from('letters')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: analysisCount } = await supabase
        .from('cv_analysis_jobs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const { count: linkedinCount } = await supabase
        .from('linkedin_optimizations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: templateCount } = await supabase
        .from('formatted_cv_downloads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: jobMatchCount } = await supabase
        .from('job_matchings_cache')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Build validated steps array using hybrid logic
      const validatedSteps: string[] = [];
      if (completedStepsArray.includes('upload_cv') || (cvCount || 0) > 0) {
        validatedSteps.push('upload_cv');
      }
      if (completedStepsArray.includes('create_letter') || (letterCount || 0) > 0) {
        validatedSteps.push('create_letter');
      }
      if (completedStepsArray.includes('analyze_cv') || (analysisCount || 0) > 0) {
        validatedSteps.push('analyze_cv');
      }
      if (completedStepsArray.includes('optimize_linkedin') || (linkedinCount || 0) > 0) {
        validatedSteps.push('optimize_linkedin');
      }
      if (completedStepsArray.includes('download_cv_template') || (templateCount || 0) > 0) {
        validatedSteps.push('download_cv_template');
      }
      if (completedStepsArray.includes('match_jobs') || (jobMatchCount || 0) > 0) {
        validatedSteps.push('match_jobs');
      }

      setCompletedSteps(validatedSteps);
      setLoading(false);

      // Check if 3 required steps are completed (onboarding complete)
      const requiredSteps = ['upload_cv', 'create_letter', 'analyze_cv'];
      const allCompleted = requiredSteps.every(step => validatedSteps.includes(step));

      // Show completion notification if just completed and not already shown
      if (allCompleted && !profile?.onboarding_completed) {
        // Update onboarding_completed in database
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);

        // Show mascot notification
        successWithMascot(
          'Du är redo att börja söka jobb. Vi har allt vi behöver för att hjälpa dig.',
          'onboarding-complete',
          6000
        );
      }
    } catch (error) {
      console.error('Error fetching user status:', error);
      setLoading(false);
    }
  }

  const quickStartCards: QuickStartCard[] = [
    {
      title: 'Ladda upp ditt CV',
      description: 'Grunden för alla funktioner - ladda upp ditt CV i PDF-format',
      icon: Upload,
      href: '/dashboard/profil/cv',
      gradient: 'from-blue-500 to-indigo-600',
      completed: completedSteps.includes('upload_cv')
    },
    {
      title: 'Skapa personligt brev',
      description: 'Skapa ett skräddarsytt personligt brev på under en minut',
      icon: FileText,
      href: '/dashboard/skapa-brev',
      gradient: 'from-purple-500 to-pink-600',
      completed: completedSteps.includes('create_letter')
    },
    {
      title: 'Analysera ditt CV',
      description: 'Få konkret feedback som lyfter ditt CV',
      icon: Brain,
      href: '/dashboard/cv-analys',
      gradient: 'from-emerald-500 to-teal-600',
      completed: completedSteps.includes('analyze_cv')
    },
    {
      title: 'Optimera LinkedIn',
      description: 'Gör din LinkedIn-profil synlig för rekryterare',
      icon: Linkedin,
      href: '/dashboard/linkedin-optimizer',
      gradient: 'from-orange-500 to-red-600',
      completed: completedSteps.includes('optimize_linkedin')
    },
    {
      title: 'Ladda ner CV-mall',
      description: 'Välj en professionell mall och ladda ner ditt CV',
      icon: Palette,
      href: '/dashboard/cv-mallar',
      gradient: 'from-rose-500 to-pink-600',
      completed: completedSteps.includes('download_cv_template')
    },
    {
      title: 'Hitta matchande jobb',
      description: 'Upptäck jobb som faktiskt matchar din profil',
      icon: Briefcase,
      href: '/dashboard/jobbmatchning',
      gradient: 'from-amber-500 to-orange-600',
      completed: completedSteps.includes('match_jobs')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600">Laddar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Subtil orange radial-glow uppe — matchar (public)/auth-DNA */}
      <div
        className="fixed inset-x-0 top-0 h-[50vh] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Main Content */}
      <div className="relative z-10 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-4"
          >
            <Rocket className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
              Din väg till framgång
            </span>
            <br />
            <span className="text-slate-900">börjar här</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
            Slutför 3 steg och <strong className="text-blue-600">få 1 dag gratis Premium</strong> att testa alla funktioner.
          </p>

          {/* Reward Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300/50 rounded-full shadow-lg mb-2"
          >
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-bold text-yellow-900">
              Slutför 3 steg = 1 dag gratis Premium
            </span>
          </motion.div>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm"
          >
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">
              {Math.min(completedSteps.filter(s => ['upload_cv', 'create_letter', 'analyze_cv'].includes(s)).length, 3)}/3 steg klara
            </span>
          </motion.div>
        </motion.div>

        {/* Onboarding Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <OnboardingChecklist isPremium={isPremium} />
        </motion.div>

        {/* Quick Start Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-900">Snabbgenvägar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickStartCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Link href={card.href}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${card.gradient} shadow-lg hover:shadow-xl transition-shadow group cursor-pointer`}
                    >
                      {/* Completed badge */}
                      {card.completed && (
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-white">
                          <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                          <p className="text-white/90 text-sm mb-4">
                            {card.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
                            <span>{card.completed ? 'Gå till' : 'Börja nu'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Hover gradient effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Motivational Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center py-12 space-y-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            Du är på rätt väg!
          </h3>
          <p className="text-slate-600 max-w-xl mx-auto">
            Varje steg du tar för dig närmare ditt drömjobb. Ta det i din egen takt och kom ihåg - vi finns här för att hjälpa dig hela vägen.
          </p>

          {!isPremium && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="pt-6"
            >
              <Link href="/dashboard/profil/prenumeration">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow inline-flex items-center gap-2"
                >
                  Uppgradera till Premium
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
