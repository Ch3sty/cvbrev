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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
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
          />

          <StatsWidget
            title="CV-Analyser"
            value={stats.isPremium ? "Obegränsat" : stats.totalAnalyses}
            subtitle={stats.isPremium ? "Premium användare" : "Återstående denna vecka"}
            icon={Brain}
            color="blue"
            onClick={() => window.location.href = '/dashboard/cv-analys'}
          />

          <StatsWidget
            title="Prenumeration"
            value={stats.isPremium ? "Premium" : "Gratis"}
            subtitle={stats.isPremium ? "Alla funktioner" : "Begränsade funktioner"}
            icon={Star}
            color={stats.isPremium ? "green" : "orange"}
            onClick={() => !stats.isPremium && (window.location.href = '/priser')}
          />

          <Link href="/dashboard/rewards" className="block">
            <StatsWidget
              title={`Level ${stats.currentLevel || 1}`}
              value={stats.levelTitle || 'Novis'}
              subtitle={stats.availableRewards ? `${stats.availableRewards} belöningar väntar` : "Fortsätt samla XP"}
              icon={Trophy}
              color="purple"
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
            <h2 className="text-2xl font-bold text-slate-900">Smarta Åtgärder</h2>
            <div className="text-sm font-medium text-slate-600 bg-slate-100/80 px-3 py-1 rounded-full">
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
  );
}