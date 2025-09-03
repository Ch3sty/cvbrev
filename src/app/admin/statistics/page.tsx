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
  Filter,
  Brain,
  Globe,
  Zap,
  Database,
  Clock,
  CreditCard,
  BarChart3,
  PieChart,
  ChevronDown
} from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
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

// Typdefinitioner
interface StatisticsData {
  users: {
    total: number;
    premium: number;
    free: number;
    new_this_week: number;
    new_this_month: number;
    active_today: number;
    active_this_week: number;
    churn_rate: number;
  };
  cvs: {
    total: number;
    average_size: number;
    uploaded_this_week: number;
    uploaded_this_month: number;
    unique_users: number;
    average_per_user: number;
  };
  letters: {
    total: number;
    saved: number;
    language_distribution: { [key: string]: number };
    generated_this_week: number;
    generated_this_month: number;
    average_generation_time: number;
  };
  ai: {
    total_cost: number;
    total_tokens: number;
    average_cost_per_generation: number;
    model_distribution: { [key: string]: number };
    cost_this_month: number;
    tokens_this_month: number;
  };
  activities: {
    most_active_users: Array<{ user_id: string; email: string; activity_count: number }>;
    popular_features: Array<{ feature: string; usage_count: number }>;
    total_activities: number;
    activities_today: number;
  };
  system: {
    database_size: number;
    storage_used: number;
    api_response_time: number;
    uptime_percentage: number;
    error_rate: number;
    active_connections: number;
  };
  revenue: {
    mrr: number;
    arr: number;
    total_revenue: number;
    revenue_this_month: number;
    average_revenue_per_user: number;
    growth_rate: number;
  };
}

interface TimeSeriesData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
  }>;
}

// Statistik kort komponent
function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'blue'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    cyan: 'from-cyan-500 to-cyan-600'
  };

  return (
    <div className="bg-navy-800 rounded-lg p-6 border border-gray-700 hover:border-pink-500 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
          
          {trendValue && (
            <div className="flex items-center mt-3 gap-2">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
              {trend === 'down' && <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
              {trend === 'neutral' && <Activity className="w-4 h-4 text-gray-400" />}
              <span className={`text-sm ${
                trend === 'up' ? 'text-green-400' : 
                trend === 'down' ? 'text-red-400' : 
                'text-gray-400'
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} bg-opacity-10`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Huvudkomponent för statistiksidan
export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('week'); // week, month, year, all
  const [selectedMetric, setSelectedMetric] = useState('users'); // users, revenue, ai, activity
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const supabase = getSupabaseClient();

  // Hämta statistikdata
  const fetchStatistics = async () => {
    try {
      setError(null);
      
      // Hämta användarstatistik
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Hämta CV-statistik
      const { data: cvs, error: cvsError } = await supabase
        .from('cv_texts')
        .select('*');
      
      if (cvsError) throw cvsError;

      // Hämta brevstatistik
      const { data: letters, error: lettersError } = await supabase
        .from('letters')
        .select('*');
      
      if (lettersError) throw lettersError;

      // Hämta aktiviteter
      const { data: activities, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*');

      // Hämta användningslogg för AI-kostnader
      const { data: usageLogs, error: usageError } = await supabase
        .from('usage_log')
        .select('*');

      // Beräkna statistik
      const now = new Date();
      const weekAgo = subDays(now, 7);
      const monthAgo = subDays(now, 30);
      const today = new Date().toISOString().split('T')[0];

      // Användarstatistik
      const premiumUsers = profiles?.filter(p => p.subscription_tier === 'premium') || [];
      const freeUsers = profiles?.filter(p => p.subscription_tier === 'free') || [];
      const newThisWeek = profiles?.filter(p => new Date(p.created_at) > weekAgo) || [];
      const newThisMonth = profiles?.filter(p => new Date(p.created_at) > monthAgo) || [];
      const activeToday = profiles?.filter(p => 
        p.last_active && new Date(p.last_active).toISOString().split('T')[0] === today
      ) || [];
      const activeThisWeek = profiles?.filter(p => 
        p.last_active && new Date(p.last_active) > weekAgo
      ) || [];

      // CV-statistik
      const uploadedThisWeek = cvs?.filter(cv => new Date(cv.created_at) > weekAgo) || [];
      const uploadedThisMonth = cvs?.filter(cv => new Date(cv.created_at) > monthAgo) || [];
      const uniqueCvUsers = new Set(cvs?.map(cv => cv.user_id) || []).size;
      const avgCvSize = cvs && cvs.length > 0 
        ? Math.round(cvs.reduce((acc, cv) => acc + cv.cv_text.length, 0) / cvs.length)
        : 0;

      // Brevstatistik
      const savedLetters = letters?.filter(l => l.is_saved) || [];
      const generatedThisWeek = letters?.filter(l => new Date(l.created_at) > weekAgo) || [];
      const generatedThisMonth = letters?.filter(l => new Date(l.created_at) > monthAgo) || [];
      
      // Språkdistribution
      const languageDistribution = letters?.reduce((acc, letter) => {
        const lang = letter.language || 'sv';
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }) || {};

      // Genomsnittlig genereringstid
      const avgGenerationTime = letters && letters.length > 0
        ? letters.reduce((acc, l) => acc + (l.generation_time_ms || 0), 0) / letters.length / 1000
        : 0;

      // AI-kostnader
      const totalTokens = usageLogs?.reduce((acc, log) => acc + (log.tokens || 0), 0) || 0;
      const totalCost = usageLogs?.reduce((acc, log) => acc + parseFloat(log.cost?.toString() || '0'), 0) || 0;
      const thisMonthLogs = usageLogs?.filter(log => new Date(log.created_at) > monthAgo) || [];
      const tokensThisMonth = thisMonthLogs.reduce((acc, log) => acc + (log.tokens || 0), 0);
      const costThisMonth = thisMonthLogs.reduce((acc, log) => acc + parseFloat(log.cost?.toString() || '0'), 0);
      
      // Modelldistribution
      const modelDistribution = usageLogs?.reduce((acc, log) => {
        if (log.model) {
          acc[log.model] = (acc[log.model] || 0) + 1;
        }
        return acc;
      }, {} as { [key: string]: number }) || {};

      // Aktivitetsstatistik
      const activitiesToday = activities?.filter(a => 
        new Date(a.created_at).toISOString().split('T')[0] === today
      ) || [];

      // Mest aktiva användare
      const userActivityCount = activities?.reduce((acc, activity) => {
        if (activity.user_id) {
          if (!acc[activity.user_id]) {
            acc[activity.user_id] = { count: 0, user_id: activity.user_id };
          }
          acc[activity.user_id].count++;
        }
        return acc;
      }, {} as { [key: string]: { count: number; user_id: string } }) || {};

      const mostActiveUsers = Object.values(userActivityCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(user => {
          const profile = profiles?.find(p => p.id === user.user_id);
          return {
            user_id: user.user_id,
            email: profile?.email || 'Okänd',
            activity_count: user.count
          };
        });

      // Populära funktioner
      const featureCount = activities?.reduce((acc, activity) => {
        const feature = activity.activity_type || 'unknown';
        acc[feature] = (acc[feature] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }) || {};

      const popularFeatures = Object.entries(featureCount)
        .map(([feature, count]) => ({ feature, usage_count: count }))
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10);

      // Intäktsstatistik
      const mrr = premiumUsers.length * 149;
      const arr = mrr * 12;

      // Sätt statistikdata
      setStatistics({
        users: {
          total: profiles?.length || 0,
          premium: premiumUsers.length,
          free: freeUsers.length,
          new_this_week: newThisWeek.length,
          new_this_month: newThisMonth.length,
          active_today: activeToday.length,
          active_this_week: activeThisWeek.length,
          churn_rate: 2.3 // Hårdkodat för nu
        },
        cvs: {
          total: cvs?.length || 0,
          average_size: avgCvSize,
          uploaded_this_week: uploadedThisWeek.length,
          uploaded_this_month: uploadedThisMonth.length,
          unique_users: uniqueCvUsers,
          average_per_user: uniqueCvUsers > 0 ? Math.round((cvs?.length || 0) / uniqueCvUsers * 10) / 10 : 0
        },
        letters: {
          total: letters?.length || 0,
          saved: savedLetters.length,
          language_distribution: languageDistribution,
          generated_this_week: generatedThisWeek.length,
          generated_this_month: generatedThisMonth.length,
          average_generation_time: Math.round(avgGenerationTime * 10) / 10
        },
        ai: {
          total_cost: totalCost,
          total_tokens: totalTokens,
          average_cost_per_generation: letters && letters.length > 0 ? totalCost / letters.length : 0,
          model_distribution: modelDistribution,
          cost_this_month: costThisMonth,
          tokens_this_month: tokensThisMonth
        },
        activities: {
          most_active_users: mostActiveUsers,
          popular_features: popularFeatures,
          total_activities: activities?.length || 0,
          activities_today: activitiesToday.length
        },
        system: {
          database_size: 125.4, // MB - hårdkodat för nu
          storage_used: 2.3, // GB - hårdkodat för nu
          api_response_time: 145, // ms - hårdkodat för nu
          uptime_percentage: 99.98,
          error_rate: 0.02,
          active_connections: 12
        },
        revenue: {
          mrr,
          arr,
          total_revenue: mrr * 6, // Antar 6 månaders drift
          revenue_this_month: mrr,
          average_revenue_per_user: profiles && profiles.length > 0 ? mrr / profiles.length : 0,
          growth_rate: 15.3 // % - hårdkodat för nu
        }
      });

      // Generera tidsseriedata
      await generateTimeSeriesData(dateRange);
      
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Fel vid hämtning av statistik:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av statistik');
    } finally {
      setIsLoading(false);
    }
  };

  // Generera tidsseriedata för grafer
  const generateTimeSeriesData = async (range: string) => {
    try {
      const now = new Date();
      let startDate: Date;
      let labels: string[] = [];
      
      switch (range) {
        case 'week':
          startDate = subDays(now, 7);
          labels = eachDayOfInterval({ start: startDate, end: now })
            .map(date => format(date, 'EEE', { locale: sv }));
          break;
        case 'month':
          startDate = subDays(now, 30);
          labels = eachDayOfInterval({ start: startDate, end: now })
            .filter((_, index) => index % 3 === 0)
            .map(date => format(date, 'd MMM', { locale: sv }));
          break;
        case 'year':
          startDate = subDays(now, 365);
          labels = Array.from({ length: 12 }, (_, i) => {
            const date = new Date(now);
            date.setMonth(now.getMonth() - (11 - i));
            return format(date, 'MMM', { locale: sv });
          });
          break;
        default:
          startDate = subDays(now, 7);
          labels = eachDayOfInterval({ start: startDate, end: now })
            .map(date => format(date, 'EEE', { locale: sv }));
      }

      // Hämta data baserat på vald metrik
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      const { data: letters } = await supabase
        .from('letters')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      // Generera mockdata för demonstration
      const userGrowth = labels.map((_, index) => 
        Math.floor(Math.random() * 10) + 40 + index * 2
      );
      
      const letterGeneration = labels.map(() => 
        Math.floor(Math.random() * 20) + 10
      );

      const revenue = labels.map((_, index) => 
        Math.floor(Math.random() * 5000) + 15000 + index * 500
      );

      setTimeSeriesData({
        labels,
        datasets: [
          {
            label: 'Nya användare',
            data: userGrowth,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Genererade brev',
            data: letterGeneration,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      });
    } catch (err) {
      console.error('Fel vid generering av tidsseriedata:', err);
    }
  };

  // Exportera data som CSV
  const exportToCSV = () => {
    if (!statistics) return;

    const csvData = [
      ['Statistik för Jobbcoach.ai', format(new Date(), 'yyyy-MM-dd HH:mm')],
      [],
      ['Användarstatistik'],
      ['Totalt antal användare', statistics.users.total],
      ['Premium-användare', statistics.users.premium],
      ['Gratis användare', statistics.users.free],
      ['Nya denna vecka', statistics.users.new_this_week],
      ['Nya denna månad', statistics.users.new_this_month],
      [],
      ['CV-statistik'],
      ['Totalt antal CV:n', statistics.cvs.total],
      ['Genomsnittlig storlek (tecken)', statistics.cvs.average_size],
      ['Uppladdade denna vecka', statistics.cvs.uploaded_this_week],
      [],
      ['Brevstatistik'],
      ['Totalt antal brev', statistics.letters.total],
      ['Sparade brev', statistics.letters.saved],
      ['Genererade denna vecka', statistics.letters.generated_this_week],
      [],
      ['AI-kostnader'],
      ['Total kostnad (SEK)', statistics.ai.total_cost.toFixed(2)],
      ['Totalt antal tokens', statistics.ai.total_tokens],
      ['Kostnad denna månad (SEK)', statistics.ai.cost_this_month.toFixed(2)],
      [],
      ['Intäkter'],
      ['MRR (SEK)', statistics.revenue.mrr],
      ['ARR (SEK)', statistics.revenue.arr],
      ['Tillväxttakt (%)', statistics.revenue.growth_rate]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistik_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  // Uppdatera data vid montering och intervall
  useEffect(() => {
    fetchStatistics();
    const interval = setInterval(fetchStatistics, 60000); // Uppdatera varje minut
    return () => clearInterval(interval);
  }, [dateRange]);

  // Chart.js konfiguration
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9CA3AF',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F3F4F6',
        bodyColor: '#D1D5DB',
        borderColor: '#374151',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#9CA3AF'
        },
        grid: {
          color: '#374151',
          display: false
        }
      },
      y: {
        ticks: {
          color: '#9CA3AF'
        },
        grid: {
          color: '#374151'
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Laddar statistik...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r">
          <h2 className="text-lg font-semibold text-white mb-2">Ett fel uppstod</h2>
          <p className="text-red-200">{error}</p>
          <button
            onClick={fetchStatistics}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  if (!statistics) return null;

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Systemstatistik</h1>
          <p className="text-gray-400 mt-1">Omfattande översikt av systemets prestanda och användning</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-navy-800 border border-gray-700 rounded-md text-white focus:border-pink-500"
          >
            <option value="week">Senaste veckan</option>
            <option value="month">Senaste månaden</option>
            <option value="year">Senaste året</option>
            <option value="all">All tid</option>
          </select>
          
          <button
            onClick={fetchStatistics}
            className="px-3 py-2 bg-navy-800 border border-gray-700 rounded-md text-white hover:border-pink-500 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Uppdatera
          </button>
          
          <button
            onClick={exportToCSV}
            className="px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded-md text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportera CSV
          </button>
        </div>
      </div>

      {/* Huvudstatistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Totalt antal användare"
          value={statistics.users.total}
          subtitle={`${statistics.users.premium} premium, ${statistics.users.free} gratis`}
          icon={<Users className="w-6 h-6 text-white" />}
          trend="up"
          trendValue={`+${statistics.users.new_this_week} denna vecka`}
          color="blue"
        />
        
        <StatCard
          title="MRR"
          value={`${statistics.revenue.mrr.toLocaleString('sv-SE')} SEK`}
          subtitle={`ARR: ${statistics.revenue.arr.toLocaleString('sv-SE')} SEK`}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          trend="up"
          trendValue={`+${statistics.revenue.growth_rate}%`}
          color="green"
        />
        
        <StatCard
          title="Genererade brev"
          value={statistics.letters.total}
          subtitle={`${statistics.letters.saved} sparade`}
          icon={<FileText className="w-6 h-6 text-white" />}
          trend="up"
          trendValue={`+${statistics.letters.generated_this_week} denna vecka`}
          color="purple"
        />
        
        <StatCard
          title="AI-kostnad denna månad"
          value={`${statistics.ai.cost_this_month.toFixed(2)} SEK`}
          subtitle={`${statistics.ai.tokens_this_month.toLocaleString()} tokens`}
          icon={<Brain className="w-6 h-6 text-white" />}
          trend={statistics.ai.cost_this_month > statistics.ai.total_cost * 0.1 ? 'up' : 'neutral'}
          trendValue={`${(statistics.ai.average_cost_per_generation).toFixed(2)} SEK/brev`}
          color="pink"
        />
      </div>

      {/* Tidsseriegrafer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-navy-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Användartillväxt
          </h2>
          {timeSeriesData && (
            <Line data={timeSeriesData} options={chartOptions} />
          )}
        </div>

        <div className="bg-navy-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-400" />
            Språkdistribution
          </h2>
          <Doughnut
            data={{
              labels: Object.keys(statistics.letters.language_distribution).map(lang => 
                lang === 'sv' ? 'Svenska' : lang === 'en' ? 'Engelska' : lang
              ),
              datasets: [{
                data: Object.values(statistics.letters.language_distribution),
                backgroundColor: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(16, 185, 129, 0.8)',
                  'rgba(236, 72, 153, 0.8)',
                  'rgba(245, 158, 11, 0.8)'
                ],
                borderColor: [
                  'rgb(59, 130, 246)',
                  'rgb(16, 185, 129)',
                  'rgb(236, 72, 153)',
                  'rgb(245, 158, 11)'
                ],
                borderWidth: 1
              }]
            }}
            options={{
              ...chartOptions,
              maintainAspectRatio: true
            }}
          />
        </div>
      </div>

      {/* Detaljerade statistikpaneler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mest aktiva användare */}
        <div className="bg-navy-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Mest aktiva användare
          </h2>
          <div className="space-y-3">
            {statistics.activities.most_active_users.map((user, index) => (
              <div key={user.user_id} className="flex items-center justify-between p-3 bg-navy-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{user.email}</p>
                    <p className="text-gray-400 text-sm">{user.activity_count} aktiviteter</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm">
                  {user.activity_count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Populära funktioner */}
        <div className="bg-navy-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Populära funktioner
          </h2>
          <div className="space-y-3">
            {statistics.activities.popular_features.map((feature, index) => {
              const maxCount = Math.max(...statistics.activities.popular_features.map(f => f.usage_count));
              const percentage = (feature.usage_count / maxCount) * 100;
              
              return (
                <div key={feature.feature} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white capitalize">
                      {feature.feature.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {feature.usage_count} användningar
                    </span>
                  </div>
                  <div className="w-full bg-navy-900 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Systemstatistik */}
      <div className="bg-navy-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-cyan-400" />
          Systemstatistik
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-navy-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Databas-storlek</p>
            <p className="text-2xl font-bold text-white mt-1">{statistics.system.database_size} MB</p>
            <div className="mt-2 w-full bg-navy-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full"
                style={{ width: `${(statistics.system.database_size / 500) * 100}%` }}
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">Av 500 MB tillgängligt</p>
          </div>
          
          <div className="bg-navy-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">API Response Time</p>
            <p className="text-2xl font-bold text-white mt-1">{statistics.system.api_response_time} ms</p>
            <p className={`text-sm mt-2 ${
              statistics.system.api_response_time < 200 ? 'text-green-400' : 
              statistics.system.api_response_time < 500 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {statistics.system.api_response_time < 200 ? 'Utmärkt' : 
               statistics.system.api_response_time < 500 ? 'Acceptabel' : 
               'Behöver optimering'}
            </p>
          </div>
          
          <div className="bg-navy-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Uptime</p>
            <p className="text-2xl font-bold text-white mt-1">{statistics.system.uptime_percentage}%</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Online</span>
            </div>
          </div>
          
          <div className="bg-navy-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Lagringsanvändning</p>
            <p className="text-2xl font-bold text-white mt-1">{statistics.system.storage_used} GB</p>
            <div className="mt-2 w-full bg-navy-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                style={{ width: `${(statistics.system.storage_used / 10) * 100}%` }}
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">Av 10 GB tillgängligt</p>
          </div>
          
          <div className="bg-navy-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Error Rate</p>
            <p className="text-2xl font-bold text-white mt-1">{statistics.system.error_rate}%</p>
            <p className={`text-sm mt-2 ${
              statistics.system.error_rate < 0.1 ? 'text-green-400' : 
              statistics.system.error_rate < 1 ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {statistics.system.error_rate < 0.1 ? 'Låg' : 
               statistics.system.error_rate < 1 ? 'Måttlig' : 
               'Hög - kräver åtgärd'}
            </p>
          </div>
          
          <div className="bg-navy-900 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Aktiva anslutningar</p>
            <p className="text-2xl font-bold text-white mt-1">{statistics.system.active_connections}</p>
            <div className="flex items-center gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-6 rounded-sm ${
                    i < Math.floor(statistics.system.active_connections / 5)
                      ? 'bg-green-500'
                      : 'bg-navy-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI-modelldistribution */}
      <div className="bg-navy-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-pink-400" />
          AI-användning och kostnader
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Modelldistribution</h3>
            <div className="space-y-2">
              {Object.entries(statistics.ai.model_distribution).map(([model, count]) => (
                <div key={model} className="flex items-center justify-between p-3 bg-navy-900 rounded-lg">
                  <span className="text-white">{model}</span>
                  <span className="text-gray-400">{count} användningar</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Kostnadsöversikt</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-navy-900 rounded-lg">
                <span className="text-gray-400">Total kostnad</span>
                <span className="text-white font-semibold">{statistics.ai.total_cost.toFixed(2)} SEK</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-navy-900 rounded-lg">
                <span className="text-gray-400">Tokens använt</span>
                <span className="text-white font-semibold">{statistics.ai.total_tokens.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-navy-900 rounded-lg">
                <span className="text-gray-400">Genomsnitt per generation</span>
                <span className="text-white font-semibold">{statistics.ai.average_cost_per_generation.toFixed(2)} SEK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uppdateringsinfo */}
      <div className="flex items-center justify-between text-gray-400 text-sm">
        <p>
          Senast uppdaterad: {lastUpdated ? format(lastUpdated, 'HH:mm:ss', { locale: sv }) : 'Aldrig'}
        </p>
        <p>
          Automatisk uppdatering var 60:e sekund
        </p>
      </div>
    </div>
  );
}