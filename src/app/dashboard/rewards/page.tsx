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

            {/* Invitation Benefits - Redesigned for Light Premium Theme */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Guest Benefits Card */}
              <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center border border-pink-200/50">
                      <Users className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">7 dagars gratis test</h4>
                      <p className="text-sm text-gray-600">För din gäst</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Din gäst får full tillgång till alla Premium-funktioner helt kostnadsfritt i en hel vecka
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                      Obegränsade personliga brev
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Premium Rewards Card */}
              <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center border border-purple-200/50">
                      <Gift className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Extra Premium-tid</h4>
                      <p className="text-sm text-gray-600">Vid konvertering</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    När din gäst uppgraderar får ni båda 1 vecka extra Premium som bonus
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                      Automatisk förlängning
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Level Progression Card */}
              <Card className="relative overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-lg transition-all duration-300 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardContent className="relative p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-200/50">
                      <Trophy className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Fler inbjudningar</h4>
                      <p className="text-sm text-gray-600">Högre level</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Få fler månatliga inbjudningar när du når högre levels
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Level 10+: 2/månad • Level 20+: 3/månad
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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

// Lägg till CSS-animationer för extra wow-faktorer
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
    50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 1000px 100%;
    animation: shimmer 2s ease-in-out infinite;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.type = 'text/css'
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
}