'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import RewardsDashboard from '@/components/rewards/RewardsDashboard'
import GuestInvitationCard from '@/components/rewards/GuestInvitationCard'
import MilestoneRewardsTimeline from '@/components/rewards/MilestoneRewardsTimeline'
import RewardClaimModal from '@/components/rewards/RewardClaimModal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trophy, Gift, Users, Crown, Sparkles } from 'lucide-react'

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
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    loadRewardStatus()
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

  const handleClaimSuccess = async () => {
    setShowClaimModal(false)
    setSelectedReward(null)
    await loadRewardStatus() // Reload status
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
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Hero Section */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Belöningar & Förmåner</h1>
              <p className="text-white/90">Level {rewardStatus.currentLevel} - {rewardStatus.levelTitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{rewardStatus.currentLevel}</div>
              <div className="text-sm text-white/80">Nuvarande Level</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{rewardStatus.totalXp.toLocaleString()}</div>
              <div className="text-sm text-white/80">Total XP</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-2xl font-bold">{rewardStatus.availableRewards.length}</div>
              <div className="text-sm text-white/80">Tillgängliga belöningar</div>
            </div>
            {rewardStatus.isPremium && rewardStatus.guestInvitations && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold">{rewardStatus.guestInvitations.remaining}</div>
                <div className="text-sm text-white/80">Gästinbjudningar kvar</div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Översikt
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Milstolpar
          </TabsTrigger>
          {rewardStatus.isPremium && (
            <TabsTrigger value="guests" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gästinbjudningar
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RewardsDashboard
            currentLevel={rewardStatus.currentLevel}
            levelTitle={rewardStatus.levelTitle}
            totalXp={rewardStatus.totalXp}
            nextLevel={rewardStatus.nextLevel}
            availableRewards={rewardStatus.availableRewards}
            claimedRewards={rewardStatus.claimedRewards}
            onClaimReward={handleClaimReward}
          />

          {/* Quick Actions */}
          {rewardStatus.availableRewards.length > 0 && (
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  Snabbåtgärder
                </CardTitle>
                <CardDescription>
                  Du har {rewardStatus.availableRewards.length} belöningar att hämta ut!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {rewardStatus.availableRewards.slice(0, 3).map((reward) => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{reward.icon || '🎁'}</div>
                        <div>
                          <div className="font-semibold">{reward.name}</div>
                          <div className="text-sm text-gray-600">{reward.description}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                        onClick={() => handleClaimReward(reward)}
                      >
                        Hämta ut
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="milestones" className="space-y-6">
          <MilestoneRewardsTimeline
            currentLevel={rewardStatus.currentLevel}
            totalXp={rewardStatus.totalXp}
            onClaimReward={handleClaimReward}
          />
        </TabsContent>

        {rewardStatus.isPremium && (
          <TabsContent value="guests" className="space-y-6">
            <GuestInvitationCard
              allowance={rewardStatus.guestInvitations!}
              isPremium={rewardStatus.isPremium}
              onInvitationSent={loadRewardStatus}
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
          reward={selectedReward}
          onClose={() => setShowClaimModal(false)}
          onSuccess={handleClaimSuccess}
        />
      )}
    </div>
  )
}