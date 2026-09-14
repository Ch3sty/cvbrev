/**
 * Adminlayouten är en server component.
 *
 * Den gamla layouten var 'use client' och kontrollerade behörigheten i en
 * useEffect, alltså efter att sidan redan renderats och efter att sidornas
 * data redan begärts. Kontrollen skedde med andra ord för sent för att vara
 * en kontroll. Nu läses sessionen här, rollen slås upp mot admin_users med
 * service role, och den som inte är super_admin skickas till /dashboard
 * innan något renderas.
 *
 * Adminen ska inte indexeras och inte förhandsvisas.
 */
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getSuperAdminUserId } from '@/lib/admin/requireSuperAdmin';
import AdminShell from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

// Behörigheten får aldrig cachas per bygge.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSuperAdminUserId();

  if (!userId) {
    redirect('/dashboard');
  }

  return <AdminShell>{children}</AdminShell>;
}
