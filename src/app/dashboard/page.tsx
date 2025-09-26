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
  Target
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { motion } from 'framer-motion';

// Import premium components
import WelcomeHero from '@/components/dashboard/WelcomeHero';
import StatsWidget from '@/components/dashboard/StatsWidget';
import QuickActionCard from '@/components/dashboard/QuickActionCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import AIInsights from '@/components/dashboard/AIInsights';
import LoadingSkeleton from '@/components/dashboard/LoadingSkeleton';
import LiveActivityIndicator from '@/components/dashboard/LiveActivityIndicator';
import FloatingParticles from '@/components/dashboard/FloatingParticles';

interface DashboardStats {
  totalLetters: number;
  totalAnalyses: number;
  subscriptionTier: string;
  recentLetters: any[];
  currentLevel?: number;
  levelTitle?: string;
  availableRewards?: number;
  isPremium?: boolean;
  monthlyLetterCount?: number;
  weeklyAnalysisCount?: number;
  remainingLetters?: number;
  remainingAnalyses?: number;
  nextMonthlyReset?: Date;
  nextWeeklyReset?: Date;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLetters: 0,
    totalAnalyses: 0,
    subscriptionTier: 'free',
    recentLetters: []
  });
  const [loading, setLoading] = useState(true);

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

        // Räkna brev skapade denna månad (för gratis-användare)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyLetters = letters?.filter(letter =>
          new Date(letter.created_at) >= startOfMonth
        ) || [];

        // Räkna CV-analyser denna vecka (för gratis-användare)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Söndag som första dag
        startOfWeek.setHours(0, 0, 0, 0);

        const { data: analyses } = await supabase
          .from('competence_analysis_jobs')
          .select('id, created_at')
          .eq('user_id', user.id)
          .gte('created_at', startOfWeek.toISOString());

        // Hämta användarens profil med prenumerationsinfo
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, weekly_analysis_count, weekly_letter_count, premium_until, premium_source')
          .eq('id', user.id)
          .single();

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
          // Stripe prenumeration
          profile?.subscription_tier === 'premium' ||
          // Admin-tilldelad premium med datum
          (profile?.premium_until && new Date(profile.premium_until) > new Date()) ||
          // Admin-tilldelad premium via source
          profile?.premium_source
        );

        // Kvot-gränser
        const monthlyLetterLimit = 5;
        const weeklyAnalysisLimit = 3;

        // Beräkna återstående kvoter för gratis-användare
        const monthlyLetterCount = monthlyLetters.length;
        const weeklyAnalysisCount = analyses?.length || 0;
        const remainingLetters = isPremium ? -1 : Math.max(0, monthlyLetterLimit - monthlyLetterCount);
        const remainingAnalyses = isPremium ? -1 : Math.max(0, weeklyAnalysisLimit - weeklyAnalysisCount);

        // Beräkna nästa återställningsdatum
        const getNextMonthlyReset = () => {
          const now = new Date();
          return new Date(now.getFullYear(), now.getMonth() + 1, 1);
        };

        const getNextWeeklyReset = () => {
          const now = new Date();
          const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
          const nextSunday = new Date(now);
          nextSunday.setDate(now.getDate() + daysUntilSunday);
          nextSunday.setHours(0, 0, 0, 0);
          return nextSunday;
        };

        const nextMonthlyReset = getNextMonthlyReset();
        const nextWeeklyReset = getNextWeeklyReset();

        setStats({
          totalLetters: letters?.length || 0,
          totalAnalyses: profile?.weekly_analysis_count || 0,
          subscriptionTier: profile?.subscription_tier || 'free',
          recentLetters: letters?.slice(0, 3).map(letter => ({
            ...letter,
            company_name: letter.company,
            position: letter.job_title
          })) || [],
          currentLevel: rewardsData.currentLevel,
          levelTitle: rewardsData.levelTitle,
          availableRewards: rewardsData.availableRewards,
          isPremium,
          monthlyLetterCount,
          weeklyAnalysisCount,
          remainingLetters,
          remainingAnalyses,
          nextMonthlyReset,
          nextWeeklyReset
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
      <div className="space-y-8">
        <LoadingSkeleton variant="hero" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingSkeleton variant="stats" count={4} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LoadingSkeleton variant="card" count={4} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton variant="list" />
          <LoadingSkeleton variant="card" />
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
          className="absolute inset-0 opacity-[0.015]"
          style={{
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
      <LiveActivityIndicator className="fixed bottom-6 right-6 z-40" showBadge={false} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
        className="space-y-8 relative z-10"
      >
      <div className="space-y-8">
        {/* Welcome Hero Section - Redesigned */}
        <WelcomeHero
          currentLevel={stats.currentLevel}
          levelTitle={stats.levelTitle}
          totalLetters={stats.totalLetters}
        />

        {/* Stats Kort Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsWidget
            title={stats.isPremium ? "Skapade Brev" : "Brev denna månad"}
            value={stats.isPremium ? stats.totalLetters : `${stats.monthlyLetterCount}/5`}
            subtitle={stats.isPremium ? "Obegränsade brev" : `${stats.remainingLetters} kvar denna månad`}
            icon={PenTool}
            color="pink"
            trend={stats.isPremium ? { value: 15, isPositive: true } : undefined}
            onClick={() => window.location.href = '/dashboard/my-letters'}
            isPremium={stats.isPremium}
            liveUpdate={true}
            pulseOnUpdate={true}
            quotaInfo={!stats.isPremium ? {
              used: stats.monthlyLetterCount || 0,
              limit: 5,
              resetDate: stats.nextMonthlyReset,
              resetType: 'monthly',
              showProgress: true,
              showCountdown: true
            } : undefined}
          />

          <StatsWidget
            title={stats.isPremium ? "CV-Analyser" : "Analyser denna vecka"}
            value={stats.isPremium ? "Obegränsade" : `${stats.weeklyAnalysisCount}/3`}
            subtitle={stats.isPremium ? "Alla funktioner tillgängliga" : `${stats.remainingAnalyses} kvar denna vecka`}
            icon={Brain}
            color="blue"
            onClick={() => window.location.href = '/dashboard/cv-analys'}
            isPremium={stats.isPremium}
            liveUpdate={stats.isPremium}
            quotaInfo={!stats.isPremium ? {
              used: stats.weeklyAnalysisCount || 0,
              limit: 3,
              resetDate: stats.nextWeeklyReset,
              resetType: 'weekly',
              showProgress: true,
              showCountdown: true
            } : undefined}
          />

          <StatsWidget
            title="Prenumeration"
            value={stats.isPremium ? "Premium ✨" : "Gratis"}
            subtitle={stats.isPremium ? "Obegränsad tillgång" : "Uppgradera för full åtkomst"}
            icon={Star}
            color={stats.isPremium ? "green" : "orange"}
            onClick={() => !stats.isPremium && (window.location.href = '/priser')}
            isPremium={stats.isPremium}
          />

          <Link href="/dashboard/rewards" className="block">
            <StatsWidget
              title={`Level ${stats.currentLevel || 1}`}
              value={stats.levelTitle || 'Novis'}
              subtitle={stats.availableRewards ? `${stats.availableRewards} belöningar väntar` : "Fortsätt samla XP"}
              icon={Trophy}
              color="purple"
              isPremium={true}
              liveUpdate={true}
            />
          </Link>
        </motion.div>

        {/* Smarta Åtgärder Sektion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Smarta Åtgärder</h2>
              <p className="text-sm text-slate-600 mt-1">De viktigaste verktygen för din karriärutveckling just nu</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Skapa Personligt Brev */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <QuickActionCard
                title="Skapa Personligt Brev"
                description="100% progress"
                icon={PenTool}
                href="/dashboard/skapa-brev"
                color="pink"
                progress={100}
              />
            </motion.div>

            {/* Mina Brev */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <QuickActionCard
                title="Mina Brev"
                description={`${stats.totalLetters} sparade, 50% progress`}
                icon={FileText}
                href="/dashboard/my-letters"
                color="green"
                progress={50}
              />
            </motion.div>

            {/* CV-Mallar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <QuickActionCard
                title="CV-Mallar"
                description="Utforska professionella mallar"
                icon={Palette}
                href="/dashboard/cv-mallar"
                color="purple"
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Senaste Aktivitet & AI Insights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
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

        {/* Level Progress Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/40 shadow-lg p-6"
        >
          <div className="text-center">
            <p className="text-slate-700 font-medium">
              Du är på Level {stats.currentLevel || 1}. Skapa 0 fler brev för att låsa upp nya funktioner
            </p>
          </div>
        </motion.div>

        {/* Premium CTA Section */}
        {!stats.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200/40 p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Uppgradera till Premium
            </h3>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto">
              Få tillgång till obegränsade CV-analyser, avancerade AI-funktioner och mycket mer för endast 149 SEK/månad.
            </p>
            <Link href="/priser">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
              >
                Uppgradera för 149 SEK/månad
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>

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