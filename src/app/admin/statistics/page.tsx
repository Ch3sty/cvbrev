'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Brain,
  Zap,
  Clock,
  CreditCard,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  CloudDownload,
  Euro,
  TrendingDown,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  Globe,
  Monitor,
  Smartphone
} from 'lucide-react';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import { sv } from 'date-fns/locale';

// Registrera Chart.js komponenter
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
    infrastructure_cost: number; // Estimat baserat på användning
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
    average_session_duration: number;
    pages_per_session: number;
    bounce_rate: number;
    feature_adoption: { [key: string]: number };
    user_satisfaction: number;
  };
  performance: {
    average_response_time: number;
    uptime_percentage: number;
    error_rate: number;
    api_calls_today: number;
    api_calls_month: number;
    database_size_mb: number;
    storage_used_gb: number;
  };
}

export default function StatisticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('week'); // day, week, month, year
  const [selectedView, setSelectedView] = useState('overview'); // overview, users, revenue, usage, performance
  const [openaiUsage, setOpenaiUsage] = useState<any>(null);
  const [costComparison, setCostComparison] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const supabase = getSupabaseClient();

  // Hämta all statistik
  const fetchStatistics = async () => {
    try {
      setError(null);

      // Datumintervall
      const now = new Date();
      const today = startOfDay(now);
      const weekAgo = subDays(now, 7);
      const monthAgo = subMonths(now, 1);

      // Parallella queries för bättre prestanda
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

      // Beräkna conversion rate (free to premium)
      const conversionRate = profiles && profiles.length > 0
        ? (premiumUsers.length / profiles.length) * 100
        : 0;

      // Beräkna retention (aktiva senaste månaden / totalt)
      const retentionRate = profiles && profiles.length > 0
        ? (activeMonth.length / profiles.length) * 100
        : 0;

      // Beräkna intäkter
      const monthlyPrice = 149; // SEK per månad
      const mrr = premiumUsers.length * monthlyPrice;
      const arr = mrr * 12;

      // Beräkna faktiska intäkter från revenue_tracking
      const totalRevenue = revenues?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const revenueToday = revenues?.filter(r => new Date(r.created_at) >= today)
        .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const revenueWeek = revenues?.filter(r => new Date(r.created_at) >= weekAgo)
        .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const revenueMonth = revenues?.filter(r => new Date(r.created_at) >= monthAgo)
        .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      // Beräkna AI-kostnader
      const letterCosts = letters?.reduce((sum, l) => sum + parseFloat(l.ai_cost?.toString() || '0'), 0) || 0;
      const usageLogCosts = usageLogs?.reduce((sum, l) => sum + parseFloat(l.cost?.toString() || '0'), 0) || 0;
      const totalAICost = letterCosts + usageLogCosts;

      const aiCostToday = letters?.filter(l => new Date(l.created_at) >= today)
        .reduce((sum, l) => sum + parseFloat(l.ai_cost?.toString() || '0'), 0) || 0;
      const aiCostWeek = letters?.filter(l => new Date(l.created_at) >= weekAgo)
        .reduce((sum, l) => sum + parseFloat(l.ai_cost?.toString() || '0'), 0) || 0;
      const aiCostMonth = letters?.filter(l => new Date(l.created_at) >= monthAgo)
        .reduce((sum, l) => sum + parseFloat(l.ai_cost?.toString() || '0'), 0) || 0;

      // Estimera infrastrukturkostnader (Supabase, Vercel, etc.)
      // Baserat på användning - detta är ett estimat
      const estimatedInfraCostPerUser = 2; // SEK per användare per månad
      const infrastructureCost = (profiles?.length || 0) * estimatedInfraCostPerUser;

      // Beräkna totala kostnader
      const totalCosts = (totalAICost * 10.5) + infrastructureCost; // AI-kostnader är i USD

      // Beräkna vinst
      const grossProfit = totalRevenue - (totalAICost * 10.5);
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const netProfit = grossProfit - infrastructureCost;
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Beräkna användningsstatistik
      const cvsToday = cvs?.filter(c => new Date(c.created_at) >= today) || [];
      const cvsWeek = cvs?.filter(c => new Date(c.created_at) >= weekAgo) || [];
      const cvsMonth = cvs?.filter(c => new Date(c.created_at) >= monthAgo) || [];

      const lettersToday = letters?.filter(l => new Date(l.created_at) >= today) || [];
      const lettersWeek = letters?.filter(l => new Date(l.created_at) >= weekAgo) || [];
      const lettersMonth = letters?.filter(l => new Date(l.created_at) >= monthAgo) || [];
      const savedLetters = letters?.filter(l => l.is_saved) || [];

      const saveRate = letters && letters.length > 0
        ? (savedLetters.length / letters.length) * 100
        : 0;

      // CV-analyser från aktiviteter
      const cvAnalyses = activities?.filter(a =>
        a.activity_type === 'cv_analysis_completed'
      ) || [];
      const analysesToday = cvAnalyses.filter(a => new Date(a.created_at) >= today);

      // Beräkna engagement metrics
      const dau = activeToday.length;
      const wau = activeWeek.length;
      const mau = activeMonth.length;

      // Feature adoption från aktiviteter
      const featureAdoption: { [key: string]: number } = {};
      activities?.forEach(activity => {
        const type = activity.activity_type;
        if (type) {
          featureAdoption[type] = (featureAdoption[type] || 0) + 1;
        }
      });

      // Beräkna churn rate (månadsvis)
      // Antal som slutat / totalt antal i början av perioden
      const churnedUsers = profiles?.filter(p => {
        const lastActive = p.last_active ? new Date(p.last_active) : null;
        return lastActive && lastActive < monthAgo;
      }) || [];
      const churnRate = profiles && profiles.length > 0
        ? (churnedUsers.length / profiles.length) * 100
        : 0;

      // Lifetime value (LTV)
      const avgCustomerLifespan = churnRate > 0 ? 100 / churnRate : 12; // månader
      const lifetimeValue = monthlyPrice * avgCustomerLifespan;

      // Performance metrics (vissa är faktiska, andra estimat)
      const apiCallsToday = activities?.filter(a => new Date(a.created_at) >= today).length || 0;
      const apiCallsMonth = activities?.filter(a => new Date(a.created_at) >= monthAgo).length || 0;

      // Sätt statistikdata
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
          total_revenue: totalRevenue,
          revenue_today: revenueToday,
          revenue_week: revenueWeek,
          revenue_month: revenueMonth,
          average_revenue_per_user: profiles?.length ? totalRevenue / profiles.length : 0,
          average_revenue_per_premium_user: premiumUsers.length ? totalRevenue / premiumUsers.length : 0,
          lifetime_value: Math.round(lifetimeValue),
          churn_rate: Math.round(churnRate * 10) / 10
        },
        costs: {
          total_ai_cost: totalAICost * 10.5, // Konvertera till SEK
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
          daily_active_users: dau,
          weekly_active_users: wau,
          monthly_active_users: mau,
          average_session_duration: 0, // Skulle kräva sessionsspårning
          pages_per_session: 0, // Skulle kräva sessionsspårning
          bounce_rate: 0, // Skulle kräva sessionsspårning
          feature_adoption: featureAdoption,
          user_satisfaction: 0 // Skulle kräva användarundersökningar
        },
        performance: {
          average_response_time: 0, // Skulle kräva API-metriker
          uptime_percentage: 99.9, // Antagande
          error_rate: 0.1, // Antagande
          api_calls_today: apiCallsToday,
          api_calls_month: apiCallsMonth,
          database_size_mb: 0, // Skulle kräva databasmetriker
          storage_used_gb: 0 // Skulle kräva lagringsmetriker
        }
      });

    } catch (err: any) {
      console.error('Fel vid hämtning av statistik:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av statistik');
    } finally {
      setIsLoading(false);
    }
  };

  // Hämta faktisk OpenAI-användningsdata
  const fetchOpenAIUsage = async () => {
    try {
      let days = 30;
      switch (dateRange) {
        case 'day': days = 1; break;
        case 'week': days = 7; break;
        case 'month': days = 30; break;
        case 'year': days = 365; break;
      }

      const response = await fetch(`/api/admin/openai-usage?days=${days}`);
      const result = await response.json();

      if (result.success && result.data) {
        setOpenaiUsage(result);
        setCostComparison(result.data.comparison);
      }
    } catch (error) {
      console.error('Fel vid hämtning av OpenAI-användning:', error);
    }
  };

  // Uppdatera data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStatistics(), fetchOpenAIUsage()]);
    setRefreshing(false);
  };

  // Synkronisera OpenAI-data
  const syncOpenAIData = async () => {
    try {
      const response = await fetch('/api/admin/openai-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      });
      const result = await response.json();
      if (result.success) {
        alert(`Synkade ${result.syncedRecords} poster från OpenAI`);
        fetchOpenAIUsage();
      } else {
        alert('Synkronisering misslyckades. Kontrollera Admin API-nyckel.');
      }
    } catch (error) {
      console.error('Fel vid synkronisering:', error);
      alert('Ett fel uppstod vid synkronisering');
    }
  };

  useEffect(() => {
    fetchStatistics();
    fetchOpenAIUsage();
    const interval = setInterval(() => {
      fetchStatistics();
      fetchOpenAIUsage();
    }, 60000); // Uppdatera varje minut
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 p-6 flex items-center justify-center">
        <div className="text-white">Laddar statistik...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 p-6">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Fullständig översikt av Jobbcoach.ai</p>
          </div>
          <div className="flex gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-navy-700 text-white rounded-lg border border-gray-600"
            >
              <option value="day">Idag</option>
              <option value="week">Senaste veckan</option>
              <option value="month">Senaste månaden</option>
              <option value="year">Senaste året</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Uppdatera
            </button>
            <button
              onClick={syncOpenAIData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <CloudDownload className="w-4 h-4" />
              Synka OpenAI
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Euro className="w-8 h-8 text-green-400" />
            <span className="text-sm text-gray-400">Total intäkt</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.revenue.total_revenue.toLocaleString('sv-SE')} kr</div>
          <div className="text-sm text-green-400 mt-2">MRR: {stats.revenue.mrr.toLocaleString('sv-SE')} kr</div>
        </div>

        {/* Net Profit */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-pink-400" />
            <span className="text-sm text-gray-400">Nettovinst</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.profit.net_profit.toLocaleString('sv-SE')} kr</div>
          <div className="text-sm text-pink-400 mt-2">Marginal: {stats.profit.net_margin}%</div>
        </div>

        {/* Active Users */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-sm text-gray-400">Aktiva användare</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.engagement.monthly_active_users}</div>
          <div className="text-sm text-blue-400 mt-2">Av totalt {stats.users.total} användare</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <UserCheck className="w-8 h-8 text-purple-400" />
            <span className="text-sm text-gray-400">Konvertering</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.users.conversion_rate}%</div>
          <div className="text-sm text-purple-400 mt-2">{stats.users.premium} premium av {stats.users.total}</div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Analytics */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Användaranalys
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-navy-900 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Premium-användare</div>
                <div className="text-xl font-bold text-white">{stats.users.premium}</div>
                <div className="text-xs text-green-400 mt-1">
                  {stats.revenue.average_revenue_per_premium_user.toFixed(0)} kr/användare
                </div>
              </div>
              <div className="bg-navy-900 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Gratisanvändare</div>
                <div className="text-xl font-bold text-white">{stats.users.free}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Potentiell MRR: {(stats.users.free * 149).toLocaleString('sv-SE')} kr
                </div>
              </div>
            </div>

            <div className="bg-navy-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Användaraktivitet</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Idag</span>
                  <span className="text-white font-semibold">{stats.users.active_today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Denna vecka</span>
                  <span className="text-white font-semibold">{stats.users.active_week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Denna månad</span>
                  <span className="text-white font-semibold">{stats.users.active_month}</span>
                </div>
              </div>
            </div>

            <div className="bg-navy-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Nya registreringar</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Idag</span>
                  <span className="text-white font-semibold">{stats.users.new_today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Denna vecka</span>
                  <span className="text-white font-semibold">{stats.users.new_week}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Denna månad</span>
                  <span className="text-white font-semibold">{stats.users.new_month}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-navy-900 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Retention Rate</div>
                <div className="text-xl font-bold text-white">{stats.users.retention_rate}%</div>
              </div>
              <div className="bg-navy-900 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Churn Rate</div>
                <div className="text-xl font-bold text-white">{stats.revenue.churn_rate}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue & Costs */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Ekonomi & Lönsamhet
          </h2>
          <div className="space-y-4">
            <div className="bg-navy-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Intäkter</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total intäkt</span>
                  <span className="text-green-400 font-semibold">{stats.revenue.total_revenue.toLocaleString('sv-SE')} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Denna månad</span>
                  <span className="text-green-400 font-semibold">{stats.revenue.revenue_month.toLocaleString('sv-SE')} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">MRR</span>
                  <span className="text-green-400 font-semibold">{stats.revenue.mrr.toLocaleString('sv-SE')} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">ARR</span>
                  <span className="text-green-400 font-semibold">{stats.revenue.arr.toLocaleString('sv-SE')} kr</span>
                </div>
              </div>
            </div>

            <div className="bg-navy-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Kostnader</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">AI-kostnader (total)</span>
                  <span className="text-red-400 font-semibold">{stats.costs.total_ai_cost.toFixed(2)} kr</span>
                </div>
                {costComparison && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Faktisk AI-kostnad</span>
                    <span className="text-orange-400 font-semibold">{costComparison.actualCostSEK.toFixed(2)} kr</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-300">Denna månad</span>
                  <span className="text-red-400 font-semibold">{stats.costs.ai_cost_month.toFixed(2)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Infrastruktur (est.)</span>
                  <span className="text-red-400 font-semibold">{stats.costs.infrastructure_cost.toFixed(2)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Kostnad per användare</span>
                  <span className="text-red-400 font-semibold">{stats.costs.cost_per_user.toFixed(2)} kr</span>
                </div>
              </div>
            </div>

            <div className="bg-navy-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Vinst & Marginaler</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Bruttovinst</span>
                  <span className="text-pink-400 font-semibold">{stats.profit.gross_profit.toFixed(0)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Bruttomarginal</span>
                  <span className="text-pink-400 font-semibold">{stats.profit.gross_margin}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Nettovinst</span>
                  <span className="text-pink-400 font-semibold">{stats.profit.net_profit.toFixed(0)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Nettomarginal</span>
                  <span className="text-pink-400 font-semibold">{stats.profit.net_margin}%</span>
                </div>
              </div>
            </div>

            <div className="bg-navy-900 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-2">Nyckeltal</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">LTV (Lifetime Value)</span>
                  <span className="text-purple-400 font-semibold">{stats.revenue.lifetime_value.toLocaleString('sv-SE')} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Vinst per användare</span>
                  <span className="text-purple-400 font-semibold">{stats.profit.profit_per_user.toFixed(0)} kr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Vinst per premium</span>
                  <span className="text-purple-400 font-semibold">{stats.profit.profit_per_premium_user.toFixed(0)} kr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* CV Statistics */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            CV-hantering
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Totalt antal CV:n</span>
              <span className="text-white font-semibold">{stats.usage.total_cvs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uppladdade idag</span>
              <span className="text-white font-semibold">{stats.usage.cvs_uploaded_today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Denna vecka</span>
              <span className="text-white font-semibold">{stats.usage.cvs_uploaded_week}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Denna månad</span>
              <span className="text-white font-semibold">{stats.usage.cvs_uploaded_month}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">CV-analyser</span>
              <span className="text-white font-semibold">{stats.usage.cv_analyses}</span>
            </div>
          </div>
        </div>

        {/* Letter Statistics */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-green-400" />
            Brevgenerering
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Totalt antal brev</span>
              <span className="text-white font-semibold">{stats.usage.total_letters}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Genererade idag</span>
              <span className="text-white font-semibold">{stats.usage.letters_generated_today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Denna vecka</span>
              <span className="text-white font-semibold">{stats.usage.letters_generated_week}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sparade brev</span>
              <span className="text-white font-semibold">{stats.usage.letters_saved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sparfrekvens</span>
              <span className="text-white font-semibold">{stats.usage.save_rate}%</span>
            </div>
          </div>
        </div>

        {/* AI Cost Details */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-pink-400" />
            AI-kostnader
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total kostnad</span>
              <span className="text-white font-semibold">{stats.costs.total_ai_cost.toFixed(2)} kr</span>
            </div>
            {costComparison && (
              <div className="flex justify-between">
                <span className="text-gray-400">Skillnad estimat</span>
                <span className={`font-semibold ${costComparison.difference > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {costComparison.differenceSEK > 0 ? '+' : ''}{costComparison.differenceSEK.toFixed(2)} kr
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Idag</span>
              <span className="text-white font-semibold">{stats.costs.ai_cost_today.toFixed(2)} kr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Denna vecka</span>
              <span className="text-white font-semibold">{stats.costs.ai_cost_week.toFixed(2)} kr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Per generering</span>
              <span className="text-white font-semibold">{stats.costs.cost_per_generation.toFixed(2)} kr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Adoption */}
      <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          Funktionsanvändning
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(stats.engagement.feature_adoption)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 12)
            .map(([feature, count]) => (
              <div key={feature} className="bg-navy-900 rounded-lg p-3">
                <div className="text-sm text-gray-400 mb-1">
                  {feature.replace(/_/g, ' ')}
                </div>
                <div className="text-xl font-bold text-white">{count}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-400 text-sm">
        Senast uppdaterad: {new Date().toLocaleString('sv-SE')}
      </div>
    </div>
  );
}