'use client';
import { useState, useEffect } from 'react';
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
  Users,
  ChevronRight,
  ChevronLeft,
  LogOut,
  HelpCircle,
  Mail,
  GraduationCap,
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
  Sparkles,
  MessageCircle,
  FilePlus
} from 'lucide-react';

interface DashboardSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

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

  // Use OnboardingContext for instant updates
  const { completedCount, onboardingCompleted, rewardClaimed, markRewardClaimed, isLoading } = useOnboarding();

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error('Auth error:', authError);
          return;
        }

        if (user && user.id) {
          // Ensure user.id is a string, not an array or undefined
          const userId = typeof user.id === 'string' ? user.id : null;

          if (!userId) {
            console.error('Invalid user ID format');
            return;
          }

          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('premium_until, subscription_tier, premium_source')
            .eq('id', userId)
            .single();

          if (profileError) {
            console.error('Profile query error:', profileError);
            return;
          }

          // Check both premium_until and subscription_tier
          const hasPremiumUntil = profile?.premium_until && new Date(profile.premium_until) > new Date();
          const hasPremiumTier = profile?.subscription_tier === 'premium';
          setIsPremium(hasPremiumUntil || hasPremiumTier);

          // Check if trial user
          const isTrialSource = profile?.premium_source === 'signup_trial' || profile?.premium_source === 'oauth_signup_trial';
          setIsTrialUser(isTrialSource && hasPremiumUntil);

          // Check admin status
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', userId)
            .eq('role', 'super_admin')
            .maybeSingle();

          setIsAdmin(!!adminData);

          // Fetch CV count (CVs are stored in cv_texts table)
          const { count: cvCountResult } = await supabase
            .from('cv_texts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
          setCvCount(cvCountResult ?? 0);

          // Fetch letter count (only saved letters)
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
  
  // Handler for claiming onboarding reward
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

  // Navigationslänkar för användardashboard
  const navItems = [
    {
      path: '/dashboard/kom-igang',
      label: 'Kom igång',
      icon: <Sparkles className="w-5 h-5" />,
      section: 'onboarding',
      showOnlyWhen: !onboardingCompleted || !rewardClaimed,
      pulse: true,
      badge: completedCount < 6 ? `${completedCount}/6` : null
    },
    {
      path: '/dashboard',
      label: 'Översikt',
      icon: <LayoutDashboard className="w-5 h-5" />,
      section: 'main'
    },
    {
      path: '/dashboard/rewards',
      label: 'Belöningar',
      icon: <Trophy className="w-5 h-5" />,
      section: 'main'
    },
    {
      path: '/dashboard/skapa-cv',
      label: 'Skapa ditt första CV',
      icon: <FilePlus className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/skapa-brev',
      label: 'Skapa personligt brev',
      icon: <PenTool className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/cv-analys',
      label: 'Förbättra CV',
      icon: <Search className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/linkedin-optimizer',
      label: 'LinkedIn\nProfiloptimering',
      icon: <Linkedin className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/jobbcoachen',
      label: 'Jobbcoachen',
      icon: <MessageCircle className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/jobbmatchning',
      label: 'Jobbmatchning',
      icon: <Briefcase className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/tester',
      label: 'Träna på rekryteringstester',
      icon: <Brain className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/cv-mallar',
      label: 'Byt CV-design',
      icon: <Palette className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/profil/cv',
      label: 'Mina CV:n',
      icon: <FileText className="w-5 h-5" />,
      section: 'cvs',
      count: cvCount
    },
    {
      path: '/dashboard/mina-brev',
      label: 'Mina Brev',
      icon: <FileText className="w-5 h-5" />,
      section: 'documents',
      count: letterCount
    },
  ];

  // Profile submenu items
  const profileSubItems = [
    {
      path: '/dashboard/profil',
      label: 'Profilinformation',
      icon: <User className="w-4 h-4" />
    },
    {
      path: '/dashboard/profil/prenumeration',
      label: 'Prenumeration',
      icon: <Crown className="w-4 h-4" />
    }
  ];
  
  // Logga ut funktion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };
  
  // Gruppera navigation items
  const onboardingItems = navItems.filter(item => item.section === 'onboarding' && ('showOnlyWhen' in item ? item.showOnlyWhen : true));
  const toolsItems = navItems.filter(item => item.section === 'tools');
  const cvsItems = navItems.filter(item => item.section === 'cvs');
  const documentsItems = navItems.filter(item => item.section === 'documents');
  const overviewItems = navItems.filter(item => item.section === 'main');
  
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
          {/* Mobile close button */}
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors lg:hidden touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors shadow-sm hover:shadow-md hidden lg:block"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Navigation Links - med scrollbar på mobil */}
      <nav
        className="flex-1 py-4 space-y-6 overflow-y-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Kom igång - Onboarding (Pulserande, högst upp) */}
        {/* Onboarding Section - Dynamic based on completion and reward status */}
        {!isLoading && !rewardClaimed && (
          <div className="px-4">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes gentle-pulse {
                0%, 100% {
                  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
                }
                50% {
                  box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
                }
              }
              .onboarding-pulse {
                animation: gentle-pulse 3s ease-in-out infinite;
              }
            `}} />

            {/* State 1: Not completed (0-5 steps) - Show progress link */}
            {!onboardingCompleted && (
              <Link
                href="/dashboard/kom-igang"
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
                  <Sparkles className="w-5 h-5" />
                  {!collapsed && (
                    <div className="flex-1">
                      <span className="font-bold">Kom igång</span>
                      <p className="text-xs text-white/90">Genomför guiden – få 1 dag premium</p>
                    </div>
                  )}
                </div>
                {!collapsed && completedCount < 6 && (
                  <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                    {completedCount}/6
                  </span>
                )}
              </Link>
            )}

            {/* State 2: Completed (6/6) but reward not claimed - Show claim button */}
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
        <div>
          <ul className="space-y-1">
            {overviewItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  prefetch={true}
                  className={`
                    flex items-center px-4 py-3 sm:py-2.5 rounded-lg relative transition-all duration-200 touch-manipulation min-h-[44px]
                    ${pathname === item.path
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                    }
                    ${collapsed ? 'justify-center' : ''}
                    ${'locked' in item && item.locked ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                  {...('locked' in item && item.locked ? { onClick: (e: React.MouseEvent) => e.preventDefault() } : {})}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="ml-3 whitespace-pre-line">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Verktyg Sektion */}
        <div>
          {!collapsed && (
            <h3 className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Verktyg
            </h3>
          )}
          <ul className="space-y-1">
            {toolsItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  prefetch={true}
                  className={`
                    flex items-center px-4 py-3 sm:py-2.5 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px]
                    ${pathname === item.path
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="ml-3 whitespace-pre-line">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mina CV:n Sektion */}
        <div>
          {!collapsed && (
            <h3 className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Mina CV:n
            </h3>
          )}
          <ul className="space-y-1">
            {cvsItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  prefetch={true}
                  className={`
                    flex items-center px-4 py-3 sm:py-2.5 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px]
                    ${pathname === item.path || pathname.startsWith(item.path + '/')
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="ml-3">{item.label}</span>
                      {'count' in item && typeof item.count === 'number' && item.count > 0 && (
                        <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Mina Dokument Sektion */}
        <div>
          {!collapsed && (
            <h3 className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Mina Dokument
            </h3>
          )}
          <ul className="space-y-1">
            {documentsItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  prefetch={true}
                  className={`
                    flex items-center px-4 py-3 sm:py-2.5 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px]
                    ${pathname === item.path
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="ml-3 whitespace-pre-line">{item.label}</span>
                      {'count' in item && typeof item.count === 'number' && item.count > 0 && (
                        <span className="ml-auto text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Profil Sektion - Always Visible */}
        <div>
          {!collapsed && (
            <h3 className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Min Profil
            </h3>
          )}
          <ul className="space-y-1">
            {profileSubItems.map((subItem) => (
              <li key={subItem.path}>
                <Link
                  href={subItem.path}
                  prefetch={true}
                  className={`
                    flex items-center px-4 py-3 sm:py-2.5 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px]
                    ${pathname === subItem.path
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="flex-shrink-0">{subItem.icon}</span>
                  {!collapsed && <span className="ml-3">{subItem.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* Hjälp & Support */}
      <div className="p-4 border-t border-slate-300 space-y-2 bg-gradient-to-r from-white to-slate-50/50">
        <Link
          href="/dashboard/bugg-feedback"
          prefetch={true}
          className={`
            flex items-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 py-3 sm:py-2 px-2 rounded-lg transition-all shadow-sm hover:shadow-md font-medium touch-manipulation min-h-[44px]
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Bug className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Buggar & Feedback</span>}
        </Link>

        <Link
          href="/dashboard/kontakt"
          prefetch={true}
          className={`
            flex items-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 py-3 sm:py-2 px-2 rounded-lg transition-all shadow-sm hover:shadow-md font-medium touch-manipulation min-h-[44px]
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Mail className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Kontakt</span>}
        </Link>

        {/* ADMIN PANEL KNAPP - Endast för super_admin */}
        {isAdmin && (
          <Link
            href="/admin"
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
            flex items-center text-slate-700 hover:text-red-600 hover:bg-red-50 py-3 sm:py-2 px-2 rounded-lg transition-all shadow-sm hover:shadow-md font-medium touch-manipulation min-h-[44px]
            ${collapsed ? 'justify-center' : 'w-full'}
          `}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Logga ut</span>}
        </button>
      </div>
    </div>
  );
}