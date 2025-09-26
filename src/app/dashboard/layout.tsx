'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import DashboardSidebar from '@/components/dashboard/sidebar';
import DashboardHeader from '@/components/dashboard/header';
import AchievementManager from '@/components/gamification/AchievementManager';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = getSupabaseClient();
        
        // Hämta aktuell användare
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("Ingen användare hittad, omdirigerar till login");
          router.push('/login');
          return;
        }
        
        console.log("Användare inloggad, visar dashboard");
        setUser(user);
      } catch (error) {
        console.error("Fel vid auth-kontroll:", error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  // Visa en laddningsskärm medan vi kontrollerar autentisering
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-white to-slate-50/50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-700">Laddar din dashboard...</p>
        </div>
      </div>
    );
  }

  // Om användaren inte är inloggad, visa inget
  // Router.push i useEffect kommer att hantera omdirigeringen
  if (!user) {
    return null;
  }

  // Om användaren är inloggad, visa dashboard-gränssnittet
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/50">
      <div className="flex h-screen">
        {/* Achievement Notifications */}
        {user && <AchievementManager userId={user.id} />}

        {/* Dashboard Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Dashboard Header */}
          <DashboardHeader user={user} />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 bg-transparent">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}