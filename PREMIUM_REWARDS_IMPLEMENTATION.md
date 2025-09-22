# Premium Rewards and Guest Invitation System - Implementation Documentation

## Overview
This document outlines the comprehensive premium rewards and guest invitation system implemented for Jobbcoach.ai. The system integrates seamlessly with the existing gamification infrastructure and provides a scalable foundation for user engagement and revenue growth.

## System Architecture

### Core Tables Implemented

#### 1. `guest_invitations`
**Purpose**: Track premium guest invitations with 7-day trials and conversion tracking
- **Unique invitation codes**: Auto-generated 12-character codes (e.g., 4B4C5B7D8B94)
- **Trial management**: 7-day premium trials with configurable duration
- **Conversion tracking**: Revenue and subscription conversion metrics
- **Status management**: pending → accepted → expired/cancelled flow

#### 2. `monthly_guest_allowances`
**Purpose**: Monthly invitation quotas with base + bonus system
- **Base allowance**: 1 invitation per month for all premium users (149 SEK/month)
- **Level bonuses**:
  - Level 15+: +1 bonus invitation/month
  - Level 20+: +2 bonus invitations/month
- **Usage tracking**: Real-time remaining invitation count
- **Auto-refresh**: Monthly allowance reset with level-appropriate bonuses

#### 3. `premium_rewards`
**Purpose**: Centralized reward configuration system
- **Flexible reward types**: trials, discounts, premium_time, guest_invitations, status
- **Trigger system**: level_milestone, achievement, streak, special_event
- **Stripe integration**: Ready for discount code generation and subscription management
- **Priority ordering**: Higher priority rewards displayed first

#### 4. `user_reward_claims`
**Purpose**: User reward claims and activation tracking
- **Claim lifecycle**: claimed → activated → used → expired
- **Activation data**: Stores discount codes, trial dates, Stripe coupon IDs
- **Expiry management**: Automatic expiration based on reward type
- **Usage tracking**: Full audit trail of reward utilization

## Reward Milestone Configuration

### Level-Based Rewards (Swedish Market - 149 SEK/month premium)

| Level | Reward Type | Description | Implementation Details |
|-------|-------------|-------------|----------------------|
| **5** | Trial | 2 dagars premium test | `{"duration_days": 2, "features": ["unlimited_letters", "auto_tonality", "priority_support"]}` |
| **10** | Trial | 5 dagars premium test | `{"duration_days": 5, "features": ["unlimited_letters", "auto_tonality", "priority_support", "advanced_analytics"]}` |
| **15** | Discount | 15% rabatt | `{"percentage": 15, "duration_months": 1, "discount_type": "one_time", "stripe_duration": "once"}` |
| **20** | Premium Time + Bonus | 1 veckas gratis premium + extra gästinbjudningar | `{"duration_days": 7, "auto_activate": true}` + `{"bonus_invitations_per_month": 2, "duration_months": 12}` |
| **25** | Discount | 25% rabatt (3 månader) | `{"percentage": 25, "duration_months": 3, "discount_type": "quarterly"}` |
| **30** | Premium Time | 2 veckors gratis premium | `{"duration_days": 14, "auto_activate": true}` |
| **35** | Discount | 35% rabatt (6 månader) | `{"percentage": 35, "duration_months": 6, "discount_type": "biannual"}` |
| **40** | Premium Time | 1 månads gratis premium | `{"duration_days": 30, "auto_activate": true}` |
| **45** | Discount | 45% rabatt (årsprenumeration) | `{"percentage": 45, "duration_months": 12, "discount_type": "annual"}` |
| **50** | Premium Time + Status | 3 månaders gratis premium + Genesis status | `{"duration_days": 90, "auto_activate": true}` + `{"status": "genesis", "lifetime_discount": 50, "priority_support": true, "beta_access": true}` |

## Key Functions and API

### Guest Invitation Management

```sql
-- Create guest invitation (automatically manages allowances)
SELECT create_guest_invitation(
    'inviter-user-id'::uuid,
    'guest@example.com',
    7  -- trial duration in days
);

-- Check user's monthly allowance
SELECT * FROM current_month_allowances WHERE user_id = 'user-id';

-- Get invitation analytics (admin dashboard)
SELECT * FROM get_invitation_analytics('2024-01-01', '2024-12-31');
```

### Reward Management

```sql
-- Get comprehensive user reward status
SELECT * FROM get_user_reward_status('user-id'::uuid);

-- Activate a claimed reward
SELECT activate_user_reward(
    'user-id'::uuid,
    'reward-claim-id'::uuid,
    '{"discount_code": "SAVE25", "stripe_coupon_id": "coupon_xyz"}'::jsonb
);

-- User dashboard view
SELECT * FROM user_dashboard_rewards WHERE user_id = 'user-id';
```

### Maintenance Functions

```sql
-- Expire old invitations (run daily)
SELECT expire_old_invitations();

-- Clean up expired rewards (run daily)
SELECT cleanup_expired_rewards();
```

## Security Implementation

### Row Level Security (RLS) Policies

#### Guest Invitations
- **Users**: Can view/manage their own invitations (as inviter or guest)
- **Admins**: Full access to all invitations for analytics

#### Monthly Allowances
- **Users**: Can view their own monthly allowances
- **System**: Can manage allowances for automation
- **Admins**: Full access for dashboard analytics

#### Premium Rewards
- **Users**: Can view active rewards (read-only)
- **Admins**: Can manage reward configurations

#### User Reward Claims
- **Users**: Can view/update their own claims
- **System**: Can create claims (for automation)
- **Admins**: Full access for support and analytics

## Integration Points

### Existing Gamification System
- **global_user_stats**: Automatic reward claiming on level up
- **level_titles**: XP requirements and Swedish level names
- **user_activities**: Activity logging for reward claims and activations
- **profiles**: Subscription tier integration for allowance calculation

### Stripe Integration Ready
- **Discount codes**: Structured data for Stripe coupon creation
- **Trial management**: Premium trial activation/deactivation workflow
- **Revenue tracking**: Conversion revenue attribution to inviters

### Business Logic Preservation
- **Swedish pricing model**: All calculations based on 149 SEK/month premium
- **Subscription limits**: Integration with existing free vs premium feature gates
- **GDPR compliance**: User data isolation and privacy controls maintained

## Performance Optimizations

### Database Indexes
```sql
-- Guest invitations
CREATE INDEX idx_guest_invitations_inviter_id ON guest_invitations(inviter_id);
CREATE INDEX idx_guest_invitations_status ON guest_invitations(status);
CREATE INDEX idx_guest_invitations_expires_at ON guest_invitations(expires_at);

-- Monthly allowances
CREATE INDEX idx_monthly_guest_allowances_user_id ON monthly_guest_allowances(user_id);
CREATE INDEX idx_monthly_guest_allowances_month_year ON monthly_guest_allowances(month_year);

-- Reward claims
CREATE INDEX idx_user_reward_claims_user_id ON user_reward_claims(user_id);
CREATE INDEX idx_user_reward_claims_status ON user_reward_claims(status);
```

### Computed Columns
- `total_allowance`: `base_allowance + bonus_allowance`
- `remaining_invitations`: `total_allowance - used_invitations`

## Automated Workflows

### Trigger Functions

#### Level Up Automation
```sql
-- Triggers on global_user_stats.current_level update
CREATE TRIGGER trigger_global_user_stats_milestone_rewards
    AFTER UPDATE OF current_level ON global_user_stats
    FOR EACH ROW
    EXECUTE FUNCTION trigger_milestone_rewards();
```

#### Subscription Changes
```sql
-- Triggers on profiles.subscription_tier update
CREATE TRIGGER trigger_profiles_subscription_allowance_update
    AFTER UPDATE OF subscription_tier ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_subscription_allowance_update();
```

## Admin Dashboard Analytics

### Key Metrics Available

#### Invitation Performance
```sql
-- Top performing inviters this month
SELECT
    p.email,
    p.full_name,
    COUNT(gi.*) as invitations_sent,
    COUNT(*) FILTER (WHERE gi.converted_to_paid = TRUE) as conversions,
    SUM(gi.conversion_amount) as total_revenue
FROM profiles p
JOIN guest_invitations gi ON gi.inviter_id = p.id
WHERE gi.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY p.id, p.email, p.full_name
ORDER BY total_revenue DESC NULLS LAST;
```

#### Reward Activation Rates
```sql
-- Reward activation rates by level
SELECT
    pr.trigger_value as level,
    pr.name,
    COUNT(urc.*) as total_claims,
    COUNT(*) FILTER (WHERE urc.status = 'activated') as activated_claims,
    ROUND(
        (COUNT(*) FILTER (WHERE urc.status = 'activated')::NUMERIC /
         NULLIF(COUNT(urc.*)::NUMERIC, 0)) * 100, 2
    ) as activation_rate_percent
FROM premium_rewards pr
LEFT JOIN user_reward_claims urc ON urc.reward_id = pr.id
WHERE pr.trigger_type = 'level_milestone'
GROUP BY pr.id, pr.trigger_value, pr.name
ORDER BY pr.trigger_value;
```

## Business Impact Projections

### Revenue Potential (Based on 149 SEK/month)
- **Guest Invitations**: 7-day trials → premium conversions
- **Level Incentivization**: Increased engagement → higher retention
- **Referral Revenue**: Viral growth through guest invitation system
- **Premium Upgrades**: Discount incentives for milestone achievements

### User Engagement
- **Gamification Enhancement**: Clear reward progression path
- **Social Features**: Guest invitation system builds community
- **Retention Tools**: Premium trials and exclusive benefits
- **Achievement System**: Multiple reward types for diverse user motivations

## Migration Status
✅ **Complete**: All database structures implemented
✅ **Complete**: RLS policies configured
✅ **Complete**: Trigger functions active
✅ **Complete**: Helper functions available
✅ **Complete**: Admin analytics ready
✅ **Complete**: Integration with existing gamification system

## Next Steps for Implementation

### Frontend Integration
1. **User Dashboard**: Display current level, allowances, and available rewards
2. **Invitation Flow**: Guest invitation creation and management interface
3. **Reward Center**: Claim and activate milestone rewards
4. **Admin Dashboard**: Analytics and management tools

### Stripe Integration
1. **Discount Code Generation**: Automated coupon creation for milestone rewards
2. **Trial Management**: Premium feature activation/deactivation
3. **Webhook Handling**: Conversion tracking for guest trial → paid subscriptions

### Email Automation
1. **Invitation Emails**: Guest invitation delivery with unique codes
2. **Reward Notifications**: Milestone achievement and reward availability alerts
3. **Trial Reminders**: Guest trial expiration and conversion prompts

## File Locations
- **Migration File**: Applied via Supabase migration system
- **Documentation**: `C:\Users\chris\cvbrev\PREMIUM_REWARDS_IMPLEMENTATION.md`
- **Database Schema**: Available via `mcp__supabase__list_tables`

This implementation provides a robust, scalable foundation for premium user rewards and guest invitation functionality while maintaining full integration with Jobbcoach.ai's existing systems and Swedish market requirements.