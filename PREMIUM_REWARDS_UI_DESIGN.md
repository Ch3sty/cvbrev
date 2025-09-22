# Premium Rewards & Guest Invitation UI Components - Design Documentation

## Overview

This document outlines the comprehensive UI component system for Jobbcoach.ai's premium rewards and guest invitation features. All components are designed to align with the established brand identity while providing a truly premium experience that justifies the 149 SEK/month pricing.

## Design System Foundation

### Brand Alignment
- **Primary Navy Palette**: Deep, professional backgrounds (`navy-950`, `navy-900`, `navy-800`, `navy-700`)
- **Accent Colors**: Pink-to-purple gradients for premium CTAs and highlights
- **Typography**: Swedish-optimized, professional yet approachable
- **Visual Language**: Glassmorphism effects, subtle animations, premium polish

### Technical Architecture
- **Framework**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS with custom component library
- **Accessibility**: WCAG 2.1 AA compliant
- **Responsive**: Mobile-first approach for Swedish smartphone usage

## Component Library

### 1. RewardsDashboard Component

**Location**: `src/components/rewards/RewardsDashboard.tsx`

**Purpose**: Central hub displaying user level, progress, and reward management.

#### Design Specifications

**Colors & Gradients**:
```css
/* Primary card background */
background: linear-gradient(to bottom right, #131B32, #151C39);

/* Progress bar */
background: linear-gradient(to right, #D73A6B, #8B5CF6);

/* Level indicator glow */
background: linear-gradient(to right, #D73A6B, #8B5CF6);
box-shadow: 0 0 0 0 rgba(215, 58, 107, 0.4);
```

**Typography Hierarchy**:
- Level title: `text-2xl font-bold` with gradient text effect
- Current XP: `text-gray-400 text-sm`
- Progress stats: `text-xl font-bold text-white`

**Interactive States**:
- Hover: `hover:scale-105 hover:border-pink-500/50`
- Focus: `focus:ring-2 focus:ring-pink-500`
- Loading: Shimmer animation overlay

**Key Features**:
- Real-time progress tracking with animated progress bar
- Tabbed interface for available vs claimed rewards
- Comprehensive stats grid showing achievements
- Responsive layout adapting to mobile screens

### 2. GuestInvitationCard Component

**Location**: `src/components/rewards/GuestInvitationCard.tsx`

**Purpose**: Manage monthly guest invitation quotas and track invitation performance.

#### Design Specifications

**Layout Structure**:
```
[Allowance Status Card]
[Stats Grid - 3 columns]
[Main Management Card]
  └── [Create Tab | Manage Tab]
```

**Color Coding**:
- Base allowance: `text-white`
- Bonus allowance: `text-purple-400`
- Conversion metrics: `text-green-400`
- Pending invitations: `text-yellow-400`

**Micro-interactions**:
- Email input focus with pink ring
- Copy button with success feedback
- Real-time countdown for invitation expiry
- Status badges with appropriate colors

**Swedish UX Considerations**:
- E-post terminology instead of "email"
- Swedish date formatting (`sv-SE`)
- Cultural appropriate sharing options
- Privacy-conscious invitation management

### 3. MilestoneRewardsTimeline Component

**Location**: `src/components/rewards/MilestoneRewardsTimeline.tsx`

**Purpose**: Visual progression through all 50 reward levels with interactive timeline.

#### Design Specifications

**Timeline View**:
- Horizontal scrolling with smooth navigation
- Auto-scroll to current user level
- Connection lines between milestones
- Hover-triggered detail cards

**Grid View**:
- Responsive grid layout (1-4 columns)
- Card-based milestone representation
- Consistent visual hierarchy

**Milestone Status Colors**:
```css
/* Claimed */
background: linear-gradient(to bottom right, #10B981, #059669);

/* Unlocked */
background: linear-gradient(to bottom right, #D73A6B, #8B5CF6);

/* Available */
background: linear-gradient(to bottom right, #8B5CF6, #D73A6B);

/* Locked */
background: #1A2142;
```

**Special Milestone Treatment**:
- Level 50: Gold gradient with ring glow
- Major milestones (10, 20, 30, 40): Enhanced visual emphasis
- Achievement clustering for better visual organization

### 4. RewardClaimModal Component

**Location**: `src/components/rewards/RewardClaimModal.tsx`

**Purpose**: Celebration-focused reward activation with premium feel.

#### Design Specifications

**Modal Structure**:
- Glassmorphism backdrop with blur effect
- Gradient header matching reward type
- Celebration animation overlay
- Three-step flow: Claim → Celebrate → Activated

**Animation Sequence**:
```css
/* Celebration entrance */
@keyframes celebration {
  0% { transform: scale(0.8) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.1) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

/* Confetti particles */
@keyframes confetti {
  0% { transform: translateY(-100vh) rotate(0deg); }
  100% { transform: translateY(100vh) rotate(720deg); }
}
```

**Reward Type Styling**:
- Trial: Blue-cyan gradient with lightning icon
- Discount: Green-emerald gradient with percentage icon
- Premium Time: Purple-pink gradient with clock icon
- Guest Invitations: Yellow-orange gradient with users icon
- Status: Pink-purple gradient with crown icon

**Swedish Localization**:
- "Grattis!" celebration message
- Appropriate button text and descriptions
- Cultural context for reward explanations

### 5. GuestWelcomeLanding Component

**Location**: `src/components/rewards/GuestWelcomeLanding.tsx`

**Purpose**: High-conversion landing page for invited guests.

#### Design Specifications

**Hero Section**:
- Full-viewport gradient background
- Animated crown icon with glow effect
- Clear value proposition headline
- Social proof integration

**Trust Indicators**:
- Inviter profile display with level badge
- Swedish testimonials with star ratings
- Feature benefit explanations
- Security badges (no credit card, cancel anytime)

**Conversion Optimization**:
- Sticky signup form on desktop
- Progressive disclosure of benefits
- Urgency indicators (time remaining)
- Clear CTA hierarchy

**Form Design**:
```css
/* Input styling */
background: #1A2142;
border: 1px solid #2D3748;
focus:ring: 2px #D73A6B;

/* CTA button */
background: linear-gradient(to right, #D73A6B, #8B5CF6);
hover:shadow: 0 10px 25px rgba(215, 58, 107, 0.3);
```

## Advanced Design Features

### Glassmorphism Implementation

**Background Blur Effects**:
```css
.glass-card {
  background: rgba(21, 28, 57, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Animation Library

**Entrance Animations**:
- `fadeIn`: 0.3s ease-out with scale
- `slideUp`: 0.4s ease-out with translateY
- `pulse-pink`: Infinite pulse for CTAs

**Loading States**:
- Shimmer effect for progress bars
- Skeleton loading for card content
- Smooth transition states

**Success Celebrations**:
- Confetti particle system
- Trophy bounce animation
- Gradient background pulse

### Responsive Design Strategy

**Breakpoint System**:
- Mobile: 320px - 768px (single column)
- Tablet: 768px - 1024px (two column)
- Desktop: 1024px+ (three column with sticky elements)

**Mobile Optimizations**:
- Touch-friendly button sizes (min 44px)
- Swipe gestures for timeline navigation
- Collapsible sections for content density
- Bottom-sheet style modals

## Swedish Market Adaptations

### Language & Terminology

**Premium Features**:
- "Premium-provperiod" (premium trial)
- "Belöning" (reward)
- "Gästinbjudan" (guest invitation)
- "Nivå" (level)

**UI Text Patterns**:
- Formal "ni/er" forms avoided in favor of "du/dig"
- Professional yet approachable tone
- Clear action-oriented button text

### Cultural Considerations

**Swedish Business Culture**:
- Understated luxury (no excessive flashiness)
- Trust-building through transparency
- Quality over quantity messaging
- Sustainable value proposition

**Local Usage Patterns**:
- High mobile usage (prioritize mobile experience)
- Privacy consciousness (clear data usage)
- Social sharing preferences (email over social media)
- Seasonal adaptation potential

## Implementation Guidelines

### Component Usage

**RewardsDashboard**:
```typescript
<RewardsDashboard
  userLevel={userLevelData}
  availableRewards={availableRewardsList}
  claimedRewards={claimedRewardsList}
  onClaimReward={handleClaimReward}
  onActivateReward={handleActivateReward}
/>
```

**GuestInvitationCard**:
```typescript
<GuestInvitationCard
  allowance={monthlyAllowanceData}
  invitations={guestInvitationsList}
  onCreateInvitation={handleCreateInvitation}
  onCopyLink={handleCopyLink}
  onShareSocial={handleShareSocial}
/>
```

### State Management

**Recommended Architecture**:
- Context for reward state management
- SWR/React Query for server state
- Local state for UI interactions
- Zustand for complex reward flows

### Performance Optimizations

**Code Splitting**:
```javascript
const RewardClaimModal = lazy(() => import('./RewardClaimModal'));
const MilestoneTimeline = lazy(() => import('./MilestoneRewardsTimeline'));
```

**Image Optimization**:
- WebP format for all graphics
- Responsive image sizes
- Lazy loading for non-critical content

## Accessibility Features

### WCAG 2.1 AA Compliance

**Color Contrast**:
- Text on navy backgrounds: 4.5:1 minimum
- Interactive elements: 3:1 minimum
- Focus indicators: High contrast borders

**Keyboard Navigation**:
- Tab order optimization
- Skip links for complex interfaces
- ARIA labels for screen readers

**Screen Reader Support**:
```typescript
aria-label="Hämta belöning för level 15"
aria-describedby="reward-description"
role="button"
```

## Quality Assurance

### Browser Testing Matrix
- Chrome 90+ (primary)
- Safari 14+ (iOS compatibility)
- Firefox 88+ (privacy-conscious users)
- Edge 90+ (enterprise users)

### Device Testing
- iPhone 12/13/14 series
- Samsung Galaxy S21/S22
- iPad Pro 11"
- Desktop 1920x1080 and 2560x1440

### Performance Targets
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1
- First Input Delay: <100ms

## Future Enhancements

### Planned Features
1. **Seasonal Themes**: Holiday-specific reward celebrations
2. **Achievement Sharing**: Social media integration for milestones
3. **Advanced Analytics**: Personal progress insights
4. **Gamification Extensions**: Streak tracking, challenges
5. **Community Features**: Leaderboards, friend comparisons

### Technical Debt Prevention
- Regular dependency updates
- Component refactoring schedule
- Performance monitoring integration
- A/B testing infrastructure preparation

This comprehensive UI component system provides a scalable, premium foundation for Jobbcoach.ai's rewards and invitation features while maintaining perfect alignment with Swedish market expectations and professional design standards.