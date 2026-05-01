'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client-manager';

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && isMounted) {
          router.push('/dashboard');
        }
      } catch {
        // Tyst — landningssidan ska visas även om auth-checken failar
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return null;
}
