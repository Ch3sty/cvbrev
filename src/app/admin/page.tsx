'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import Link from 'next/link';
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Clock,
  BarChart2
} from 'lucide-react';

// Typdefinition för statistik
interface SystemStats {
  total_users: number;
  premium_users: number;
  free_users: number;
  total_letters: number;
  total_saved_letters: number;
  total_cvs: number;
}

// Stats card component (Inga ändringar behövs här för responsivitet)
function StatsCard({
  title,
  value,
  icon,
  change,
  changeType
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
}) {
  return (
    <div className="bg-navy-800 rounded-lg p-6 border border-gray-700 hover:border-pink-500 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>

          {change !== undefined && (
            <p className={`text-xs flex items-center mt-2 ${
              changeType === 'positive' ? 'text-green-400' :
              changeType === 'negative' ? 'text-red-400' :
              'text-gray-400'
            }`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${
                changeType === 'negative' ? 'transform rotate-180' : ''
              }`} />
              {change}% jämfört med förra perioden
            </p>
          )}
        </div>

        <div className="bg-navy-700 p-3 rounded-lg flex-shrink-0"> {/* Added flex-shrink-0 */}
          {icon}
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null); // State för senaste uppdateringstid

  useEffect(() => {
    async function fetchSystemStats() {
      // Sätt inte isLoading till true vid varje intervalluppdatering, bara första gången
      if (!stats) {
          setIsLoading(true);
      }
      setError(null);

      try {
        const supabase = getSupabaseClient();

        // Hämta systemstatistik från vår vy
        const { data, error } = await supabase
          .from('system_statistics')
          .select('*')
          .single();

        if (error) {
          throw error;
        }

        setStats(data);
        setLastUpdated(new Date()); // Uppdatera tiden när data hämtats

      } catch (err: any) {
        console.error('Error fetching system stats:', err);
        setError(err.message || 'Ett fel uppstod vid hämtning av statistik');
      } finally {
         // Avsluta laddning bara om det var den initiala laddningen
         if (isLoading && !stats) {
            setIsLoading(false);
         }
      }
    }

    fetchSystemStats(); // Hämta direkt vid montering

    // Skapa en interval som uppdaterar statistiken varje minut
    const interval = setInterval(fetchSystemStats, 60000);

    // Rensa interval vid unmount
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Kör bara vid montering, intervallet sköter resten

  // Datum för rubrik
  const today = new Date().toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]"> {/* Ge lite höjd */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Laddar statistik...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r mb-4">
        <h2 className="text-lg font-semibold text-white mb-2">Ett fel uppstod</h2>
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6"> {/* Lägg till lite padding */}
      {/* Page header - Adjusted for responsiveness */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">{today}</p>
        </div>

        <div className="flex items-center gap-2 bg-navy-800 px-3 py-1.5 rounded-md border border-gray-700 self-start sm:self-center"> {/* Justerat alignment */}
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm whitespace-nowrap"> {/* Undvik radbrytning här */}
            Uppdaterad: {lastUpdated ? lastUpdated.toLocaleTimeString('sv-SE') : '...'}
          </span>
        </div>
      </div>

      {/* Stats grid - Already responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total users */}
        <StatsCard
          title="Totalt antal användare"
          value={stats?.total_users ?? 0}
          icon={<Users className="w-6 h-6 text-blue-400" />}
          // change={5.2} // Ta bort hårdkodad data om det inte finns
          // changeType="positive"
        />

        {/* Premium users */}
        <StatsCard
          title="Premium-användare"
          value={stats?.premium_users ?? 0}
          icon={<CreditCard className="w-6 h-6 text-pink-400" />}
          // change={12.7}
          // changeType="positive"
        />

        {/* Conversion rate */}
        <StatsCard
          title="Konverteringsgrad"
          value={(stats && stats.total_users > 0) ? `${((stats.premium_users / stats.total_users) * 100).toFixed(1)}%` : '0%'}
          icon={<BarChart2 className="w-6 h-6 text-yellow-400" />}
          // change={1.8}
          // changeType="positive"
        />

        {/* Total letters */}
        <StatsCard
          title="Genererade brev" // Förtydligat titel
          value={stats?.total_letters ?? 0}
          icon={<FileText className="w-6 h-6 text-green-400" />}
          // change={15.3}
          // changeType="positive"
        />

        {/* Saved letters */}
        <StatsCard
          title="Sparade brev"
          value={stats?.total_saved_letters ?? 0}
          icon={<FileText className="w-6 h-6 text-purple-400" />} // Annan färg för variation
          // change={7.9}
          // changeType="positive"
        />

        {/* Total CVs */}
        <StatsCard
          title="Uppladdade CV:n"
          value={stats?.total_cvs ?? 0}
          icon={<FileText className="w-6 h-6 text-cyan-400" />} // Annan färg
          // change={10.2}
          // changeType="positive"
        />
      </div>

      {/* Lower panels - Already responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users panel */}
        <div className="bg-navy-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">Senaste användare</h2>
            {/* Gör länken mer uppenbar om det är en länk */}
            {/* <Link href="/admin/users" className="text-pink-500 text-sm hover:underline">Visa alla</Link> */}
          </div>

          <div className="p-6">
            <p className="text-gray-400 text-center py-8">
              {/* Implementera senaste användare här */}
              Visning av senaste användare kommer snart.
            </p>
          </div>
        </div>

        {/* Recent activities panel */}
        <div className="bg-navy-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">Senaste aktiviteter</h2>
             {/* <Link href="/admin/activities" className="text-pink-500 text-sm hover:underline">Visa alla</Link> */}
          </div>

          <div className="p-6">
            <p className="text-gray-400 text-center py-8">
              {/* Implementera senaste aktiviteter här */}
              Visning av senaste aktiviteter kommer snart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}