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
            .select('premium_until')
            .eq('id', userId)
            .single();

          if (profileError) {
            console.error('Profile query error:', profileError);
            return;
          }

          setIsPremium(profile?.premium_until && new Date(profile.premium_until) > new Date());
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
      path: '/dashboard/my-letters',
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
      className={`bg-navy-900 h-full ${
        collapsed ? 'w-16' : 'w-64'
      } transition-all duration-300 border-r border-gray-700 flex flex-col`}
    >
      {/* Logo och Collapse-knapp */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="text-xl font-bold">
            <span className="text-white">cv</span>
            <span className="text-pink-500">brev</span>
          </div>
        )}
        
        {collapsed && <span className="text-pink-500 text-2xl font-bold mx-auto">C</span>}
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-navy-800"
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
              className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-lg border border-pink-600/30 hover:border-pink-500/50 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-pink-400 group-hover:text-pink-300" />
                {!collapsed && (
                  <div>
                    <span className="text-sm font-semibold text-white">Bjud in en vän</span>
                    <p className="text-xs text-gray-400">Få 7 dagar Premium</p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <ChevronRight className="w-4 h-4 text-pink-400 opacity-50 group-hover:opacity-100" />
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
                    flex items-center px-4 py-2.5 relative
                    ${pathname === item.path
                      ? 'bg-pink-600 text-white'
                      : 'text-gray-300 hover:bg-navy-800 hover:text-white'
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
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Verktyg
            </h3>
          )}
          <ul className="space-y-1">
            {toolsItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`
                    flex items-center px-4 py-2.5 
                    ${pathname === item.path 
                      ? 'bg-pink-600 text-white' 
                      : 'text-gray-300 hover:bg-navy-800 hover:text-white'
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
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                      ? 'bg-pink-600 text-white'
                      : 'text-gray-300 hover:bg-navy-800 hover:text-white'
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
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Mina Dokument
            </h3>
          )}
          <ul className="space-y-1">
            {documentsItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`
                    flex items-center px-4 py-2.5
                    ${pathname === item.path
                      ? 'bg-pink-600 text-white'
                      : 'text-gray-300 hover:bg-navy-800 hover:text-white'
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
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Min Profil
            </h3>
          )}
          <ul className="space-y-1">
            {profileItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`
                    flex items-center px-4 py-2.5 
                    ${pathname === item.path 
                      ? 'bg-pink-600 text-white' 
                      : 'text-gray-300 hover:bg-navy-800 hover:text-white'
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
      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link 
          href="/kontakt"
          className={`
            flex items-center text-gray-300 hover:text-white py-2
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Mail className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Kontakt</span>}
        </Link>
        
        <button 
          onClick={handleLogout}
          className={`
            flex items-center text-gray-300 hover:text-white
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