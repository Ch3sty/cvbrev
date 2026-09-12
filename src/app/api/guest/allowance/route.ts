import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';

// GET /api/guest/allowance -> { guestInvitations: {...} | null }
//
// Veckokvoten för gästinbjudningar. Låg tidigare inbakad i
// /api/rewards/status, som togs bort tillsammans med XP och nivåer
// (docs/plan-inloggat-omdesign.md, våg 2 punkt 21). Kvoten har aldrig haft
// med gamification att göra: den hänger på premium, inte på poäng, och
// gästinbjudningarna är en del av referral-flödet som lever vidare.

export const dynamic = 'force-dynamic';

/** Gratis antal gästinbjudningar per vecka innan en rad skapats. */
const DEFAULT_ALLOWANCE = 5;

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient({ cookies: cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('premium_until, subscription_tier')
    .eq('id', user.id)
    .single();

  const hasPremiumUntil =
    profile?.premium_until && new Date(profile.premium_until) > new Date();
  const isPremium = hasPremiumUntil || profile?.subscription_tier === 'premium';

  // Gästinbjudningar är en premiumförmån. Gratis konton får null, precis som
  // förut, så gränssnittet kan visa sitt eget tomma läge.
  if (!isPremium) {
    return NextResponse.json({ guestInvitations: null });
  }

  const { data: allowance } = await (supabase as any)
    .from('weekly_guest_allowances')
    .select('base_allowance, used_invitations, reset_at, first_used_at')
    .eq('user_id', user.id)
    .maybeSingle();

  // Ingen rad ännu: den skapas vid första inbjudan, så vi svarar med taket.
  const guestInvitations = allowance
    ? {
        total: allowance.base_allowance,
        used: allowance.used_invitations,
        remaining: Math.max(0, allowance.base_allowance - allowance.used_invitations),
        resetAt: allowance.reset_at,
        firstUsedAt: allowance.first_used_at,
      }
    : {
        total: DEFAULT_ALLOWANCE,
        used: 0,
        remaining: DEFAULT_ALLOWANCE,
        resetAt: null,
        firstUsedAt: null,
      };

  return NextResponse.json({ guestInvitations });
}
