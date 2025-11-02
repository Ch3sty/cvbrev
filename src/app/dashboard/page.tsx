'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PenTool,
  Brain,
  FileText,
  Palette,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Plus,
  Activity,
  Trophy,
  Gift,
  BarChart3,
  Users,
  Target,
  Search,
  GraduationCap,
  Crown,
  Sparkles
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { motion } from 'framer-motion';

// Import premium components
import WelcomeHero from '@/components/dashboard/WelcomeHero';
import QuotaCard from '@/components/dashboard/QuotaCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import AIInsights from '@/components/dashboard/AIInsights';
import LiveActivityIndicator from '@/components/dashboard/LiveActivityIndicator';
import FloatingParticles from '@/components/dashboard/FloatingParticles';
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
  // Nya dynamiska 7-dagars kvoter
  weeklyLetterCount?: number;
  weeklyAnalysisCount?: number;
  weeklyLinkedInCount?: number;
  cvCount?: number;
  letterResetDate?: Date;
  analysisResetDate?: Date;
  linkedInResetDate?: Date;
  // Premium source data
  premiumUntil?: string | null;
  premiumSource?: string | null;
  // Onboarding tracking
  onboardingCompleted?: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLetters: 0,
    totalAnalyses: 0,
    subscriptionTier: 'free',
    recentLetters: []
  });
  const [loading, setLoading] = useState(true);
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Hämta användarens brev
        const { data: letters } = await supabase
          .from('letters')
          .select('id, user_id, title, company, job_title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Räkna brev skapade denna månad (för premium dashboard)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyLetters = letters?.filter(letter =>
          new Date(letter.created_at) >= startOfMonth
        ) || [];

        // Hämta antal uppladdade CV först
        const { count: cvCount } = await supabase
          .from('cv_texts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Hämta användarens profil med prenumerationsinfo och nya kvotfält + onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
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

        // Check if user is first-time (never started onboarding and has no CVs/letters)
        const isNewUser = !profile?.onboarding_started_at &&
                         !profile?.onboarding_skipped &&
                         (cvCount || 0) === 0 &&
                         (letters?.length || 0) === 0;

        setIsFirstTimeUser(isNewUser);

        // Show modal for new users after a short delay
        if (isNewUser) {
          setTimeout(() => setShowFirstTimeModal(true), 1000);
        }

        // Hämta gamification stats
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

        // Kontrollera premium-status från alla möjliga källor
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
          // Nya dynamiska 7-dagars kvoter
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
          // Premium source data
          premiumUntil: profile?.premium_until || null,
          premiumSource: profile?.premium_source || null,
          // Onboarding tracking
          onboardingCompleted: profile?.onboarding_completed || false
        });
      } catch (error) {
        console.error('Fel vid hämtning av dashboard-data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Remove Smart Quick Actions helper function since we're using static layout now

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600">Laddar dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Premium Dynamic Background - Enhanced like landing page */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.9 }}
      >
        {/* Primary gradient foundation */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50/50" />

        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-50/20 to-pink-50/30" />

        {/* Animated morphing gradient orbs - like landing page */}
        <motion.div
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px]"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(147, 51, 234, 0.05) 40%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 150, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute top-[30%] right-[10%] w-[600px] h-[600px]"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -200, 0],
            y: [0, 150, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px]"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.03) 40%, transparent 70%)',
            filter: 'blur(70px)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: "easeInOut"
          }}
        />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.015,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
          }}
        />
      </motion.div>

      {/* Enhanced floating particles */}
      <FloatingParticles
        count={15}
        colors={['bg-pink-400/8', 'bg-purple-400/8', 'bg-blue-400/8', 'bg-indigo-400/8', 'bg-emerald-400/8']}
        size="lg"
        speed="slow"
        className="fixed inset-0 pointer-events-none z-5"
      />

      {/* Live Activity Indicator - MOVED to bottom right to fix overlap */}
      <LiveActivityIndicator className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40" showBadge={false} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
        className="space-y-4 sm:space-y-6 md:space-y-8 relative z-10"
      >
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        {/* Welcome Hero Section - Redesigned */}
        <WelcomeHero
          currentLevel={stats.currentLevel}
          levelTitle={stats.levelTitle}
          totalLetters={stats.totalLetters}
          cvCount={stats.cvCount}
        />

        {/* Quota Cards / Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4"
        >
          {stats.isPremium ? (
            // Premium Cards
            <>
              <QuotaCard
                title="Brev denna månad"
                icon={<PenTool className="w-5 h-5" />}
                used={stats.monthlyLetters || 0}
                limit={-1}
                remaining={-1}
                isPremium={true}
                premiumText="Obegränsat"
                href="/dashboard/mina-brev"
              />
              <QuotaCard
                title={`Level ${stats.currentLevel || 1}`}
                icon={<Trophy className="w-5 h-5" />}
                used={0}
                limit={0}
                remaining={0}
                isPremium={true}
                premiumText={stats.levelTitle || 'Novis'}
                href="/dashboard/rewards"
              />
              <QuotaCard
                title="Premium"
                icon={<Star className="w-5 h-5" />}
                used={0}
                limit={0}
                remaining={0}
                isPremium={true}
                premiumText={(() => {
                  const isTrialUser = stats.premiumSource === 'signup_trial' || stats.premiumSource === 'oauth_signup_trial';
                  const isOnboardingReward = stats.premiumSource === 'onboarding_completion';
                  const isGuestInvitation = stats.premiumSource === 'guest_invitation';
                  if (isTrialUser && stats.premiumUntil) {
                    return 'Provperiod';
                  }
                  if (isOnboardingReward && stats.premiumUntil) {
                    return 'Belöning aktiv';
                  }
                  if (isGuestInvitation && stats.premiumUntil) {
                    return 'Gästinbjudan aktiv';
                  }
                  return 'Aktiv';
                })()}
                premiumStatus={(() => {
                  const isTrialUser = stats.premiumSource === 'signup_trial' || stats.premiumSource === 'oauth_signup_trial';
                  const isOnboardingReward = stats.premiumSource === 'onboarding_completion';
                  const isGuestInvitation = stats.premiumSource === 'guest_invitation';
                  return ((isTrialUser || isOnboardingReward || isGuestInvitation) && stats.premiumUntil) ? 'trial' : 'active';
                })()}
                resetDate={(() => {
                  const isTrialUser = stats.premiumSource === 'signup_trial' || stats.premiumSource === 'oauth_signup_trial';
                  const isOnboardingReward = stats.premiumSource === 'onboarding_completion';
                  const isGuestInvitation = stats.premiumSource === 'guest_invitation';
                  return ((isTrialUser || isOnboardingReward || isGuestInvitation) && stats.premiumUntil) ? new Date(stats.premiumUntil) : undefined;
                })()}
                premiumSource={stats.premiumSource || undefined}
                resetType="weekly"
                href="/dashboard/profil/prenumeration"
              />
            </>
          ) : (
            // Free User Quota Cards
            <>
              <QuotaCard
                title="Skapade personliga brev"
                icon={<PenTool className="w-5 h-5" />}
                used={stats.weeklyLetterCount || 0}
                limit={7}
                remaining={Math.max(0, 7 - (stats.weeklyLetterCount || 0))}
                resetDate={stats.letterResetDate}
                resetType="weekly"
                href="/dashboard/skapa-brev"
              />
              <QuotaCard
                title="CV-analys"
                icon={<Search className="w-5 h-5" />}
                used={stats.weeklyAnalysisCount || 0}
                limit={1}
                remaining={Math.max(0, 1 - (stats.weeklyAnalysisCount || 0))}
                resetDate={stats.analysisResetDate}
                resetType="weekly"
                href="/dashboard/cv-analys"
              />
              <QuotaCard
                title="Uppladdade CV"
                icon={<FileText className="w-5 h-5" />}
                used={stats.cvCount || 0}
                limit={2}
                remaining={Math.max(0, 2 - (stats.cvCount || 0))}
                resetType="permanent"
                href="/dashboard/profil/cv"
              />
              <QuotaCard
                title="LinkedIn-optimering"
                icon={<Users className="w-5 h-5" />}
                used={stats.weeklyLinkedInCount || 0}
                limit={1}
                remaining={Math.max(0, 1 - (stats.weeklyLinkedInCount || 0))}
                resetDate={stats.linkedInResetDate}
                resetType="weekly"
                href="/dashboard/linkedin-optimizer"
              />
            </>
          )}
        </motion.div>

        {/* Onboarding Banner - Välkomstbanner för nya användare */}
        {!stats.onboardingCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link href="/dashboard/kom-igang">
              <motion.div
                whileHover={{ scale: 1.01, y: -2 }}
                className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                        👋 Välkommen till Jobbcoach.ai!
                      </h3>
                      <p className="text-slate-600">
                        Börja din resa mot drömjobbet. Följ vår guide för att upptäcka alla funktioner.
                      </p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex-shrink-0"
                  >
                    <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg group-hover:shadow-xl transition-shadow">
                      <span>Kom igång</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* Senaste Aktivitet & AI Insights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6"
        >
          <ActivityFeed
            recentLetters={stats.recentLetters}
            currentLevel={stats.currentLevel}
            availableRewards={stats.availableRewards}
          />

          <AIInsights
            totalLetters={stats.totalLetters}
            subscriptionTier={stats.subscriptionTier}
            currentLevel={stats.currentLevel}
            isPremium={stats.isPremium}
          />
        </motion.div>

        {/* Bottom Section: Premium CTA (endast gratis-användare) */}
        {!stats.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl sm:rounded-2xl border border-pink-200/40 p-4 sm:p-6 md:p-8 text-center"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">
              Uppgradera till Premium
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 max-w-lg mx-auto">
              Få tillgång till obegränsade CV-analyser, avancerade AI-funktioner och mycket mer för endast 149 SEK/månad.
            </p>
            <Link href="/priser">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-pink-500/25 transition-all duration-300 text-sm sm:text-base touch-manipulation"
              >
                Uppgradera för 149 SEK/månad
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>

      {/* First Time User Modal */}
      {showFirstTimeModal && (
        <FirstTimeUserModal
          onClose={() => setShowFirstTimeModal(false)}
          onSkip={() => setShowFirstTimeModal(false)}
        />
      )}

      {/* CSS Styles for pattern overlay and animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .pattern-overlay {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}} />
    </div>
  );
}