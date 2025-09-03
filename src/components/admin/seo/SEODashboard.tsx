// src/components/admin/seo/SEODashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Globe, 
  Users, 
  MousePointer, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Eye,
  Target,
  Zap
} from 'lucide-react';
import { seoAnalyticsService } from '@/lib/seo/analytics-service';

// Type definitions
interface SEODashboardData {
  seoPerformance: {
    organic_traffic: number;
    organic_conversions: number;
    organic_conversion_rate: number;
    bounce_rate: number;
    avg_session_duration: number;
    change_percentage: number;
  };
  topKeywords: Array<{
    keyword: string;
    position: number;
    change: number;
    search_volume: number;
    clicks: number;
  }>;
  contentPerformance: Array<{
    title: string;
    slug: string;
    pageviews: number;
    organic_traffic: number;
    conversions: number;
    conversion_rate: number;
  }>;
  webVitals: {
    overall_score: number;
    lcp_avg: number;
    fid_avg: number;
    cls_avg: number;
    grade: 'good' | 'needs-improvement' | 'poor';
  };
  technicalIssues: Array<{
    type: string;
    count: number;
    severity: 'critical' | 'warning' | 'info';
  }>;
}

// SEO Metric Card Component
function SEOMetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  format = 'number',
  suffix = '' 
}: {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  format?: 'number' | 'percentage' | 'time';
  suffix?: string;
}) {
  const formatValue = (val: number, fmt: string, suf: string) => {
    switch (fmt) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'time':
        return `${Math.round(val / 60)}m ${Math.round(val % 60)}s`;
      default:
        return val.toLocaleString() + suf;
    }
  };

  const changeColor = change === undefined ? 'text-gray-400' : 
    change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400';
  
  const ChangeIcon = change === undefined ? Clock :
    change > 0 ? TrendingUp : change < 0 ? TrendingDown : Clock;

  return (
    <div className="bg-navy-800 rounded-lg p-6 border border-gray-700 hover:border-pink-500 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-2xl font-bold text-white mb-3">
            {formatValue(value, format, suffix)}
          </h3>
          
          {change !== undefined && (
            <div className={`flex items-center text-sm ${changeColor}`}>
              <ChangeIcon className="w-4 h-4 mr-1" />
              <span>
                {change > 0 ? '+' : ''}{change.toFixed(1)}% från förra perioden
              </span>
            </div>
          )}
        </div>
        
        <div className="bg-navy-700 p-3 rounded-lg flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Core Web Vitals Component
function CoreWebVitalsCard({ webVitals }: { webVitals: SEODashboardData['webVitals'] }) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'good': return 'text-green-400';
      case 'needs-improvement': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'good': return <CheckCircle className="w-5 h-5" />;
      case 'needs-improvement': return <AlertTriangle className="w-5 h-5" />;
      case 'poor': return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Core Web Vitals</h3>
        <div className={`flex items-center gap-2 ${getGradeColor(webVitals.grade)}`}>
          {getGradeIcon(webVitals.grade)}
          <span className="text-sm font-medium capitalize">
            {webVitals.grade.replace('-', ' ')}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Overall Score */}
        <div className="bg-navy-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Overall Performance Score</span>
            <span className="text-white font-bold">{webVitals.overall_score}/100</span>
          </div>
          <div className="w-full bg-navy-600 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                webVitals.overall_score >= 80 ? 'bg-green-400' :
                webVitals.overall_score >= 50 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ width: `${webVitals.overall_score}%` }}
            />
          </div>
        </div>

        {/* Individual Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-white font-semibold">{webVitals.lcp_avg.toFixed(1)}s</div>
            <div className="text-xs text-gray-400 mt-1">LCP</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold">{Math.round(webVitals.fid_avg)}ms</div>
            <div className="text-xs text-gray-400 mt-1">FID</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold">{webVitals.cls_avg.toFixed(3)}</div>
            <div className="text-xs text-gray-400 mt-1">CLS</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Top Keywords Component
function TopKeywordsCard({ keywords }: { keywords: SEODashboardData['topKeywords'] }) {
  return (
    <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Toppkeywords</h3>
      
      <div className="space-y-3">
        {keywords.slice(0, 5).map((keyword, index) => (
          <div key={keyword.keyword} className="flex items-center justify-between p-3 bg-navy-700 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{keyword.keyword}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  keyword.change > 0 ? 'bg-green-500/20 text-green-400' :
                  keyword.change < 0 ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {keyword.change > 0 ? '+' : ''}{keyword.change}
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {keyword.search_volume.toLocaleString()} sökningar/mån
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-white font-semibold">#{keyword.position}</div>
              <div className="text-sm text-gray-400">{keyword.clicks} klick</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Content Performance Component
function ContentPerformanceCard({ content }: { content: SEODashboardData['contentPerformance'] }) {
  return (
    <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Bästa Artiklar</h3>
        <div className="text-sm text-gray-400">Senaste 30 dagarna</div>
      </div>
      
      <div className="space-y-3">
        {content.slice(0, 5).map((article, index) => (
          <div key={article.slug} className="p-4 bg-navy-700 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate mb-2">{article.title}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Visningar: </span>
                    <span className="text-white font-medium">{article.pageviews.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Organisk trafik: </span>
                    <span className="text-white font-medium">{article.organic_traffic.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Konverteringar: </span>
                    <span className="text-white font-medium">{article.conversions}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Konverteringsgrad: </span>
                    <span className="text-white font-medium">{article.conversion_rate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Technical Issues Component
function TechnicalIssuesCard({ issues }: { issues: SEODashboardData['technicalIssues'] }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <CheckCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const totalIssues = issues.reduce((sum, issue) => sum + issue.count, 0);

  return (
    <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Tekniska Problem</h3>
        <div className="text-sm text-gray-400">{totalIssues} totalt</div>
      </div>
      
      {issues.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
          <p className="text-gray-400">Inga tekniska problem hittade!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue, index) => (
            <div key={issue.type} className={`flex items-center justify-between p-3 bg-navy-700 rounded-lg border-l-4 border-l-${
              issue.severity === 'critical' ? 'red' : 
              issue.severity === 'warning' ? 'yellow' : 'blue'
            }-400`}>
              <div className="flex items-center gap-3">
                <div className={getSeverityColor(issue.severity)}>
                  {getSeverityIcon(issue.severity)}
                </div>
                <div>
                  <div className="text-white font-medium capitalize">
                    {issue.type.replace('-', ' ')}
                  </div>
                  <div className="text-sm text-gray-400 capitalize">
                    {issue.severity} severity
                  </div>
                </div>
              </div>
              
              <div className={`text-lg font-bold ${getSeverityColor(issue.severity)}`}>
                {issue.count}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main SEO Dashboard Component
export default function SEODashboard() {
  const [dashboardData, setDashboardData] = useState<SEODashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await seoAnalyticsService.getDashboardData(dateRange);
      
      if (data) {
        setDashboardData(data as any);
      } else {
        throw new Error('Kunde inte hämta SEO-data');
      }
    } catch (err: any) {
      console.error('Error fetching SEO dashboard data:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av SEO-data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Laddar SEO-statistik...</p>
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
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Försök igen
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Ingen SEO-data tillgänglig</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">SEO Dashboard</h1>
          <p className="text-gray-400 mt-1">Organisk prestanda och innehållsanalys</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            className="bg-navy-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-pink-500"
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
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Uppdatera
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SEOMetricCard
          title="Organisk Trafik"
          value={dashboardData.seoPerformance.organic_traffic}
          change={dashboardData.seoPerformance.change_percentage}
          icon={<Users className="w-6 h-6 text-blue-400" />}
        />
        
        <SEOMetricCard
          title="Organiska Konverteringar"
          value={dashboardData.seoPerformance.organic_conversions}
          icon={<Target className="w-6 h-6 text-green-400" />}
        />
        
        <SEOMetricCard
          title="Konverteringsgrad"
          value={dashboardData.seoPerformance.organic_conversion_rate}
          format="percentage"
          icon={<BarChart3 className="w-6 h-6 text-yellow-400" />}
        />
        
        <SEOMetricCard
          title="Genomsnittlig Sessionstid"
          value={dashboardData.seoPerformance.avg_session_duration}
          format="time"
          icon={<Clock className="w-6 h-6 text-purple-400" />}
        />
      </div>

      {/* Core Web Vitals & Technical Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoreWebVitalsCard webVitals={dashboardData.webVitals} />
        <TechnicalIssuesCard issues={dashboardData.technicalIssues} />
      </div>

      {/* Keywords & Content Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopKeywordsCard keywords={dashboardData.topKeywords} />
        <ContentPerformanceCard content={dashboardData.contentPerformance} />
      </div>
    </div>
  );
}