'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  RefreshCw,
  Brain,
  Zap,
  Euro,
  TrendingDown,
  UserCheck,
  FileCheck,
  Globe,
  ChartBar,
  ChartLine,
  ChartPie,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { format, subDays, subMonths, startOfDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import FeatureUsageChart from '@/components/admin/FeatureUsageChart';
import FeatureCostBreakdown from '@/components/admin/FeatureCostBreakdown';
import TopUsersTable from '@/components/admin/TopUsersTable';
import CostTimeSeriesChart from '@/components/admin/CostTimeSeriesChart';
import UsageStatisticsChart from '@/components/admin/UsageStatisticsChart';
import FeaturePopularityChart from '@/components/admin/FeaturePopularityChart';
import UserEngagementTable from '@/components/admin/UserEngagementTable';
import FloatingParticles from '@/components/dashboard/FloatingParticles';

interface DashboardStats {
  users: {
    total: number;
    premium: number;
    free: number;
    active_today: number;
    active_week: number;
    active_month: number;
    new_today: number;
    new_week: number;
    new_month: number;
    conversion_rate: number;
    retention_rate: number;
    verified: number;
    unverified: number;
    verification_rate: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    total_revenue: number;
    revenue_today: number;
    revenue_week: number;
    revenue_month: number;
    average_revenue_per_user: number;
    average_revenue_per_premium_user: number;
    lifetime_value: number;
    churn_rate: number;
  };
  costs: {
    total_ai_cost: number;
    ai_cost_today: number;
    ai_cost_week: number;
    ai_cost_month: number;
    cost_per_user: number;
    cost_per_generation: number;
    infrastructure_cost: number;
  };
  profit: {
    gross_profit: number;
    gross_margin: number;
    net_profit: number;
    net_margin: number;
    profit_per_user: number;
    profit_per_premium_user: number;
  };
  usage: {
    total_cvs: number;
    cvs_uploaded_today: number;
    cvs_uploaded_week: number;
    cvs_uploaded_month: number;
    total_letters: number;
    letters_generated_today: number;
    letters_generated_week: number;
    letters_generated_month: number;
    letters_saved: number;
    save_rate: number;
    cv_analyses: number;
    analyses_today: number;
  };
  engagement: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    feature_adoption: { [key: string]: number };
  };
}

// Custom tooltip för grafer
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-lg">
        <p className="text-gray-700 text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ?
              entry.value.toLocaleString('sv-SE') : entry.value}
            {entry.dataKey.includes('revenue') || entry.dataKey.includes('cost') || entry.dataKey.includes('profit') ? ' kr' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Formatera feature-namn till läsbar text
const formatFeatureName = (key: string): string => {
  const featureNames: Record<string, string> = {
    'cv_analysis_started': 'CV-analys',
    'cv_uploaded': 'CV-uppladdning',
    'letter_generated': 'Brevgenerering',
    'letter_saved': 'Brev sparade',
    'registered': 'Registreringar',
    'competence_analysis_started': 'Kompetensanalys',
    'learning_plan_created': 'Utbildningsplan skapad',
    'learning_plan_deleted': 'Utbildningsplan borttagen',
    'profile_updated': 'Profil uppdaterad',
    'linkedin_optimized': 'LinkedIn-optimering',
    'job_match_searched': 'Jobbmatchning',
    'test_started': 'Test påbörjat',
    'test_completed': 'Test avslutat'
  };

  return featureNames[key] || key.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default function StatisticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('week');
  const [selectedTab, setSelectedTab] = useState('overview');
  const [openaiUsage, setOpenaiUsage] = useState<any>(null);
  const [stripeRevenue, setStripeRevenue] = useState<any>(null);
  const [chartData, setChartData] = useState<any>({
    activity: [],
    revenue: [],
    costs: [],
    profit: [],
    users: []
  });

  // NEW: AI Cost Analytics state
  const [aiFeatureData, setAiFeatureData] = useState<any>(null);
  const [aiUserCosts, setAiUserCosts] = useState<any>(null);
  const [aiTimeSeries, setAiTimeSeries] = useState<any>(null);
  const [aiTimeGrouping, setAiTimeGrouping] = useState<'day' | 'week' | 'month'>('day');
  const [aiMetric, setAiMetric] = useState<'calls' | 'cost' | 'tokens'>('cost');

  // NEW: Usage Analytics state
  const [usageStats, setUsageStats] = useState<any>(null);
  const [userEngagement, setUserEngagement] = useState<any>(null);
  const [usageMetric, setUsageMetric] = useState<'calls' | 'users' | 'avgCalls' | 'successRate'>('calls');
  const [selectedFeaturesForPopularity, setSelectedFeaturesForPopularity] = useState<string[]>([]);

  const supabase = getSupabaseClient();

  // Hämta all statistik
  const fetchStatistics = async () => {
    try {
      setError(null);

      const now = new Date();
      const today = startOfDay(now);
      const weekAgo = subDays(now, 7);
      const monthAgo = subMonths(now, 1);

      // Hämta data parallellt
      const [
        { data: profiles },
        { data: cvs },
        { data: letters },
        { data: activities },
        { data: usageLogs },
        { data: revenues },
        { data: aiCosts }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('cv_texts').select('*'),
        supabase.from('letters').select('*'),
        supabase.from('user_activities').select('*').order('created_at', { ascending: false }),
        supabase.from('usage_log').select('*'),
        supabase.from('revenue_tracking').select('*').eq('status', 'completed'),
        supabase.from('ai_usage_costs').select('*')
      ]);

      // Beräkna användarstatistik
      const premiumUsers = profiles?.filter(p => p.subscription_tier === 'premium') || [];
      const freeUsers = profiles?.filter(p => p.subscription_tier === 'free' || !p.subscription_tier) || [];

      // Räkna aktiva användare baserat på faktiska aktiviteter istället för last_active
      const uniqueUsersToday = new Set(activities?.filter(a => new Date(a.created_at) >= today).map(a => a.user_id));
      const uniqueUsersWeek = new Set(activities?.filter(a => new Date(a.created_at) >= weekAgo).map(a => a.user_id));
      const uniqueUsersMonth = new Set(activities?.filter(a => new Date(a.created_at) >= monthAgo).map(a => a.user_id));

      const activeToday = Array.from(uniqueUsersToday);
      const activeWeek = Array.from(uniqueUsersWeek);
      const activeMonth = Array.from(uniqueUsersMonth);

      const newToday = profiles?.filter(p => new Date(p.created_at) >= today) || [];
      const newWeek = profiles?.filter(p => new Date(p.created_at) >= weekAgo) || [];
      const newMonth = profiles?.filter(p => new Date(p.created_at) >= monthAgo) || [];

      const conversionRate = profiles?.length ? (premiumUsers.length / profiles.length) * 100 : 0;
      const retentionRate = activeMonth.length > 0 && profiles?.length ?
        (activeMonth.length / profiles.length) * 100 : 0;

      // Beräkna verifieringsstatistik
      const verifiedUsers = profiles?.filter(p => p.email_verified_at !== null) || [];
      const unverifiedUsers = profiles?.filter(p => p.email_verified_at === null) || [];
      const verificationRate = profiles?.length ? (verifiedUsers.length / profiles.length) * 100 : 0;

      // Beräkna intäkter (använd Stripe-data om tillgänglig)
      const actualRevenue = stripeRevenue ? stripeRevenue.revenue.total :
        revenues?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      const revenueToday = revenues?.filter(r => new Date(r.created_at) >= today)
        .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const revenueWeek = revenues?.filter(r => new Date(r.created_at) >= weekAgo)
        .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const revenueMonth = revenues?.filter(r => new Date(r.created_at) >= monthAgo)
        .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      const monthlyPrice = 149;
      const mrr = stripeRevenue ? stripeRevenue.subscriptions.mrr : premiumUsers.length * monthlyPrice;
      const arr = stripeRevenue ? stripeRevenue.subscriptions.arr : mrr * 12;

      // Beräkna AI-kostnader från ai_usage_costs (primär källa)
      const aiUsageCost = aiCosts?.reduce((sum, cost) =>
        sum + (parseFloat(cost.cost_sek) || 0), 0) || 0;

      // Fallback: Beräkna från letters om ai_usage_costs är tom
      const lettersCost = letters?.reduce((sum, letter) =>
        sum + (parseFloat(letter.ai_cost?.toString() || '0') * 10.5 || 0), 0) || 0;

      // Använd ai_usage_costs om det finns data, annars fallback till letters
      const totalAICost = aiUsageCost > 0 ? aiUsageCost : lettersCost;

      const aiCostToday = aiCosts?.filter(c => new Date(c.created_at) >= today)
        .reduce((sum, c) => sum + (parseFloat(c.cost_sek) || 0), 0) || 0;
      const aiCostWeek = aiCosts?.filter(c => new Date(c.created_at) >= weekAgo)
        .reduce((sum, c) => sum + (parseFloat(c.cost_sek) || 0), 0) || 0;
      const aiCostMonth = aiCosts?.filter(c => new Date(c.created_at) >= monthAgo)
        .reduce((sum, c) => sum + (parseFloat(c.cost_sek) || 0), 0) || 0;

      const infrastructureCost = 100; // Estimerad infrastrukturkostnad

      // Beräkna vinst
      const grossProfit = actualRevenue - (totalAICost * 10.5);
      const grossMargin = actualRevenue > 0 ? (grossProfit / actualRevenue) * 100 : 0;
      const netProfit = grossProfit - infrastructureCost;
      const netMargin = actualRevenue > 0 ? (netProfit / actualRevenue) * 100 : 0;

      // Beräkna användningsstatistik
      const cvsToday = cvs?.filter(c => new Date(c.created_at) >= today) || [];
      const cvsWeek = cvs?.filter(c => new Date(c.created_at) >= weekAgo) || [];
      const cvsMonth = cvs?.filter(c => new Date(c.created_at) >= monthAgo) || [];

      const lettersToday = letters?.filter(l => new Date(l.created_at) >= today) || [];
      const lettersWeek = letters?.filter(l => new Date(l.created_at) >= weekAgo) || [];
      const lettersMonth = letters?.filter(l => new Date(l.created_at) >= monthAgo) || [];
      const savedLetters = letters?.filter(l => l.is_saved) || [];

      const saveRate = letters && letters.length > 0
        ? (savedLetters.length / letters.length) * 100 : 0;

      const cvAnalyses = activities?.filter(a =>
        a.activity_type === 'cv_analysis_completed'
      ) || [];
      const analysesToday = cvAnalyses.filter(a => new Date(a.created_at) >= today);

      // Feature adoption
      const featureAdoption: { [key: string]: number } = {};
      activities?.forEach(activity => {
        const type = activity.activity_type;
        if (type) {
          featureAdoption[type] = (featureAdoption[type] || 0) + 1;
        }
      });

      // Beräkna churn rate
      const churnedUsers = profiles?.filter(p => {
        const lastActive = p.last_active ? new Date(p.last_active) : null;
        return lastActive && lastActive < monthAgo;
      }) || [];
      const churnRate = profiles && profiles.length > 0
        ? (churnedUsers.length / profiles.length) * 100 : 0;

      // Lifetime value
      const avgCustomerLifespan = churnRate > 0 ? 100 / churnRate : 12;
      const lifetimeValue = monthlyPrice * avgCustomerLifespan;

      // Förbered grafdata baserat på vald period
      let daysToShow = 7;
      switch (dateRange) {
        case 'day': daysToShow = 1; break;
        case 'week': daysToShow = 7; break;
        case 'month': daysToShow = 30; break;
        case 'year': daysToShow = 365; break;
      }

      // Begränsa till max 365 dagar för prestanda
      daysToShow = Math.min(daysToShow, 365);

      const chartDays = Array.from({ length: daysToShow }, (_, i) => {
        const date = subDays(now, daysToShow - 1 - i);
        const dateStr = daysToShow <= 30 ?
          format(date, 'MMM dd', { locale: sv }) :
          format(date, 'MMM', { locale: sv }); // Visa bara månad för längre perioder

        const dayActivities = activities?.filter(a => {
          const actDate = new Date(a.created_at);
          return format(actDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        }) || [];

        // Beräkna intäkter - använd Stripe-data om tillgänglig
        const dbRevenue = revenues?.filter(r => {
          const revDate = new Date(r.created_at);
          return format(revDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        }).reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

        // Om vi har Stripe-data, använd den för dagens intäkter
        let dayRevenue = dbRevenue;
        if (stripeRevenue && stripeRevenue.revenue && stripeRevenue.revenue.byDate) {
          const dateFormatted = format(date, 'yyyy-MM-dd');
          const stripeDay = stripeRevenue.revenue.byDate.find((d: any) =>
            d.date === dateFormatted
          );
          if (stripeDay) {
            dayRevenue = stripeDay.amount || dbRevenue;
          }
        }

        // Beräkna dagskostnader från ai_usage_costs (primär källa)
        const aiCostDayCost = aiCosts?.filter(cost => {
          const costDate = new Date(cost.created_at);
          return format(costDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        }).reduce((sum, cost) => sum + (parseFloat(cost.cost_sek) || 0), 0) || 0;

        // Fallback: Beräkna från letters om ai_usage_costs är tom
        const lettersDayCost = letters?.filter(letter => {
          const letterDate = new Date(letter.created_at);
          return format(letterDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        }).reduce((sum, letter) => {
          const cost = letter.ai_cost || 0;
          return sum + (typeof cost === 'number' ? cost * 10.5 : 0);
        }, 0) || 0;

        // Använd ai_usage_costs om det finns, annars letters
        const totalDayCost = aiCostDayCost > 0 ? aiCostDayCost : lettersDayCost;

        return {
          date: dateStr,
          activities: dayActivities.length,
          revenue: dayRevenue,
          cost: totalDayCost,
          profit: dayRevenue - totalDayCost,
          users: profiles?.filter(p => {
            const createdDate = new Date(p.created_at);
            return format(createdDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
          }).length || 0
        };
      });

      setChartData({
        activity: chartDays.map(d => ({ date: d.date, value: d.activities })),
        revenue: chartDays.map(d => ({ date: d.date, value: d.revenue })),
        costs: chartDays.map(d => ({ date: d.date, value: d.cost })),
        profit: chartDays.map(d => ({ date: d.date, value: d.profit })),
        users: chartDays.map(d => ({ date: d.date, value: d.users })),
        combined: chartDays
      });

      // Sätt statistik
      setStats({
        users: {
          total: profiles?.length || 0,
          premium: premiumUsers.length,
          free: freeUsers.length,
          active_today: activeToday.length,
          active_week: activeWeek.length,
          active_month: activeMonth.length,
          new_today: newToday.length,
          new_week: newWeek.length,
          new_month: newMonth.length,
          conversion_rate: Math.round(conversionRate * 10) / 10,
          retention_rate: Math.round(retentionRate * 10) / 10,
          verified: verifiedUsers.length,
          unverified: unverifiedUsers.length,
          verification_rate: Math.round(verificationRate * 10) / 10
        },
        revenue: {
          mrr,
          arr,
          total_revenue: actualRevenue,
          revenue_today: revenueToday,
          revenue_week: revenueWeek,
          revenue_month: revenueMonth,
          average_revenue_per_user: profiles?.length ? actualRevenue / profiles.length : 0,
          average_revenue_per_premium_user: premiumUsers.length ? actualRevenue / premiumUsers.length : 0,
          lifetime_value: Math.round(lifetimeValue),
          churn_rate: Math.round(churnRate * 10) / 10
        },
        costs: {
          total_ai_cost: totalAICost,
          ai_cost_today: aiCostToday,
          ai_cost_week: aiCostWeek,
          ai_cost_month: aiCostMonth,
          cost_per_user: profiles?.length ? totalAICost / profiles.length : 0,
          cost_per_generation: letters?.length ? totalAICost / letters.length : 0,
          infrastructure_cost: infrastructureCost
        },
        profit: {
          gross_profit: grossProfit,
          gross_margin: Math.round(grossMargin * 10) / 10,
          net_profit: netProfit,
          net_margin: Math.round(netMargin * 10) / 10,
          profit_per_user: profiles?.length ? netProfit / profiles.length : 0,
          profit_per_premium_user: premiumUsers.length ? netProfit / premiumUsers.length : 0
        },
        usage: {
          total_cvs: cvs?.length || 0,
          cvs_uploaded_today: cvsToday.length,
          cvs_uploaded_week: cvsWeek.length,
          cvs_uploaded_month: cvsMonth.length,
          total_letters: letters?.length || 0,
          letters_generated_today: lettersToday.length,
          letters_generated_week: lettersWeek.length,
          letters_generated_month: lettersMonth.length,
          letters_saved: savedLetters.length,
          save_rate: Math.round(saveRate * 10) / 10,
          cv_analyses: cvAnalyses.length,
          analyses_today: analysesToday.length
        },
        engagement: {
          daily_active_users: activeToday.length,
          weekly_active_users: activeWeek.length,
          monthly_active_users: activeMonth.length,
          feature_adoption: featureAdoption
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Fel vid hämtning av statistik:', error);
      setError('Ett fel uppstod vid hämtning av data');
      setIsLoading(false);
    }
  };

  // Hämta OpenAI-användning
  const fetchOpenAIUsage = async () => {
    try {
      // Alltid försök hämta för 30 dagar först (där vi troligen har data)
      // OpenAI Admin API kanske inte har historisk data för hela året
      const response = await fetch(`/api/admin/openai-usage?days=30`);
      const result = await response.json();

      if (result.success && result.data) {
        setOpenaiUsage(result);
      } else if (result.estimatedOnly) {
        // Om vi bara får estimat, använd det
        setOpenaiUsage(result);
      }
    } catch (error) {
      console.error('Fel vid hämtning av OpenAI-användning:', error);
    }
  };

  // Hämta Stripe-intäkter
  const fetchStripeRevenue = async () => {
    try {
      let days = 30;
      switch (dateRange) {
        case 'day': days = 1; break;
        case 'week': days = 7; break;
        case 'month': days = 30; break;
        case 'year': days = 365; break;
      }

      const response = await fetch(`/api/admin/stripe-revenue?days=${days}`);
      const result = await response.json();

      if (result.success) {
        setStripeRevenue(result);
        // fetchStatistics kommer att köras automatiskt via useEffect när stripeRevenue uppdateras
      }
    } catch (error) {
      console.error('Fel vid hämtning av Stripe-intäkter:', error);
    }
  };

  // NEW: Fetch AI feature usage data
  const fetchAIFeatureData = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange === 'week') {
        params.append('dateFrom', subDays(new Date(), 7).toISOString());
      } else if (dateRange === 'month') {
        params.append('dateFrom', subMonths(new Date(), 1).toISOString());
      }

      const response = await fetch(`/api/admin/statistics/feature-usage?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setAiFeatureData(result.features);
      }
    } catch (error) {
      console.error('Fel vid hämtning av AI-funktionsdata:', error);
    }
  };

  // NEW: Fetch AI user costs
  const fetchAIUserCosts = async () => {
    try {
      const params = new URLSearchParams();
      params.append('limit', '20');
      if (dateRange === 'week') {
        params.append('dateFrom', subDays(new Date(), 7).toISOString());
      } else if (dateRange === 'month') {
        params.append('dateFrom', subMonths(new Date(), 1).toISOString());
      }

      const response = await fetch(`/api/admin/statistics/user-costs?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setAiUserCosts(result.users);
      }
    } catch (error) {
      console.error('Fel vid hämtning av AI-användarkostnader:', error);
    }
  };

  // NEW: Fetch AI time series data
  const fetchAITimeSeries = async () => {
    try {
      const params = new URLSearchParams();
      params.append('groupBy', aiTimeGrouping);
      if (dateRange === 'week') {
        params.append('dateFrom', subDays(new Date(), 7).toISOString());
      } else if (dateRange === 'month') {
        params.append('dateFrom', subMonths(new Date(), 1).toISOString());
      }

      const response = await fetch(`/api/admin/statistics/cost-timeseries?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setAiTimeSeries(result.timeSeries);
      }
    } catch (error) {
      console.error('Fel vid hämtning av AI-tidsseriedata:', error);
    }
  };

  // NEW: Fetch usage statistics
  const fetchUsageStatistics = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange === 'week') {
        params.append('dateFrom', subDays(new Date(), 7).toISOString());
      } else if (dateRange === 'month') {
        params.append('dateFrom', subMonths(new Date(), 1).toISOString());
      }

      const response = await fetch(`/api/admin/statistics/usage-stats?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setUsageStats(result.features);
        // Set top 3 features as selected by default for popularity chart
        if (result.features && result.features.length > 0) {
          const top3 = result.features.slice(0, 3).map((f: any) => f.featureName);
          setSelectedFeaturesForPopularity(top3);
        }
      }
    } catch (error) {
      console.error('Fel vid hämtning av användningsstatistik:', error);
    }
  };

  // NEW: Fetch user engagement data
  const fetchUserEngagement = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange === 'week') {
        params.append('dateFrom', subDays(new Date(), 7).toISOString());
      } else if (dateRange === 'month') {
        params.append('dateFrom', subMonths(new Date(), 1).toISOString());
      }

      const response = await fetch(`/api/admin/statistics/user-engagement?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setUserEngagement(result.users);
      }
    } catch (error) {
      console.error('Fel vid hämtning av användarengagemang:', error);
    }
  };

  // Automatisk synkning vid sidladdning och datumändring
  useEffect(() => {
    // Initial laddning
    fetchStatistics();
    fetchOpenAIUsage();
    fetchStripeRevenue();
    fetchAIFeatureData();
    fetchAIUserCosts();
    fetchAITimeSeries();
    fetchUsageStatistics();
    fetchUserEngagement();

    // Uppdatera var 2:e minut
    const interval = setInterval(() => {
      fetchStatistics();
      fetchOpenAIUsage();
      fetchStripeRevenue();
      fetchAIFeatureData();
      fetchAIUserCosts();
      fetchAITimeSeries();
      fetchUsageStatistics();
      fetchUserEngagement();
    }, 120000);

    return () => clearInterval(interval);
  }, [dateRange, aiTimeGrouping]); // eslint-disable-line react-hooks/exhaustive-deps

  // Uppdatera statistik när Stripe-data ändras
  useEffect(() => {
    if (stripeRevenue) {
      fetchStatistics();
    }
  }, [stripeRevenue]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Laddar statistik...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Färger för grafer
  const COLORS = {
    primary: '#10b981', // green-500
    secondary: '#3b82f6', // blue-500
    tertiary: '#f59e0b', // amber-500
    danger: '#ef4444', // red-500
    purple: '#8b5cf6',
    pink: '#ec4899'
  };

  const tabs = [
    { id: 'overview', label: 'Översikt', icon: ChartBar },
    { id: 'activity', label: 'Aktivitet', icon: Activity },
    { id: 'revenue', label: 'Intäkter', icon: TrendingUp },
    { id: 'costs', label: 'Kostnader', icon: TrendingDown },
    { id: 'profit', label: 'Vinst', icon: Euro },
    { id: 'ai_costs', label: 'AI-kostnader', icon: Brain },
    { id: 'usage', label: 'Användning', icon: Zap }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Premium Dynamic Background */}
      <motion.div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{ opacity: 0.9 }}
      >
        {/* Primary gradient foundation */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50/50" />

        {/* Animated morphing gradient orbs */}
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

      {/* Floating particles */}
      <FloatingParticles
        count={15}
        colors={['bg-pink-400/8', 'bg-purple-400/8', 'bg-blue-400/8', 'bg-indigo-400/8', 'bg-emerald-400/8']}
        size="lg"
        speed="slow"
        className="fixed inset-0 pointer-events-none -z-5"
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-pink-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-500 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 text-lg">Fullständig översikt av Jobbcoach.ai</p>
        </motion.div>

        {/* Date Range Selector - Premium pill-style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex gap-2 mb-8"
        >
          {['day', 'week', 'month', 'year'].map((range, index) => (
            <motion.button
              key={range}
              onClick={() => setDateRange(range)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                dateRange === range
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:shadow-md border border-slate-200'
              }`}
            >
              {range === 'day' && 'Idag'}
              {range === 'week' && 'Vecka'}
              {range === 'month' && 'Månad'}
              {range === 'year' && 'År'}
            </motion.button>
          ))}
        </motion.div>

        {/* KPI Cards - Premium glassmorphism */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10"
        >
          {/* Total Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl group-hover:from-green-500/20 group-hover:to-emerald-500/20 transition-all">
                <Euro className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total intäkt</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {stripeRevenue ? stripeRevenue.revenue.total.toLocaleString('sv-SE') : stats.revenue.total_revenue.toLocaleString('sv-SE')} kr
            </div>
            {stripeRevenue && (
              <div className="text-xs text-green-600 mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Faktisk från Stripe
              </div>
            )}
            <div className="text-sm text-slate-600 font-medium">
              MRR: {stripeRevenue ? stripeRevenue.subscriptions.mrr.toLocaleString('sv-SE') : stats.revenue.mrr.toLocaleString('sv-SE')} kr
            </div>
          </motion.div>

          {/* Net Profit Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nettovinst</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {stats.profit.net_profit.toLocaleString('sv-SE')} kr
            </div>
            <div className="flex items-center gap-1 text-sm font-medium">
              <span className="text-slate-600">Marginal:</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-700">
                {stats.profit.net_margin > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stats.profit.net_margin.toFixed(0)}%
              </span>
            </div>
          </motion.div>

          {/* Active Users Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-all">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Aktiva användare</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {stats.engagement.monthly_active_users}
            </div>
            <div className="text-sm text-slate-600 font-medium">
              Av totalt {stats.users.total} användare
            </div>
          </motion.div>

          {/* Conversion Rate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl group-hover:from-amber-500/20 group-hover:to-orange-500/20 transition-all">
                <UserCheck className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Konvertering</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {stats.users.conversion_rate}%
            </div>
            <div className="text-sm text-slate-600 font-medium">
              {stats.users.premium} premium av {stats.users.total}
            </div>
          </motion.div>

          {/* Email Verification Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-xl group-hover:from-teal-500/20 group-hover:to-cyan-500/20 transition-all">
                <ShieldCheck className="w-6 h-6 text-teal-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Verifiering</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {stats.users.verification_rate}%
            </div>
            <div className="text-sm text-slate-600 font-medium">
              {stats.users.verified} av {stats.users.total} användare
            </div>
          </motion.div>
        </motion.div>

        {/* Main Overview Chart - Premium glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-shadow duration-500 mb-10"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Trendöversikt {dateRange === 'day' && 'idag'}
            {dateRange === 'week' && 'senaste veckan'}
            {dateRange === 'month' && 'senaste månaden'}
            {dateRange === 'year' && 'senaste året'}
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData.combined}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.primary}
                name="Intäkter (kr)"
                strokeWidth={3}
                dot={{ fill: COLORS.primary, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke={COLORS.danger}
                name="Kostnader (kr)"
                strokeWidth={3}
                dot={{ fill: COLORS.danger, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke={COLORS.secondary}
                name="Vinst (kr)"
                strokeWidth={3}
                dot={{ fill: COLORS.secondary, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tabs - Premium design with animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white/60 backdrop-blur-md rounded-2xl p-2 shadow-lg mb-8"
        >
          <div className="flex gap-1">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isSelected = selectedTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 flex-1 font-medium ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                      : 'text-slate-700 hover:bg-white/80 hover:shadow-sm'
                  }`}
                >
                  <motion.div
                    animate={{
                      rotate: isSelected ? 360 : 0,
                      scale: isSelected ? 1.1 : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content with Charts */}
        <div className="space-y-6">
          {selectedTab === 'overview' && (
            <>
              {/* Feature Adoption Pie Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Funktionsanvändning</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <defs>
                        <linearGradient id="pieGrad1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#f472b6" stopOpacity={0.7}/>
                        </linearGradient>
                        <linearGradient id="pieGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.7}/>
                        </linearGradient>
                        <linearGradient id="pieGrad3" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.7}/>
                        </linearGradient>
                        <linearGradient id="pieGrad4" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#34d399" stopOpacity={0.7}/>
                        </linearGradient>
                        <linearGradient id="pieGrad5" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.7}/>
                        </linearGradient>
                      </defs>
                      <Pie
                        data={Object.entries(stats.engagement.feature_adoption)
                          .slice(0, 5)
                          .map(([key, value]) => ({ name: formatFeatureName(key), value }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {Object.entries(stats.engagement.feature_adoption).slice(0, 5).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#pieGrad${index + 1})`}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          padding: '12px'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Användarfördelning</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <defs>
                        <linearGradient id="pieUserPremium" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#f472b6" stopOpacity={0.7}/>
                        </linearGradient>
                        <linearGradient id="pieUserFree" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.7}/>
                        </linearGradient>
                      </defs>
                      <Pie
                        data={[
                          { name: 'Premium', value: stats.users.premium },
                          { name: 'Gratis', value: stats.users.free }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill="url(#pieUserPremium)" stroke="#fff" strokeWidth={2} />
                        <Cell fill="url(#pieUserFree)" stroke="#fff" strokeWidth={2} />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          padding: '12px'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
            </>
          )}

          {selectedTab === 'activity' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Aktivitet per dag</h2>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData.activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS.purple}
                    fill={COLORS.purple}
                    fillOpacity={0.3}
                    name="Aktiviteter"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {selectedTab === 'revenue' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Intäkter per dag</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={COLORS.primary} name="Intäkter (kr)" />
                </BarChart>
              </ResponsiveContainer>
              {stripeRevenue && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">
                    Aktiva prenumerationer: {stripeRevenue.subscriptions.active} |
                    MRR: {stripeRevenue.subscriptions.mrr.toLocaleString('sv-SE')} kr |
                    ARR: {stripeRevenue.subscriptions.arr.toLocaleString('sv-SE')} kr
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {selectedTab === 'costs' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Kostnader per dag</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.costs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={COLORS.danger} name="Kostnader (kr)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-red-600 font-medium">
                  Total AI-kostnad: {stats.costs.total_ai_cost.toFixed(2)} kr |
                  {openaiUsage?.data?.totalCost && (
                    <>Faktisk från OpenAI: {(openaiUsage.data.totalCost * 10.5).toFixed(2)} kr | </>
                  )}
                  Tokens: {openaiUsage?.data?.totalTokens?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </motion.div>
          )}

          {selectedTab === 'profit' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Vinst per dag</h2>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData.profit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS.secondary}
                    fill={COLORS.secondary}
                    fillOpacity={0.3}
                    name="Vinst (kr)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600">Bruttomarginal</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.profit.gross_margin.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600">Nettomarginal</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.profit.net_margin.toFixed(1)}%</p>
                </div>
              </div>
            </motion.div>
          )}

          {selectedTab === 'ai_costs' && (
            <>
              {/* Metric selector */}
              <div className="flex gap-2 mb-6">
                <select
                  value={aiMetric}
                  onChange={(e) => setAiMetric(e.target.value as 'calls' | 'cost' | 'tokens')}
                  className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-md focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-200 cursor-pointer hover:bg-white text-slate-900 font-medium"
                >
                  <option value="cost">Kostnad (SEK)</option>
                  <option value="calls">Antal anrop</option>
                  <option value="tokens">Tokens</option>
                </select>
                <select
                  value={aiTimeGrouping}
                  onChange={(e) => setAiTimeGrouping(e.target.value as 'day' | 'week' | 'month')}
                  className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-md focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-200 cursor-pointer hover:bg-white text-slate-900 font-medium"
                >
                  <option value="day">Per dag</option>
                  <option value="week">Per vecka</option>
                  <option value="month">Per månad</option>
                </select>
              </div>

              {/* Feature Usage Chart */}
              {aiFeatureData && aiFeatureData.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Användning per funktion</h2>
                  <FeatureUsageChart data={aiFeatureData} metric={aiMetric} />
                </motion.div>
              )}

              {/* Cost Breakdown */}
              {aiFeatureData && aiFeatureData.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Kostnadsfördelning</h2>
                  <FeatureCostBreakdown data={aiFeatureData} />
                </motion.div>
              )}

              {/* Time Series */}
              {aiTimeSeries && aiTimeSeries.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Kostnadsutveckling över tid</h2>
                  <CostTimeSeriesChart
                    data={aiTimeSeries}
                    groupBy={aiTimeGrouping}
                    features={aiFeatureData?.map((f: any) => f.featureName) || []}
                  />
                </motion.div>
              )}

              {/* Top Users Table */}
              {aiUserCosts && aiUserCosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Topp 20 användare efter kostnad</h2>
                  <TopUsersTable data={aiUserCosts} />
                </motion.div>
              )}

              {(!aiFeatureData || aiFeatureData.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-12 text-center border border-slate-200"
                >
                  <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Ingen AI-kostnadsdata hittades för vald period</p>
                </motion.div>
              )}
            </>
          )}

          {selectedTab === 'usage' && (
            <>
              {/* Metric selector */}
              <div className="flex gap-2 mb-6">
                <select
                  value={usageMetric}
                  onChange={(e) => setUsageMetric(e.target.value as 'calls' | 'users' | 'avgCalls' | 'successRate')}
                  className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-md focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-200 cursor-pointer hover:bg-white text-slate-900 font-medium"
                >
                  <option value="calls">Totalt antal anrop</option>
                  <option value="users">Unika användare</option>
                  <option value="avgCalls">Snitt anrop/användare</option>
                  <option value="successRate">Success rate (%)</option>
                </select>
              </div>

              {/* Usage Statistics Chart */}
              {usageStats && usageStats.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Användningsstatistik per funktion</h2>
                  <UsageStatisticsChart data={usageStats} metric={usageMetric} />
                </motion.div>
              )}

              {/* Feature Popularity Over Time */}
              {usageStats && usageStats.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Popularitetsutveckling</h2>
                    <div className="flex gap-2 flex-wrap">
                      {usageStats.map((feature: any) => (
                        <button
                          key={feature.featureName}
                          onClick={() => {
                            if (selectedFeaturesForPopularity.includes(feature.featureName)) {
                              setSelectedFeaturesForPopularity(
                                selectedFeaturesForPopularity.filter(f => f !== feature.featureName)
                              );
                            } else {
                              setSelectedFeaturesForPopularity([...selectedFeaturesForPopularity, feature.featureName]);
                            }
                          }}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            selectedFeaturesForPopularity.includes(feature.featureName)
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-navy-900 border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {feature.featureName}
                        </button>
                      ))}
                    </div>
                  </div>
                  <FeaturePopularityChart
                    data={usageStats}
                    selectedFeatures={selectedFeaturesForPopularity}
                  />
                </motion.div>
              )}

              {/* User Engagement Table */}
              {userEngagement && userEngagement.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Användarengagemang
                    <span className="text-sm text-gray-600 ml-2">
                      ({userEngagement.length} användare)
                    </span>
                  </h2>
                  <UserEngagementTable data={userEngagement} />
                </motion.div>
              )}

              {(!usageStats || usageStats.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-12 text-center border border-slate-200"
                >
                  <Zap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Ingen användningsdata hittades för vald period</p>
                </motion.div>
              )}
            </>
          )}
        </div>

        {/* Detailed Stats Grid - Premium cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10"
        >
          {/* Users Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            whileHover={{ y: -4 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Användaranalys</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">Premium-användare</span>
                <span className="text-green-600 font-semibold">{stats.users.premium}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">Gratisanvändare</span>
                <span className="text-blue-600 font-semibold">{stats.users.free}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">Aktiva idag</span>
                <span className="text-slate-900 font-medium">{stats.users.active_today}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">Nya denna vecka</span>
                <span className="text-slate-900 font-medium">{stats.users.new_week}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">Retention Rate</span>
                <span className="text-slate-900 font-medium">{stats.users.retention_rate}%</span>
              </div>
            </div>
          </motion.div>

          {/* Revenue Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ y: -4 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Ekonomi</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">Total intäkt</span>
                <span className="text-green-600 font-semibold">
                  {(stripeRevenue?.revenue.total || stats.revenue.total_revenue).toLocaleString('sv-SE')} kr
                </span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">AI-kostnader</span>
                <span className="text-red-600 font-semibold">{stats.costs.total_ai_cost.toFixed(2)} kr</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">Nettovinst</span>
                <span className="text-blue-600 font-semibold">{stats.profit.net_profit.toFixed(0)} kr</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">LTV</span>
                <span className="text-slate-900 font-medium">{stats.revenue.lifetime_value} kr</span>
              </div>
            </div>
          </motion.div>

          {/* Usage Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            whileHover={{ y: -4 }}
            className="bg-white/90 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Användning</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">CV:n</span>
                <span className="text-slate-900 font-medium">{stats.usage.total_cvs}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">Brev genererade</span>
                <span className="text-slate-900 font-medium">{stats.usage.total_letters}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">Sparfrekvens</span>
                <span className="text-slate-900 font-medium">{stats.usage.save_rate}%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-slate-600">CV-analyser</span>
                <span className="text-slate-900 font-medium">{stats.usage.cv_analyses}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}