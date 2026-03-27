'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
  LayoutDashboard,
  PenTool,
  FileText,
  Brain,
  Palette,
  User,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  LogOut,
  Mail,
  Trophy,
  Gift,
  Briefcase,
  Target,
  Search,
  Crown,
  Linkedin,
  Shield,
  X,
  Bug,
  MessageCircle,
  FilePlus,
  Upload
} from 'lucide-react';

interface DashboardSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

// Paths that belong to "Fler verktyg" — used for auto-expand
const EXTRA_TOOLS_PATHS = [
  '/dashboard/cv-analys',
  '/dashboard/jobbmatchning',
  '/dashboard/jobbcoachen',
  '/dashboard/linkedin-optimizer',
  '/dashboard/tester',
  '/dashboard/rewards',
];

export default function DashboardSidebar({ onClose, isMobile }: DashboardSidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isTrialUser, setIsTrialUser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [claimingReward, setClaimingReward] = useState(false);
  const [cvCount, setCvCount] = useState<number | null>(null);
  const [letterCount, setLetterCount] = useState<number | null>(null);
  const supabase = getSupabaseClient();

  // "Fler verktyg" expand state — auto-expand if on one of those pages
  const isOnExtraToolPage = EXTRA_TOOLS_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
  const [extraToolsOpen, setExtraToolsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-extra-tools-open');
      if (stored !== null) return stored === 'true';
    }
    return false;
  });

  // Auto-expand if navigating to an extra tool page
  useEffect(() => {
    if (isOnExtraToolPage && !extraToolsOpen) {
      setExtraToolsOpen(true);
    }
  }, [isOnExtraToolPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExtraTools = () => {
    const next = !extraToolsOpen;
    setExtraToolsOpen(next);
    localStorage.setItem('sidebar-extra-tools-open', String(next));
  };

  // Use OnboardingContext for instant updates
  const { requiredCompletedCount, onboardingCompleted, rewardClaimed, markRewardClaimed, isLoading } = useOnboarding();

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('Auth error:', authError);
          return;
        }

        if (user && user.id) {
          const userId = typeof user.id === 'string' ? user.id : null;
          if (!userId) return;

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('premium_until, subscription_tier, premium_source')
            .eq('id', userId)
            .single();

          if (profileError) return;

          const hasPremiumUntil = profile?.premium_until && new Date(profile.premium_until) > new Date();
          const hasPremiumTier = profile?.subscription_tier === 'premium';
          setIsPremium(hasPremiumUntil || hasPremiumTier);

          const isTrialSource = profile?.premium_source === 'signup_trial' || profile?.premium_source === 'oauth_signup_trial';
          setIsTrialUser(isTrialSource && hasPremiumUntil);

          const { data: adminData } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', userId)
            .eq('role', 'super_admin')
            .maybeSingle();
          setIsAdmin(!!adminData);

          const { count: cvCountResult } = await supabase
            .from('cv_texts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
          setCvCount(cvCountResult ?? 0);

          const { count: letterCountResult } = await supabase
            .from('letters')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_saved', true);
          setLetterCount(letterCountResult ?? 0);
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };

    checkPremiumStatus();
  }, [supabase]);

  const handleClaimReward = async () => {
    setClaimingReward(true);
    try {
      const response = await fetch('/api/onboarding/claim-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to claim reward');
      }
      markRewardClaimed();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error claiming reward:', error);
      alert('Ett fel uppstod vid hämtning av belöning. Försök igen.');
    } finally {
      setClaimingReward(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const hasNoCv = cvCount !== null && cvCount === 0;

  // Helper: render a nav link
  const NavLink = ({ path, label, icon, count, sublabel, highlight }: {
    path: string;
    label: string;
    icon: React.ReactNode;
    count?: number | null;
    sublabel?: string;
    highlight?: boolean;
  }) => {
    const isActive = pathname === path || pathname.startsWith(path + '/');
    return (
      <li>
        <Link
          href={path}
          prefetch={true}
          onClick={() => isMobile && onClose?.()}
          className={`
            flex items-center px-4 py-3 sm:py-2.5 rounded-lg relative transition-all duration-200 touch-manipulation min-h-[44px]
            ${isActive
              ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
              : highlight
              ? 'text-blue-600 bg-blue-50/50 hover:bg-blue-100 hover:shadow-sm font-medium'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <span className="flex-shrink-0">{icon}</span>
          {!collapsed && (
            <div className="ml-3 flex-1 flex items-center justify-between">
              <div>
                <span className="whitespace-pre-line">{label}</span>
                {sublabel && (
                  <span className="block text-xs text-slate-400 mt-0.5">{sublabel}</span>
                )}
              </div>
              {typeof count === 'number' && count > 0 && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </div>
          )}
        </Link>
      </li>
    );
  };

  return (
    <div
      className={`bg-white h-full ${
        collapsed ? 'w-16' : 'w-64 sm:w-72'
      } transition-all duration-300 border-r border-slate-300 flex flex-col shadow-2xl relative z-10`}
    >
      {/* Logo och Collapse-knapp */}
      <div className="flex items-center justify-between p-4 border-b border-slate-300 bg-gradient-to-r from-white to-slate-50/50">
        {!collapsed && (
          <div className="text-xl font-bold">
            <span className="text-slate-900">Jobbcoach</span>
            <span className="text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-md px-1.5 py-0.5 ml-1">.ai</span>
          </div>
        )}

        {collapsed && (
          <span className="text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-md px-2 py-1 text-xl font-bold mx-auto">J</span>
        )}

        <div className="flex items-center gap-2">
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors lg:hidden touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors shadow-sm hover:shadow-md hidden lg:block"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 py-4 space-y-4 overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
      >
        {/* Onboarding */}
        {!isLoading && !rewardClaimed && (
          <div className="px-4">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes gentle-pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
              }
              .onboarding-pulse { animation: gentle-pulse 3s ease-in-out infinite; }
            `}} />

            {!onboardingCompleted && (
              <Link
                href="/dashboard/kom-igang"
                onClick={() => isMobile && onClose?.()}
                className={`
                  flex items-center justify-between p-3 rounded-xl transition-all duration-300 group shadow-lg hover:shadow-xl touch-manipulation min-h-[44px] relative
                  ${pathname === '/dashboard/kom-igang'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                  }
                  ${!collapsed && 'onboarding-pulse'}
                `}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Target className="w-5 h-5" />
                  {!collapsed && (
                    <div className="flex-1">
                      <span className="font-bold">Kom igång</span>
                      <p className="text-xs text-white/90">3 steg till 1 dag premium</p>
                    </div>
                  )}
                </div>
                {!collapsed && requiredCompletedCount < 3 && (
                  <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                    {requiredCompletedCount}/3
                  </span>
                )}
              </Link>
            )}

            {onboardingCompleted && !rewardClaimed && (
              <button
                onClick={handleClaimReward}
                disabled={claimingReward}
                className={`
                  w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group shadow-lg hover:shadow-xl touch-manipulation min-h-[44px] relative
                  ${claimingReward
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                  }
                  ${!collapsed && !claimingReward && 'onboarding-pulse'}
                `}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Gift className="w-5 h-5" />
                  {!collapsed && (
                    <div className="flex-1 text-left">
                      <span className="font-bold">
                        {claimingReward ? 'Hämtar...' : 'Hämta 1 dag premium'}
                      </span>
                      <p className="text-xs text-white/90">
                        {claimingReward ? 'Vänligen vänta' : 'Grattis! Du har slutfört guiden'}
                      </p>
                    </div>
                  )}
                </div>
                {!collapsed && !claimingReward && (
                  <ChevronRight className="w-5 h-5 opacity-75 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                )}
                {!collapsed && claimingReward && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            )}
          </div>
        )}

        {/* Översikt */}
        <ul className="space-y-1">
          <NavLink path="/dashboard" label="Översikt" icon={<LayoutDashboard className="w-5 h-5" />} />
        </ul>

        {/* MITT CV — grundstenen */}
        <div>
          {!collapsed && (
            <h3 className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Mitt CV
            </h3>
          )}
          <ul className="space-y-1">
            <NavLink
              path="/dashboard/profil/cv"
              label="Mina CV:n"
              icon={<FileText className="w-5 h-5" />}
              count={cvCount}
              sublabel={hasNoCv ? 'Ladda upp ditt CV' : undefined}
              highlight={hasNoCv}
            />
            <NavLink
              path="/dashboard/skapa-cv"
              label="Skapa CV"
              icon={<FilePlus className="w-5 h-5" />}
            />
          </ul>
        </div>

        {/* SKAPA — primära verktyg */}
        <div>
          {!collapsed && (
            <h3 className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Skapa
            </h3>
          )}
          <ul className="space-y-1">
            <NavLink
              path="/dashboard/skapa-brev"
              label="Personligt brev"
              icon={<PenTool className="w-5 h-5" />}
              sublabel={hasNoCv ? 'Ladda upp CV först' : undefined}
            />
            <NavLink
              path="/dashboard/cv-mallar"
              label="CV Mallar"
              icon={<Palette className="w-5 h-5" />}
            />
          </ul>
        </div>

        {/* SPARADE */}
        <div>
          {!collapsed && (
            <h3 className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Sparade
            </h3>
          )}
          <ul className="space-y-1">
            <NavLink
              path="/dashboard/mina-brev"
              label="Sparade brev"
              icon={<FileText className="w-5 h-5" />}
              count={letterCount}
            />
          </ul>
        </div>

        {/* FLER VERKTYG — expanderbar */}
        <div>
          {!collapsed ? (
            <button
              onClick={toggleExtraTools}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider hover:text-slate-900 transition-colors"
            >
              <span>Fler verktyg</span>
              {extraToolsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          ) : (
            <button
              onClick={toggleExtraTools}
              className="w-full flex justify-center py-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {extraToolsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <AnimatePresence initial={false}>
            {extraToolsOpen && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 overflow-hidden"
              >
                <NavLink path="/dashboard/cv-analys" label="Förbättra CV" icon={<Search className="w-5 h-5" />} />
                <NavLink path="/dashboard/jobbmatchning" label="Jobbmatchning" icon={<Briefcase className="w-5 h-5" />} />
                <NavLink path="/dashboard/jobbcoachen" label="Jobbcoachen" icon={<MessageCircle className="w-5 h-5" />} />
                <NavLink path="/dashboard/linkedin-optimizer" label="LinkedIn-optimering" icon={<Linkedin className="w-5 h-5" />} />
                <NavLink path="/dashboard/tester" label="Rekryteringstester" icon={<Brain className="w-5 h-5" />} />
                <NavLink path="/dashboard/rewards" label="Belöningar" icon={<Trophy className="w-5 h-5" />} />
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Profil & Prenumeration — alltid synlig */}
        <div className="pt-2">
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard/profil"
                prefetch={true}
                onClick={() => isMobile && onClose?.()}
                className={`
                  flex items-center justify-between px-4 py-3 sm:py-2.5 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px] relative overflow-hidden group
                  ${pathname === '/dashboard/profil' || pathname === '/dashboard/profil/prenumeration'
                    ? isPremium
                      ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-l-4 border-amber-600 shadow-lg font-semibold'
                      : 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
                    : isPremium
                    ? 'bg-gradient-to-r from-amber-50/50 to-yellow-50/50 text-amber-700 hover:from-amber-100 hover:to-yellow-100 hover:shadow-md font-medium'
                    : 'bg-gradient-to-r from-pink-50/50 to-purple-50/50 text-slate-700 hover:from-pink-100 hover:to-purple-100 hover:shadow-md font-medium'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <motion.div
                  className={`absolute inset-0 rounded-lg ${
                    isPremium
                      ? 'bg-gradient-to-r from-amber-400/10 to-yellow-400/10'
                      : 'bg-gradient-to-r from-pink-400/10 to-purple-400/10'
                  }`}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                <div className="flex items-center flex-1 relative z-10">
                  <span className={`flex-shrink-0 ${isPremium ? 'text-amber-600' : 'text-pink-600'}`}>
                    <Crown className="w-4 h-4" />
                  </span>
                  {!collapsed && (
                    <div className="ml-3 flex items-center gap-2 flex-1">
                      <span>Profil & Prenumeration</span>
                      {!isPremium && (
                        <span className="text-xs font-semibold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          prova på
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-300 space-y-1 bg-gradient-to-r from-white to-slate-50/50">
        <Link
          href="/dashboard/bugg-feedback"
          prefetch={true}
          onClick={() => isMobile && onClose?.()}
          className={`
            flex items-center text-slate-500 hover:text-slate-700 py-1.5 px-2 rounded-lg transition-all text-xs touch-manipulation min-h-[36px]
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Bug className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Buggar & Feedback</span>}
        </Link>

        <Link
          href="/dashboard/kontakt"
          prefetch={true}
          onClick={() => isMobile && onClose?.()}
          className={`
            flex items-center text-slate-500 hover:text-slate-700 py-1.5 px-2 rounded-lg transition-all text-xs touch-manipulation min-h-[36px]
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Mail className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Kontakt</span>}
        </Link>

        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => isMobile && onClose?.()}
            className={`
              flex items-center py-3 px-3 rounded-xl transition-all shadow-lg hover:shadow-2xl font-bold touch-manipulation min-h-[44px]
              bg-gradient-to-r from-red-600 via-pink-600 to-purple-600
              text-white
              hover:from-red-700 hover:via-pink-700 hover:to-purple-700
              ring-2 ring-red-500/50 hover:ring-red-500
              animate-pulse hover:animate-none
              ${collapsed ? 'justify-center' : 'w-full'}
            `}
          >
            <Shield className="w-5 h-5" />
            {!collapsed && <span className="ml-3">Admin Panel</span>}
          </Link>
        )}

        <button
          onClick={handleLogout}
          className={`
            flex items-center text-slate-500 hover:text-red-600 hover:bg-red-50 py-1.5 px-2 rounded-lg transition-all text-xs touch-manipulation min-h-[36px]
            ${collapsed ? 'justify-center' : 'w-full'}
          `}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Logga ut</span>}
        </button>
      </div>
    </div>
  );
}
