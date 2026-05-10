'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  Target,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Briefcase,
  GraduationCap,
} from 'lucide-react'

type IconName =
  | 'FileText'
  | 'Target'
  | 'Award'
  | 'TrendingUp'
  | 'CheckCircle'
  | 'AlertCircle'
  | 'Briefcase'
  | 'GraduationCap'

const ICON_MAP = {
  FileText,
  Target,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Briefcase,
  GraduationCap,
}

interface Punkt {
  icon: IconName
  title: string
  description: string
}

interface ViktigtPunkterProps {
  punkter: Punkt[]
}

export default function ViktigtPunkter({ punkter }: ViktigtPunkterProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {punkter.map((p, idx) => {
        const Icon = ICON_MAP[p.icon] || FileText
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            className="bg-white rounded-2xl border border-orange-100 p-5"
            style={{ boxShadow: '0 4px 16px -10px rgba(249, 115, 22, 0.15)' }}
          >
            <span
              className="inline-flex w-10 h-10 rounded-xl items-center justify-center text-white mb-3"
              style={{ background: 'linear-gradient(135deg, #F97316, #DC2626)' }}
            >
              <Icon className="w-5 h-5" strokeWidth={2.5} />
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-2">
              {p.title}
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{p.description}</p>
          </motion.div>
        )
      })}
    </div>
  )
}
