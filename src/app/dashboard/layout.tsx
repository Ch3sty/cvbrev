'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/sidebar';
import DashboardHeader from '@/components/dashboard/header';
import AchievementManager from '@/components/gamification/AchievementManager';
import EmailVerificationBanner from '@/components/dashboard/email-verification-banner';
import SetPasswordPrompt from '@/components/dashboard/SetPasswordPrompt';
import NavigationProgress from '@/components/ui/NavigationProgress';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // Redirect till login om ej autentiserad (efter initial load)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Check if user needs to set password (trial users)
  useEffect(() => {
    if (user) {
      const passwordSet = user.user_metadata?.password_set;
      const dismissedThisSession = localStorage.getItem('password_prompt_dismissed') === 'true';

      if (passwordSet === false && !dismissedThisSession) {
        setShowPasswordPrompt(true);
      }
    }
  }, [user]);

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

  // Om användaren inte är inloggad, visa inget (redirect sker i useEffect)
  if (!user) {
    return null;
  }

  // Om användaren är inloggad, visa dashboard-gränssnittet
  return (
    <OnboardingProvider>
      {/* Navigation Progress Bar - visas vid sidbyten */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

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

        {/* Dashboard Sidebar - Desktop (alltid synlig) */}
        <div className="hidden lg:block lg:relative lg:z-20">
          <DashboardSidebar
            onClose={() => setIsMobileMenuOpen(false)}
            isMobile={false}
          />
        </div>

        {/* Dashboard Sidebar - Mobile (drawer) */}
        <motion.div
          initial={false}
          animate={{
            x: isMobileMenuOpen ? 0 : '-100%'
          }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="fixed inset-y-0 left-0 z-50 lg:hidden"
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

          {/* Email Verification Banner */}
          <EmailVerificationBanner />

          {/* Set Password Prompt for trial users */}
          {showPasswordPrompt && user && (
            <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
              <div className="max-w-7xl mx-auto">
                <SetPasswordPrompt
                  userId={user.id}
                  onDismiss={() => setShowPasswordPrompt(false)}
                  onPasswordSet={() => setShowPasswordPrompt(false)}
                />
              </div>
            </div>
          )}

          {/* Main Content Area - responsiv padding */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 relative bg-gradient-to-br from-white/50 via-slate-50/30 to-slate-100/10">
            <div className="max-w-7xl mx-auto relative">
              {/* Page Transition Animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
      </div>
    </OnboardingProvider>
  );
}