// src/app/admin/layout.tsx
'use client';
import AdminSidebar from '@/components/admin/sidebar';
import AdminHeader from '@/components/admin/header';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    async function checkAdmin() {
      try {
        const supabase = getSupabaseClient();
        
        // Hämta aktuell användare
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("Ingen användare hittad, omdirigerar till login");
          router.push('/login');
          return;
        }
        
        // Mer detaljerad loggning
        console.log("Användarens ID:", user.id);
        console.log("Fullständig admin-sökning:", {
          from: 'admin_users',
          select: 'role',
          eq: ['id', user.id],
          eq2: ['role', 'super_admin']
        });
        
        // Kontrollera om användaren är admin
        const { data, error } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', user.id)
          .eq('role', 'super_admin')
          .single();
          
        // Logga resultatet av spörjningen
        console.log("Admin-kontroll resultat:", { data, error: error?.message, errorCode: error?.code });
        
        if (error || !data) {
          console.log("Användaren är inte admin, omdirigerar till startsidan");
          setIsAdmin(false);
          router.push('/');
          return;
        }
        
        console.log("Användaren är admin, visar admin-gränssnittet");
        setIsAdmin(true);
      } catch (error) {
        console.error("Fel vid admin-kontroll:", error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAdmin();
  }, [router]);
  // Visa en laddningsskärm medan vi kontrollerar behörigheten
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-t-2 border-b-2 border-pink-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-700">Kontrollerar behörighet...</p>
        </div>
      </div>
    );
  }
  // Om användaren inte är admin, visa inget
  // Router.push i useEffect kommer att hantera omdirigeringen
  if (isAdmin === false) {
    return null;
  }
  // Om användaren är admin, visa admin-gränssnittet
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Header */}
        <AdminHeader />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}