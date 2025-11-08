/**
 * Reward System Types
 *
 * Defines all types used in the reward activation system
 */

export type UserType = 'free' | 'temporary_premium' | 'trial_premium' | 'paid_premium';

export type RewardType = 'trial' | 'premium_time' | 'discount' | 'guest_invitations';

export interface UserClassification {
  type: UserType;
  hasStripeSub: boolean;
  hasTemporaryPremium: boolean;
  premiumUntil: Date | null;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
}

export interface RewardActivationResult {
  success: boolean;
  type: 'temporary_premium' | 'extension' | 'discount_saved' | 'discount_created' | 'subscription_credit';
  message: string;
  data?: {
    // For temporary premium
    expiresAt?: string;
    durationDays?: number;

    // For extensions
    newExpiryDate?: string;
    daysAdded?: number;

    // For discounts
    promoCode?: string | null;
    couponId?: string;
    discountPercentage?: number;
    savedForLater?: boolean;
    autoApplied?: boolean;

    // For subscription credits
    estimatedValue?: number;
  };
}

export interface PremiumReward {
  id: string;
  reward_type: RewardType;
  name: string;
  description: string;
  reward_data: {
    duration_days?: number;
    percentage?: number;
    discount_type?: string;
    features?: string[];
    bonus_invitations_per_month?: number;
  };
  milestone_level?: number;
}
