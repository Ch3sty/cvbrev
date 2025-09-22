'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { ArrowUpIcon, ArrowDownIcon, CreditCardIcon, UsersIcon, ChartBarIcon, ArrowTrendingUpIcon as TrendingUpIcon, BanknotesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { sv } from 'date-fns/locale';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  subtitle?: string;
}

export default function FinanceDashboard() {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);
  const [transactionData, setTransactionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [stripeData, setStripeData] = useState<any>(null);
  const [openaiData, setOpenaiData] = useState<any>(null);
  const [aiCostData, setAiCostData] = useState({
    totalAICost: 0,
    totalAICostSEK: 0,
    aiCostSource: 'Ingen data',
    lettersCount: 0
  });
  const supabase = getSupabaseClient();

  // Hämta all finansiell data
  const fetchFinancialData = async () => {
    try {
      // Hämta från databas parallellt
      const [
        { data: profiles },
        { data: revenues },
        { data: letters },
        { data: activities }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('revenue_tracking').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('letters').select('ai_cost, ai_tokens, created_at, user_id'),
        supabase.from('user_activity').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      // Hämta Stripe-data
      let stripeRevenue = null;
      try {
        const stripeResponse = await fetch(`/api/admin/stripe-revenue?days=${dateRange}`);
        if (stripeResponse.ok) {
          stripeRevenue = await stripeResponse.json();
          setStripeData(stripeRevenue);
        }
      } catch (error) {
        console.error('Kunde inte hämta Stripe-data:', error);
      }

      // Hämta OpenAI-data
      let openaiUsage = null;
      try {
        const openaiResponse = await fetch(`/api/admin/openai-usage?days=${dateRange}`);
        if (openaiResponse.ok) {
          openaiUsage = await openaiResponse.json();
          setOpenaiData(openaiUsage);
        }
      } catch (error) {
        console.error('Kunde inte hämta OpenAI-data:', error);
      }

      // Beräkna metrics baserat på faktisk data
      // Använd Stripe-data om tillgänglig för prenumeranter
      const activeSubscribers = stripeRevenue?.subscriptions?.active ||
        profiles?.filter(p => p.subscription_status === 'active' || p.subscription_status === 'trialing').length || 0;
      const premiumSubscribers = profiles?.filter(p => p.subscription_tier === 'premium').length || 0;
      const trialSubscribers = stripeRevenue?.subscriptions?.trialing ||
        profiles?.filter(p => p.subscription_status === 'trialing').length || 0;

      // Använd Stripe-data om tillgänglig, annars beräkna från databas
      const mrr = stripeRevenue?.subscriptions?.mrr || (premiumSubscribers * 149);
      const arr = stripeRevenue?.subscriptions?.arr || (mrr * 12);

      // Faktisk total intäkt från Stripe
      const totalRevenue = stripeRevenue?.revenue?.total || 0;
      const netRevenue = stripeRevenue?.revenue?.net || totalRevenue;

      // Beräkna AI-kostnader
      // OpenAI API returnerar USD, letters innehåller redan USD
      let totalAICost = 0;
      let aiCostSource = 'Ingen data';

      // Alltid beräkna från letters först
      const lettersCost = letters?.reduce((sum: number, l: any) =>
        sum + (parseFloat(l.ai_cost?.toString() || '0') || 0), 0) || 0;

      if (openaiUsage?.data?.totalCost && openaiUsage.data.totalCost > 0) {
        // Använd faktisk kostnad från OpenAI API om den finns och är större än 0
        totalAICost = openaiUsage.data.totalCost;
        aiCostSource = 'Faktisk kostnad (OpenAI API)';
      } else if (lettersCost > 0) {
        // Fallback till estimat från letters
        totalAICost = lettersCost;
        aiCostSource = 'Estimat från genererade brev';
      } else if (openaiUsage?.estimatedOnly) {
        // Om vi bara har estimat från OpenAI endpoint
        totalAICost = openaiUsage.data?.totalCost || 0;
        aiCostSource = 'Estimat';
      }

      const totalAICostSEK = totalAICost * 10.5;

      // Sätt AI-kostnad data i state för användning i render
      setAiCostData({
        totalAICost,
        totalAICostSEK,
        aiCostSource,
        lettersCount: letters?.length || 0
      });

      // Beräkna vinst
      const grossProfit = netRevenue - totalAICostSEK;
      const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;

      // Beräkna tillväxt
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      const newSubscribers = profiles?.filter(p =>
        new Date(p.created_at) > lastMonthDate && p.subscription_tier === 'premium'
      ).length || 0;

      const growthRate = activeSubscribers > 5 ? (newSubscribers / activeSubscribers) * 100 : 0;
      const churnRate = stripeRevenue?.subscriptions?.canceled && activeSubscribers > 0 ?
        (stripeRevenue.subscriptions.canceled / (activeSubscribers + stripeRevenue.subscriptions.canceled)) * 100 : 0;

      // Sätt metrics
      setMetrics([
        {
          title: 'Total Intäkter',
          value: `${Math.round(netRevenue).toLocaleString('sv-SE')} kr`,
          change: growthRate,
          trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'neutral',
          icon: BanknotesIcon,
          subtitle: stripeRevenue ? 'Från Stripe API' : 'Estimat'
        },
        {
          title: 'MRR (Månatlig återkommande intäkt)',
          value: `${Math.round(mrr).toLocaleString('sv-SE')} kr`,
          change: growthRate,
          trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'neutral',
          icon: CreditCardIcon,
          subtitle: stripeRevenue?.subscriptions?.active ?
            `${stripeRevenue.subscriptions.active} aktiva prenumeranter (från Stripe)` :
            `${activeSubscribers} aktiva prenumeranter`
        },
        {
          title: 'ARR (Årlig återkommande intäkt)',
          value: `${Math.round(arr).toLocaleString('sv-SE')} kr`,
          change: growthRate,
          trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'neutral',
          icon: TrendingUpIcon,
          subtitle: 'Projicerad årsintäkt'
        },
        {
          title: 'AI-kostnader',
          value: `${Math.round(totalAICostSEK).toLocaleString('sv-SE')} kr`,
          change: 0,
          trend: 'neutral',
          icon: ChartBarIcon,
          subtitle: aiCostSource
        },
        {
          title: 'Bruttovinst',
          value: `${Math.round(grossProfit).toLocaleString('sv-SE')} kr`,
          change: grossMargin,
          trend: grossProfit > 0 ? 'up' : 'down',
          icon: CurrencyDollarIcon,
          subtitle: `${Math.round(grossMargin)}% marginal`
        },
        {
          title: 'Aktiva Prenumeranter',
          value: activeSubscribers.toString(),
          change: growthRate - churnRate,
          trend: growthRate > churnRate ? 'up' : 'down',
          icon: UsersIcon,
          subtitle: `${trialSubscribers} på prov`
        }
      ]);

      // Förbered chart data baserat på dateRange
      const days = parseInt(dateRange);
      const chartDays = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(now, i);
        const dateStr = format(date, 'MMM dd', { locale: sv });
        const dateFormatted = format(date, 'yyyy-MM-dd');

        // Hämta intäkter från Stripe eller databas
        let dayRevenue = 0;
        if (stripeRevenue?.revenue?.byDate) {
          const stripeDay = stripeRevenue.revenue.byDate.find((d: any) => d.date === dateFormatted);
          dayRevenue = stripeDay?.amount || 0;
        } else {
          dayRevenue = revenues?.filter(r => {
            const revDate = new Date(r.created_at);
            return format(revDate, 'yyyy-MM-dd') === dateFormatted;
          }).reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
        }

        // Beräkna AI-kostnader för dagen
        const dayCost = letters?.filter(l => {
          const letterDate = new Date(l.created_at);
          return format(letterDate, 'yyyy-MM-dd') === dateFormatted;
        }).reduce((sum: number, l: any) => sum + (parseFloat(l.ai_cost?.toString() || '0') * 10.5 || 0), 0) || 0;

        // Räkna nya prenumeranter för dagen
        const newSubs = profiles?.filter(p => {
          const createdDate = new Date(p.created_at);
          return format(createdDate, 'yyyy-MM-dd') === dateFormatted && p.subscription_tier === 'premium';
        }).length || 0;

        chartDays.push({
          date: dateStr,
          revenue: Math.round(dayRevenue),
          costs: Math.round(dayCost),
          profit: Math.round(dayRevenue - dayCost),
          subscriptions: newSubs
        });
      }

      setChartData(chartDays);

      // Förbered subscription distribution
      // Använd Stripe-data för korrekt antal premium användare
      const actualPremiumUsers = stripeRevenue?.subscriptions?.active || premiumSubscribers;
      const totalUsers = profiles?.length || 0;
      const freeUsers = Math.max(0, totalUsers - actualPremiumUsers - trialSubscribers);

      const subscriptionDist = [
        {
          name: 'Premium',
          value: actualPremiumUsers,
          color: '#ec4899',
          percentage: totalUsers ? (actualPremiumUsers / totalUsers) * 100 : 0
        },
        {
          name: 'Prov',
          value: trialSubscribers,
          color: '#8b5cf6',
          percentage: totalUsers ? (trialSubscribers / totalUsers) * 100 : 0
        },
        {
          name: 'Gratis',
          value: freeUsers,
          color: '#64748b',
          percentage: totalUsers ? (freeUsers / totalUsers) * 100 : 0
        }
      ];
      setSubscriptionData(subscriptionDist);

      // Hämta senaste transaktioner från Stripe eller databas
      const transactions: Array<{
        date: string;
        type: string;
        amount: number;
        status: string;
        customer: string;
      }> = [];

      // Försök först hämta faktiska transaktioner från revenue_tracking tabellen
      if (revenues && revenues.length > 0) {
        // Använd databas-data
        revenues.slice(0, 10).forEach((rev: any) => {
          transactions.push({
            date: format(new Date(rev.created_at), 'yyyy-MM-dd'),
            type: rev.type === 'subscription' ? 'Prenumeration' : 'Engångsbetalning',
            amount: rev.amount,
            status: rev.status,
            customer: rev.user_id || 'Okänd'
          });
        });
      } else if (stripeRevenue?.customers?.topCustomers) {
        // Om vi har Stripe top customers, använd dem
        stripeRevenue.customers.topCustomers.slice(0, 10).forEach((customer: any, i: number) => {
          transactions.push({
            date: format(subDays(now, i), 'yyyy-MM-dd'),
            type: 'Prenumeration',
            amount: Math.round(customer.totalSpent || 149),
            status: 'completed',
            customer: customer.email || `Kund ${customer.customerId}`
          });
        });
      }
      setTransactionData(transactions);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
    const interval = setInterval(fetchFinancialData, 60000); // Uppdatera varje minut
    return () => clearInterval(interval);
  }, [dateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Custom Tooltip för charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-900 p-3 border border-gray-700 rounded-lg shadow-lg">
          <p className="text-white font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString('sv-SE')} kr
            </p>
          ))}
        </div>
      );
    }
    return null;
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
          <h1 className="text-3xl font-bold text-white">Ekonomisk översikt</h1>
          <p className="text-gray-400 mt-1">Följ intäkter, kostnader och finansiella nyckeltal i realtid</p>
        </div>

        {/* Date Range Selector */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-navy-800 text-white border border-navy-600 rounded-lg px-4 py-2"
        >
          <option value="7">Senaste 7 dagarna</option>
          <option value="30">Senaste 30 dagarna</option>
          <option value="90">Senaste 90 dagarna</option>
          <option value="365">Senaste året</option>
        </select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-navy-800 rounded-lg p-6 border border-navy-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">{metric.title}</p>
                  <p className="text-2xl font-bold text-white mt-2">{metric.value}</p>
                  {metric.subtitle && (
                    <p className="text-gray-500 text-xs mt-1">{metric.subtitle}</p>
                  )}

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
        {/* Revenue vs Costs Trend */}
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <h2 className="text-xl font-bold text-white mb-4">Intäkter vs Kostnader</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Intäkter"
              />
              <Area
                type="monotone"
                dataKey="costs"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Kostnader"
              />
            </AreaChart>
          </ResponsiveContainer>
          {stripeData && (
            <div className="mt-4 p-3 bg-navy-900 rounded-lg">
              <p className="text-xs text-green-400">
                Data från Stripe API | {stripeData.charges?.successful || 0} lyckade transaktioner
              </p>
            </div>
          )}
        </div>

        {/* Subscription Distribution */}
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <h2 className="text-xl font-bold text-white mb-4">Prenumerationsfördelning</h2>
          {subscriptionData.some(d => d.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={subscriptionData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subscriptionData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {subscriptionData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-400">{item.name}:</span>
                    </div>
                    <span className="text-white font-semibold">
                      {item.value} användare ({item.percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[250px]">
              <p className="text-gray-400 text-center">
                Ingen prenumerationsdata tillgänglig
              </p>
            </div>
          )}
        </div>

        {/* Profit Trend */}
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <h2 className="text-xl font-bold text-white mb-4">Vinstutveckling</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#ec4899"
                strokeWidth={2}
                dot={{ fill: '#ec4899' }}
                name="Vinst"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* New Subscriptions */}
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <h2 className="text-xl font-bold text-white mb-4">Nya Prenumerationer</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #4c1d95' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="subscriptions" fill="#8b5cf6" name="Nya prenumeranter" />
            </BarChart>
          </ResponsiveContainer>
          {stripeData && stripeData.subscriptions && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="bg-navy-900 p-3 rounded">
                <p className="text-gray-400">MRR</p>
                <p className="text-white font-bold">{Math.round(stripeData.subscriptions.mrr).toLocaleString('sv-SE')} kr</p>
              </div>
              <div className="bg-navy-900 p-3 rounded">
                <p className="text-gray-400">Churn</p>
                <p className="text-white font-bold">{stripeData.subscriptions.canceled || 0} avhopp</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <h2 className="text-xl font-bold text-white mb-4">Stripe API Status</h2>
          {stripeData ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total intäkt:</span>
                <span className="text-white font-semibold">{Math.round(stripeData.revenue?.total || 0).toLocaleString('sv-SE')} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Återbetalningar:</span>
                <span className="text-white font-semibold">{Math.round(stripeData.revenue?.refunded || 0).toLocaleString('sv-SE')} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Aktiva prenumeranter:</span>
                <span className="text-white font-semibold">{stripeData.subscriptions?.active || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Betalande kunder:</span>
                <span className="text-white font-semibold">{stripeData.customers?.paying || 0}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Ingen Stripe-data tillgänglig</p>
          )}
        </div>

        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <h2 className="text-xl font-bold text-white mb-4">OpenAI API Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total kostnad (USD):</span>
              <span className="text-white font-semibold">
                ${aiCostData.totalAICost.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total kostnad (SEK):</span>
              <span className="text-white font-semibold">
                {Math.round(aiCostData.totalAICostSEK).toLocaleString('sv-SE')} kr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Datakälla:</span>
              <span className={`font-semibold ${
                aiCostData.aiCostSource.includes('OpenAI API') ? 'text-green-500' :
                aiCostData.aiCostSource.includes('brev') ? 'text-blue-500' :
                'text-yellow-500'
              }`}>
                {aiCostData.aiCostSource}
              </span>
            </div>
            {openaiData?.data?.totalTokens > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Total tokens:</span>
                <span className="text-white font-semibold">
                  {openaiData.data.totalTokens.toLocaleString()}
                </span>
              </div>
            )}
            {aiCostData.lettersCount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Genererade brev:</span>
                <span className="text-white font-semibold">{aiCostData.lettersCount}</span>
              </div>
            )}
            {(!openaiData || openaiData.estimatedOnly) && (
              <p className="text-yellow-500 text-xs mt-2">
                OpenAI Admin API-nyckel saknas eller returnerar ingen data.
                Använder estimat från genererade brev.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
        <h2 className="text-xl font-bold text-white mb-4">Senaste Transaktioner</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Belopp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Kund
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {transactionData.length > 0 ? (
                transactionData.map((transaction, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.amount} kr
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'completed' ? 'Slutförd' : 'Väntande'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {transaction.customer}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                    Inga transaktioner att visa
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}