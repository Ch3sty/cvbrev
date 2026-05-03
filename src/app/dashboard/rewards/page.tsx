'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Loader2, Trophy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import RewardsHeroCard from '@/components/rewards/RewardsHeroCard'
import RewardMilestoneCard from '@/components/rewards/RewardMilestoneCard'
import MilestoneTimeline from '@/components/rewards/MilestoneTimeline'
import SavedDiscountsAccordion from '@/components/rewards/SavedDiscountsAccordion'
import RewardClaimModal from '@/components/rewards/RewardClaimModal'
import ActivationModal from '@/components/rewards/ActivationModal'

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
  allMilestones?: any[]
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
  const [showActivationModal, setShowActivationModal] = useState(false)
  const [activationResult, setActivationResult] = useState<any>(null)
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

  const handleClaimReward = (rewardId: string) => {
    const reward = (rewardStatus?.allMilestones || []).find((r: any) => r.id === rewardId)
    if (reward) {
      setSelectedReward(reward)
      setShowClaimModal(true)
    }
  }

  const handleClaimSuccess = async (result: any) => {
    setShowClaimModal(false)
    setSelectedReward(null)

    if (result) {
      setActivationResult(result)
      setShowActivationModal(true)
    }

    await loadRewardStatus()
  }

  // Mappa milestones till kort-format
  const getMilestoneCards = () => {
    if (!rewardStatus?.allMilestones) return []

    return rewardStatus.allMilestones.map((reward: any) => {
      const levelDiff = reward.trigger_value - rewardStatus.currentLevel

      let status: 'claimed' | 'unlocked' | 'upcoming' | 'locked'
      if (reward.is_claimed) status = 'claimed'
      else if (reward.is_unlocked) status = 'unlocked'
      else if (levelDiff <= 3) status = 'upcoming'
      else status = 'locked'

      return {
        id: reward.id,
        level: reward.trigger_value || reward.milestone_level,
        name: reward.name,
        description: reward.description,
        rewardType: reward.reward_type,
        rewardData: reward.reward_data,
        status,
        levelsRemaining: Math.max(0, levelDiff)
      }
    }).sort((a: any, b: any) => a.level - b.level)
  }

  const milestoneCards = getMilestoneCards()
  const unlockedCount = milestoneCards.filter((m: any) => m.status === 'claimed' || m.status === 'unlocked').length
  const hasUnclaimedReward = milestoneCards.some((m: any) => m.status === 'unlocked')

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="text-slate-600">Laddar belöningar...</span>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (!rewardStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md shadow-lg"
        >
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Kunde inte ladda belöningar</h3>
          <p className="text-slate-600 mb-6">Försök igen senare</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till Dashboard
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Subtil orange radial-glow uppe — matchar (public)/auth-DNA */}
      <div
        className="fixed inset-x-0 top-0 h-[50vh] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* Main Content */}
      <div className="container mx-auto py-4 sm:py-6 px-3 sm:px-4 max-w-7xl relative z-10">
        <div className="space-y-4 sm:space-y-6">

          {/* Hero Cards - Level & Stats */}
          <RewardsHeroCard
            currentLevel={rewardStatus.currentLevel}
            levelTitle={rewardStatus.levelTitle}
            totalXp={rewardStatus.totalXp}
            xpToNextLevel={rewardStatus.nextLevel?.xpRemaining || 0}
            totalXpForNextLevel={rewardStatus.nextLevel?.xpRequired || 0}
            unlockedRewards={unlockedCount}
            totalRewards={milestoneCards.length}
            hasUnclaimedReward={hasUnclaimedReward}
          />

          {/* Milestone Timeline (Desktop only) */}
          <MilestoneTimeline
            currentLevel={rewardStatus.currentLevel}
            milestones={milestoneCards.map((m: any) => ({
              level: m.level,
              isClaimed: m.status === 'claimed',
              isUnlocked: m.status === 'unlocked'
            }))}
          />

          {/* Rewards Grid Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Belöningar</h2>
              <p className="text-sm text-slate-500">Lås upp belöningar genom att nå nya nivåer</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {milestoneCards.filter((m: any) => m.status === 'claimed').length} / {milestoneCards.length}
              </span>
              <p className="text-xs text-slate-500">aktiverade</p>
            </div>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {milestoneCards.map((reward: any, index: number) => (
              <RewardMilestoneCard
                key={reward.id}
                id={reward.id}
                level={reward.level}
                name={reward.name}
                description={reward.description}
                rewardType={reward.rewardType}
                rewardData={reward.rewardData}
                status={reward.status}
                levelsRemaining={reward.levelsRemaining}
                onClaim={reward.status === 'unlocked' ? handleClaimReward : undefined}
                index={index}
              />
            ))}
          </div>

          {/* Saved Discounts Accordion */}
          <SavedDiscountsAccordion />

        </div>
      </div>

      {/* Claim Modal */}
      {showClaimModal && selectedReward && (
        <RewardClaimModal
          isOpen={showClaimModal}
          reward={selectedReward}
          onClose={() => setShowClaimModal(false)}
          onActivate={async (result) => {
            await handleClaimSuccess(result)
          }}
          isActivating={false}
        />
      )}

      {/* Activation Result Modal */}
      <ActivationModal
        isOpen={showActivationModal}
        onClose={() => {
          setShowActivationModal(false)
          setActivationResult(null)
        }}
        activationResult={activationResult}
      />

    </div>
  )
}
