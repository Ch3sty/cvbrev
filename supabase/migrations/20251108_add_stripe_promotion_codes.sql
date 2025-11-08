-- Migration: Add Stripe Promotion Code support to discount_codes table
-- Created: 2025-11-08
-- Purpose: Enable storing Stripe Promotion Codes for reward system

-- Add new columns to discount_codes
ALTER TABLE discount_codes
ADD COLUMN IF NOT EXISTS stripe_promotion_code_id TEXT,
ADD COLUMN IF NOT EXISTS saved_for_future BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_use_without_stripe BOOLEAN DEFAULT false;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_discount_codes_stripe_promo
ON discount_codes(stripe_promotion_code_id)
WHERE stripe_promotion_code_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_discount_codes_user_saved
ON discount_codes(user_id, saved_for_future)
WHERE is_used = false AND saved_for_future = true;

CREATE INDEX IF NOT EXISTS idx_discount_codes_user_active
ON discount_codes(user_id, is_used, expires_at)
WHERE is_used = false;

-- Add comment
COMMENT ON COLUMN discount_codes.stripe_promotion_code_id IS 'Stripe Promotion Code ID for paying customers';
COMMENT ON COLUMN discount_codes.saved_for_future IS 'True if discount is saved for when user upgrades (free users)';
COMMENT ON COLUMN discount_codes.can_use_without_stripe IS 'True if discount can be applied without Stripe (currently always false)';
