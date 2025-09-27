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
  Gift
} from 'lucide-react';
export default function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
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
      icon: <Brain className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/kompetensutveckling',
      label: 'Kompetensutveckling',
      icon: <Brain className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/learning-plans',
      label: 'Mina Lärandeplaner',
      icon: <GraduationCap className="w-5 h-5" />,
      section: 'learning'
    },
    {
      path: '/dashboard/cv-mallar',
      label: 'CV-Mallar',
      icon: <Palette className="w-5 h-5" />,
      section: 'tools'
    },
    {
      path: '/dashboard/mina-brev',
      label: 'Mina Brev',
      icon: <FileText className="w-5 h-5" />,
      section: 'documents'
    },
    {
      path: '/dashboard/profil',
      label: 'Min Profil',
      icon: <User className="w-5 h-5" />,
      section: 'profile'
    }
  ];
  
  // Logga ut funktion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };
  
  // Gruppera navigation items
  const toolsItems = navItems.filter(item => item.section === 'tools');
  const learningItems = navItems.filter(item => item.section === 'learning');
  const documentsItems = navItems.filter(item => item.section === 'documents');
  const profileItems = navItems.filter(item => item.section === 'profile');
  const overviewItems = navItems.filter(item => item.section === 'main');
  
  return (
    <div
      className={`bg-white h-full ${
        collapsed ? 'w-16' : 'w-64'
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
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors shadow-sm hover:shadow-md"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 py-4 space-y-6">
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
                  {!collapsed && <span className="ml-3">{item.label}</span>}
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
                    flex items-center px-4 py-2.5 rounded-lg transition-all duration-200
                    ${pathname === item.path
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Lärande Sektion */}
        <div>
          {!collapsed && (
            <h3 className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Lärande
            </h3>
          )}
          <ul className="space-y-1">
            {learningItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`
                    flex items-center px-4 py-2.5
                    ${pathname === item.path || pathname.startsWith(item.path + '/')
                      ? 'bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border-l-4 border-pink-600 shadow-lg font-semibold rounded-lg'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm rounded-lg'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
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
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Profil Sektion */}
        <div>
          {!collapsed && (
            <h3 className="px-4 py-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
              Min Profil
            </h3>
          )}
          <ul className="space-y-1">
            {profileItems.map((item) => (
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
                  {!collapsed && <span className="ml-3">{item.label}</span>}
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