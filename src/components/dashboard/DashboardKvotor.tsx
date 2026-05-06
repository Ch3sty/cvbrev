'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Crown, Sparkles } from 'lucide-react'
import {
  IconKvotBrev,
  IconKvotAnalys,
  IconKvotLinkedin,
} from './illustrations/DashboardIcons'

interface DashboardKvotorProps {
  isPremium: boolean
  weeklyLetterCount: number
  weeklyAnalysisCount: number
  weeklyLinkedInCount: number
  letterResetDate?: Date
  premiumUntil?: string | null
  premiumSource?: string | null
}

const FREE_LIMITS = {
  letters: 7,
  analyses: 1,
  linkedin: 1,
}

export default function DashboardKvotor({
  isPremium,
  weeklyLetterCount,
  weeklyAnalysisCount,
  weeklyLinkedInCount,
  letterResetDate,
  premiumUntil,
  premiumSource,
}: DashboardKvotorProps) {
  const isTrialUser =
    premiumSource === 'signup_trial' ||
    premiumSource === 'oauth_signup_trial' ||
    premiumSource === 'onboarding_completion' ||
    premiumSource === 'guest_invitation'
  const daysRemaining = getDaysRemaining(premiumUntil)

  const rows: KvotaRow[] = [
    {
      Icon: IconKvotBrev,
      label: 'Personliga brev',
      used: weeklyLetterCount,
      limit: FREE_LIMITS.letters,
    },
    {
      Icon: IconKvotAnalys,
      label: 'CV-analys',
      used: weeklyAnalysisCount,
      limit: FREE_LIMITS.analyses,
    },
    {
      Icon: IconKvotLinkedin,
      label: 'LinkedIn-optimering',
      used: weeklyLinkedInCount,
      limit: FREE_LIMITS.linkedin,
    },
  ]

  return (
    <motion.aside
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl border border-orange-100 overflow-hidden"
      style={{
        boxShadow: '0 8px 32px -16px rgba(249, 115, 22, 0.18)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 text-white"
        style={{
          background: isPremium
            ? 'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)'
            : 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
        }}
      >
        {isPremium ? (
          <div className="flex items-center gap-2.5">
            <Crown className="w-5 h-5" strokeWidth={2.5} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black">Premium aktivt</div>
              {isTrialUser && daysRemaining !== null ? (
                <div className="text-xs text-white/85">
                  {daysRemaining} {daysRemaining === 1 ? 'dag' : 'dagar'} kvar av provperiod
                </div>
              ) : premiumUntil ? (
                <div className="text-xs text-white/85">
                  Förnyas {formatDate(premiumUntil)}
                </div>
              ) : (
                <div className="text-xs text-white/85">Obegränsad åtkomst</div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 text-orange-900">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
              style={{
                background: 'linear-gradient(135deg, #F97316, #DC2626)',
              }}
            >
              <Sparkles className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black">Din vecka</div>
              {letterResetDate && (
                <div className="text-xs text-orange-800/80">
                  Nollställs {relativeDateLabel(letterResetDate)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-5">
        <ul className="space-y-4">
          {rows.map((row) => (
            <KvotaRowItem key={row.label} row={row} isPremium={isPremium} />
          ))}
        </ul>

        {/* CTA-omrade */}
        {!isPremium && (
          <div className="mt-5 pt-5 border-t border-orange-100">
            <Link
              href="/dashboard/profil/prenumeration"
              className="group flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl text-white font-black text-sm min-h-[48px]"
              style={{
                background:
                  'linear-gradient(135deg, #F97316 0%, #DC2626 50%, #BE185D 100%)',
                boxShadow: '0 8px 24px -10px rgba(220, 38, 38, 0.45)',
              }}
            >
              Lås upp obegränsat
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                strokeWidth={2.5}
              />
            </Link>
            <p className="text-[11px] text-center text-slate-500 mt-2.5 leading-relaxed">
              7 dagar gratis · 149 kr/mån sedan · Avsluta när du vill
            </p>
          </div>
        )}

        {isPremium && isTrialUser && (
          <div className="mt-5 pt-5 border-t border-orange-100">
            <Link
              href="/dashboard/profil/prenumeration"
              className="flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl border border-orange-200 text-orange-700 font-bold text-xs hover:bg-orange-50 transition-colors min-h-[40px]"
            >
              Hantera prenumeration
              <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </Link>
          </div>
        )}
      </div>
    </motion.aside>
  )
}

interface KvotaRow {
  Icon: (props: { className?: string }) => React.JSX.Element
  label: string
  used: number
  limit: number
}

function KvotaRowItem({
  row,
  isPremium,
}: {
  row: KvotaRow
  isPremium: boolean
}) {
  if (isPremium) {
    return (
      <li className="flex items-center gap-3">
        <row.Icon className="w-7 h-7 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900">{row.label}</div>
          <div className="text-xs text-emerald-700 font-bold">Obegränsat</div>
        </div>
        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Check className="w-3.5 h-3.5 text-emerald-700" strokeWidth={3} />
        </div>
      </li>
    )
  }

  const pct =
    row.limit === 0
      ? 0
      : Math.min(100, Math.round((row.used / row.limit) * 100))
  const isFull = row.used >= row.limit

  return (
    <li>
      <div className="flex items-center gap-3 mb-1.5">
        <row.Icon className="w-7 h-7 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900 leading-tight">
            {row.label}
          </div>
        </div>
        <div className="text-sm font-black tabular-nums flex-shrink-0">
          <span className={isFull ? 'text-orange-700' : 'text-slate-900'}>
            {row.used}
          </span>
          <span className="text-slate-400">/{row.limit}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-orange-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: isFull
              ? 'linear-gradient(90deg, #DC2626, #BE185D)'
              : 'linear-gradient(90deg, #F97316, #DC2626)',
          }}
        />
      </div>
    </li>
  )
}

function getDaysRemaining(premiumUntil?: string | null): number | null {
  if (!premiumUntil) return null
  const now = new Date()
  const until = new Date(premiumUntil)
  const diff = until.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  })
}

function relativeDateLabel(date: Date): string {
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'idag'
  if (days === 1) return 'imorgon'
  if (days < 7) return `om ${days} dagar`
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
}
