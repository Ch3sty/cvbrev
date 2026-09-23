'use client';

/**
 * Skickar inloggade från startsidan och Funktioner till dashboarden.
 * Användaren läses ur AuthContext, som bara laddar Supabase-klienten när det
 * finns en sessionscookie; en egen auth.getUser() här betalades förut av
 * varje besökare.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  return null;
}
