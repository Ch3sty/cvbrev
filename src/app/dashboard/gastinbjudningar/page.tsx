'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Gift, Crown, Loader2 } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
              Gästinbjudningar
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 truncate">
              Belönas med premium
            </p>
          </div>
        </div>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Bjud in dina vänner och kollegor att testa Jobbcoach.ai Premium. När de accepterar får de 2 dagars gratis premium,
          och när de sedan konverterar till betalande kunder får du 7 dagars premium som tack!
        </p>
      </motion.div>

      {/* Reward Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Guest reward */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white rounded-lg shadow-sm flex-shrink-0">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Gäst får</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                2 dagars gratis Premium vid acceptans
              </p>
            </div>
          </div>

          {/* Inviter reward */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white rounded-lg shadow-sm flex-shrink-0">
              <Crown className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Du får</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                7 dagars Premium när gästen konverterar till betalande
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Guest Invitation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
