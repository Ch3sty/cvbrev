'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { IconTarget } from '@/components/dashboard/illustrations/DashboardIcons';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { motion } from 'framer-motion';
import { useNotification } from '@/context/notificationcontext';

// Streak-fokuserade komponenter
import StreakHero from '@/components/dashboard/StreakHero';
import CvStatusCard from '@/components/dashboard/CvStatusCard';
// Nya redesignade komponenter (orange/rod-DNA)
import DashboardSnabbAtgarder from '@/components/dashboard/DashboardSnabbAtgarder';
import DashboardSenasteAktivitet from '@/components/dashboard/DashboardSenasteAktivitet';
// Ovriga
import LiveActivityIndicator from '@/components/dashboard/LiveActivityIndicator';
import FirstTimeUserModal from '@/components/dashboard/FirstTimeUserModal';

interface DashboardStats {
  totalLetters: number;
  totalAnalyses: number;
  subscriptionTier: string;
  recentLetters: any[];
  currentLevel?: number;
  levelTitle?: string;
  availableRewards?: number;
  isPremium?: boolean;
  monthlyLetters?: number;
  weeklyLetterCount?: number;
  weeklyAnalysisCount?: number;
  weeklyLinkedInCount?: number;
  cvCount?: number;
  letterResetDate?: Date;
  analysisResetDate?: Date;
  linkedInResetDate?: Date;
  premiumUntil?: string | null;
  premiumSource?: string | null;
  onboardingCompleted?: boolean;
  dailyStreak?: number;
  longestStreak?: number;
  dailyXpEarned?: number;
  dailyXp?: { date: string; xp: number }[];
  firstName?: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { successWithMascotAndActivity } = useNotification();

  const [stats, setStats] = useState<DashboardStats>({
    totalLetters: 0,
    totalAnalyses: 0,
    subscriptionTier: 'free',
    recentLetters: []
  });
  const [loading, setLoading] = useState(true);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { data: letters } = await supabase
          .from('letters')
          .select('id, user_id, title, company, job_title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyLetters = letters?.filter(letter =>
          new Date(letter.created_at) >= startOfMonth
        ) || [];

        const { count: cvCount } = await supabase
          .from('cv_texts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            full_name,
            subscription_tier,
            premium_until,
            premium_source,
            weekly_letter_count,
            weekly_letter_reset_at,
            weekly_analysis_count,
            weekly_analysis_reset_at,
            weekly_linkedin_count,
            weekly_linkedin_reset_at,
            onboarding_completed,
            onboarding_started_at,
            onboarding_skipped,
            created_at
          `)
          .eq('id', user.id)
          .single();

        const { data: gamStats } = await supabase
          .from('global_user_stats')
          .select('daily_streak, longest_streak')
          .eq('user_id', user.id)
          .maybeSingle();

        const todayStockholm = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Europe/Stockholm',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date());
        const { data: dailyXpToday } = await supabase
          .from('user_daily_xp')
          .select('daily_xp_earned')
          .eq('user_id', user.id)
          .eq('date', todayStockholm)
          .maybeSingle();

        const twentyEightDaysAgo = new Date();
        twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 27);
        twentyEightDaysAgo.setHours(0, 0, 0, 0);
        const { data: xpRows } = await supabase
          .from('xp_history')
          .select('created_at, amount')
          .eq('user_id', user.id)
          .gte('created_at', twentyEightDaysAgo.toISOString());

        const dailyXp: { date: string; xp: number }[] = [];
        for (let i = 27; i >= 0; i--) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          day.setHours(0, 0, 0, 0);
          const next = new Date(day);
          next.setDate(next.getDate() + 1);
          const xp = (xpRows || [])
            .filter(r => {
              const d = new Date(r.created_at);
              return d >= day && d < next;
            })
            .reduce((sum, r) => sum + (r.amount ?? 0), 0);
          dailyXp.push({
            date: day.toISOString().slice(0, 10),
            xp,
          });
        }

        const isNewUser = !profile?.onboarding_started_at &&
                         !profile?.onboarding_skipped &&
                         (cvCount || 0) === 0 &&
                         (letters?.length || 0) === 0;

        setIsFirstTimeUser(isNewUser);

        if (isNewUser) {
          setShowFirstTimeModal(true);
        }

        let rewardsData = {
          currentLevel: 1,
          levelTitle: 'Novis',
          availableRewards: 0
        };

        try {
          const rewardsResponse = await fetch('/api/rewards/status');
          if (rewardsResponse.ok) {
            const rewards = await rewardsResponse.json();
            rewardsData = {
              currentLevel: rewards.data.currentLevel || 1,
              levelTitle: rewards.data.levelTitle || 'Novis',
              availableRewards: rewards.data.availableRewards?.length || 0
            };
          }
        } catch (error) {
          console.error('Fel vid hämtning av rewards:', error);
        }

        const isPremium = !!(
          profile?.subscription_tier === 'premium' ||
          (profile?.premium_until && new Date(profile.premium_until) > new Date()) ||
          profile?.premium_source
        );

        setStats({
          totalLetters: letters?.length || 0,
          totalAnalyses: profile?.weekly_analysis_count || 0,
          subscriptionTier: profile?.subscription_tier || 'free',
          recentLetters: letters?.slice(0, 3).map(letter => ({
            ...letter,
            company_name: letter.company,
            position: letter.job_title
          })) || [],
          weeklyLetterCount: profile?.weekly_letter_count || 0,
          weeklyAnalysisCount: profile?.weekly_analysis_count || 0,
          weeklyLinkedInCount: profile?.weekly_linkedin_count || 0,
          cvCount: cvCount || 0,
          letterResetDate: profile?.weekly_letter_reset_at ? new Date(profile.weekly_letter_reset_at) : undefined,
          analysisResetDate: profile?.weekly_analysis_reset_at ? new Date(profile.weekly_analysis_reset_at) : undefined,
          linkedInResetDate: profile?.weekly_linkedin_reset_at ? new Date(profile.weekly_linkedin_reset_at) : undefined,
          currentLevel: rewardsData.currentLevel,
          levelTitle: rewardsData.levelTitle,
          availableRewards: rewardsData.availableRewards,
          isPremium,
          monthlyLetters: monthlyLetters.length,
          premiumUntil: profile?.premium_until || null,
          premiumSource: profile?.premium_source || null,
          onboardingCompleted: profile?.onboarding_completed || false,
          dailyStreak: gamStats?.daily_streak || 0,
          longestStreak: gamStats?.longest_streak || 0,
          dailyXpEarned: dailyXpToday?.daily_xp_earned || 0,
          dailyXp,
          firstName: profile?.full_name?.split(' ')[0] || undefined,
        });
      } catch (error) {
        console.error('Fel vid hämtning av dashboard-data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const premiumActivated = searchParams.get('premium_activated');
    if (premiumActivated === 'true' && stats.subscriptionTier === 'premium') {
      successWithMascotAndActivity(
        'Välkommen till Premium. Nu har du allt upplåst.',
        'premium-activated',
        'premium_activated',
        'aktiverade Premium-prenumeration',
        { tier: 'premium' },
        6000
      );

      const url = new URL(window.location.href);
      url.searchParams.delete('premium_activated');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, stats.subscriptionTier, successWithMascotAndActivity]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600">Laddar dashboard...</p>
        </div>
      </div>
    );
  }

  const cvCount = stats.cvCount || 0;
  const isPremium = stats.isPremium || false;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="fixed inset-x-0 top-0 h-[50vh] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <LiveActivityIndicator className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40" showBadge={false} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-5 sm:space-y-6 relative z-10"
      >
        {/* CV Status Card - bara overst nar CV SAKNAS (gating).
            Nar CV finns visas det som status-rad UNDER streak-kortet (langre ner). */}
        {cvCount === 0 && <CvStatusCard cvCount={cvCount} />}

        {/* Onboarding-banner - bara nar onboarding ej klar */}
        {!stats.onboardingCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
          >
            <Link href="/dashboard/kom-igang">
              <motion.div
                whileHover={{ y: -2 }}
                className="rounded-3xl p-5 sm:p-6 border border-orange-200 hover:border-orange-300 transition-all cursor-pointer group"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 237, 213, 0.6) 0%, rgba(254, 215, 170, 0.4) 100%)',
                  boxShadow: '0 8px 24px -12px rgba(249, 115, 22, 0.2)',
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <IconTarget className="w-12 h-12 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 mb-0.5 leading-tight">
                        Kom igång med 3 enkla steg
                      </h3>
                      <p className="text-sm text-slate-600">
                        Slutför alla 3 och få 1 dag gratis Premium.
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 hidden sm:block">
                    <div
                      className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-bold text-sm group-hover:translate-x-0.5 transition-transform"
                      style={{
                        background:
                          'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                      }}
                    >
                      <span>Kom igång</span>
                      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* StreakHero - innehaller nu streak-stats OCH veckokvotor i samma kort */}
        <StreakHero
          firstName={stats.firstName}
          dailyStreak={stats.dailyStreak || 0}
          longestStreak={stats.longestStreak || 0}
          dailyXpEarned={stats.dailyXpEarned || 0}
          dailyCap={isPremium ? Infinity : 100}
          currentLevel={stats.currentLevel || 1}
          levelTitle={stats.levelTitle || 'Novis'}
          isPremium={isPremium}
          weeklyLetterCount={stats.weeklyLetterCount || 0}
          weeklyAnalysisCount={stats.weeklyAnalysisCount || 0}
          weeklyLinkedInCount={stats.weeklyLinkedInCount || 0}
          letterResetDate={stats.letterResetDate}
          premiumUntil={stats.premiumUntil}
          premiumSource={stats.premiumSource}
        />

        {/* CvStatusCard - status-rad nar CV finns (under streak-kortet, fran email-bannern) */}
        {cvCount > 0 && <CvStatusCard cvCount={cvCount} />}

        {/* Snabbatgarder - full bredd */}
        <DashboardSnabbAtgarder cvCount={cvCount} />

        {/* Senaste aktivitet - full bredd */}
        <DashboardSenasteAktivitet />
      </motion.div>

      {showFirstTimeModal && (
        <FirstTimeUserModal
          onClose={() => setShowFirstTimeModal(false)}
          onSkip={() => setShowFirstTimeModal(false)}
        />
      )}
    </div>
  );
}
