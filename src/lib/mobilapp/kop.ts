// src/lib/mobilapp/kop.ts
// Premium-läget för appens köpvy och konto: har kontot Premium, var köptes
// det och när gäller det till. Behörigheten är premiumAccess (samma fråga som
// passen ställer); källan och datumet läses ur premium_grants och profilen.

import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getUserScope } from '@/lib/supabase/premiumAccess';
import { scopeHasFeature } from '@/lib/access/features';
import { APP_KALLOR } from './kopRevenuecat';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = SupabaseClient<any, any, any>;

/** play: Google Play, app_store: App Store, webben: Stripe eller annat på jobbcoach.ai. */
export type PremiumKalla = 'play' | 'app_store' | 'webben';

export interface PremiumLage {
  premium: boolean;
  kalla: PremiumKalla | null;
  /** Sista dagen Premium gäller, ISO-tid, när den är känd. */
  till: string | null;
  /** Webbens prenumeration förnyas av Stripe; appens av butiken. */
  prenumeration: boolean;
}

/** Källan ur en grants-rad eller profilens premium_source. */
export function kallaFor(source: string | null | undefined): PremiumKalla {
  if (source?.startsWith('app_store')) return 'app_store';
  if (source && APP_KALLOR.includes(source)) return 'play';
  return 'webben';
}

export async function hamtaPremiumLage(supabase: Klient, userId: string): Promise<PremiumLage> {
  const nu = new Date().toISOString();
  const [scope, grantsRes, profilRes] = await Promise.all([
    getUserScope(supabase, userId).catch(() => null),
    supabase
      .from('premium_grants')
      .select('source, premium_until_after')
      .eq('user_id', userId)
      .gt('premium_until_after', nu)
      .order('premium_until_after', { ascending: false })
      .limit(5),
    supabase.from('profiles').select('premium_until, premium_source, subscription_status').eq('id', userId).maybeSingle(),
  ]);
  const premium = scopeHasFeature(scope, 'tests_above_base');
  if (!premium) return { premium: false, kalla: null, till: null, prenumeration: false };

  const grants = (grantsRes.data ?? []) as Array<{ source: string | null; premium_until_after: string }>;
  const app = grants.find((g) => g.source && APP_KALLOR.includes(g.source));
  if (app) return { premium: true, kalla: kallaFor(app.source), till: app.premium_until_after, prenumeration: true };

  const profil = (profilRes.data ?? null) as { premium_until?: string | null; premium_source?: string | null; subscription_status?: string | null } | null;
  const stripe = profil?.subscription_status === 'active' || profil?.subscription_status === 'trialing';
  const till = grants[0]?.premium_until_after ?? (profil?.premium_until && profil.premium_until > nu ? profil.premium_until : null);
  return { premium: true, kalla: 'webben', till: stripe ? null : till, prenumeration: stripe };
}
