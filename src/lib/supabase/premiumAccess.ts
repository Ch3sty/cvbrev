// src/lib/supabase/premiumAccess.ts
// ============================================================================
// Serverside-kontroll av premium-åtkomst. Samma regler som guest/invite:
// manuell premium (premium_until i framtiden) ELLER Stripe-prenumeration
// (subscription_tier = 'premium'). Admins har alltid åtkomst.
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';

export async function userHasPremiumAccess(
  // Rutterna skapar klienten utan Database-generic, så vi tar emot den brett.
  supabase: SupabaseClient<any, any, any>,
  userId: string
): Promise<boolean> {
  const [{ data: profile }, { data: adminUser }] = await Promise.all([
    supabase
      .from('profiles')
      .select('premium_until, subscription_tier')
      .eq('id', userId)
      .single(),
    supabase
      .from('admin_users')
      .select('role')
      .eq('id', userId)
      .single(),
  ]);

  const isAdmin = adminUser?.role === 'admin' || adminUser?.role === 'super_admin';
  const hasPremiumUntil =
    !!profile?.premium_until && new Date(profile.premium_until) > new Date();
  const hasPremiumTier = profile?.subscription_tier === 'premium';

  return isAdmin || hasPremiumUntil || hasPremiumTier;
}
