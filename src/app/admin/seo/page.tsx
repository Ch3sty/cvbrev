// src/app/admin/seo/page.tsx
import SEODashboard from '@/components/admin/seo/SEODashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO Dashboard | Admin - Jobbcoach.ai',
  description: 'SEO performance tracking, keyword monitoring och content analytics för Jobbcoach.ai',
  robots: 'noindex, nofollow',
};

export default function SEODashboardPage() {
  return <SEODashboard />;
}