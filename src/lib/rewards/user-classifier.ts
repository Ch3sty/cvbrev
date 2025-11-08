/**
 * User Classifier
 *
 * Determines user type and premium status for reward activation
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { UserClassification, UserType } from './types';

export async function classifyUser(
  supabase: SupabaseClient,
  userId: string
): Promise<UserClassification> {
  // Fetch user profile with all relevant fields
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_tier, premium_until, stripe_customer_id, subscription_id, subscription_status')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    throw new Error('Failed to fetch user profile');
  }

  const hasStripeSub = !!profile.subscription_id && profile.subscription_status === 'active';
  const premiumUntil = profile.premium_until ? new Date(profile.premium_until) : null;
  const hasValidPremiumUntil = premiumUntil && premiumUntil > new Date();
  const hasTemporaryPremium = !!(hasValidPremiumUntil && !hasStripeSub);

  let type: UserType = 'free';

  if (hasStripeSub) {
    type = 'paid_premium';
  } else if (hasTemporaryPremium) {
    type = 'temporary_premium';
  }

  return {
    type,
    hasStripeSub,
    hasTemporaryPremium,
    premiumUntil,
    stripeCustomerId: profile.stripe_customer_id,
    subscriptionId: profile.subscription_id
  };
}

/**
 * Helper to check if user can receive temporary premium
 */
export function canReceiveTemporaryPremium(classification: UserClassification): boolean {
  return classification.type === 'free' || classification.type === 'temporary_premium';
}

/**
 * Helper to check if user can receive Stripe promotion codes
 */
export function canReceiveStripePromoCode(classification: UserClassification): boolean {
  return classification.hasStripeSub && !!classification.stripeCustomerId;
}

/**
 * Helper to determine if discount should be saved for later
 */
export function shouldSaveDiscountForLater(classification: UserClassification): boolean {
  return !classification.hasStripeSub;
}
