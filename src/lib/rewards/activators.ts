/**
 * Reward Activators
 *
 * Functions to activate different types of rewards for different user types
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe/server';
import { RewardActivationResult, PremiumReward, UserClassification } from './types';

/**
 * Activate temporary premium for free users
 * Uses the premium_until system (no Stripe required)
 */
export async function activateTemporaryPremium(
  supabase: SupabaseClient,
  userId: string,
  durationDays: number,
  source: string
): Promise<RewardActivationResult> {
  const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('profiles')
    .update({
      premium_until: expiresAt.toISOString(),
      premium_source: source,
      subscription_tier: 'premium'
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to activate temporary premium: ${error.message}`);
  }

  return {
    success: true,
    type: 'temporary_premium',
    message: `Du har fått Premium i ${durationDays} dagar!`,
    data: {
      expiresAt: expiresAt.toISOString(),
      durationDays
    }
  };
}

/**
 * Extend existing temporary premium
 * Adds days to current premium_until
 */
export async function extendTemporaryPremium(
  supabase: SupabaseClient,
  userId: string,
  currentPremiumUntil: Date,
  durationDays: number
): Promise<RewardActivationResult> {
  const newEnd = new Date(currentPremiumUntil.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('profiles')
    .update({
      premium_until: newEnd.toISOString()
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to extend premium: ${error.message}`);
  }

  // Log extension
  await supabase
    .from('premium_extensions')
    .insert({
      user_id: userId,
      days_added: durationDays,
      source: 'reward',
      metadata: {
        previous_end: currentPremiumUntil.toISOString(),
        new_end: newEnd.toISOString()
      }
    });

  return {
    success: true,
    type: 'extension',
    message: `${durationDays} dagar tillagda på din premiumtid!`,
    data: {
      daysAdded: durationDays,
      newExpiryDate: newEnd.toISOString()
    }
  };
}

/**
 * Save discount for later use (free users without Stripe)
 */
export async function saveDiscountForLater(
  supabase: SupabaseClient,
  userId: string,
  reward: PremiumReward,
  claimId: string
): Promise<RewardActivationResult> {
  const percentage = reward.reward_data.percentage || 0;
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

  // Generate a unique code (will be used when user upgrades)
  const code = `REWARD${percentage}-${userId.substring(0, 8).toUpperCase()}`;

  const { error } = await supabase
    .from('discount_codes')
    .insert({
      code,
      user_id: userId,
      milestone_level: reward.milestone_level,
      discount_percentage: percentage,
      discount_type: reward.reward_data.discount_type || 'once',
      saved_for_future: true,
      can_use_without_stripe: false,
      is_used: false,
      expires_at: expiresAt.toISOString(),
      metadata: {
        reward_id: reward.id,
        claim_id: claimId,
        saved_at: new Date().toISOString()
      }
    });

  if (error) {
    throw new Error(`Failed to save discount: ${error.message}`);
  }

  return {
    success: true,
    type: 'discount_saved',
    message: 'Rabattkoden är sparad och kan användas när du blir Premium.',
    data: {
      promoCode: code,
      discountPercentage: percentage,
      savedForLater: true
    }
  };
}

/**
 * Create Stripe Promotion Code for paying customers
 */
export async function createStripePromoCode(
  supabase: SupabaseClient,
  userId: string,
  stripeCustomerId: string,
  reward: PremiumReward,
  claimId: string
): Promise<RewardActivationResult> {
  const percentage = reward.reward_data.percentage || 0;

  try {
    // 1. Create Stripe Coupon (one-time use)
    const coupon = await stripe.coupons.create({
      percent_off: percentage,
      duration: 'once', // Only applies to next payment
      max_redemptions: 1,
      metadata: {
        user_id: userId,
        reward_id: reward.id,
        claim_id: claimId,
        source: 'reward_system'
      }
    });

    // 2. Create Promotion Code (customer-specific)
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: `REWARD${percentage}-${userId.substring(0, 6).toUpperCase()}`,
      max_redemptions: 1,
      customer: stripeCustomerId, // Restrict to this customer only
      metadata: {
        user_id: userId,
        reward_id: reward.id
      }
    });

    // 3. Save to database
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

    const { error } = await supabase
      .from('discount_codes')
      .insert({
        code: promoCode.code,
        user_id: userId,
        milestone_level: reward.milestone_level,
        discount_percentage: percentage,
        discount_type: 'once',
        stripe_coupon_id: coupon.id,
        stripe_promotion_code_id: promoCode.id,
        saved_for_future: false,
        can_use_without_stripe: false,
        is_used: false,
        expires_at: expiresAt.toISOString(),
        metadata: {
          reward_id: reward.id,
          claim_id: claimId,
          created_at: new Date().toISOString()
        }
      });

    if (error) {
      // Rollback: Delete Stripe resources
      await stripe.promotionCodes.update(promoCode.id, { active: false });
      throw new Error(`Failed to save promo code: ${error.message}`);
    }

    return {
      success: true,
      type: 'discount_created',
      message: `Din ${percentage}% rabattkod är skapad!`,
      data: {
        promoCode: promoCode.code,
        couponId: coupon.id,
        discountPercentage: percentage,
        savedForLater: false
      }
    };

  } catch (error) {
    throw new Error(`Failed to create Stripe promo code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add premium time to paid subscription
 * For Stripe subscribers, we extend trial_end in Stripe subscription
 */
export async function addSubscriptionCredit(
  supabase: SupabaseClient,
  userId: string,
  subscriptionId: string,
  durationDays: number,
  rewardId: string
): Promise<RewardActivationResult> {
  try {
    // 1. Get the Stripe subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const now = Math.floor(Date.now() / 1000); // Current Unix timestamp
    let newTrialEnd: number;

    // 2. Calculate new trial_end
    if (subscription.trial_end && subscription.trial_end > now) {
      // Subscription has an active trial - extend it
      newTrialEnd = subscription.trial_end + (durationDays * 24 * 60 * 60);
    } else if (subscription.current_period_end) {
      // No active trial - extend from current period end
      newTrialEnd = subscription.current_period_end + (durationDays * 24 * 60 * 60);
    } else {
      // Fallback - extend from now
      newTrialEnd = now + (durationDays * 24 * 60 * 60);
    }

    // 3. Update Stripe subscription with new trial_end
    const currentBonusDays = parseInt(subscription.metadata.bonus_days_added || '0');
    const newBonusDays = currentBonusDays + durationDays;

    await stripe.subscriptions.update(subscriptionId, {
      trial_end: newTrialEnd,
      proration_behavior: 'none', // Don't prorate
      metadata: {
        bonus_days_added: newBonusDays.toString(),
        last_bonus_date: new Date().toISOString(),
        last_reward_id: rewardId
      }
    });

    // 4. Update premium_until in profiles to match
    const newPremiumUntil = new Date(newTrialEnd * 1000);

    await supabase
      .from('profiles')
      .update({
        premium_until: newPremiumUntil.toISOString(),
        premium_source: 'reward_extension'
      })
      .eq('id', userId);

    // 5. Log extension in database
    await supabase
      .from('premium_extensions')
      .insert({
        user_id: userId,
        days_added: durationDays,
        source: 'reward',
        subscription_id: subscriptionId,
        metadata: {
          reward_id: rewardId,
          total_bonus_days: newBonusDays,
          new_trial_end: newTrialEnd,
          new_premium_until: newPremiumUntil.toISOString()
        }
      });

    return {
      success: true,
      type: 'subscription_credit',
      message: `${durationDays} dagar tillagda på din prenumeration!`,
      data: {
        daysAdded: durationDays,
        newExpiryDate: newPremiumUntil.toISOString()
      }
    };

  } catch (error) {
    throw new Error(`Failed to add subscription credit: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Determine and execute the correct activation method
 */
export async function activateReward(
  supabase: SupabaseClient,
  userId: string,
  userClass: UserClassification,
  reward: PremiumReward,
  claimId: string
): Promise<RewardActivationResult> {
  const rewardType = reward.reward_type;

  // DISCOUNT rewards
  if (rewardType === 'discount') {
    if (userClass.hasStripeSub && userClass.stripeCustomerId) {
      // Paying customer: Create Stripe Promotion Code
      return await createStripePromoCode(
        supabase,
        userId,
        userClass.stripeCustomerId,
        reward,
        claimId
      );
    } else {
      // Free user: Save for later
      return await saveDiscountForLater(supabase, userId, reward, claimId);
    }
  }

  // TRIAL or PREMIUM_TIME rewards
  if (rewardType === 'trial' || rewardType === 'premium_time') {
    const durationDays = reward.reward_data.duration_days || 7;

    if (userClass.hasStripeSub && userClass.subscriptionId) {
      // Paying customer: Add subscription credit
      return await addSubscriptionCredit(
        supabase,
        userId,
        userClass.subscriptionId,
        durationDays,
        reward.id
      );
    } else if (userClass.hasTemporaryPremium && userClass.premiumUntil) {
      // Has temporary premium: Extend it
      return await extendTemporaryPremium(
        supabase,
        userId,
        userClass.premiumUntil,
        durationDays
      );
    } else {
      // Free user: Grant temporary premium
      const source = `level_${reward.milestone_level || 0}_reward`;
      return await activateTemporaryPremium(
        supabase,
        userId,
        durationDays,
        source
      );
    }
  }

  throw new Error(`Unsupported reward type: ${rewardType}`);
}
