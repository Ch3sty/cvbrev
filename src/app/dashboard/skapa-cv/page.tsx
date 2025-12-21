/**
 * Skapa CV Page - Steg-för-steg guide för att skapa CV från grunden
 * Kräver inloggning för att starta
 */
'use client'

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/use-profile';
import CVCreatorWizard from './components/CVCreatorWizard';

export default function SkapaCVPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const authCheckedRef = useRef(false);

  // Authentication Check
  useEffect(() => {
    if (!authCheckedRef.current && !profileLoading) {
      authCheckedRef.current = true;
      if (!profile) {
        router.push('/login?redirect=/dashboard/skapa-cv');
      }
    }
  }, [profile, profileLoading, router]);

  // Show loading state
  if (profileLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-pink-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  return <CVCreatorWizard />;
}
