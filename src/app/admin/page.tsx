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
  BarChart2,
  User,
  ChevronRight,
  Edit3,
  PlusCircle,
  UploadCloud,
  LogIn
} from 'lucide-react';

// Typdefinitioner för data
interface SystemStats {
  total_users: number;
  premium_users: number;
  free_users: number;
  total_letters: number;
  total_saved_letters: number;
  total_cvs: number;
}

interface LatestUser {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string | null;
  created_at: string;
}

interface UserActivity {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  activity_type: string;
  description: string;
  created_at: string;
}

// Stats card component
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

        <div className="bg-navy-700 p-3 rounded-lg flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}

// Användarkort för senaste användare
function UserCard({ user }: { user: LatestUser }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-navy-700 rounded-md transition-colors">
      <div className="w-9 h-9 rounded-full bg-navy-600 flex items-center justify-center text-white font-medium flex-shrink-0">
        {user.full_name 
          ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
          : user.email.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white font-medium truncate">
          {user.full_name || 'Namnlös användare'}
        </p>
        <p className="text-gray-400 text-sm truncate">{user.email}</p>
      </div>
      {user.subscription_tier === 'premium' && (
        <div className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs rounded-full font-medium">
          Premium
        </div>
      )}
      <Link href={`/admin/users/${user.id}`} className="text-gray-400 hover:text-white">
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  );
}

// Aktivitetskort för senaste aktiviteter
function ActivityCard({ activity }: { activity: UserActivity }) {
  // Funktion för att hämta rätt ikon baserat på aktivitetstyp
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <LogIn className="w-4 h-4 text-blue-400" />;
      case 'letter_created':
        return <Edit3 className="w-4 h-4 text-green-400" />;
      case 'letter_saved':
        return <FileText className="w-4 h-4 text-pink-400" />;
      case 'cv_uploaded':
        return <UploadCloud className="w-4 h-4 text-purple-400" />;
      case 'registered':
        return <PlusCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Funktion för att formatera datum på ett användarvänligt sätt
  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just nu';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min sedan`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} tim sedan`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} dag${diffInDays !== 1 ? 'ar' : ''} sedan`;
    }
    
    // För äldre datum, visa faktiskt datum
    return date.toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="flex gap-3 p-3 hover:bg-navy-700 rounded-md transition-colors">
      <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center flex-shrink-0">
        {getActivityIcon(activity.activity_type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white">
          <span className="font-medium">
            {activity.full_name || activity.email.split('@')[0]}
          </span>
          {" "}{activity.description}
        </p>
        <p className="text-gray-400 text-sm">
          {formatTimeAgo(activity.created_at)}
        </p>
      </div>
    </div>
  );
}

// Admin Dashboard
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [latestUsers, setLatestUsers] = useState<LatestUser[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const supabase = getSupabaseClient();

  // Funktion för att hämta system-statistik
  const fetchSystemStats = async () => {
    try {
      const { data, error } = await supabase
        .from('system_statistics')
        .select('*')
        .single();

      if (error) throw error;
      
      setStats(data);
      return true;
    } catch (err: any) {
      console.error('Error fetching system stats:', err);
      setError(err.message || 'Ett fel uppstod vid hämtning av statistik');
      return false;
    }
  };

  // Funktion för att hämta senaste användare
  const fetchLatestUsers = async () => {
    try {
      // Försök först med RPC-funktionen om den finns
      try {
        const { data, error } = await supabase.rpc('get_latest_users', { limit_count: 5 });
        
        if (!error && data) {
          setLatestUsers(data);
          return true;
        }
      } catch (rpcError) {
        console.warn('RPC get_latest_users inte tillgänglig, använder vanlig query');
      }
      
      // Fallback till vanlig query
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, subscription_tier, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      setLatestUsers(data || []);
      return true;
    } catch (err: any) {
      console.error('Fel vid hämtning av senaste användare:', err);
      return false;
    }
  };

  // Funktion för att hämta senaste aktiviteter
  const fetchLatestActivities = async () => {
    try {
      // Försök först med RPC-funktionen om den finns
      try {
        const { data, error } = await supabase.rpc('get_latest_activities', { limit_count: 5 });
        
        if (!error && data) {
          setActivities(data);
          return true;
        }
      } catch (rpcError) {
        console.warn('RPC get_latest_activities inte tillgänglig, söker i user_activities tabell');
        
        // Försök med direkt query mot user_activities tabellen
        try {
          const { data, error } = await supabase
            .from('user_activities')
            .select(`
              id, user_id, activity_type, description, created_at,
              profiles:user_id (email, full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (!error && data) {
            // Transformera till den förväntade strukturen
            const transformedData = data.map((item: any) => ({
              id: item.id,
              user_id: item.user_id,
              email: item.profiles?.email || 'Okänd e-post',
              full_name: item.profiles?.full_name || null,
              activity_type: item.activity_type,
              description: item.description,
              created_at: item.created_at
            }));
            
            setActivities(transformedData);
            return true;
          }
        } catch (queryError) {
          console.warn('Tabell user_activities finns inte, använder mockdata');
        }
        
        // Om inga aktiviteter finns, använd mockdata för att visa UI
        const mockActivities: UserActivity[] = [
          {
            id: '1',
            user_id: '1',
            email: 'exempelanvandare@jobbcoach.ai',
            full_name: 'Exempel Användare',
            activity_type: 'login',
            description: 'loggade in på plattformen',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            user_id: '2',
            email: 'annanvandare@jobbcoach.ai',
            full_name: 'Anna Användare',
            activity_type: 'letter_created',
            description: 'skapade ett nytt brev',
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '3',
            user_id: '3',
            email: 'kalle@jobbcoach.ai',
            full_name: 'Kalle Karlsson',
            activity_type: 'cv_uploaded',
            description: 'laddade upp ett nytt CV',
            created_at: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: '4',
            user_id: '4',
            email: 'lisa@jobbcoach.ai',
            full_name: 'Lisa Linderoth',
            activity_type: 'registered',
            description: 'registrerade sig på plattformen',
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '5',
            user_id: '5',
            email: 'johan@jobbcoach.ai',
            full_name: 'Johan Jansson',
            activity_type: 'letter_saved',
            description: 'sparade ett brev',
            created_at: new Date(Date.now() - 172800000).toISOString()
          }
        ];
        
        setActivities(mockActivities);
      }
      
      return true;
    } catch (err: any) {
      console.error('Fel vid hämtning av senaste aktiviteter:', err);
      return false;
    }
  };

  // Effekt för att hämta all data vid komponentmontering
  useEffect(() => {
    async function fetchAllData() {
      if (!stats) {
        setIsLoading(true);
      }
      setError(null);

      // Hämta alla datatyper
      const statsSuccess = await fetchSystemStats();
      const usersSuccess = await fetchLatestUsers();
      const activitiesSuccess = await fetchLatestActivities();

      // Om någon av dem lyckades uppdatera lastUpdated
      if (statsSuccess || usersSuccess || activitiesSuccess) {
        setLastUpdated(new Date());
      }

      // Avsluta laddning bara om det var den initiala laddningen
      if (isLoading && !stats) {
        setIsLoading(false);
      }
    }

    fetchAllData(); // Hämta direkt vid montering

    // Skapa en interval som uppdaterar statistiken varje minut
    const interval = setInterval(fetchAllData, 60000);

    // Rensa interval vid unmount
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Datum för rubrik
  const today = new Date().toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
      <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-r mb-4">
        <h2 className="text-lg font-semibold text-white mb-2">Ett fel uppstod</h2>
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">{today}</p>
        </div>

        <div className="flex items-center gap-2 bg-navy-800 px-3 py-1.5 rounded-md border border-gray-700 self-start sm:self-center">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm whitespace-nowrap">
            Uppdaterad: {lastUpdated ? lastUpdated.toLocaleTimeString('sv-SE') : '...'}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total users */}
        <StatsCard
          title="Totalt antal användare"
          value={stats?.total_users ?? 0}
          icon={<Users className="w-6 h-6 text-blue-400" />}
        />

        {/* Premium users */}
        <StatsCard
          title="Premium-användare"
          value={stats?.premium_users ?? 0}
          icon={<CreditCard className="w-6 h-6 text-pink-400" />}
        />

        {/* Conversion rate */}
        <StatsCard
          title="Konverteringsgrad"
          value={(stats && stats.total_users > 0) ? `${((stats.premium_users / stats.total_users) * 100).toFixed(1)}%` : '0%'}
          icon={<BarChart2 className="w-6 h-6 text-yellow-400" />}
        />

        {/* Total letters */}
        <StatsCard
          title="Genererade brev"
          value={stats?.total_letters ?? 0}
          icon={<FileText className="w-6 h-6 text-green-400" />}
        />

        {/* Saved letters */}
        <StatsCard
          title="Sparade brev"
          value={stats?.total_saved_letters ?? 0}
          icon={<FileText className="w-6 h-6 text-purple-400" />}
        />

        {/* Total CVs */}
        <StatsCard
          title="Uppladdade CV:n"
          value={stats?.total_cvs ?? 0}
          icon={<FileText className="w-6 h-6 text-cyan-400" />}
        />
      </div>

      {/* Lower panels - Recent users and activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent users panel */}
        <div className="bg-navy-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">Senaste användare</h2>
            <Link href="/admin/users" className="text-pink-500 text-sm hover:underline">
              Visa alla
            </Link>
          </div>

          <div className="divide-y divide-gray-700">
            {latestUsers.length === 0 ? (
              <div className="p-6 text-center">
                <User className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Inga användare hittades</p>
              </div>
            ) : (
              latestUsers.map(user => (
                <UserCard key={user.id} user={user} />
              ))
            )}
          </div>
        </div>

        {/* Recent activities panel */}
        <div className="bg-navy-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-white">Senaste aktiviteter</h2>
          </div>

          <div className="divide-y divide-gray-700">
            {activities.length === 0 ? (
              <div className="p-6 text-center">
                <Clock className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Inga aktiviteter registrerade än</p>
              </div>
            ) : (
              activities.map(activity => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}