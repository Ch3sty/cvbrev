'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import HeroSection from '@/components/guest-invitations/HeroSection';
import QuickInviteForm from '@/components/guest-invitations/QuickInviteForm';
import BenefitsShowcase from '@/components/guest-invitations/BenefitsShowcase';
import SimplifiedJourney from '@/components/guest-invitations/SimplifiedJourney';
import GuestInvitationCard from '@/components/rewards/GuestInvitationCard';

interface InvitationData {
  id: string;
  email: string;
  guest_email?: string;
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
  invitation_code: string;
  guest?: {
    id: string;
    email: string;
    full_name: string;
  };
}

interface RewardStatus {
  guestInvitations: {
    total: number;
    used: number;
    remaining: number;
    pendingCount: number;
    resetAt: string | null;
    firstUsedAt: string | null;
  } | null;
}

export default function GastinbjudningarPage() {
  const [loading, setLoading] = useState(true);
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [rewardStatus, setRewardStatus] = useState<RewardStatus | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invitationsRes, statusRes] = await Promise.all([
        fetch('/api/invitations'),
        fetch('/api/rewards/status')
      ]);

      if (invitationsRes.ok) {
        const invData = await invitationsRes.json();
        setInvitations(invData.invitations || []);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setRewardStatus(statusData.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = async (email: string) => {
    try {
      const response = await fetch('/api/guest/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestEmail: email,
          personalMessage: ''
        })
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const calculateEarnedDays = () => {
    // Calculate days earned from accepted/converted invitations
    // For now, return 0 - this can be enhanced later based on invitation statuses
    return invitations.filter(inv => inv.status === 'accepted').length * 7;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-8 sm:space-y-12">
      {/* Hero Section */}
      <HeroSection
        earnedDays={calculateEarnedDays()}
        onCTAClick={scrollToForm}
        hasInvitations={invitations.length > 0}
      />

      {/* Quick Invite Form */}
      <div ref={formRef}>
        <QuickInviteForm
          onSubmit={handleCreateInvitation}
          remainingQuota={rewardStatus?.guestInvitations?.remaining || 5}
          totalQuota={rewardStatus?.guestInvitations?.total || 5}
          resetAt={rewardStatus?.guestInvitations?.resetAt}
        />
      </div>

      {/* Benefits Showcase */}
      <BenefitsShowcase />

      {/* Simplified Journey */}
      <SimplifiedJourney />

      {/* Detailed Invitation Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GuestInvitationCard
          allowance={{
            base_allowance: rewardStatus?.guestInvitations?.total || 5,
            total_allowance: rewardStatus?.guestInvitations?.total || 5,
            used_invitations: rewardStatus?.guestInvitations?.used || 0,
            remaining_invitations: rewardStatus?.guestInvitations?.remaining || 5,
            resetAt: rewardStatus?.guestInvitations?.resetAt || null,
            firstUsedAt: rewardStatus?.guestInvitations?.firstUsedAt || null
          }}
          invitations={invitations.map(inv => ({
            id: inv.id,
            guest_email: inv.guest_email || '',
            status: inv.status,
            invitation_code: inv.invitation_code,
            created_at: inv.created_at,
            expires_at: inv.expires_at,
            trial_duration_days: 2
          }))}
          onCreateInvitation={handleCreateInvitation}
          onCopyLink={(code) => {
            const url = `${window.location.origin}/invite/${code}`;
            navigator.clipboard.writeText(url);
          }}
          onShareSocial={(code, platform) => {
            const url = `${window.location.origin}/invite/${code}`;
            const text = 'Prova Jobbcoach.ai Premium gratis!';

            if (platform === 'twitter') {
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            } else if (platform === 'facebook') {
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            } else if (platform === 'linkedin') {
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
            }
          }}
        />
      </motion.div>
    </div>
  );
}
