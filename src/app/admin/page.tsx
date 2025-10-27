'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { Users, Crown, TrendingUp, Calendar } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import UserGrowthChart from '@/components/admin/charts/UserGrowthChart';
import PremiumBreakdownChart from '@/components/admin/charts/PremiumBreakdownChart';
import RecentPremiumList from '@/components/admin/RecentPremiumList';
import RecentUsersList from '@/components/admin/RecentUsersList';

interface UserGrowthData {
  date: string;
  new_users: number;
  total_users: number;
}

interface PremiumData {
  date: string;
  stripe: number;
  admin: number;
  guest: number;
}

interface DashboardStats {
  total_users: number;
  premium_users: number;
  new_users_today: number;
  new_users_this_week: number;
  premium_breakdown: {
    stripe: number;
    admin: number;
    guest: number;
  };
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string | null;
  created_at: string;
}

interface PremiumUser {
  id: string;
  email: string;
  full_name: string | null;
  premium_source: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  updated_at: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [premiumData, setPremiumData] = useState<PremiumData[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentPremium, setRecentPremium] = useState<PremiumUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<number>(30); // Days to show

  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchAllData();
    // Uppdatera var 5:e minut
    const interval = setInterval(fetchAllData, 300000);
    return () => clearInterval(interval);
  }, [dateRange]);

  async function fetchAllData() {
    setIsLoading(true);
    setError(null);

    try {
      // Parallella queries för bättre prestanda
      const [
        statsResult,
        growthResult,
        premiumBreakdownResult,
        recentUsersResult,
        recentPremiumResult
      ] = await Promise.all([
        fetchStats(),
        fetchUserGrowth(),
        fetchPremiumBreakdown(),
        fetchRecentUsers(),
        fetchRecentPremiumConversions()
      ]);

      if (statsResult) setStats(statsResult);
      if (growthResult) setUserGrowthData(growthResult);
      if (premiumBreakdownResult) setPremiumData(premiumBreakdownResult);
      if (recentUsersResult) setRecentUsers(recentUsersResult);
      if (recentPremiumResult) setRecentPremium(recentPremiumResult);

    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av data');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchStats(): Promise<DashboardStats | null> {
    try {
      // Totalt antal användare
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Premium-användare fördelning
      const { data: premiumUsers } = await supabase
        .from('profiles')
        .select('subscription_status, stripe_customer_id, premium_source')
        .eq('subscription_tier', 'premium');

      const premiumBreakdown = {
        stripe: premiumUsers?.filter(u => u.stripe_customer_id && u.subscription_status === 'active').length || 0,
        admin: premiumUsers?.filter(u => u.premium_source === 'admin').length || 0,
        guest: premiumUsers?.filter(u => u.premium_source === 'guest_invitation').length || 0
      };

      // Nya användare idag
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: newToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Nya användare denna vecka
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      const { count: newThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      return {
        total_users: totalUsers || 0,
        premium_users: (premiumBreakdown.stripe + premiumBreakdown.admin + premiumBreakdown.guest),
        new_users_today: newToday || 0,
        new_users_this_week: newThisWeek || 0,
        premium_breakdown: premiumBreakdown
      };
    } catch (err) {
      console.error('Error fetching stats:', err);
      return null;
    }
  }

  async function fetchUserGrowth(): Promise<UserGrowthData[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_growth_30_days');

      if (error) {
        console.error('Error fetching user growth:', error);
        // Fallback: Hämta manuellt om RPC inte finns
        return await fetchUserGrowthFallback();
      }

      return data || [];
    } catch (err) {
      console.error('Error:', err);
      return await fetchUserGrowthFallback();
    }
  }

  async function fetchUserGrowthFallback(): Promise<UserGrowthData[]> {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - dateRange);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (!profiles) return [];

      // Gruppera per dag
      const groupedByDay: Record<string, number> = {};
      profiles.forEach(profile => {
        const date = new Date(profile.created_at).toISOString().split('T')[0];
        groupedByDay[date] = (groupedByDay[date] || 0) + 1;
      });

      // Fyll i alla dagar (även dagar med 0 nya användare)
      const result: UserGrowthData[] = [];
      const startDate = new Date(daysAgo);
      const endDate = new Date();
      let totalUsers = 0;

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const newUsers = groupedByDay[dateStr] || 0;
        totalUsers += newUsers;

        result.push({
          date: dateStr,
          new_users: newUsers,
          total_users: totalUsers
        });
      }

      return result;
    } catch (err) {
      console.error('Error in fallback:', err);
      return [];
    }
  }

  async function fetchPremiumBreakdown(): Promise<PremiumData[]> {
    try {
      // Hämta ALLA premium-användare (oavsett när de skapades)
      const { data: premiumUsers } = await supabase
        .from('profiles')
        .select('created_at, subscription_status, stripe_customer_id, premium_source')
        .eq('subscription_tier', 'premium')
        .order('created_at', { ascending: true });

      if (!premiumUsers || premiumUsers.length === 0) return [];

      // Skapa en kumulativ fördelning över vald tidsperiod
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - dateRange);

      const result: PremiumData[] = [];
      const startDate = new Date(daysAgo);
      const endDate = new Date();

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const currentDate = new Date(dateStr);

        // Räkna hur många premium-användare som fanns på detta datum
        const counts = { stripe: 0, admin: 0, guest: 0 };

        premiumUsers.forEach(user => {
          const userCreatedDate = new Date(user.created_at);
          // Inkludera användare som skapades innan eller på detta datum
          if (userCreatedDate <= currentDate) {
            if (user.stripe_customer_id && user.subscription_status === 'active') {
              counts.stripe += 1;
            } else if (user.premium_source === 'admin') {
              counts.admin += 1;
            } else if (user.premium_source === 'guest_invitation') {
              counts.guest += 1;
            }
          }
        });

        result.push({
          date: dateStr,
          ...counts
        });
      }

      return result;

    } catch (err) {
      console.error('Error fetching premium breakdown:', err);
      return [];
    }
  }

  async function fetchRecentUsers(): Promise<RecentUser[]> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, subscription_tier, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      return data || [];
    } catch (err) {
      console.error('Error fetching recent users:', err);
      return [];
    }
  }

  async function fetchRecentPremiumConversions(): Promise<PremiumUser[]> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, premium_source, subscription_status, stripe_customer_id, updated_at')
        .eq('subscription_tier', 'premium')
        .order('updated_at', { ascending: false })
        .limit(5);

      return data || [];
    } catch (err) {
      console.error('Error fetching recent premium:', err);
      return [];
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-red-900 mb-2">Ett fel uppstod</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Översikt över plattformens användare och aktivitet</p>
        </div>

        {/* Date range selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="dateRange" className="text-sm text-gray-600">Tidsperiod:</label>
          <select
            id="dateRange"
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value={7}>7 dagar</option>
            <option value={30}>30 dagar</option>
            <option value={90}>90 dagar</option>
            <option value={180}>6 månader</option>
            <option value={365}>1 år</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Totalt antal användare"
          value={stats?.total_users ?? 0}
          icon={<Users className="w-6 h-6" />}
          subtitle={`${stats?.new_users_this_week ?? 0} nya denna vecka`}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />

        <StatsCard
          title="Premium-användare"
          value={stats?.premium_users ?? 0}
          icon={<Crown className="w-6 h-6" />}
          subtitle={`${stats?.premium_breakdown.stripe ?? 0} Stripe, ${stats?.premium_breakdown.admin ?? 0} Admin, ${stats?.premium_breakdown.guest ?? 0} Gäst`}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-600"
        />

        <StatsCard
          title="Nya användare idag"
          value={stats?.new_users_today ?? 0}
          icon={<TrendingUp className="w-6 h-6" />}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
        />

        <StatsCard
          title="Konverteringsgrad"
          value={stats && stats.total_users > 0
            ? `${((stats.premium_users / stats.total_users) * 100).toFixed(1)}%`
            : '0%'}
          icon={<Calendar className="w-6 h-6" />}
          subtitle={`${stats?.premium_users ?? 0} av ${stats?.total_users ?? 0} användare`}
          iconBgColor="bg-pink-100"
          iconColor="text-pink-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <UserGrowthChart data={userGrowthData} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-2">
          <PremiumBreakdownChart
            data={premiumData}
            isLoading={isLoading}
            totals={stats?.premium_breakdown}
          />
        </div>
      </div>

      {/* Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentPremiumList users={recentPremium} isLoading={isLoading} />
        <RecentUsersList users={recentUsers} isLoading={isLoading} />
      </div>
    </div>
  );
}
