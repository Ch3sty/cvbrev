'use client'

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client-manager'
import { useRouter } from 'next/navigation'
import GameifiedRewardsView from '@/components/rewards/GameifiedRewardsView'
import RewardClaimModal from '@/components/rewards/RewardClaimModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Trophy } from 'lucide-react'

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
  const supabase = getSupabaseClient()
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Premium Dynamic Background - Same as dashboard */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.9 }}
      >
        {/* Primary gradient foundation */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-slate-50/50" />

        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-50/20 to-pink-50/30" />

        {/* Animated morphing gradient orbs */}
        <div
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px]"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(147, 51, 234, 0.05) 40%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'float-orb1 25s ease-in-out infinite'
          }}
        />

        <div
          className="absolute top-[30%] right-[10%] w-[600px] h-[600px]"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
            filter: 'blur(80px)',
            animation: 'float-orb2 30s ease-in-out infinite'
          }}
        />

        <div
          className="absolute bottom-[20%] left-[15%] w-[400px] h-[400px]"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.03) 40%, transparent 70%)',
            filter: 'blur(70px)',
            animation: 'float-orb3 20s ease-in-out infinite'
          }}
        />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.015,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-7xl relative z-10">
        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
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
        </div>

        {/* Milestones tab removed - integrated in main overview */}
        {/* Guest invitations moved to separate page: /dashboard/gastinbjudningar */}

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

      {/* CSS Animations for background orbs */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(150px, -100px) scale(1.2); }
          66% { transform: translate(-50px, 50px) scale(0.9); }
        }
        @keyframes float-orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-200px, 150px) scale(0.8); }
          66% { transform: translate(100px, -80px) scale(1.1); }
        }
        @keyframes float-orb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(100px, -80px) scale(1.1); }
        }
      `}} />
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