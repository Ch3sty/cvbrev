// src/app/admin/layout.tsx
import { Metadata } from 'next';
import AdminSidebar from '@/components/admin/sidebar';
import AdminHeader from '@/components/admin/header';

export const metadata: Metadata = {
  title: 'CVBrev Admin Dashboard',
  description: 'Administratörsverktyg för CVBrev-plattformen',
  robots: 'noindex, nofollow' // Detta förhindrar indexering
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-navy-950 text-white">
      {/* Admin Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin Header */}
        <AdminHeader />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}