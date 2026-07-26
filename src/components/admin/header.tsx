'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

/**
 * Adminheader i den nya designstandarden: dynamisk sidtitel utifrån rutten
 * (ingen hårdkodad "Admin Dashboard" på varje sida) och profilchip.
 * Fejksökfältet och notisklockan utan notislogik är borttagna med flit.
 */

const SIDTITLAR: Record<string, string> = {
  '/admin': 'Översikt',
  '/admin/funnel': 'Konvertering',
  '/admin/users': 'Användare',
  '/admin/kandidatpool': 'Kandidatpoolen',
  '/admin/rekryterare': 'Rekryterare',
  '/admin/activity': 'Aktivitetsflöde',
  '/admin/letters': 'Brev',
  '/admin/email': 'E-post',
  '/admin/cvs': 'CV:n',
  '/admin/ai-documents': 'AI-dokument',
  '/admin/statistics': 'Statistik',
  '/admin/pricing': 'Modellpriser',
  '/admin/maintenance': 'Underhåll',
};

function titelForPath(pathname: string | null): string {
  if (!pathname) return 'Admin';
  if (SIDTITLAR[pathname]) return SIDTITLAR[pathname];
  if (pathname.startsWith('/admin/users/')) return 'Användardetaljer';
  const prefix = Object.keys(SIDTITLAR)
    .filter((p) => p !== '/admin' && pathname.startsWith(p))
    .sort((a, b) => b.length - a.length)[0];
  return prefix ? SIDTITLAR[prefix] : 'Admin';
}

export default function AdminHeader() {
  const pathname = usePathname();
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profil } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single();

        const { data: adminData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', user.id)
          .single();

        setProfileData({ ...profil, role: adminData?.role });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    getAdminInfo();
  }, []);

  return (
    <header className="bg-white border-b border-slate-200/70 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">{titelForPath(pathname)}</h1>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden md:block">
            {isLoading ? (
              <div className="w-20 h-4 bg-slate-200 rounded animate-pulse"></div>
            ) : (
              <>
                <div className="text-sm font-medium text-slate-900">
                  {profileData?.full_name || 'Admin'}
                </div>
                <div className="text-xs text-slate-500">
                  {profileData?.role === 'super_admin' ? 'Super admin' : 'Admin'}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
