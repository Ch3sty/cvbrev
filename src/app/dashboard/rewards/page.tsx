'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import { useRouter } from 'next/navigation'
import GameifiedRewardsView from '@/components/rewards/GameifiedRewardsView'
import GuestInvitationCard from '@/components/rewards/GuestInvitationCard'
import RewardClaimModal from '@/components/rewards/RewardClaimModal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, Gift, Users } from 'lucide-react'

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
  currentLevel: number
  totalXp: number
  levelTitle: string
  levelDescription: string
  nextLevel: {
    level: number
    title: string
    xpRequired: number
    xpProgress: number
    xpRemaining: number
  } | null
  isPremium: boolean
  availableRewards: any[]
  claimedRewards: any[]
  upcomingRewards: any[]
  guestInvitations: {
    total: number
    used: number
    remaining: number
    pendingCount: number
  } | null
}

export default function RewardsPage() {
  const [loading, setLoading] = useState(true)
  const [rewardStatus, setRewardStatus] = useState<RewardStatus | null>(null)
  const [selectedReward, setSelectedReward] = useState<any>(null)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [invitations, setInvitations] = useState<InvitationData[]>([])
  const supabase = getSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    loadRewardStatus()
    loadInvitations()
  }, [])

  const loadRewardStatus = async () => {
    try {
      const response = await fetch('/api/rewards/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to load rewards')
      }

      const result = await response.json()
      setRewardStatus(result.data)
    } catch (error) {
      console.error('Error loading rewards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClaimReward = (reward: any) => {
    setSelectedReward(reward)
    setShowClaimModal(true)
  }

  const loadInvitations = async () => {
    try {
      const response = await fetch('/api/invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
    }
  };

  const handleClaimSuccess = async () => {
    setShowClaimModal(false)
    setSelectedReward(null)
    await loadRewardStatus() // Reload status
  }

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
        await loadInvitations();
        await loadRewardStatus();
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!rewardStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Kunde inte ladda belöningar</h3>
            <p className="text-gray-600 mb-4">Försök igen senare</p>
            <Button onClick={() => router.push('/dashboard')}>
              Tillbaka till Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            Översikt
          </TabsTrigger>
          {rewardStatus.isPremium && (
            <TabsTrigger value="guests" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gästinbjudningar
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <GameifiedRewardsView
            userLevel={{
              current_level: rewardStatus.currentLevel,
              current_xp: rewardStatus.totalXp,
              title: rewardStatus.levelTitle,
              xp_to_next_level: rewardStatus.nextLevel?.xpRemaining || 0,
              total_xp_for_current_level: rewardStatus.totalXp - (rewardStatus.nextLevel?.xpProgress || 0),
              total_xp_for_next_level: rewardStatus.nextLevel?.xpRequired || 0
            }}
            onClaimReward={(rewardId) => handleClaimReward(rewardStatus.availableRewards.find(r => r.id === rewardId))}
          />

        </TabsContent>

        {/* Milestones tab removed - integrated in main overview */}

        {rewardStatus.isPremium && (
          <TabsContent value="guests" className="space-y-6">
            <GuestInvitationCard
              allowance={{
                base_allowance: 1,
                bonus_allowance: Math.max(0, rewardStatus.guestInvitations!.total - 1),
                total_allowance: rewardStatus.guestInvitations!.total,
                used_invitations: rewardStatus.guestInvitations!.used,
                remaining_invitations: rewardStatus.guestInvitations!.remaining,
                month_year: new Date().toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' })
              }}
              invitations={invitations.map(inv => ({
                id: inv.id,
                invitation_code: inv.invitation_code,
                guest_email: inv.email || inv.guest_email || '',
                guest_name: inv.guest?.full_name,
                status: inv.status,
                trial_duration_days: 7,
                expires_at: inv.expires_at,
                accepted_at: inv.guest ? inv.created_at : undefined,
                converted_to_paid: false,
                created_at: inv.created_at
              }))}
              onCreateInvitation={handleCreateInvitation}
              onCopyLink={(code) => navigator.clipboard.writeText(`${window.location.origin}/invite/${code}`)}
              onShareSocial={(code, platform) => {
                const url = `${window.location.origin}/invite/${code}`;
                const text = 'Prova Jobbcoach.ai Premium gratis i 7 dagar!';
                if (platform === 'twitter') {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
                } else if (platform === 'linkedin') {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
                }
              }}
            />

            {/* Invitation Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Fördelar med gästinbjudningar</CardTitle>
                <CardDescription>
                  Bjud in vänner och kollegor att prova Premium gratis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">7 dagars gratis Premium för din gäst</h4>
                    <p className="text-sm text-gray-600">
                      Din gäst får tillgång till alla Premium-funktioner helt kostnadsfritt
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Gift className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">1 vecka extra när de konverterar</h4>
                    <p className="text-sm text-gray-600">
                      Både du och din gäst får 1 vecka extra Premium när de uppgraderar
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Öka dina inbjudningar med högre level</h4>
                    <p className="text-sm text-gray-600">
                      Level 10+: 2 inbjudningar/månad • Level 20+: 3 inbjudningar/månad
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Claim Modal */}
      {showClaimModal && selectedReward && (
        <RewardClaimModal
          isOpen={showClaimModal}
          reward={selectedReward}
          onClose={() => setShowClaimModal(false)}
          onActivate={async () => {
            await handleClaimSuccess();
          }}
          isActivating={false}
        />
      )}
    </div>
  )
}