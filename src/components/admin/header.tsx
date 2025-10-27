'use client';

import { useState, useEffect } from 'react';
import { Bell, User, Search } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

export default function AdminHeader() {
  const [profileData, setProfileData] = useState<{
    full_name?: string;
    email?: string;
    role?: string;
  }>({});
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function getAdminInfo() {
      setIsLoading(true);
      try {
        const supabase = getSupabaseClient();
        
        // Hämta användardata
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Hämta profildata
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();
        
        // Hämta admin-roll
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setProfileData({
          ...profileData,
          role: adminData?.role
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    getAdminInfo();
  }, []);
  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side - Title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Right side - Search, notifications, profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Sök..."
              className="px-2 py-0.5 bg-transparent border-none text-gray-900 placeholder-gray-500 outline-none w-40 text-sm"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 relative transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 bg-pink-500 rounded-full w-2 h-2"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white flex items-center justify-center shadow-sm">
              <User className="w-5 h-5" />
            </div>

            <div className="hidden md:block">
              {isLoading ? (
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <>
                  <div className="text-sm font-medium text-gray-900">
                    {profileData?.full_name || 'Admin User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {profileData?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}