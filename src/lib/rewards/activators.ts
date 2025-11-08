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
 * Valid for 30 days, one-time use
 */
export async function saveDiscountForLater(
  supabase: SupabaseClient,
  userId: string,
  reward: PremiumReward,
  claimId: string
): Promise<RewardActivationResult> {
  const percentage = reward.reward_data.percentage || 0;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Generate a unique code (will be used when user upgrades)
  const code = `REWARD${percentage}-${userId.substring(0, 8).toUpperCase()}`;

  const { error } = await supabase
    .from('discount_codes')
    .insert({
      code,
      user_id: userId,
      milestone_level: reward.milestone_level,
      discount_percentage: percentage,
      discount_type: 'once', // Always one-time use
      saved_for_future: true,
      can_use_without_stripe: false,
      is_used: false,
      expires_at: expiresAt.toISOString(),
      metadata: {
        reward_id: reward.id,
        claim_id: claimId,
        saved_at: new Date().toISOString(),
        valid_for_months: 1
      }
    });

  if (error) {
    throw new Error(`Failed to save discount: ${error.message}`);
  }

  return {
    success: true,
    type: 'discount_saved',
    message: `Din ${percentage}% rabattkod är sparad! Använd den när du blir premium.`,
    data: {
      promoCode: code,
      discountPercentage: percentage,
      savedForLater: true,
      expiresAt: expiresAt.toISOString()
    }
  };
}

/**
 * Create Stripe Promotion Code for paying customers
 * Automatically applies to next invoice (1 month)
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
    // 1. Get customer's subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      // No active subscription, save for later
      return await saveDiscountForLater(supabase, userId, reward, claimId);
    }

    const subscription = subscriptions.data[0];

    // 2. Create Stripe Coupon (one-time use, for next invoice only)
    const coupon = await stripe.coupons.create({
      percent_off: percentage,
      duration: 'once', // Only applies to next invoice
      max_redemptions: 1,
      metadata: {
        user_id: userId,
        reward_id: reward.id,
        claim_id: claimId,
        source: 'reward_system',
        auto_applied: 'true'
      }
    });

    // 3. Apply coupon directly to subscription (automatic discount)
    await stripe.subscriptions.update(subscription.id, {
      coupon: coupon.id,
      metadata: {
        ...subscription.metadata,
        last_reward_discount: percentage.toString(),
        last_reward_date: new Date().toISOString()
      }
    });

    // 4. Save to database
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const { error } = await supabase
      .from('discount_codes')
      .insert({
        code: `AUTO-REWARD${percentage}`, // Auto-applied, no code needed
        user_id: userId,
        milestone_level: reward.milestone_level,
        discount_percentage: percentage,
        discount_type: 'once',
        stripe_coupon_id: coupon.id,
        stripe_promotion_code_id: null, // No promo code, directly applied
        saved_for_future: false,
        can_use_without_stripe: false,
        is_used: true, // Immediately used (auto-applied)
        expires_at: expiresAt.toISOString(),
        metadata: {
          reward_id: reward.id,
          claim_id: claimId,
          created_at: new Date().toISOString(),
          auto_applied: true,
          subscription_id: subscription.id
        }
      });

    if (error) {
      console.error('[activators] Failed to save discount to database:', error);
      // Don't fail - Stripe coupon is already applied
    }

    return {
      success: true,
      type: 'discount_created',
      message: `${percentage}% rabatt applicerad! Gäller din nästa faktura.`,
      data: {
        promoCode: null,
        couponId: coupon.id,
        discountPercentage: percentage,
        savedForLater: false,
        autoApplied: true
      }
    };

  } catch (error) {
    console.error('[activators] Failed to create/apply Stripe discount:', error);
    throw new Error(`Failed to create Stripe discount: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Add premium time to paid subscription
 * For Stripe subscribers, we extend trial_end in Stripe subscription
 * Handles both trialing and active subscriptions correctly
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
    const durationSeconds = durationDays * 24 * 60 * 60;

    // 2. Calculate new trial_end based on subscription status
    if (subscription.status === 'trialing' && subscription.trial_end && subscription.trial_end > now) {
      // Subscription has an active trial - extend trial_end
      newTrialEnd = subscription.trial_end + durationSeconds;
      console.log(`[activators] Extending active trial from ${new Date(subscription.trial_end * 1000).toISOString()} to ${new Date(newTrialEnd * 1000).toISOString()}`);
    } else if (subscription.status === 'active' && subscription.current_period_end) {
      // Active paying subscription - create/extend trial period from current_period_end
      // This effectively delays the next billing by durationDays
      newTrialEnd = subscription.current_period_end + durationSeconds;
      console.log(`[activators] Creating trial period for active subscription, delaying billing from ${new Date(subscription.current_period_end * 1000).toISOString()} to ${new Date(newTrialEnd * 1000).toISOString()}`);
    } else {
      // Fallback - extend from now
      newTrialEnd = now + durationSeconds;
      console.log(`[activators] Fallback: Creating trial period from now until ${new Date(newTrialEnd * 1000).toISOString()}`);
    }

    // 3. Update Stripe subscription with new trial_end
    const currentBonusDays = parseInt(subscription.metadata.bonus_days_added || '0');
    const newBonusDays = currentBonusDays + durationDays;

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      trial_end: newTrialEnd,
      proration_behavior: 'none', // Don't prorate
      metadata: {
        bonus_days_added: newBonusDays.toString(),
        last_bonus_date: new Date().toISOString(),
        last_reward_id: rewardId
      }
    });

    console.log(`[activators] Stripe subscription updated successfully. New trial_end: ${updatedSubscription.trial_end}`);

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
          subscription_status: subscription.status,
          total_bonus_days: newBonusDays,
          old_trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          new_trial_end: new Date(newTrialEnd * 1000).toISOString(),
          new_premium_until: newPremiumUntil.toISOString()
        }
      });

    const message = subscription.status === 'trialing'
      ? `Din provperiod har förlängts med ${durationDays} dagar!`
      : `Din nästa betalning har skjutits upp ${durationDays} dagar!`;

    return {
      success: true,
      type: 'subscription_credit',
      message,
      data: {
        daysAdded: durationDays,
        newExpiryDate: newPremiumUntil.toISOString()
      }
    };

  } catch (error) {
    console.error('[activators] Failed to add subscription credit:', error);
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
