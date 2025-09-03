// src/app/admin/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  MousePointer, 
  Clock, 
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { seoAnalyticsService } from '@/lib/seo/analytics-service';

interface AnalyticsData {
  traffic: {
    total_sessions: number;
    unique_users: number;
    pageviews: number;
    bounce_rate: number;
    avg_session_duration: number;
    pages_per_session: number;
    change_from_previous: {
      sessions: number;
      users: number;
      pageviews: number;
    };
  };
  sources: Array<{
    source: string;
    sessions: number;
    percentage: number;
    conversions: number;
    conversion_rate: number;
  }>;
  topPages: Array<{
    page: string;
    title: string;
    pageviews: number;
    unique_pageviews: number;
    avg_time_on_page: number;
    bounce_rate: number;
    conversions: number;
  }>;
  userJourneys: {
    avg_pages_per_session: number;
    most_common_entry_pages: Array<{page: string, percentage: number}>;
    most_common_exit_pages: Array<{page: string, percentage: number}>;
    conversion_paths: Array<{path: string[], conversions: number}>;
  };
  realTime: {
    active_users: number;
    top_pages_now: Array<{page: string, active_users: number}>;
    traffic_sources_now: Array<{source: string, active_users: number}>;
  };
}

// Analytics Metric Card
function AnalyticsCard({ 
  title, 
  value, 
  change, 
  icon, 
  format = 'number',
  color = 'blue' 
}: {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  format?: 'number' | 'percentage' | 'time';
  color?: 'blue' | 'green' | 'yellow' | 'purple';
}) {
  const formatValue = (val: number | string, fmt: string) => {
    if (typeof val === 'string') return val;
    switch (fmt) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'time':
        return `${Math.floor(val / 60)}m ${Math.round(val % 60)}s`;
      default:
        return val.toLocaleString();
    }
  };

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <h3 className="text-2xl font-bold text-white mb-2">
            {formatValue(value, format)}
          </h3>
          
          {change !== undefined && (
            <div className={`flex items-center text-sm ${
              change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${change < 0 ? 'rotate-180' : ''}`} />
              <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
            </div>
          )}
        </div>
        
        <div className={`bg-gradient-to-r ${colorClasses[color]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Traffic Sources Chart Component
function TrafficSourcesChart({ sources }: { sources: AnalyticsData['sources'] }) {
  return (
    <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Trafikkällor</h3>
        <PieChart className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="space-y-4">
        {sources.map((source, index) => (
          <div key={source.source} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className={`w-3 h-3 rounded-full bg-gradient-to-r ${
                  index === 0 ? 'from-blue-400 to-blue-600' :
                  index === 1 ? 'from-green-400 to-green-600' :
                  index === 2 ? 'from-yellow-400 to-yellow-600' :
                  index === 3 ? 'from-purple-400 to-purple-600' :
                  'from-gray-400 to-gray-600'
                }`}
              />
              <span className="text-white font-medium capitalize">{source.source}</span>
            </div>
            
            <div className="text-right">
              <div className="text-white font-semibold">
                {source.sessions.toLocaleString()} ({source.percentage.toFixed(1)}%)
              </div>
              <div className="text-sm text-gray-400">
                {source.conversions} konverteringar ({source.conversion_rate.toFixed(1)}%)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Top Pages Component
function TopPagesTable({ pages }: { pages: AnalyticsData['topPages'] }) {
  return (
    <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Toppresulterande Sidor</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 pb-3">Sida</th>
              <th className="text-right text-gray-400 pb-3">Visningar</th>
              <th className="text-right text-gray-400 pb-3">Unika</th>
              <th className="text-right text-gray-400 pb-3">Tid på sida</th>
              <th className="text-right text-gray-400 pb-3">Studsfrekvens</th>
              <th className="text-right text-gray-400 pb-3">Konverteringar</th>
            </tr>
          </thead>
          <tbody>
            {pages.slice(0, 10).map((page, index) => (
              <tr key={page.page} className="border-b border-gray-700/50">
                <td className="py-3">
                  <div>
                    <div className="text-white font-medium truncate max-w-xs">
                      {page.title}
                    </div>
                    <div className="text-gray-400 text-xs truncate max-w-xs">
                      {page.page}
                    </div>
                  </div>
                </td>
                <td className="text-right text-white py-3">
                  {page.pageviews.toLocaleString()}
                </td>
                <td className="text-right text-white py-3">
                  {page.unique_pageviews.toLocaleString()}
                </td>
                <td className="text-right text-white py-3">
                  {Math.floor(page.avg_time_on_page / 60)}m {Math.round(page.avg_time_on_page % 60)}s
                </td>
                <td className="text-right text-white py-3">
                  {page.bounce_rate.toFixed(1)}%
                </td>
                <td className="text-right text-white py-3">
                  {page.conversions}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Real-time Activity Component
function RealTimeActivity({ realTime }: { realTime: AnalyticsData['realTime'] }) {
  return (
    <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Realtidsaktivitet
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm">Live</span>
        </div>
      </div>
      
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-white">
          {realTime.active_users}
        </div>
        <div className="text-gray-400 text-sm">Aktiva användare nu</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-white font-medium mb-3">Aktiva sidor</h4>
          <div className="space-y-2">
            {realTime.top_pages_now.slice(0, 5).map((page, index) => (
              <div key={page.page} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm truncate max-w-[150px]">
                  {page.page}
                </span>
                <span className="text-white font-medium">
                  {page.active_users}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-medium mb-3">Trafikkällor</h4>
          <div className="space-y-2">
            {realTime.traffic_sources_now.slice(0, 5).map((source, index) => (
              <div key={source.source} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm capitalize">
                  {source.source}
                </span>
                <span className="text-white font-medium">
                  {source.active_users}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Här skulle vi hämta riktiga analytics data
      // För nu använder vi mockdata
      const mockData: AnalyticsData = {
        traffic: {
          total_sessions: 12547,
          unique_users: 8432,
          pageviews: 45623,
          bounce_rate: 42.3,
          avg_session_duration: 185,
          pages_per_session: 2.8,
          change_from_previous: {
            sessions: 12.5,
            users: 8.9,
            pageviews: 15.2
          }
        },
        sources: [
          { source: 'organic', sessions: 7834, percentage: 62.4, conversions: 234, conversion_rate: 2.99 },
          { source: 'direct', sessions: 2341, percentage: 18.7, conversions: 89, conversion_rate: 3.8 },
          { source: 'referral', sessions: 1456, percentage: 11.6, conversions: 45, conversion_rate: 3.09 },
          { source: 'social', sessions: 916, percentage: 7.3, conversions: 12, conversion_rate: 1.31 }
        ],
        topPages: [
          {
            page: '/artiklar/cv-mall-pdf-gratis',
            title: 'CV-mall PDF gratis - Professionella mallar',
            pageviews: 8932,
            unique_pageviews: 7234,
            avg_time_on_page: 245,
            bounce_rate: 35.2,
            conversions: 89
          },
          {
            page: '/artiklar/personligt-brev-exempel-generella',
            title: 'Personligt brev exempel - Inspirerande mallar',
            pageviews: 6745,
            unique_pageviews: 5432,
            avg_time_on_page: 198,
            bounce_rate: 41.8,
            conversions: 67
          }
        ],
        userJourneys: {
          avg_pages_per_session: 2.8,
          most_common_entry_pages: [
            { page: '/artiklar/cv-mall-pdf-gratis', percentage: 23.4 },
            { page: '/artiklar/skriva-cv-guide', percentage: 18.9 }
          ],
          most_common_exit_pages: [
            { page: '/cv-generator', percentage: 34.2 },
            { page: '/personligt-brev-generator', percentage: 28.7 }
          ],
          conversion_paths: [
            { path: ['/artiklar/cv-mall-pdf-gratis', '/cv-generator'], conversions: 156 },
            { path: ['/artiklar/personligt-brev-exempel-generella', '/personligt-brev-generator'], conversions: 89 }
          ]
        },
        realTime: {
          active_users: 47,
          top_pages_now: [
            { page: '/artiklar/cv-mall-pdf-gratis', active_users: 12 },
            { page: '/cv-generator', active_users: 8 },
            { page: '/artiklar/personligt-brev-exempel-generella', active_users: 6 }
          ],
          traffic_sources_now: [
            { source: 'organic', active_users: 28 },
            { source: 'direct', active_users: 12 },
            { source: 'referral', active_users: 7 }
          ]
        }
      };
      
      setAnalyticsData(mockData);
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av analytics-data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Laddar analytics-data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r">
        <h2 className="text-lg font-semibold text-white mb-2">Ett fel uppstod</h2>
        <p className="text-red-200">{error}</p>
        <button 
          onClick={fetchAnalyticsData}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Försök igen
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Ingen analytics-data tillgänglig</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Djup analys av webbplatstrafik och användarresor</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            className="bg-navy-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
            value={`${dateRange.start}_${dateRange.end}`}
            onChange={(e) => {
              const [start, end] = e.target.value.split('_');
              setDateRange({ start, end });
            }}
          >
            <option value={`${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}_${new Date().toISOString().split('T')[0]}`}>
              Senaste 7 dagarna
            </option>
            <option value={`${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}_${new Date().toISOString().split('T')[0]}`}>
              Senaste 30 dagarna
            </option>
            <option value={`${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}_${new Date().toISOString().split('T')[0]}`}>
              Senaste 90 dagarna
            </option>
          </select>
          
          <button 
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Uppdatera
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Totala Sessioner"
          value={analyticsData.traffic.total_sessions}
          change={analyticsData.traffic.change_from_previous.sessions}
          icon={<BarChart3 className="w-6 h-6 text-white" />}
          color="blue"
        />
        
        <AnalyticsCard
          title="Unika Användare"
          value={analyticsData.traffic.unique_users}
          change={analyticsData.traffic.change_from_previous.users}
          icon={<Users className="w-6 h-6 text-white" />}
          color="green"
        />
        
        <AnalyticsCard
          title="Sidvisningar"
          value={analyticsData.traffic.pageviews}
          change={analyticsData.traffic.change_from_previous.pageviews}
          icon={<MousePointer className="w-6 h-6 text-white" />}
          color="yellow"
        />
        
        <AnalyticsCard
          title="Genomsnittlig Sessionstid"
          value={analyticsData.traffic.avg_session_duration}
          format="time"
          icon={<Clock className="w-6 h-6 text-white" />}
          color="purple"
        />
      </div>

      {/* Traffic Sources and Real-time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficSourcesChart sources={analyticsData.sources} />
        <RealTimeActivity realTime={analyticsData.realTime} />
      </div>

      {/* Top Pages Table */}
      <TopPagesTable pages={analyticsData.topPages} />
    </div>
  );
}