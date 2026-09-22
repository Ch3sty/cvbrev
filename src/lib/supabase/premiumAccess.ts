// src/lib/supabase/premiumAccess.ts
// ============================================================================
// Serverside-kontroll av behörighet per paket.
// docs/plan-paket-och-onboarding.md avsnitt 5.
//
// Tre källor läses, aldrig fler än två rundturer:
//   1. profiles: premium_scope, premium_until och subscription_tier i en enda
//      select. Kolumnen speglar prenumerationen, aldrig ett engångsköp.
//   2. admin_users: admin läses alltid som 'allt', precis som förut.
//   3. premium_grants: engångsköpen bär sitt eget scope och sin egen sluttid.
//
// Överlappsregeln (avsnitt 5, noten om överlappande köp): en engångsdag
// ovanpå en spårprenumeration är det enda fallet där två behörigheter lever
// samtidigt. Vi läser det högsta scope som är giltigt just nu, alltså 'allt'
// om en grants-rad med scope 'allt' inte gått ut, annars prenumerationens
// scope. Utan den regeln kapar dygnet spårets scope när det löper ut.
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import { scopeHasFeature, type Feature, type Scope } from '@/lib/access/features';

/** 'any' betyder "någon betald behörighet alls", alltså gamla frågan. */
export type AccessQuery = Feature | 'any';

interface ProfilRad {
  premium_scope?: string | null;
  premium_until?: string | null;
  subscription_tier?: string | null;
}

function arGiltigtScope(varde: unknown): varde is Scope {
  return varde === 'cv' || varde === 'tester' || varde === 'allt';
}

/**
 * Scopet som prenumerationen eller den manuella premiumtiden ger.
 *
 * Befintlig premium utan scope läses som 'allt': ingen befintlig kund får
 * mindre än i dag. Ligger scope kvar på en profil vars premium löpt ut ger
 * den ingenting, alltså null.
 */
function scopeFranProfil(profile: ProfilRad | null | undefined): Scope | null {
  if (!profile) return null;

  const harPremiumUntil =
    !!profile.premium_until && new Date(profile.premium_until) > new Date();
  const harPremiumTier = profile.subscription_tier === 'premium';
  if (!harPremiumUntil && !harPremiumTier) return null;

  return arGiltigtScope(profile.premium_scope) ? profile.premium_scope : 'allt';
}

interface Behorighet {
  scope: Scope | null;
  isAdmin: boolean;
}

/**
 * Läser allt behörigheten behöver: profilraden, adminraden och de grants som
 * ännu inte gått ut. Tre frågor parallellt, ingen i en loop.
 */
async function lasBehorighet(
  supabase: SupabaseClient<any, any, any>,
  userId: string
): Promise<Behorighet> {
  const nu = new Date().toISOString();

  const [{ data: profile }, { data: adminUser }, { data: grants }] = await Promise.all([
    supabase
      .from('profiles')
      .select('premium_scope, premium_until, subscription_tier')
      .eq('id', userId)
      .single(),
    supabase.from('admin_users').select('role').eq('id', userId).single(),
    supabase
      .from('premium_grants')
      .select('scope, premium_until_after')
      .eq('user_id', userId)
      .gt('premium_until_after', nu),
  ]);

  const isAdmin = adminUser?.role === 'admin' || adminUser?.role === 'super_admin';
  if (isAdmin) return { scope: 'allt', isAdmin: true };

  const prenumeration = scopeFranProfil(profile as ProfilRad | null);

  // Överlappet: en giltig grants-rad med scope 'allt' höjer scopet så länge
  // den lever, utan att röra profiles.premium_scope. Grants med ett smalare
  // scope får aldrig sänka en bredare prenumeration.
  const harAllaDagen = (grants ?? []).some(
    (rad: { scope?: string | null }) => (rad?.scope ?? 'allt') === 'allt'
  );
  if (harAllaDagen) return { scope: 'allt', isAdmin: false };

  if (prenumeration) return { scope: prenumeration, isAdmin: false };

  // Ett grants med smalare scope ger fortfarande det scopet, om profilen inte
  // ger något alls.
  const smalare = (grants ?? [])
    .map((rad: { scope?: string | null }) => rad?.scope)
    .find(arGiltigtScope);

  return { scope: smalare ?? null, isAdmin: false };
}

/**
 * Det högsta giltiga scopet just nu, eller null för gratis.
 * Admin är alltid 'allt'.
 */
export async function getUserScope(
  supabase: SupabaseClient<any, any, any>,
  userId: string
): Promise<Scope | null> {
  const { scope } = await lasBehorighet(supabase, userId);
  return scope;
}

/**
 * Har användaren den här funktionen?
 *
 * 'any' svarar på den gamla frågan, alltså om det finns någon betald
 * behörighet alls. Den används under migreringen av de rutter som ännu inte
 * bytt till en specifik feature.
 */
export async function userHasAccess(
  // Rutterna skapar klienten utan Database-generic, så vi tar emot den brett.
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  feature: AccessQuery
): Promise<boolean> {
  const { scope } = await lasBehorighet(supabase, userId);
  if (!scope) return false;
  if (feature === 'any') return true;
  return scopeHasFeature(scope, feature);
}

/**
 * Gamla frågan, oförändrad signatur. Behålls under migreringen så att inget
 * går sönder i ett mellanläge, och för de rutter där behörigheten inte hänger
 * på något enskilt paket.
 */
export async function userHasPremiumAccess(
  supabase: SupabaseClient<any, any, any>,
  userId: string
): Promise<boolean> {
  return userHasAccess(supabase, userId, 'any');
}
