'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  FileText,
  File,
  CreditCard,
  BarChart2,
  Settings,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Database, // Ikon för underhåll
  Search, // Ny ikon för SEO
  TrendingUp, // Ytterligare ikon för analytics
  DollarSign, // Ikon för modellpriser
  BookOpen, // Ikon för AI Documents
  Filter, // Ikon för Konvertering/Funnel
  Activity, // Ikon för Aktivitetsflöde
  Mail, // Ikon för E-poststatistik
  Briefcase // Ikon för Rekryterare
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const supabase = getSupabaseClient();
  
  // Navigationslänkar - Bara befintliga sidor
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { path: '/admin/funnel', label: 'Konvertering', icon: <Filter className="w-5 h-5" /> },
    { path: '/admin/users', label: 'Användare', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/rekryterare', label: 'Rekryterare', icon: <Briefcase className="w-5 h-5" /> },
    { path: '/admin/activity', label: 'Aktivitetsflöde', icon: <Activity className="w-5 h-5" /> },
    { path: '/admin/letters', label: 'Brev', icon: <FileText className="w-5 h-5" /> },
    { path: '/admin/email', label: 'E-post', icon: <Mail className="w-5 h-5" /> },
    { path: '/admin/cvs', label: 'CV:n', icon: <File className="w-5 h-5" /> },
    { path: '/admin/ai-documents', label: 'AI Dokument', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/admin/statistics', label: 'Statistik', icon: <BarChart2 className="w-5 h-5" /> },
    { path: '/admin/seo', label: 'SEO & Content', icon: <Search className="w-5 h-5" /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { path: '/admin/pricing', label: 'Modellpriser', icon: <DollarSign className="w-5 h-5" /> },
    { path: '/admin/maintenance', label: 'Underhåll', icon: <Database className="w-5 h-5" /> },
  ];
  
  // Logga ut funktion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };
  
  return (
    <div
      className={`bg-white h-full ${
        collapsed ? 'w-16' : 'w-64'
      } transition-all duration-300 border-r border-gray-200 flex flex-col shadow-sm`}
    >
      {/* Logo och Collapse-knapp */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="text-xl font-bold">
            <span className="text-gray-900">Jobb</span>
            <span className="text-pink-600">coach</span>
            <span className="ml-2 px-2 py-0.5 bg-pink-600 text-white text-xs rounded font-semibold">ADMIN</span>
          </div>
        )}

        {collapsed && <span className="text-pink-600 text-2xl font-bold mx-auto">A</span>}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg transition-colors
                  ${pathname === item.path
                    ? 'bg-pink-50 text-pink-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
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
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`
            flex items-center text-gray-700 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors
            ${collapsed ? 'justify-center w-full' : 'w-full'}
          `}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-3">Logga ut</span>}
        </button>
      </div>
    </div>
  );
}