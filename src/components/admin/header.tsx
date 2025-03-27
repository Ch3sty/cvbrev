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
    <header className="bg-navy-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Title with breadcrumbs */}
        <div>
          <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
        </div>
        
        {/* Right side - Search, notifications, profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex items-center bg-navy-700 rounded-md px-3 py-1.5">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Sök..." 
              className="px-2 py-1 bg-transparent border-none text-white outline-none w-40"
            />
          </div>
          
          {/* Notifications */}
          <button className="p-1.5 rounded-full hover:bg-navy-700 relative">
            <Bell className="w-5 h-5 text-gray-300" />
            <span className="absolute top-0 right-0 bg-pink-500 rounded-full w-2 h-2"></span>
          </button>
          
          {/* Profile */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center mr-2">
              <User className="w-4 h-4" />
            </div>
            
            <div className="hidden md:block">
              {isLoading ? (
                <div className="w-20 h-4 bg-navy-700 rounded animate-pulse"></div>
              ) : (
                <>
                  <div className="text-sm font-medium text-white">
                    {profileData?.full_name || 'Admin User'}
                  </div>
                  <div className="text-xs text-gray-400">
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