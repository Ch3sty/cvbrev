'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50/30 to-slate-100/20">
      <div className="flex h-screen flex-col lg:flex-row">
        {/* Achievement Notifications */}
        {user && <AchievementManager userId={user.id} />}

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Dashboard Sidebar - Responsive */}
        <motion.div
          initial={false}
          animate={{
            x: isMobileMenuOpen ? 0 : '-100%'
          }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed inset-y-0 left-0 z-50 lg:relative lg:z-20 lg:translate-x-0"
        >
          <DashboardSidebar
            onClose={() => setIsMobileMenuOpen(false)}
            isMobile={true}
          />
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Dashboard Header - med hamburger på mobil */}
          <div className="relative z-15">
            <DashboardHeader
              user={user}
              onMenuClick={() => setIsMobileMenuOpen(true)}
            />
          </div>

          {/* Main Content Area - responsiv padding */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 relative bg-gradient-to-br from-white/50 via-slate-50/30 to-slate-100/10">
            <div className="max-w-7xl mx-auto relative">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}