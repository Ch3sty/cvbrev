'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  FileText, 
  CreditCard, 
  BarChart2, 
  Settings,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Database // Ny ikon för underhåll
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const supabase = getSupabaseClient();
  
  // Navigationslänkar - Lagt till underhållssidan
  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { path: '/admin/users', label: 'Användare', icon: <Users className="w-5 h-5" /> },
    { path: '/admin/letters', label: 'Brev', icon: <FileText className="w-5 h-5" /> },
    { path: '/admin/cvs', label: 'CV:n', icon: <FileText className="w-5 h-5" /> },
    { path: '/admin/subscriptions', label: 'Prenumerationer', icon: <CreditCard className="w-5 h-5" /> },
    { path: '/admin/statistics', label: 'Statistik', icon: <BarChart2 className="w-5 h-5" /> },
    { path: '/admin/maintenance', label: 'Underhåll', icon: <Database className="w-5 h-5" /> }, // Ny!
    { path: '/admin/settings', label: 'Inställningar', icon: <Settings className="w-5 h-5" /> },
  ];
  
  // Logga ut funktion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };
  
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
            <span className="ml-1 px-1 py-0.5 bg-pink-600 text-white text-xs rounded">ADMIN</span>
          </div>
        )}
        
        {collapsed && <span className="text-pink-500 text-2xl font-bold mx-auto">A</span>}
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-navy-800"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
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
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
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