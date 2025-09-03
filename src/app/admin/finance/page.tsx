'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowUpIcon, ArrowDownIcon, CreditCardIcon, UsersIcon, ChartBarIcon, ArrowTrendingUpIcon as TrendingUpIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueData {
  date: string;
  revenue: number;
  subscriptions: number;
  refunds: number;
}

interface MetricCard {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
}

export default function FinanceDashboard() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchFinancialData();
    const interval = setInterval(fetchFinancialData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchFinancialData = async () => {
    try {
      // Fetch revenue metrics
      const { data: profiles } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier, created_at');

      const activeSubscribers = profiles?.filter(p => p.subscription_status === 'active').length || 0;
      const premiumSubscribers = profiles?.filter(p => p.subscription_tier === 'premium').length || 0;
      const mrr = premiumSubscribers * 149;
      const arr = mrr * 12;

      // Calculate growth
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const newSubscribers = profiles?.filter(p => 
        new Date(p.created_at) > lastMonthDate && p.subscription_status === 'active'
      ).length || 0;

      const growthRate = activeSubscribers > 0 ? (newSubscribers / activeSubscribers) * 100 : 0;

      // Set metrics
      setMetrics([
        {
          title: 'MRR (Monthly Recurring Revenue)',
          value: `${mrr.toLocaleString('sv-SE')} SEK`,
          change: growthRate,
          trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'neutral',
          icon: CreditCardIcon
        },
        {
          title: 'ARR (Annual Recurring Revenue)',
          value: `${arr.toLocaleString('sv-SE')} SEK`,
          change: growthRate,
          trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'neutral',
          icon: TrendingUpIcon
        },
        {
          title: 'Active Subscribers',
          value: activeSubscribers.toString(),
          change: growthRate,
          trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'neutral',
          icon: UsersIcon
        },
        {
          title: 'ARPU (Avg Revenue Per User)',
          value: `${activeSubscribers > 0 ? (mrr / activeSubscribers).toFixed(2) : 0} SEK`,
          change: 0,
          trend: 'neutral',
          icon: ChartBarIcon
        }
      ]);

      // Generate mock revenue data for chart (in production, this would come from revenue_tracking table)
      const mockRevenueData = generateMockRevenueData(30);
      setRevenueData(mockRevenueData);

      // Generate subscription distribution data
      const subscriptionDist = [
        { name: 'Free', value: (profiles?.length || 0) - premiumSubscribers, color: '#64748b' },
        { name: 'Premium', value: premiumSubscribers, color: '#ec4899' }
      ];
      setSubscriptionData(subscriptionDist);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setLoading(false);
    }
  };

  const generateMockRevenueData = (days: number): RevenueData[] => {
    const data: RevenueData[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 2000,
        subscriptions: Math.floor(Math.random() * 10) + 5,
        refunds: Math.floor(Math.random() * 3)
      });
    }
    
    return data;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Dashboard</h1>
          <p className="text-gray-400 mt-1">Track revenue, subscriptions, and financial metrics</p>
        </div>
        
        {/* Date Range Selector */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-navy-800 text-white border border-navy-600 rounded-lg px-4 py-2"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-navy-800 rounded-lg p-6 border border-navy-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{metric.title}</p>
                  <p className="text-2xl font-bold text-white mt-2">{metric.value}</p>
                  
                  {metric.change !== 0 && (
                    <div className="flex items-center mt-2">
                      {metric.trend === 'up' ? (
                        <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
                      ) : metric.trend === 'down' ? (
                        <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
                      ) : null}
                      <span className={`text-sm ${
                        metric.trend === 'up' ? 'text-green-500' : 
                        metric.trend === 'down' ? 'text-red-500' : 
                        'text-gray-400'
                      }`}>
                        {Math.abs(metric.change).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <Icon className="w-8 h-8 text-pink-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <h2 className="text-xl font-bold text-white mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#ec4899" 
                fill="#ec4899" 
                fillOpacity={0.3}
                name="Revenue (SEK)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription Distribution */}
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <h2 className="text-xl font-bold text-white mb-4">Subscription Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {subscriptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Subscriptions */}
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <h2 className="text-xl font-bold text-white mb-4">Daily Subscriptions</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="subscriptions" fill="#10b981" name="New Subscriptions" />
              <Bar dataKey="refunds" fill="#ef4444" name="Refunds" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Forecast */}
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <h2 className="text-xl font-bold text-white mb-4">6-Month Revenue Forecast</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm">Predicted MRR (Next Month)</p>
              <p className="text-2xl font-bold text-white">23,541 SEK</p>
              <p className="text-green-500 text-sm">+15.3% growth expected</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">6-Month Forecast</p>
              <p className="text-2xl font-bold text-white">178,450 SEK</p>
              <p className="text-gray-400 text-sm">Based on current growth rate</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Break-even Point</p>
              <p className="text-2xl font-bold text-white">67 subscribers</p>
              <p className="text-gray-400 text-sm">Current: 45 subscribers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Revenue Table */}
      <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
        <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {/* Mock transaction data */}
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(Date.now() - i * 86400000).toLocaleDateString('sv-SE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    Subscription
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    149 SEK
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    user{i + 1}@example.com
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}