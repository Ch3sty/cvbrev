'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
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
  ChartPie
} from 'lucide-react';
import { format, subDays, subMonths, startOfDay } from 'date-fns';
import { sv } from 'date-fns/locale';

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
      <div className="bg-navy-900 p-3 rounded-lg border border-gray-700 shadow-lg">
        <p className="text-gray-300 text-sm">{label}</p>
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
        { data: revenues }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('cv_texts').select('*'),
        supabase.from('letters').select('*'),
        supabase.from('user_activities').select('*').order('created_at', { ascending: false }),
        supabase.from('usage_log').select('*'),
        supabase.from('revenue_tracking').select('*').eq('status', 'completed')
      ]);

      // Beräkna användarstatistik
      const premiumUsers = profiles?.filter(p => p.subscription_tier === 'premium') || [];
      const freeUsers = profiles?.filter(p => p.subscription_tier === 'free' || !p.subscription_tier) || [];

      const activeToday = profiles?.filter(p => p.last_active && new Date(p.last_active) >= today) || [];
      const activeWeek = profiles?.filter(p => p.last_active && new Date(p.last_active) >= weekAgo) || [];
      const activeMonth = profiles?.filter(p => p.last_active && new Date(p.last_active) >= monthAgo) || [];

      const newToday = profiles?.filter(p => new Date(p.created_at) >= today) || [];
      const newWeek = profiles?.filter(p => new Date(p.created_at) >= weekAgo) || [];
      const newMonth = profiles?.filter(p => new Date(p.created_at) >= monthAgo) || [];

      const conversionRate = profiles?.length ? (premiumUsers.length / profiles.length) * 100 : 0;
      const retentionRate = activeMonth.length > 0 && profiles?.length ?
        (activeMonth.length / profiles.length) * 100 : 0;

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

      // Beräkna AI-kostnader från både usage_log och letters tabellen
      const usageLogCost = usageLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;
      const lettersCost = letters?.reduce((sum, letter) =>
        sum + (parseFloat(letter.ai_cost?.toString() || '0') || 0), 0) || 0;

      // Använd det högsta värdet (letters har troligen mer komplett data)
      const totalAICost = Math.max(usageLogCost, lettersCost);

      const aiCostToday = letters?.filter(l => new Date(l.created_at) >= today)
        .reduce((sum, l) => sum + (parseFloat(l.ai_cost?.toString() || '0') || 0), 0) || 0;
      const aiCostWeek = letters?.filter(l => new Date(l.created_at) >= weekAgo)
        .reduce((sum, l) => sum + (parseFloat(l.ai_cost?.toString() || '0') || 0), 0) || 0;
      const aiCostMonth = letters?.filter(l => new Date(l.created_at) >= monthAgo)
        .reduce((sum, l) => sum + (parseFloat(l.ai_cost?.toString() || '0') || 0), 0) || 0;

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

        // Beräkna dagskostnader från letters (där vi har faktisk data)
        // ai_cost är redan numeriskt, multiplicera direkt med 10.5 för SEK
        const dayCost = letters?.filter(letter => {
          const letterDate = new Date(letter.created_at);
          return format(letterDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        }).reduce((sum, letter) => {
          const cost = letter.ai_cost || 0;
          return sum + (typeof cost === 'number' ? cost * 10.5 : 0);
        }, 0) || 0;

        // Beräkna även från usage_log om det finns data där
        const usageLogDayCost = usageLogs?.filter(log => {
          const logDate = new Date(log.created_at);
          return format(logDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
        }).reduce((sum, log) => sum + (log.cost || 0) * 10.5, 0) || 0;

        // Använd det högsta värdet
        const totalDayCost = Math.max(dayCost, usageLogDayCost);

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
          retention_rate: Math.round(retentionRate * 10) / 10
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
          total_ai_cost: totalAICost * 10.5,
          ai_cost_today: aiCostToday * 10.5,
          ai_cost_week: aiCostWeek * 10.5,
          ai_cost_month: aiCostMonth * 10.5,
          cost_per_user: profiles?.length ? (totalAICost * 10.5) / profiles.length : 0,
          cost_per_generation: letters?.length ? (totalAICost * 10.5) / letters.length : 0,
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
        // Uppdatera statistiken igen med nya Stripe-data
        fetchStatistics();
      }
    } catch (error) {
      console.error('Fel vid hämtning av Stripe-intäkter:', error);
    }
  };

  // Automatisk synkning vid sidladdning och datumändring
  useEffect(() => {
    // Initial laddning
    Promise.all([
      fetchStatistics(),
      fetchOpenAIUsage(),
      fetchStripeRevenue()
    ]);

    // Uppdatera var 2:e minut
    const interval = setInterval(() => {
      Promise.all([
        fetchStatistics(),
        fetchOpenAIUsage(),
        fetchStripeRevenue()
      ]);
    }, 120000);

    return () => clearInterval(interval);
  }, [dateRange]); // Kör om när dateRange ändras

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy-950">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Laddar statistik...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-navy-950">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
    { id: 'profit', label: 'Vinst', icon: Euro }
  ];

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Fullständig översikt av Jobbcoach.ai</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2 mb-6">
          {['day', 'week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-navy-800 text-gray-400 hover:bg-navy-700'
              }`}
            >
              {range === 'day' && 'Idag'}
              {range === 'week' && 'Vecka'}
              {range === 'month' && 'Månad'}
              {range === 'year' && 'År'}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Euro className="w-8 h-8 text-green-400" />
              <span className="text-sm text-gray-400">Total intäkt</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stripeRevenue ? stripeRevenue.revenue.total.toLocaleString('sv-SE') : stats.revenue.total_revenue.toLocaleString('sv-SE')} kr
            </div>
            {stripeRevenue && (
              <div className="text-xs text-green-400 mt-1">Faktisk från Stripe</div>
            )}
            <div className="text-sm text-green-400 mt-2">
              MRR: {stripeRevenue ? stripeRevenue.subscriptions.mrr.toLocaleString('sv-SE') : stats.revenue.mrr.toLocaleString('sv-SE')} kr
            </div>
          </div>

          <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-sm text-gray-400">Nettovinst</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.profit.net_profit.toLocaleString('sv-SE')} kr
            </div>
            <div className="text-sm text-blue-400 mt-2">
              Marginal: {stats.profit.net_margin.toFixed(0)}%
            </div>
          </div>

          <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-400" />
              <span className="text-sm text-gray-400">Aktiva användare</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.engagement.monthly_active_users}
            </div>
            <div className="text-sm text-purple-400 mt-2">
              Av totalt {stats.users.total} användare
            </div>
          </div>

          <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="w-8 h-8 text-amber-400" />
              <span className="text-sm text-gray-400">Konvertering</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.users.conversion_rate}%
            </div>
            <div className="text-sm text-amber-400 mt-2">
              {stats.users.premium} premium av {stats.users.total}
            </div>
          </div>
        </div>

        {/* Main Overview Chart - Always visible */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Trendöversikt {dateRange === 'day' && 'idag'}
            {dateRange === 'week' && 'senaste veckan'}
            {dateRange === 'month' && 'senaste månaden'}
            {dateRange === 'year' && 'senaste året'}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.combined}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={COLORS.primary}
                name="Intäkter (kr)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke={COLORS.danger}
                name="Kostnader (kr)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke={COLORS.secondary}
                name="Vinst (kr)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-navy-900 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors flex-1 ${
                  selectedTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-navy-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content with Charts */}
        <div className="space-y-6">
          {selectedTab === 'overview' && (
            <>
              {/* Feature Adoption Pie Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">Funktionsanvändning</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(stats.engagement.feature_adoption)
                          .slice(0, 5)
                          .map(([key, value]) => ({ name: key, value }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(stats.engagement.feature_adoption).slice(0, 5).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">Användarfördelning</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Premium', value: stats.users.premium },
                          { name: 'Gratis', value: stats.users.free }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill={COLORS.primary} />
                        <Cell fill={COLORS.secondary} />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {selectedTab === 'activity' && (
            <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Aktivitet per dag</h2>
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
            </div>
          )}

          {selectedTab === 'revenue' && (
            <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Intäkter per dag</h2>
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
                <div className="mt-4 p-4 bg-navy-900 rounded-lg">
                  <p className="text-sm text-green-400">
                    Aktiva prenumerationer: {stripeRevenue.subscriptions.active} |
                    MRR: {stripeRevenue.subscriptions.mrr.toLocaleString('sv-SE')} kr |
                    ARR: {stripeRevenue.subscriptions.arr.toLocaleString('sv-SE')} kr
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'costs' && (
            <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Kostnader per dag</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData.costs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={COLORS.danger} name="Kostnader (kr)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-navy-900 rounded-lg">
                <p className="text-sm text-red-400">
                  Total AI-kostnad: {stats.costs.total_ai_cost.toFixed(2)} kr |
                  {openaiUsage?.data?.totalCost && (
                    <>Faktisk från OpenAI: {(openaiUsage.data.totalCost * 10.5).toFixed(2)} kr | </>
                  )}
                  Tokens: {openaiUsage?.data?.totalTokens?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {selectedTab === 'profit' && (
            <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Vinst per dag</h2>
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
                <div className="p-4 bg-navy-900 rounded-lg">
                  <p className="text-sm text-gray-400">Bruttomarginal</p>
                  <p className="text-2xl font-bold text-white">{stats.profit.gross_margin.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-navy-900 rounded-lg">
                  <p className="text-sm text-gray-400">Nettomarginal</p>
                  <p className="text-2xl font-bold text-white">{stats.profit.net_margin.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Users Section */}
          <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Användaranalys</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Premium-användare</span>
                <span className="text-green-400 font-semibold">{stats.users.premium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Gratisanvändare</span>
                <span className="text-blue-400 font-semibold">{stats.users.free}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Aktiva idag</span>
                <span className="text-white">{stats.users.active_today}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nya denna vecka</span>
                <span className="text-white">{stats.users.new_week}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Retention Rate</span>
                <span className="text-white">{stats.users.retention_rate}%</span>
              </div>
            </div>
          </div>

          {/* Revenue Section */}
          <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Ekonomi</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total intäkt</span>
                <span className="text-green-400 font-semibold">
                  {(stripeRevenue?.revenue.total || stats.revenue.total_revenue).toLocaleString('sv-SE')} kr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">AI-kostnader</span>
                <span className="text-red-400 font-semibold">{stats.costs.total_ai_cost.toFixed(2)} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nettovinst</span>
                <span className="text-blue-400 font-semibold">{stats.profit.net_profit.toFixed(0)} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">LTV</span>
                <span className="text-white">{stats.revenue.lifetime_value} kr</span>
              </div>
            </div>
          </div>

          {/* Usage Section */}
          <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Användning</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">CV:n</span>
                <span className="text-white">{stats.usage.total_cvs}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Brev genererade</span>
                <span className="text-white">{stats.usage.total_letters}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sparfrekvens</span>
                <span className="text-white">{stats.usage.save_rate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">CV-analyser</span>
                <span className="text-white">{stats.usage.cv_analyses}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}