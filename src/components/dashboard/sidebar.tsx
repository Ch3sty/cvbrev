'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  GraduationCap
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const supabase = getSupabaseClient();
  
  // Navigationslänkar för användardashboard
  const navItems = [
    {
      path: '/dashboard',
      label: 'Översikt',
      icon: <LayoutDashboard className="w-5 h-5" />,
      section: 'main'
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
        {/* Översikt */}
        <div>
          <ul className="space-y-1">
            {overviewItems.map((item) => (
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