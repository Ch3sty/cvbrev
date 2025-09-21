'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PenTool, 
  Brain, 
  FileText, 
  Palette,
  TrendingUp,
  Clock,
  Star,
  ArrowRight,
  Plus,
  Activity
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

interface DashboardStats {
  totalLetters: number;
  totalAnalyses: number;
  subscriptionTier: string;
  recentLetters: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLetters: 0,
    totalAnalyses: 0,
    subscriptionTier: 'free',
    recentLetters: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Hämta användarens brev
        const { data: letters } = await supabase
          .from('letters')
          .select('id, user_id, title, company, job_title, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Hämta användarens profil med prenumerationsinfo
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier, weekly_analysis_count')
          .eq('id', user.id)
          .single();

        setStats({
          totalLetters: letters?.length || 0,
          totalAnalyses: profile?.weekly_analysis_count || 0,
          subscriptionTier: profile?.subscription_tier || 'free',
          recentLetters: letters?.slice(0, 3).map(letter => ({
            ...letter,
            company_name: letter.company,
            position: letter.job_title
          })) || []
        });
      } catch (error) {
        console.error('Fel vid hämtning av dashboard-data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      title: 'Skapa Personligt Brev',
      description: 'Skapa ett skräddarsytt brev med AI',
      icon: <PenTool className="w-8 h-8" />,
      href: '/dashboard/skapa-brev',
      color: 'bg-gradient-to-r from-pink-500 to-rose-500'
    },
    {
      title: 'Analysera CV',
      description: 'Få AI-feedback på ditt CV',
      icon: <Brain className="w-8 h-8" />,
      href: '/dashboard/cv-analys',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
      title: 'Mina Brev',
      description: `${stats.totalLetters} sparade brev`,
      icon: <FileText className="w-8 h-8" />,
      href: '/dashboard/my-letters',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    {
      title: 'CV-Mallar',
      description: 'Utforska professionella mallar',
      icon: <Palette className="w-8 h-8" />,
      href: '/dashboard/cv-mallar',
      color: 'bg-gradient-to-r from-purple-500 to-indigo-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header med statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Skapade Brev</p>
              <p className="text-3xl font-bold text-white">{stats.totalLetters}</p>
            </div>
            <div className="bg-pink-500/10 p-3 rounded-lg">
              <PenTool className="w-6 h-6 text-pink-500" />
            </div>
          </div>
        </div>

        {stats.subscriptionTier !== 'premium' && (
          <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">CV-Analyser</p>
                <p className="text-3xl font-bold text-white">{stats.totalAnalyses}</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <Brain className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Prenumeration</p>
              <p className="text-xl font-bold text-white capitalize">
                {stats.subscriptionTier === 'premium' ? 'Premium' : 'Gratisversion'}
              </p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg">
              <Star className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Snabbåtgärder */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-6">Snabbåtgärder</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group block"
            >
              <div className="bg-navy-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all group-hover:scale-105">
                <div className={`${action.color} rounded-lg p-4 mb-4 w-fit`}>
                  <div className="text-white">
                    {action.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{action.description}</p>
                <div className="flex items-center text-pink-500 text-sm font-medium">
                  Använd verktyg
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Senaste Aktivitet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Senaste Brev */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-400" />
              Senaste Brev
            </h3>
            <Link 
              href="/dashboard/my-letters"
              className="text-pink-500 hover:text-pink-400 text-sm font-medium"
            >
              Visa alla
            </Link>
          </div>
          
          {stats.recentLetters.length > 0 ? (
            <div className="space-y-3">
              {stats.recentLetters.map((letter, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-navy-900 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{letter.company_name || 'Okänt företag'}</p>
                    <p className="text-gray-400 text-sm">{letter.position || 'Okänd position'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">
                      {new Date(letter.created_at).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Inga brev skapade än</p>
              <Link 
                href="/dashboard/skapa-brev"
                className="inline-flex items-center mt-4 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Skapa ditt första brev
              </Link>
            </div>
          )}
        </div>

        {/* Tips & Råd */}
        <div className="bg-navy-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 mr-2 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Tips & Råd</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-lg border border-pink-500/20">
              <h4 className="text-white font-medium mb-2">💡 Förbättra ditt CV</h4>
              <p className="text-gray-300 text-sm">
                Använd våra AI-analyser för att optimera ditt CV för ATS-system och rekryterare.
              </p>
              <Link 
                href="/dashboard/cv-analys"
                className="text-pink-400 hover:text-pink-300 text-sm font-medium mt-2 inline-block"
              >
                Analysera nu →
              </Link>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
              <h4 className="text-white font-medium mb-2">🎯 Personligt Brev</h4>
              <p className="text-gray-300 text-sm">
                Skapa skräddarsydda personliga brev som sticker ut från mängden.
              </p>
              <Link 
                href="/dashboard/skapa-brev"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-2 inline-block"
              >
                Kom igång →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}