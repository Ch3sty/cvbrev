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

        // Hämta användarens profil med prenumerationsinfo
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, weekly_analysis_count, premium_until')
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

        const isPremium = profile?.premium_until && new Date(profile.premium_until) > new Date();

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
          isPremium
        });
      } catch (error) {
        console.error('Fel vid hämtning av dashboard-data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Smart Quick Actions based on user data
  const getSmartQuickActions = () => {
    const actions = [];

    // Always show create letter as primary action
    actions.push({
      title: 'Skapa Personligt Brev',
      description: stats.totalLetters === 0
        ? 'Skapa ditt första AI-optimerade brev'
        : 'Skapa ett nytt skräddarsytt brev med AI',
      icon: PenTool,
      href: '/dashboard/skapa-brev',
      color: 'pink' as const,
      badge: stats.totalLetters === 0 ? 'Kom igång' : undefined,
      progress: stats.totalLetters > 0 ? Math.min(100, (stats.totalLetters / 5) * 100) : undefined
    });

    // CV Analysis - priority if no letters yet or premium user
    if (stats.totalLetters === 0 || stats.isPremium) {
      actions.push({
        title: 'Analysera CV',
        description: stats.isPremium
          ? 'Obegränsade AI-analyser av ditt CV'
          : 'Få AI-feedback på ditt CV (begränsad)',
        icon: Brain,
        href: '/dashboard/cv-analys',
        color: 'blue' as const,
        premium: !stats.isPremium,
        isPremiumUser: stats.isPremium
      });
    }

    // My Letters - show if user has letters
    if (stats.totalLetters > 0) {
      actions.push({
        title: 'Mina Brev',
        description: `${stats.totalLetters} sparade brev`,
        icon: FileText,
        href: '/dashboard/my-letters',
        color: 'green' as const,
        progress: Math.min(100, (stats.totalLetters / 10) * 100)
      });
    }

    // CV Templates - always available
    actions.push({
      title: 'CV-Mallar',
      description: 'Utforska professionella mallar',
      icon: Palette,
      href: '/dashboard/cv-mallar',
      color: 'purple' as const
    });

    return actions.slice(0, 4); // Max 4 actions
  };

  const quickActions = getSmartQuickActions();

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
      {/* Premium Background with Morphing Gradients - same as landing page */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30" />

        {/* Mouse-following gradient */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          animate={{
            x: [100, 300, 100],
            y: [100, 200, 100],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-30 pattern-overlay"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px',
          }}
        />
      </motion.div>

      {/* Background floating particles */}
      <FloatingParticles
        count={12}
        colors={['bg-pink-400/10', 'bg-purple-400/10', 'bg-blue-400/10', 'bg-indigo-400/10']}
        size="lg"
        speed="slow"
        className="fixed inset-0 pointer-events-none z-5"
      />

      {/* Live Activity Indicator */}
      <LiveActivityIndicator className="fixed top-20 right-6 z-50" />

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
        {/* Welcome Hero Section */}
        <WelcomeHero
          currentLevel={stats.currentLevel}
          levelTitle={stats.levelTitle}
          totalLetters={stats.totalLetters}
        />

        {/* Premium Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsWidget
            title="Skapade Brev"
            value={stats.totalLetters}
            subtitle={stats.totalLetters === 0 ? "Skapa ditt första brev" : "Brev i biblioteket"}
            icon={PenTool}
            color="pink"
            trend={stats.totalLetters > 0 ? { value: 15, isPositive: true } : undefined}
            onClick={() => window.location.href = '/dashboard/my-letters'}
            isPremium={stats.isPremium}
            liveUpdate={true}
            pulseOnUpdate={true}
          />

          <StatsWidget
            title="CV-Analyser"
            value={stats.isPremium ? "Obegränsat" : stats.totalAnalyses}
            subtitle={stats.isPremium ? "Premium användare" : "Återstående denna vecka"}
            icon={Brain}
            color="blue"
            onClick={() => window.location.href = '/dashboard/cv-analys'}
            isPremium={stats.isPremium}
            liveUpdate={stats.isPremium}
          />

          <StatsWidget
            title="Prenumeration"
            value={stats.isPremium ? "Premium" : "Gratis"}
            subtitle={stats.isPremium ? "Alla funktioner" : "Begränsade funktioner"}
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

        {/* Smart Quick Actions */}
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
            <div className="text-sm font-medium text-pink-600 bg-pink-50/80 px-3 py-1 rounded-full border border-pink-200/60">
              Anpassade för din progress
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              >
                <QuickActionCard
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  href={action.href}
                  color={action.color}
                  premium={action.premium}
                  isPremiumUser={action.isPremiumUser}
                  progress={action.progress}
                  badge={action.badge}
                  onClick={action.premium && !action.isPremiumUser
                    ? () => window.location.href = '/priser'
                    : undefined
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Activity Feed & AI Insights */}
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