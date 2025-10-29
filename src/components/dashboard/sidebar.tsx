'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
import {
  LayoutDashboard,
  PenTool,
  FileText,
  Brain,
  Palette,
  User,
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
  Settings,
  Linkedin,
  Shield,
  X
} from 'lucide-react';

interface DashboardSidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function DashboardSidebar({ onClose, isMobile }: DashboardSidebarProps = {}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = getSupabaseClient();

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
            .select('premium_until, subscription_tier')
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

          // Check admin status
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', userId)
            .eq('role', 'super_admin')
            .single();

          setIsAdmin(!!adminData);
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };
    checkPremiumStatus();
  }, [supabase]);
  
  // Navigationslänkar för användardashboard
  const navItems = [
    {
      path: '/dashboard',
      label: 'Översikt',
      icon: <LayoutDashboard className="w-5 h-5" />,
      section: 'main'
    },
    {
      path: '/dashboard/rewards',
      label: 'Belöningar & Förmåner',
      icon: <Trophy className="w-5 h-5" />,
      section: 'main',
      highlight: true
    },
    {
      path: '/dashboard/skapa-brev',
      label: 'Skapa personligt brev',
      icon: <PenTool className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/cv-analys',
      label: 'CV-Analys',
      icon: <Search className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/linkedin-optimizer',
      label: 'LinkedIn\nProfiloptimering',
      icon: <Linkedin className="w-5 h-5" />,
      section: 'tools',
      highlight: true
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
      label: 'CV-Mallar',
      icon: <Palette className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/profil/cv',
      label: 'Mina CV:n',
      icon: <FileText className="w-5 h-5" />,
      section: 'cvs',
      highlight: true
    },
    {
      path: '/dashboard/mina-brev',
      label: 'Mina Brev',
      icon: <FileText className="w-5 h-5" />,
      section: 'documents'
    },
  ];

  // Profile submenu items
  const profileSubItems = [
    {
      path: '/dashboard/profil',
      label: 'Profilinformation',
      icon: <User className="w-4 h-4" />,
      highlight: false
    },
    {
      path: '/dashboard/profil/prenumeration',
      label: 'Prenumeration',
      icon: <Crown className="w-4 h-4" />,
      highlight: true,
      highlightType: 'premium'
    },
    {
      path: '/dashboard/profil/installningar',
      label: 'Inställningar',
      icon: <Settings className="w-4 h-4" />,
      highlight: false
    }
  ];
  
  // Logga ut funktion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };
  
  // Gruppera navigation items
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
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors lg:hidden"
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
      <nav className="flex-1 py-4 space-y-6 overflow-y-auto">
        {/* Premium Gästinbjudan - flyttad till rätt plats */}
        {isPremium && (
          <div className="px-4">
            <Link
              href="/dashboard/invite-friends"
              className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-300 hover:border-pink-400 hover:shadow-xl transition-all duration-300 group shadow-lg"
            >
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-pink-600 group-hover:text-pink-700" />
                {!collapsed && (
                  <div>
                    <span className="text-sm font-bold text-slate-900">Bjud in en vän</span>
                    <p className="text-xs text-slate-700">Få 7 dagar Premium</p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <ChevronRight className="w-4 h-4 text-pink-600 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              )}
            </Link>
          </div>
        )}

        {/* Översikt */}
        <div>
          <ul className="space-y-1">
            {overviewItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`
                    flex items-center px-4 py-2.5 rounded-lg relative transition-all duration-200
                    ${pathname === item.path
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="ml-3 whitespace-pre-line">{item.label}</span>}
                  {'highlight' in item && item.highlight && !collapsed && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold rounded-full animate-pulse">
                      NY
                    </span>
                  )}
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
                  className={`
                    flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 relative
                    ${pathname === item.path
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="ml-3 whitespace-pre-line">{item.label}</span>}
                  {'highlight' in item && item.highlight && !collapsed && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold rounded-full animate-pulse shadow-lg">
                      NY
                    </span>
                  )}
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
                  className={`
                    flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 relative
                    ${pathname === item.path || pathname.startsWith(item.path + '/')
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                    }
                    ${collapsed ? 'justify-center' : ''}
                    ${'highlight' in item && item.highlight ? 'ring-2 ring-green-400/30' : ''}
                  `}
                >
                  <span className={`flex-shrink-0 ${'highlight' in item && item.highlight ? 'text-green-600' : ''}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="ml-3">{item.label}</span>}
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
                  className={`
                    flex items-center px-4 py-2.5 rounded-lg transition-all duration-200
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
                  className={`
                    flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 relative
                    ${pathname === subItem.path
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                    }
                    ${collapsed ? 'justify-center' : ''}
                    ${subItem.highlight && subItem.highlightType === 'premium' ? 'ring-2 ring-yellow-400/40' : ''}
                  `}
                >
                  <span className={`flex-shrink-0 ${
                    subItem.highlight && subItem.highlightType === 'premium' ? 'text-yellow-600' : ''
                  }`}>
                    {subItem.icon}
                  </span>
                  {!collapsed && (
                    <span className={`ml-3 ${subItem.highlight ? 'font-bold' : ''}`}>
                      {subItem.label}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* Hjälp & Support */}
      <div className="p-4 border-t border-slate-300 space-y-2 bg-gradient-to-r from-white to-slate-50/50">
        <Link
          href="/kontakt"
          className={`
            flex items-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 py-2 px-2 rounded-lg transition-all shadow-sm hover:shadow-md font-medium
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
              flex items-center py-3 px-3 rounded-xl transition-all shadow-lg hover:shadow-2xl font-bold
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
            flex items-center text-slate-700 hover:text-red-600 hover:bg-red-50 py-2 px-2 rounded-lg transition-all shadow-sm hover:shadow-md font-medium
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